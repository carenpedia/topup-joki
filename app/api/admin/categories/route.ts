export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function toInt(v: unknown, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const q = (searchParams.get("q") || "").trim();
    const active = (searchParams.get("active") || "ALL").trim().toUpperCase();

    const where: any = {};

    if (active === "TRUE") where.isActive = true;
    if (active === "FALSE") where.isActive = false;

    if (q) {
      where.name = { contains: q, mode: "insensitive" };
    }

    const rows = await prisma.category.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        sortOrder: true,
        isActive: true,
        createdAt: true,
        _count: { select: { links: true } },
      },
    });

    const out = rows.map((c) => ({
      id: c.id,
      name: c.name,
      sortOrder: c.sortOrder,
      isActive: c.isActive,
      gameCount: c._count.links,
      createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : null,
    }));

    return NextResponse.json({ rows: out });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Internal error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const name = String(body.name || "").trim();
    const sortOrder = toInt(body.sortOrder, 0);
    const isActive = Boolean(body.isActive ?? true);

    if (!name) {
      return NextResponse.json(
        { error: "Nama kategori wajib diisi" },
        { status: 400 }
      );
    }

    const exists = await prisma.category.findUnique({
      where: { name },
      select: { id: true },
    });

    if (exists) {
      return NextResponse.json(
        { error: "Nama kategori sudah dipakai" },
        { status: 409 }
      );
    }

    const row = await prisma.category.create({
      data: { name, sortOrder, isActive },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: row.id });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Gagal membuat kategori" },
      { status: 500 }
    );
  }
}
