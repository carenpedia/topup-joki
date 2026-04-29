/**
 * POST /api/checkout
 * Inti flow checkout: Validasi → Buat Order → Panggil Payment Gateway → Return payment URL
 */

export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { createTransaction as tripayCreate } from "@/lib/tripay";
import { createInvoice as xenditCreate } from "@/lib/xendit";
import { createSnapToken as midtransCreate } from "@/lib/midtrans";
import { createDuitkuInquiry as duitkuCreate } from "@/lib/duitku";
import { fulfillOrder } from "@/lib/fulfillOrder";
import crypto from "crypto";

const JWT_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || "");

function generateOrderNo(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `CP-${ts}-${rand}`;
}

async function getUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: string; role: string };
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
      paymentMethod: rawPaymentMethod,     // "CarenCoin" | "CARENCOIN" | "GATEWAY"
      methodId,          // NEW: ID from PaymentMethodFee
      voucherCode,
    } = body;

    // Normalize: frontend kirim "CarenCoin", backend butuh "CARENCOIN"
    const paymentMethod = typeof rawPaymentMethod === "string" ? rawPaymentMethod.toUpperCase() : rawPaymentMethod;

    if (!gameKey || !productId || !inputUserId || !contactWhatsapp || !paymentMethod) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const game = await prisma.game.findUnique({
      where: { key: gameKey },
      select: { id: true, name: true, targetType: true },
    });
    if (!game) return NextResponse.json({ error: "Game tidak ditemukan" }, { status: 404 });

    // Safety: Jika tipe target adalah Joki, pastikan serviceType diset JOKI_ML (manual fulfillment)
    const sType = game.targetType === "JOKI_TYPE" ? "JOKI_ML" : "TOPUP";

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { 
        prices: true, 
        flashSales: { 
          where: { isActive: true, startAt: { lte: new Date() }, endAt: { gte: new Date() } }, 
          take: 1 
        } 
      },
    });
    if (!product || !product.isActive) {
      return NextResponse.json({ error: "Produk tidak ditemukan atau tidak aktif" }, { status: 404 });
    }

    const jwtUser = await getUser();
    let audience: "PUBLIC" | "GOLD" | "SILVER" = "PUBLIC";
    let dbUser: any = null;

    if (jwtUser?.userId) {
      const u = await prisma.user.findUnique({
        where: { id: jwtUser.userId },
        select: { id: true, role: true, carencoinBalance: true, username: true, whatsapp: true },
      });
      if (u) {
        dbUser = u;
        audience = u.role as any;
      }
    }

    let priceRow = product.prices.find((p) => p.audience === audience);
    if (!priceRow) priceRow = product.prices.find((p) => p.audience === "PUBLIC");
    if (!priceRow) return NextResponse.json({ error: "Harga produk tidak ditemukan" }, { status: 400 });

    let basePrice = priceRow.price;
    let flashSaleId: string | null = null;
    let flashPriceApplied: number | null = null;

    const activeFlash = product.flashSales?.[0];
    if (activeFlash) {
      // NOTE: `maxStock` checks. If maxStock defined and soldCount >= maxStock, skip flash sale
      const isAvailable = activeFlash.maxStock === null || activeFlash.soldCount < activeFlash.maxStock;
      if (isAvailable) {
        flashSaleId = activeFlash.id;
        flashPriceApplied = activeFlash.flashPrice;
        basePrice = activeFlash.flashPrice;
      }
    }

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

    // ========== HITUNG FEE & GATEWAY ==========
    let gatewayToUse = null;
    let methodKeyToUse = null;
    let feeAmount = 0;
    let totalToPay = finalPayable;

    if (paymentMethod === "GATEWAY") {
      if (!methodId) return NextResponse.json({ error: "Pilih metode pembayaran" }, { status: 400 });
      
      const mFee = await prisma.paymentMethodFee.findUnique({ where: { id: methodId } });
      if (!mFee || !mFee.isActive) return NextResponse.json({ error: "Metode pembayaran tidak tersedia" }, { status: 400 });

      gatewayToUse = mFee.gateway;
      methodKeyToUse = mFee.methodKey;

      // Hitung fee
      let calculatedFee = mFee.feeFixed + Math.floor((finalPayable * mFee.feePercent) / 100);
      if (mFee.minFee !== null && calculatedFee < mFee.minFee) calculatedFee = mFee.minFee;
      if (mFee.maxFee !== null && calculatedFee > mFee.maxFee) calculatedFee = mFee.maxFee;
      
      feeAmount = calculatedFee;
      totalToPay = finalPayable + feeAmount;
    }

    // ========== BUAT ORDER ==========
    const orderNo = generateOrderNo();
    const order = await prisma.order.create({
      data: {
        orderNo,
        userId: dbUser?.id || null,
        serviceType: sType as any,
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
        finalPayable: totalToPay, // Store the total include fee
        paymentMethod: paymentMethod === "CARENCOIN" ? "CARENCOIN" : "GATEWAY",
        paymentGateway: gatewayToUse,
        gatewayMethodKey: methodKeyToUse,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    // ========== PROSES PEMBAYARAN ==========

    if (paymentMethod === "CARENCOIN") {
      if (!dbUser) return NextResponse.json({ error: "Anda harus login untuk bayar via Carencoin" }, { status: 401 });
      if (dbUser.carencoinBalance < finalPayable) return NextResponse.json({ error: "Saldo Carencoin tidak cukup" }, { status: 400 });

      const newBalance = dbUser.carencoinBalance - finalPayable;
      await prisma.$transaction([
        prisma.user.update({
          where: { id: dbUser.id },
          data: { carencoinBalance: { decrement: finalPayable } },
        }),
        prisma.carenCoinLedger.create({
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
          data: { status: "PAID", carencoinUsed: finalPayable, paidAt: new Date() },
        }),
      ]);

      const fulfillRes = await fulfillOrder(order.id);
      return NextResponse.json({
        ok: true,
        orderNo,
        orderId: order.id,
        paymentMethod: "CARENCOIN",
        status: "PAID",
        fulfillStatus: fulfillRes.success ? "SUCCESS" : "FAILED",
      });
    }

    // GATEWAY PATH
    if (gatewayToUse === "TRIPAY") {
      const tripayTx = await tripayCreate({
        method: methodKeyToUse!,
        merchantRef: orderNo,
        amount: totalToPay,
        customerName: dbUser?.username || "Guest",
        customerEmail: contactEmail || "guest@carenpedia.com",
        customerPhone: contactWhatsapp,
        orderItems: [{ name: `${game.name} - ${product.name}`, price: totalToPay, quantity: 1 }],
      });

      await prisma.payment.create({
        data: {
          orderId: order.id,
          gateway: "TRIPAY",
          gatewayRef: tripayTx.reference,
          status: "PENDING",
          rawPayload: tripayTx as any,
        },
      });

      return NextResponse.json({
         ok: true,
         orderNo,
         orderId: order.id,
         paymentMethod: "GATEWAY",
         gateway: "TRIPAY",
         paymentUrl: tripayTx.checkout_url,
      });
    }

    if (gatewayToUse === "XENDIT") {
       const xenditInv = await xenditCreate({
         externalId: orderNo,
         amount: totalToPay,
         customerEmail: contactEmail || "guest@carenpedia.com",
         description: `${game.name} - ${product.name}`,
       });

       await prisma.payment.create({
         data: {
           orderId: order.id,
           gateway: "XENDIT",
           gatewayRef: xenditInv.id,
           status: "PENDING",
           rawPayload: xenditInv as any,
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

    if (gatewayToUse === "MIDTRANS") {
      const midtransTx = await midtransCreate({
        orderId: orderNo,
        amount: totalToPay,
        customerName: dbUser?.username || "Guest",
        customerEmail: contactEmail || undefined,
        customerPhone: contactWhatsapp,
        itemDetails: [{ id: product.id, price: totalToPay, quantity: 1, name: `${game.name} - ${product.name}` }]
      });

      await prisma.payment.create({
        data: {
          orderId: order.id,
          gateway: "MIDTRANS",
          gatewayRef: orderNo,
          status: "PENDING",
          rawPayload: midtransTx as any,
        },
      });

      return NextResponse.json({
        ok: true,
        orderId: order.id,
        paymentMethod: "GATEWAY",
        gateway: "MIDTRANS",
        snapToken: midtransTx.token,
        paymentUrl: midtransTx.redirectUrl,
      });
    }

    if (gatewayToUse === "DUITKU") {
      const duitkuTx = await duitkuCreate({
        merchantOrderId: orderNo,
        paymentAmount: totalToPay,
        productDetails: `${game.name} - ${product.name}`,
        customerVaName: dbUser?.username || "Guest",
        email: contactEmail || "guest@carenpedia.com",
        phoneNumber: contactWhatsapp,
        paymentMethod: methodKeyToUse!,
      });

      await prisma.payment.create({
        data: {
          orderId: order.id,
          gateway: "DUITKU",
          gatewayRef: duitkuTx.reference || orderNo,
          status: "PENDING",
          rawPayload: duitkuTx as any,
        },
      });

      return NextResponse.json({
        ok: true,
        orderId: order.id,
        paymentMethod: "GATEWAY",
        gateway: "DUITKU",
        paymentUrl: duitkuTx.paymentUrl,
      });
    }

    return NextResponse.json({ error: "Gateway tidak didukung" }, { status: 400 });

  } catch (e: any) {
    console.error("Checkout Error:", e);
    return NextResponse.json({ error: e?.message || "Internal server error" }, { status: 500 });
  }
}
