import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
      gameId: order.gameId,
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
