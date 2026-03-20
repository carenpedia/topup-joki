export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function findOrder(paramId: string) {
  return prisma.order.findFirst({
    where: {
      OR: [{ id: paramId }, { orderNo: paramId }],
    },
    select: {
      id: true,
      orderNo: true,
      serviceType: true,
      status: true,
      createdAt: true,
      paidAt: true,

      basePrice: true,
      finalPayable: true,

      paymentMethod: true,
      gatewayMethodKey: true,

      contactWhatsapp: true,
      contactEmail: true,

      // TOPUP fields
      inputUserId: true,
      inputServer: true,
      game: { select: { key: true, name: true } },
      product: { select: { name: true } },

      user: { select: { username: true } },

      // ✅ JOKI detail (sesuai schema kamu sekarang)
      jokiDetail: {
        select: {
          loginVia: true,
          userIdNickname: true,
          loginId: true,
          password: true,
          noteForJoki: true,
          status: true,
          heroRequests: {
            select: {
              hero: true, // ✅ FIX: field-nya "hero"
            },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const o = await findOrder(params.id);

    if (!o) {
      return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
    }

    const row = {
      id: o.orderNo || o.id,
      rawId: o.id,
      orderNo: o.orderNo,
      serviceType: String(o.serviceType),
      status: String(o.status),
      createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : null,
      paidAt: o.paidAt ? new Date(o.paidAt).toISOString() : null,

      user: o.user?.username || "-",

      total: Number(o.finalPayable || 0),
      basePrice: Number(o.basePrice || 0),

      paymentMethod: String(o.paymentMethod || "-"),
      gatewayMethodKey: String(o.gatewayMethodKey || "-"),

      contactWhatsapp: o.contactWhatsapp || "-",
      contactEmail: o.contactEmail || "-",

      // TOPUP display
      game: o.game?.name || o.game?.key || "-",
      item: o.product?.name || "-",
      target:
        o.inputUserId || o.inputServer
          ? `${o.inputUserId || "-"}${o.inputServer ? ` (Server ${o.inputServer})` : ""}`
          : "-",

      // ✅ JOKI display
      joki: o.jokiDetail
        ? {
            loginVia: String(o.jokiDetail.loginVia),
            userIdNickname: o.jokiDetail.userIdNickname,
            loginId: o.jokiDetail.loginId,
            password: o.jokiDetail.password,
            noteForJoki: o.jokiDetail.noteForJoki || "",
            status: String(o.jokiDetail.status),
            heroRequests: o.jokiDetail.heroRequests.map((h) => h.hero),
          }
        : null,
    };

    return NextResponse.json({ row });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json().catch(() => ({}));
    const nextStatus = String(body?.status || "").toUpperCase();

    if (nextStatus !== "PAID" && nextStatus !== "FAILED") {
      return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: { OR: [{ id: params.id }, { orderNo: params.id }] },
      select: { id: true, status: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
    }

    // anti dobel: hanya bisa update dari PENDING_PAYMENT
    if (order.status !== "PENDING_PAYMENT") {
      return NextResponse.json(
        { error: `Tidak bisa update. Status sekarang: ${order.status}` },
        { status: 409 }
      );
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: nextStatus as any,
        paidAt: nextStatus === "PAID" ? new Date() : null,
      },
      select: { id: true, status: true, paidAt: true },
    });

    return NextResponse.json({ ok: true, row: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
