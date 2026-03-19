/**
 * POST /api/webhooks/tripay
 * Menerima callback/webhook dari Tripay setelah pembayaran berhasil/gagal/expired.
 * 
 * Tripay mengirim POST dengan body JSON dan header berisi signature.
 * Verifikasi: HMAC-SHA256(raw body, TRIPAY_PRIVATE_KEY)
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCallback } from "@/lib/tripay";
import { fulfillOrder } from "@/lib/fulfillOrder";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const receivedSignature = req.headers.get("x-callback-signature") || "";

    // 1. Verifikasi signature
    const isValid = verifyCallback(receivedSignature, rawBody);
    if (!isValid) {
      console.warn("[Tripay Webhook] Signature tidak valid!");
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    // 2. Parse body
    const data = JSON.parse(rawBody);

    /**
     * Tripay callback payload:
     * {
     *   reference: "T123...",
     *   merchant_ref: "CP-XXXXX-YYY",
     *   payment_method: "QRIS",
     *   payment_method_code: "QRIS",
     *   total_amount: 50000,
     *   fee_merchant: 500,
     *   fee_customer: 0,
     *   total_fee: 500,
     *   amount_received: 49500,
     *   is_closed_payment: 1,
     *   status: "PAID",       // "PAID" | "EXPIRED" | "FAILED"
     *   paid_at: 1708123456,
     *   note: null,
     * }
     */

    const { merchant_ref, reference, status, paid_at } = data;

    if (!merchant_ref || !status) {
      return NextResponse.json({ error: "Data callback tidak lengkap" }, { status: 400 });
    }

    // 3. Cari Payment record berdasarkan gatewayRef (tripay reference)
    const payment = await prisma.payment.findFirst({
      where: {
        gateway: "TRIPAY",
        gatewayRef: reference,
      },
      include: {
        order: true,
      },
    });

    if (!payment) {
      console.warn(`[Tripay Webhook] Payment dengan ref ${reference} tidak ditemukan`);
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // 4. Skip jika sudah diproses sebelumnya
    if (payment.status === "PAID") {
      return NextResponse.json({ ok: true, message: "Already processed" });
    }

    // 5. Update status berdasarkan callback
    if (status === "PAID") {
      // Update Payment
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "PAID",
          paidAt: paid_at ? new Date(paid_at * 1000) : new Date(),
          rawPayload: data,
        },
      });

      // Update Order
      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: "PAID",
          paidAt: paid_at ? new Date(paid_at * 1000) : new Date(),
        },
      });

      // 6. Trigger fulfillment (Digiflazz topup)
      const result = await fulfillOrder(payment.orderId);
      console.log(`[Tripay Webhook] Fulfillment ${merchant_ref}: ${result.message}`);

    } else if (status === "EXPIRED") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "EXPIRED", rawPayload: data },
      });
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: "EXPIRED" },
      });

    } else if (status === "FAILED") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED", rawPayload: data },
      });
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: "FAILED" },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[Tripay Webhook] Error:", error);
    return NextResponse.json({ error: error?.message || "Internal error" }, { status: 500 });
  }
}
