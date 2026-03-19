"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminTable from "@/app/components/AdminTable";

type BannerRow = {
  id: string;
  title?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  isActive?: boolean | null;
  sortOrder?: number | null;
  startAt?: string | null;
  endAt?: string | null;
};

type Column<T> = {
  key: string;
  title: string;
  render?: (row: T) => React.ReactNode;
};

function fmtDate(v?: string | null) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

const pillBtn: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,.10)",
  background: "rgba(0,0,0,.20)",
  color: "rgba(255,255,255,.92)",
  borderRadius: 14,
  padding: "12px 14px",
  fontWeight: 900,
  cursor: "pointer",
};

const pillBtnPrimary: React.CSSProperties = {
  ...pillBtn,
  background: "rgba(59,130,246,.92)",
  border: "1px solid rgba(59,130,246,.35)",
};

export default function AdminBannersPage() {
  const [rows, setRows] = useState<BannerRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [showFilter, setShowFilter] = useState(false);
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/banners", {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      // anti “Unexpected token <” (HTML kebaca sebagai JSON)
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        const text = await res.text();
        throw new Error(
          `Response bukan JSON. Content-Type=${ct}. Snippet=${text.slice(0, 80)}`
        );
      }

      const j = await res.json();
      const data: BannerRow[] = Array.isArray(j)
        ? j
        : Array.isArray(j?.rows)
        ? j.rows
        : [];

      setRows(data);
    } catch (e) {
      console.error(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter((r) => {
      const matchStatus =
        status === "ALL"
          ? true
          : status === "ACTIVE"
          ? !!r.isActive
          : !r.isActive;

      const matchSearch = !s
        ? true
        : `${r.title ?? ""} ${r.linkUrl ?? ""} ${r.imageUrl ?? ""}`
            .toLowerCase()
            .includes(s);

      return matchStatus && matchSearch;
    });
  }, [rows, status, q]);

  const columns: Column<BannerRow>[] = useMemo(
    () => [
      {
        key: "title",
        title: "Judul",
        render: (r) => (
          <div style={{ fontWeight: 800 }}>
            {r.title || <span style={{ opacity: 0.7 }}>(tanpa judul)</span>}
            {r.sortOrder != null && (
              <div style={{ opacity: 0.65, fontSize: 12, marginTop: 4 }}>
                Urutan: {r.sortOrder}
              </div>
            )}
          </div>
        ),
      },
      {
        key: "status",
        title: "Status",
        render: (r) => (
          <span
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 900,
              border: "1px solid rgba(255,255,255,.12)",
              background: r.isActive
                ? "rgba(34,197,94,.18)"
                : "rgba(255,255,255,.06)",
              color: r.isActive ? "rgba(255,255,255,.92)" : "rgba(255,255,255,.75)",
              display: "inline-block",
            }}
          >
            {r.isActive ? "ACTIVE" : "INACTIVE"}
          </span>
        ),
      },
      { key: "startAt", title: "Mulai", render: (r) => fmtDate(r.startAt) },
      { key: "endAt", title: "Selesai", render: (r) => fmtDate(r.endAt) },
      {
        key: "imageUrl",
        title: "Gambar",
        render: (r) =>
          r.imageUrl ? (
            <a
              href={r.imageUrl}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: "underline" }}
            >
              Lihat
            </a>
          ) : (
            "-"
          ),
      },
      {
        key: "linkUrl",
        title: "Link",
        render: (r) =>
          r.linkUrl ? (
            <a
              href={r.linkUrl}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: "underline" }}
            >
              {r.linkUrl.length > 28 ? r.linkUrl.slice(0, 28) + "…" : r.linkUrl}
            </a>
          ) : (
            "-"
          ),
      },
      {
        key: "action",
        title: "Aksi",
        render: (r) => (
          <Link
            href={`/admin/banners/${r.id}`}
            style={{
              ...pillBtn,
              padding: "8px 12px",
              borderRadius: 12,
              fontWeight: 900,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Edit
          </Link>
        ),
      },
    ],
    []
  );

  return (
  <div className="contact-section">
    <div className="contact-card">
      {/* HEADER */}
      <div className="contact-header">
        <div className="contact-step">B</div>

        <div className="contact-title-wrap">
          <div className="contact-title">Promo Banners</div>
          <div className="contact-title-desc">
            Kelola banner promo untuk homepage / halaman depan.
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="contact-body">
        {/* TOP BAR BODY */}
        <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  }}
>
  {/* LEFT SIDE */}
  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
    <select
      value={status}
      onChange={(e) => setStatus(e.target.value as any)}
      style={{
        background: "rgba(255,255,255,.05)",
        border: "1px solid rgba(255,255,255,.08)",
        color: "rgba(255,255,255,.85)",
        padding: "8px 14px",
        borderRadius: 999,
        fontSize: 13,
        outline: "none",
        cursor: "pointer",
      }}
    >
      <option value="ALL">Status: Semua</option>
      <option value="ACTIVE">Status: Active</option>
      <option value="INACTIVE">Status: Inactive</option>
    </select>

    <button
      onClick={() => setShowFilter((s) => !s)}
      style={{
        background: "rgba(255,255,255,.05)",
        border: "1px solid rgba(255,255,255,.08)",
        color: "rgba(255,255,255,.85)",
        padding: "8px 14px",
        borderRadius: 999,
        fontSize: 13,
        cursor: "pointer",
      }}
    >
      Filter
    </button>
  </div>

  {/* RIGHT SIDE */}
  <Link
    href="/admin/banners/new"
    style={{
      background: "linear-gradient(180deg,#3b82f6,#2563eb)",
      border: "none",
      color: "#fff",
      padding: "8px 16px",
      borderRadius: 999,
      fontSize: 13,
      fontWeight: 700,
      textDecoration: "none",
      boxShadow: "0 4px 14px rgba(37,99,235,.35)",
    }}
  >
    + New
  </Link>
</div>

        {/* TABLE */}
        <AdminTable<BannerRow>
          columns={columns}
          rows={filtered}
          rowKey={(row) => row.id}
        />
      </div>
    </div>
  </div>
);

}
