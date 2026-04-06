/**
 * GET /api/digiflazz/test-connection
 * Endpoint untuk test apakah koneksi ke Digiflazz API sudah benar.
 * Cara: Panggil endpoint deposit (cek saldo) sebagai indikator koneksi.
 * Alternatif: panggil price-list dengan filter terbatas.
 */

import { NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const DIGIFLAZZ_URL = "https://api.digiflazz.com/v1";

export async function GET() {
  const startTime = Date.now();

  try {
    const username = process.env.DIGIFLAZZ_USERNAME;
    const apiKey = process.env.DIGIFLAZZ_API_KEY;

    if (!username || !apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "DIGIFLAZZ_USERNAME atau DIGIFLAZZ_API_KEY tidak diset di .env",
          env_check: {
            DIGIFLAZZ_USERNAME: !!username,
            DIGIFLAZZ_API_KEY: !!apiKey,
            DIGIFLAZZ_WEBHOOK_SECRET: !!process.env.DIGIFLAZZ_WEBHOOK_SECRET,
          },
        },
        { status: 500 }
      );
    }

    // === Test 1: Cek Saldo (Deposit) ===
    const signDeposit = crypto
      .createHash("md5")
      .update(username + apiKey + "depifo")
      .digest("hex");

    const depositRes = await fetch(`${DIGIFLAZZ_URL}/cek-saldo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cmd: "deposit",
        username,
        sign: signDeposit,
      }),
    });

    const depositJson = await depositRes.json();
    const depositData = depositJson?.data;

    // === Test 2: Ambil sebagian price-list (prepaid) ===
    const signPricelist = crypto
      .createHash("md5")
      .update(username + apiKey + "pricelist")
      .digest("hex");

    const priceRes = await fetch(`${DIGIFLAZZ_URL}/price-list`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cmd: "prepaid",
        username,
        sign: signPricelist,
      }),
    });

    const priceJson = await priceRes.json();
    const priceData = priceJson?.data;

    const elapsed = Date.now() - startTime;

    // Jika deposit endpoint berhasil dan saldo ada
    // Price-list yang berhasil = koneksi & credentials sudah benar
    const isConnected = Array.isArray(priceData) && priceData.length > 0;

    // Tampilkan sebagian produk saja (5 pertama)
    const sampleProducts = Array.isArray(priceData)
      ? priceData.slice(0, 5).map((p: any) => ({
          product_name: p.product_name,
          brand: p.brand,
          category: p.category,
          price: p.price,
          buyer_sku_code: p.buyer_sku_code,
          status: p.buyer_product_status ? "Aktif" : "Nonaktif",
        }))
      : [];

    return NextResponse.json({
      success: isConnected,
      message: isConnected
        ? "✅ Koneksi ke Digiflazz berhasil!"
        : "❌ Koneksi ke Digiflazz gagal",
      connection_details: {
        api_url: DIGIFLAZZ_URL,
        username: username,
        response_time_ms: elapsed,
      },
      deposit_info: isConnected
        ? {
            saldo: depositData.deposit,
          }
        : {
            error: depositData?.message || depositJson?.message || "Unknown error",
            raw: depositData,
          },
      pricelist_info: {
        total_products: Array.isArray(priceData) ? priceData.length : 0,
        sample_products: sampleProducts,
      },
      env_check: {
        DIGIFLAZZ_USERNAME: true,
        DIGIFLAZZ_API_KEY: true,
        DIGIFLAZZ_WEBHOOK_SECRET: !!process.env.DIGIFLAZZ_WEBHOOK_SECRET,
      },
    });
  } catch (error: any) {
    const elapsed = Date.now() - startTime;
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Terjadi kesalahan saat test koneksi",
        response_time_ms: elapsed,
        hint: "Pastikan DIGIFLAZZ_USERNAME dan DIGIFLAZZ_API_KEY sudah benar di .env",
      },
      { status: 500 }
    );
  }
}
