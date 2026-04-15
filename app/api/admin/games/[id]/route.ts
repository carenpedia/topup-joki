export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET(_: Request, ctx: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const item = await prisma.game.findUnique({ where: { id: ctx.params.id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ item });
}

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const body = await req.json();

  const name = body.name != null ? String(body.name).trim() : undefined;
  const logoUrl =
    body.logoUrl === null ? null : body.logoUrl != null ? String(body.logoUrl).trim() : undefined;

  const updated = await prisma.game.update({
    where: { id: ctx.params.id },
    data: {
      name,
      logoUrl,
      isActive: body.isActive ?? undefined,
      hasJoki: body.hasJoki ?? undefined,
      isPopuler: body.isPopuler ?? undefined,
      targetType: body.targetType != null ? String(body.targetType) : undefined,
    },
  });

  await prisma.adminAuditLog.create({
    data: {
      actorId: guard.session.userId,
      action: "UPDATE",
      entityType: "GAME",
      entityId: updated.id,
      message: `Update game ${updated.key}`,
    },
  });

  return NextResponse.json({ updated });
}

export async function DELETE(_: Request, ctx: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  // Catatan: Game punya relasi ke Order/Product/GameCategory.
  // Prisma akan error kalau masih ada foreign key terkait (onDelete SetNull / Cascade tergantung relasi).
  // Untuk aman, admin biasanya "deactivate" bukan delete. Tapi kita tetap sediakan delete.
  const deleted = await prisma.game.delete({ where: { id: ctx.params.id } });

  await prisma.adminAuditLog.create({
    data: {
      actorId: guard.session.userId,
      action: "DELETE",
      entityType: "GAME",
      entityId: deleted.id,
      message: `Delete game ${deleted.key}`,
    },
  });

  return NextResponse.json({ deleted });
}
