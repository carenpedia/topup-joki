export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session";
import { cookies } from "next/headers";

export async function GET() {
  const token = cookies().get("session")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const s = await verifySession(token);
    
    const ledger = await prisma.carenCoinLedger.findMany({
      where: { userId: s.userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ledger });
  } catch (error: any) {
    console.error("Fetch Ledger Error:", error);
    return NextResponse.json({ error: "Gagal mengambil data riwayat" }, { status: 500 });
  }
}
