/**
 * POST /api/checkout
 * Inti flow checkout: Validasi → Buat Order → Panggil Payment Gateway → Return payment URL
 * 
 * Body: {
 *   gameKey, productId, inputUserId, inputServer?,
 *   contactWhatsapp, contactEmail?,
 *   paymentMethod: "CARENCOIN" | "GATEWAY",
 *   paymentGateway?: "TRIPAY" | "XENDIT",
 *   gatewayMethodKey?: "QRIS" | "BRIVA" | ...
 *   voucherCode?,
 * }
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { createTransaction as tripayCreate } from "@/lib/tripay";
import { createInvoice as xenditCreate } from "@/lib/xendit";
import { fulfillOrder } from "@/lib/fulfillOrder";
import crypto from "crypto";

const JWT_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || "");

// Helper: generate orderNo unik
function generateOrderNo(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `CP-${ts}-${rand}`;
}

// Helper: get user from JWT cookie
async function getUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { id: string; role: string };
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      gameKey,
      productId,
      inputUserId,
      inputServer,
      contactWhatsapp,
      contactEmail,
      paymentMethod,     // "CARENCOIN" | "GATEWAY"
      paymentGateway,    // "TRIPAY" | "XENDIT"
      gatewayMethodKey,  // Channel code: "QRIS", "BRIVA", "OVO", etc.
      voucherCode,
    } = body;

    // ========== VALIDASI ==========

    if (!gameKey || !productId || !inputUserId || !contactWhatsapp || !paymentMethod) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // Ambil game
    const game = await prisma.game.findUnique({
      where: { key: gameKey },
      select: { id: true, name: true },
    });
    if (!game) {
      return NextResponse.json({ error: "Game tidak ditemukan" }, { status: 404 });
    }

    // Ambil product
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { prices: true, flashSales: { where: { isActive: true, startAt: { lte: new Date() }, endAt: { gte: new Date() } }, take: 1 } },
    });
    if (!product || !product.isActive) {
      return NextResponse.json({ error: "Produk tidak ditemukan atau tidak aktif" }, { status: 404 });
    }

    // Tentukan audience dan harga
    const jwtUser = await getUser();
    let audience: "PUBLIC" | "MEMBER" | "RESELLER" = "PUBLIC";
    let dbUser: { id: string; role: string; carencoinBalance: number; username: string; whatsapp: string } | null = null;

    if (jwtUser?.id) {
      const u = await prisma.user.findUnique({
        where: { id: jwtUser.id },
        select: { id: true, role: true, carencoinBalance: true, username: true, whatsapp: true },
      });
      if (u) {
        dbUser = u;
        audience = u.role === "RESELLER" ? "RESELLER" : "MEMBER";
      }
    }

    // Cari harga sesuai audience (fallback ke PUBLIC jika tidak ada)
    let priceRow = product.prices.find((p) => p.audience === audience);
    if (!priceRow) priceRow = product.prices.find((p) => p.audience === "PUBLIC");
    if (!priceRow) {
      return NextResponse.json({ error: "Harga produk tidak ditemukan" }, { status: 400 });
    }

    let basePrice = priceRow.price;
    let flashSaleId: string | null = null;
    let flashPriceApplied: number | null = null;

    // Flash sale check
    const activeFlash = product.flashSales?.[0];
    if (activeFlash) {
      flashSaleId = activeFlash.id;
      flashPriceApplied = activeFlash.flashPrice;
      basePrice = activeFlash.flashPrice;
    }

    // Voucher (basic implementation)
    let voucherId: string | null = null;
    let voucherDiscount = 0;
    if (voucherCode) {
      const voucher = await prisma.voucher.findUnique({ where: { code: voucherCode } });
      if (voucher && voucher.isActive) {
        if (voucher.discountType === "PERCENT") {
          voucherDiscount = Math.floor((basePrice * voucher.discountValue) / 100);
          if (voucher.maxDiscount && voucherDiscount > voucher.maxDiscount) {
            voucherDiscount = voucher.maxDiscount;
          }
        } else {
          voucherDiscount = voucher.discountValue;
        }
        voucherId = voucher.id;
      }
    }

    const finalPayable = Math.max(basePrice - voucherDiscount, 0);

    // ========== BUAT ORDER ==========

    const orderNo = generateOrderNo();

    const order = await prisma.order.create({
      data: {
        orderNo,
        userId: dbUser?.id || null,
        serviceType: "TOPUP",
        status: "PENDING_PAYMENT",
        gameId: game.id,
        productId: product.id,
        inputUserId,
        inputServer: inputServer || null,
        contactWhatsapp,
        contactEmail: contactEmail || null,
        voucherId,
        voucherDiscount,
        flashSaleId,
        flashPriceApplied,
        basePrice,
        finalPayable,
        paymentMethod: paymentMethod === "CARENCOIN" ? "CARENCOIN" : "GATEWAY",
        paymentGateway: paymentMethod === "GATEWAY" ? (paymentGateway || "TRIPAY") : null,
        gatewayMethodKey: paymentMethod === "GATEWAY" ? (gatewayMethodKey || null) : null,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 jam
      },
    });

    // ========== PROSES PEMBAYARAN ==========

    // Jalur A: Carencoin (potong saldo langsung)
    if (paymentMethod === "CARENCOIN") {
      if (!dbUser) {
        return NextResponse.json({ error: "Anda harus login untuk bayar via Carencoin" }, { status: 401 });
      }
      if (dbUser.carencoinBalance < finalPayable) {
        return NextResponse.json({ error: "Saldo Carencoin tidak cukup" }, { status: 400 });
      }

      // Potong saldo atomik
      const newBalance = dbUser.carencoinBalance - finalPayable;
      await prisma.$transaction([
        prisma.user.update({
          where: { id: dbUser.id },
          data: { carencoinBalance: { decrement: finalPayable } },
        }),
        prisma.carencoinLedger.create({
          data: {
            userId: dbUser.id,
            type: "PAYMENT",
            amount: -finalPayable,
            balanceAfter: newBalance,
            reason: `Pembayaran order ${orderNo}`,
            refOrderId: order.id,
          },
        }),
        prisma.order.update({
          where: { id: order.id },
          data: {
            status: "PAID",
            carencoinUsed: finalPayable,
            paidAt: new Date(),
          },
        }),
      ]);

      // Langsung trigger fulfillment (Digiflazz topup)
      const fulfillResult = await fulfillOrder(order.id);

      return NextResponse.json({
        ok: true,
        orderNo,
        orderId: order.id,
        paymentMethod: "CARENCOIN",
        message: fulfillResult.message,
        redirectUrl: `/invoice/${orderNo}`,
      });
    }

    // Jalur B: Payment Gateway (Tripay / Xendit)
    if (paymentGateway === "TRIPAY") {
      const tripayTx = await tripayCreate({
        method: gatewayMethodKey || "QRIS",
        merchantRef: orderNo,
        amount: finalPayable,
        customerName: dbUser?.username || "Guest",
        customerEmail: contactEmail || "",
        customerPhone: contactWhatsapp,
        orderItems: [
          {
            sku: product.providerSku,
            name: `${game.name} - ${product.name}`,
            price: finalPayable,
            quantity: 1,
          },
        ],
      });

      // Simpan Payment record
      await prisma.payment.create({
        data: {
          orderId: order.id,
          gateway: "TRIPAY",
          gatewayRef: tripayTx.reference,
          status: "PENDING",
          rawPayload: tripayTx as unknown as Record<string, unknown>,
        },
      });

      return NextResponse.json({
        ok: true,
        orderNo,
        orderId: order.id,
        paymentMethod: "GATEWAY",
        gateway: "TRIPAY",
        paymentUrl: tripayTx.checkout_url,
        payCode: tripayTx.pay_code,
        qrUrl: tripayTx.qr_url,
        expiry: tripayTx.expired_time,
      });
    }

    if (paymentGateway === "XENDIT") {
      const xenditInv = await xenditCreate({
        externalId: orderNo,
        amount: finalPayable,
        description: `${game.name} - ${product.name}`,
        customerName: dbUser?.username || "Guest",
        customerEmail: contactEmail || undefined,
        customerPhone: contactWhatsapp,
      });

      // Simpan Payment record
      await prisma.payment.create({
        data: {
          orderId: order.id,
          gateway: "XENDIT",
          gatewayRef: xenditInv.id,
          status: "PENDING",
          rawPayload: xenditInv as unknown as Record<string, unknown>,
        },
      });

      return NextResponse.json({
        ok: true,
        orderNo,
        orderId: order.id,
        paymentMethod: "GATEWAY",
        gateway: "XENDIT",
        paymentUrl: xenditInv.invoice_url,
        expiry: xenditInv.expiry_date,
      });
    }

    return NextResponse.json({ error: "Gateway tidak didukung" }, { status: 400 });
  } catch (error: any) {
    console.error("[checkout] Error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
