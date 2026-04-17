"use client";
import Link from "next/link";
import { useConfig } from "./ConfigProvider";

export default function Footer() {
  const config = useConfig();
  const SUPPORT_WHATSAPP = config.SUPPORT_WHATSAPP;
  return (
    <footer style={{
      marginTop: "80px",
      padding: "80px 20px 40px",
      background: "linear-gradient(180deg, #08080d 0%, rgba(14,18,28,0.95) 100%)",
      borderTop: "1px solid rgba(255,255,255,0.03)",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Top ambient glow line */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
        background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.3) 20%, rgba(139,92,246,0.5) 50%, rgba(59,130,246,0.3) 80%, transparent)",
        boxShadow: "0 0 30px rgba(59,130,246,0.6)"
      }} />

      {/* Background decorations */}
      <div style={{ position: "absolute", bottom: -200, left: -100, width: 400, height: 400, background: "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 60%)", borderRadius: "50%", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: -100, right: -50, width: 300, height: 300, background: "radial-gradient(circle, rgba(139,92,246,0.03) 0%, transparent 60%)", borderRadius: "50%", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "2.5fr 1.5fr 1.5fr 2fr", 
          gap: "40px",
          marginBottom: "60px",
          // responsive layout will be handled via flex-wrap in actual implementation, 
          // here we simulate generic desktop-first that wraps implicitly
        }} className="footerGrid">

          {/* Kolom 1: Brand & Deskripsi */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
              {config.SITE_LOGO ? (
                <img 
                  src={config.SITE_LOGO} 
                  alt={config.SITE_NAME} 
                  style={{ maxHeight: 100, maxWidth: 320, objectFit: "contain" }} 
                />
              ) : (
                <div style={{
                  width: 80, height: 80, borderRadius: 18,
                  background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                  display: "grid", placeItems: "center",
                  color: "white", fontWeight: 900, fontSize: 36,
                  boxShadow: "0 6px 20px rgba(59,130,246,0.4)"
                }}>{config.SITE_NAME.charAt(0)}</div>
              )}
              <span style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: -0.5 }}>
                {config.SITE_NAME}
              </span>
            </div>

            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
              {config.SITE_SLOGAN}
            </p>
            
            {/* Social Media Icons */}
            <div style={{ display: "flex", gap: 12 }}>
              <a href="#" style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.7)", transition: "all 0.2s" }} className="socmedIcon">
                {/* Instagram */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.7)", transition: "all 0.2s" }} className="socmedIcon">
                {/* TikTok (Music Note as approx) */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
              </a>
              <a href="#" style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.7)", transition: "all 0.2s" }} className="socmedIcon">
                {/* WhatsApp */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.16 19.38L21.8 22l-2.62-.64A10 10 0 1 1 21.16 14.6l-1 2.5a3 3 0 0 0 .97 2.27z"></path></svg>
              </a>
            </div>
          </div>

          {/* Kolom 2: Menu Utama */}
          <div>
            <h4 style={{ color: "#fff", fontWeight: 800, fontSize: 15, marginBottom: 20, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Menu Utama
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <Link href="/" className="footerLink">Beranda</Link>
              <Link href="/riwayat" className="footerLink">Lacak Pesanan</Link>
              <Link href="/reseller" className="footerLink">Daftar Reseller</Link>
              <Link href="/kalkulator" className="footerLink">Kalkulator WR</Link>
            </div>
          </div>

          {/* Kolom 3: Layanan Kami */}
          <div>
            <h4 style={{ color: "#fff", fontWeight: 800, fontSize: 15, marginBottom: 20, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Layanan Kami
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <Link href="/syarat-ketentuan" className="footerLink">Syarat & Ketentuan</Link>
              <Link href="/kebijakan-privasi" className="footerLink">Kebijakan Privasi</Link>
              <a href={`https://wa.me/${SUPPORT_WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="footerLink">Pusat Bantuan</a>
              <a href={`https://wa.me/${SUPPORT_WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="footerLink">Hubungi Kami</a>
            </div>
          </div>

          {/* Kolom 4: Pembayaran */}
          <div>
            <h4 style={{ color: "#fff", fontWeight: 800, fontSize: 15, marginBottom: 20, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Metode Pembayaran
            </h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {/* Payment Pills */}
              <div style={{ padding: "6px 12px", background: "#fff", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#005baa", fontWeight: 900, fontStyle: "italic", fontSize: 12 }}>BCA</span>
              </div>
              <div style={{ padding: "6px 12px", background: "#fff", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#ed1c24", fontWeight: 900, fontSize: 12 }}>QRIS</span>
              </div>
              <div style={{ padding: "6px 12px", background: "#fff", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#4c3494", fontWeight: 800, fontSize: 12 }}>OVO</span>
              </div>
              <div style={{ padding: "6px 12px", background: "#fff", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#118eea", fontWeight: 800, fontSize: 12 }}>DANA</span>
              </div>
              <div style={{ padding: "6px 12px", background: "#fff", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#00a5cf", fontWeight: 900, fontSize: 12 }}>LinkAja</span>
              </div>
              <div style={{ padding: "6px 12px", background: "#fff", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#ea212d", fontWeight: 900, fontSize: 12 }}>Alfamart</span>
              </div>
            </div>
            <p style={{ marginTop: 16, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
              Dan puluhan metode pembayaran lainnya.
            </p>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Badges */}
        <div style={{ 
          borderTop: "1px dashed rgba(255,255,255,0.1)", 
          paddingTop: "24px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px"
        }}>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 500 }}>
            © {new Date().getFullYear()} {config.SITE_NAME}. All rights reserved.
          </p>
          
          {/* Trust Badges */}
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              Aman & Terpercaya
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              Layanan 24 Jam
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              Proses Sekejap
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 900px) {
          .footerGrid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 500px) {
          .footerGrid {
            grid-template-columns: 1fr !important;
          }
        }
        .socmedIcon:hover {
          background: rgba(59,130,246,0.2) !important;
          color: #60a5fa !important;
          border-color: rgba(59,130,246,0.5) !important;
          transform: translateY(-2px);
        }
      `}} />
    </footer>
  );
}
