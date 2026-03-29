"use client";

import { useState } from "react";
import "../components/styles.css";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/AdminTopbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <main className="page pagePadBottom">
      <div className="shell">
        <AdminTopbar onToggleSidebar={() => setSidebarOpen(true)} />

        <div
          className={`adminOverlay ${sidebarOpen ? "isOpen" : ""}`}
          onClick={() => setSidebarOpen(false)}
        />

        <div className="adminLayout">
          <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="adminMain">{children}</div>
        </div>
      </div>
    </main>
  );
}
