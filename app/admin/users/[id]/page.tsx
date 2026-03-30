"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";


type UserDetail = {
  id: string;
  username: string;
  whatsapp: string;
  role: "MEMBER" | "RESELLER" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED";
  carencoinBalance: number;
  pointsBalance: number;
  resellerJoinedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const r = useRouter();

  const [row, setRow] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [err, setErr] = useState("");

  const [balanceAmount, setBalanceAmount] = useState("");
  const [balanceReason, setBalanceReason] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(`/api/admin/users/${id}`, { cache: "no-store" });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Gagal load user");
      setRow(j.row);
    } catch (e: any) {
      setErr(e?.message || "Gagal load user");
      setRow(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function patch(data: Partial<Pick<UserDetail, "role" | "status">>) {
    if (!row) return;
    setUpdating(true);
    setErr("");
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || "Gagal update user");
      setRow(j.row);
    } catch (e: any) {
      setErr(e?.message || "Gagal update user");
    } finally {
      setUpdating(false);
    }
  }

  async function onDelete() {
    if (!row) return;
    if (row.role === "ADMIN") {
      alert("Akun ADMIN tidak bisa dihapus.");
      return;
    }
    const ok = confirm(`Hapus user "${row.username}" dari database? (tidak bisa dibatalkan)`);
    if (!ok) return;

    setUpdating(true);
    setErr("");
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal hapus user");
      r.push("/admin/users");
      r.refresh();
    } catch (e: any) {
      setErr(e?.message || "Gagal hapus user");
    } finally {
      setUpdating(false);
    }
  }

  async function updateBalance() {
    if (!row) return;
    const amount = parseInt(balanceAmount);
    if (isNaN(amount) || amount === 0) {
      alert("Masukkan jumlah angka yang valid (tidak boleh 0).");
      return;
    }

    setUpdating(true);
    setErr("");
    try {
      const res = await fetch(`/api/admin/users/${id}/balance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, reason: balanceReason }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Gagal update saldo");
      
      alert(`Berhasil memperbarui saldo. Saldo baru: ${j.balance}`);
      setBalanceAmount("");
      setBalanceReason("");
      load();
    } catch (e: any) {
      setErr(e?.message || "Gagal update saldo");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* Header Profile Style */}
      <div style={{ 
        display: "flex", alignItems: "center", justifyContent: "space-between", 
        marginBottom: 24, gap: 16, flexWrap: "wrap",
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: 24, padding: "20px 24px" 
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ 
            width: 64, height: 64, borderRadius: 20, 
            background: "linear-gradient(135deg, #3b82f6, #60a5fa)",
            display: "grid", placeItems: "center", fontSize: 24, fontWeight: 900, color: "#fff"
          }}>
            {row?.username.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 980, color: "#fff", margin: 0 }}>
              {row?.username || "Loading..."}
            </h1>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 600, display: "flex", gap: 12, alignItems: "center", marginTop: 4 }}>
              <span title={row?.id}>UID: {row ? `${row.id.substring(0, 8)}...` : "..."}</span>
              <button 
                onClick={() => { navigator.clipboard.writeText(row?.id || ""); alert("ID diagalin!"); }}
                style={{ background: "none", border: "none", color: "#60a5fa", cursor: "pointer", fontSize: 11, fontWeight: 700, padding: 0 }}
              >
                Copy ID
              </button>
            </div>
          </div>
        </div>
        
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-ghost btn-sm" onClick={() => r.push("/admin/users")}>← Back to List</button>
          <button className="btn-ghost btn-sm" onClick={load} disabled={loading}>Refresh</button>
          <button className="btn-danger btn-sm" onClick={onDelete} disabled={updating || row?.role === "ADMIN"}>Hapus User</button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", opacity: 0.5, fontWeight: 800 }}>Loading User Details...</div>
      ) : err && !row ? (
        <div style={{ padding: 40, background: "rgba(220,38,38,0.1)", borderRadius: 20, color: "#f87171", textAlign: "center", border: "1px solid rgba(220,38,38,0.2)" }}>
           {err}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Main Grid: Info | Balances | Reseller */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", 
            gap: 24 
          }}>
            {/* Account Info Card */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 24, padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 900, marginBottom: 20, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: 0.5 }}>Info Akun</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                   <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>No. WhatsApp</label>
                   <div style={{ fontSize: 15, fontWeight: 700 }}>{row?.whatsapp}</div>
                </div>

                <div style={{ display: "flex", gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>Role Pengguna</label>
                    <select 
                      value={row?.role} 
                      onChange={(e) => patch({ role: e.target.value as any })}
                      disabled={updating || row?.role === "ADMIN"}
                      style={{ 
                        width: "100%", padding: "10px 12px", borderRadius: 12, 
                        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                        color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", outline: "none"
                      }}
                    >
                      <option value="MEMBER">Member</option>
                      <option value="RESELLER">Reseller</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>Status Akun</label>
                    <select 
                      value={row?.status} 
                      onChange={(e) => patch({ status: e.target.value as any })}
                      disabled={updating || row?.role === "ADMIN"}
                      style={{ 
                        width: "100%", padding: "10px 12px", borderRadius: 12, 
                        background: row?.status === "ACTIVE" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", 
                        border: `1px solid ${row?.status === "ACTIVE" ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
                        color: row?.status === "ACTIVE" ? "#10b981" : "#ef4444", 
                        fontWeight: 700, fontSize: 13, cursor: "pointer", outline: "none"
                      }}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="SUSPENDED">Suspended</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Balances Card */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 24, padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 900, marginBottom: 20, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: 0.5 }}>Saldo & Points</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.1)", borderRadius: 16, padding: "16px 20px" }}>
                   <div style={{ fontSize: 11, color: "#f59e0b", fontWeight: 800, textTransform: "uppercase", marginBottom: 4 }}>Carencoin Balance</div>
                   <div style={{ fontSize: 24, fontWeight: 950, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ color: "#f59e0b" }}>🪙</span> {row?.carencoinBalance.toLocaleString("id-ID")}
                   </div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "16px 20px" }}>
                   <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 800, textTransform: "uppercase", marginBottom: 4 }}>Loyalty Points</div>
                   <div style={{ fontSize: 18, fontWeight: 950, color: "#fff" }}>
                      ⭐ {row?.pointsBalance.toLocaleString("id-ID")}
                   </div>
                </div>
              </div>
            </div>

            {/* Date Info Card */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 24, padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 900, marginBottom: 20, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: 0.5 }}>Timestamp</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                 <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Terdaftar Pada</label>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{row ? new Date(row.createdAt).toLocaleString("id-ID") : "-"}</div>
                 </div>
                 <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Update Terakhir</label>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{row ? new Date(row.updatedAt).toLocaleString("id-ID") : "-"}</div>
                 </div>
                 {row?.resellerJoinedAt && (
                   <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#60a5fa", textTransform: "uppercase" }}>Joined Reseller</label>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{new Date(row.resellerJoinedAt).toLocaleString("id-ID")}</div>
                   </div>
                 )}
              </div>
            </div>
          </div>

          {/* Balance Management (Manual Adjustment) */}
          <div style={{ 
            background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(37,99,235,0.02))", 
            border: "1px solid rgba(59,130,246,0.2)", 
            borderRadius: 24, padding: 24 
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 900, marginBottom: 20, color: "#60a5fa", textTransform: "uppercase", letterSpacing: 0.5 }}>Kelola Saldo Manual</h3>
            
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6 }}>Jumlah (+ menambah, - mengurangi)</label>
                <input 
                  type="number" 
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  placeholder="e.g. 10000"
                  style={{ 
                    width: "100%", padding: "12px 14px", borderRadius: 14, 
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff", fontWeight: 700, outline: "none"
                  }}
                />
              </div>
              <div style={{ flex: 2, minWidth: 240 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6 }}>Alasan / Catatan Penyesuaian</label>
                <input 
                  type="text" 
                  value={balanceReason}
                  onChange={(e) => setBalanceReason(e.target.value)}
                  placeholder="e.g. Koreksi Saldo atau Bonus"
                  style={{ 
                    width: "100%", padding: "12px 14px", borderRadius: 14, 
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff", fontWeight: 700, outline: "none"
                  }}
                />
              </div>
              <button 
                className="btn btnPrimary" 
                style={{ padding: "14px 28px", borderRadius: 14, fontWeight: 900 }}
                onClick={updateBalance}
                disabled={updating}
              >
                {updating ? "Memproses..." : "Update Saldo & Ledger"}
              </button>
            </div>
            {err && <div style={{ marginTop: 16, color: "#f87171", fontWeight: 700, fontSize: 14 }}>{err}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
