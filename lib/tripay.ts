/**
 * lib/tripay.ts
 * Helper untuk integrasi Tripay Payment Gateway
 * Docs: https://tripay.co.id/developer
 */

import crypto from "crypto";

function getConfig() {
  const apiKey = process.env.TRIPAY_API_KEY;
  const privateKey = process.env.TRIPAY_PRIVATE_KEY;
  const merchantCode = process.env.TRIPAY_MERCHANT_CODE;
  const apiUrl = process.env.TRIPAY_API_URL || "https://tripay.co.id/api-sandbox";

  if (!apiKey || !privateKey || !merchantCode) {
    throw new Error("TRIPAY_API_KEY, TRIPAY_PRIVATE_KEY, dan TRIPAY_MERCHANT_CODE wajib diisi di .env");
  }

  return { apiKey, privateKey, merchantCode, apiUrl };
}

// ========================
// PAYMENT CHANNELS
// ========================

export type TripayChannel = {
  group: string;
  code: string;
  name: string;
  type: string;
  fee_merchant: { flat: number; percent: number };
  fee_customer: { flat: number; percent: number };
  total_fee: { flat: number; percent: number };
  minimum_fee: number | null;
  maximum_fee: number | null;
  icon_url: string;
  active: boolean;
};

/**
 * Ambil daftar metode pembayaran (payment channels) yang aktif
 */
export async function getPaymentChannels(): Promise<TripayChannel[]> {
  const { apiKey, apiUrl } = getConfig();

  const res = await fetch(`${apiUrl}/merchant/payment-channel`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  const json = await res.json();

  if (!json.success) {
    throw new Error(`Tripay getChannels: ${json.message || "Gagal"}`);
  }

  return json.data || [];
}

// ========================
// FEE CALCULATOR
// ========================

/**
 * Hitung fee untuk metode pembayaran tertentu
 */
export async function calculateFee(code: string, amount: number) {
  const { apiKey, apiUrl } = getConfig();

  const params = new URLSearchParams({ code, amount: String(amount) });
  const res = await fetch(`${apiUrl}/merchant/fee-calculator?${params}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  const json = await res.json();
  if (!json.success) {
    throw new Error(`Tripay feeCalc: ${json.message || "Gagal"}`);
  }

  return json.data;
}

// ========================
// CREATE TRANSACTION (Closed Payment)
// ========================

export type TripayCreateParams = {
  method: string;          // payment channel code, e.g. "QRIS", "BRIVA"
  merchantRef: string;     // orderNo kita
  amount: number;          // total yang harus dibayar (termasuk fee)
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderItems: {
    sku?: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  expiredTime?: number;    // unix timestamp (opsional, default 24h)
};

export type TripayTransaction = {
  reference: string;       // tripay reference number
  merchant_ref: string;
  payment_selection_type: string;
  payment_method: string;
  payment_name: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  amount: number;
  fee_merchant: number;
  fee_customer: number;
  total_fee: number;
  amount_received: number;
  pay_code: string;       // VA number / QR string
  pay_url: string | null;
  checkout_url: string;   // URL redirect untuk user bayar
  status: string;         // "UNPAID" | "PAID" | "EXPIRED" | "FAILED"
  expired_time: number;
  qr_string: string | null;
  qr_url: string | null;
};

/**
 * Buat transaksi closed payment di Tripay
 * Signature: HMAC-SHA256(merchantCode + merchantRef + amount, privateKey)
 */
export async function createTransaction(params: TripayCreateParams): Promise<TripayTransaction> {
  const { apiKey, privateKey, merchantCode, apiUrl } = getConfig();

  const expiry = params.expiredTime || Math.floor(Date.now() / 1000) + 24 * 60 * 60; // default 24h

  // Signature = HMAC-SHA256
  const signatureRaw = merchantCode + params.merchantRef + String(params.amount);
  const signature = crypto
    .createHmac("sha256", privateKey)
    .update(signatureRaw)
    .digest("hex");

  const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/tripay`;
  const returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/invoice/${params.merchantRef}`;

  const body = {
    method: params.method,
    merchant_ref: params.merchantRef,
    amount: params.amount,
    customer_name: params.customerName,
    customer_email: params.customerEmail || "",
    customer_phone: params.customerPhone,
    callback_url: callbackUrl,
    return_url: returnUrl,
    expired_time: expiry,
    signature,
    order_items: params.orderItems.map((item) => ({
      sku: item.sku || "",
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
    })),
  };

  const res = await fetch(`${apiUrl}/transaction/create`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();

  if (!json.success) {
    throw new Error(`Tripay createTransaction: ${json.message || "Gagal membuat transaksi"}`);
  }

  return json.data as TripayTransaction;
}

// ========================
// VERIFY CALLBACK (Webhook)
// ========================

/**
 * Verifikasi signature callback dari Tripay
 * Signature = HMAC-SHA256(raw body JSON, privateKey)
 */
export function verifyCallback(receivedSignature: string, rawBody: string): boolean {
  const { privateKey } = getConfig();

  const computedSignature = crypto
    .createHmac("sha256", privateKey)
    .update(rawBody)
    .digest("hex");

  return receivedSignature === computedSignature;
}
