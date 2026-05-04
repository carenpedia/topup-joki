"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminTable from "@/app/components/AdminTable";

type BannerRow = {
  id: string;
  title?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  isActive?: boolean | null;
  sortOrder?: number | null;
  startAt?: string | null;
  endAt?: string | null;
};

type GameRow = {
  id: string;
  key: string;
  name: string;
  bannerUrl: string | null;
};

type Column<T> = {
  key: string;
  title: string;
  render?: (row: T) => React.ReactNode;
};

function fmtDate(v?: string | null) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

const pillBtn: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,.10)",
  background: "rgba(0,0,0,.20)",
  color: "rgba(255,255,255,.92)",
  borderRadius: 14,
  padding: "12px 14px",
  fontWeight: 900,
  cursor: "pointer",
};

export default function AdminBannersPage() {
  const [activeTab, setActiveTab] = useState<"SLIDER" | "HEADER">("SLIDER");
  
  // Slider State
  const [banners, setBanners] = useState<BannerRow[]>([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [bannersStatus, setBannersStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [bannersQ, setBannersQ] = useState("");

  // Header State
  const [games, setGames] = useState<GameRow[]>([]);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [gamesQ, setGamesQ] = useState("");
  const [savingGameId, setSavingGameId] = useState<string | null>(null);
  const [uploadingGameId, setUploadingGameId] = useState<string | null>(null);

  async function handleGameBannerUpload(e: React.ChangeEvent<HTMLInputElement>, gameId: string) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingGameId(gameId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "games/banner");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Upload gagal");

      // After upload, directly update the DB
      await updateGameBanner(gameId, j.url);
      alert("Banner berhasil diupload!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploadingGameId(null);
    }
  }

  async function loadBanners() {
    setBannersLoading(true);
    try {
      const res = await fetch("/api/admin/banners");
      const j = await res.json();
      const data: BannerRow[] = Array.isArray(j) ? j : Array.isArray(j?.rows) ? j.rows : [];
      setBanners(data);
    } catch (e) {
      console.error(e);
      setBanners([]);
    } finally {
      setBannersLoading(false);
    }
  }

  async function loadGames() {
    setGamesLoading(true);
    try {
      const res = await fetch("/api/admin/games");
      const j = await res.json();
      const data: GameRow[] = Array.isArray(j.items) ? j.items : [];
      setGames(data);
    } catch (e) {
      console.error(e);
      setGames([]);
    } finally {
      setGamesLoading(false);
    }
  }

  useEffect(() => {
    if (activeTab === "SLIDER") loadBanners();
    else loadGames();
  }, [activeTab]);

  const filteredBanners = useMemo(() => {
    const s = bannersQ.trim().toLowerCase();
    return banners.filter((r) => {
      const matchStatus = bannersStatus === "ALL" ? true : bannersStatus === "ACTIVE" ? !!r.isActive : !r.isActive;
      const matchSearch = !s ? true : `${r.title ?? ""} ${r.linkUrl ?? ""}`.toLowerCase().includes(s);
      return matchStatus && matchSearch;
    });
  }, [banners, bannersStatus, bannersQ]);

  const filteredGames = useMemo(() => {
    const s = gamesQ.trim().toLowerCase();
    return games.filter((r) => !s ? true : `${r.name} ${r.key}`.toLowerCase().includes(s));
  }, [games, gamesQ]);

  async function updateGameBanner(gameId: string, url: string) {
    setSavingGameId(gameId);
    try {
      const res = await fetch(`/api/admin/games/${gameId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bannerUrl: url.trim() || null }),
      });
      if (!res.ok) throw new Error("Gagal update");
      // Refresh local state
      setGames(prev => prev.map(g => g.id === gameId ? { ...g, bannerUrl: url.trim() || null } : g));
    } catch (e) {
      alert("Gagal menyimpan banner");
    } finally {
      setSavingGameId(null);
    }
  }

  const bannerColumns: Column<BannerRow>[] = useMemo(() => [
    {
      key: "title",
      title: "Judul",
      render: (r) => (
        <div style={{ fontWeight: 800 }}>
          {r.title || <span style={{ opacity: 0.7 }}>(tanpa judul)</span>}
          {r.sortOrder != null && <div style={{ opacity: 0.65, fontSize: 12, marginTop: 4 }}>Urutan: {r.sortOrder}</div>}
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (r) => (
        <span style={{
          padding: "6px 10px", borderRadius: 999, fontSize: 12, fontWeight: 900,
          border: "1px solid rgba(255,255,255,.12)",
          background: r.isActive ? "rgba(34,197,94,.18)" : "rgba(255,255,255,.06)",
          color: r.isActive ? "rgba(255,255,255,.92)" : "rgba(255,255,255,.75)",
          display: "inline-block",
        }}>
          {r.isActive ? "ACTIVE" : "INACTIVE"}
        </span>
      ),
    },
    { key: "startAt", title: "Mulai", render: (r) => fmtDate(r.startAt) },
    { key: "endAt", title: "Selesai", render: (r) => fmtDate(r.endAt) },
    {
      key: "action",
      title: "Aksi",
      render: (r) => (
        <Link href={`/admin/banners/${r.id}`} style={{ ...pillBtn, padding: "8px 12px", borderRadius: 12 }}>
          Edit
        </Link>
      ),
    },
  ], []);

  const gameColumns: Column<GameRow>[] = useMemo(() => [
    {
      key: "name",
      title: "Game",
      render: (r) => (
        <div style={{ fontWeight: 800 }}>
          {r.name}
          <div style={{ opacity: 0.65, fontSize: 12, marginTop: 4 }}>key: {r.key}</div>
        </div>
      ),
    },
    {
      key: "bannerUrl",
      title: "Banner URL (Topup Hero)",
      render: (r) => {
        const [temp, setTemp] = useState(r.bannerUrl || "");
        return (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              className="contact-input"
              style={{ padding: "8px 12px", fontSize: 13 }}
              value={temp}
              onChange={(e) => setTemp(e.target.value)}
              placeholder="https://..."
            />
            <button
              className="voucherBtn"
              style={{ padding: "8px 14px", fontSize: 12, whiteSpace: "nowrap" }}
              disabled={savingGameId === r.id || temp === (r.bannerUrl || "")}
              onClick={() => updateGameBanner(r.id, temp)}
            >
              {savingGameId === r.id ? "..." : "Simpan"}
            </button>
            <label className="voucherBtn" style={{ padding: "8px 14px", fontSize: 12, whiteSpace: "nowrap", cursor: "pointer" }}>
              {uploadingGameId === r.id ? "..." : "📁 Upload"}
              <input 
                type="file" 
                accept="image/*" 
                style={{ display: "none" }} 
                onChange={(e) => handleGameBannerUpload(e, r.id)} 
                disabled={!!uploadingGameId}
              />
            </label>
          </div>
        );
      },
    },
    {
      key: "preview",
      title: "Preview",
      render: (r) => r.bannerUrl ? (
        <div style={{ width: 80, height: 45, borderRadius: 8, background: "#111", overflow: "hidden", border: "1px solid rgba(255,255,255,.05)" }}>
          <img src={r.bannerUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      ) : <span style={{ opacity: 0.4, fontSize: 12 }}>Kosong</span>,
    }
  ], [savingGameId]);

  return (
    <div className="contact-section">
      <div className="contact-card">
        <div className="contact-header">
          <div className="contact-step">B</div>
          <div className="contact-title-wrap">
            <div className="contact-title">Kelola Banner</div>
            <div className="contact-title-desc">Atur visual promosi dan hero section website.</div>
          </div>
        </div>

        <div className="contact-body">
          {/* TABS */}
          <div style={{ display: "flex", gap: 10, marginBottom: 24, borderBottom: "1px solid rgba(255,255,255,.05)", paddingBottom: 16 }}>
            <button
              onClick={() => setActiveTab("SLIDER")}
              style={{
                ...pillBtn,
                background: activeTab === "SLIDER" ? "rgba(59,130,246,.92)" : "rgba(255,255,255,.05)",
                borderColor: activeTab === "SLIDER" ? "rgba(59,130,246,.35)" : "rgba(255,255,255,.08)",
                color: activeTab === "SLIDER" ? "#fff" : "rgba(255,255,255,.7)",
              }}
            >
              Slide Homepage
            </button>
            <button
              onClick={() => setActiveTab("HEADER")}
              style={{
                ...pillBtn,
                background: activeTab === "HEADER" ? "rgba(59,130,246,.92)" : "rgba(255,255,255,.05)",
                borderColor: activeTab === "HEADER" ? "rgba(59,130,246,.35)" : "rgba(255,255,255,.08)",
                color: activeTab === "HEADER" ? "#fff" : "rgba(255,255,255,.7)",
              }}
            >
              Header Topup Game
            </button>
          </div>

          {activeTab === "SLIDER" ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <div style={{ display: "flex", gap: 12 }}>
                  <select
                    className="contact-input"
                    style={{ padding: "8px 14px", width: "auto" }}
                    value={bannersStatus}
                    onChange={(e) => setBannersStatus(e.target.value as any)}
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="ACTIVE">Aktif</option>
                    <option value="INACTIVE">Mati</option>
                  </select>
                  <input
                    className="contact-input"
                    style={{ padding: "8px 14px", width: 200 }}
                    placeholder="Cari banner..."
                    value={bannersQ}
                    onChange={(e) => setBannersQ(e.target.value)}
                  />
                </div>
                <Link href="/admin/banners/new" style={{ ...pillBtn, background: "rgba(59,130,246,.92)", textDecoration: "none" }}>
                  + Tambah Slide
                </Link>
              </div>

              {bannersLoading ? <div className="cardMuted">Memuat data...</div> : (
                <AdminTable<BannerRow> columns={bannerColumns} rows={filteredBanners} rowKey={r => r.id} />
              )}
            </>
          ) : (
            <>
              <div style={{ marginBottom: 18 }}>
                <input
                  className="contact-input"
                  style={{ padding: "8px 14px", maxWidth: 350 }}
                  placeholder="Cari nama game..."
                  value={gamesQ}
                  onChange={(e) => setGamesQ(e.target.value)}
                />
              </div>

              {gamesLoading ? <div className="cardMuted">Memuat daftar game...</div> : (
                <AdminTable<GameRow> columns={gameColumns} rows={filteredGames} rowKey={r => r.id} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
