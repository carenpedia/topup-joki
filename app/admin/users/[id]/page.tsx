"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";


type UserDetail = {
  id: string;
  username: string;
  whatsapp: string;
  role: "MEMBER" | "RESELLER" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED";
  carencoinBalance: number;
  pointsBalance: number;
  resellerJoinedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const r = useRouter();

  const [row, setRow] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(`/api/admin/users/${id}`, { cache: "no-store" });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Gagal load user");
      setRow(j.row);
    } catch (e: any) {
      setErr(e?.message || "Gagal load user");
      setRow(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function patch(data: Partial<Pick<UserDetail, "role" | "status">>) {
    if (!row) return;
    setUpdating(true);
    setErr("");
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || "Gagal update user");
      setRow(j.row);
    } catch (e: any) {
      setErr(e?.message || "Gagal update user");
    } finally {
      setUpdating(false);
    }
  }

  async function onDelete() {
    if (!row) return;
    if (row.role === "ADMIN") {
      alert("Akun ADMIN tidak bisa dihapus dari sini.");
      return;
    }
    const ok = confirm(`Hapus user "${row.username}" dari database? (tidak bisa dibatalkan)`);
    if (!ok) return;

    setUpdating(true);
    setErr("");
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || "Gagal hapus user");
      r.push("/admin/users");
      r.refresh();
    } catch (e: any) {
      setErr(e?.message || "Gagal hapus user");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="contact-section">
      <div className="contact-card">
        {/* Header */}
        <div className="contact-header">
          <div className="contact-step">U</div>
          <div className="contact-title-wrap">
            <h4 className="contact-title">User Detail</h4>
          </div>
        </div>

        {/* Body */}
        <div className="contact-body">
          <button className="btn-ghost btn-sm" onClick={() => r.back()}>
            ← Back
          </button>

          <div style={{ height: 14 }} />

          {loading ? (
            <div style={{ opacity: 0.75, fontWeight: 800 }}>Loading...</div>
          ) : err ? (
            <div style={{ color: "salmon", fontWeight: 900 }}>{err}</div>
          ) : !row ? (
            <div style={{ color: "salmon", fontWeight: 900 }}>User tidak ditemukan.</div>
          ) : (
            <>
              <div className="order-summary">
                <div className="order-kv">
                  <div className="order-k">ID</div>
                  <div className="order-v">{row.id}</div>
                </div>
                <div className="order-kv">
                  <div className="order-k">Username</div>
                  <div className="order-v">{row.username}</div>
                </div>
                <div className="order-kv">
                  <div className="order-k">WhatsApp</div>
                  <div className="order-v">{row.whatsapp}</div>
                </div>
                <div className="order-kv">
                  <div className="order-k">Role</div>
                  <div className="order-v">{row.role}</div>
                </div>
                <div className="order-kv">
                  <div className="order-k">Status</div>
                  <div className="order-v">{row.status}</div>
                </div>
              </div>

              <div style={{ height: 14 }} />

              <div className="order-grid">
                <div className="order-card">
                  <div className="order-card-title">Balances</div>
                  <div className="order-line">
                    <span className="order-label">CarenCoin</span>
                    <span className="order-value">{row.carencoinBalance}</span>
                  </div>
                  <div className="order-line">
                    <span className="order-label">Points</span>
                    <span className="order-value">{row.pointsBalance}</span>
                  </div>
                </div>

                <div className="order-card">
                  <div className="order-card-title">Reseller</div>
                  <div className="order-line">
                    <span className="order-label">Joined At</span>
                    <span className="order-value">
                      {row.resellerJoinedAt ? new Date(row.resellerJoinedAt).toLocaleString("id-ID") : "-"}
                    </span>
                  </div>
                </div>

                <div className="order-card">
                  <div className="order-card-title">Timestamps</div>
                  <div className="order-line">
                    <span className="order-label">Created</span>
                    <span className="order-value">{new Date(row.createdAt).toLocaleString("id-ID")}</span>
                  </div>
                  <div className="order-line">
                    <span className="order-label">Updated</span>
                    <span className="order-value">{new Date(row.updatedAt).toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>

              <div style={{ height: 18 }} />

              <div className="admin-actions">
                <button className="btn-ghost btn-sm" onClick={load} disabled={updating}>
                  Refresh
                </button>

                <div className="admin-actions-right" style={{ gap: 10 }}>
                  {/* Status */}
                  <button
                    className="btn-ghost btn-sm"
                    onClick={() => patch({ status: row.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" })}
                    disabled={updating || row.role === "ADMIN"}
                    title={row.role === "ADMIN" ? "ADMIN tidak bisa diubah" : ""}
                  >
                    {row.status === "ACTIVE" ? "Suspend" : "Activate"}
                  </button>

                  {/* Role */}
                  <button
                    className="btn-ghost btn-sm"
                    onClick={() => patch({ role: row.role === "MEMBER" ? "RESELLER" : "MEMBER" })}
                    disabled={updating || row.role === "ADMIN"}
                    title={row.role === "ADMIN" ? "ADMIN tidak bisa diubah" : ""}
                  >
                    Toggle Role
                  </button>

                  {/* Delete */}
                  <button className="btn-danger btn-sm" onClick={onDelete} disabled={updating || row.role === "ADMIN"}>
                    Delete
                  </button>
                </div>
              </div>

              {err ? <div style={{ marginTop: 12, color: "salmon", fontWeight: 900 }}>{err}</div> : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
