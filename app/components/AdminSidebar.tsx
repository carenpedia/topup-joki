"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/banners", label: "Banner Slider" },
  { href: "/admin/games", label: "Games" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/products", label: "Products & Prices" },
  { href: "/admin/flash-sales", label: "Flash Sale" },
  { href: "/admin/vouchers", label: "Vouchers" },
  { href: "/admin/payment-method-fees", label: "Payment Fees" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/joki-orders", label: "Joki Orders" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/deposits", label: "Deposits" },
  { href: "/admin/audit-logs", label: "Audit Logs" },
];


export default function AdminSidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  return (
    <aside className={`adminSidebar ${isOpen ? "isOpen" : ""}`}>
      <div className="contact-card" style={{ padding: 12, height: "100%", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ fontWeight: 950 }}>Admin Panel</div>
          <button
            className="adminHamburger"
            onClick={onClose}
            style={{ border: "none", background: "transparent", cursor: "pointer", display: "flex", width: 32, height: 32 }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {nav.map((it) => {
            const active = pathname === it.href;
            return (
              <Link
                key={it.href}
                href={it.href}
                onClick={onClose}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: `1px solid ${active ? "rgba(59,130,246,.35)" : "rgba(255,255,255,.08)"}`,
                  background: active ? "rgba(59,130,246,.12)" : "rgba(255,255,255,.04)",
                  color: "rgba(255,255,255,.9)",
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                {it.label}
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
