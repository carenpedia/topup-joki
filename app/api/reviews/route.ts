import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";

export const dynamic = "force-dynamic";

const VIRTUAL_OFFSET = 14515;

function maskName(name: string) {
  if (!name) return "***";
  if (name.length <= 3) return name + "***";
  return name.substring(0, 3) + "*****";
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get("gameId");

    // Check if user is Admin
    let isAdmin = false;
    const token = cookies().get("session")?.value;
    if (token) {
      try {
        const session = await verifySession(token);
        if (session.role === "ADMIN") isAdmin = true;
      } catch (e) {
        // Invalid session, treated as non-admin
      }
    }

    const where: any = {};
    if (gameId) where.gameId = gameId;

    // Fetch latest 10 reviews
    let reviews = await prisma.productReview.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Fallback if empty to look "ramai"
    if (reviews.length === 0) {
      reviews = [
        {
          id: "f1",
          userName: "Sultan Gaming",
          rating: 5,
          comment: "Gila sih, prosesnya beneran satset! Langsung masuk detikan setelah bayar. UI nya juga mewah banget sekarang!",
          isVerified: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: "f2",
          userName: "Raffi Ahmad",
          rating: 5,
          comment: "Langganan disini gak pernah mengecewakan. Harga paling bersahabat buat dompet.",
          isVerified: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: "f3",
          userName: "GamingPro ID",
          rating: 5,
          comment: "Pelayanan admin ramah banget, sempat salah tulis ID langsung dibantu. Terbaik lah!",
          isVerified: true,
          createdAt: new Date().toISOString(),
        }
      ] as any;
    }

    // Apply Masking unless Admin
    const processedReviews = reviews.map(r => ({
      ...r,
      userName: isAdmin ? r.userName : maskName(r.userName)
    }));

    // Count real reviews
    const realCount = await prisma.productReview.count({ where });

    // Return virtual data
    return NextResponse.json({
      reviews: processedReviews,
      totalCount: realCount + VIRTUAL_OFFSET,
      averageRating: 4.99,
    });
  } catch (err: any) {
    console.error("GET REVIEWS ERROR", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
