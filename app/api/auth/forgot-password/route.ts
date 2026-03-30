export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashToken, randomToken } from "@/lib/auth";

// Struktur: user isi username/whatsapp (karena schema kamu pakai username + whatsapp)
export async function POST(req: Request) {
  const { username, whatsapp } = await req.json();

  const uName = String(username || "").trim();
  const wa = String(whatsapp || "").trim();

  // Response dibuat "aman": jangan bocorin apakah user ada atau tidak
  if (!uName || !wa) {
    return NextResponse.json({ ok: true });
  }

  const user = await prisma.user.findFirst({
    where: { username: uName, whatsapp: wa },
    select: { id: true, status: true },
  });

  // tetap balikin ok true biar tidak bisa enumeration
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ ok: true });
  }

  // buat token + simpan hash
  const token = randomToken(50);
  const tokenHash = await hashToken(token);

  // token berlaku 30 menit
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  /**
   * PRODUKSI:
   * - kirim token ini via WA/email (OTP link)
   */
  // const resetLink = `/reset-password?token=${encodeURIComponent(token)}&uid=${encodeURIComponent(user.id)}`;

  return NextResponse.json({ ok: true });
}
