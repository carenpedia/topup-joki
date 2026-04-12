export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET(_: Request, ctx: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const item = await prisma.product.findUnique({
    where: { id: ctx.params.id },
    include: { game: true, prices: true },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ item });
}

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const body = await req.json();

  const prices = body.prices ?? null; // optional: { PUBLIC, MEMBER, RESELLER }

  const updated = await prisma.$transaction(async (tx) => {
    const p = await tx.product.update({
      where: { id: ctx.params.id },
      data: {
        gameId: body.gameId ?? undefined,
        name: body.name != null ? String(body.name).trim() : undefined,
        group: body.group ?? undefined,
        provider: body.provider ?? undefined,
        providerSku: body.providerSku != null ? String(body.providerSku).trim() : undefined,
        type: body.type ?? undefined,
        imageUrl:
          body.imageUrl === null
            ? null
            : body.imageUrl !== undefined
            ? String(body.imageUrl).trim() || null
            : undefined,
        productCategoryId:
          body.productCategoryId === null
            ? null
            : body.productCategoryId !== undefined
            ? String(body.productCategoryId)
            : undefined,
        isActive: body.isActive ?? undefined,
        minPayable:
          body.minPayable === null
            ? null
            : body.minPayable != null
            ? Number(body.minPayable)
            : undefined,
      },
    });

    if (prices) {
      for (const audience of ["PUBLIC", "MEMBER", "RESELLER"] as const) {
        const v = prices[audience];

        // kalau null => hapus harga audience tersebut (opsional)
        if (v === null) {
          await tx.productPrice.deleteMany({ where: { productId: p.id, audience } });
          continue;
        }

        if (typeof v === "number" && Number.isFinite(v) && v > 0) {
          await tx.productPrice.upsert({
            where: { productId_audience: { productId: p.id, audience } },
            update: { price: v },
            create: { productId: p.id, audience, price: v },
          });
        }
      }
    }

    await tx.adminAuditLog.create({
      data: {
        actorId: guard.session.userId,
        action: "UPDATE",
        entityType: "PRODUCT",
        entityId: p.id,
        message: `Update product ${p.name}`,
      },
    });

    return p;
  });

  return NextResponse.json({ updated });
}

export async function DELETE(_: Request, ctx: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  // saran: OFF saja kalau sudah terpakai order
  const deleted = await prisma.product.delete({ where: { id: ctx.params.id } });

  await prisma.adminAuditLog.create({
    data: {
      actorId: guard.session.userId,
      action: "DELETE",
      entityType: "PRODUCT",
      entityId: deleted.id,
      message: `Delete product ${deleted.name}`,
    },
  });

  return NextResponse.json({ deleted });
}
