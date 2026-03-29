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
        marginBottom: 18,
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <button className="adminHamburger" onClick={onToggleSidebar}>
          <span />
          <span />
          <span />
        </button>
        <div>
          <div style={{ fontSize: 18, fontWeight: 950 }}>
            CarenPedia Admin
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)" }}>
            Dashboard Management
          </div>
        </div>
      </div>

      <button
        onClick={handleLogout}
        style={{
          border: "1px solid rgba(255,255,255,.12)",
          background: "rgba(255,255,255,.05)",
          padding: "8px 14px",
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 800,
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
}
