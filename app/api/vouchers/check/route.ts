import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { code, basePrice } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Masukkan kode voucher" }, { status: 400 });
    }

    const voucher = await prisma.voucher.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!voucher) {
      return NextResponse.json({ error: "Kode voucher tidak valid" }, { status: 404 });
    }

    if (!voucher.isActive) {
      return NextResponse.json({ error: "Voucher sudah tidak aktif" }, { status: 400 });
    }

    let discount = 0;
    if (voucher.discountType === "PERCENT") {
      discount = Math.floor((basePrice * voucher.discountValue) / 100);
      if (voucher.maxDiscount && discount > voucher.maxDiscount) {
        discount = voucher.maxDiscount;
      }
    } else {
      discount = voucher.discountValue;
    }

    return NextResponse.json({
      ok: true,
      code: voucher.code,
      discount,
      message: `Berhasil! Potongan ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(discount)}`,
    });
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengecek voucher" }, { status: 500 });
  }
}
