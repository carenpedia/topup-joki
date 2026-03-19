"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminTable from "@/app/components/AdminTable";
import { useToast } from "@/app/components/ToastProvider";

type Row = {
  id: string;
  game: string;
  product: string;
  flashPrice: number;
  startAt: string;
  endAt: string;
  isActive: boolean;
  status: "ACTIVE" | "UPCOMING" | "EXPIRED" | "INACTIVE";
};

function rupiah(n: number) {
  return new Intl.NumberFormat("id-ID").format(n);
}

function fmtDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

function StatusPill({ v }: { v: Row["status"] }) {
  const cls =
    v === "ACTIVE"
      ? "pill pill--active"
      : v === "UPCOMING"
      ? "pill"
      : v === "EXPIRED"
      ? "pill pill--danger"
      : "pill pill--muted";

  return <span className={cls}>{v}</span>;
}

export default function AdminFlashSalesPage() {
  const toast = useToast();

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [bucket, setBucket] = useState("ALL"); // ALL | ACTIVE | UPCOMING | EXPIRED
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (q.trim()) qs.set("q", q.trim());
      qs.set("bucket", bucket);
      qs.set("take", "300");

      const res = await fetch(`/api/admin/flash-sales?${qs.toString()}`, { cache: "no-store" });
      const j = await res.json();
      setRows(Array.isArray(j?.rows) ? j.rows : []);
    } catch (e: any) {
      toast.critical(e?.message || "Gagal load flash sales");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bucket]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return rows;
    return rows.filter((r) => (r.game + " " + r.product).toLowerCase().includes(qq));
  }, [rows, q]);

  const columns = [
    { key: "game", title: "Game", width: 180 },
    { key: "product", title: "Product", width: 260 },
    {
      key: "flashPrice",
      title: "Flash Price",
      width: 140,
      render: (r: Row) => `Rp ${rupiah(Number(r.flashPrice || 0))}`,
    },
    {
      key: "startAt",
      title: "Start",
      width: 180,
      render: (r: Row) => fmtDate(r.startAt),
    },
    {
      key: "endAt",
      title: "End",
      width: 180,
      render: (r: Row) => fmtDate(r.endAt),
    },
    {
      key: "status",
      title: "Status",
      width: 140,
      render: (r: Row) => <StatusPill v={r.status} />,
    },
    {
      key: "action",
      title: "Aksi",
      width: 110,
      render: (r: Row) => (
        <Link href={`/admin/flash-sales/${r.id}`} className="btn-ghost btn-xs">
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
            <h4 className="contact-title">Flash Sale</h4>
          </div>
        </div>

        <div className="contact-body">
          {/* toolbar */}
          <div className="contact-row" style={{ gap: 10 }}>
            <input
              className="contact-input"
              placeholder="Cari game / product..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ flex: 1, minWidth: 240 }}
            />

            <select
              className="contact-input"
              value={bucket}
              onChange={(e) => setBucket(e.target.value)}
              style={{ width: 170 }}
            >
              <option value="ALL">Semua</option>
              <option value="ACTIVE">Active</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="EXPIRED">Expired/Inactive</option>
            </select>

            <button onClick={load} className="btn-ghost btn-xs" disabled={loading}>
              {loading ? "Loading..." : "Refresh"}
            </button>

            <Link href="/admin/flash-sales/new" className="btn-primary btn-xs">
              + New
            </Link>
          </div>

          <div style={{ height: 12 }} />

          <AdminTable
            columns={columns as any}
            rows={filtered as any}
            rowKey={(r: Row) => r.id}
          />
        </div>
      </div>
    </div>
  );
}