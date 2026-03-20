/**
 * GET /api/digiflazz/pricelist
 * Endpoint internal/admin untuk sinkronisasi harga produk dari Digiflazz
 * 
 * Query params:
 *   ?cmd=prepaid (default) | pasca
 *   ?brand=MOBILE_LEGEND (opsional, filter brand)
 */

export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getPriceList } from "@/lib/digiflazz";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cmd = (searchParams.get("cmd") || "prepaid") as "prepaid" | "pasca";
    const brandFilter = searchParams.get("brand")?.toLowerCase() || "";

    const products = await getPriceList(cmd);

    // Filter berdasarkan brand (opsional)
    const filtered = brandFilter
      ? products.filter((p) => p.brand.toLowerCase().includes(brandFilter))
      : products;

    return NextResponse.json({
      ok: true,
      total: filtered.length,
      data: filtered,
    });
  } catch (error: any) {
    console.error("[Digiflazz Pricelist] Error:", error);
    return NextResponse.json({ error: error?.message || "Gagal ambil pricelist" }, { status: 500 });
  }
}
