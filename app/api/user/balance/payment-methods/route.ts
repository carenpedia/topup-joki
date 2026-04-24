import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Get preferred gateway from settings
    const prefGatewaySetting = await prisma.globalSetting.findUnique({
      where: { key: "DEPOSIT_AUTO_GATEWAY" }
    });
    const prefGateway = prefGatewaySetting?.value || "TRIPAY";

    // 2. Get active methods for that gateway
    const methods = await prisma.paymentMethodFee.findMany({
      where: {
        gateway: prefGateway as any,
        isActive: true
      },
      orderBy: { sortOrder: 'asc' }
    });

    return NextResponse.json({ methods });
  } catch (error: any) {
    console.error("Fetch Balance Methods Error:", error);
    return NextResponse.json({ error: "Failed to load payment methods" }, { status: 500 });
  }
}
