export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../../../lib/prisma";
import { verifySession } from "../../../../lib/session";
import { verifyPassword, hashPassword } from "../../../../lib/auth";

export async function POST(req: Request) {
  const token = cookies().get("session")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const s = await verifySession(token);
    const { type, ...data } = await req.json();

    if (type === "profile") {
      const { username, whatsapp } = data;
      
      // Cek apakah username sudah dipakai orang lain
      if (username) {
        const existing = await prisma.user.findFirst({
          where: { username, NOT: { id: s.userId } }
        });
        if (existing) return NextResponse.json({ error: "Username sudah digunakan" }, { status: 400 });
      }

      const updated = await prisma.user.update({
        where: { id: s.userId },
        data: {
          username: username || undefined,
          whatsapp: whatsapp || undefined,
        }
      });

      return NextResponse.json({ ok: true, user: { id: updated.id, username: updated.username } });
    }

    if (type === "password") {
      const { oldPassword, newPassword } = data;

      const user = await prisma.user.findUnique({ where: { id: s.userId } });
      if (!user) return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });

      const isMatch = await verifyPassword(oldPassword, user.passwordHash);
      if (!isMatch) return NextResponse.json({ error: "Kata sandi lama salah" }, { status: 400 });

      const newHash = await hashPassword(newPassword);
      await prisma.user.update({
        where: { id: s.userId },
        data: { passwordHash: newHash }
      });

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error: any) {
    console.error("Settings Update Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update settings" }, { status: 500 });
  }
}
