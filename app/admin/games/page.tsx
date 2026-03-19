"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AdminTable from "../../components/AdminTable";

type Game = {
  id: string;
  key: string;
  name: string;
  logoUrl: string | null;
  isActive: boolean;
};

export default function AdminGamesList() {
  const [items, setItems] = useState<Game[]>([]);
  const [q, setQ] = useState("");
  const [active, setActive] = useState<string>("");

  async function load() {
    const sp = new URLSearchParams();
    if (q.trim()) sp.set("q", q.trim());
    if (active) sp.set("active", active);

    const res = await fetch(`/api/admin/games?${sp.toString()}`);
    const j = await res.json().catch(() => ({}));
    setItems(j.items ?? []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = useMemo(() => {
    return items.map((g) => ({
      game: (
        <div style={{ fontWeight: 950 }}>
          {g.name}
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.55)", marginTop: 4 }}>
            key: <span style={{ fontWeight: 900 }}>{g.key}</span>
            {g.logoUrl ? ` • logo: ${g.logoUrl}` : ""}
          </div>
        </div>
      ),
      status: (
        <span
          style={{
            padding: "5px 10px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 900,
            border: "1px solid rgba(255,255,255,.10)",
            background: g.isActive ? "rgba(34,197,94,.12)" : "rgba(239,68,68,.10)",
          }}
        >
          {g.isActive ? "ACTIVE" : "OFF"}
        </span>
      ),
      action: (
        <Link
          href={`/admin/games/${g.id}`}
          style={{
            padding: "8px 10px",
            borderRadius: 10,
            border: "1px solid rgba(59,130,246,.28)",
            background: "rgba(59,130,246,.10)",
            color: "rgba(255,255,255,.92)",
            fontWeight: 900,
            fontSize: 12,
            textDecoration: "none",
          }}
        >
          Edit
        </Link>
      ),
      _id: g.id,
    }));
  }, [items]);

  const columns = [
    { key: "game", title: "Game" },
    { key: "status", title: "Status", width: 120 },
    { key: "action", title: "Aksi", width: 110 },
  ];

  return (
    <div className="contact-section">
      <div className="contact-card">
        <div className="contact-header">
          <div className="contact-step">G</div>
          <div className="contact-title-wrap">
            <h4 className="contact-title">Games</h4>
          </div>
        </div>

        <div className="contact-body">
          {/* Filters */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr .8fr auto", gap: 10 }}>
            <input
              className="contact-input"
              placeholder="Cari name/key (ex: mobile)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            <select className="contact-input" value={active} onChange={(e) => setActive(e.target.value)}>
              <option value="">Status: Semua</option>
              <option value="1">Active</option>
              <option value="0">Off</option>
            </select>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="voucherBtn" type="button" onClick={load}>
                Filter
              </button>
              <Link
                className="voucherBtn"
                href="/admin/games/new"
                style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}
              >
                + New
              </Link>
            </div>
          </div>

          <div className="spacer" />

          <AdminTable columns={columns} rows={rows} rowKey={(r) => r._id} />
        </div>
      </div>
    </div>
  );
}
