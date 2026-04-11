export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/settings
// Fetches public site configuration
export async function GET() {
  try {
    const settings = await prisma.globalSetting.findMany({
      where: {
        group: {
          in: ["GENERAL", "CONTACT", "SEO"]
        }
      },
      select: {
        key: true,
        value: true
      }
    });

    // Convert array to a flatter object for easier frontend use
    const config = settings.reduce((acc: any, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    return NextResponse.json(config);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to load site configuration" }, { status: 500 });
  }
}
