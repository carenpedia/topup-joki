"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminTable from "@/app/components/AdminTable";

type CategoryRow = {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  gameCount: number;
  createdAt: string | null;
};

function StatusBadge({ value }: { value: boolean }) {
  return (
    <span className={value ? "pill pill--active" : "pill pill--danger"}>
      {value ? "ACTIVE" : "INACTIVE"}
    </span>
  );
}

export default function AdminCategoriesPage() {
  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [active, setActive] = useState("ALL");
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      if (q.trim()) sp.set("q", q.trim());
      if (active !== "ALL") sp.set("active", active);

      const url = sp.toString()
        ? `/api/admin/categories?${sp.toString()}`
        : "/api/admin/categories";
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

  useEffect(() => {
    const t = setTimeout(() => load(), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, q]);

  const filtered = useMemo(() => rows, [rows]);

  const columns = [
    { key: "name", title: "Nama Kategori" },
    { key: "gameCount", title: "Jumlah Game" },
    { key: "sortOrder", title: "Sort Order" },
    {
      key: "isActive",
      title: "Status",
      render: (r: CategoryRow) => <StatusBadge value={r.isActive} />,
    },
    { key: "createdAt", title: "Dibuat" },
    {
      key: "action",
      title: "Aksi",
      render: (r: CategoryRow) => (
        <Link
          href={`/admin/categories/${r.id}`}
          className="btn-ghost btn-xs"
        >
          Detail
        </Link>
      ),
    },
  ];

  return (
    <div className="contact-section">
      <div className="contact-card">
        <div className="contact-header">
          <div className="contact-step">C</div>
          <div className="contact-title-wrap">
            <h4 className="contact-title">Categories</h4>
          </div>
        </div>

        <div className="contact-body">
          <div className="contact-row" style={{ gap: 10 }}>
            <input
              className="contact-input"
              placeholder="Cari nama kategori..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ flex: 1, minWidth: 220 }}
            />

            <select
              className="contact-input"
              value={active}
              onChange={(e) => setActive(e.target.value)}
              style={{ width: 160 }}
            >
              <option value="ALL">Status: Semua</option>
              <option value="TRUE">Active</option>
              <option value="FALSE">Inactive</option>
            </select>

            <button
              onClick={load}
              className="btn-ghost btn-xs"
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>

            <Link
              href="/admin/categories/new"
              className="btn-primary btn-xs"
            >
              + Tambah
            </Link>
          </div>

          <div style={{ height: 12 }} />

          <AdminTable
            columns={columns as any}
            rows={filtered as any}
            rowKey={(r: CategoryRow) => r.id}
          />
        </div>
      </div>
    </div>
  );
}
