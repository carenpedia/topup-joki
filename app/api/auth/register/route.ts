import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { hashPassword } from "../../../../lib/auth";

function randomCode() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

export async function POST(req: Request) {
  const { username, password, whatsapp } = await req.json();

  if (!username?.trim() || !password?.trim() || !whatsapp?.trim()) {
    return NextResponse.json({ error: "Username, password, whatsapp wajib" }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { username } });
  if (exists) return NextResponse.json({ error: "Username sudah dipakai" }, { status: 409 });

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      username: username.trim(),
      passwordHash,
      whatsapp: whatsapp.trim(),
      role: "MEMBER",
      status: "ACTIVE",
    },
    select: { id: true, username: true, role: true },
  });

  return NextResponse.json({ ok: true, user });
}
