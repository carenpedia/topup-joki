"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function UserSidebar() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState("MEMBER");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await res.json();
        if (alive && data?.user?.role) {
          setUserRole(data.user.role);
        }
      } catch (error) {
        // Abaikan error fetch mockup
      }
    })();
    return () => { alive = false; };
  }, []);

  const menuItems = [
    { label: "Data Penjualan", href: "/user/dashboard", icon: "📊", resellerOnly: true },
    { label: "Profil Akun", href: "/user/profile", icon: "👤" },
    { label: "Deposit Saldo", href: "/user/deposit", icon: "💰" },
    { label: "Harga Khusus", href: "/user/pricelist", icon: "🏷️", resellerOnly: true },
    { label: "Pengaturan", href: "/user/settings", icon: "⚙️" },
  ];

  return (
    <div style={{
      background: "rgba(255, 255, 255, 0.02)",
      border: "1px solid rgba(255, 255, 255, 0.05)",
      borderRadius: "20px",
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      height: "fit-content",
      position: "sticky",
      top: "100px",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)"
    }}>
      <div style={{ padding: "0 12px 16px", marginBottom: 8, borderBottom: "1px dashed rgba(255, 255, 255, 0.1)" }}>
        <h3 style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 0.5 }}>Menu Dashboard</h3>
      </div>

      {menuItems.map((item) => {
        // Sembunyikan menu reseller jika user bukan reseller
        if (item.resellerOnly && userRole !== "RESELLER") return null;

        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              borderRadius: "12px",
              color: isActive ? "#fff" : "rgba(255,255,255,0.6)",
              background: isActive ? "linear-gradient(90deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))" : "transparent",
              border: isActive ? "1px solid rgba(59,130,246,0.2)" : "1px solid transparent",
              fontWeight: isActive ? 700 : 500,
              fontSize: 14,
              transition: "all 0.2s ease"
            }}
            onMouseOver={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.color = "#fff";
              }
            }}
            onMouseOut={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "rgba(255,255,255,0.6)";
              }
            }}
          >
            <span style={{ fontSize: 18, filter: isActive ? "none" : "grayscale(100%) opacity(70%)", transition: "all 0.2s ease" }}>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}

      <div style={{ marginTop: "auto", paddingTop: "24px" }}>
        <button style={{
          width: "100%", padding: "12px", borderRadius: "12px",
          background: "rgba(239, 68, 68, 0.1)", color: "#ef4444",
          border: "1px solid rgba(239, 68, 68, 0.2)",
          fontWeight: 700, fontSize: 14, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          transition: "all 0.2s"
        }}
        onMouseOver={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)"}
        onMouseOut={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Keluar
        </button>
      </div>
    </div>
  );
}
