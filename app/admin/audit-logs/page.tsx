"use client";

import { useEffect, useMemo, useState } from "react";
import AdminTable from "../../components/AdminTable";

type AuditLog = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  message: string | null;
  createdAt: string;
  actor: {
    username: string;
    role: string;
  };
};

export default function AdminAuditLogsList() {
  const [items, setItems] = useState<AuditLog[]>([]);
  const [q, setQ] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      if (q.trim()) sp.set("q", q.trim());
      if (actionFilter) sp.set("actionFilter", actionFilter);

      const res = await fetch(`/api/admin/audit-logs?${sp.toString()}`);
      if (!res.ok) {
        console.error("Failed to fetch logs");
        return;
      }
      const j = await res.json();
      setItems(j.items ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = useMemo(() => {
    return items.map((log) => {
      const dateStr = new Date(log.createdAt).toLocaleString("id-ID", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      // Simple colors based on action type
      let actionColor = "rgba(255,255,255,.2)";
      if (log.action === "CREATE" || log.action === "APPROVE") actionColor = "rgba(34,197,94,.15)"; 
      else if (log.action === "DELETE" || log.action === "REJECT" || log.action === "SUSPEND") actionColor = "rgba(239,68,68,.15)";
      else if (log.action === "UPDATE") actionColor = "rgba(59,130,246,.15)";

      // Simple text colors based on action type
      let actionTextColor = "rgba(255,255,255,.8)";
      if (log.action === "CREATE" || log.action === "APPROVE") actionTextColor = "#4ade80"; 
      else if (log.action === "DELETE" || log.action === "REJECT" || log.action === "SUSPEND") actionTextColor = "#f87171";
      else if (log.action === "UPDATE") actionTextColor = "#60a5fa";

      return {
        waktu: (
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.6)" }}>
            {dateStr}
          </div>
        ),
        admin: (
          <div style={{ fontWeight: 800 }}>
            {log.actor.username}
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", textTransform: "uppercase" }}>
              {log.actor.role}
            </div>
          </div>
        ),
        aksi: (
          <span
            style={{
              padding: "4px 8px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 900,
              background: actionColor,
              color: actionTextColor,
              border: `1px solid ${actionColor.replace(".15", ".3")}`,
            }}
          >
            {log.action}
          </span>
        ),
        entitas: (
          <div style={{ fontWeight: 700, fontSize: 13 }}>
            {log.entityType}
            {log.entityId && (
               <div style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,.4)", marginTop: 2 }}>
                  {log.entityId}
               </div>
            )}
          </div>
        ),
        detail: (
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.75)", maxWidth: 300, wordWrap: "break-word" }}>
            {log.message || "-"}
          </div>
        ),
        _id: log.id,
      };
    });
  }, [items]);

  const columns = [
    { key: "waktu", title: "Waktu", width: 150 },
    { key: "admin", title: "Admin", width: 130 },
    { key: "aksi", title: "Aksi", width: 100 },
    { key: "entitas", title: "Entitas", width: 140 },
    { key: "detail", title: "Keterangan Detail" },
  ];

  return (
    <div className="contact-section">
      <div className="contact-card">
        <div className="contact-header">
          <div className="contact-step">AL</div>
          <div className="contact-title-wrap">
            <h4 className="contact-title">Sistem Audit Log (Riwayat Administrasi)</h4>
          </div>
        </div>

        <div className="contact-body">
          {/* Filters */}
          <div className="admin-filter-bar">
            <input
              className="contact-input"
              placeholder="Cari admin / entitas / pesan (ex: budi)"
              style={{ flex: 1.5 }}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
            />

            <select className="contact-input" style={{ flex: 0.8 }} value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
              <option value="">Semua Aksi</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="APPROVE">APPROVE</option>
              <option value="REJECT">REJECT</option>
              <option value="SUSPEND">SUSPEND</option>
            </select>

            <div className="auto-width" style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="voucherBtn" type="button" onClick={load} disabled={loading}>
                {loading ? "..." : "Filter Data"}
              </button>
            </div>
          </div>

          <div className="spacer" />

          {loading && items.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: "rgba(255,255,255,.5)" }}>Memuat data...</div>
          ) : items.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: "rgba(255,255,255,.5)" }}>Tidak ada riwayat log ditemukan.</div>
          ) : (
             <AdminTable columns={columns} rows={rows} rowKey={(r) => r._id} />
          )}
        </div>
      </div>
    </div>
  );
}
