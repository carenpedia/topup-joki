import { prisma } from "@/lib/prisma";
import Navbar from "./components/Navbar";
import PromoSlider from "./components/PromoSlider";
import GameCard, { GameDisplay } from "./components/GameCard";
import HomeCategoryTabs from "./components/HomeCategoryTabs";
import Footer from "./components/Footer";
import "./homepage.css";

export const dynamic = "force-dynamic";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function Home({ searchParams }: { searchParams: any }) {
  const query = typeof searchParams?.q === "string" ? searchParams.q.toLowerCase() : "";
  const activeCatId = typeof searchParams?.cat === "string" ? searchParams.cat : null;

  // 1) Ambil semua banner promo aktif
  const banners = await prisma.promoBanner.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  // 1.5) Ambil semua kategori aktif (untuk tabs)
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });

  // 2) Ambil semua game aktif + relasi kategori
  const dbGames = await prisma.game.findMany({
    where: { isActive: true },
    select: {
      key: true,
      name: true,
      logoUrl: true,
      hasJoki: true,
      isPopuler: true,
      links: { select: { categoryId: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  // 3) Konversi ke format GameDisplay
  const allGames: (GameDisplay & { categoryIds: string[] })[] = dbGames.map((g) => ({
    slug: g.key,
    name: g.name,
    tag: g.hasJoki ? "Populer" : undefined,
    category: (g.isPopuler ? "populer" : "lain") as "populer" | "lain",
    logoText: g.name.substring(0, 2).toUpperCase(),
    imageUrl: g.logoUrl ?? undefined,
    categoryIds: g.links.map((l) => l.categoryId),
  }));

  // 4) Filter berdasarkan search query
  const searched = query
    ? allGames.filter((g) => g.name.toLowerCase().includes(query))
    : allGames;

  // 5) Filter berdasarkan kategori aktif tab (jika ada)
  const filtered = activeCatId
    ? searched.filter((g) => g.categoryIds.includes(activeCatId))
    : searched;

  // 6) Split: populer tampil di atas dengan layout horizontal, lain tampil grid di bawah
  const populer = searched.filter((g) => g.category === "populer");
  const lain = activeCatId ? filtered : filtered.filter((g) => g.category !== "populer");

  return (
    <main className="homePage">
      <div className="bgGlow" aria-hidden="true" />
      <div className="gridFx" aria-hidden="true" />
      <Navbar />

      <div className="shell">
        {/* Banner promo slider */}
        <PromoSlider banners={banners} />

        <div className="spacerLg" />

        {/* Header Section */}
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

        {/* POPULER SEKARANG – horizontal card layout (hanya tampil bila tidak ada filter kategori) */}
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

        {/* Tabs Kategori Dinamis */}
        {categories.length > 0 && (
          <HomeCategoryTabs
            categories={categories}
            activeId={activeCatId}
          />
        )}

        {/* Game Grid – layout vertical card biasa */}
        {lain.length > 0 ? (
          <div className="homeSection" style={{ marginTop: categories.length > 0 ? 0 : 24 }}>
            <div className="gameGrid">
              {lain.map((g) => (
                <GameCard key={g.slug} game={g} />
              ))}
            </div>
          </div>
        ) : (
          filtered.length === 0 && (
            <div className="homeSection" style={{ marginTop: 24 }}>
              <div style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.5)" }}>
                {activeCatId ? "Belum ada game di kategori ini." : "Game tidak ditemukan."}
              </div>
            </div>
          )
        )}
      </div>

      <Footer />
    </main>
  );
}
