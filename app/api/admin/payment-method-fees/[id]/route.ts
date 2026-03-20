export const dynamic = 'force-dynamic';
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

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const row = await prisma.paymentMethodFee.findUnique({
      where: { id: params.id },
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
        updatedAt: true,
      },
    });

    if (!row) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ row });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Internal error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
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

    const exists = await prisma.paymentMethodFee.findFirst({
      where: {
        gateway: gateway as any,
        methodKey,
        NOT: { id: params.id },
      },
      select: { id: true },
    });

    if (exists) {
      return NextResponse.json({ error: "Kombinasi gateway + method key sudah dipakai" }, { status: 409 });
    }

    const row = await prisma.paymentMethodFee.update({
      where: { id: params.id },
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

    return NextResponse.json({ ok: true, row });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Gagal update payment method fee" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.paymentMethodFee.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Gagal hapus payment method fee" },
      { status: 500 }
    );
  }
}