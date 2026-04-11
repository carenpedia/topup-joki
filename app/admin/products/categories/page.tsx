"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Game = { id: string; name: string };
type Category = {
  id: string;
  name: string;
  type: "TOPUP" | "JOKI";
  order: number;
  _count: { products: number };
};

export default function AdminProductCategoriesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [gameId, setGameId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<Category["type"]>("TOPUP");
  const [newOrder, setNewOrder] = useState("0");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadGames() {
    const res = await fetch("/api/admin/games?active=1");
    const j = await res.json().catch(() => ({}));
    const items = j.items ?? [];
    setGames(items);
    if (items.length > 0 && !gameId) setGameId(items[0].id);
  }

  async function loadCategories() {
    if (!gameId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/product-categories?gameId=${gameId}`);
      const j = await res.json().catch(() => ({}));
      setCategories(j.items ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGames();
  }, []);

  useEffect(() => {
    loadCategories();
  }, [gameId]);

  async function onAdd() {
    if (!newName.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/product-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          gameId,
          type: newType,
          order: Number(newOrder),
        }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error || "Gagal menambah kategori");
      }
      setNewName("");
      setNewType("TOPUP");
      setNewOrder("0");
      loadCategories();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Hapus kategori ini?")) return;
    try {
      const res = await fetch(`/api/admin/product-categories/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error || "Gagal hapus");
      }
      loadCategories();
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function onUpdateOrder(id: string, order: number) {
    await fetch(`/api/admin/product-categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order })
    });
    loadCategories();
  }

  return (
    <div className="contact-section">
      <div className="contact-card">
        <div className="contact-header">
          <div className="contact-step">C</div>
          <div className="contact-title-wrap">
            <h4 className="contact-title">Kelola Kategori Produk Per Game</h4>
          </div>
        </div>

        <div className="contact-body">
          <div style={{ marginBottom: 20 }}>
            <label className="contact-label">Pilih Game</label>
            <select
              className="contact-input"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
            >
              <option value="">Pilih Game...</option>
              {games.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          {gameId && (
            <>
              <div style={{ background: "rgba(255,255,255,.03)", padding: 16, borderRadius: 14, border: "1px solid rgba(255,255,255,.05)", marginBottom: 20 }}>
                <div style={{ fontWeight: 900, marginBottom: 12 }}>Tambah Kategori Baru</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ flex: 2 }}>
                    <label className="contact-label">Nama Kategori</label>
                    <input
                      className="contact-input"
                      placeholder="Contoh: Diamond, Weekly Pass"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="contact-label">Tipe</label>
                    <select
                      className="contact-input"
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                    >
                      <option value="TOPUP">TOPUP</option>
                      <option value="JOKI">JOKI</option>
                    </select>
                  </div>
                  <div style={{ flex: 0.5 }}>
                    <label className="contact-label">Urutan</label>
                    <input
                      className="contact-input"
                      type="number"
                      value={newOrder}
                      onChange={(e) => setNewOrder(e.target.value)}
                    />
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-end" }}>
                    <button
                      className="voucherBtn"
                      onClick={onAdd}
                      disabled={saving}
                      style={{ height: 42 }}
                    >
                      {saving ? "..." : "+ Tambah"}
                    </button>
                  </div>
                </div>
                {error && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 8 }}>{error}</div>}
              </div>

              <div style={{ fontWeight: 900, marginBottom: 10 }}>Daftar Kategori</div>
              {loading ? (
                <div className="cardMuted">Loading categories...</div>
              ) : categories.length === 0 ? (
                <div className="cardMuted">Belum ada kategori untuk game ini.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {categories.map((c) => (
                    <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "rgba(255,255,255,.04)", borderRadius: 12, border: "1px solid rgba(255,255,255,.06)" }}>
                      <div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <div style={{ fontWeight: 800 }}>{c.name}</div>
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 900,
                              padding: "2px 6px",
                              borderRadius: 6,
                              background: c.type === "JOKI" ? "rgba(139,92,246,.2)" : "rgba(16,185,129,.2)",
                              color: c.type === "JOKI" ? "#a78bfa" : "#34d399",
                              border: `1px solid ${c.type === "JOKI" ? "rgba(139,92,246,.3)" : "rgba(16,185,129,.3)"}`,
                            }}
                          >
                            {c.type}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>{c._count.products} Produk</div>
                      </div>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                           <button onClick={() => onUpdateOrder(c.id, c.order - 1)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 10 }}>▲</button>
                           <span style={{ fontSize: 12, fontWeight: 900 }}>{c.order}</span>
                           <button onClick={() => onUpdateOrder(c.id, c.order + 1)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 10 }}>▼</button>
                        </div>
                        <button
                          onClick={() => onDelete(c.id)}
                          style={{
                            padding: "6px 10px",
                            borderRadius: 8,
                            border: "1px solid rgba(239,68,68,.3)",
                            background: "rgba(239,68,68,.1)",
                            color: "#fca5a5",
                            fontSize: 11,
                            fontWeight: 800,
                            cursor: "pointer"
                          }}
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="spacer" />
          <Link href="/admin/products" className="voucherBtn" style={{ textDecoration: "none", display: "inline-block" }}>
             ← Kembali ke Daftar Produk
          </Link>
        </div>
      </div>
    </div>
  );
}
