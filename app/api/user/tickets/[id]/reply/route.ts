import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(req.url);
  const wa = searchParams.get("wa");
  const auth = await requireUser();

  const ticketNo = params.id;
  const body = await req.json();
  const message = String(body.message || "").trim();

  if (!message) {
    return NextResponse.json({ error: "Pesan tidak boleh kosong." }, { status: 400 });
  }

  const ticket = await prisma.supportTicket.findUnique({
    where: { ticketNo },
  });

  if (!ticket) {
    return NextResponse.json({ error: "Tiket tidak ditemukan." }, { status: 404 });
  }

  // Security Check
  const isGuestVerified = wa && ticket.contactWa === wa;
  const isMemberVerified = auth.ok && ticket.userId === auth.session.userId;

  if (!isGuestVerified && !isMemberVerified) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  if (ticket.status === "CLOSED") {
    return NextResponse.json({ error: "Tiket telah ditutup dan tidak dapat menerima balasan baru." }, { status: 400 });
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Tambah balasan
      const reply = await tx.ticketReply.create({
        data: {
          ticketId: ticket.id,
          userId: auth.ok ? auth.session.userId : null,
          message: message,
          isAdmin: false,
          isSystem: false,
        },
      });

      // 2. Ubah status tiket jadi CUSTOMER_REPLY (agar admin notice)
      await tx.supportTicket.update({
        where: { id: ticket.id },
        data: { status: "CUSTOMER_REPLY" },
      });

      return reply;
    });

    return NextResponse.json({ success: true, reply: updated });
  } catch (err) {
    console.error("[TicketReplyError]", err);
    return NextResponse.json({ error: "Gagal mengirim balasan." }, { status: 500 });
  }
}
