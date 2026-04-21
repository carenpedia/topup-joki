import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const VIRTUAL_OFFSET = 5692;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get("gameId");

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

    // Count real reviews
    const realCount = await prisma.productReview.count({ where });

    // Return virtual data
    return NextResponse.json({
      reviews,
      totalCount: realCount + VIRTUAL_OFFSET,
      averageRating: 5.0,
    });
  } catch (err: any) {
    console.error("GET REVIEWS ERROR", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
