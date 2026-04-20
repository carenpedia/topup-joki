export const dynamic = 'force-dynamic';
import JokiClient, { Audience } from "./JokiClient";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

function roleToAudience(role?: string): Audience {
  if (role === "RESELLER") return "RESELLER";
  if (role === "MEMBER") return "MEMBER";
  if (role === "ADMIN") return "MEMBER";
  return "PUBLIC";
}

function publisherFromSlug(slug: string) {
  if (slug === "mobile-legends") return "Moonton";
  return "Official Publisher";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function JokiGamePage({ params }: { params: any }) {
  let slug = "";
  try {
    slug = params?.slug || "";
  } catch {
    slug = "";
  }

  if (!slug) {
    return (
      <main className="topupPage">
        <Navbar />
        <div className="topupWrap">
          <div className="spacer" />
          <div className="card" style={{ padding: 16 }}>
            <div className="cardTitle">Halaman tidak valid</div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  let token: string | undefined;
  try {
    const cookieStore = cookies();
    token = cookieStore.get("session")?.value;
  } catch {
    token = undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let game: any = null;

  try {
    game = await prisma.game.findUnique({ 
      where: { key: slug },
      select: {
        id: true,
        key: true,
        name: true,
        logoUrl: true,
        bannerUrl: true,
        isActive: true,
        hasJoki: true,
      }
    });
  } catch (err) {
    console.error("[JokiPage] Prisma error:", err);
    return (
      <main className="topupPage">
        <Navbar />
        <div className="topupWrap">
          <div className="spacer" />
          <div className="card" style={{ padding: 16 }}>
            <div className="cardTitle">Terjadi kesalahan server</div>
            <div className="cardMuted">Silakan coba lagi nanti.</div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!game || !game.isActive) {
    return (
      <main className="topupPage">
        <Navbar />
        <div className="topupWrap">
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

  if (!game.hasJoki) {
    return (
      <main className="topupPage">
        <Navbar />
        <div className="topupWrap">
          <div className="spacer" />
          <div className="card" style={{ padding: 16 }}>
            <div className="cardTitle">Fitur Joki Tidak Tersedia</div>
            <div className="cardMuted">
              Game <strong>{game.name}</strong> belum mengaktifkan fitur joki.
              Silakan hubungi admin untuk informasi lebih lanjut.
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  let audience: Audience = "PUBLIC";
  let userBalance = 0;
  if (token) {
    try {
      const s = await verifySession(token);
      audience = roleToAudience(s.role);
      const user = await prisma.user.findUnique({
        where: { id: s.userId },
        select: { carencoinBalance: true }
      });
      userBalance = user?.carencoinBalance || 0;
    } catch {
      audience = "PUBLIC";
    }
  }

  const gSets = await prisma.globalSetting.findMany({
    where: { key: { in: ["ENABLE_MIDTRANS", "ENABLE_DUITKU", "ENABLE_TRIPAY", "ENABLE_XENDIT", "CARENCOIN_LOGO"] } }
  });
  const gateways = {
    MIDTRANS: gSets.find(s => s.key === "ENABLE_MIDTRANS")?.value !== "OFF",
    DUITKU: gSets.find(s => s.key === "ENABLE_DUITKU")?.value !== "OFF",
    TRIPAY: gSets.find(s => s.key === "ENABLE_TRIPAY")?.value !== "OFF",
    XENDIT: gSets.find(s => s.key === "ENABLE_XENDIT")?.value !== "OFF",
  };
  const carenCoinLogo = gSets.find(s => s.key === "CARENCOIN_LOGO")?.value || null;

  const methodFees = await prisma.paymentMethodFee.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <JokiClient
      game={{ id: game.id, key: game.key, name: game.name }}
      audience={audience}
      userBalance={userBalance}
      carenCoinLogo={carenCoinLogo}
      logoUrl={game.logoUrl ?? null}
      bannerUrl={game.bannerUrl ?? null}
      publisher={publisherFromSlug(game.key)}
      gateways={gateways}
      methodFees={JSON.parse(JSON.stringify(methodFees))}
    />
  );
}
