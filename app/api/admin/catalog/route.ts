export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const [games, categories, links] = await Promise.all([
    prisma.game.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.gameCategory.findMany(),
  ]);

  return NextResponse.json({ games, categories, links });
}
