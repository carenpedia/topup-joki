
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminTable from "@/app/components/AdminTable";

type OrderRow = {
  id: string;
  orderNo: string;
  user?: string | null;
  game?: string | null;
  item?: string | null;
  total?: number | null;
  status?: "PENDING_PAYMENT" | "PAID" | "FAILED" | string;
  serviceType?: "TOPUP" | "JOKI" | string;
  createdAt?: string | null;

  // opsional
  jokiLoginVia?: string | null;
};

function rupiah(n: number) {
  return new Intl.NumberFormat("id-ID").format(n);
}

function StatusBadge({ value }: { value?: string | null }) {
  const v = (value || "PENDING_PAYMENT").toUpperCase();
  const label = v === "PENDING_PAYMENT" ? "PENDING" : v;

  const cls =
    v === "PAID"
      ? "admin-badge admin-badge-success"
      : v === "FAILED"
        ? "admin-badge admin-badge-error"
        : "admin-badge admin-badge-warning";

  return <span className={cls}>{label}</span>;
}

function TypeBadge({ value }: { value?: string | null }) {
  const v = (value || "TOPUP").toUpperCase();
  const cls = v === "JOKI" ? "admin-badge admin-badge-error" : "admin-badge admin-badge-info";
  return <span className={cls}>{v}</span>;
}

export default function AdminOrdersPage() {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [type, setType] = useState<"ALL" | "TOPUP" | "JOKI">("ALL");
  const [status, setStatus] = useState<"ALL" | "PENDING_PAYMENT" | "PAID" | "FAILED">("ALL");
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      if (q.trim()) sp.set("q", q.trim());
      if (type !== "ALL") sp.set("type", type);
      if (status !== "ALL") sp.set("status", status);

      const url = sp.toString() ? `/api/admin/orders?${sp.toString()}` : "/api/admin/orders";
      const res = await fetch(url, { cache: "no-store" });
      const j = await res.json();
      setRows(Array.isArray(j?.rows) ? j.rows : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // kalau mau auto reload saat filter berubah, uncomment ini:
  useEffect(() => {
    const t = setTimeout(() => load(), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, status, q]);

  const filtered = useMemo(() => rows, [rows]);

  const columns = [
    { key: "orderNo", title: "Order No", render: (r: OrderRow) => r.orderNo || r.id },
    { key: "type", title: "Tipe", render: (r: OrderRow) => <TypeBadge value={r.serviceType} /> },
    { key: "user", title: "User" },
    { key: "game", title: "Game" },
    { key: "item", title: "Item" },
    {
      key: "total",
      title: "Total",
      render: (r: OrderRow) => `Rp ${rupiah(Number(r.total || 0))}`,
    },
    {
      key: "status",
      title: "Status",
      render: (r: OrderRow) => <StatusBadge value={r.status} />,
    },
    { key: "createdAt", title: "Created" },
    {
      key: "action",
      title: "Aksi",
      render: (r: OrderRow) => (
        <Link href={`/admin/orders/${r.id}`} className="admin-btn admin-btn-ghost admin-btn-sm">
          Detail
        </Link>
      ),
    },
  ];

  return (
    <div className="admin-dashboard-wrapper">
      <header className="admin-page-header">
        <div className="admin-page-title-wrap">
          <h1 className="admin-page-title">Orders Management</h1>
          <p className="admin-page-subtitle">Track and manage all customer transaction orders.</p>
        </div>
      </header>

      <div className="admin-card">
        <div className="admin-card-header">
          <h4 className="admin-card-title">Order List</h4>
          <button onClick={load} className="admin-btn admin-btn-ghost admin-btn-sm" disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        <div className="admin-card-body">
          <div className="admin-form-grid" style={{ marginBottom: 20 }}>
            <div className="admin-form-group">
              <label className="admin-label">Search</label>
              <input
                className="admin-input"
                placeholder="Order ID / User / Game..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Type</label>
              <select
                className="admin-select"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
              >
                <option value="ALL">All Types</option>
                <option value="TOPUP">TOPUP</option>
                <option value="JOKI">JOKI</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Status</label>
              <select
                className="admin-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="ALL">All Status</option>
                <option value="PENDING_PAYMENT">PENDING</option>
                <option value="PAID">PAID</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>
          </div>

          <AdminTable columns={columns as any} rows={filtered as any} rowKey={(r: OrderRow) => r.id} />
        </div>
      </div>
    </div>
  );
}
