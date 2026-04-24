import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        game: { select: { name: true } },
        prices: true
      },
      orderBy: [
        { game: { name: 'asc' } },
        { name: 'asc' }
      ]
    });

    const rows = products.map(p => {
      const publicPrice = p.prices.find(pr => pr.audience === "PUBLIC")?.price || 0;
      const resellerPrice = p.prices.find(pr => pr.audience === "RESELLER")?.price || 0;
      
      return {
        id: p.id,
        game: p.game.name,
        product: p.name,
        public: publicPrice,
        reseller: resellerPrice
      };
    });

    return NextResponse.json({ rows });
  } catch (error) {
    console.error("Pricelist Error:", error);
    return NextResponse.json({ error: "Failed to load pricelist" }, { status: 500 });
  }
}
