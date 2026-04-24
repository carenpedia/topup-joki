/**
 * POST /api/checkout/joki
 * Checkout order joki (manual — tidak ada fulfillment otomatis ke provider)
 *
 * Body: {
 *   gameKey, productId?,
 *   contactWhatsapp, contactEmail?,
 *   paymentMethod: "CARENCOIN" | "GATEWAY",
 *   paymentGateway?: "TRIPAY" | "XENDIT",
 *   gatewayMethodKey?: "QRIS" | "BRIVA" | ...
 *   loginVia: "MOONTON" | "GOOGLE" | "FACEBOOK" | "VK" | "TIKTOK" | "TELEGRAM",
 *   userIdNickname: string,
 *   loginId: string,
 *   password: string,
 *   noteForJoki?: string,
 *   heroes?: string[],
 *   finalPayable: number,  // harga yang disepakati (dari product atau custom)
 * }
 */

export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { createTransaction as tripayCreate } from "@/lib/tripay";
import { createInvoice as xenditCreate } from "@/lib/xendit";
import crypto from "crypto";

const JWT_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || "");

const VALID_LOGIN_VIA = ["MOONTON", "GOOGLE", "FACEBOOK", "VK", "TIKTOK", "TELEGRAM"] as const;
type JokiLoginVia = (typeof VALID_LOGIN_VIA)[number];

