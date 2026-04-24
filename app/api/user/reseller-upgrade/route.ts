import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session";
import { createTransaction as createTripayTransaction } from "@/lib/tripay";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const token = cookies().get("session")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const s = await verifySession(token);
    const userId = s.userId;
    const { methodId, type } = await req.json(); // type: "otomatis" | "manual"

    // 1. Check if user already reseller
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (user.role === "RESELLER") {
      return NextResponse.json({ error: "Akun Anda sudah berstatus Reseller." }, { status: 400 });
    }

    // 2. Get price from settings
    const priceSetting = await prisma.globalSetting.findUnique({ where: { key: "RESELLER_UPGRADE_PRICE" } });
    const price = parseInt(priceSetting?.value || "45000");

    // 3. Create Order
    const orderNo = `RES-${Date.now()}`;
    const order = await prisma.order.create({
      data: {
        orderNo,
        userId,
        serviceType: "RESELLER_JOIN",
        finalPayable: price,
        status: "PENDING_PAYMENT",
        contactWhatsapp: user.whatsapp,
        paymentMethod: type === "otomatis" ? "GATEWAY" : "CARENCOIN", // Use CARENCOIN as placeholder for manual
      }
    });

    if (type === "otomatis") {
      // Create Gateway Transaction (Tripay example)
      const method = await prisma.paymentMethodFee.findUnique({ where: { id: methodId } });
      if (!method) return NextResponse.json({ error: "Metode pembayaran tidak ditemukan" }, { status: 400 });

      const tripayRes = await createTripayTransaction({
        method: method.methodKey,
        merchantRef: order.orderNo,
        amount: price,
        customerName: user.username,
        customerEmail: "customer@carenpedia.id",
        customerPhone: user.whatsapp,
        orderItems: [{ name: "Upgrade Reseller VIP", price: price, quantity: 1 }]
      });

      if (!tripayRes.success) throw new Error(tripayRes.message);

      await prisma.payment.create({
        data: {
          orderId: order.id,
          gateway: "TRIPAY",
          gatewayRef: tripayRes.data.reference,
          status: "PENDING"
        }
      });

      return NextResponse.json({ ok: true, checkoutUrl: tripayRes.data.checkout_url });
    } else {
      // Manual payment
      return NextResponse.json({ ok: true, manual: true, orderNo: order.orderNo });
    }

  } catch (error: any) {
    console.error("Reseller Upgrade Error:", error);
    return NextResponse.json({ error: error.message || "Gagal memproses pendaftaran" }, { status: 500 });
  }
}
