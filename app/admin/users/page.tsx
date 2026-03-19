"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminTable from "@/app/components/AdminTable";

type UserRow = {
  id: string;
  username: string;
  whatsapp: string;
  role: "MEMBER" | "RESELLER" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED";
  resellerJoinedAt: string | null;
  createdAt: string;
};

function StatusPill({ v }: { v: UserRow["status"] }) {
  const cls = v === "ACTIVE" ? "pill pill--active" : "pill pill--danger";
  return <span className={cls}>{v}</span>;
}

function RolePill({ v }: { v: UserRow["role"] }) {
  const cls = v === "RESELLER" ? "pill pill--blue" : v === "ADMIN" ? "pill pill--muted" : "pill pill--muted";
  return <span className={cls}>{v}</span>;
}

export default function AdminUsersPage() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [q, setQ] = useState("");
  const [role, setRole] = useState<"ALL" | "MEMBER" | "RESELLER" | "ADMIN">("ALL");
  const [status, setStatus] = useState<"ALL" | "ACTIVE" | "SUSPENDED">("ALL");

  async function load() {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      if (q.trim()) sp.set("q", q.trim());
      if (role !== "ALL") sp.set("role", role);
      if (status !== "ALL") sp.set("status", status);

      const res = await fetch(`/api/admin/users?${sp.toString()}`, { cache: "no-store" });
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
    const qq = q.trim().toLowerCase();
    return rows.filter((r) => {
      const okQ =
        !qq ||
        r.id.toLowerCase().includes(qq) ||
        r.username.toLowerCase().includes(qq) ||
        r.whatsapp.toLowerCase().includes(qq);
      const okRole = role === "ALL" ? true : r.role === role;
      const okStatus = status === "ALL" ? true : r.status === status;
      return okQ && okRole && okStatus;
    });
  }, [rows, q, role, status]);

  const columns = [
    { key: "username", title: "Username", width: 180 },
    { key: "whatsapp", title: "WhatsApp", width: 190 },
    { key: "role", title: "Role", width: 140, render: (r: UserRow) => <RolePill v={r.role} /> },
    { key: "status", title: "Status", width: 140, render: (r: UserRow) => <StatusPill v={r.status} /> },
    { key: "createdAt", title: "Created", width: 180, render: (r: UserRow) => new Date(r.createdAt).toLocaleString("id-ID") },
    {
      key: "action",
      title: "Aksi",
      width: 120,
      render: (r: UserRow) => (
        <Link href={`/admin/users/${r.id}`} className="btn-ghost btn-xs">
          Detail
        </Link>
      ),
    },
  ];

  return (
    <div className="contact-section">
      <div className="contact-card">
        {/* Header */}
        <div className="contact-header">
          <div className="contact-step">U</div>
          <div className="contact-title-wrap">
            <h4 className="contact-title">Users</h4>
          </div>
        </div>

        {/* Body */}
        <div className="contact-body">
          {/* toolbar */}
          <div className="contact-row" style={{ gap: 10, alignItems: "center" }}>
            <input
              className="contact-input"
              placeholder="Cari id / username / whatsapp"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ flex: 1, minWidth: 240 }}
            />

            <select className="contact-input" value={role} onChange={(e) => setRole(e.target.value as any)} style={{ width: 170 }}>
              <option value="ALL">Role: Semua</option>
              <option value="MEMBER">MEMBER</option>
              <option value="RESELLER">RESELLER</option>
              <option value="ADMIN">ADMIN</option>
            </select>

            <select className="contact-input" value={status} onChange={(e) => setStatus(e.target.value as any)} style={{ width: 170 }}>
              <option value="ALL">Status: Semua</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>

            <button className="btn-ghost btn-xs" onClick={load} disabled={loading}>
              {loading ? "Loading..." : "Refresh"}
            </button>

            <Link href="/admin/users/new" className="btn-primary btn-xs">
              + New
            </Link>
          </div>

          <div style={{ height: 12 }} />

          <AdminTable columns={columns as any} rows={filtered as any} rowKey={(r: UserRow) => r.id} />
        </div>
      </div>
    </div>
  );
}
