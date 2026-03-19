"use client";

import { useMemo } from "react";

export default function ResellerDashboard() {
  // TODO: Fetch dari order status SUCCESS asli sesuai role user
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
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Data Penjualan</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>
          Statistik performa penjualan akun <span style={{ color: "#f59e0b", fontWeight: 700 }}>VIP Reseller</span> Anda. Data di-reset otomatis sesuai periode.
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

      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 24, padding: 32, textAlign: "center" }}>
          <div style={{ margin: "0 auto", width: 64, height: 64, borderRadius: "50%", background: "rgba(59,130,246,0.1)", display: "grid", placeItems: "center", color: "#60a5fa", marginBottom: 16 }}>
             <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Fitur Riwayat Datang Sebentar Lagi</h3>
          <p style={{ color: "rgba(255,255,255,0.5)", maxWidth: 400, margin: "0 auto", fontSize: 14 }}>Daftar log order pelanggan terakhir yang membeli dari tautan Reseller Anda akan muncul di sini pada udpate selajutnya.</p>
      </div>

    </div>
  );
}
