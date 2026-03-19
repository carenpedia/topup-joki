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

        // pricing
        basePrice: true,
        finalPayable: true,

        // contacts
        contactWhatsapp: true,
        contactEmail: true,

        // topup/joki common relations
        gameId: true,
        productId: true,
        inputUserId: true,
        inputServer: true,

        paymentMethod: true,
        gatewayMethodKey: true,
        paidAt: true,
        createdAt: true,

        user: {
          select: {
            id: true,
            username: true,
            role: true,
            status: true,
            whatsapp: true,
          },
        },

        game: { select: { key: true, name: true } },

        // joki detail relasi ada, tapi field-nya bisa beda di schema kamu,
        // jadi aman: ambil id saja (biar tidak error select field yang tidak ada)
        jokiDetail: { select: { id: true } },
      },
    });

    if (!row || row.serviceType !== ("JOKI" as any)) {
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
        productId: row.productId || null,

        target:
          row.inputUserId || row.inputServer
            ? `${row.inputUserId || "-"}${row.inputServer ? ` (Server ${row.inputServer})` : ""}`
            : "-",

        hasJokiDetail: !!row.jokiDetail,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
