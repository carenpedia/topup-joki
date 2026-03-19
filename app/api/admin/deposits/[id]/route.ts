import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const row = await prisma.deposit.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        amount: true,
        channel: true,
        gateway: true,
        gatewayRef: true,
        status: true,
        proofImageUrl: true,
        adminNote: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { id: true, username: true, whatsapp: true } },
      },
    });

    if (!row) {
      return NextResponse.json(
        { error: "Deposit tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      row: {
        id: row.id,
        user: row.user?.username || "-",
        userId: row.user?.id || "-",
        userWhatsapp: row.user?.whatsapp || "-",
        amount: row.amount,
        channel: row.channel,
        gateway: row.gateway || "-",
        gatewayRef: row.gatewayRef || "-",
        status: row.status,
        proofImageUrl: row.proofImageUrl || null,
        adminNote: row.adminNote || "",
        createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : null,
        updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : null,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Internal error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json().catch(() => ({}));
    const nextStatus = String(body?.status || "").toUpperCase();
    const adminNote = body?.adminNote !== undefined ? String(body.adminNote) : undefined;

    const validStatuses = ["APPROVED", "REJECTED", "CANCELLED"];
    if (!validStatuses.includes(nextStatus)) {
      return NextResponse.json(
        { error: `Status tidak valid. Harus salah satu dari: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const deposit = await prisma.deposit.findUnique({
      where: { id: params.id },
      select: { id: true, status: true, userId: true, amount: true },
    });

    if (!deposit) {
      return NextResponse.json(
        { error: "Deposit tidak ditemukan" },
        { status: 404 }
      );
    }

    // Hanya bisa update dari PENDING atau PAID
    if (deposit.status !== "PENDING" && deposit.status !== "PAID") {
      return NextResponse.json(
        {
          error: `Tidak bisa update. Status sekarang: ${deposit.status}`,
        },
        { status: 409 }
      );
    }

    const data: any = {
      status: nextStatus as any,
    };

    if (adminNote !== undefined) {
      data.adminNote = adminNote;
    }

    // Jika APPROVED, tambahkan saldo CarenCoin ke user
    if (nextStatus === "APPROVED") {
      // Update saldo user dan buat ledger entry dalam satu transaksi
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
          where: { id: deposit.userId },
          select: { carencoinBalance: true },
        });

        if (!user) throw new Error("User tidak ditemukan");

        const newBalance = user.carencoinBalance + deposit.amount;

        // Update saldo user
        await tx.user.update({
          where: { id: deposit.userId },
          data: { carencoinBalance: newBalance },
        });

        // Buat ledger entry
        await tx.carenCoinLedger.create({
          data: {
            userId: deposit.userId,
            type: "DEPOSIT",
            amount: deposit.amount,
            balanceAfter: newBalance,
            reason: `Deposit #${deposit.id} diapprove`,
            refDepositId: deposit.id,
          },
        });

        // Update status deposit
        const updated = await tx.deposit.update({
          where: { id: deposit.id },
          data,
          select: { id: true, status: true },
        });

        return updated;
      });

      return NextResponse.json({ ok: true, row: result });
    }

    // Untuk REJECTED atau CANCELLED, langsung update status
    const updated = await prisma.deposit.update({
      where: { id: deposit.id },
      data,
      select: { id: true, status: true },
    });

    return NextResponse.json({ ok: true, row: updated });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Internal error" },
      { status: 500 }
    );
  }
}
