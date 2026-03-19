import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyToken } from "@/lib/auth";

export async function POST(req: Request) {
  const { uid, token, newPassword } = await req.json();

  const userId = String(uid || "").trim();
  const t = String(token || "").trim();
  const pw = String(newPassword || "");

  if (!userId || !t) {
    return NextResponse.json({ error: "Token tidak valid" }, { status: 400 });
  }
  if (!pw || pw.length < 6) {
    return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
  }

  const now = new Date();

  // ambil token reset terbaru yang masih valid & belum dipakai
  const row = await prisma.passwordResetToken.findFirst({
    where: {
      userId,
      usedAt: null,
      expiresAt: { gt: now },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, tokenHash: true },
  });

  if (!row) {
    return NextResponse.json({ error: "Token sudah expired / tidak valid" }, { status: 400 });
  }

  const ok = await verifyToken(t, row.tokenHash);
  if (!ok) {
    return NextResponse.json({ error: "Token salah" }, { status: 400 });
  }

  const passwordHash = await hashPassword(pw);

  // update password + mark used token (transaction biar aman)
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: row.id },
      data: { usedAt: now },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
