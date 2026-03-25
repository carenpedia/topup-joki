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
  { href: "/admin/joki-orders", label: "🎮 Joki Orders" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/deposits", label: "Deposits" },
  { href: "/admin/audit-logs", label: "Audit Logs" },
];


export default function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="contact-card" style={{ padding: 12 }}>
      <div style={{ fontWeight: 950, marginBottom: 10 }}>Admin Panel</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {nav.map((it) => {
          const active = pathname === it.href;
          return (
            <Link
              key={it.href}
              href={it.href}
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
    </aside>
  );
}
