export const dynamic = 'force-dynamic';
import TopupClient, { Audience } from "./TopupClient";
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
export default async function TopupGamePage({ params }: { params: any }) {
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
    game = await prisma.game.findUnique({ where: { key: slug } });
  } catch (err) {
    console.error("[TopupPage] Prisma error:", err);
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

  let audience: Audience = "PUBLIC";
  if (token) {
    try {
      const s = await verifySession(token);
      audience = roleToAudience(s.role);
    } catch {
      audience = "PUBLIC";
    }
  }

  return (
    <TopupClient
      game={{ id: game.id, key: game.key, name: game.name }}
      audience={audience}
      logoUrl={game.logoUrl ?? null}
      bannerUrl={game.bannerUrl ?? null}
      publisher={publisherFromSlug(game.key)}
      hasJoki={game.hasJoki}
      targetType={game.targetType ?? "DEFAULT"}
    />
  );
}