"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Detail = {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  gameCount: number;
  createdAt: string;
  updatedAt: string;
};

type GameItem = {
  id: string;
  key: string;
  name: string;
  logoUrl: string | null;
};

export default function CategoryDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [data, setData] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Game assignment
  const [allGames, setAllGames] = useState<GameItem[]>([]);
  const [linkedIds, setLinkedIds] = useState<Set<string>>(new Set());
  const [toggling, setToggling] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/categories/${params.id}`, {
        cache: "no-store",
      });
      const j = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(j?.error || "Gagal load detail");
        return;
      }

      setData(j.row || null);
      setAllGames(Array.isArray(j.allGames) ? j.allGames : []);
      setLinkedIds(new Set(Array.isArray(j.linkedGameIds) ? j.linkedGameIds : []));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!data) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/categories/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          sortOrder: data.sortOrder,
          isActive: data.isActive,
        }),
      });

      const j = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(j?.error || "Gagal update");
        return;
      }

      alert("Berhasil diupdate");
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm("Yakin hapus kategori ini?")) return;

    const res = await fetch(`/api/admin/categories/${params.id}`, {
      method: "DELETE",
    });

    const j = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert(j?.error || "Gagal hapus");
      return;
    }

    router.push("/admin/categories");
    router.refresh();
  }

  async function toggleGame(gameId: string) {
    const isEnabled = linkedIds.has(gameId);
    setToggling(gameId);

    try {
      const res = await fetch("/api/admin/game-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId,
          categoryId: params.id,
          enabled: !isEnabled,
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j?.error || "Gagal toggle game");
        return;
      }

      // Update local state
      setLinkedIds((prev) => {
        const next = new Set(prev);
        if (isEnabled) {
          next.delete(gameId);
        } else {
          next.add(gameId);
        }
        return next;
      });
    } finally {
      setToggling(null);
    }
  }

  if (loading) {
    return <div className="contact-section">Loading...</div>;
  }

  if (!data) {
    return <div className="contact-section">Data tidak ditemukan.</div>;
  }

  return (
    <div className="contact-section">
      {/* Detail & Edit Form */}
      <div className="contact-card">
        <div className="contact-header">
          <div className="contact-step">C</div>
          <div className="contact-title-wrap">
            <h4 className="contact-title">Detail Kategori</h4>
          </div>
        </div>

        <div className="contact-body">
          {/* Info readonly */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "140px 1fr",
              gap: "8px 16px",
              fontSize: 14,
              marginBottom: 20,
            }}
          >
            <span style={{ opacity: 0.7 }}>ID</span>
            <span>{data.id}</span>

            <span style={{ opacity: 0.7 }}>Jumlah Game</span>
            <span>{linkedIds.size} game terhubung</span>
          </div>

          <form onSubmit={save} style={{ display: "grid", gap: 12 }}>
            <div>
              <label className="contact-label">Nama Kategori</label>
              <input
                className="contact-input"
                placeholder="Nama Kategori"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
              />
            </div>

            <div>
              <label className="contact-label">Sort Order (urutan tampil di homepage)</label>
              <input
                className="contact-input"
                type="number"
                placeholder="Sort Order"
                value={data.sortOrder}
                onChange={(e) =>
                  setData({ ...data, sortOrder: Number(e.target.value) })
                }
              />
              <p className="contact-hint" style={{ marginTop: 4 }}>Angka lebih kecil = ditampilkan lebih dulu</p>
            </div>

            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={data.isActive}
                onChange={(e) =>
                  setData({ ...data, isActive: e.target.checked })
                }
              />
              <span>Active</span>
            </label>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                className="btn-ghost btn-xs"
                onClick={() => router.back()}
              >
                Kembali
              </button>
              <button
                type="button"
                className="btn-ghost btn-xs"
                onClick={remove}
                style={{ color: "#ef4444" }}
              >
                Hapus
              </button>
              <button
                type="submit"
                className="btn-primary btn-xs"
                disabled={saving}
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Game Assignment */}
      <div className="contact-card" style={{ marginTop: 16 }}>
        <div className="contact-header">
          <div className="contact-step">G</div>
          <div className="contact-title-wrap">
            <h4 className="contact-title">Kelola Game di Kategori Ini</h4>
          </div>
        </div>

        <div className="contact-body">
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.55)", marginBottom: 16 }}>
            Centang game yang ingin ditampilkan pada kategori <strong style={{ color: "rgba(255,255,255,.9)" }}>&quot;{data.name}&quot;</strong> di homepage.
          </p>

          {allGames.length === 0 ? (
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)" }}>
              Belum ada game aktif. Tambahkan game terlebih dahulu di menu Games.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {allGames.map((game) => {
                const isLinked = linkedIds.has(game.id);
                const isTogglingThis = toggling === game.id;

                return (
                  <button
                    key={game.id}
                    type="button"
                    onClick={() => toggleGame(game.id)}
                    disabled={isTogglingThis}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 14px",
                      borderRadius: 12,
                      border: `1px solid ${isLinked ? "rgba(59,130,246,.35)" : "rgba(255,255,255,.08)"}`,
                      background: isLinked ? "rgba(59,130,246,.10)" : "rgba(255,255,255,.03)",
                      cursor: isTogglingThis ? "wait" : "pointer",
                      transition: "all .2s ease",
                      textAlign: "left",
                      width: "100%",
                      color: "inherit",
                    }}
                  >
                    {/* Checkbox visual */}
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 6,
                        border: `2px solid ${isLinked ? "#3b82f6" : "rgba(255,255,255,.25)"}`,
                        background: isLinked ? "#3b82f6" : "transparent",
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                        transition: "all .15s ease",
                      }}
                    >
                      {isLinked && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>

                    {/* Game logo */}
                    {game.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={game.logoUrl}
                        alt={game.name}
                        referrerPolicy="no-referrer"
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          objectFit: "cover",
                          border: "1px solid rgba(255,255,255,.08)",
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: "rgba(59,130,246,.15)",
                          display: "grid",
                          placeItems: "center",
                          fontSize: 12,
                          fontWeight: 900,
                          color: "#60a5fa",
                          flexShrink: 0,
                        }}
                      >
                        {game.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}

                    {/* Game info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,.92)" }}>
                        {game.name}
                      </div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginTop: 1 }}>
                        /{game.key}
                      </div>
                    </div>

                    {/* Status badge */}
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        padding: "4px 8px",
                        borderRadius: 6,
                        background: isLinked ? "rgba(34,197,94,.12)" : "rgba(255,255,255,.04)",
                        color: isLinked ? "#22c55e" : "rgba(255,255,255,.35)",
                      }}
                    >
                      {isTogglingThis ? "..." : isLinked ? "AKTIF" : "—"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
