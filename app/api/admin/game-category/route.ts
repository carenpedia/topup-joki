export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { gameId, categoryId, enabled } = body as {
    gameId: string;
    categoryId: string;
    enabled: boolean;
  };

  if (!gameId || !categoryId) {
    return NextResponse.json({ error: "gameId & categoryId wajib" }, { status: 400 });
  }

  if (enabled) {
    await prisma.gameCategory.upsert({
      where: { gameId_categoryId: { gameId, categoryId } },
      update: {},
      create: { gameId, categoryId },
    });
  } else {
    await prisma.gameCategory.deleteMany({
      where: { gameId, categoryId },
    });
  }

  return NextResponse.json({ ok: true });
}
