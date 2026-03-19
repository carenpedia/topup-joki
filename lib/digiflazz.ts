/**
 * lib/digiflazz.ts
 * Helper untuk integrasi Digiflazz API (Provider Top-up Digital)
 * Docs: https://developer.digiflazz.com/api/
 */

import crypto from "crypto";

const DIGIFLAZZ_URL = "https://api.digiflazz.com/v1";

function getCredentials() {
  const username = process.env.DIGIFLAZZ_USERNAME;
  const apiKey = process.env.DIGIFLAZZ_API_KEY;

  if (!username || !apiKey) {
    throw new Error("DIGIFLAZZ_USERNAME dan DIGIFLAZZ_API_KEY wajib diisi di .env");
  }

  return { username, apiKey };
}

/**
 * Buat signature MD5 sesuai format Digiflazz
 * Formula: md5(username + apiKey + suffix)
 */
function sign(suffix: string): string {
  const { username, apiKey } = getCredentials();
  return crypto.createHash("md5").update(username + apiKey + suffix).digest("hex");
}

// ========================
// PRICE LIST
// ========================

export type DigiflazzProduct = {
  product_name: string;
  category: string;
  brand: string;
  type: string; // "Umum" / "Spesial"
  seller_name: string;
  price: number;
  buyer_sku_code: string;
  buyer_product_status: boolean;
  seller_product_status: boolean;
  unlimited_stock: boolean;
  stock: number;
  multi: boolean;
  start_cut_off: string;
  end_cut_off: string;
  desc: string;
};

/**
 * Ambil daftar harga produk prepaid dari Digiflazz
 * sign = md5(username + apiKey + "pricelist")
 */
export async function getPriceList(cmd: "prepaid" | "pasca" = "prepaid"): Promise<DigiflazzProduct[]> {
  const { username } = getCredentials();

  const body = {
    cmd,
    username,
    sign: sign("pricelist"),
  };

  const res = await fetch(`${DIGIFLAZZ_URL}/price-list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await res.json();

  if (!res.ok || json?.data?.rc) {
    const msg = json?.data?.message || json?.message || "Gagal ambil price-list";
    throw new Error(`Digiflazz price-list error: ${msg}`);
  }

  return json?.data || [];
}

// ========================
// TOPUP TRANSACTION
// ========================

export type DigiflazzTopupResult = {
  ref_id: string;
  customer_no: string;
  buyer_sku_code: string;
  message: string;
  status: string; // "Sukses" | "Pending" | "Gagal"
  rc: string;     // response code: "00" = sukses
  sn: string;     // serial number (kalau ada)
  buyer_last_saldo: number;
  price: number;
};

/**
 * Kirim perintah top-up ke Digiflazz
 * sign = md5(username + apiKey + ref_id)
 * 
 * @param refId     - ID unik referensi transaksi (orderNo dari DB kita)
 * @param skuCode   - buyer_sku_code produk Digiflazz
 * @param customerNo - nomor tujuan / user ID game 
 */
export async function topup(
  refId: string,
  skuCode: string,
  customerNo: string
): Promise<DigiflazzTopupResult> {
  const { username } = getCredentials();

  const body = {
    username,
    buyer_sku_code: skuCode,
    customer_no: customerNo,
    ref_id: refId,
    sign: sign(refId),
  };

  const res = await fetch(`${DIGIFLAZZ_URL}/transaction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  const data = json?.data;

  if (!data) {
    throw new Error("Digiflazz: response kosong");
  }

  return {
    ref_id: data.ref_id,
    customer_no: data.customer_no,
    buyer_sku_code: data.buyer_sku_code,
    message: data.message || "",
    status: data.status || "Gagal",
    rc: data.rc || "",
    sn: data.sn || "",
    buyer_last_saldo: data.buyer_last_saldo || 0,
    price: data.price || 0,
  };
}

// ========================
// CHECK STATUS
// ========================

/**
 * Cek status transaksi di Digiflazz
 * sign = md5(username + apiKey + ref_id)
 */
export async function checkStatus(refId: string): Promise<DigiflazzTopupResult> {
  const { username } = getCredentials();

  const body = {
    username,
    buyer_sku_code: "", // bisa kosong untuk check status
    customer_no: "",
    ref_id: refId,
    sign: sign(refId),
    commands: "check-status",
  };

  const res = await fetch(`${DIGIFLAZZ_URL}/transaction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  const data = json?.data;

  if (!data) {
    throw new Error("Digiflazz checkStatus: response kosong");
  }

  return {
    ref_id: data.ref_id,
    customer_no: data.customer_no,
    buyer_sku_code: data.buyer_sku_code,
    message: data.message || "",
    status: data.status || "Gagal",
    rc: data.rc || "",
    sn: data.sn || "",
    buyer_last_saldo: data.buyer_last_saldo || 0,
    price: data.price || 0,
  };
}
