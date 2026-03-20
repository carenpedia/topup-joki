export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET(_: Request, ctx: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const item = await prisma.voucher.findUnique({ where: { id: ctx.params.id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ item });
}

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const body = await req.json();

  const updated = await prisma.voucher.update({
    where: { id: ctx.params.id },
    data: {
      target: body.target ?? undefined,
      discountType: body.discountType ?? undefined,
      discountValue: body.discountValue ?? undefined,
      minPurchase: body.minPurchase ?? undefined,
      maxDiscount: body.maxDiscount ?? undefined,
      quotaTotal: body.quotaTotal ?? undefined,
      startAt: body.startAt === null ? null : body.startAt ? new Date(body.startAt) : undefined,
      endAt: body.endAt === null ? null : body.endAt ? new Date(body.endAt) : undefined,
      isActive: body.isActive ?? undefined,
    },
  });

  await prisma.adminAuditLog.create({
    data: {
      actorId: guard.session.userId,
      action: "UPDATE",
      entityType: "VOUCHER",
      entityId: updated.id,
      message: `Update voucher ${updated.code}`,
    },
  });

  return NextResponse.json({ updated });
}

export async function DELETE(_: Request, ctx: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const deleted = await prisma.voucher.delete({ where: { id: ctx.params.id } });

  await prisma.adminAuditLog.create({
    data: {
      actorId: guard.session.userId,
      action: "DELETE",
      entityType: "VOUCHER",
      entityId: deleted.id,
      message: `Delete voucher ${deleted.code}`,
    },
  });

  return NextResponse.json({ deleted });
}
