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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userName, rating, comment, gameId, orderNo } = body;

    // Check session for Admin/Identity
    const token = cookies().get("session")?.value;
    let isAdmin = false;
    let userId: string | undefined;

    if (token) {
      try {
        const session = await verifySession(token);
        isAdmin = session.role === "ADMIN";
        userId = session.userId;
      } catch (e) {}
    }

    if (!isAdmin) {
      // Pembeli must have a valid orderNo that is SUCCESS
      if (!orderNo) return NextResponse.json({ error: "Nomor order diperlukan" }, { status: 400 });
      
      const order = await prisma.order.findUnique({
        where: { orderNo },
        select: { status: true, id: true }
      });

      if (!order || order.status !== "SUCCESS") {
        return NextResponse.json({ error: "Ulasan hanya diijinkan untuk pesanan yang sudah berhasil." }, { status: 400 });
      }

      // Optional: check if review already exists for this order
      const existing = await prisma.productReview.findFirst({
        where: { orderNo }
      });
      if (existing) return NextResponse.json({ error: "Anda sudah memberikan ulasan untuk pesanan ini." }, { status: 400 });
    }

    const review = await prisma.productReview.create({
      data: {
        userName: userName || (isAdmin ? "Admin Team" : "Pembeli"),
        rating: Number(rating) || 5,
        comment: comment || "",
        gameId: gameId || null,
        orderNo: orderNo || null,
        userId: userId || null,
        isVerified: true
      }
    });

    return NextResponse.json(review);
  } catch (err: any) {
    console.error("POST REVIEW ERROR", err);
    return NextResponse.json({ error: "Gagal menyimpan ulasan" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID ulasan diperlukan" }, { status: 400 });

    const token = cookies().get("session")?.value;
    const sess = token ? await verifySession(token) : null;
    if (!sess || sess.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.productReview.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Gagal menghapus ulasan" }, { status: 500 });
  }
}
