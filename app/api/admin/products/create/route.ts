export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const {
    gameId,
    name,
    group,
    provider,
    providerSku,
    pricePublic,
    priceMember,
    priceReseller,
  } = body as any;

  if (!gameId || !name || !group || !provider || !providerSku) {
    return NextResponse.json({ error: "Field wajib belum lengkap" }, { status: 400 });
  }

  const p = await prisma.product.create({
    data: {
      gameId,
      name,
      group,
      provider,
      providerSku,
      isActive: true,
      prices: {
        create: [
          { audience: "PUBLIC", price: Number(pricePublic) || 0 },
          { audience: "MEMBER", price: Number(priceMember) || 0 },
          { audience: "RESELLER", price: Number(priceReseller) || 0 },
        ],
      },
    },
    include: { prices: true },
  });

  return NextResponse.json({ product: p });
}
