import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function toInt(v: unknown, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function toFloat(v: unknown, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const active = (searchParams.get("active") || "ALL").trim().toUpperCase();

    const where: any = {};

    if (q) {
      where.OR = [
        { methodKey: { contains: q, mode: "insensitive" } },
        { label: { contains: q, mode: "insensitive" } },
      ];
    }

    if (active === "TRUE") where.isActive = true;
    if (active === "FALSE") where.isActive = false;

    const rows = await prisma.paymentMethodFee.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        gateway: true,
        methodKey: true,
        label: true,
        feeFixed: true,
        feePercent: true,
        minFee: true,
        maxFee: true,
        isActive: true,
        sortOrder: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ rows });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Internal error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const gateway = String(body.gateway || "").trim();
    const methodKey = String(body.methodKey || "").trim();
    const label = String(body.label || "").trim();
    const feeFixed = toInt(body.feeFixed, 0);
    const feePercent = toFloat(body.feePercent, 0);
    const minFee =
      body.minFee === "" || body.minFee === null || body.minFee === undefined
        ? null
        : toInt(body.minFee, 0);
    const maxFee =
      body.maxFee === "" || body.maxFee === null || body.maxFee === undefined
        ? null
        : toInt(body.maxFee, 0);
    const isActive = Boolean(body.isActive ?? true);
    const sortOrder = toInt(body.sortOrder, 0);

    if (!gateway || (gateway !== "XENDIT" && gateway !== "TRIPAY")) {
      return NextResponse.json({ error: "Gateway wajib diisi (XENDIT / TRIPAY)" }, { status: 400 });
    }

    if (!methodKey) {
      return NextResponse.json({ error: "Method key wajib diisi" }, { status: 400 });
    }

    if (!label) {
      return NextResponse.json({ error: "Label wajib diisi" }, { status: 400 });
    }

    if (feeFixed < 0) {
      return NextResponse.json({ error: "Fee fixed tidak boleh negatif" }, { status: 400 });
    }

    if (feePercent < 0) {
      return NextResponse.json({ error: "Fee percent tidak boleh negatif" }, { status: 400 });
    }

    if (minFee !== null && minFee < 0) {
      return NextResponse.json({ error: "Min fee tidak boleh negatif" }, { status: 400 });
    }

    if (maxFee !== null && maxFee < 0) {
      return NextResponse.json({ error: "Max fee tidak boleh negatif" }, { status: 400 });
    }

    const exists = await prisma.paymentMethodFee.findUnique({
      where: { gateway_methodKey: { gateway: gateway as any, methodKey } },
      select: { id: true },
    });

    if (exists) {
      return NextResponse.json({ error: "Kombinasi gateway + method key sudah dipakai" }, { status: 409 });
    }

    const row = await prisma.paymentMethodFee.create({
      data: {
        gateway: gateway as any,
        methodKey,
        label,
        feeFixed,
        feePercent,
        minFee,
        maxFee,
        isActive,
        sortOrder,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: row.id });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Gagal membuat payment method fee" },
      { status: 500 }
    );
  }
}