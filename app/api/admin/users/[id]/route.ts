import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string } };

const ALLOWED_ROLES = ["MEMBER", "RESELLER"] as const; // admin tidak boleh diubah dari sini
const ALLOWED_STATUSES = ["ACTIVE", "SUSPENDED"] as const;

export async function GET(_req: Request, { params }: Params) {
  try {
    const row = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        username: true,
        whatsapp: true,
        role: true,
        status: true,
        carencoinBalance: true,
        pointsBalance: true,
        resellerJoinedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!row) return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });

    return NextResponse.json({
      row: {
        ...row,
        resellerJoinedAt: row.resellerJoinedAt ? row.resellerJoinedAt.toISOString() : null,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}

// PATCH: update role/status/resellerJoinedAt (opsional)
export async function PATCH(req: Request, { params }: Params) {
  try {
    const body = await req.json();

    const nextRole = body.role ? String(body.role).toUpperCase() : null;
    const nextStatus = body.status ? String(body.status).toUpperCase() : null;

    if (nextRole && !ALLOWED_ROLES.includes(nextRole as any)) {
      return NextResponse.json({ error: "Role tidak valid" }, { status: 400 });
    }
    if (nextStatus && !ALLOWED_STATUSES.includes(nextStatus as any)) {
      return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
    }

    const current = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, role: true },
    });
    if (!current) return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });

    // Admin 1 akun: jangan bisa diubah melalui panel ini
    if (current.role === "ADMIN") {
      return NextResponse.json({ error: "Akun ADMIN tidak bisa diubah dari sini" }, { status: 403 });
    }

    const data: any = {};
    if (nextRole) {
      data.role = nextRole;
      data.resellerJoinedAt = nextRole === "RESELLER" ? new Date() : null;
    }
    if (nextStatus) data.status = nextStatus;

    const row = await prisma.user.update({
      where: { id: params.id },
      data,
      select: {
        id: true,
        username: true,
        whatsapp: true,
        role: true,
        status: true,
        carencoinBalance: true,
        pointsBalance: true,
        resellerJoinedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      ok: true,
      row: {
        ...row,
        resellerJoinedAt: row.resellerJoinedAt ? row.resellerJoinedAt.toISOString() : null,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Gagal update user" }, { status: 500 });
  }
}

// DELETE: hard delete (sesuai definisi kamu)
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const current = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, role: true },
    });
    if (!current) return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });

    if (current.role === "ADMIN") {
      return NextResponse.json({ error: "Akun ADMIN tidak bisa dihapus dari sini" }, { status: 403 });
    }

    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Gagal hapus user" }, { status: 500 });
  }
}
