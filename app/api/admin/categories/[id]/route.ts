export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function toInt(v: unknown, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const row = await prisma.category.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        sortOrder: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { links: true } },
      },
    });

    if (!row) {
      return NextResponse.json(
        { error: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      row: {
        ...row,
        gameCount: row._count.links,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Internal error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    // Cek duplikat nama (kecuali diri sendiri)
    const exists = await prisma.category.findFirst({
      where: {
        name,
        NOT: { id: params.id },
      },
      select: { id: true },
    });

    if (exists) {
      return NextResponse.json(
        { error: "Nama kategori sudah dipakai" },
        { status: 409 }
      );
    }

    const row = await prisma.category.update({
      where: { id: params.id },
      data: { name, sortOrder, isActive },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, row });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Gagal update kategori" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.category.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Gagal hapus kategori" },
      { status: 500 }
    );
  }
}
