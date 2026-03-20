export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim().toUpperCase();
  const target = searchParams.get("target"); // PUBLIC|MEMBER|RESELLER
  const active = searchParams.get("active"); // "1"|"0"

  const items = await prisma.voucher.findMany({
    where: {
      ...(q ? { code: { contains: q, mode: "insensitive" } } : {}),
      ...(target ? { target: target as any } : {}),
      ...(active === "1" ? { isActive: true } : {}),
      ...(active === "0" ? { isActive: false } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const body = await req.json();
  const code = String(body.code ?? "").trim().toUpperCase();
  if (!code) return NextResponse.json({ error: "code wajib" }, { status: 400 });

  const created = await prisma.voucher.create({
    data: {
      code,
      target: body.target ?? "PUBLIC",
      discountType: body.discountType ?? "PERCENT",
      discountValue: Number(body.discountValue ?? 0),
      minPurchase: Number(body.minPurchase ?? 0),
      maxDiscount: body.maxDiscount ?? null,
      quotaTotal: body.quotaTotal ?? null,
      startAt: body.startAt ? new Date(body.startAt) : null,
      endAt: body.endAt ? new Date(body.endAt) : null,
      isActive: Boolean(body.isActive ?? true),
    },
  });

  await prisma.adminAuditLog.create({
    data: {
      actorId: guard.session.userId,
      action: "CREATE",
      entityType: "VOUCHER",
      entityId: created.id,
      message: `Create voucher ${created.code}`,
    },
  });

  return NextResponse.json({ created });
}
