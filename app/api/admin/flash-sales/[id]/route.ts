import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function toInt(v: any, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const row = await prisma.flashSale.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        productId: true,
        flashPrice: true,
        startAt: true,
        endAt: true,
        isActive: true,
        maxStock: true,
        soldCount: true,
        createdAt: true,
        updatedAt: true,
        product: {
          select: {
            id: true,
            name: true,
            gameId: true,
            game: { select: { id: true, name: true, key: true } },
          },
        },
      },
    });

    if (!row)
      return NextResponse.json(
        { error: "Flash sale tidak ditemukan" },
        { status: 404 }
      );

    return NextResponse.json({
      row: {
        id: row.id,
        productId: row.productId,
        product: row.product?.name || "-",
        gameId: row.product?.gameId || "",
        game: row.product?.game?.name || row.product?.game?.key || "-",
        flashPrice: row.flashPrice,
        startAt: row.startAt.toISOString(),
        endAt: row.endAt.toISOString(),
        isActive: row.isActive,
        maxStock: row.maxStock,
        soldCount: row.soldCount,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      },
    });
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

    const productId =
      body.productId !== undefined
        ? String(body.productId || "").trim()
        : undefined;
    const flashPrice =
      body.flashPrice !== undefined ? toInt(body.flashPrice) : undefined;
    const startAtRaw =
      body.startAt !== undefined ? String(body.startAt).trim() : undefined;
    const endAtRaw =
      body.endAt !== undefined ? String(body.endAt).trim() : undefined;
    const isActive =
      body.isActive !== undefined ? Boolean(body.isActive) : undefined;
    const maxStockRaw = body.maxStock;

    const data: any = {};

    if (productId !== undefined) {
      if (!productId)
        return NextResponse.json(
          { error: "Product wajib dipilih" },
          { status: 400 }
        );

      const p = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, isActive: true },
      });
      if (!p)
        return NextResponse.json(
          { error: "Product tidak ditemukan" },
          { status: 404 }
        );
      if (!p.isActive)
        return NextResponse.json(
          { error: "Product tidak aktif" },
          { status: 409 }
        );

      data.productId = productId;
    }

    if (flashPrice !== undefined) {
      if (!flashPrice || flashPrice < 1) {
        return NextResponse.json(
          { error: "Flash price harus > 0" },
          { status: 400 }
        );
      }
      data.flashPrice = flashPrice;
    }

    if (startAtRaw !== undefined) {
      const d = new Date(startAtRaw);
      if (Number.isNaN(d.getTime()))
        return NextResponse.json(
          { error: "StartAt tidak valid" },
          { status: 400 }
        );
      data.startAt = d;
    }

    if (endAtRaw !== undefined) {
      const d = new Date(endAtRaw);
      if (Number.isNaN(d.getTime()))
        return NextResponse.json(
          { error: "EndAt tidak valid" },
          { status: 400 }
        );
      data.endAt = d;
    }

    if (data.startAt && data.endAt && data.endAt <= data.startAt) {
      return NextResponse.json(
        { error: "End harus lebih besar dari Start" },
        { status: 400 }
      );
    }

    if (isActive !== undefined) data.isActive = isActive;

    if (maxStockRaw !== undefined) {
      data.maxStock = maxStockRaw && toInt(maxStockRaw, 0) > 0 ? toInt(maxStockRaw, 0) : null;
    }

    const updated = await prisma.flashSale.update({
      where: { id: params.id },
      data,
      select: {
        id: true,
        productId: true,
        isActive: true,
        flashPrice: true,
        startAt: true,
        endAt: true,
      },
    });

    return NextResponse.json({ ok: true, row: updated });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Gagal update flash sale" },
      { status: 500 }
    );
  }
}

// “Delete” versi aman = nonaktifkan
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const updated = await prisma.flashSale.update({
      where: { id: params.id },
      data: { isActive: false },
      select: { id: true, isActive: true },
    });

    return NextResponse.json({ ok: true, row: updated });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Gagal menonaktifkan flash sale" },
      { status: 500 }
    );
  }
}