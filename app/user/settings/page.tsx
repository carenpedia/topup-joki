"use client";

import { useState } from "react";

export default function UserSettings() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Pengaturan Akun</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>Perbarui kata sandi dan informasi kontak Anda.</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, padding: 6, background: "rgba(255,255,255,0.05)", borderRadius: 16, width: "fit-content" }}>
        <button 
          onClick={() => setActiveTab("profile")}
          style={{ padding: "8px 20px", borderRadius: 12, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", background: activeTab === "profile" ? "rgba(255,255,255,0.1)" : "transparent", color: activeTab === "profile" ? "#fff" : "rgba(255,255,255,0.5)" }}
        >
          Ubah Profil
        </button>
        <button 
          onClick={() => setActiveTab("password")}
          style={{ padding: "8px 20px", borderRadius: 12, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", background: activeTab === "password" ? "rgba(255,255,255,0.1)" : "transparent", color: activeTab === "password" ? "#fff" : "rgba(255,255,255,0.5)" }}
        >
          Ubah Kata Sandi
        </button>
      </div>

      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 24, padding: "32px" }}>
        {activeTab === "profile" ? (
          <div>
            <div className="authInputWrap">
               <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Nama Pengguna</div>
               <input className="input" type="text" defaultValue="CarenUser123" placeholder="Nama Anda" />
               <svg className="authInputIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <div className="authInputWrap">
               <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Alamat Email</div>
               <input className="input" type="email" defaultValue="user123@gmail.com" placeholder="email@contoh.com" />
               <svg className="authInputIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </div>
            <div className="authInputWrap" style={{ marginBottom: 32 }}>
               <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>No. WhatsApp</div>
               <input className="input" type="text" defaultValue="081234567890" placeholder="08xxxxxxxx" />
               <svg className="authInputIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            </div>
            <button className="btn btnPrimary" style={{ width: "100%", padding: 16 }}>Simpan Perubahan</button>
          </div>
        ) : (
          <div>
            <div className="authInputWrap">
               <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Kata Sandi Lama</div>
               <input className="input" type="password" placeholder="Masukkan password lama" />
               <svg className="authInputIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <div style={{ borderTop: "1px dashed rgba(255,255,255,0.1)", margin: "24px 0" }} />
            <div className="authInputWrap">
               <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Kata Sandi Baru</div>
               <input className="input" type="password" placeholder="Masukkan password baru" />
               <svg className="authInputIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <div className="authInputWrap" style={{ marginBottom: 32 }}>
               <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Konfirmasi Kata Sandi Baru</div>
               <input className="input" type="password" placeholder="Ulangi password baru" />
               <svg className="authInputIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <button className="btn btnPrimary" style={{ width: "100%", padding: 16 }}>Perbarui Kata Sandi</button>
          </div>
        )}
      </div>
    </div>
  );
}
