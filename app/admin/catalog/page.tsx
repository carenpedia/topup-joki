"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar";

type Game = { id: string; key: string; name: string; isActive: boolean };
type Category = { id: string; name: string; sortOrder: number; isActive: boolean };
type LinkRow = { id: string; gameId: string; categoryId: string };

export default function AdminCatalog() {
  const [games, setGames] = useState<Game[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [newCat, setNewCat] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/catalog", { cache: "no-store" });
    const data = await res.json();
    setGames(data.games);
    setCats(data.categories);
    setLinks(data.links);
  }

  useEffect(() => {
    load();
  }, []);

  const linkSet = useMemo(() => {
    const s = new Set<string>();
    for (const l of links) s.add(`${l.gameId}:${l.categoryId}`);
    return s;
  }, [links]);

  async function createCategory() {
    setMsg(null);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCat }),
    });
    if (!res.ok) {
      const e = await res.json();
      setMsg(e.error || "Gagal buat kategori");
      return;
    }
    setNewCat("");
    setMsg("✅ Kategori dibuat");
    await load();
  }

  async function toggle(gameId: string, categoryId: string, enabled: boolean) {
    await fetch("/api/admin/game-category", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId, categoryId, enabled }),
    });
    await load();
  }

  return (
    <main className="page">
      <div className="bgGlow" aria-hidden="true" />
      <div className="gridFx" aria-hidden="true" />
      <Navbar />
      <div className="shell">

        <div className="section">
          <div className="title">Admin • Catalog</div>
          <div className="subtitle">Manage kategori & assign game (Game Populer / Game Lain).</div>
        </div>

        <div className="section">
          <div style={{ fontWeight: 980, marginBottom: 10 }}>Buat Kategori</div>
          <div className="row">
            <div style={{ flex: "1 1 260px" }}>
              <input className="input" value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="Contoh: Game Populer" />
            </div>
            <button className="btn btnPrimary" type="button" onClick={createCategory}>
              Buat
            </button>
          </div>
          {msg ? <div className="kicker" style={{ marginTop: 10 }}>{msg}</div> : null}
        </div>

        <div className="section">
          <div style={{ fontWeight: 980, marginBottom: 10 }}>Assign Game ke Kategori</div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: "left", color: "rgba(229,231,235,.70)" }}>
                  <th style={{ padding: "10px 8px" }}>Game</th>
                  {cats.map((c) => (
                    <th key={c.id} style={{ padding: "10px 8px" }}>{c.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {games.map((g) => (
                  <tr key={g.id} style={{ borderTop: "1px solid rgba(255,255,255,.06)" }}>
                    <td style={{ padding: "10px 8px", fontWeight: 900 }}>
                      {g.name} <span style={{ opacity: 0.6 }}>({g.key})</span>
                    </td>
                    {cats.map((c) => {
                      const checked = linkSet.has(`${g.id}:${c.id}`);
                      return (
                        <td key={c.id} style={{ padding: "10px 8px" }}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => toggle(g.id, c.id, e.target.checked)}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="kicker" style={{ marginTop: 10 }}>
            Tips: buat 2 kategori “Game Populer” dan “Game Lain”, lalu centang sesuai kebutuhan.
          </div>
        </div>
      </div>
    </main>
  );
}
