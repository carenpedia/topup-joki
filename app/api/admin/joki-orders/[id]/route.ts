export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const row = await prisma.order.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        orderNo: true,
        serviceType: true,
        status: true,
        basePrice: true,
        finalPayable: true,
        contactWhatsapp: true,
        contactEmail: true,
        gameId: true,
        paymentMethod: true,
        gatewayMethodKey: true,
        paidAt: true,
        createdAt: true,

        user: {
          select: { id: true, username: true, role: true, status: true, whatsapp: true },
        },
        game: { select: { key: true, name: true } },

        jokiDetail: {
          select: {
            id: true,
            loginVia: true,
            userIdNickname: true,
            loginId: true,
            password: true,
            noteForJoki: true,
            status: true,
            heroRequests: { select: { id: true, hero: true } },
          },
        },
      },
    });

    if (!row || row.serviceType !== "JOKI_ML") {
      return NextResponse.json({ error: "Joki order tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      row: {
        id: row.id,
        orderNo: row.orderNo,
        status: row.status,
        createdAt: row.createdAt.toISOString(),
        paidAt: row.paidAt ? row.paidAt.toISOString() : null,
        total: row.finalPayable || 0,
        basePrice: row.basePrice || 0,
        contactWhatsapp: row.contactWhatsapp || "-",
        contactEmail: row.contactEmail || "-",
        paymentMethod: row.paymentMethod,
        gatewayMethodKey: row.gatewayMethodKey || null,
        user: row.user
          ? {
              id: row.user.id,
              username: row.user.username,
              role: row.user.role,
              status: row.user.status,
              whatsapp: row.user.whatsapp,
            }
          : null,
        game: row.game ? { key: row.game.key, name: row.game.name } : null,
        jokiDetail: row.jokiDetail
          ? {
              id: row.jokiDetail.id,
              loginVia: row.jokiDetail.loginVia,
              userIdNickname: row.jokiDetail.userIdNickname,
              loginId: row.jokiDetail.loginId,
              password: row.jokiDetail.password,
              noteForJoki: row.jokiDetail.noteForJoki || null,
              status: row.jokiDetail.status,
              heroes: row.jokiDetail.heroRequests.map((h) => h.hero),
            }
          : null,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
