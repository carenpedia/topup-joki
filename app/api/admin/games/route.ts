export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const active = searchParams.get("active"); // "1" | "0" | ""

  const items = await prisma.game.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { key: { contains: q, mode: "insensitive" } },
              { name: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(active === "1" ? { isActive: true } : {}),
      ...(active === "0" ? { isActive: false } : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: 300,
  });

  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const body = await req.json();
  const key = String(body.key ?? "").trim();
  const name = String(body.name ?? "").trim();

  if (!key) return NextResponse.json({ error: "key wajib" }, { status: 400 });
  if (!name) return NextResponse.json({ error: "name wajib" }, { status: 400 });

  // validasi ringan: slug-like
  if (!/^[a-z0-9-]{3,}$/.test(key)) {
    return NextResponse.json(
      { error: "Key harus slug: huruf kecil/angka/dash, minimal 3 karakter. Contoh: mobile-legends" },
      { status: 400 }
    );
  }

  const created = await prisma.game.create({
    data: {
      key,
      name,
      logoUrl: body.logoUrl ? String(body.logoUrl).trim() : null,
      isActive: Boolean(body.isActive ?? true),
      hasJoki: Boolean(body.hasJoki ?? false),
      isPopuler: Boolean(body.isPopuler ?? false),
      targetType: body.targetType ? String(body.targetType) : "DEFAULT",
    },
  });

  await prisma.adminAuditLog.create({
    data: {
      actorId: guard.session.userId,
      action: "CREATE",
      entityType: "GAME",
      entityId: created.id,
      message: `Create game ${created.key}`,
    },
  });

  return NextResponse.json({ created });
}
