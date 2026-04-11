export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// GET /api/admin/settings
export async function GET() {
  const token = cookies().get("session")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const s = await verifySession(token);
    if (s.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const settings = await prisma.globalSetting.findMany({
      orderBy: { key: "asc" }
    });

    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch settings" }, { status: 500 });
  }
}

// PATCH /api/admin/settings
// Body format: { [key: string]: string }
export async function PATCH(req: Request) {
  const token = cookies().get("session")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const s = await verifySession(token);
    if (s.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const keys = Object.keys(body);

    if (keys.length === 0) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
    }

    // Update settings in a transaction
    await prisma.$transaction(
      keys.map((key) =>
        prisma.globalSetting.upsert({
          where: { key },
          update: { value: body[key] },
          create: { key, value: body[key] },
        })
      )
    );

    // Purge cache to reflect changes immediately across the site
    revalidatePath("/", "layout");

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Settings Update Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update settings" }, { status: 500 });
  }
}
