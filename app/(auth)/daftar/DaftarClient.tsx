"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DaftarClient() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    if (username.length < 3) {
      setMsg("Gunakan username minimal 3 huruf atau lebih");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, whatsapp, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setMsg(data.error || "Daftar gagal");
      return;
    }

    router.push("/masuk");
  }

  return (
    <div className="authContainer">
      <div className="authCard">
        <div className="authHeader">
          <div className="authIconWrap" style={{ background: "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.05))", borderColor: "rgba(16, 185, 129, 0.3)", color: "#10b981", boxShadow: "0 8px 24px rgba(16, 185, 129, 0.15)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
          </div>
          <div className="authTitle">Buat Akun Member</div>
          <div className="authSub">Gabung dan nikmati layanan topup tercepat.</div>
        </div>

        <form onSubmit={onSubmit}>
          <div className="authInputWrap">
            <input 
              className="input" 
              placeholder="Username" 
              value={username} 
              onChange={(e) => {
                const val = e.target.value.replace(/\s/g, ""); // No spaces allowed
                setUsername(val);
              }} 
            />
            <svg className="authInputIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          {username.length > 0 && username.length < 3 && (
            <div style={{ marginTop: 6, fontSize: 11, color: "rgba(250, 204, 21, 0.9)", display: "flex", alignItems: "center", gap: 4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Gunakan username minimal 3 huruf atau lebih
            </div>
          )}

          <div className="authInputWrap">
            <input 
              className="input" 
              placeholder="No. WhatsApp (08xxxx)" 
              value={whatsapp} 
              onChange={(e) => setWhatsapp(e.target.value)} 
            />
            <svg className="authInputIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
          </div>

          <div className="authInputWrap">
            <input 
              className="input" 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
            <svg className="authInputIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>

          {msg && <div style={{ marginBottom: 16, color: "#ef4444", fontSize: 13, textAlign: "center", fontWeight: 500 }}>{msg}</div>}

          <button className="btn btnPrimary" type="submit" disabled={loading} style={{ width: "100%", padding: "14px", fontSize: "15px" }}>
            {loading ? "Memproses..." : "Daftar Akun"}
          </button>
        </form>

        <div className="authDivider">sudah punya akun?</div>

        <div className="authFooter">
          <a href="/masuk" className="authLink">Masuk ke Dashboard</a>
        </div>
      </div>
    </div>
  );
}
