import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  await requireAdmin();
  const row = await prisma.promoBanner.findUnique({ where: { id: params.id } });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, row });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await requireAdmin();

  const body = await req.json();
  const data: any = {};

  if (body.title !== undefined) data.title = (body.title || "").trim() || null;
  if (body.imageUrl !== undefined) data.imageUrl = (body.imageUrl || "").trim();
  if (body.linkType !== undefined) data.linkType = (body.linkType || "").trim();
  if (body.linkValue !== undefined) data.linkValue = (body.linkValue || "").trim();
  if (body.sortOrder !== undefined) data.sortOrder = Number(body.sortOrder) || 0;
  if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

  if (data.imageUrl !== undefined && !data.imageUrl) {
    return NextResponse.json({ error: "imageUrl wajib" }, { status: 400 });
  }
  if (data.linkType !== undefined && !data.linkType) {
    return NextResponse.json({ error: "linkType wajib" }, { status: 400 });
  }
  if (data.linkValue !== undefined && !data.linkValue) {
    return NextResponse.json({ error: "linkValue wajib" }, { status: 400 });
  }

  const row = await prisma.promoBanner.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json({ ok: true, row });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await requireAdmin();
  await prisma.promoBanner.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
