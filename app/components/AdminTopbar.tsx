"use client";

import { useRouter } from "next/navigation";

export default function AdminTopbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/masuk");
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 24,
        padding: "16px 24px",
        background: "rgba(30, 32, 38, 0.4)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: "24px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <button className="adminHamburger" onClick={onToggleSidebar}>
          <span />
          <span />
          <span />
        </button>
        <div style={{ paddingLeft: 4 }}>
          <div style={{ 
            fontSize: 22, 
            fontWeight: 900, 
            background: "linear-gradient(90deg, #fff, #e5e7eb)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.5px"
          }}>
            Dashboard Carenpedia
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", fontWeight: 600, marginTop: 2 }}>
            Sistem Manajemen Admin Utama
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.03)", padding: "6px 16px 6px 6px", borderRadius: "99px", border: "1px solid rgba(255,255,255,0.05)" }}>
           <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #60a5fa)", display: "grid", placeItems: "center", fontSize: 14, fontWeight: 900, color: "#fff", boxShadow: "0 2px 10px rgba(59,130,246,0.3)" }}>A</div>
           <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>Admin</div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            border: "1px solid rgba(239,68,68,0.3)",
            background: "rgba(239,68,68,0.1)",
            color: "#f87171",
            padding: "10px 18px",
            borderRadius: "14px",
            fontSize: 13,
            fontWeight: 800,
            cursor: "pointer",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.2)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
