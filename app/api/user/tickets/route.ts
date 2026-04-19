import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/admin";

function generateTicketNo() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'TKT-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) {
    // If not logged in, return empty, since guests track tickets explicitly via ID
    return NextResponse.json({ items: [] });
  }

  const items = await prisma.supportTicket.findMany({
    where: { userId: auth.session.userId },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const auth = await requireUser();
  const body = await req.json();

  const title = String(body.title || "").trim();
  const topic = String(body.topic || "").trim();
  const orderId = body.orderId ? String(body.orderId).trim() : null;
  const message = String(body.message || "").trim();
  const contactWa = String(body.contactWa || "").trim();

  if (!title || !topic || !message) {
    return NextResponse.json({ error: "Judul, Topik, dan Pesan wajib diisi!" }, { status: 400 });
  }

  if (!auth.ok && !contactWa) {
    return NextResponse.json({ error: "Pelanggan Tamu wajib mengisi Nomor WhatsApp!" }, { status: 400 });
  }

  const ticketNo = generateTicketNo();
  const userId = auth.ok ? auth.session.userId : null;

  // Create Ticket & Automated Reply via transaction
  try {
    const ticket = await prisma.$transaction(async (tx) => {
      // Lookup actual internal ID of the order if orderId (orderNo) is provided
      let actualOrderId = null;
      if (orderId) {
        const foundOrder = await tx.order.findUnique({
          where: { orderNo: orderId }
        });
        actualOrderId = foundOrder ? foundOrder.id : null;
      }

      const newTicket = await tx.supportTicket.create({
        data: {
          ticketNo,
          topic,
          title,
          userId,
          contactWa: contactWa || null,
          orderId: actualOrderId,
          status: "OPEN",
        },
      });

      // 1. First initial user message
      await tx.ticketReply.create({
        data: {
          ticketId: newTicket.id,
          userId: userId,
          message: message,
          isAdmin: false,
          isSystem: false,
        },
      });

      // 2. Automated Custom Reply Logic based on Topic
      let autoReplyMessage = "Halo! Laporan Anda telah kami terima dengan baik. Mohon menunggu sebentar, tim kami akan segera membalas tiket ini. 🙏";
      
      if (topic === "Topup Belum Masuk") {
        autoReplyMessage = "Sistem kami mendeteksi laporan terkait 'Topup Belum Masuk'. Jika Anda transfer secara manual, silakan unggah / tuliskan detail bukti transfer Anda di sini untuk mempermudah pengecekan oleh Admin. Mohon bersabar, ya!";
      } else if (topic === "Proses Joki Lama") {
        autoReplyMessage = "Sistem kami mencatat keluhan pesanan Joki Anda. Biasanya ini diakibatkan pergantian jadwal joki. Admin akan segera memberikan laporan progres langsung di sini!";
      } else if (topic === "Gagal Pembayaran") {
        autoReplyMessage = "Pembayaran dinyatakan gagal jika melewati masa berlaku invoice. Apakah saldo Anda terpotong? Informasikan lebih lanjut agar Admin bisa meneruskannya ke Gateway!";
      }

      await tx.ticketReply.create({
        data: {
          ticketId: newTicket.id,
          userId: null,
          message: autoReplyMessage,
          isAdmin: true,
          isSystem: true,
        },
      });

      return newTicket;
    });

    return NextResponse.json({ success: true, ticket });
  } catch (err: any) {
    console.error("[CreateTicketError]", err);
    return NextResponse.json({ error: "Gagal membuat tiket bantuan: " + err.message }, { status: 500 });
  }
}
