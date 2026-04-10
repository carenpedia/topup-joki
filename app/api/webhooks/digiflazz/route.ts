import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhook } from "@/lib/digiflazz";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-hub-signature");
    const event = req.headers.get("x-digiflazz-event"); // Biasanya "update" atau "test"

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    if (!verifyWebhook(signature, rawBody)) {
      console.warn("[Digiflazz Webhook] Signature tidak valid!");
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const payload = JSON.parse(rawBody);
    
    // Jika event dari digiflazz adalah test webhook
    if (event === "test") {
       return NextResponse.json({ ok: true, message: "Test webhook berhasil diterima" });
    }

    const data = payload.data;

    // data.ref_id adalah orderNo kita
    if (!data || !data.ref_id) {
      return NextResponse.json({ error: "Invalid payload: missing ref_id" }, { status: 400 });
    }

    const { ref_id, status } = data;

    // Cari order berdasarkan orderNo
    const order = await prisma.order.findUnique({
      where: { orderNo: ref_id },
    });

    if (!order) {
      console.warn(`[Digiflazz Webhook] Order dengan ref_id ${ref_id} tidak ditemukan`);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Skip jika sudah final
    if (order.status === "SUCCESS" || order.status === "FAILED") {
       return NextResponse.json({ ok: true, message: "Order already in final state" });
    }

    // Konversi status Digiflazz ke status Order kita
    let newStatus: any = order.status;
    if (status === "Sukses") {
      newStatus = "SUCCESS";
    } else if (status === "Gagal") {
      newStatus = "FAILED";
    } else if (status === "Pending") {
      newStatus = "PROCESSING";
    }

    const isNewSuccess = newStatus === "SUCCESS" && order.status !== "SUCCESS";

    // Update pesanan di database
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: newStatus,
        providerRaw: data,
        costPrice: isNewSuccess ? Math.round(data.price || 0) : undefined,
        profit: isNewSuccess ? Math.round(order.finalPayable - (data.price || 0)) : undefined,
      },
    });

    // Catat history ke TopupLog
    await prisma.topupLog.create({
       data: {
         orderId: order.id,
         provider: "DIGIFLAZZ",
         requestPayload: { source: "webhook", event },
         responsePayload: data,
         statusSnapshot: status,
       }
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[Digiflazz Webhook] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
