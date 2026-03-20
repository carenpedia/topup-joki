export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type TypeFilter = "ALL" | "TOPUP" | "JOKI";
type StatusFilter = "ALL" | "PENDING_PAYMENT" | "PAID" | "FAILED";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const q = (searchParams.get("q") || "").trim();
    const type = ((searchParams.get("type") || "ALL").trim().toUpperCase() as TypeFilter) || "ALL";
    const status = ((searchParams.get("status") || "ALL").trim().toUpperCase() as StatusFilter) || "ALL";
    const take = Math.min(Number(searchParams.get("take") || 200), 500);

    const where: any = {};

    // filter tipe order
    if (type !== "ALL") {
      where.serviceType = type; // TOPUP / JOKI (sesuai enum OrderServiceType kamu)
    }

    // filter status
    if (status !== "ALL") {
      where.status = status; // PENDING_PAYMENT / PAID / FAILED
    }

    // search query
    if (q) {
      where.OR = [
        { id: { contains: q, mode: "insensitive" } },
        { orderNo: { contains: q, mode: "insensitive" } },
        { user: { is: { username: { contains: q, mode: "insensitive" } } } },
        { game: { is: { name: { contains: q, mode: "insensitive" } } } },
        { product: { is: { name: { contains: q, mode: "insensitive" } } } },
      ];
    }

    const rows = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        orderNo: true,
        serviceType: true,
        status: true,
        finalPayable: true,
        createdAt: true,

        user: { select: { username: true } },
        game: { select: { name: true, key: true } },
        product: { select: { name: true } },

        // biar nanti gampang tampilkan ringkas di list kalau JOKI
        jokiDetail: {
          select: {
            loginVia: true,
          },
        },
      },
    });

    const out = rows.map((o) => ({
      id: o.id,
      orderNo: o.orderNo,
      serviceType: o.serviceType,
      status: o.status,
      total: o.finalPayable,
      createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : null,

      user: o.user?.username || "-",
      game: o.game?.key || o.game?.name || "-",
      item: o.product?.name || (o.serviceType === "JOKI_ML" ? "Joki Order" : "-"),
      // tambahan opsional kalau mau ditampilkan cepat
      jokiLoginVia: o.jokiDetail?.loginVia || null,
    }));

    return NextResponse.json({ rows: out });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
