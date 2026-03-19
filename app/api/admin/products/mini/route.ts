import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const gameId = (searchParams.get("gameId") || "").trim();
    const q = (searchParams.get("q") || "").trim();

    if (!gameId) {
      return NextResponse.json({ rows: [] });
    }

    const rows = await prisma.product.findMany({
      where: {
        gameId,
        isActive: true,
        ...(q
          ? { name: { contains: q, mode: "insensitive" } }
          : {}),
      },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
      take: 500,
    });

    return NextResponse.json({ rows });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Internal error" },
      { status: 500 }
    );
  }
}