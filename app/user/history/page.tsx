"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type LedgerEntry = {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  reason: string | null;
  createdAt: string;
};

const TYPE_MAP: Record<string, { label: string; color: string }> = {
  ADJUST: { label: "Penyesuaian Admin", color: "#60a5fa" },
  DEPOSIT: { label: "Topup Saldo", color: "#10b981" },
  PAYMENT: { label: "Pembayaran Order", color: "#ef4444" },
  REFUND: { label: "Refund Saldo", color: "#f59e0b" },
};

export default function UserHistoryPage() {
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/user/ledger");
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Gagal mengambil data riwayat");
      setLedger(j.ledger);
    } catch (e: any) {
      setErr(e?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, gap: 16 }}>
        <div>
           <h1 style={{ fontSize: 26, fontWeight: 950, color: "#fff", marginBottom: 6 }}>Riwayat Mutasi</h1>
           <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600 }}>Cek seluruh aktivitas keluar masuk saldo Carencoin Anda di sini.</p>
        </div>
        <Link href="/user/profile" className="btn-ghost btn-sm" style={{ textDecoration: "none" }}>← Back to Profile</Link>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", opacity: 0.5, fontWeight: 800 }}>Loading History...</div>
      ) : err ? (
        <div style={{ padding: 32, background: "rgba(220,38,38,0.05)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 20, color: "#f87171", textAlign: "center", fontWeight: 700 }}>
           {err}
        </div>
      ) : ledger.length === 0 ? (
        <div style={{ padding: 48, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 24, textAlign: "center" }}>
           <div style={{ fontSize: 48, marginBottom: 16 }}>🧾</div>
           <h3 style={{ fontSize: 18, fontWeight: 850, color: "#fff", marginBottom: 8 }}>Belum Ada Transaksi</h3>
           <p style={{ color: "rgba(255,255,255,0.47)", maxWidth: 360, margin: "0 auto", fontSize: 14 }}>Riwayat mutasi saldo Anda akan muncul di sini setelah Anda melakukan topup atau belanja.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {ledger.map((entry) => {
            const config = TYPE_MAP[entry.type] || { label: entry.type, color: "rgba(255,255,255,0.5)" };
            const isPositive = entry.amount > 0;
            return (
              <div 
                key={entry.id} 
                style={{ 
                  background: "rgba(255,255,255,0.03)", 
                  border: "1px solid rgba(255,255,255,0.06)", 
                  borderRadius: 20, 
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ 
                    width: 44, height: 44, borderRadius: 14, 
                    background: isPositive ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.05)", 
                    display: "grid", placeItems: "center", fontSize: 16
                  }}>
                    {isPositive ? "📈" : "📉"}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: config.color, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                      {config.label}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
                       {entry.reason || "Tanpa catatan"}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 700, marginTop: 4 }}>
                       {new Date(entry.createdAt).toLocaleString("id-ID", { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                   <div style={{ fontSize: 17, fontWeight: 950, color: isPositive ? "#10b981" : "#fff" }}>
                      {isPositive ? "+" : ""}{entry.amount.toLocaleString("id-ID")}
                   </div>
                   <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 700, marginTop: 4 }}>
                      Saldo: {entry.balanceAfter.toLocaleString("id-ID")}
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
