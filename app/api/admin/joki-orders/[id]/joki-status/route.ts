export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_JOKI_STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;
type JokiStatus = (typeof VALID_JOKI_STATUSES)[number];

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json().catch(() => ({}));
    const { jokiStatus } = body as { jokiStatus?: string };

    if (!jokiStatus || !VALID_JOKI_STATUSES.includes(jokiStatus as JokiStatus)) {
      return NextResponse.json(
        { error: `jokiStatus harus salah satu dari: ${VALID_JOKI_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    // Pastikan order ada dan serviceType JOKI_ML
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      select: { serviceType: true, jokiDetail: { select: { id: true } } },
    });

    if (!order || order.serviceType !== "JOKI_ML") {
      return NextResponse.json({ error: "Joki order tidak ditemukan" }, { status: 404 });
    }

    if (!order.jokiDetail) {
      return NextResponse.json({ error: "JokiDetail belum ada untuk order ini" }, { status: 400 });
    }

    const updated = await prisma.jokiOrderDetail.update({
      where: { orderId: params.id },
      data: { status: jokiStatus as JokiStatus },
      select: { status: true },
    });

    return NextResponse.json({ ok: true, jokiStatus: updated.status });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
