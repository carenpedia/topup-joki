/**
 * POST /api/webhooks/duitku
 * Menerima callback/webhook dari Duitku.
 * Docs: https://doc.duitku.com/
 */

export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyDuitkuCallback } from "@/lib/duitku";
import { fulfillOrder } from "@/lib/fulfillOrder";

export async function POST(req: Request) {
  try {
    // Duitku biasanya mengirim form-urlencoded atau JSON tergantung konfigurasi
    // Kita coba handle keduanya (Next.js req.json() handles JSON)
    // Tapi dokumen Duitku menyebutkan POST parameters.
    const formData = await req.formData().catch(() => null);
    
    let merchantCode, amount, merchantOrderId, signature, resultCode;

    if (formData) {
       merchantCode = formData.get("merchantCode")?.toString();
       amount = formData.get("amount")?.toString();
       merchantOrderId = formData.get("merchantOrderId")?.toString();
       signature = formData.get("signature")?.toString();
       resultCode = formData.get("resultCode")?.toString();
    } else {
       const body = await req.json();
       merchantCode = body.merchantCode;
       amount = body.amount;
       merchantOrderId = body.merchantOrderId;
       signature = body.signature;
       resultCode = body.resultCode;
    }

    if (!merchantOrderId || !signature || !resultCode) {
      return NextResponse.json({ error: "Data callback tidak lengkap" }, { status: 400 });
    }

    // 1. Verifikasi Signature
    const isValid = verifyDuitkuCallback(signature, merchantCode || "", String(amount || ""), merchantOrderId);
    if (!isValid) {
      console.warn("[Duitku Webhook] Signature tidak valid!");
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    // 2. Cari Payment record berdasarkan gatewayRef atau orderNo
    const payment = await prisma.payment.findFirst({
      where: {
        gateway: "DUITKU",
        gatewayRef: { in: [merchantOrderId] }, // Duitku order ID kita simpan sebagai merchantOrderId
      },
      include: {
        order: true,
      },
    });

    if (!payment) {
      console.warn(`[Duitku Webhook] Payment dengan ref ${merchantOrderId} tidak ditemukan`);
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // 3. Skip jika sudah diproses
    if (payment.status === "PAID") {
      return new Response("OK", { status: 200 });
    }

    // 4. Update status berdasarkan resultCode
    // "00" berarti sukses di Duitku
    if (resultCode === "00") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "PAID",
          paidAt: new Date(),
          rawPayload: { merchantCode, amount, merchantOrderId, resultCode },
        },
      });

      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: "PAID",
          paidAt: new Date(),
        },
      });

      // 5. Trigger fulfillment
      const result = await fulfillOrder(payment.orderId);
      console.log(`[Duitku Webhook] Fulfillment ${merchantOrderId}: ${result.message}`);

    } else {
      // Duitku status lain dianggap gagal atau dibatalkan
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED", rawPayload: { resultCode } },
      });
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: "FAILED" },
      });
    }

    // Duitku mengharapkan response text "OK"
    return new Response("OK", { status: 200 });
  } catch (error: any) {
    console.error("[Duitku Webhook] Error:", error);
    return new Response("Error: " + error.message, { status: 500 });
  }
}
