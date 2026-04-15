"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/banners", label: "Banner" },
  { href: "/admin/games", label: "Games" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/products", label: "Products & Prices" },
  { href: "/admin/products/categories", label: "Produk Kategori" },
  { href: "/admin/flash-sales", label: "Flash Sale" },
  { href: "/admin/vouchers", label: "Vouchers" },
  { href: "/admin/payment-method-fees", label: "Payment Fees" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/joki-orders", label: "Joki Orders" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/deposits", label: "Deposits" },
  { href: "/admin/settings", label: "⚙️ Konfigurasi Web" },
  { href: "/admin/audit-logs", label: "Audit Logs" },
  { href: "/user/profile", label: "👤 Profil Saya" },
];

export default function AdminSidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  return (
    <aside className={`adminSidebar ${isOpen ? "isOpen" : ""}`}>
      <div 
        className="contact-card" 
        style={{ 
          padding: "20px 16px", 
          height: "100%", 
          overflowY: "auto",
          background: "#12141a",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: "24px"
        }}
      >

        {/* Header / Brand */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, padding: "0 4px" }}>
          <div style={{ 
            fontWeight: 900, 
            fontSize: 20, 
            background: "linear-gradient(135deg, #fff, #9ca3af)", 
            WebkitBackgroundClip: "text", 
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.5px"
          }}>
            Carenpedia Workspace
          </div>
          <button
            className="adminHamburger"
            onClick={onClose}
            style={{ border: "none", background: "rgba(255,255,255,0.05)", borderRadius: "8px", cursor: "pointer", display: "flex", padding: 6 }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Back to Site Button */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 16px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(37,99,235,0.05))",
            border: "1px solid rgba(59,130,246,0.3)",
            color: "#60a5fa",
            fontSize: 14,
            fontWeight: 800,
            textDecoration: "none",
            marginBottom: 24,
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "linear-gradient(135deg, #3b82f6, #2563eb)"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(37,99,235,0.05))"; e.currentTarget.style.color = "#60a5fa"; }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          Kembali ke Situs
        </Link>
        <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12, marginLeft: 8 }}>Menu Navigasi</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {nav.map((it) => {
            const active = pathname === it.href;
            return (
               <Link
                key={it.href}
                href={it.href}
                onClick={onClose}
                style={{
                  padding: "12px 16px",
                  borderRadius: "14px",
                  border: `1px solid ${active ? "rgba(59,130,246,.4)" : "transparent"}`,
                  background: active ? "linear-gradient(90deg, rgba(59,130,246,.15), rgba(59,130,246,.05))" : "transparent",
                  color: active ? "#fff" : "rgba(255,255,255,.6)",
                  fontSize: 14,
                  fontWeight: active ? 800 : 700,
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: 10
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,.6)"; } }}
              >
                {active && <div style={{ width: 4, height: 14, borderRadius: 4, background: "#3b82f6" }} />}
                {it.label}
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
