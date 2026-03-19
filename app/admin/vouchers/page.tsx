"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AdminTable from "../../components/AdminTable";


type Voucher = {
  id: string;
  code: string;
  target: "PUBLIC" | "MEMBER" | "RESELLER";
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  minPurchase: number;
  quotaUsed: number;
  quotaTotal: number | null;
  isActive: boolean;
};

export default function AdminVouchersList() {
  const [items, setItems] = useState<Voucher[]>([]);
  const [q, setQ] = useState("");
  const [target, setTarget] = useState<string>("");
  const [active, setActive] = useState<string>("");

  async function load() {
    const sp = new URLSearchParams();
    if (q.trim()) sp.set("q", q.trim());
    if (target) sp.set("target", target);
    if (active) sp.set("active", active); // "1"|"0"

    const res = await fetch(`/api/admin/vouchers?${sp.toString()}`);
    const j = await res.json();
    setItems(j.items ?? []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = useMemo(() => {
    return items.map((v) => ({
      code: (
        <div style={{ fontWeight: 950 }}>
          {v.code}
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.55)", marginTop: 4 }}>
            {v.target} • {v.discountType} {v.discountValue} • min {v.minPurchase}
          </div>
        </div>
      ),
      quota: `${v.quotaUsed}/${v.quotaTotal ?? "∞"}`,
      active: (
        <span
          style={{
            padding: "5px 10px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 900,
            border: "1px solid rgba(255,255,255,.10)",
            background: v.isActive ? "rgba(34,197,94,.12)" : "rgba(239,68,68,.10)",
          }}
        >
          {v.isActive ? "ACTIVE" : "OFF"}
        </span>
      ),
      action: (
        <Link
          href={`/admin/vouchers/${v.id}`}
          style={{
            padding: "8px 10px",
            borderRadius: 10,
            border: "1px solid rgba(59,130,246,.28)",
            background: "rgba(59,130,246,.10)",
            color: "rgba(255,255,255,.92)",
            fontWeight: 900,
            fontSize: 12,
          }}
        >
          Edit
        </Link>
      ),
      _id: v.id,
    }));
  }, [items]);

  const columns = [
    { key: "code", title: "Voucher" },
    { key: "quota", title: "Quota", width: 120 },
    { key: "active", title: "Status", width: 120 },
    { key: "action", title: "Aksi", width: 110 },
  ];

  return (
    <div className="contact-section">
      <div className="contact-card">
        <div className="contact-header">
          <div className="contact-step">V</div>
          <div className="contact-title-wrap">
            <h4 className="contact-title">Vouchers</h4>
          </div>
        </div>

        <div className="contact-body">
          {/* Filters */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr .8fr .8fr auto", gap: 10 }}>
            <input className="contact-input" placeholder="Cari kode (ex: CAREN)" value={q} onChange={(e) => setQ(e.target.value)} />

            <select className="contact-input" value={target} onChange={(e) => setTarget(e.target.value)}>
              <option value="">Target: Semua</option>
              <option value="PUBLIC">PUBLIC</option>
              <option value="MEMBER">MEMBER</option>
              <option value="RESELLER">RESELLER</option>
            </select>

            <select className="contact-input" value={active} onChange={(e) => setActive(e.target.value)}>
              <option value="">Status: Semua</option>
              <option value="1">Active</option>
              <option value="0">Off</option>
            </select>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="voucherBtn" type="button" onClick={load}>Filter</button>
              <Link className="voucherBtn" href="/admin/vouchers/new" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
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
