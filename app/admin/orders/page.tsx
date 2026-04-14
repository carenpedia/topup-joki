
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
      ? "pill pill--active"
      : v === "FAILED"
        ? "pill pill--danger"
        : "pill pill--muted";

  return <span className={cls}>{label}</span>;
}

function TypeBadge({ value }: { value?: string | null }) {
  const v = (value || "TOPUP").toUpperCase();
  const cls = v === "JOKI" ? "pill pill--danger" : "pill pill--muted";
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
    { key: "orderNo", title: "Order No", width: 170, render: (r: OrderRow) => r.orderNo || r.id },
    { key: "type", title: "Tipe", width: 120, render: (r: OrderRow) => <TypeBadge value={r.serviceType} /> },
    { key: "user", title: "User", width: 200 },
    { key: "game", title: "Game", width: 160 },
    { key: "item", title: "Item", width: 240 },
    {
      key: "total",
      title: "Total",
      width: 140,
      render: (r: OrderRow) => `Rp ${rupiah(Number(r.total || 0))}`,
    },
    {
      key: "status",
      title: "Status",
      width: 140,
      render: (r: OrderRow) => <StatusBadge value={r.status} />,
    },
    { key: "createdAt", title: "Created", width: 170 },
    {
      key: "action",
      title: "Aksi",
      width: 110,
      render: (r: OrderRow) => (
        <Link href={`/admin/orders/${r.id}`} className="btn-ghost btn-xs">
          Detail
        </Link>
      ),
    },
  ];

  return (
    <div className="contact-section">
      <div className="contact-card">
        <div className="contact-header">
          <div className="contact-step">O</div>
          <div className="contact-title-wrap">
            <h4 className="contact-title">Orders</h4>
          </div>
        </div>

        <div className="contact-body">
          <div className="contact-row" style={{ gap: 10 }}>
            <input
              className="contact-input"
              placeholder="Cari order no / user / game / item"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ flex: 1, minWidth: 220 }}
            />

            {/* FILTER TIPE: Semua / Topup / Joki */}
            <select
              className="contact-input"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              style={{ width: 160 }}
            >
              <option value="ALL">Tipe: Semua</option>
              <option value="TOPUP">TOPUP</option>
              <option value="JOKI">JOKI</option>
            </select>

            {/* FILTER STATUS */}
            <select
              className="contact-input"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              style={{ width: 180 }}
            >
              <option value="ALL">Status: Semua</option>
              <option value="PENDING_PAYMENT">PENDING</option>
              <option value="PAID">PAID</option>
              <option value="FAILED">FAILED</option>
            </select>

            <button onClick={load} className="btn-ghost btn-xs" disabled={loading}>
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          <div style={{ height: 12 }} />

          <AdminTable columns={columns as any} rows={filtered as any} rowKey={(r: OrderRow) => r.id} />
        </div>
      </div>
    </div>
  );
}
