/**
 * POST /api/webhooks/midtrans
 * Menerima callback/webhook dari Midtrans Snap/Core API.
 * Docs: https://docs.midtrans.com/en/after-payment/http-notification
 */

export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyMidtransNotification } from "@/lib/midtrans";
import { fulfillOrder } from "@/lib/fulfillOrder";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      transaction_id,
      settlement_time,
    } = data;

    // 1. Verifikasi Signature
    const isValid = await verifyMidtransNotification(order_id, status_code, gross_amount, signature_key);
    if (!isValid) {
      console.warn("[Midtrans Webhook] Signature tidak valid!");
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    // 2. Cari Payment record berdasarkan gatewayRef (orderNo kita)
    const payment = await prisma.payment.findFirst({
      where: {
        gateway: "MIDTRANS",
        gatewayRef: order_id, // Kita simpan orderNo di gatewayRef untuk Midtrans
      },
      include: {
        order: true,
      },
    });

    if (!payment) {
      console.warn(`[Midtrans Webhook] Payment dengan ref ${order_id} tidak ditemukan`);
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // 3. Skip jika sudah diproses
    if (payment.status === "PAID") {
      return NextResponse.json({ ok: true, message: "Already processed" });
    }

    /**
     * transaction_status values:
     * - "settlement" | "capture" -> Success
     * - "expire" -> Expired
     * - "cancel" | "deny" -> Failed
     * - "pending" -> Still waiting
     */

    // 4. Update status berdasarkan transaction_status
    if (transaction_status === "settlement" || transaction_status === "capture") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "PAID",
          paidAt: settlement_time ? new Date(settlement_time) : new Date(),
          rawPayload: data,
        },
      });

      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: "PAID",
          paidAt: settlement_time ? new Date(settlement_time) : new Date(),
        },
      });

      // 5. Trigger fulfillment
      const result = await fulfillOrder(payment.orderId);
      console.log(`[Midtrans Webhook] Fulfillment ${order_id}: ${result.message}`);

    } else if (transaction_status === "expire") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "EXPIRED", rawPayload: data },
      });
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: "EXPIRED" },
      });

    } else if (transaction_status === "cancel" || transaction_status === "deny") {
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
    console.error("[Midtrans Webhook] Error:", error);
    return NextResponse.json({ error: error?.message || "Internal error" }, { status: 500 });
  }
}
