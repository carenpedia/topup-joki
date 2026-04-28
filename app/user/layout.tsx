"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import UserSidebar from "../components/UserSidebar";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <main className="page">
      {/* Background Effects */}
      <div className="bgGlow" aria-hidden="true" />
      <div className="gridFx" aria-hidden="true" />
      
      <Navbar />
      <div className="shell" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        
        {/* Mobile Sidebar Toggle */}
        <div className="mobileSidebarToggle">
          <button onClick={() => setIsSidebarOpen(true)} className="toggleBtn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
            <span>Menu Dashboard</span>
          </button>
        </div>

        <div style={{ 
          marginTop: 20,
          marginBottom: 60,
          display: "grid", 
          gridTemplateColumns: "260px 1fr", 
          gap: 32,
          flexGrow: 1,
          alignItems: "start"
        }} className="userLayoutGrid">
          
          {/* Overlay for mobile */}
          {isSidebarOpen && (
            <div 
              className="userSidebarOverlay" 
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Kiri: Sidebar Navigasi Dashboard */}
          <div className={`userSidebarWrapper ${isSidebarOpen ? "isOpen" : ""}`}>
            <UserSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          </div>

          {/* Kanan: Main Content Area (Children) */}
          <div className="userContentWrapper" style={{ minWidth: 0 }}>
            {children}
          </div>
        </div>
      </div>
      
      <Footer />

      <style jsx>{`
        .mobileSidebarToggle {
          display: none;
          padding: 16px 20px 0;
        }
        .toggleBtn {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          padding: 10px 16px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
        }

        @media (max-width: 900px) {
          .mobileSidebarToggle {
            display: block;
          }
          .userLayoutGrid {
            grid-template-columns: 1fr !important;
            margin-top: 10px !important;
            gap: 20px !important;
          }
          .userSidebarWrapper {
            position: fixed;
            top: 0;
            left: -100%;
            width: 70%; /* Muncul sekitar setengah hingga 3/4 layar sesuai permintaan */
            height: 100vh;
            z-index: 2000;
            transition: left 0.3s ease;
            background: #06060c;
            box-shadow: 10px 0 30px rgba(0,0,0,0.5);
          }
          .userSidebarWrapper.isOpen {
            left: 0;
          }
          .userSidebarOverlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.4); /* Tetap transparan tanpa blur */
            z-index: 1999;
          }
        }
      `}</style>
    </main>
  );
}
