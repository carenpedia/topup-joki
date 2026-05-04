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
  const [feeFixed, setFeeFixed] = useState(0);
  const [feePercent, setFeePercent] = useState(0);
  const [minFee, setMinFee] = useState("");
  const [maxFee, setMaxFee] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "payment");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Upload gagal");

      setImage(j.url);
      alert("Gambar berhasil diupload!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  }

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
          feeFixed,
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

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                className="contact-input"
                placeholder="URL Logo atau upload file"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                style={{ flex: 1 }}
              />
              <label className="btn-ghost btn-sm" style={{ cursor: "pointer", display: "inline-block", whiteSpace: "nowrap" }}>
                {uploading ? "Uploading..." : "📁 Upload"}
                <input 
                  type="file" 
                  accept="image/*" 
                  style={{ display: "none" }} 
                  onChange={handleFileUpload} 
                  disabled={uploading}
                />
              </label>
            </div>
            {image && (
              <div style={{ marginTop: 8 }}>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Preview:</p>
                <img 
                  src={image} 
                  alt="Preview" 
                  style={{ height: 40, borderRadius: 4, background: "rgba(255,255,255,0.05)", padding: 4 }} 
                />
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input
                className="contact-input"
                type="number"
                placeholder="Fee Flat"
                value={feeFixed}
                onChange={(e) => setFeeFixed(Number(e.target.value))}
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