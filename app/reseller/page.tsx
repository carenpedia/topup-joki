import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import JoinResellerClient from "./JoinResellerClient";
import { prisma } from "@/lib/prisma";

export default async function Reseller() {
  const priceSetting = await prisma.globalSetting.findUnique({
    where: { key: "RESELLER_UPGRADE_PRICE" }
  });
  const price = priceSetting?.value || "45000";

  return (
    <main className="page">
      <div className="bgGlow" aria-hidden="true" />
      <div className="gridFx" aria-hidden="true" />
      <Navbar />
      <div className="shell">

        {/* ... (Hero & Benefit Section remain same) ... */}
        
        {/* HERO SECTION */}
        <div className="section" style={{ textAlign: "center", marginTop: 60, marginBottom: 80 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 100, color: "#60a5fa", fontSize: 13, fontWeight: 700, marginBottom: 24 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#60a5fa", boxShadow: "0 0 10px #60a5fa" }} /> Program Reseller VIP
          </div>
          <h1 style={{ fontSize: 48, fontWeight: 900, lineHeight: 1.1, marginBottom: 16, background: "linear-gradient(to right, #ffffff, #93c5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Jadilah Mitra Kami,<br />Raih Keuntungan Maksimal
          </h1>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
            Bergabung ke dalam jaringan agen CarenPedia dan nikmati harga modal paling murah di Indonesia untuk semua produk digital.
          </p>
        </div>

        {/* BENEFIT GRID */}
        <div className="section" style={{ marginBottom: 80 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, textAlign: "center", marginBottom: 40 }}>Kenapa Harus Join Reseller?</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 24 }}>
            {/* Benefit 1 */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 24, padding: 32 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.05))", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>Harga Paling Miring</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>Dapatkan akses langsung ke harga modal / harga origin tanpa markup berlebih untuk semua game.</p>
            </div>

            {/* Benefit 2 */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 24, padding: 32 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(217,119,6,0.05))", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>Margin Bebas Atur</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>Jual kembali ke teman atau pelanggan Anda dengan harga yang Anda tentukan sendiri tanpa batas margin.</p>
            </div>

            {/* Benefit 3 */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 24, padding: 32 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, rgba(236,72,153,0.2), rgba(219,39,119,0.05))", border: "1px solid rgba(236,72,153,0.3)", color: "#f472b6", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>Prioritas Support VIP</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>Tiket komplain dan keluhan transaksi Anda akan ditangani lebih dulu oleh tim Customer Service kami.</p>
            </div>
          </div>
        </div>

        {/* COMPARISON TABLE */}
        <div className="section" style={{ marginBottom: 80 }}>
          <div className="tableWrap" style={{ maxWidth: 800, margin: "0 auto", padding: 1, background: "linear-gradient(180deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))" }}>
            <div style={{ background: "#0c0c16", borderRadius: 15, padding: "32px 0 0" }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, textAlign: "center", marginBottom: 32 }}>Perbandingan Keanggotaan</h2>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
                <thead>
                  <tr>
                    <th style={{ padding: "20px 24px", textAlign: "left", fontSize: 14, color: "white" }}>Fitur</th>
                    <th style={{ padding: "20px 24px", textAlign: "center", fontSize: 14, color: "rgba(255,255,255,0.5)" }}>Member Biasa</th>
                    <th style={{ padding: "20px 24px", textAlign: "center", fontSize: 14, color: "#60a5fa", background: "rgba(59,130,246,0.05)" }}>Reseller VIP</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "16px 24px", color: "rgba(255,255,255,0.8)" }}>Harga Produk Umum</td>
                    <td style={{ padding: "16px 24px", textAlign: "center", color: "rgba(255,255,255,0.5)" }}>Normal</td>
                    <td style={{ padding: "16px 24px", textAlign: "center", color: "#10b981", fontWeight: 700, background: "rgba(59,130,246,0.05)" }}>SUPER MURAH</td>
                  </tr>
                  <tr style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.01)" }}>
                    <td style={{ padding: "16px 24px", color: "rgba(255,255,255,0.8)" }}>Jalur Transaksi</td>
                    <td style={{ padding: "16px 24px", textAlign: "center", color: "rgba(255,255,255,0.5)" }}>Standar</td>
                    <td style={{ padding: "16px 24px", textAlign: "center", color: "#60a5fa", background: "rgba(59,130,246,0.05)" }}>Prioritas CS (Lebih Cepat)</td>
                  </tr>
                  <tr style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "16px 24px", color: "rgba(255,255,255,0.8)" }}>Fitur data Penjualan</td>
                    <td style={{ padding: "16px 24px", textAlign: "center", color: "rgba(255,255,255,0.5)" }}>❌</td>
                    <td style={{ padding: "16px 24px", textAlign: "center", color: "#10b981", background: "rgba(59,130,246,0.05)" }}>Data penjualan hari ini/minggu ini/bulan ini</td>
                  </tr>
                  <tr style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "16px 24px", color: "rgba(255,255,255,0.8)" }}>Akses Promo Spesial</td>
                    <td style={{ padding: "16px 24px", textAlign: "center", color: "rgba(255,255,255,0.5)" }}>❌</td>
                    <td style={{ padding: "16px 24px", textAlign: "center", color: "#10b981", background: "rgba(59,130,246,0.05)" }}>✅</td>
                  </tr>
                  <tr style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.01)" }}>
                    <td style={{ padding: "16px 24px", color: "rgba(255,255,255,0.8)" }}>Grup WhatsApp Eksklusif</td>
                    <td style={{ padding: "16px 24px", textAlign: "center", color: "rgba(255,255,255,0.5)" }}>❌</td>
                    <td style={{ padding: "16px 24px", textAlign: "center", color: "#10b981", background: "rgba(59,130,246,0.05)" }}>✅</td>
                  </tr>
                  <tr style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "24px", color: "rgba(255,255,255,0.8)" }}>Biaya Upgrade</td>
                    <td style={{ padding: "24px", textAlign: "center", color: "rgba(255,255,255,0.5)" }}>Gratis</td>
                    <td style={{ padding: "24px", textAlign: "center", color: "white", fontSize: 18, fontWeight: 900, background: "rgba(59,130,246,0.05)" }}>
                      Rp {Number(price).toLocaleString("id-ID")} 
                      <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.5)", display: "block" }}>Sekali Bayar Seumur Hidup</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* CTA SECTION */}
        <div className="section">
          <div className="authCard" style={{ maxWidth: 640, margin: "0 auto", textAlign: "center", padding: "48px 32px", background: "linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(0,0,0,0.4) 100%)", borderColor: "rgba(59,130,246,0.3)" }}>
            <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12 }}>Siap Mendapatkan Cuan?</h2>
            <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 32, fontSize: 16 }}>Upgrade akun Anda sekarang dan rasakan kemudahan berbisnis topup game dengan CarenPedia.</p>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <JoinResellerClient />
            </div>
          </div>
        </div>

      </div>
      <Footer />
    </main>
  );
}
