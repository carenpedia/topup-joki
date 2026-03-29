"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function UserProfile() {
  const [profile, setProfile] = useState({
    name: "Pengguna CarenPedia",
    role: "MEMBER", 
    carencoin: 0,
    email: "-",
    whatsapp: "-",
    joinDate: "-",
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await res.json();
        if (alive && data?.user) {
          const u = data.user;
          const dateStr = u.createdAt ? new Date(u.createdAt).toLocaleDateString("id-ID", {
            day: "numeric", month: "short", year: "numeric",
          }) : "-";
          
          setProfile({
            name: u.username || "Pengguna",
            role: u.role || "MEMBER",
            carencoin: u.carencoinBalance || 0,
            email: "-", // Skema db saat ini pakai whatsapp sbg id
            whatsapp: u.whatsapp || "-",
            joinDate: dateStr,
          });
        }
      } catch (error) {}
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Profil Akun</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>Kelola informasi identitas dan saldo Carencoin Anda di sini.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginBottom: 32 }}>
        {/* Card Saldo & Role */}
        <div style={{ 
          background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(0,0,0,0.4))", 
          border: "1px solid rgba(59,130,246,0.2)", 
          borderRadius: 24, padding: 32, position: "relative", overflow: "hidden" 
        }}>
          {profile.role === "RESELLER" && (
             <div style={{ position: "absolute", top: 0, right: 0, background: "linear-gradient(90deg, #f59e0b, #d97706)", color: "#fff", fontSize: 11, fontWeight: 900, padding: "6px 24px", transform: "translate(25%, 50%) rotate(45deg)", boxShadow: "0 4px 12px rgba(245, 158, 11, 0.4)", letterSpacing: 1 }}>VIP RESELLER</div>
          )}
          {profile.role === "ADMIN" && (
             <div style={{ position: "absolute", top: 0, right: 0, background: "linear-gradient(90deg, #6b7280, #111827)", color: "#fff", fontSize: 11, fontWeight: 900, padding: "6px 24px", transform: "translate(25%, 50%) rotate(45deg)", boxShadow: "0 4px 12px rgba(0,0,0,0.5)", letterSpacing: 1, border: "1px solid rgba(255,255,255,0.1)" }}>ADMIN PANEL</div>
          )}

          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>{profile.role === "ADMIN" ? "Sisa Kredit / Saldo" : "Saldo Carencoin"}</div>
          <div style={{ fontSize: 40, fontWeight: 900, color: "#fff", marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: profile.role === "ADMIN" ? "#94a3b8" : "#f59e0b" }}>🪙</span> 
            {profile.carencoin.toLocaleString("id-ID")}
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/user/deposit" style={{ flex: 1, padding: "12px", background: profile.role === "ADMIN" ? "rgba(255,255,255,0.1)" : "#3b82f6", color: "#fff", borderRadius: 12, fontWeight: 700, fontSize: 13, textAlign: "center", textDecoration: "none" }}>{profile.role === "ADMIN" ? "Topup Kredit" : "Isi Saldo"}</Link>
            <Link href="/user/history" style={{ flex: 1, padding: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: 12, fontWeight: 700, fontSize: 13, textAlign: "center", textDecoration: "none" }}>Mutasi</Link>
          </div>
        </div>

        {/* Card Data Diri */}
        <div style={{ 
          background: "rgba(255,255,255,0.02)", 
          border: "1px solid rgba(255,255,255,0.05)", 
          borderRadius: 24, padding: 32 
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>Data Pribadi</div>
            <Link href="/user/settings" style={{ fontSize: 13, color: "#60a5fa", fontWeight: 700, textDecoration: "none" }}>Edit Data &rarr;</Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
             <div>
               <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600, marginBottom: 4 }}>Namapengguna</div>
               <div style={{ fontSize: 15, fontWeight: 600 }}>{profile.name} <span style={{ fontSize:10, color: "#3b82f6", opacity:.8 }}>({profile.role})</span></div>
             </div>
             <div>
               <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600, marginBottom: 4 }}>WhatsApp</div>
               <div style={{ fontSize: 15, fontWeight: 600 }}>{profile.whatsapp}</div>
             </div>
             <div>
               <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600, marginBottom: 4 }}>Bergabung Sejak</div>
               <div style={{ fontSize: 15, fontWeight: 600 }}>{profile.joinDate}</div>
             </div>
          </div>
        </div>
      </div>

      {/* VIP CTA/BANNER */}
      {profile.role === "ADMIN" ? null : profile.role === "MEMBER" ? (
        <div style={{ 
          background: "linear-gradient(90deg, rgba(16,185,129,0.15), rgba(5,150,105,0.05))", 
          border: "1px solid rgba(16,185,129,0.3)", 
          borderRadius: 20, padding: 32, 
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24 
        }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "#10b981", marginBottom: 8 }}>Ingin Harga Super Murah?</h2>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, maxWidth: 500, lineHeight: 1.6 }}>Upgrade akun Anda menjadi VIP Reseller sekarang untuk mendapatkan harga modal tanpa *markup*. Cocok untuk bisnis sampingan maupun pemakaian pribadi hemat.</p>
          </div>
          <Link href="/reseller" style={{ padding: "14px 28px", background: "#10b981", color: "#fff", borderRadius: 100, fontWeight: 800, fontSize: 14, textDecoration: "none", boxShadow: "0 8px 24px rgba(16,185,129,0.3)" }}>
            Upgrade Menjadi VIP &rarr;
          </Link>
        </div>
      ) : (
        <div style={{ 
          background: "rgba(255,255,255,0.02)", 
          border: "1px dashed rgba(245,158,11,0.4)", 
          borderRadius: 20, padding: 24, textAlign: "center"
        }}>
           <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: "50%", background: "rgba(245,158,11,0.1)", color: "#f59e0b", marginBottom: 12 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
           </div>
           <h2 style={{ fontSize: 18, fontWeight: 800, color: "#f59e0b", marginBottom: 8 }}>Akun Anda telah menjadi VIP Reseller!</h2>
           <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, maxWidth: 400, margin: "0 auto" }}>Anda sudah bisa menikmati harga termurah di seluruh layanan katalog produk CarenPedia.</p>
        </div>
      )}

    </div>
  );
}
