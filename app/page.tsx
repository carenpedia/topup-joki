import { prisma } from "@/lib/prisma";
import Navbar from "./components/Navbar";
import PromoSlider from "./components/PromoSlider";
import GameCard, { GameDisplay } from "./components/GameCard";
import Footer from "./components/Footer";
import "./homepage.css";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: { q?: string } }) {
  const query = typeof searchParams?.q === "string" ? searchParams.q.toLowerCase() : "";

  // Ambil data game aktif dari database
  const dbGames = await prisma.game.findMany({
    where: { isActive: true },
    select: {
      key: true,
      name: true,
      logoUrl: true,
      hasJoki: true,
    },
    orderBy: { createdAt: "asc" }
  });

  // Konversi ke format yang dibutuhkan GameCard
  const mappedGames: GameDisplay[] = dbGames.map(g => ({
    slug: g.key,
    name: g.name,
    tag: g.hasJoki ? "Populer" : undefined,
    category: g.hasJoki ? "populer" : "lain",
    logoText: g.name.substring(0, 2).toUpperCase(),
    imageUrl: g.logoUrl ?? undefined,
  }));

  // Jika ada query dari navbar, filter datanya
  const filtered = query
    ? mappedGames.filter((g) => g.name.toLowerCase().includes(query))
    : mappedGames;

  const populer = filtered.filter((g) => g.category === "populer");
  const lain = filtered.filter((g) => g.category === "lain");

  return (
    <main className="homePage">
      <div className="bgGlow" aria-hidden="true" />
      <div className="gridFx" aria-hidden="true" />
      <Navbar />

      <div className="shell">
        {/* Banner promo slider */}
        <PromoSlider />

        <div className="spacerLg" />

        {/* Games + Flash Sale */}
        <div className="homeSection">
          <div className="homeSectionHeader">
            <div>
              <div className="homeSectionTitle">Top Up Game</div>
              <div className="homeSectionSub">
                Cari game, cek promo, lalu lanjut bayar dengan cepat.
              </div>
            </div>
          </div>

          <div className="flashStrip">
            <span className="flashIcon">⚡</span>
            <div>
              <div className="flashTitle">Flash Sale</div>
              <div className="flashSub">
                Nanti: tampilkan item diskon dari admin (setting flash sale).
              </div>
            </div>
          </div>
        </div>

        {/* Kategori: Populer */}
        {populer.length > 0 && (
          <div className="homeSection">
            <div className="homeSectionHeader">
              <div>
                <div className="homeSectionTitle">🔥 POPULER SEKARANG!</div>
                <div className="homeSectionSub">Berikut adalah beberapa produk yang paling populer saat ini.</div>
              </div>
            </div>
            <div className="gameGridHorizontal">
              {populer.map((g) => (
                <GameCard key={g.slug} game={g} variant="horizontal" />
              ))}
            </div>
          </div>
        )}

        {/* Tabs Kategori Custom */}
        <div className="homeTabsStrip">
          <div className="homeTab active">Top Up</div>
          <div className="homeTab">Kebutuhan MLBB</div>
          <div className="homeTab">Kebutuhan Roblox</div>
          <div className="homeTab">JOIN RESELLER</div>
          <div className="homeTab">Aplikasi Premium</div>
          <div className="homeTab">Voucher</div>
          <div className="homeTab">Hiburan</div>
        </div>

        {/* Kategori: Lain */}
        {lain.length > 0 && (
          <div className="homeSection" style={{ marginTop: 24 }}>
            <div className="gameGrid">
              {lain.map((g) => (
                <GameCard key={g.slug} game={g} />
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="homeSection">
            <div style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.5)" }}>
              Game tidak ditemukan.
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
