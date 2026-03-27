"use client";

import { useMemo, useState } from "react";
import Navbar from "./components/Navbar";
import PromoSlider from "./components/PromoSlider";
import GameCard from "./components/GameCard";
import Footer from "./components/Footer";
import { games } from "./components/data";
import "./homepage.css";

export default function Home() {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return games;
    return games.filter((g) => g.name.toLowerCase().includes(s));
  }, [q]);

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
      </div>

      <Footer />
    </main>
  );
}
