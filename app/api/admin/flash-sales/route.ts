export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function toInt(v: any, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim().toLowerCase();
    const bucket = (searchParams.get("bucket") || "ALL").trim().toUpperCase(); // ALL | ACTIVE | UPCOMING | EXPIRED
    const take = Math.min(toInt(searchParams.get("take"), 200), 500);

    const now = new Date();

    const where: any = {};

    if (bucket === "ACTIVE") {
      where.isActive = true;
      where.startAt = { lte: now };
      where.endAt = { gte: now };
    } else if (bucket === "UPCOMING") {
      where.isActive = true;
      where.startAt = { gt: now };
    } else if (bucket === "EXPIRED") {
      where.OR = [{ isActive: false }, { endAt: { lt: now } }];
    }

    if (q) {
      // search by product/game name
      where.OR = [
        { product: { name: { contains: q, mode: "insensitive" } } },
        { product: { game: { name: { contains: q, mode: "insensitive" } } } },
        { product: { game: { key: { contains: q, mode: "insensitive" } } } },
      ];
    }

    const rows = await prisma.flashSale.findMany({
      where,
      orderBy: [{ isActive: "desc" }, { startAt: "desc" }],
      take,
      select: {
        id: true,
        productId: true,
        flashPrice: true,
        startAt: true,
        endAt: true,
        isActive: true,
        maxStock: true,
        soldCount: true,
        imageType: true,
        createdAt: true,
        product: {
          select: {
            name: true,
            game: { select: { name: true, key: true } },
          },
        },
      },
    });

    const out = rows.map((r) => ({
      id: r.id,
      productId: r.productId,
      game: r.product?.game?.name || r.product?.game?.key || "-",
      product: r.product?.name || "-",
      flashPrice: r.flashPrice,
      startAt: r.startAt?.toISOString(),
      endAt: r.endAt?.toISOString(),
      isActive: r.isActive,
      maxStock: r.maxStock,
      soldCount: r.soldCount,
      imageType: r.imageType,
      createdAt: r.createdAt?.toISOString(),
      // computed status
      status:
        !r.isActive ? "INACTIVE"
        : (r.maxStock !== null && r.soldCount >= r.maxStock) ? "EXHAUSTED"
        : r.startAt > now ? "UPCOMING"
        : r.endAt < now ? "EXPIRED"
        : "ACTIVE",
    }));

    return NextResponse.json({ rows: out });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const productId = String(body.productId || "").trim();
    const flashPrice = toInt(body.flashPrice, 0);
    const startAtRaw = String(body.startAt || "").trim();
    const endAtRaw = String(body.endAt || "").trim();
    const isActive = Boolean(body.isActive ?? true);
    const maxStock = body.maxStock && toInt(body.maxStock, 0) > 0 ? toInt(body.maxStock, 0) : null;
    const imageType = body.imageType === "GAME" ? "GAME" : "PRODUCT";

    if (!productId) {
      return NextResponse.json({ error: "Product wajib dipilih" }, { status: 400 });
    }
    if (!flashPrice || flashPrice < 1) {
      return NextResponse.json({ error: "Flash price harus > 0" }, { status: 400 });
    }
    if (!startAtRaw || !endAtRaw) {
      return NextResponse.json({ error: "Start/End wajib diisi" }, { status: 400 });
    }

    const startAt = new Date(startAtRaw);
    const endAt = new Date(endAtRaw);
    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
      return NextResponse.json({ error: "Format tanggal tidak valid" }, { status: 400 });
    }
    if (endAt <= startAt) {
      return NextResponse.json({ error: "End harus lebih besar dari Start" }, { status: 400 });
    }

    // pastikan product ada
    const p = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, isActive: true },
    });
    if (!p) return NextResponse.json({ error: "Product tidak ditemukan" }, { status: 404 });
    if (!p.isActive) return NextResponse.json({ error: "Product tidak aktif" }, { status: 409 });

    const row = await prisma.flashSale.create({
      data: {
        productId,
        flashPrice,
        startAt,
        endAt,
        isActive,
        maxStock,
        imageType,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: row.id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Gagal membuat flash sale" }, { status: 500 });
  }
}