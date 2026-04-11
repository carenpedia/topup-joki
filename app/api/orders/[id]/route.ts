import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fulfillOrder } from "@/lib/fulfillOrder";

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const orderNo = params.id;

    const order = await prisma.order.findUnique({
      where: { orderNo },
      include: {
        game: {
          select: {
            name: true,
            logoUrl: true,
          },
        },
        product: {
          select: {
            name: true,
          },
        },
        payment: {
          select: {
            gateway: true,
            gatewayRef: true,
            status: true,
            rawPayload: true,
            paidAt: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    // Transform and sanitize for public view
    const response = {
      orderNo: order.orderNo,
      status: order.status,
      serviceType: order.serviceType,
      game: order.game ? {
        name: order.game.name,
        logoUrl: order.game.logoUrl,
      } : null,
      productName: order.product?.name || "Produk",
      inputUserId: order.inputUserId,
      inputServer: order.inputServer,
      finalPayable: order.finalPayable,
      paymentMethod: order.paymentMethod,
      paymentGateway: order.paymentGateway,
      gatewayMethodKey: order.gatewayMethodKey,
      paidAt: order.paidAt,
      expiresAt: order.expiresAt,
      createdAt: order.createdAt,
      payment: order.payment ? {
        gateway: order.payment.gateway,
        status: order.payment.status,
        // Include select fields from rawPayload if needed (e.g. for QRIS)
        raw: order.payment.rawPayload,
      } : null,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("[api/orders/[id]] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const orderNo = params.id;

    const order = await prisma.order.findUnique({
      where: { orderNo },
      include: { payment: true }
    });

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    if (order.gatewayMethodKey !== "SIMULASI") {
      return NextResponse.json({ error: "Hanya pesanan simulasi yang bisa dibayar via API ini" }, { status: 403 });
    }

    if (order.status !== "PENDING_PAYMENT") {
      return NextResponse.json({ error: "Pesanan sudah dibayar atau tidak bisa diupdate lagi" }, { status: 400 });
    }

    // Update status ke PAID
    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          paidAt: new Date(),
        },
      }),
      prisma.payment.update({
        where: { orderId: order.id },
        data: {
          status: "PAID",
          paidAt: new Date(),
        },
      }),
    ]);

    // Jalankan fulfillment (simulasi top-up)
    const fulfillResult = await fulfillOrder(order.id);

    return NextResponse.json({
      ok: true,
      message: "Pembayaran simulasi berhasil",
      fulfillment: fulfillResult,
    });
  } catch (error: any) {
    console.error("[api/orders/[id]] PATCH Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
