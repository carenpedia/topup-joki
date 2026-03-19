/**
 * lib/xendit.ts
 * Helper untuk integrasi Xendit Payment Gateway
 * Docs: https://docs.xendit.co/
 */

function getConfig() {
  const secretKey = process.env.XENDIT_SECRET_KEY;
  const callbackToken = process.env.XENDIT_CALLBACK_TOKEN;
  const apiUrl = process.env.XENDIT_API_URL || "https://api.xendit.co";

  if (!secretKey) {
    throw new Error("XENDIT_SECRET_KEY wajib diisi di .env");
  }

  return { secretKey, callbackToken: callbackToken || "", apiUrl };
}

/**
 * Buat header Authorization Basic untuk Xendit
 * Format: Basic base64(SECRET_KEY:)
 */
function authHeader(): string {
  const { secretKey } = getConfig();
  const encoded = Buffer.from(`${secretKey}:`).toString("base64");
  return `Basic ${encoded}`;
}

// ========================
// CREATE INVOICE
// ========================

export type XenditInvoiceParams = {
  externalId: string;      // orderNo kita
  amount: number;
  description: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  currency?: string;       // default "IDR"
  invoiceDuration?: number; // durasi dalam detik (default 86400 = 24h)
  paymentMethods?: string[];  // e.g. ["BCA", "BNI", "QRIS", "OVO", "DANA"]
  successRedirectUrl?: string;
};

export type XenditInvoice = {
  id: string;
  external_id: string;
  user_id: string;
  status: string;          // "PENDING" | "PAID" | "EXPIRED" | "SETTLED"
  merchant_name: string;
  amount: number;
  description: string;
  invoice_url: string;     // URL redirect untuk user bayar
  expiry_date: string;
  currency: string;
};

/**
 * Buat invoice di Xendit
 */
export async function createInvoice(params: XenditInvoiceParams): Promise<XenditInvoice> {
  const { apiUrl } = getConfig();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const body: Record<string, unknown> = {
    external_id: params.externalId,
    amount: params.amount,
    description: params.description,
    currency: params.currency || "IDR",
    invoice_duration: params.invoiceDuration || 86400,
    success_redirect_url: params.successRedirectUrl || `${baseUrl}/invoice/${params.externalId}`,
    failure_redirect_url: `${baseUrl}/invoice/${params.externalId}`,
  };

  // Customer info (opsional tapi recommended)
  if (params.customerName || params.customerEmail || params.customerPhone) {
    body.customer = {
      given_names: params.customerName || "Customer",
      email: params.customerEmail || undefined,
      mobile_number: params.customerPhone || undefined,
    };
  }

  // Filter payment methods (opsional)
  if (params.paymentMethods && params.paymentMethods.length > 0) {
    body.payment_methods = params.paymentMethods;
  }

  const res = await fetch(`${apiUrl}/v2/invoices`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();

  if (!res.ok) {
    const errorMsg = json?.message || json?.error_code || "Gagal membuat invoice Xendit";
    throw new Error(`Xendit createInvoice: ${errorMsg}`);
  }

  return json as XenditInvoice;
}

// ========================
// GET INVOICE STATUS
// ========================

/**
 * Ambil status invoice dari Xendit berdasarkan invoice ID
 */
export async function getInvoice(invoiceId: string): Promise<XenditInvoice> {
  const { apiUrl } = getConfig();

  const res = await fetch(`${apiUrl}/v2/invoices/${invoiceId}`, {
    method: "GET",
    headers: {
      Authorization: authHeader(),
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(`Xendit getInvoice: ${json?.message || "Gagal"}`);
  }

  return json as XenditInvoice;
}

// ========================
// VERIFY WEBHOOK
// ========================

/**
 * Verifikasi apakah webhook callback benar dari Xendit
 * Caranya: bandingkan header `x-callback-token` dengan XENDIT_CALLBACK_TOKEN kita
 */
export function verifyWebhook(receivedToken: string): boolean {
  const { callbackToken } = getConfig();

  if (!callbackToken) {
    console.warn("[Xendit] XENDIT_CALLBACK_TOKEN tidak diset, skip verifikasi.");
    return true; // fallback: skip verifikasi jika belum diset
  }

  return receivedToken === callbackToken;
}
