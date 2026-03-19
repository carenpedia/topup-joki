/**
 * POST /api/webhooks/xendit
 * Menerima webhook/callback dari Xendit setelah invoice dibayar/expired.
 * 
 * Verifikasi: Compare header `x-callback-token` dengan XENDIT_CALLBACK_TOKEN
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhook } from "@/lib/xendit";
import { fulfillOrder } from "@/lib/fulfillOrder";

export async function POST(req: Request) {
  try {
    // 1. Verifikasi token webhook
    const receivedToken = req.headers.get("x-callback-token") || "";
    const isValid = verifyWebhook(receivedToken);

    if (!isValid) {
      console.warn("[Xendit Webhook] Token tidak valid!");
      return NextResponse.json({ error: "Invalid callback token" }, { status: 403 });
    }

    // 2. Parse body
    const data = await req.json();

    /**
     * Xendit invoice callback payload:
     * {
     *   id: "inv_xxxx",
     *   external_id: "CP-XXXXX-YYY",
     *   user_id: "...",
     *   status: "PAID",       // "PAID" | "EXPIRED"
     *   merchant_name: "...",
     *   amount: 50000,
     *   paid_amount: 50000,
     *   paid_at: "2024-01-01T10:00:00.000Z",
     *   payer_email: "...",
     *   description: "...",
     *   payment_method: "BANK_TRANSFER",
     *   payment_channel: "BCA",
     *   ...
     * }
     */

    const { id: xenditInvoiceId, external_id, status, paid_at } = data;

    if (!xenditInvoiceId || !status) {
      return NextResponse.json({ error: "Data callback tidak lengkap" }, { status: 400 });
    }

    // 3. Cari Payment record berdasarkan gatewayRef (xendit invoice id)
    const payment = await prisma.payment.findFirst({
      where: {
        gateway: "XENDIT",
        gatewayRef: xenditInvoiceId,
      },
      include: {
        order: true,
      },
    });

    if (!payment) {
      console.warn(`[Xendit Webhook] Payment dengan ref ${xenditInvoiceId} tidak ditemukan`);
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // 4. Skip jika sudah diproses
    if (payment.status === "PAID") {
      return NextResponse.json({ ok: true, message: "Already processed" });
    }

    // 5. Update berdasarkan status
    if (status === "PAID" || status === "SETTLED") {
      const paidDate = paid_at ? new Date(paid_at) : new Date();

      // Update Payment
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "PAID",
          paidAt: paidDate,
          rawPayload: data,
        },
      });

      // Update Order
      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: "PAID",
          paidAt: paidDate,
        },
      });

      // 6. Trigger fulfillment (Digiflazz topup)
      const result = await fulfillOrder(payment.orderId);
      console.log(`[Xendit Webhook] Fulfillment ${external_id}: ${result.message}`);

    } else if (status === "EXPIRED") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "EXPIRED", rawPayload: data },
      });
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: "EXPIRED" },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[Xendit Webhook] Error:", error);
    return NextResponse.json({ error: error?.message || "Internal error" }, { status: 500 });
  }
}
