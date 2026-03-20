export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { verifyPassword } from "../../../../lib/auth";
import { signSession } from "../../../../lib/session";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return NextResponse.json({ error: "Username atau password salah" }, { status: 401 });
  if (user.status !== "ACTIVE") return NextResponse.json({ error: "Akun tidak aktif" }, { status: 403 });

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Username atau password salah" }, { status: 401 });

  const token = await signSession({ 
    userId: user.id, 
    role: user.role, 
   });

  const res = NextResponse.json({
    ok: true,
    user: { id: user.id, username: user.username, role: user.role },
  });

  res.cookies.set("session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
