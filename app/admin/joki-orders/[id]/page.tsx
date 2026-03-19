"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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

  user: null | {
    id: string;
    username: string;
    role: string;
    status: string;
    whatsapp: string;
  };

  game: null | { key: string; name: string };
  productId: string | null;

  target: string;
  hasJokiDetail: boolean;
};

function rupiah(n: number) {
  return new Intl.NumberFormat("id-ID").format(n);
}

export default function AdminJokiOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const r = useRouter();

  const [data, setData] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<null | "PAID" | "FAILED">(null);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/admin/joki-orders/${id}`, { cache: "no-store" });
    const j = await res.json();
    setData(j.row || null);
    setLoading(false);
  }

  async function updateStatus(next: "PAID" | "FAILED") {
    if (updating) return;

    const ok = confirm(`Yakin ubah status menjadi ${next}?`);
    if (!ok) return;

    try {
      setUpdating(next);

      // pakai endpoint orders yang sudah kamu punya (anti-dobel rule)
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });

      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(j?.error || `Gagal update status (${res.status})`);
        return;
      }

      await load();
      alert(`✅ Status berhasil diubah ke ${next}`);
    } finally {
      setUpdating(null);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const canUpdate = data?.status === "PENDING_PAYMENT";

  return (
    <div className="contact-section">
      <div className="contact-card">
        <div className="contact-header">
          <div className="contact-step">J</div>
          <div className="contact-title-wrap">
            <h4 className="contact-title">Detail Joki Order</h4>
          </div>
        </div>

        <button onClick={() => r.back()} className="btn-ghost btn-sm">
          ← Back
        </button>
      </div>

      <div className="admin-section-body">
        {loading ? (
          <div style={{ opacity: 0.75, fontWeight: 800 }}>Loading...</div>
        ) : !data ? (
          <div style={{ color: "salmon", fontWeight: 900 }}>Joki order tidak ditemukan.</div>
        ) : (
          <>
            <div className="order-summary">
              <div className="order-kv">
                <div className="order-k">Order No</div>
                <div className="order-v">{data.orderNo}</div>
              </div>

              <div className="order-kv">
                <div className="order-k">Status</div>
                <div className={`statusBadge ${(data.status || "").toLowerCase()}`}>{data.status}</div>
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

            <div className="order-grid">
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
                  <span className="order-value">{data.contactEmail}</span>
                </div>
              </div>

              <div className="order-card">
                <div className="order-card-title">Order</div>

                <div className="order-line">
                  <span className="order-label">Game</span>
                  <span className="order-value">{data.game?.name || "-"}</span>
                </div>

                <div className="order-line">
                  <span className="order-label">Target</span>
                  <span className="order-value">{data.target}</span>
                </div>

                <div className="order-line">
                  <span className="order-label">Joki Detail</span>
                  <span className="order-value">{data.hasJokiDetail ? "Ada" : "Belum"}</span>
                </div>
              </div>

              <div className="order-card">
                <div className="order-card-title">Payment</div>

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
            </div>

            <div style={{ height: 18 }} />

            <div className="admin-actions">
              <button className="btn-ghost btn-sm" onClick={load}>
                Refresh
              </button>

              <div className="admin-actions-right">
                <button
                  className="btn-ghost btn-sm"
                  onClick={() => updateStatus("FAILED")}
                  disabled={!canUpdate || !!updating}
                  title={!canUpdate ? `Tidak bisa update. Status sekarang: ${data.status}` : ""}
                >
                  {updating === "FAILED" ? "Updating..." : "Mark Failed"}
                </button>

                <button
                  className="btn-primary btn-sm"
                  onClick={() => updateStatus("PAID")}
                  disabled={!canUpdate || !!updating}
                  title={!canUpdate ? `Tidak bisa update. Status sekarang: ${data.status}` : ""}
                >
                  {updating === "PAID" ? "Updating..." : "Mark Paid"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
