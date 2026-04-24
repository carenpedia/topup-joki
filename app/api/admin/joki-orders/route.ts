export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const status = (searchParams.get("status") || "ALL").trim().toUpperCase();
    const take = Math.min(Number(searchParams.get("take") || 200), 500);

    const where: any = {
      serviceType: "JOKI_ML", // sesuai Prisma enum OrderServiceType
    };

    if (q) {
      where.OR = [
        { id: { contains: q, mode: "insensitive" } },
        { orderNo: { contains: q, mode: "insensitive" } },
        { contactWhatsapp: { contains: q, mode: "insensitive" } },
        { user: { is: { username: { contains: q, mode: "insensitive" } } } },
      ];
    }

    if (status !== "ALL") {
      where.status = status;
    }

    const rows = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        orderNo: true,
        status: true,
        finalPayable: true,
        quantity: true,
        contactWhatsapp: true,
        createdAt: true,
        user: { select: { username: true } },
        jokiDetail: { select: { status: true } },
      },
    });

    return NextResponse.json({
      rows: rows.map((r) => ({
        id: r.id,
        orderNo: r.orderNo,
        username: r.user?.username || "-",
        whatsapp: r.contactWhatsapp || "-",
        total: r.finalPayable || 0,
        quantity: r.quantity || 1,
        status: r.status,
        jokiStatus: r.jokiDetail?.status || null,
        createdAt: r.createdAt.toISOString(),
      })),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
