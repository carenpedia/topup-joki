"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

export default function ResellerDashboard() {
  // TODO: Fetch dari order status SUCCESS asli sesuai role user
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Constants for map
  const TYPE_MAP: Record<string, { label: string; color: string }> = {
    ADJUST: { label: "Adjustment", color: "#60a5fa" },
    DEPOSIT: { label: "Topup", color: "#10b981" },
    PAYMENT: { label: "Order", color: "#ef4444" },
    REFUND: { label: "Refund", color: "#f59e0b" },
  };

  const load = async () => {
    try {
      const res = await fetch("/api/user/ledger");
      const j = await res.json();
      if (res.ok) setLedger(j.ledger.slice(0, 5));
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const salesData = useMemo(() => {
    return {
      today: { count: 12, revenue: 350000, profit: 45000 },
      week: { count: 86, revenue: 2150000, profit: 320000 },
      month: { count: 342, revenue: 10500000, profit: 1540000 },
    };
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Dashboard Akun</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>
          Statistik performa penjualan dan manajemen saldo <span style={{ color: "#f59e0b", fontWeight: 700 }}>VIP Reseller</span> Anda.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, marginBottom: 40 }}>
        {/* Hari Ini */}
        <div style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(0,0,0,0.3))", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 20, padding: 24, position: "relative", overflow: "hidden" }}>
           <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, background: "radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
           <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Hari Ini</div>
           <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 4 }}>Rp {salesData.today.revenue.toLocaleString("id-ID")}</div>
           <div style={{ fontSize: 13, color: "#10b981", fontWeight: 700 }}>+{salesData.today.count} Transaksi</div>
        </div>

        {/* Minggu Ini */}
        <div style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(0,0,0,0.3))", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 20, padding: 24, position: "relative", overflow: "hidden" }}>
           <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, background: "radial-gradient(circle, rgba(245,158,11,0.3) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
           <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Minggu Ini</div>
           <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 4 }}>Rp {salesData.week.revenue.toLocaleString("id-ID")}</div>
           <div style={{ fontSize: 13, color: "#10b981", fontWeight: 700 }}>+{salesData.week.count} Transaksi</div>
        </div>

        {/* Bulan Ini */}
        <div style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(0,0,0,0.3))", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 20, padding: 24, position: "relative", overflow: "hidden" }}>
           <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, background: "radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
           <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Bulan Ini</div>
           <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 4 }}>Rp {salesData.month.revenue.toLocaleString("id-ID")}</div>
           <div style={{ fontSize: 13, color: "#10b981", fontWeight: 700 }}>+{salesData.month.count} Transaksi</div>
        </div>
      </div>

      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 24, padding: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
             <h3 style={{ fontSize: 20, fontWeight: 900 }}>Aktivitas Mutasi Terbaru</h3>
             <Link href="/user/history" style={{ color: "#60a5fa", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>Lihat Semua →</Link>
          </div>

          {loading ? (
             <div style={{ padding: 20, textAlign: "center", opacity: 0.5 }}>Loading aktivitas...</div>
          ) : ledger.length === 0 ? (
             <div style={{ padding: 20, textAlign: "center", color: "rgba(255,255,255,0.3)" }}>Belum ada mutasi saldo.</div>
          ) : (
             <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
               {ledger.map((entry) => {
                 const config = TYPE_MAP[entry.type] || { label: entry.type, color: "#fff" };
                 const isPositive = entry.amount > 0;
                 return (
                   <div key={entry.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 16, padding: "14px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                         <div style={{ width: 36, height: 36, borderRadius: 10, background: isPositive ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.04)", display: "grid", placeItems: "center", fontSize: 14 }}>
                            {isPositive ? "📈" : "📉"}
                         </div>
                         <div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: config.color }}>{config.label}</div>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.47)", fontWeight: 700, marginTop: 2 }}>{new Date(entry.createdAt).toLocaleDateString("id-ID")}</div>
                         </div>
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: isPositive ? "#10b981" : "#fff"  }}>
                        {isPositive ? "+" : ""}{entry.amount.toLocaleString("id-ID")}
                      </div>
                   </div>
                 );
               })}
             </div>
          )}
      </div>

    </div>
  );
}

type LedgerEntry = {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  reason: string | null;
  createdAt: string;
};
