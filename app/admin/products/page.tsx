"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AdminTable from "../../components/AdminTable";

type Game = { id: string; key: string; name: string };
type Product = {
  id: string;
  name: string;
  type: "TOPUP" | "JOKI";
  group: "BEST_SELLER" | "HEMAT" | "SULTAN";
  provider: "DIGIFLAZZ" | "APIGAMES";
  providerSku: string;
  isActive: boolean;
  minPayable: number | null;
  game: Game;
  prices: { audience: "PUBLIC" | "MEMBER" | "RESELLER"; price: number }[];
};

export default function AdminProductsList() {
  const [items, setItems] = useState<Product[]>([]);
  const [games, setGames] = useState<Game[]>([]);

  const [q, setQ] = useState("");
  const [gameId, setGameId] = useState("");
  const [type, setType] = useState("");
  const [group, setGroup] = useState("");
  const [active, setActive] = useState("");

  async function loadGames() {
    const res = await fetch("/api/admin/games?active=1");
    const j = await res.json().catch(() => ({}));
    setGames(j.items ?? []);
  }

  async function load() {
    const sp = new URLSearchParams();
    if (q.trim()) sp.set("q", q.trim());
    if (gameId) sp.set("gameId", gameId);
    if (type) sp.set("type", type);
    if (group) sp.set("group", group);
    if (active) sp.set("active", active);

    const res = await fetch(`/api/admin/products?${sp.toString()}`);
    const j = await res.json().catch(() => ({}));
    setItems(j.items ?? []);
  }

  useEffect(() => {
    loadGames();
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = useMemo(() => {
    return items.map((p) => {
      const priceMap = new Map(p.prices.map((x) => [x.audience, x.price]));
      const pp = priceMap.get("PUBLIC");
      const mm = priceMap.get("MEMBER");
      const rr = priceMap.get("RESELLER");

      const fmt = (n?: number) => (typeof n === "number" ? `Rp ${n.toLocaleString("id-ID")}` : "—");

      return {
        product: (
          <div style={{ fontWeight: 950 }}>
            {p.name}
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.55)", marginTop: 4 }}>
              {p.game.name} • {p.provider} • sku: {p.providerSku}
              {p.minPayable != null ? ` • minPayable: ${p.minPayable}` : ""}
            </div>
          </div>
        ),
        public: fmt(pp),
        type: (
          <span style={{ fontWeight: 800, fontSize: 11, color: p.type === "JOKI" ? "#8b5cf6" : "#3b82f6" }}>
            {p.type}
          </span>
        ),
        member: fmt(mm),
        reseller: fmt(rr),
        status: (
          <span
            style={{
              padding: "5px 10px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 900,
              border: "1px solid rgba(255,255,255,.10)",
              background: p.isActive ? "rgba(34,197,94,.12)" : "rgba(239,68,68,.10)",
            }}
          >
            {p.isActive ? "ACTIVE" : "OFF"}
          </span>
        ),
        action: (
          <Link
            href={`/admin/products/${p.id}`}
            style={{
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid rgba(59,130,246,.28)",
              background: "rgba(59,130,246,.10)",
              color: "rgba(255,255,255,.92)",
              fontWeight: 900,
              fontSize: 12,
              textDecoration: "none",
            }}
          >
            Edit
          </Link>
        ),
        _id: p.id,
      };
    });
  }, [items]);

  const columns = [
    { key: "product", title: "Product" },
    { key: "type", title: "Tipe", width: 90 },
    { key: "public", title: "PUBLIC", width: 140 },
    { key: "member", title: "MEMBER", width: 140 },
    { key: "reseller", title: "RESELLER", width: 150 },
    { key: "status", title: "Status", width: 120 },
    { key: "action", title: "Aksi", width: 110 },
  ];

  return (
    <div className="contact-section">
      <div className="contact-card">
        <div className="contact-header">
          <div className="contact-step">P</div>
          <div className="contact-title-wrap">
            <h4 className="contact-title">Products & Prices</h4>
          </div>
        </div>

        <div className="contact-body">
          {/* Filters */}
          <div className="admin-filter-bar">
            <input className="contact-input" placeholder="Cari nama / SKU" style={{ flex: 1.4 }} value={q} onChange={(e) => setQ(e.target.value)} />

            <select className="contact-input" style={{ flex: 1 }} value={gameId} onChange={(e) => setGameId(e.target.value)}>
              <option value="">Game: Semua</option>
              {games.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>

            <select className="contact-input" style={{ flex: 1 }} value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Tipe: Semua</option>
              <option value="TOPUP">TOPUP</option>
              <option value="JOKI">JOKI</option>
            </select>

            <select className="contact-input" style={{ flex: 0.8 }} value={active} onChange={(e) => setActive(e.target.value)}>
              <option value="">Status: Semua</option>
              <option value="1">Active</option>
              <option value="0">Off</option>
            </select>

            <div className="auto-width" style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button className="voucherBtn" type="button" onClick={load}>
                Filter
              </button>
              <Link className="voucherBtn" href="/admin/products/categories" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", background: "rgba(16,185,129,.15)", borderColor: "rgba(16,185,129,.3)" }}>
                📁 Kategori
              </Link>
              <Link className="voucherBtn" href="/admin/products/new" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                + New
              </Link>
            </div>
          </div>

          <div className="spacer" />

          <AdminTable columns={columns} rows={rows} rowKey={(r) => r._id} />
        </div>
      </div>
    </div>
  );
}
