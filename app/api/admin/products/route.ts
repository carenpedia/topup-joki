import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const gameId = searchParams.get("gameId") ?? "";
  const group = searchParams.get("group") ?? ""; // BEST_SELLER | HEMAT | SULTAN
  const active = searchParams.get("active"); // "1" | "0" | ""

  const items = await prisma.product.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { providerSku: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(gameId ? { gameId } : {}),
      ...(group ? { group: group as any } : {}),
      ...(active === "1" ? { isActive: true } : {}),
      ...(active === "0" ? { isActive: false } : {}),
    },
    include: {
      game: true,
      prices: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 400,
  });

  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const body = await req.json();

  const gameId = String(body.gameId ?? "").trim();
  const name = String(body.name ?? "").trim();
  const group = body.group; // enum
  const provider = body.provider; // enum
  const providerSku = String(body.providerSku ?? "").trim();

  if (!gameId) return NextResponse.json({ error: "gameId wajib" }, { status: 400 });
  if (!name) return NextResponse.json({ error: "name wajib" }, { status: 400 });
  if (!group) return NextResponse.json({ error: "group wajib" }, { status: 400 });
  if (!provider) return NextResponse.json({ error: "provider wajib" }, { status: 400 });
  if (!providerSku) return NextResponse.json({ error: "providerSku wajib" }, { status: 400 });

  const prices = body.prices ?? {}; // { PUBLIC: number, MEMBER: number, RESELLER: number }
  const priceRows: { audience: "PUBLIC" | "MEMBER" | "RESELLER"; price: number }[] = [];

  (["PUBLIC", "MEMBER", "RESELLER"] as const).forEach((a) => {
    const v = prices[a];
    if (typeof v === "number" && Number.isFinite(v) && v > 0) priceRows.push({ audience: a, price: v });
  });

  if (priceRows.length === 0) {
    return NextResponse.json({ error: "Minimal isi 1 harga (PUBLIC/MEMBER/RESELLER)" }, { status: 400 });
  }

  const created = await prisma.$transaction(async (tx) => {
    const p = await tx.product.create({
      data: {
        gameId,
        name,
        group,
        provider,
        providerSku,
        isActive: Boolean(body.isActive ?? true),
        minPayable: body.minPayable == null || body.minPayable === "" ? null : Number(body.minPayable),
      },
    });

    await tx.productPrice.createMany({
      data: priceRows.map((r) => ({ productId: p.id, audience: r.audience, price: r.price })),
    });

    await tx.adminAuditLog.create({
      data: {
        actorId: guard.session.userId,
        action: "CREATE",
        entityType: "PRODUCT",
        entityId: p.id,
        message: `Create product ${p.name}`,
      },
    });

    return p;
  });

  return NextResponse.json({ created });
}
