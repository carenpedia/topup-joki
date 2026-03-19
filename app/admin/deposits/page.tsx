"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminTable from "@/app/components/AdminTable";

type DepositRow = {
  id: string;
  user: string;
  amount: number;
  channel: string;
  gateway: string;
  gatewayRef: string;
  status: string;
  adminNote: string;
  createdAt: string | null;
};

function rupiah(n: number) {
  return new Intl.NumberFormat("id-ID").format(n);
}

function StatusBadge({ value }: { value?: string | null }) {
  const v = (value || "PENDING").toUpperCase();

  const cls =
    v === "APPROVED"
      ? "pill pill--active"
      : v === "REJECTED" || v === "CANCELLED" || v === "EXPIRED"
      ? "pill pill--danger"
      : v === "PAID"
      ? "pill pill--active"
      : "pill pill--muted";

  return <span className={cls}>{v}</span>;
}

function ChannelBadge({ value }: { value?: string | null }) {
  const v = (value || "GATEWAY").toUpperCase();
  const cls = v === "MANUAL" ? "pill pill--danger" : "pill pill--muted";
  return <span className={cls}>{v}</span>;
}

export default function AdminDepositsPage() {
  const [rows, setRows] = useState<DepositRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState("ALL");
  const [channel, setChannel] = useState("ALL");
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      if (q.trim()) sp.set("q", q.trim());
      if (status !== "ALL") sp.set("status", status);
      if (channel !== "ALL") sp.set("channel", channel);

      const url = sp.toString()
        ? `/api/admin/deposits?${sp.toString()}`
        : "/api/admin/deposits";
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
  }, [status, channel, q]);

  const filtered = useMemo(() => rows, [rows]);

  const columns = [
    {
      key: "user",
      title: "User",
    },
    {
      key: "amount",
      title: "Jumlah",
      render: (r: DepositRow) => `Rp ${rupiah(Number(r.amount || 0))}`,
    },
    {
      key: "channel",
      title: "Channel",
      render: (r: DepositRow) => <ChannelBadge value={r.channel} />,
    },
    {
      key: "gateway",
      title: "Gateway",
    },
    {
      key: "status",
      title: "Status",
      render: (r: DepositRow) => <StatusBadge value={r.status} />,
    },
    {
      key: "createdAt",
      title: "Tanggal",
    },
    {
      key: "action",
      title: "Aksi",
      render: (r: DepositRow) => (
        <Link
          href={`/admin/deposits/${r.id}`}
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
          <div className="contact-step">D</div>
          <div className="contact-title-wrap">
            <h4 className="contact-title">Deposits</h4>
          </div>
        </div>

        <div className="contact-body">
          <div className="contact-row" style={{ gap: 10 }}>
            <input
              className="contact-input"
              placeholder="Cari user / gateway ref..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ flex: 1, minWidth: 220 }}
            />

            {/* FILTER STATUS */}
            <select
              className="contact-input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ width: 180 }}
            >
              <option value="ALL">Status: Semua</option>
              <option value="PENDING">PENDING</option>
              <option value="PAID">PAID</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="EXPIRED">EXPIRED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>

            {/* FILTER CHANNEL */}
            <select
              className="contact-input"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              style={{ width: 160 }}
            >
              <option value="ALL">Channel: Semua</option>
              <option value="GATEWAY">GATEWAY</option>
              <option value="MANUAL">MANUAL</option>
            </select>

            <button
              onClick={load}
              className="btn-ghost btn-xs"
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          <div style={{ height: 12 }} />

          <AdminTable
            columns={columns as any}
            rows={filtered as any}
            rowKey={(r: DepositRow) => r.id}
          />
        </div>
      </div>
    </div>
  );
}
