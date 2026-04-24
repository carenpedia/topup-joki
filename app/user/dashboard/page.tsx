"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function UserDashboard() {
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [userRole, setUserRole] = useState<string>("MEMBER");
  const [stats, setStats] = useState({
    today: { count: 0, revenue: 0, profit: 0 },
    week: { count: 0, revenue: 0, profit: 0 },
    month: { count: 0, revenue: 0, profit: 0 },
  });
  const [loading, setLoading] = useState(true);

  // Constants for map
  const TYPE_MAP: Record<string, { label: string; color: string }> = {
    ADJUST: { label: "Adjustment", color: "#60a5fa" },
    DEPOSIT: { label: "Topup", color: "#10b981" },
    PAYMENT: { label: "Order", color: "#ef4444" },
    REFUND: { label: "Refund", color: "#f59e0b" },
  };

  const loadData = async () => {
    try {
      const [authRes, ledgerRes, statsRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/user/ledger"),
        fetch("/api/user/dashboard/stats")
      ]);
      
      const authJ = await authRes.json();
      const ledgerJ = await ledgerRes.json();
      const statsJ = await statsRes.json();

      if (authRes.ok && authJ.user) setUserRole(authJ.user.role);
      if (ledgerRes.ok) setLedger(ledgerJ.ledger.slice(0, 5));
      if (statsRes.ok) setStats(statsJ);
    } catch (e: any) {
      console.error("Dashboard Load Error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const isReseller = userRole === "RESELLER" || userRole === "ADMIN";

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Dashboard Akun</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>
          {isReseller ? (
            <>Statistik performa penjualan dan manajemen saldo <span style={{ color: "#f59e0b", fontWeight: 700 }}>VIP Reseller</span> Anda.</>
          ) : (
            <>Selamat datang kembali di dashboard <span style={{ color: "#3b82f6", fontWeight: 700 }}>CarenPedia</span>. Pantau aktivitas saldo Anda di sini.</>
          )}
        </p>
      </div>

      {/* Upgrade CTA - Only for Members */}
      {!isReseller && (
        <div style={{ 
          background: "linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(147,197,253,0.05) 100%)", 
          border: "1px solid rgba(59,130,246,0.2)", 
          borderRadius: 24, padding: "28px 32px", marginBottom: 40,
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20
        }}>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8, color: "#fff" }}>Ingin Harga Lebih Murah? 🚀</h3>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, margin: 0 }}>Dapatkan harga modal khusus agen dengan upgrade akun Anda menjadi VIP Reseller.</p>
          </div>
          <Link href="/reseller" style={{ 
            padding: "14px 28px", background: "#3b82f6", color: "#fff", 
            borderRadius: 14, fontWeight: 800, fontSize: 15, textDecoration: "none",
            boxShadow: "0 8px 20px rgba(59,130,246,0.3)", transition: "all 0.2s"
          }}>
            Upgrade ke Reseller Sekarang
          </Link>
        </div>
      )}

      {/* Stats Grid - Only for Resellers / Admin */}
      {isReseller && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, marginBottom: 40 }}>
          {/* Hari Ini */}
          <div style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(0,0,0,0.3))", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 20, padding: 24, position: "relative", overflow: "hidden" }}>
             <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, background: "radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
             <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Hari Ini</div>
             <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 4 }}>Rp {stats.today.revenue.toLocaleString("id-ID")}</div>
             <div style={{ fontSize: 13, color: "#10b981", fontWeight: 700 }}>+{stats.today.count} Transaksi</div>
          </div>

          {/* Minggu Ini */}
          <div style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(0,0,0,0.3))", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 20, padding: 24, position: "relative", overflow: "hidden" }}>
             <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, background: "radial-gradient(circle, rgba(245,158,11,0.3) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
             <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Minggu Ini</div>
             <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 4 }}>Rp {stats.week.revenue.toLocaleString("id-ID")}</div>
             <div style={{ fontSize: 13, color: "#10b981", fontWeight: 700 }}>+{stats.week.count} Transaksi</div>
          </div>

          {/* Bulan Ini */}
          <div style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(0,0,0,0.3))", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 20, padding: 24, position: "relative", overflow: "hidden" }}>
             <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, background: "radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
             <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Bulan Ini</div>
             <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 4 }}>Rp {stats.month.revenue.toLocaleString("id-ID")}</div>
             <div style={{ fontSize: 13, color: "#10b981", fontWeight: 700 }}>+{stats.month.count} Transaksi</div>
          </div>
        </div>
      )}

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
