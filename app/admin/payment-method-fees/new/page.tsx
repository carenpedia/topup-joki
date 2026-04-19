"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewPaymentMethodFeePage() {
  const router = useRouter();

  const [gateway, setGateway] = useState("MIDTRANS");
  const [methodKey, setMethodKey] = useState("");
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState("E-Wallet");
  const [image, setImage] = useState("");
  const [feeFlat, setFeeFlat] = useState(0);
  const [feePercent, setFeePercent] = useState(0);
  const [minFee, setMinFee] = useState("");
  const [maxFee, setMaxFee] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/admin/payment-method-fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gateway,
          methodKey,
          label,
          category,
          image,
          feeFlat,
          feePercent,
          minFee,
          maxFee,
          sortOrder,
          isActive,
        }),
      });

      const j = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(j?.error || "Gagal membuat data");
        return;
      }

      router.push(`/admin/payment-method-fees`);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="contact-section">
      <div className="contact-card">
        <div className="contact-header">
          <div className="contact-step">F</div>
          <div className="contact-title-wrap">
            <h4 className="contact-title">Tambah Payment Method Fee</h4>
          </div>
        </div>

        <div className="contact-body">
          <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label className="contact-label">Gateway</label>
                <select 
                  className="contact-input"
                  value={gateway}
                  onChange={(e) => setGateway(e.target.value)}
                >
                  <option value="MIDTRANS">MIDTRANS</option>
                  <option value="DUITKU">DUITKU</option>
                  <option value="TRIPAY">TRIPAY</option>
                  <option value="XENDIT">XENDIT</option>
                </select>
              </div>
              <div>
                <label className="contact-label">Kategori (E-Wallet, VA, QRIS, dll)</label>
                <input
                  className="contact-input"
                  placeholder="Kategori"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
            </div>

            <input
              className="contact-input"
              placeholder="Method Key (contoh: QRIS, DANA, BCA_VA)"
              value={methodKey}
              onChange={(e) => setMethodKey(e.target.value)}
            />

            <input
              className="contact-input"
              placeholder="Label (Nama Tampilan)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />

            <input
              className="contact-input"
              placeholder="URL Logo (opsional)"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input
                className="contact-input"
                type="number"
                placeholder="Fee Flat"
                value={feeFlat}
                onChange={(e) => setFeeFlat(Number(e.target.value))}
              />
              <input
                className="contact-input"
                type="number"
                step="0.01"
                placeholder="Fee Percent"
                value={feePercent}
                onChange={(e) => setFeePercent(Number(e.target.value))}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input
                className="contact-input"
                type="number"
                placeholder="Min Fee (optional)"
                value={minFee}
                onChange={(e) => setMinFee(e.target.value)}
              />
              <input
                className="contact-input"
                type="number"
                placeholder="Max Fee (optional)"
                value={maxFee}
                onChange={(e) => setMaxFee(e.target.value)}
              />
            </div>

            <input
              className="contact-input"
              type="number"
              placeholder="Sort Order"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
            />

            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <span>Active</span>
            </label>

            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" className="btn-ghost btn-sm" onClick={() => router.back()}>
                Batal
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