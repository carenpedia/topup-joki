import { prisma } from "@/lib/prisma";
import Link from "next/link";
import React from "react";

// Helper for formatting Currency
const formatIDR = (val: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val || 0);
};

export default async function AdminDashboard() {
  // 1. Calculate Date Ranges (WIB UTC+7)
  const now = new Date();
  
  const todayWIB = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  todayWIB.setUTCHours(0, 0, 0, 0);
  const startOfToday = new Date(todayWIB.getTime() - 7 * 60 * 60 * 1000);

  const day = todayWIB.getUTCDay(); // 0 is Sunday
  const diffToMonday = day === 0 ? 6 : day - 1;
  const startOfWeekWIB = new Date(todayWIB);
  startOfWeekWIB.setUTCDate(todayWIB.getUTCDate() - diffToMonday);
  const startOfWeek = new Date(startOfWeekWIB.getTime() - 7 * 60 * 60 * 1000);

  const startOfMonthWIB = new Date(todayWIB);
  startOfMonthWIB.setUTCDate(1);
  const startOfMonth = new Date(startOfMonthWIB.getTime() - 7 * 60 * 60 * 1000);

  // 2. Aggregations
  const [daily, weekly, monthly, overall] = await Promise.all([
    prisma.order.aggregate({
      where: { status: "SUCCESS", createdAt: { gte: startOfToday } },
      _sum: { finalPayable: true, profit: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: { status: "SUCCESS", createdAt: { gte: startOfWeek } },
      _sum: { finalPayable: true, profit: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: { status: "SUCCESS", createdAt: { gte: startOfMonth } },
      _sum: { finalPayable: true, profit: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: { status: "SUCCESS" },
      _sum: { finalPayable: true, profit: true },
      _count: true,
    }),
  ]);

  const stats = [
    { label: "Hari Ini", count: daily._count, omzet: daily._sum.finalPayable, profit: daily._sum.profit },
    { label: "Minggu Ini", count: weekly._count, omzet: weekly._sum.finalPayable, profit: weekly._sum.profit },
    { label: "Bulan Ini", count: monthly._count, omzet: monthly._sum.finalPayable, profit: monthly._sum.profit },
    { label: "Total Keseluruhan", count: overall._count, omzet: overall._sum.finalPayable, profit: overall._sum.profit },
  ];

  return (
    <div className="admin-dashboard-wrapper">
      <div className="dashboard-title-section">
        <h2 className="dashboard-title">Dashboard Statistik</h2>
        <p className="dashboard-subtitle">Ringkasan performa penjualan dan keuntungan bersih CarenPedia.</p>
      </div>

      <div className="stats-container-grid">
        {stats.map((s, i) => (
          <div key={i} className="stat-item-card">
            <div className="stat-card-label">{s.label}</div>
            
            <div className="stat-main-value">
              {formatIDR(s.profit || 0)}
            </div>
            
            <div className="stat-bottom-row">
              <div className="stat-sub-item">
                <span className="stat-sub-label">Pesanan</span>
                <span className="stat-sub-value">{s.count}</span>
              </div>
              <div className="stat-sub-item">
                <span className="stat-sub-label">Omzet</span>
                <span className="stat-sub-value">{formatIDR(s.omzet || 0)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="quick-menu-section">
        <div className="menu-section-header">
          <div className="menu-icon">M</div>
          <h3 className="menu-title">Quick Menu Navigation</h3>
        </div>
        
        <div className="menu-links-grid">
          <Link href="/admin/banners" className="admin-quick-link">Banner Slider</Link>
          <Link href="/admin/games" className="admin-quick-link">Game & Nominal</Link>
          <Link href="/admin/orders" className="admin-quick-link">Manajemen Orders</Link>
          <Link href="/admin/vouchers" className="admin-quick-link">Voucher & Promo</Link>
          <Link href="/admin/deposits" className="admin-quick-link">Manual Deposit</Link>
          <Link href="/admin/users" className="admin-quick-link">User Management</Link>
        </div>
      </div>
    </div>
  );
}
