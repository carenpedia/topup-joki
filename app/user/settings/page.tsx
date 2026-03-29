"use client";

import { useEffect, useState } from "react";

export default function UserSettings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ msg: string; type: "success" | "error" | null }>({ msg: "", type: null });

  // Profile Form State
  const [username, setUsername] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  // Password Form State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data?.user) {
          setUsername(data.user.username || "");
          setWhatsapp(data.user.whatsapp || "");
        }
      } catch (error) {}
    })();
  }, []);

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus({ msg: "", type: null });

    try {
      const res = await fetch("/api/auth/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "profile", username, whatsapp }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus({ msg: "Profil berhasil diperbarui!", type: "success" });
      } else {
        setStatus({ msg: data.error || "Gagal memperbarui profil", type: "error" });
      }
    } catch (error) {
      setStatus({ msg: "Terjadi kesalahan jaringan", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus({ msg: "Konfirmasi password baru tidak cocok", type: "error" });
      return;
    }
    
    setLoading(true);
    setStatus({ msg: "", type: null });

    try {
      const res = await fetch("/api/auth/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "password", oldPassword, newPassword }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus({ msg: "Password berhasil diperbarui!", type: "success" });
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setStatus({ msg: data.error || "Gagal memperbarui password", type: "error" });
      }
    } catch (error) {
      setStatus({ msg: "Terjadi kesalahan jaringan", type: "error" });
    } finally {
      setLoading(false);
    }
  }

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

      {status.msg && (
        <div style={{ 
          padding: "12px 16px", borderRadius: 12, marginBottom: 24, fontSize: 14, fontWeight: 600,
          background: status.type === "success" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
          color: status.type === "success" ? "#10b981" : "#ef4444",
          border: `1px solid ${status.type === "success" ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`
        }}>
          {status.msg}
        </div>
      )}

      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 24, padding: "32px" }}>
        {activeTab === "profile" ? (
          <form onSubmit={handleProfileUpdate}>
            <div className="authInputWrap">
               <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Nama Pengguna</div>
               <input className="input" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Nama Anda" required />
               <svg className="authInputIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <div className="authInputWrap" style={{ marginBottom: 32 }}>
               <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>No. WhatsApp</div>
               <input className="input" type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="08xxxxxxxx" required />
               <svg className="authInputIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            </div>
            <button className="btn btnPrimary" style={{ width: "100%", padding: 16 }} disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordUpdate}>
            <div className="authInputWrap">
               <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Kata Sandi Lama</div>
               <input className="input" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Masukkan password lama" required />
               <svg className="authInputIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <div style={{ borderTop: "1px dashed rgba(255,255,255,0.1)", margin: "24px 0" }} />
            <div className="authInputWrap">
               <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Kata Sandi Baru</div>
               <input className="input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Masukkan password baru" required />
               <svg className="authInputIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <div className="authInputWrap" style={{ marginBottom: 32 }}>
               <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Konfirmasi Kata Sandi Baru</div>
               <input className="input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ulangi password baru" required />
               <svg className="authInputIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <button className="btn btnPrimary" style={{ width: "100%", padding: 16 }} disabled={loading}>
              {loading ? "Memperbarui..." : "Perbarui Kata Sandi"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
