import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  let whereObj: any = {};
  if (search) {
    whereObj = {
      OR: [
        { ticketNo: { contains: search } },
        { contactWa: { contains: search } },
        { orderId: { contains: search } },
      ],
    };
  }

  const items = await prisma.supportTicket.findMany({
    where: whereObj,
    orderBy: { updatedAt: "desc" },
    include: {
       user: { select: { username: true } }
    }
  });

  return NextResponse.json({ items });
}
