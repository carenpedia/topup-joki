import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const q = (searchParams.get("q") || "").trim();
    const status = (searchParams.get("status") || "ALL").trim().toUpperCase();
    const channel = (searchParams.get("channel") || "ALL").trim().toUpperCase();
    const take = Math.min(Number(searchParams.get("take") || 200), 500);

    const where: any = {};

    // filter status
    if (status !== "ALL") {
      where.status = status;
    }

    // filter channel
    if (channel !== "ALL") {
      where.channel = channel;
    }

    // search query
    if (q) {
      where.OR = [
        { id: { contains: q, mode: "insensitive" } },
        { user: { is: { username: { contains: q, mode: "insensitive" } } } },
        { gatewayRef: { contains: q, mode: "insensitive" } },
      ];
    }

    const rows = await prisma.deposit.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        amount: true,
        channel: true,
        gateway: true,
        gatewayRef: true,
        status: true,
        adminNote: true,
        createdAt: true,
        user: { select: { username: true } },
      },
    });

    const out = rows.map((d) => ({
      id: d.id,
      user: d.user?.username || "-",
      amount: d.amount,
      channel: d.channel,
      gateway: d.gateway || "-",
      gatewayRef: d.gatewayRef || "-",
      status: d.status,
      adminNote: d.adminNote || "-",
      createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : null,
    }));

    return NextResponse.json({ rows: out });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Internal error" },
      { status: 500 }
    );
  }
}
