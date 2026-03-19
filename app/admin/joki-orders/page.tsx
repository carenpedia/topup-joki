"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminTable from "@/app/components/AdminTable";

type Row = {
  id: string;
  orderNo: string;
  username: string;
  whatsapp: string;
  total: number;
  status: string;
  createdAt: string;
};

function rupiah(n: number) {
  return new Intl.NumberFormat("id-ID").format(n);
}

function StatusBadge({ value }: { value?: string | null }) {
  const v = (value || "PENDING_PAYMENT").toUpperCase();
  const cls =
    v === "PAID"
      ? "pill pill--active"
      : v === "FAILED"
      ? "pill pill--danger"
      : "pill pill--muted";

  return <span className={cls}>{v}</span>;
}

export default function AdminJokiOrdersPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("ALL");
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      if (q.trim()) sp.set("q", q.trim());
      if (status !== "ALL") sp.set("status", status);

      const res = await fetch(`/api/admin/joki-orders?${sp.toString()}`, { cache: "no-store" });
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

  const filtered = useMemo(() => {
    // server sudah filter, ini sekadar safety kalau mau cepat.
    const qq = q.trim().toLowerCase();
    return rows.filter((r) => {
      const okStatus = status === "ALL" ? true : (r.status || "").toUpperCase() === status;
      const okQ =
        !qq ||
        (r.orderNo || "").toLowerCase().includes(qq) ||
        (r.username || "").toLowerCase().includes(qq) ||
        (r.whatsapp || "").toLowerCase().includes(qq);
      return okStatus && okQ;
    });
  }, [rows, status, q]);

  const columns = [
    { key: "orderNo", title: "Order No", width: 160 },
    { key: "username", title: "User", width: 180 },
    { key: "whatsapp", title: "WhatsApp", width: 170 },
    {
      key: "total",
      title: "Total",
      width: 140,
      render: (r: Row) => `Rp ${rupiah(Number(r.total || 0))}`,
    },
    {
      key: "status",
      title: "Status",
      width: 170,
      render: (r: Row) => <StatusBadge value={r.status} />,
    },
    { key: "createdAt", title: "Created", width: 190 },
    {
      key: "action",
      title: "Aksi",
      width: 110,
      render: (r: Row) => (
        <Link href={`/admin/joki-orders/${r.id}`} className="btn-ghost btn-xs">
          Detail
        </Link>
      ),
    },
  ];

  return (
    <div className="contact-section">
      <div className="contact-card">
        <div className="contact-header">
          <div className="contact-step">J</div>
          <div className="contact-title-wrap">
            <h4 className="contact-title">Joki Orders</h4>
          </div>
        </div>

        <div className="contact-body">
          <div className="contact-row" style={{ gap: 10 }}>
            <input
              className="contact-input"
              placeholder="Cari orderNo / username / whatsapp"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ flex: 1, minWidth: 220 }}
            />

            <select
              className="contact-input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ width: 190 }}
            >
              <option value="ALL">Status: Semua</option>
              <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
              <option value="PAID">PAID</option>
              <option value="FAILED">FAILED</option>
            </select>

            <button onClick={load} className="btn-ghost btn-xs" disabled={loading}>
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          <div style={{ height: 12 }} />

          <AdminTable columns={columns as any} rows={filtered as any} rowKey={(r: Row) => r.id} />
        </div>
      </div>
    </div>
  );
}
