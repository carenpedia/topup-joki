"use client";

import { useEffect, useMemo, useState } from "react";
import AdminTable from "../../components/AdminTable";
import Link from "next/link";

export default function AdminTicketsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const load = async () => {
    try {
      const sp = new URLSearchParams();
      if (search) sp.set("search", search);
      const res = await fetch(`/api/admin/tickets?${sp.toString()}`);
      const data = await res.json();
      if (data.items) setItems(data.items);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    if (statusFilter === "ALL") return items;
    return items.filter(t => t.status === statusFilter);
  }, [statusFilter, items]);

  const rows = useMemo(() => {
    return filtered.map((t) => ({
      date: new Date(t.createdAt).toLocaleString("id-ID"),
      ticketInfo: (
        <div>
          <div style={{ fontWeight: 800 }}>{t.ticketNo}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
            {t.orderId ? `Order: ${t.orderId}` : "—"}
          </div>
        </div>
      ),
      reporter: (
        <div>
          {t.userId ? (
            <span style={{ color: "#60a5fa", fontWeight: 700 }}>{t.user?.username || "User"}</span>
          ) : (
            <span style={{ color: "#f59e0b", fontWeight: 700 }}>[GUEST] {t.contactWa}</span>
          )}
        </div>
      ),
      topicTitle: (
        <div style={{ maxWidth: 200 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>{t.topic}</div>
          <div style={{ fontSize: 13, fontWeight: 800 }}>{t.title}</div>
        </div>
      ),
      status: (
        <span style={{
          padding: "4px 8px", borderRadius: 8, fontSize: 11, fontWeight: 800,
          background: t.status === "CLOSED" ? "rgba(239,68,68,0.15)" : t.status === "ANSWERED" ? "rgba(34,197,94,0.15)" : t.status === "CUSTOMER_REPLY" ? "rgba(245,158,11,0.15)" : "rgba(59,130,246,0.15)",
          color: t.status === "CLOSED" ? "#f87171" : t.status === "ANSWERED" ? "#4ade80" : t.status === "CUSTOMER_REPLY" ? "#f59e0b" : "#60a5fa"
        }}>
          {t.status}
        </span>
      ),
      action: (
        <Link
          href={`/admin/tickets/${t.ticketNo}`}
          style={{
            padding: "8px 10px", borderRadius: 10,
            border: "1px solid rgba(59,130,246,.28)",
            background: "rgba(59,130,246,.10)",
            color: "rgba(255,255,255,.92)",
            fontWeight: 900, fontSize: 12, textDecoration: "none",
          }}
        >
          Buka
        </Link>
      ),
      _id: t.id,
    }));
  }, [filtered]);

  const columns = [
    { key: "date", title: "Tanggal" },
    { key: "ticketInfo", title: "No. Tiket" },
    { key: "reporter", title: "Pelapor" },
    { key: "topicTitle", title: "Topik & Judul" },
    { key: "status", title: "Status" },
    { key: "action", title: "Aksi" },
  ];

  return (
    <div className="contact-section">
      <div className="contact-card">
        <div className="contact-header">
          <div className="contact-step">🎫</div>
          <div className="contact-title-wrap">
            <h4 className="contact-title">Support Tickets</h4>
          </div>
        </div>

        <div className="contact-body">
          <div className="admin-filter-bar">
            <input
              className="contact-input"
              placeholder="Cari No. Tiket / WhatsApp / Order ID..."
              style={{ flex: 1.4 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select className="contact-input" style={{ flex: 0.8 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">Status: Semua</option>
              <option value="OPEN">OPEN</option>
              <option value="CUSTOMER_REPLY">CUSTOMER REPLY</option>
              <option value="ANSWERED">ANSWERED</option>
              <option value="CLOSED">CLOSED</option>
            </select>

            <div className="auto-width" style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="voucherBtn" type="button" onClick={load}>
                Filter
              </button>
            </div>
          </div>

          <div className="spacer" />

          <AdminTable columns={columns} rows={rows} rowKey={(r) => r._id} />
        </div>
      </div>
    </div>
  );
}
