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

        {/* Search + Flash Sale */}
        <div className="homeSection">
          <div className="homeSectionHeader">
            <div>
              <div className="homeSectionTitle">Top up Game</div>
              <div className="homeSectionSub">
                Cari game, cek promo, lalu lanjut checkout.
              </div>
            </div>

            <div className="homeSearch">
              <input
                className="homeSearchInput"
                placeholder="Search game… (ML, FF, PUBG)"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
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
              <div className="homeSectionTitle">🔥 Game Populer</div>
            </div>
            <div className="gameGrid">
              {populer.map((g) => (
                <GameCard key={g.slug} game={g} />
              ))}
            </div>
          </div>
        )}

        {/* Kategori: Lain */}
        {lain.length > 0 && (
          <div className="homeSection">
            <div className="homeSectionHeader">
              <div className="homeSectionTitle">🎮 Game Lain</div>
            </div>
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
