/**
 * lib/fulfillOrder.ts
 * Shared utility: Dieksekusi setelah pembayaran terverifikasi (dari Tripay/Xendit/Carencoin).
 * Tugas: Panggil Digiflazz topup → Update status order → Log hasil
 */

import { prisma } from "@/lib/prisma";
import { topup as digiflazzTopup } from "@/lib/digiflazz";
import { sendInvoiceEmail } from "@/lib/email";

/**
 * Fulfillment pipeline setelah payment berhasil
 * 1. Update order status ke PROCESSING
 * 2. Panggil Digiflazz untuk top-up
 * 3. Update order status ke SUCCESS/FAILED berdasarkan response
 * 4. Log TopupLog untuk audit trail
 */
export async function fulfillOrder(orderId: string): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Ambil detail order + product
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        product: true,
      },
    });

    if (!order) {
      return { success: false, message: `Order ${orderId} tidak ditemukan` };
    }

    // Pastikan hanya proses order TOPUP yang sudah PAID
    if (order.status !== "PAID") {
      return { success: false, message: `Order ${orderId} status bukan PAID (saat ini: ${order.status})` };
    }

    if (order.serviceType !== "TOPUP") {
      // Untuk JOKI atau service lain, skip Digiflazz, langsung tandai PROCESSING
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "PROCESSING" },
      });
      // Trigger Email Invoice for Joki (Async) - Pesanan Joki lunas & masuk antrian
      sendInvoiceEmail(orderId).catch(err => console.error("[Email-Joki] Background error:", err));
      return { success: true, message: "Order bukan TOPUP, diproses manual" };
    }

    if (!order.product) {
      return { success: false, message: `Order ${orderId} tidak memiliki produk terkait` };
    }

    // 2. Update status ke PROCESSING
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "PROCESSING" },
    });

    // 3. Kirim topup ke Digiflazz
    const customerNo = order.inputUserId
      ? order.inputServer
        ? `${order.inputUserId}${order.inputServer}`  // Format gabungan untuk game
        : order.inputUserId
      : "";

    const result = await digiflazzTopup(
      order.orderNo,               // ref_id
      order.product.providerSku,   // buyer_sku_code
      customerNo                   // customer_no (target user)
    );

    // 4. Log hasil ke TopupLog
    await prisma.topupLog.create({
      data: {
        orderId: order.id,
        provider: order.product.provider,
        requestPayload: {
          ref_id: order.orderNo,
          buyer_sku_code: order.product.providerSku,
          customer_no: customerNo,
        },
        responsePayload: result as any,
        statusSnapshot: result.status,
      },
    });

    // 5. Update providerTrxId dan status final
    const isSuccess = result.rc === "00" || result.status === "Sukses";
    const isPending = result.status === "Pending";

    await prisma.order.update({
      where: { id: orderId },
      data: {
        provider: order.product.provider,
        providerTrxId: result.ref_id || null,
        providerRaw: result as any,
        status: isSuccess ? "SUCCESS" : isPending ? "PROCESSING" : "FAILED",
        costPrice: isSuccess ? Math.round(result.price || 0) : 0,
        profit: isSuccess ? Math.round(order.finalPayable - (result.price || 0)) : 0,
      },
    });

    if (isSuccess) {
      // Trigger Email Invoice (Async)
      sendInvoiceEmail(orderId).catch(err => console.error("[Email] Background error:", err));
      
      return { success: true, message: `Topup berhasil. SN: ${result.sn || "-"}` };
    } else if (isPending) {
      return { success: true, message: "Topup sedang diproses (pending dari provider)" };
    } else {
      return { success: false, message: `Topup gagal: ${result.message}` };
    }
  } catch (error: any) {
    // Jika error, tandai FAILED
    try {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "FAILED" },
      });
    } catch {}

    console.error("[fulfillOrder] Error:", error);
    return { success: false, message: error?.message || "Internal error saat fulfillment" };
  }
}
