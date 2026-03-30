export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session";
import { cookies } from "next/headers";

type Params = { params: { id: string } };

export async function POST(req: Request, { params }: Params) {
  const token = cookies().get("session")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const s = await verifySession(token);
    if (s.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { amount, reason } = await req.json();
    const balanceChange = parseInt(amount);

    if (isNaN(balanceChange)) {
      return NextResponse.json({ error: "Jumlah tidak valid" }, { status: 400 });
    }

    const currentTarget = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, carencoinBalance: true, username: true }
    });

    if (!currentTarget) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    const nextBalance = currentTarget.carencoinBalance + balanceChange;
    if (nextBalance < 0) {
      return NextResponse.json({ error: "Saldo tidak boleh negatif" }, { status: 400 });
    }

    // Atomic transaction for balance, ledger, and audit log
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: params.id },
        data: { carencoinBalance: nextBalance },
        select: { id: true, carencoinBalance: true }
      });

      await tx.carenCoinLedger.create({
        data: {
          userId: params.id,
          type: "ADJUST",
          amount: balanceChange,
          balanceAfter: nextBalance,
          reason: reason || "Manual Adjustment by Admin",
        }
      });

      await tx.adminAuditLog.create({
        data: {
          actorId: s.userId,
          action: "UPDATE",
          entityType: "USER_BALANCE",
          entityId: params.id,
          message: `Manual balance adjustment for ${currentTarget.username}: ${balanceChange > 0 ? "+" : ""}${balanceChange}`,
          meta: { 
            oldBalance: currentTarget.carencoinBalance, 
            newBalance: nextBalance, 
            reason: reason 
          }
        }
      });

      return updated;
    });

    return NextResponse.json({ ok: true, balance: result.carencoinBalance });

  } catch (error: any) {
    console.error("Manual Balance Update Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update balance" }, { status: 500 });
  }
}
