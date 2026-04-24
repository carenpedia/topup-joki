import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session";

export const dynamic = 'force-dynamic';

export async function GET() {
  const token = cookies().get("session")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const s = await verifySession(token);
    const userId = s.userId;

    // Timeframes (UTC/Local depending on DB storage, assuming UTC)
    const now = new Date();
    
    // Start of Today (Local WIB UTC+7 assumed)
    const startOfToday = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    startOfToday.setUTCHours(0, 0, 0, 0);
    const today = new Date(startOfToday.getTime() - 7 * 60 * 60 * 1000);

    // Start of Week (Monday)
    const day = startOfToday.getUTCDay();
    const diff = day === 0 ? 6 : day - 1;
    const startOfWeekWIB = new Date(startOfToday);
    startOfWeekWIB.setUTCDate(startOfToday.getUTCDate() - diff);
    const week = new Date(startOfWeekWIB.getTime() - 7 * 60 * 60 * 1000);

    // Start of Month
    const startOfMonthWIB = new Date(startOfToday);
    startOfMonthWIB.setUTCDate(1);
    const month = new Date(startOfMonthWIB.getTime() - 7 * 60 * 60 * 1000);

    const [daily, weekly, monthly] = await Promise.all([
      prisma.order.aggregate({
        where: { userId, status: "SUCCESS", createdAt: { gte: today } },
        _sum: { finalPayable: true, profit: true },
        _count: true,
      }),
      prisma.order.aggregate({
        where: { userId, status: "SUCCESS", createdAt: { gte: week } },
        _sum: { finalPayable: true, profit: true },
        _count: true,
      }),
      prisma.order.aggregate({
        where: { userId, status: "SUCCESS", createdAt: { gte: month } },
        _sum: { finalPayable: true, profit: true },
        _count: true,
      }),
    ]);

    return NextResponse.json({
      today: { count: daily._count || 0, revenue: daily._sum.finalPayable || 0, profit: daily._sum.profit || 0 },
      week: { count: weekly._count || 0, revenue: weekly._sum.finalPayable || 0, profit: weekly._sum.profit || 0 },
      month: { count: monthly._count || 0, revenue: monthly._sum.finalPayable || 0, profit: monthly._sum.profit || 0 },
    });

  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json({ error: "Failed to load statistics" }, { status: 500 });
  }
}
