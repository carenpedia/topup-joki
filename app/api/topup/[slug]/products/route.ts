export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
 
// kalau kamu belum punya helper ini, lihat catatan di bawah.

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  try {
    const game = await prisma.game.findUnique({
      where: { key: params.slug },
      select: { id: true, key: true, name: true },
    });

    if (!game) {
      return NextResponse.json({ error: "Game tidak ditemukan" }, { status: 404 });
    }

    const { searchParams } = new URL(_req.url);
    const type = searchParams.get("type") || "TOPUP";
    const audience = "PUBLIC" as const;

    // ambil product + harga sesuai audience + flash sale aktif (jika ada)
    const products = await prisma.product.findMany({
      where: { gameId: game.id, isActive: true, type: type as any },
      orderBy: [
        { productCategory: { order: "asc" } },
        { group: "asc" },
        { name: "asc" }
      ],
      select: {
        id: true,
        name: true,
        group: true,
        productCategory: {
          select: { id: true, name: true, order: true }
        },
        prices: {
          where: { audience },
          select: { price: true },
          take: 1,
        },
        flashSales: {
          where: {
            isActive: true,
            startAt: { lte: new Date() },
            endAt: { gte: new Date() },
          },
          orderBy: { endAt: "asc" },
          select: { id: true, flashPrice: true, endAt: true },
          take: 1,
        },
      },
    });

    const rows = products.map((p) => {
      const basePrice = Number(p.prices?.[0]?.price || 0);
      const flash = p.flashSales?.[0] || null;
      const finalPrice = flash ? Number(flash.flashPrice || 0) : basePrice;

      return {
        id: p.id,
        name: p.name,
        group: p.group,
        category: p.productCategory,
        basePrice,
        finalPrice,
        flash: flash
          ? { id: flash.id, flashPrice: Number(flash.flashPrice || 0), endAt: flash.endAt }
          : null,
      };
    });

    return NextResponse.json({ ok: true, game, audience, rows });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}