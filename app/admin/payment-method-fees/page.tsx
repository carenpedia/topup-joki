"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AdminTable from "@/app/components/AdminTable";

type Row = {
  id: string;
  methodKey: string;
  label: string;
  category: string;
  image: string | null;
  feeFlat: number;
  feePercent: number;
  minFee: number | null;
  maxFee: number | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
};

function rupiah(n: number | null) {
  if (n === null || n === undefined) return "-";
  return new Intl.NumberFormat("id-ID").format(Number(n || 0));
}

export default function AdminPaymentMethodFeesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [active, setActive] = useState("ALL");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (q.trim()) qs.set("q", q.trim());
      qs.set("active", active);

      const res = await fetch(`/api/admin/payment-method-fees?${qs.toString()}`, {
        cache: "no-store",
      });
      const j = await res.json().catch(() => ({}));
      setRows(Array.isArray(j?.rows) ? j.rows : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, q]);

  const filtered = useMemo(() => rows, [rows]);

  const columns = [
    { key: "methodKey", title: "Method Key", render: (r: Row) => r.methodKey },
    { key: "label", title: "Label", render: (r: Row) => r.label },
    { key: "category", title: "Kategori", render: (r: Row) => r.category },
    { key: "feeFlat", title: "Flat", render: (r: Row) => `Rp ${rupiah(r.feeFlat || 0)}` },
    { key: "feePercent", title: "%", render: (r: Row) => `${r.feePercent}%` },
    { key: "minFee", title: "Min", render: (r: Row) => (r.minFee === null ? "-" : `Rp ${rupiah(r.minFee)}`) },
    { key: "maxFee", title: "Max", render: (r: Row) => (r.maxFee === null ? "-" : `Rp ${rupiah(r.maxFee)}`) },
    {
      key: "isActive",
      title: "Status",
      render: (r: Row) => (
        <span className={r.isActive ? "pill pill--active" : "pill pill--danger"}>
          {r.isActive ? "ACTIVE" : "INACTIVE"}
        </span>
      ),
    },
    { key: "sortOrder", title: "Sort", render: (r: Row) => r.sortOrder },
    {
      key: "action",
      title: "Aksi",
      render: (r: Row) => (
        <Link href={`/admin/payment-method-fees/${r.id}`} className="btn-ghost btn-xs">
          Detail
        </Link>
      ),
    },
  ];

  return (
    <div className="contact-section">
      <div className="contact-card">
        <div className="contact-header">
          <div className="contact-step">F</div>
          <div className="contact-title-wrap">
            <h4 className="contact-title">Payment Method Fee</h4>
          </div>
        </div>

        <div className="contact-body">
          <div className="contact-row" style={{ gap: 10 }}>
            <input
              className="contact-input"
              placeholder="Cari method key / label..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ flex: 1, minWidth: 220 }}
            />

            <select
              className="contact-input"
              value={active}
              onChange={(e) => setActive(e.target.value)}
              style={{ width: 150 }}
            >
              <option value="ALL">Status: Semua</option>
              <option value="TRUE">Active</option>
              <option value="FALSE">Inactive</option>
            </select>

            <button onClick={load} className="btn-ghost btn-xs" disabled={loading}>
              {loading ? "Loading..." : "Refresh"}
            </button>

            <Link href="/admin/payment-method-fees/new" className="btn-primary btn-xs">
              + Tambah
            </Link>
          </div>

          <div style={{ height: 12 }} />

          <AdminTable columns={columns as any} rows={filtered as any} rowKey={(r: Row) => r.id} />
        </div>
      </div>
    </div>
  );
}