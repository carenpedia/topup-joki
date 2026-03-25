"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type HeroRequest = { id: string; hero: string };

type JokiDetail = {
  id: string;
  loginVia: string;
  userIdNickname: string;
  loginId: string;
  password: string;
  noteForJoki: string | null;
  status: string;
  heroes: string[];
};

type Detail = {
  id: string;
  orderNo: string;
  status: string;
  createdAt: string;
  paidAt: string | null;
  total: number;
  basePrice: number;
  contactWhatsapp: string;
  contactEmail: string;
  paymentMethod: string;
  gatewayMethodKey: string | null;
  user: null | { id: string; username: string; role: string; status: string; whatsapp: string };
  game: null | { key: string; name: string };
  jokiDetail: JokiDetail | null;
};

function rupiah(n: number) {
  return new Intl.NumberFormat("id-ID").format(n);
}

const JOKI_STATUS_LABELS: Record<string, string> = {
  PENDING: "⏳ Pending",
  IN_PROGRESS: "🎮 In Progress",
  COMPLETED: "✅ Completed",
  CANCELLED: "❌ Cancelled",
};

export default function AdminJokiOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const r = useRouter();

  const [data, setData] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [updatingJoki, setUpdatingJoki] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/admin/joki-orders/${id}`, { cache: "no-store" });
    const j = await res.json();
    setData(j.row || null);
    setLoading(false);
  }

  async function updateOrderStatus(next: string) {
    if (updatingOrder) return;
    if (!confirm(`Yakin ubah order status menjadi ${next}?`)) return;
    setUpdatingOrder(next);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) { alert(j?.error || `Gagal update (${res.status})`); return; }
      await load();
      alert(`✅ Order status diubah ke ${next}`);
    } finally {
      setUpdatingOrder(null);
    }
  }

  async function updateJokiStatus(next: string) {
    if (updatingJoki) return;
    if (!confirm(`Yakin ubah joki status menjadi ${next}?`)) return;
    setUpdatingJoki(next);
    try {
      const res = await fetch(`/api/admin/joki-orders/${id}/joki-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jokiStatus: next }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) { alert(j?.error || `Gagal update (${res.status})`); return; }
      await load();
      alert(`✅ Joki status diubah ke ${next}`);
    } finally {
      setUpdatingJoki(null);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const canUpdateOrder = data?.status === "PENDING_PAYMENT";

  return (
    <div className="contact-section">
      <div className="contact-card">
        <div className="contact-header">
          <div className="contact-step">J</div>
          <div className="contact-title-wrap">
            <h4 className="contact-title">Detail Joki Order</h4>
          </div>
        </div>
        <button onClick={() => r.back()} className="btn-ghost btn-sm">← Back</button>
      </div>

      <div className="admin-section-body">
        {loading ? (
          <div style={{ opacity: 0.75, fontWeight: 800 }}>Loading...</div>
        ) : !data ? (
          <div style={{ color: "salmon", fontWeight: 900 }}>Joki order tidak ditemukan.</div>
        ) : (
          <>
            {/* Summary */}
            <div className="order-summary">
              <div className="order-kv">
                <div className="order-k">Order No</div>
                <div className="order-v">{data.orderNo}</div>
              </div>
              <div className="order-kv">
                <div className="order-k">Order Status</div>
                <div className={`statusBadge ${(data.status || "").toLowerCase()}`}>{data.status}</div>
              </div>
              <div className="order-kv">
                <div className="order-k">Joki Status</div>
                <div className="order-v" style={{ fontWeight: 800 }}>
                  {JOKI_STATUS_LABELS[data.jokiDetail?.status || ""] || data.jokiDetail?.status || "-"}
                </div>
              </div>
              <div className="order-kv">
                <div className="order-k">Total</div>
                <div className="order-v">Rp {rupiah(data.total || 0)}</div>
              </div>
              <div className="order-kv">
                <div className="order-k">Created</div>
                <div className="order-v">{data.createdAt}</div>
              </div>
            </div>

            <div style={{ height: 14 }} />

            {/* Grid info */}
            <div className="order-grid">
              {/* Customer */}
              <div className="order-card">
                <div className="order-card-title">Customer</div>
                <div className="order-line">
                  <span className="order-label">Username</span>
                  <span className="order-value">{data.user?.username || "-"}</span>
                </div>
                <div className="order-line">
                  <span className="order-label">WhatsApp</span>
                  <span className="order-value">{data.contactWhatsapp}</span>
                </div>
                <div className="order-line">
                  <span className="order-label">Email</span>
                  <span className="order-value">{data.contactEmail || "-"}</span>
                </div>
              </div>

              {/* Payment */}
              <div className="order-card">
                <div className="order-card-title">Pembayaran</div>
                <div className="order-line">
                  <span className="order-label">Method</span>
                  <span className="order-value">{data.paymentMethod || "-"}</span>
                </div>
                <div className="order-line">
                  <span className="order-label">Gateway Key</span>
                  <span className="order-value">{data.gatewayMethodKey || "-"}</span>
                </div>
                <div className="order-line">
                  <span className="order-label">Paid At</span>
                  <span className="order-value">{data.paidAt || "-"}</span>
                </div>
              </div>

              {/* Game */}
              <div className="order-card">
                <div className="order-card-title">Game</div>
                <div className="order-line">
                  <span className="order-label">Game</span>
                  <span className="order-value">{data.game?.name || "-"}</span>
                </div>
              </div>
            </div>

            {/* Joki Detail */}
            {data.jokiDetail && (
              <>
                <div style={{ height: 18 }} />
                <div className="order-card" style={{ maxWidth: "100%" }}>
                  <div className="order-card-title">🔑 Data Akun Joki</div>

                  <div className="order-line">
                    <span className="order-label">Login Via</span>
                    <span className="order-value">{data.jokiDetail.loginVia}</span>
                  </div>
                  <div className="order-line">
                    <span className="order-label">User ID &amp; Nickname</span>
                    <span className="order-value">{data.jokiDetail.userIdNickname}</span>
                  </div>
                  <div className="order-line">
                    <span className="order-label">Login ID</span>
                    <span className="order-value">{data.jokiDetail.loginId}</span>
                  </div>
                  <div className="order-line">
                    <span className="order-label">Password</span>
                    <span className="order-value" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {showPassword ? data.jokiDetail.password : "••••••••"}
                      <button
                        type="button"
                        className="btn-ghost btn-xs"
                        onClick={() => setShowPassword((v) => !v)}
                      >
                        {showPassword ? "Sembunyikan" : "Tampilkan"}
                      </button>
                    </span>
                  </div>

                  {data.jokiDetail.heroes.length > 0 && (
                    <div className="order-line" style={{ alignItems: "flex-start" }}>
                      <span className="order-label">Request Hero</span>
                      <span className="order-value">
                        {data.jokiDetail.heroes.map((h, i) => (
                          <span
                            key={i}
                            style={{
                              display: "inline-block",
                              background: "rgba(59,130,246,.18)",
                              border: "1px solid rgba(59,130,246,.4)",
                              borderRadius: 8,
                              padding: "2px 10px",
                              marginRight: 6,
                              marginBottom: 4,
                              fontSize: 13,
                            }}
                          >
                            {h}
                          </span>
                        ))}
                      </span>
                    </div>
                  )}

                  {data.jokiDetail.noteForJoki && (
                    <div className="order-line" style={{ alignItems: "flex-start" }}>
                      <span className="order-label">Catatan</span>
                      <span className="order-value" style={{ fontStyle: "italic", opacity: 0.85 }}>
                        {data.jokiDetail.noteForJoki}
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}

            <div style={{ height: 18 }} />

            {/* Actions */}
            <div className="admin-actions">
              <button className="btn-ghost btn-sm" onClick={load}>Refresh</button>

              <div className="admin-actions-right" style={{ gap: 8, flexWrap: "wrap" }}>
                {/* Order status actions */}
                <button
                  className="btn-ghost btn-sm"
                  onClick={() => updateOrderStatus("FAILED")}
                  disabled={!canUpdateOrder || !!updatingOrder}
                >
                  {updatingOrder === "FAILED" ? "Updating..." : "Mark Order Failed"}
                </button>
                <button
                  className="btn-primary btn-sm"
                  onClick={() => updateOrderStatus("PAID")}
                  disabled={!canUpdateOrder || !!updatingOrder}
                >
                  {updatingOrder === "PAID" ? "Updating..." : "Mark Order Paid"}
                </button>

                {/* Joki status actions */}
                {data.jokiDetail && (
                  <>
                    <div style={{ width: 1, background: "rgba(255,255,255,.1)", margin: "0 4px" }} />
                    {["IN_PROGRESS", "COMPLETED", "CANCELLED"].map((s) => (
                      <button
                        key={s}
                        className={s === "COMPLETED" ? "btn-primary btn-sm" : "btn-ghost btn-sm"}
                        onClick={() => updateJokiStatus(s)}
                        disabled={!!updatingJoki || data.jokiDetail?.status === s}
                        title={`Set joki status ke ${s}`}
                      >
                        {updatingJoki === s ? "Updating..." : s === "IN_PROGRESS" ? "🎮 Mulai Kerjain" : s === "COMPLETED" ? "✅ Selesai" : "❌ Cancel Joki"}
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
