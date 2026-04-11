export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get("gameId");
    const type = searchParams.get("type");

    if (!gameId) {
      return NextResponse.json({ error: "gameId is required" }, { status: 400 });
    }

    const where: any = { gameId };
    if (type) where.type = type;

    const rows = await prisma.productCategory.findMany({
      where,
      orderBy: { order: "asc" },
      include: {
        _count: { select: { products: true } }
      }
    });

    return NextResponse.json({ items: rows });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name, gameId, order, type } = body;

    if (!name || !gameId) {
      return NextResponse.json({ error: "name and gameId are required" }, { status: 400 });
    }

    const row = await prisma.productCategory.create({
      data: {
        name: String(name),
        gameId: String(gameId),
        type: type || "TOPUP",
        order: Number(order || 0),
      }
    });

    return NextResponse.json({ ok: true, item: row });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
