import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/admin";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(req.url);
  const wa = searchParams.get("wa");
  const auth = await requireUser();

  const ticketNo = params.id;

  const ticket = await prisma.supportTicket.findUnique({
    where: { ticketNo },
    include: {
      replies: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!ticket) {
    return NextResponse.json({ error: "Tiket tidak ditemukan." }, { status: 404 });
  }

  const isGuestVerified = wa && ticket.contactWa === wa;
  const isMemberVerified = auth.ok && ticket.userId === auth.session.userId;

  if (!isGuestVerified && !isMemberVerified) {
    return NextResponse.json({ error: "Akses ditolak. Nomor WhatsApp atau Sesi tidak cocok dengan pemilik tiket ini." }, { status: 403 });
  }

  return NextResponse.json({ ticket });
}
