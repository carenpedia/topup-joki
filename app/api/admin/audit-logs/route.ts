export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const actionFilter = searchParams.get("actionFilter") || "";

  // Base where condition
  const whereCondition: any = {};

  if (q) {
    whereCondition.OR = [
      { message: { contains: q, mode: "insensitive" } },
      { entityType: { contains: q, mode: "insensitive" } },
      { actor: { username: { contains: q, mode: "insensitive" } } },
    ];
  }

  if (actionFilter) {
    whereCondition.action = actionFilter;
  }

  try {
    const logs = await prisma.adminAuditLog.findMany({
      where: whereCondition,
      orderBy: { createdAt: "desc" },
      take: 100, // Limit to 100 records for performance
      include: {
        actor: {
          select: {
            username: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ items: logs });
  } catch (err: any) {
    logError(err);
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}

function logError(e: any) {
  console.error("[AuditLogAPI] Error:", e);
}
