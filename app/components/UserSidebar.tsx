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
    { label: "Pusat Bantuan", href: "/bantuan", icon: "🎧" },
  ];

  return (
    <div className="userSidebarNav">
      <div className="userSidebarHeader">
        <h3 className="userSidebarTitle">Menu Dashboard</h3>
      </div>

      <div className="userSidebarList">
        {menuItems.map((item) => {
          if (item.resellerOnly && userRole !== "RESELLER") return null;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`userSidebarLink ${isActive ? "isActive" : ""}`}
            >
              <span className="userSidebarIcon">{item.icon}</span>
              <span className="userSidebarLabel">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="userSidebarFooter">
        <button className="userLogoutBtn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          <span>Keluar</span>
        </button>
      </div>

      <style jsx>{`
        .userSidebarNav {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          borderRadius: 20px;
          padding: 24px;
          display: flex;
          flexDirection: column;
          gap: 8px;
          height: fit-content;
          position: sticky;
          top: 100px;
          backdropFilter: blur(12px);
          boxShadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        .userSidebarHeader {
          padding: 0 12px 16px;
          margin-bottom: 8px;
          border-bottom: 1px dashed rgba(255, 255, 255, 0.1);
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
            position: static;
            padding: 12px;
            border-radius: 16px;
            background: transparent;
            border: none;
            box-shadow: none;
            backdrop-filter: none;
          }
          .userSidebarHeader, .userSidebarFooter {
            display: none;
          }
          .userSidebarLabel {
            display: block;
            font-size: 12px;
            white-space: nowrap;
          }
          .userSidebarList {
            flex-direction: row;
            overflow-x: auto;
            padding: 4px 0 12px;
            gap: 12px;
            scrollbar-width: none;
          }
          .userSidebarList::-webkit-scrollbar {
            display: none;
          }
          .userSidebarLink {
            padding: 10px 16px;
            flex-shrink: 0;
            justify-content: center;
            min-width: fit-content;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 14px;
          }
          .userSidebarLink.isActive {
            background: linear-gradient(135deg, rgba(59,130,246,0.2), rgba(59,130,246,0.1));
            border-color: rgba(59,130,246,0.4);
          }
          .userSidebarIcon {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
}
