import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ticketNo = params.id;

  const ticket = await prisma.supportTicket.findUnique({
    where: { ticketNo },
    include: {
      replies: {
        orderBy: { createdAt: "asc" },
      },
      user: {
         select: { username: true }
      }
    },
  });

  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ticket });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ticketNo = params.id;
  const body = await req.json();

  if (!body.status) {
     return NextResponse.json({ error: "Status required" }, { status: 400 });
  }

  try {
     const updated = await prisma.supportTicket.update({
        where: { ticketNo },
        data: { status: body.status }
     });
     
     // Log admin activity
     await prisma.adminAuditLog.create({
        data: {
           actorId: auth.session.userId,
           action: "UPDATE",
           entityType: "TICKET",
           entityId: updated.id,
           message: `Status tiket ${ticketNo} diubah menjadi ${body.status}`
        }
     });

     revalidatePath(`/admin/tickets`);
     
     return NextResponse.json({ success: true, ticket: updated });
  } catch(e) {
     return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
