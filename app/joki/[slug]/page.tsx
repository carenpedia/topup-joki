export const dynamic = 'force-dynamic';
import JokiClient from "./JokiClient";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";

type Audience = "PUBLIC" | "MEMBER" | "RESELLER";

function roleToAudience(role?: string): Audience {
  if (role === "RESELLER") return "RESELLER";
  if (role === "MEMBER") return "MEMBER";
  if (role === "ADMIN") return "MEMBER";
  return "PUBLIC";
}

export default async function JokiGamePage({ params }: { params: { slug: string } }) {
  let slug = "";
  try {
    slug = params.slug;
  } catch {
    slug = "";
  }

  if (!slug) {
    return (
      <main className="topupPage">
        <div className="topupWrap">
          <div className="card" style={{ padding: 16 }}>
            <div className="cardTitle">Halaman tidak valid</div>
          </div>
        </div>
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

  let game: { id: string; key: string; name: string; logoUrl: string | null; isActive: boolean } | null = null;

  try {
    game = await prisma.game.findUnique({ where: { key: slug } });
  } catch (err) {
    console.error("[JokiPage] Prisma error:", err);
    return (
      <main className="topupPage">
        <div className="topupWrap">
          <div className="card" style={{ padding: 16 }}>
            <div className="cardTitle">Terjadi kesalahan server</div>
            <div className="cardMuted">Silakan coba lagi nanti.</div>
          </div>
        </div>
      </main>
    );
  }

  if (!game || !game.isActive) {
    return (
      <main className="topupPage">
        <div className="topupWrap">
          <div className="card" style={{ padding: 16 }}>
            <div className="cardTitle">Game tidak ditemukan / nonaktif</div>
            <div className="cardMuted">Slug: {slug}</div>
          </div>
        </div>
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
    <JokiClient
      game={{ id: game.id, key: game.key, name: game.name }}
      audience={audience}
      heroImage={game.logoUrl ?? null}
    />
  );
}
