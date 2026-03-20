export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET(req: Request) {
  await requireAdmin();

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const active = searchParams.get("active"); // "1" | "0" | null

  const where: any = {};
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { linkValue: { contains: q, mode: "insensitive" } },
      { linkType: { contains: q, mode: "insensitive" } },
    ];
  }
  if (active === "1") where.isActive = true;
  if (active === "0") where.isActive = false;

  const rows = await prisma.promoBanner.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ ok: true, rows });
}

export async function POST(req: Request) {
  await requireAdmin();

  const body = await req.json();
  const title = (body.title || "").trim() || null;
  const imageUrl = (body.imageUrl || "").trim();
  const linkType = (body.linkType || "").trim();
  const linkValue = (body.linkValue || "").trim();
  const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0;
  const isActive = Boolean(body.isActive ?? true);

  if (!imageUrl) return NextResponse.json({ error: "imageUrl wajib" }, { status: 400 });
  if (!linkType) return NextResponse.json({ error: "linkType wajib" }, { status: 400 });
  if (!linkValue) return NextResponse.json({ error: "linkValue wajib" }, { status: 400 });

  const row = await prisma.promoBanner.create({
    data: { title, imageUrl, linkType, linkValue, sortOrder, isActive },
  });

  return NextResponse.json({ ok: true, row });
}
