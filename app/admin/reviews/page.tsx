"use client";

import { useEffect, useState } from "react";
import AdminTable from "../../components/AdminTable";

type Review = {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  gameId: string | null;
  isVerified: boolean;
  createdAt: string;
};

type Game = {
  id: string;
  name: string;
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [userName, setUserName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [gameId, setGameId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      // Fetch reviews
      const revRes = await fetch("/api/reviews");
      const revData = await revRes.json();
      setReviews(revData.reviews || []);

      // Fetch games for selection
      const gameRes = await fetch("/api/admin/games");
      const gameData = await gameRes.json();
      setGames(gameData.items || []);
    } catch (e) {
      alert("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName, rating, comment, gameId }),
      });
      if (res.ok) {
        alert("Ulasan berhasil ditambahkan!");
        setUserName("");
        setComment("");
        setRating(5);
        setGameId("");
        setShowForm(false);
        loadData();
      } else {
        const error = await res.json();
        alert(error.error || "Gagal menyimpan ulasan");
      }
    } catch (e) {
      alert("Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus ulasan ini?")) return;
    try {
      const res = await fetch(`/api/reviews?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("Berhasil dihapus");
        loadData();
      }
    } catch (e) {
      alert("Gagal menghapus");
    }
  }

  const columns = [
    { key: "user", title: "User" },
    { key: "rating", title: "Rating", width: 100 },
    { key: "comment", title: "Komentar" },
    { key: "game", title: "Game", width: 150 },
    { key: "action", title: "Aksi", width: 100 },
  ];

  const rows = reviews.map((r) => ({
    user: <b style={{ color: "#fff" }}>{r.userName}</b>,
    rating: (
      <div style={{ color: "#fbbf24", fontWeight: 800 }}>
        {r.rating} ⭐
      </div>
    ),
    comment: <span style={{ fontSize: 13, opacity: 0.8 }}>{r.comment}</span>,
    game: <span>{games.find(g => g.id === r.gameId)?.name || "Umum"}</span>,
    action: (
      <button 
        onClick={() => handleDelete(r.id)}
        style={{ 
          background: "rgba(239,68,68,0.1)", 
          color: "#ef4444", 
          border: "1px solid rgba(239,68,68,0.2)",
          padding: "4px 10px",
          borderRadius: "8px",
          fontSize: "12px",
          cursor: "pointer"
        }}
      >
        Hapus
      </button>
    ),
    _id: r.id
  }));

  return (
    <div className="contact-section">
      <div className="contact-card">
        <div className="contact-header" style={{ justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div className="contact-step">⭐</div>
            <div className="contact-title-wrap">
              <h4 className="contact-title">Manajemen Ulasan</h4>
            </div>
          </div>
          <button 
            className="voucherBtn" 
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Tutup Form" : "+ Tambah Manual"}
          </button>
        </div>

        <div className="contact-body">
          {showForm && (
            <form onSubmit={handleSubmit} style={{ marginBottom: 30, background: "rgba(255,255,255,0.03)", padding: 20, borderRadius: 20, border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, marginBottom: 6, fontWeight: 700 }}>Nama User</label>
                  <input className="contact-input" value={userName} onChange={e => setUserName(e.target.value)} placeholder="Tampilkan nama sultan..." required />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, marginBottom: 6, fontWeight: 700 }}>Rating (1-5)</label>
                  <select className="contact-input" value={rating} onChange={e => setRating(Number(e.target.value))}>
                    <option value="5">5 Bintang (Puas)</option>
                    <option value="4">4 Bintang</option>
                    <option value="3">3 Bintang</option>
                    <option value="2">2 Bintang</option>
                    <option value="1">1 Bintang</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: 16 }}>
                <label style={{ display: "block", fontSize: 12, marginBottom: 6, fontWeight: 700 }}>Target Game (Opsional)</label>
                <select className="contact-input" value={gameId} onChange={e => setGameId(e.target.value)}>
                  <option value="">Semua Game / Global</option>
                  {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div style={{ marginTop: 16 }}>
                <label style={{ display: "block", fontSize: 12, marginBottom: 6, fontWeight: 700 }}>Komentar Ulasan</label>
                <textarea 
                  className="contact-input" 
                  style={{ minHeight: 80, paddingTop: 12 }} 
                  value={comment} 
                  onChange={e => setComment(e.target.value)} 
                  placeholder="Ceritakan pengalaman satset..." 
                  required 
                />
              </div>
              <button 
                className="voucherBtn" 
                type="submit" 
                disabled={submitting} 
                style={{ marginTop: 20, width: "100%", height: 48 }}
              >
                {submitting ? "Menyimpan..." : "Simpan Ulasan Social Proof"}
              </button>
            </form>
          )}

          <AdminTable columns={columns} rows={rows} rowKey={r => r._id} />
          {reviews.length === 0 && !loading && (
            <div style={{ textAlign: "center", padding: "40px", opacity: 0.5 }}>
              Belum ada ulasan nyata di database.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
