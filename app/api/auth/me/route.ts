export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../../../lib/prisma";
import { verifySession } from "../../../../lib/session";

export async function GET() {
  const token = cookies().get("session")?.value;
  if (!token) return NextResponse.json({ user: null });

  try {
    const s = await verifySession(token);
    const user = await prisma.user.findUnique({
      where: { id: s.userId },
      select: { id: true, username: true, role: true, status: true, carencoinBalance: true, pointsBalance: true },
    });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}
