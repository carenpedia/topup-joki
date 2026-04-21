"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { SUPPORT_WHATSAPP } from "../../components/data";

export default function MasukClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.trim(), password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setMsg(data.error || "Login gagal");
      return;
    }

    const data = await res.json();
    const role = data?.user?.role;

    if (next) return router.push(next);
    if (role === "ADMIN") return router.push("/admin");
    return router.push("/");
  }

  return (
    <div className="authContainer">
      <div className="authCard">
        <div className="authHeader">
          <div className="authIconWrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <div className="authTitle">Selamat Datang</div>
          <div className="authSub">Silakan masuk ke akun Anda.</div>
        </div>

        <form onSubmit={onSubmit}>
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
            {loading ? "Menghubungkan..." : "Masuk"}
          </button>
        </form>

        <div className="authDivider">atau</div>

        <div className="authFooter">
          Belum punya akun? <a href="/daftar" className="authLink">Daftar sekarang</a>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <a href="/lupa-password" className="authLink" style={{ fontWeight: 500, fontSize: 12 }}>Lupa Password?</a>
            <a 
              href={`https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent("Halo Admin CarenPedia, saya butuh bantuan terkait akun saya.")}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="authLink" 
              style={{ fontWeight: 500, fontSize: 12, color: "rgba(96,165,250,0.8)" }}
            >
              Butuh Bantuan? Hubungi Admin
            </a>
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
        Untuk bergabung menjadi reseller (45k), kunjungi halaman <a href="/reseller" style={{ color: "rgba(255,255,255,0.6)" }}>Reseller</a>.
      </div>
    </div>
  );
}
