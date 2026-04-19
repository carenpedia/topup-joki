"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Detail = {
  id: string;
  gateway: string;
  methodKey: string;
  label: string;
  category: string;
  image: string | null;
  feeFlat: number;
  feePercent: number;
  minFee: number | null;
  maxFee: number | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export default function PaymentMethodFeeDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [data, setData] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/payment-method-fees/${params.id}`, {
        cache: "no-store",
      });
      const j = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(j?.error || "Gagal load detail");
        return;
      }

      setData(j.row || null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!data) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/payment-method-fees/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const j = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(j?.error || "Gagal update");
        return;
      }

      alert("Berhasil diupdate");
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm("Yakin hapus data ini?")) return;

    const res = await fetch(`/api/admin/payment-method-fees/${params.id}`, {
      method: "DELETE",
    });

    const j = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert(j?.error || "Gagal hapus");
      return;
    }

    router.push("/admin/payment-method-fees");
    router.refresh();
  }

  if (loading) {
    return <div className="contact-section">Loading...</div>;
  }

  if (!data) {
    return <div className="contact-section">Data tidak ditemukan.</div>;
  }

  return (
    <div className="contact-section">
      <div className="contact-card">
        <div className="contact-header">
          <div className="contact-step">F</div>
          <div className="contact-title-wrap">
            <h4 className="contact-title">Detail Payment Method Fee</h4>
          </div>
        </div>

        <div className="contact-body">
          <form onSubmit={save} style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label className="contact-label">Gateway</label>
                <select 
                  className="contact-input"
                  value={data.gateway}
                  onChange={(e) => setData({ ...data, gateway: e.target.value })}
                >
                  <option value="MIDTRANS">MIDTRANS</option>
                  <option value="DUITKU">DUITKU</option>
                  <option value="TRIPAY">TRIPAY</option>
                  <option value="XENDIT">XENDIT</option>
                </select>
              </div>
              <div>
                <label className="contact-label">Kategori</label>
                <input
                  className="contact-input"
                  value={data.category}
                  onChange={(e) => setData({ ...data, category: e.target.value })}
                />
              </div>
            </div>

            <label className="contact-label">Method Key (ID System)</label>
            <input
              className="contact-input"
              value={data.methodKey}
              onChange={(e) => setData({ ...data, methodKey: e.target.value })}
            />

            <label className="contact-label">Label (Nama Publik)</label>
            <input
              className="contact-input"
              value={data.label}
              onChange={(e) => setData({ ...data, label: e.target.value })}
            />

            <label className="contact-label">Image/Logo URL</label>
            <input
              className="contact-input"
              value={data.image || ""}
              onChange={(e) => setData({ ...data, image: e.target.value })}
              placeholder="https://..."
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label className="contact-label">Fee Flat (Rp)</label>
                <input
                  className="contact-input"
                  type="number"
                  value={data.feeFlat}
                  onChange={(e) => setData({ ...data, feeFlat: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="contact-label">Fee Percent (%)</label>
                <input
                  className="contact-input"
                  type="number"
                  step="0.01"
                  value={data.feePercent}
                  onChange={(e) => setData({ ...data, feePercent: Number(e.target.value) })}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input
                className="contact-input"
                type="number"
                placeholder="Min Fee"
                value={data.minFee ?? ""}
                onChange={(e) =>
                  setData({
                    ...data,
                    minFee: e.target.value === "" ? null : Number(e.target.value),
                  })
                }
              />
              <input
                className="contact-input"
                type="number"
                placeholder="Max Fee"
                value={data.maxFee ?? ""}
                onChange={(e) =>
                  setData({
                    ...data,
                    maxFee: e.target.value === "" ? null : Number(e.target.value),
                  })
                }
              />
            </div>

            <input
              className="contact-input"
              type="number"
              placeholder="Sort Order"
              value={data.sortOrder}
              onChange={(e) => setData({ ...data, sortOrder: Number(e.target.value) })}
            />

            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={data.isActive}
                onChange={(e) => setData({ ...data, isActive: e.target.checked })}
              />
              <span>Active</span>
            </label>

            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" className="btn-ghost btn-sm" onClick={() => router.back()}>
                Kembali
              </button>
              <button type="button" className="btn-ghost btn-sm" onClick={remove}>
                Hapus
              </button>
              <button type="submit" className="btn-primary btn-sm" disabled={saving}>
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}