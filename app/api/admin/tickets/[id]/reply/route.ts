import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ticketNo = params.id;
  const body = await req.json();
  const message = String(body.message || "").trim();

  if (!message) {
    return NextResponse.json({ error: "Pesan kosong" }, { status: 400 });
  }

  const ticket = await prisma.supportTicket.findUnique({
    where: { ticketNo },
  });

  if (!ticket) {
    return NextResponse.json({ error: "Tiket tidak ditemukan." }, { status: 404 });
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Tambah balasan admin
      const reply = await tx.ticketReply.create({
        data: {
          ticketId: ticket.id,
          userId: auth.session.userId,
          message: message,
          isAdmin: true,
          isSystem: false,
        },
      });

      // 2. Ubah status tiket jadi ANSWERED
      await tx.supportTicket.update({
        where: { id: ticket.id },
        data: { status: "ANSWERED" },
      });

      return reply;
    });

    return NextResponse.json({ success: true, reply: updated });
  } catch (err) {
    console.error("[AdminTicketReplyError]", err);
    return NextResponse.json({ error: "Gagal membalas." }, { status: 500 });
  }
}
