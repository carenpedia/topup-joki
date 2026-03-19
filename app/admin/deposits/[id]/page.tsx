"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type DepositDetail = {
  id: string;
  user: string;
  userId: string;
  userWhatsapp: string;
  amount: number;
  channel: string;
  gateway: string;
  gatewayRef: string;
  status: string;
  proofImageUrl: string | null;
  adminNote: string;
  createdAt: string | null;
  updatedAt: string | null;
};

function rupiah(n: number) {
  return new Intl.NumberFormat("id-ID").format(n);
}

export default function AdminDepositDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [data, setData] = useState<DepositDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adminNote, setAdminNote] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/deposits/${params.id}`, {
        cache: "no-store",
      });
      const j = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(j?.error || "Gagal load detail");
        return;
      }

      setData(j.row || null);
      setAdminNote(j.row?.adminNote || "");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function updateStatus(nextStatus: "APPROVED" | "REJECTED" | "CANCELLED") {
    if (
      !confirm(
        `Yakin ingin mengubah status deposit ini menjadi ${nextStatus}?`
      )
    )
      return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/deposits/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, adminNote }),
      });

      const j = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(j?.error || "Gagal update status");
        return;
      }

      alert(`Deposit berhasil di-${nextStatus.toLowerCase()}`);
      await load();
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="contact-section">Loading...</div>;
  }

  if (!data) {
    return <div className="contact-section">Data tidak ditemukan.</div>;
  }

  const canUpdate = data.status === "PENDING" || data.status === "PAID";

  return (
    <div className="contact-section">
      <div className="contact-card">
        <div className="contact-header">
          <div className="contact-step">D</div>
          <div className="contact-title-wrap">
            <h4 className="contact-title">Detail Deposit</h4>
          </div>
        </div>

        <div className="contact-body">
          {/* Info Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "160px 1fr",
              gap: "10px 16px",
              fontSize: 14,
              marginBottom: 20,
            }}
          >
            <span style={{ opacity: 0.7 }}>ID Deposit</span>
            <span>{data.id}</span>

            <span style={{ opacity: 0.7 }}>User</span>
            <span>{data.user}</span>

            <span style={{ opacity: 0.7 }}>WhatsApp</span>
            <span>{data.userWhatsapp}</span>

            <span style={{ opacity: 0.7 }}>Jumlah</span>
            <span style={{ fontWeight: 600 }}>Rp {rupiah(data.amount)}</span>

            <span style={{ opacity: 0.7 }}>Channel</span>
            <span>
              <span
                className={
                  data.channel === "MANUAL"
                    ? "pill pill--danger"
                    : "pill pill--muted"
                }
              >
                {data.channel}
              </span>
            </span>

            <span style={{ opacity: 0.7 }}>Gateway</span>
            <span>{data.gateway}</span>

            <span style={{ opacity: 0.7 }}>Gateway Ref</span>
            <span>{data.gatewayRef}</span>

            <span style={{ opacity: 0.7 }}>Status</span>
            <span>
              <span
                className={
                  data.status === "APPROVED" || data.status === "PAID"
                    ? "pill pill--active"
                    : data.status === "REJECTED" ||
                      data.status === "CANCELLED" ||
                      data.status === "EXPIRED"
                    ? "pill pill--danger"
                    : "pill pill--muted"
                }
              >
                {data.status}
              </span>
            </span>

            <span style={{ opacity: 0.7 }}>Tanggal Dibuat</span>
            <span>
              {data.createdAt
                ? new Date(data.createdAt).toLocaleString("id-ID")
                : "-"}
            </span>

            <span style={{ opacity: 0.7 }}>Terakhir Update</span>
            <span>
              {data.updatedAt
                ? new Date(data.updatedAt).toLocaleString("id-ID")
                : "-"}
            </span>
          </div>

          {/* Bukti Transfer (jika deposit manual) */}
          {data.proofImageUrl && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ opacity: 0.7, marginBottom: 8, fontSize: 14 }}>
                Bukti Transfer:
              </p>
              <a
                href={data.proofImageUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={data.proofImageUrl}
                  alt="Bukti transfer"
                  style={{
                    maxWidth: 400,
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,.1)",
                  }}
                />
              </a>
            </div>
          )}

          {/* Admin Note */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ opacity: 0.7, marginBottom: 8, fontSize: 14 }}>
              Catatan Admin:
            </p>
            <textarea
              className="contact-input"
              placeholder="Tulis catatan admin (opsional)..."
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={3}
              disabled={!canUpdate}
              style={{ width: "100%", resize: "vertical" }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              className="btn-ghost btn-xs"
              onClick={() => router.back()}
            >
              Kembali
            </button>

            {canUpdate && (
              <>
                <button
                  type="button"
                  className="btn-primary btn-xs"
                  disabled={saving}
                  onClick={() => updateStatus("APPROVED")}
                >
                  {saving ? "Processing..." : "✅ Approve"}
                </button>

                <button
                  type="button"
                  className="btn-ghost btn-xs"
                  disabled={saving}
                  onClick={() => updateStatus("REJECTED")}
                  style={{ color: "#ef4444" }}
                >
                  ❌ Reject
                </button>

                <button
                  type="button"
                  className="btn-ghost btn-xs"
                  disabled={saving}
                  onClick={() => updateStatus("CANCELLED")}
                  style={{ color: "#f59e0b" }}
                >
                  🚫 Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
