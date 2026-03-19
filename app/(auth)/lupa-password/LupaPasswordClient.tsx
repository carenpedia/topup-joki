"use client";

import { useState } from "react";

export default function LupaPasswordClient() {
  const [username, setUsername] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, whatsapp }),
    });

    const j = await res.json().catch(() => ({}));
    setMsg("Jika data cocok, link reset akan dikirim. (DEV: link muncul di bawah)");
    if (j?.resetLink) setMsg((m) => `${m}\n\nDEV LINK: ${j.resetLink}`);
  }

  return (
    <div className="authContainer">
      <div className="authCard">
        <div className="authHeader">
          <div className="authIconWrap" style={{ background: "linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.05))", borderColor: "rgba(245, 158, 11, 0.3)", color: "#f59e0b", boxShadow: "0 8px 24px rgba(245, 158, 11, 0.15)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
            </svg>
          </div>
          <div className="authTitle">Lupa Password</div>
          <div className="authSub">Masukkan data akun untuk mendapatkan link reset.</div>
        </div>

        <form onSubmit={submit}>
          <div className="authInputWrap">
            <input 
              className="input" 
              placeholder="Username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
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
            />
            <svg className="authInputIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
          </div>

          <button className="btn btnPrimary" type="submit" style={{ width: "100%", padding: "14px", fontSize: "15px", marginTop: "8px" }}>
            Minta Link Reset
          </button>
        </form>

        <div className="authDivider">atau</div>

        <div className="authFooter">
          Ingat password Anda? <a href="/masuk" className="authLink">Masuk</a>
        </div>

        {msg && (
          <div style={{ marginTop: 24, padding: 16, background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)", borderRadius: 12 }}>
            <pre style={{ whiteSpace: "pre-wrap", color: "#bfdbfe", fontSize: 13, margin: 0, fontFamily: "inherit" }}>{msg}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
