import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { UserRole, UserStatus } from "@prisma/client";

// NOTE:
// Role yang boleh dibuat manual via admin panel (NEW USER) hanya MEMBER/RESELLER.
// Admin 1 akun -> jangan dibuat lewat endpoint ini.
const CREATE_ROLES = ["MEMBER", "RESELLER"] as const;
type CreateRole = (typeof CREATE_ROLES)[number];

const FILTER_ROLES = ["ALL", "MEMBER", "RESELLER", "ADMIN"] as const;
type FilterRole = (typeof FILTER_ROLES)[number];

const FILTER_STATUSES = ["ALL", "ACTIVE", "SUSPENDED"] as const;
type FilterStatus = (typeof FILTER_STATUSES)[number];



export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const q = (searchParams.get("q") || "").trim();
    const role = (searchParams.get("role") || "ALL").trim().toUpperCase();
    const status = ((searchParams.get("status") || "ALL").trim().toUpperCase() as FilterStatus) || "ALL";
    const take = Math.min(Number(searchParams.get("take") || 200), 500);

    const where: any = {};

    if (q) {
      where.OR = [
        { username: { contains: q, mode: "insensitive" } },
        { whatsapp: { contains: q, mode: "insensitive" } },
        { id: { contains: q, mode: "insensitive" } },
      ];
    }

    if (role !== "ALL") where.role = role; // MEMBER/RESELLER/ADMIN
    if (status !== "ALL") where.status = status; // ACTIVE/SUSPENDED

    const rows = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
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
      },
    });

    return NextResponse.json({
      rows: rows.map((u) => ({
        id: u.id,
        username: u.username,
        whatsapp: u.whatsapp,
        role: u.role,
        status: u.status,
        carencoinBalance: u.carencoinBalance,
        pointsBalance: u.pointsBalance,
        resellerJoinedAt: u.resellerJoinedAt ? u.resellerJoinedAt.toISOString() : null,
        createdAt: u.createdAt.toISOString(),
      })),
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Internal error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const username = String(body.username || "").trim();
    const whatsapp = String(body.whatsapp || "").trim();
    const password = String(body.password || "");
    const role = String(body.role || "MEMBER").trim().toUpperCase() as CreateRole;

    if (!username || username.length < 3) {
      return NextResponse.json({ error: "Username minimal 3 karakter" }, { status: 400 });
    }
    if (!whatsapp || whatsapp.length < 8) {
      return NextResponse.json({ error: "WhatsApp wajib diisi" }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
    }
    if (!CREATE_ROLES.includes(role)) {
      return NextResponse.json({ error: "Role tidak valid (hanya MEMBER/RESELLER)" }, { status: 400 });
    }

    // username harus unique
    const exists = await prisma.user.findUnique({ where: { username } });
    if (exists) {
      return NextResponse.json({ error: "Username sudah dipakai" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        username,
        whatsapp,
        passwordHash,
        role,
        status: UserStatus.ACTIVE,
        resellerJoinedAt: role === "RESELLER" ? new Date() : null,
      },
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
      },
    });

    return NextResponse.json({
      ok: true,
      user: {
        ...user,
        resellerJoinedAt: user.resellerJoinedAt ? user.resellerJoinedAt.toISOString() : null,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Gagal membuat user" },
      { status: 500 }
    );
  }
}
