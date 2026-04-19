/**
 * lib/duitku.ts
 * Helper untuk integrasi Duitku Payment Gateway
 * Docs: https://doc.duitku.com/
 */

import crypto from "crypto";

function getConfig() {
  const merchantCode = process.env.DUITKU_MERCHANT_CODE;
  const apiKey = process.env.DUITKU_API_KEY;
  const isProd = process.env.DUITKU_IS_PRODUCTION === "true";
  const apiUrl = isProd 
    ? "https://passport.duitku.com/webapi/api/merchant/v2/inquiry"
    : "https://sandbox.duitku.com/webapi/api/merchant/v2/inquiry";

  if (!merchantCode || !apiKey) {
    throw new Error("DUITKU_MERCHANT_CODE dan DUITKU_API_KEY wajib diisi di .env");
  }

  return { merchantCode, apiKey, apiUrl };
}

export type DuitkuCreateParams = {
  paymentAmount: number;
  merchantOrderId: string;
  productDetails: string;
  customerVaName: string;
  email: string;
  phoneNumber: string;
  paymentMethod?: string; // e.g. "VC" (Credit Card), "MY" (MANDIRI), etc.
};

export async function createDuitkuInquiry(params: DuitkuCreateParams) {
  const { merchantCode, apiKey, apiUrl } = getConfig();

  // Signature = MD5(merchantCode + merchantOrderId + paymentAmount + apiKey)
  const signatureRaw = merchantCode + params.merchantOrderId + String(params.paymentAmount) + apiKey;
  const signature = crypto.createHash("md5").update(signatureRaw).digest("hex");

  const body = {
    merchantCode,
    paymentAmount: params.paymentAmount,
    merchantOrderId: params.merchantOrderId,
    productDetails: params.productDetails,
    customerVaName: params.customerVaName,
    email: params.email,
    phoneNumber: params.phoneNumber,
    paymentMethod: params.paymentMethod,
    callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/duitku`,
    returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/invoice/${params.merchantOrderId}`,
    signature,
    expiryPeriod: 1440, // 24 hours
  };

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();

  if (json.statusCode !== "00") {
    throw new Error(`Duitku Error: ${json.statusMessage || "Gagal membuat transaksi"}`);
  }

  return {
     paymentUrl: json.paymentUrl,
     merchantOrderId: json.merchantOrderId,
     reference: json.reference
  };
}

/**
 * Verifikasi callback dari Duitku
 * Signature = MD5(merchantCode + amount + merchantOrderId + apiKey)
 */
export function verifyDuitkuCallback(receivedSignature: string, merchantCode: string, amount: string, merchantOrderId: string) {
  const { apiKey } = getConfig();
  const raw = merchantCode + amount + merchantOrderId + apiKey;
  const computedSignature = crypto.createHash("md5").update(raw).digest("hex");

  return receivedSignature === computedSignature;
}
