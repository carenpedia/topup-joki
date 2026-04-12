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
  try {
    const query = typeof searchParams?.q === "string" ? searchParams.q.toLowerCase() : "";
    const activeCatId = typeof searchParams?.cat === "string" ? searchParams.cat : null;

    // 1, 1.5, 2) Ambil data secara paralel untuk mempercepat loading
    const [banners, categories, dbGames] = await Promise.all([
      // 1) Banners
      prisma.promoBanner.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
      // 1.5) Categories
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: { id: true, name: true },
      }),
      // 2) Games
      prisma.game.findMany({
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
      }),
    ]);

    // 3) Konversi ke format GameDisplay
    const allGames: (GameDisplay & { categoryIds: string[] })[] = dbGames.map((g) => ({
      slug: g.key,
      name: g.name,
      tag: g.hasJoki ? "Populer" : undefined,
      category: (g.isPopuler ? "populer" : "lain") as "populer" | "lain",
      logoText: (g.name || "??").substring(0, 2).toUpperCase(),
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
                <div className="homeSectionTitle">🔥 PASTI TER-MURAH</div>
                <div className="homeSectionSub">
                  Penawaran Ekslusif Terbatas!
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
                {populer.map((g, idx) => (
                  <GameCard key={g.slug} game={g} variant="horizontal" index={idx} />
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
                {lain.map((g, idx) => (
                  <GameCard key={g.slug} game={g} index={idx} />
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
  } catch (error: any) {
    console.error("[HOME_ERROR]", error);
    return (
      <main className="homePage" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 20 }}>
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '24px', borderRadius: '16px', maxWidth: '500px', textAlign: 'center' }}>
          <h1 style={{ color: '#ef4444', marginBottom: '12px' }}>Oops! Terjadi Kesalahan</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginBottom: '20px' }}>
            Halaman gagal dimuat karena masalah teknis. Silakan coba lagi nanti atau hubungi Admin.
          </p>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px', textAlign: 'left', wordBreak: 'break-all' }}>
            <strong>Debug Info:</strong><br/>
            {error?.message || "Unknown Error"}
          </div>
          <a href="/" style={{ display: 'inline-block', marginTop: '20px', padding: '10px 20px', background: '#3b82f6', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 700 }}>
            Segarkan Halaman
          </a>
        </div>
      </main>
    )
  }
}
