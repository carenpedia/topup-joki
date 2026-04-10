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
  // 1. Calculate Date Ranges in WIB (UTC+7)
  const now = new Date();
  
  // Start of Today (WIB)
  const todayWIB = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  todayWIB.setUTCHours(0, 0, 0, 0);
  const startOfToday = new Date(todayWIB.getTime() - 7 * 60 * 60 * 1000);

  // Start of Week (WIB - Monday)
  const day = todayWIB.getUTCDay(); // 0 is Sunday, 1 is Monday
  const diffToMonday = day === 0 ? 6 : day - 1;
  const startOfWeekWIB = new Date(todayWIB);
  startOfWeekWIB.setUTCDate(todayWIB.getUTCDate() - diffToMonday);
  const startOfWeek = new Date(startOfWeekWIB.getTime() - 7 * 60 * 60 * 1000);

  // Start of Month (WIB)
  const startOfMonthWIB = new Date(todayWIB);
  startOfMonthWIB.setUTCDate(1);
  const startOfMonth = new Date(startOfMonthWIB.getTime() - 7 * 60 * 60 * 1000);

  // 2. Fetch Aggregated Stats
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
    <div className="admin-dashboard-container">
      {/* Quick Stats Grid */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        {stats.map((s, i) => (
          <div key={i} className="contact-card" style={{ height: '100%', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="contact-header" style={{ marginBottom: '12px' }}>
              <div className="contact-step" style={{ background: i === 0 ? '#3b82f6' : '#1e293b' }}>{s.label[0]}</div>
              <div className="contact-title-wrap">
                <h4 className="contact-title" style={{ fontSize: '14px', opacity: 0.7 }}>{s.label}</h4>
              </div>
            </div>
            
            <div style={{ padding: '0 4px' }}>
                <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Profit (Berhasil)</div>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: '#10b981' }}>{formatIDR(s.profit || 0)}</div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                    <div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>PESANAN</div>
                        <div style={{ fontSize: '14px', fontWeight: '700' }}>{s.count}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>OMZET</div>
                        <div style={{ fontSize: '14px', fontWeight: '700' }}>{formatIDR(s.omzet || 0)}</div>
                    </div>
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* Shortcuts */}
      <div className="contact-card">
        <div className="contact-header">
          <div className="contact-step">M</div>
          <div className="contact-title-wrap">
            <h4 className="contact-title">Quick Menu</h4>
          </div>
        </div>

        <div className="contact-body">
          <div className="subtitle">Menu akses cepat untuk manajemen sistem CarenPedia.</div>

          <div className="spacer" />
          <div className="contact-row" style={{ flexWrap: 'wrap', gap: '8px' }}>
            <Link className="btn btn-ghost btn-xs" href="/admin/banners">Banner Slider</Link>
            <Link className="btn btn-ghost btn-xs" href="/admin/games">Game & Nominal</Link>
            <Link className="btn btn-ghost btn-xs" href="/admin/orders">Orders</Link>
            <Link className="btn btn-ghost btn-xs" href="/admin/vouchers">Vouchers</Link>
            <Link className="btn btn-ghost btn-xs" href="/admin/deposits">Manual Deposit</Link>
            <Link className="btn btn-ghost btn-xs" href="/admin/users">User Management</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
