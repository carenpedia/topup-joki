"use client";

import { useState } from "react";
import { SUPPORT_WHATSAPP } from "../../components/data";

export default function LupaPasswordClient() {
  const [username, setUsername] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(false);
    setErr("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, whatsapp }),
      });

      if (!res.ok) throw new Error("Gagal memproses permintaan.");
      
      setSuccess(true);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  const waLink = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(
    `Halo Admin CarenPedia, saya ingin meminta link reset password.\n\nUsername: ${username}\nNo. WA: ${whatsapp}\n\nMohon bantuannya, terima kasih!`
  )}`;

  return (
    <div className="authContainer">
      <div className="authCard" style={{ position: "relative" }}>
        {/* Version Check Tag */}
        <div style={{ position: "absolute", top: 12, right: 16, fontSize: 9, color: "rgba(255,255,255,0.15)", fontWeight: 900, pointerEvents: "none", letterSpacing: 0.5 }}>V2.0 SUPPORT ACTIVE</div>

        <div className="authHeader">
          <div className="authIconWrap" style={{ background: "linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.05))", borderColor: "rgba(245, 158, 11, 0.3)", color: "#f59e0b", boxShadow: "0 8px 24px rgba(245, 158, 11, 0.15)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
            </svg>
          </div>
          <div className="authTitle">Lupa Password</div>
          <div className="authSub">Masukkan data akun untuk mendapatkan link reset.</div>
        </div>

        {success ? (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div style={{ 
              background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", 
              borderRadius: 16, padding: 20, marginBottom: 24, textAlign: "left"
            }}>
               <h4 style={{ color: "#10b981", margin: "0 0 8px 0", fontSize: 16, fontWeight: 800 }}>Permintaan Terkirim!</h4>
               <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, lineHeight: 1.5, margin: 0 }}>
                 Data Anda telah divalidasi oleh sistem. Untuk alasan keamanan, silakan klik tombol di bawah untuk **"Membuka Tiket Bantuan"** melalui WhatsApp Admin guna mendapatkan link reset password Anda.
               </p>
            </div>
            
            <a 
              href={waLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btnPrimary" 
              style={{ width: "100%", padding: "16px", fontSize: "15px", textDecoration: "none", display: "inline-block" }}
            >
              Hubungi Admin (Buka Tiket)
            </a>

            <div style={{ marginTop: 20 }}>
              <button 
                onClick={() => setSuccess(false)}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
              >
                Kembali ke form
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="authInputWrap">
              <input 
                className="input" 
                placeholder="Username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required
              />
              <svg className="authInputIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>

            <div className="authInputWrap">
              <input 
                className="input" 
                placeholder="No. WhatsApp" 
                value={whatsapp} 
                onChange={(e) => setWhatsapp(e.target.value)} 
                required
              />
              <svg className="authInputIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </div>

            {err && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 12, textAlign: "center" }}>{err}</div>}

            <button className="btn btnPrimary" type="submit" disabled={loading} style={{ width: "100%", padding: "14px", fontSize: "15px", marginTop: "8px" }}>
              {loading ? "Memproses..." : "Validasi Akun"}
            </button>
          </form>
        )}

        <div className="authDivider">atau</div>

        <div className="authFooter">
          Ingat password Anda? <a href="/masuk" className="authLink">Masuk</a>
        </div>
      </div>
    </div>
  );
}