function generateOrderNo(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `JK-${ts}-${rand}`;
}

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
      contactWhatsapp,
      contactEmail,
      paymentMethod,
      methodId,
      loginVia,
      userIdNickname,
      loginId,
      password,
      noteForJoki,
      heroes,
      finalPayable: finalPayableRaw,
      quantity: quantityRaw,
    } = body;

    const quantity = Math.max(1, Math.floor(Number(quantityRaw) || 1));

    // ========== VALIDASI ==========
    if (!gameKey || !contactWhatsapp || !paymentMethod) {
      return NextResponse.json({ error: "gameKey, contactWhatsapp, paymentMethod wajib diisi" }, { status: 400 });
    }
    if (!loginVia || !VALID_LOGIN_VIA.includes(loginVia as JokiLoginVia)) {
      return NextResponse.json(
        { error: `loginVia harus salah satu: ${VALID_LOGIN_VIA.join(", ")}` },
        { status: 400 }
      );
    }
    if (!userIdNickname || !loginId || !password) {
      return NextResponse.json({ error: "userIdNickname, loginId, password wajib diisi" }, { status: 400 });
    }

    // Ambil game
    const game = await prisma.game.findUnique({
      where: { key: gameKey },
      select: { id: true, name: true },
    });
    if (!game) {
      return NextResponse.json({ error: "Game tidak ditemukan" }, { status: 404 });
    }

    // Tentukan harga — dari product jika ada, atau dari body (custom)
    const jwtUser = await getUser();
    let dbUser: { id: string; role: string; carencoinBalance: number; username: string; whatsapp: string } | null = null;

    if (jwtUser?.id) {
      const u = await prisma.user.findUnique({
        where: { id: jwtUser.id },
        select: { id: true, role: true, carencoinBalance: true, username: true, whatsapp: true },
      });
      if (u) dbUser = u;
    }

    let basePrice = 0;
    let resolvedProductId: string | null = null;

    if (productId) {
      const audience = dbUser
        ? dbUser.role === "RESELLER" ? "RESELLER" : "MEMBER"
        : "PUBLIC";

      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { prices: true },
      });
      if (!product || !product.isActive) {
        return NextResponse.json({ error: "Produk tidak ditemukan atau tidak aktif" }, { status: 404 });
      }
      let priceRow = product.prices.find((p) => p.audience === audience);
      if (!priceRow) priceRow = product.prices.find((p) => p.audience === "PUBLIC");
      if (!priceRow) {
        return NextResponse.json({ error: "Harga produk tidak ditemukan" }, { status: 400 });
      }
      basePrice = priceRow.price * quantity;
      resolvedProductId = product.id;
    } else if (typeof finalPayableRaw === "number" && finalPayableRaw > 0) {
      basePrice = Math.floor(finalPayableRaw) * quantity;
    } else {
      return NextResponse.json({ error: "productId atau finalPayable harus diisi" }, { status: 400 });
    }

    // ========== HITUNG FEE & GATEWAY ==========
    let gatewayToUse = null;
    let methodKeyToUse = null;
    let feeAmount = 0;
    let totalToPay = basePrice;

    if (paymentMethod === "GATEWAY") {
      if (!methodId) return NextResponse.json({ error: "Pilih metode pembayaran" }, { status: 400 });
      
      const mFee = await prisma.paymentMethodFee.findUnique({ where: { id: methodId } });
      if (!mFee || !mFee.isActive) return NextResponse.json({ error: "Metode pembayaran tidak tersedia" }, { status: 400 });

      gatewayToUse = mFee.gateway;
      methodKeyToUse = mFee.methodKey;

      // Hitung fee
      let calculatedFee = mFee.feeFixed + Math.floor((basePrice * mFee.feePercent) / 100);
      if (mFee.minFee !== null && calculatedFee < mFee.minFee) calculatedFee = mFee.minFee;
      if (mFee.maxFee !== null && calculatedFee > mFee.maxFee) calculatedFee = mFee.maxFee;
      
      feeAmount = calculatedFee;
      totalToPay = basePrice + feeAmount;
    }

    const finalPayable = totalToPay;
    const heroList: string[] = Array.isArray(heroes) ? heroes.filter((h) => typeof h === "string" && h.trim()) : [];

    // ========== BUAT ORDER ==========
    const orderNo = generateOrderNo();

    const order = await prisma.order.create({
      data: {
        orderNo,
        userId: dbUser?.id || null,
        serviceType: "JOKI_ML",
        status: "PENDING_PAYMENT",
        gameId: game.id,
        productId: resolvedProductId,
        contactWhatsapp,
        contactEmail: contactEmail || null,
        basePrice,
        finalPayable,
        gatewayFeeApplied: feeAmount,
        paymentMethod: paymentMethod === "CARENCOIN" ? "CARENCOIN" : "GATEWAY",
        paymentGateway: gatewayToUse,
        gatewayMethodKey: methodKeyToUse,
        quantity,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        jokiDetail: {
          create: {
            loginVia: loginVia as JokiLoginVia,
            userIdNickname,
            loginId,
            password,
            noteForJoki: noteForJoki || null,
            status: "PENDING",
            heroRequests: {
              create: heroList.map((hero) => ({ hero: hero.trim() })),
            },
          },
        },
      },
    });

    // ========== PROSES PEMBAYARAN ==========

    // Jalur A: CarenCoin
    if (paymentMethod === "CARENCOIN") {
      if (!dbUser) {
        return NextResponse.json({ error: "Harus login untuk bayar via CarenCoin" }, { status: 401 });
      }
      if (dbUser.carencoinBalance < finalPayable) {
        return NextResponse.json({ error: "Saldo CarenCoin tidak cukup" }, { status: 400 });
      }

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
            reason: `Pembayaran joki order ${orderNo}`,
            refOrderId: order.id,
          },
        }),
        prisma.order.update({
          where: { id: order.id },
          data: { status: "PAID", carencoinUsed: finalPayable, paidAt: new Date() },
        }),
      ]);

      return NextResponse.json({
        ok: true,
        orderNo,
        orderId: order.id,
        paymentMethod: "CARENCOIN",
        message: "Order joki berhasil dibuat. Admin akan segera memproses.",
        redirectUrl: `/invoice/${orderNo}`,
      });
    }

    // Jalur B: Tripay
    if (gatewayToUse === "TRIPAY") {
      const tripayTx = await tripayCreate({
        method: methodKeyToUse || "QRIS",
        merchantRef: orderNo,
        amount: finalPayable,
        customerName: dbUser?.username || "Guest",
        customerEmail: contactEmail || "",
        customerPhone: contactWhatsapp,
        orderItems: [
          {
            name: `Joki ${game.name}${quantity > 1 ? " x" + quantity : ""}`,
            price: finalPayable,
            quantity: 1,
          },
        ],
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
        payCode: tripayTx.pay_code,
        qrUrl: tripayTx.qr_url,
        expiry: tripayTx.expired_time,
      });
    }

    // Jalur C: Xendit
    if (gatewayToUse === "XENDIT") {
      const xenditInv = await xenditCreate({
        externalId: orderNo,
        amount: finalPayable,
        description: `Joki ${game.name}`,
        customerName: dbUser?.username || "Guest",
        customerEmail: contactEmail || undefined,
        customerPhone: contactWhatsapp,
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

    return NextResponse.json({ error: "Gateway tidak didukung" }, { status: 400 });
  } catch (error: any) {
    console.error("[checkout/joki] Error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
