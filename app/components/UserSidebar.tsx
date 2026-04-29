"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function UserSidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (alive && data?.user?.role) {
            setUserRole(data.user.role);
          } else if (alive) {
            // Fallback ke MEMBER jika data user tidak lengkap
            setUserRole("MEMBER");
          }
        } else if (alive) {
          // API error (401, 500, dll) — fallback ke MEMBER
          // Middleware sudah handle redirect jika sesi benar-benar invalid
          setUserRole("MEMBER");
        }
      } catch (error) {
        // Network error — fallback ke MEMBER, jangan redirect
        if (alive) setUserRole("MEMBER");
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
    { label: "Pusat Bantuan", href: "/bantuan", icon: "🎧" },
  ];

  // Helper untuk cek apakah user punya akses reseller
  const hasResellerAccess = userRole === "RESELLER" || userRole === "ADMIN";

  return (
    <div className="userSidebarNav">
      <div className="userSidebarHeader">
        <h3 className="userSidebarTitle">Menu Dashboard</h3>
        {onClose && (
          <button className="mobileCloseBtn" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        )}
      </div>

      <div className="userSidebarList">
        {menuItems.map((item) => {
          // Jika menu khusus reseller, sembunyikan jika user bukan reseller/admin
          if (item.resellerOnly && !hasResellerAccess) return null;
          
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`userSidebarLink ${isActive ? "isActive" : ""}`}
              onClick={() => onClose?.()}
            >
              <span className="userSidebarIcon">{item.icon}</span>
              <span className="userSidebarLabel">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="userSidebarFooter">
        <button className="userLogoutBtn" onClick={async () => {
          try { await fetch("/api/auth/logout", { method: "POST" }); } catch {}
          window.location.href = "/masuk";
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          <span>Keluar</span>
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .userSidebarNav {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          height: fit-content;
          position: sticky;
          top: 100px;
          backdrop-filter: blur(12px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        .userSidebarHeader {
          padding: 0 12px 16px;
          margin-bottom: 8px;
          border-bottom: 1px dashed rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .mobileCloseBtn {
          display: none;
          background: none;
          border: none;
          color: rgba(255,255,255,0.4);
          cursor: pointer;
          padding: 4px;
        }
        .userSidebarTitle {
          font-size: 11px;
          font-weight: 800;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .userSidebarList {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .userSidebarLink {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          color: rgba(255,255,255,0.6);
          font-weight: 500;
          font-size: 14px;
          transition: all 0.2s ease;
          border: 1px solid transparent;
          text-decoration: none;
        }
        .userSidebarLink:hover {
          background: rgba(255,255,255,0.04);
          color: #fff;
        }
        .userSidebarLink.isActive {
          color: #fff;
          background: linear-gradient(90deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05));
          border-color: rgba(59,130,246,0.2);
          font-weight: 700;
        }
        .userSidebarIcon {
          font-size: 18px;
          opacity: 0.7;
        }
        .isActive .userSidebarIcon {
          opacity: 1;
        }
        .userSidebarFooter {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .userLogoutBtn {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .userLogoutBtn:hover {
          background: rgba(239, 68, 68, 0.15);
        }

        @media (max-width: 900px) {
          .userSidebarNav {
            position: relative;
            top: 0;
            background: transparent;
            border: none;
            box-shadow: none;
            backdrop-filter: none;
            height: 100%;
            padding: 20px;
          }
          .mobileCloseBtn {
            display: block;
          }
          .userSidebarLabel {
            display: block;
            font-size: 14px;
          }
          .userSidebarList {
            flex-direction: column;
            overflow-x: visible;
            gap: 8px;
          }
          .userSidebarLink {
            padding: 14px 18px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 14px;
            min-width: auto;
            justify-content: flex-start;
          }
          .userSidebarLink.isActive {
            background: linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05));
            border-color: rgba(59,130,246,0.3);
          }
          .userSidebarIcon {
            font-size: 18px;
          }
        }
      ` }} />
    </div>
  );
}
