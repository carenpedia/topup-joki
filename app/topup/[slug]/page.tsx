import { prisma } from "@/lib/prisma";
import TopupClient from "./TopupClient";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";

type Audience = "PUBLIC" | "GOLD" | "SILVER";

type Props = {
  params: { slug: string };
};

/**
 * Memetakan role user ke tipe Audience untuk perhitungan harga.
 */
function roleToAudience(role: string): Audience {
  switch (role) {
    case "ADMIN":
    case "GOLD":
      return "GOLD";
    case "SILVER":
      return "SILVER";
    default:
      return "PUBLIC";
  }
}

/**
 * Menentukan publisher berdasarkan slug game (sederhana).
 */
function publisherFromSlug(slug: string): string {
  if (slug.includes("mlbb") || slug.includes("mobile-legends")) return "Moonton";
  if (slug.includes("free-fire") || slug.includes("ff")) return "Garena";
  if (slug.includes("genshin")) return "HoYoverse";
  return "Official Publisher";
}

export default async function TopupGamePage({ params }: Props) {
  const { slug } = params;
  const token = cookies().get("session")?.value;

  const game = await prisma.game.findFirst({
    where: {
      key: slug,
      isActive: true,
    },
  });

  if (!game) {
    return (
      <main className="main-layout">
        <Navbar />
        <div className="container" style={{ paddingTop: 100, minHeight: "60vh" }}>
          <div className="spacer" />
          <div className="card" style={{ padding: 16 }}>
            <div className="cardTitle">Game tidak ditemukan / nonaktif</div>
            <div className="cardMuted">Slug: {slug}</div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  let audience: Audience = "PUBLIC";
  if (token) {
    try {
      const s = await verifySession(token);
      audience = roleToAudience(s.role);
    } catch {
      audience = "PUBLIC";
    }
  }

  // Get gateway status from settings
  const gSets = await prisma.globalSetting.findMany({
    where: { key: { in: ["ENABLE_MIDTRANS", "ENABLE_DUITKU", "ENABLE_TRIPAY", "ENABLE_XENDIT"] } }
  });
  const gateways = {
    MIDTRANS: gSets.find(s => s.key === "ENABLE_MIDTRANS")?.value !== "OFF",
    DUITKU: gSets.find(s => s.key === "ENABLE_DUITKU")?.value !== "OFF",
    TRIPAY: gSets.find(s => s.key === "ENABLE_TRIPAY")?.value !== "OFF",
    XENDIT: gSets.find(s => s.key === "ENABLE_XENDIT")?.value !== "OFF",
  };

  // Ambil detail fee & logo tiap metode
  const methodFees = await prisma.paymentMethodFee.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <TopupClient
      game={{ id: game.id, key: game.key, name: game.name }}
      audience={audience}
      logoUrl={game.logoUrl ?? null}
      bannerUrl={game.bannerUrl ?? null}
      publisher={publisherFromSlug(game.key)}
      hasJoki={game.hasJoki}
      targetType={game.targetType ?? "DEFAULT"}
      gateways={gateways}
      methodFees={JSON.parse(JSON.stringify(methodFees))}
    />
  );
}