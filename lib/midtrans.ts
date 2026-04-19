/**
 * lib/midtrans.ts
 * Helper untuk integrasi Midtrans Snap API
 * Docs: https://docs.midtrans.com/en/snap/integration-guide
 */

function getConfig() {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const clientKey = process.env.MIDTRANS_CLIENT_KEY;
  const isProd = process.env.MIDTRANS_IS_PRODUCTION === "true";
  const apiUrl = isProd 
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";

  if (!serverKey || !clientKey) {
    throw new Error("MIDTRANS_SERVER_KEY dan MIDTRANS_CLIENT_KEY wajib diisi di .env");
  }

  return { serverKey, clientKey, apiUrl };
}

export type MidtransCreateParams = {
  orderId: string;         // orderNo
  amount: number;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  itemDetails: {
    id: string;
    price: number;
    quantity: number;
    name: string;
  }[];
};

export async function createSnapToken(params: MidtransCreateParams) {
  const { serverKey, apiUrl } = getConfig();

  const authHeader = Buffer.from(`${serverKey}:`).toString("base64");

  const body = {
    transaction_details: {
      order_id: params.orderId,
      gross_amount: params.amount,
    },
    item_details: params.itemDetails.map(it => ({
      id: it.id,
      price: it.price,
      quantity: it.quantity,
      name: it.name.substring(0, 50),
    })),
    customer_details: {
      first_name: params.customerName,
      email: params.customerEmail || "",
      phone: params.customerPhone,
    },
    callbacks: {
      finish: `${process.env.NEXT_PUBLIC_BASE_URL}/invoice/${params.orderId}`,
    }
  };

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Basic ${authHeader}`,
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(`Midtrans Error: ${json.error_messages ? json.error_messages.join(", ") : "Gagal membuat transaksi"}`);
  }

  return {
    token: json.token,
    redirectUrl: json.redirect_url,
  };
}

/**
 * Verifikasi callback dari Midtrans
 */
export async function verifyMidtransNotification(orderId: string, statusCode: string, grossAmount: string, signatureKey: string) {
  const { serverKey } = getConfig();
  const crypto = await import("crypto");

  const raw = orderId + statusCode + grossAmount + serverKey;
  const expectedSignature = crypto.createHash("sha512").update(raw).digest("hex");

  return signatureKey === expectedSignature;
}
