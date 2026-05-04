"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/app/components/ToastProvider";

export default function NewBannerPage() {
  const r = useRouter();
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkType, setLinkType] = useState("GAME");
  const [linkValue, setLinkValue] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "banners");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Upload gagal");

      setImageUrl(j.url);
      toast.success("Gambar berhasil diupload!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");

    const res = await fetch("/api/admin/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, imageUrl, linkType, linkValue, sortOrder, isActive }),
    });

    const j = await res.json();
    if (!res.ok) {
      setErr(j.error || "Gagal membuat banner");
      return;
    }

    toast.success("Banner berhasil dibuat!");
    r.push("/admin/banners");
    r.refresh();
  }

  return (
    <div className="contact-section">
      <div className="contact-card">
        {/* ===== HEADER (NYATU DENGAN BODY) ===== */}
        <div className="contact-header">
          <div className="contact-step">B</div>

          <div className="contact-title-wrap">
            <div className="contact-title">Promo Banner</div>
            <div className="contact-subtitle">
              Tambahkan banner promo untuk homepage / halaman game.
            </div>
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            <Link href="/admin/banners" className="contact-btn contact-btn-ghost">
              ← Back
            </Link>
          </div>
        </div>

        {/* ===== BODY (MASIH CARD YANG SAMA) ===== */}
        <div className="contact-body">
          <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
            {err ? <div style={{ color: "salmon", fontWeight: 800 }}>{err}</div> : null}

            <label style={{ display: "grid", gap: 6 }}>
              <span
  style={{
    fontSize: 13,
    fontWeight: 600,
    color: "#ffffff",
    letterSpacing: 0.2,
  }}
>
  Title (opsional)
</span>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={inp}
                placeholder="Promo Biru Week"
              />
            </label>

            <div style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#ffffff", letterSpacing: 0.2 }}>Image (Upload atau URL)</span>
              <div style={{ display: "flex", gap: 10 }}>
                <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} style={{ ...inp, flex: 1 }} placeholder="https://... atau upload file" />
                <label style={{ ...btnPrimary, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.12)", cursor: "pointer", whiteSpace: "nowrap" }}>
                  {uploading ? "..." : "📁 Upload"}
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileUpload} disabled={uploading} />
                </label>
              </div>
            </div>

            {imageUrl ? (
              <img
                src={imageUrl}
                alt="preview"
                style={{
                  width: "100%",
                  maxHeight: 220,
                  objectFit: "cover",
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,.10)",
                }}
              />
            ) : null}

            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span
  style={{
    fontSize: 13,
    fontWeight: 600,
    color: "#ffffff",
    letterSpacing: 0.2,
  }}
>
  Link Type
</span>

                <select
                  value={linkType}
                  onChange={(e) => setLinkType(e.target.value)}
                  style={inp as any}
                >
                  <option value="GAME">GAME</option>
                  <option value="URL">URL</option>
                  <option value="PROMO">PROMO</option>
                </select>
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span
  style={{
    fontSize: 13,
    fontWeight: 600,
    color: "#ffffff",
    letterSpacing: 0.2,
  }}
>
  Sort Order
</span>

                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  style={inp}
                />
              </label>
            </div>

            <label style={{ display: "grid", gap: 6 }}>
              <span
  style={{
    fontSize: 13,
    fontWeight: 600,
    color: "#ffffff",
    letterSpacing: 0.2,
  }}
>
  Link Value
</span>

              <input
                value={linkValue}
                onChange={(e) => setLinkValue(e.target.value)}
                style={inp}
                placeholder="mobile-legends / https://... / promo-slug"
              />
            </label>

            <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <span
  style={{
    fontSize: 13,
    fontWeight: 600,
    color: "#ffffff",
    letterSpacing: 0.2,
  }}
>
  ACTIVE
</span>

            </label>

            <div
  style={{
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 10,
  }}
>
  <Link
  href="/admin/banners"
  style={{
    padding: "9px 18px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,.15)",
    background: "transparent",
    color: "rgba(255,255,255,.75)",
    fontWeight: 700,
    fontSize: 13,
    textDecoration: "none",
    backdropFilter: "blur(6px)",
    transition: "all 160ms ease",
  }}
  onMouseEnter={(e) => {
    const el = e.currentTarget;
    el.style.borderColor = "rgba(59,130,246,.55)";
    el.style.background = "rgba(59,130,246,.08)";
    el.style.color = "#fff";
    el.style.boxShadow =
      "0 0 0 1px rgba(59,130,246,.35), 0 8px 22px rgba(59,130,246,.25)";
    el.style.transform = "translateY(-1px)";
  }}
  onMouseLeave={(e) => {
    const el = e.currentTarget;
    el.style.borderColor = "rgba(255,255,255,.15)";
    el.style.background = "transparent";
    el.style.color = "rgba(255,255,255,.75)";
    el.style.boxShadow = "none";
    el.style.transform = "translateY(0)";
  }}
  onMouseDown={(e) => {
    const el = e.currentTarget;
    el.style.transform = "translateY(0.5px) scale(0.98)";
    el.style.boxShadow =
      "0 0 0 1px rgba(59,130,246,.45), 0 6px 16px rgba(59,130,246,.35)";
  }}
  onMouseUp={(e) => {
    const el = e.currentTarget;
    el.style.transform = "translateY(-1px)";
    el.style.boxShadow =
      "0 0 0 1px rgba(59,130,246,.35), 0 8px 22px rgba(59,130,246,.25)";
  }}
>
  Batal
</Link>


  <button
    type="submit"
    style={{
      padding: "9px 20px",
      borderRadius: 999,
      border: "none",
      fontSize: 13,
      fontWeight: 800,
      color: "#fff",
      cursor: "pointer",
      background: "linear-gradient(135deg, #3b82f6, #22d3ee)",
      boxShadow: "0 6px 16px rgba(59,130,246,.35)",
      transition: "all 160ms ease",
    }}
    onMouseEnter={(e) => {
      const el = e.currentTarget;
      el.style.boxShadow =
        "0 10px 26px rgba(59,130,246,.45), 0 0 0 1px rgba(255,255,255,.12) inset";
      el.style.transform = "translateY(-1px)";
      el.style.filter = "saturate(1.08)";
    }}
    onMouseLeave={(e) => {
      const el = e.currentTarget;
      el.style.boxShadow = "0 6px 16px rgba(59,130,246,.35)";
      el.style.transform = "translateY(0)";
      el.style.filter = "none";
    }}
    onMouseDown={(e) => {
      const el = e.currentTarget;
      el.style.transform = "translateY(0.5px) scale(0.98)";
      el.style.boxShadow = "0 6px 14px rgba(59,130,246,.30)";
    }}
    onMouseUp={(e) => {
      const el = e.currentTarget;
      el.style.transform = "translateY(-1px)";
      el.style.boxShadow =
        "0 10px 26px rgba(59,130,246,.45), 0 0 0 1px rgba(255,255,255,.12) inset";
    }}
  >
    Simpan
  </button>
</div>

          </form>
        </div>
      </div>
    </div>
  );
}

const inp: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,.12)",
  background: "rgba(0,0,0,.20)",
  color: "rgba(255,255,255,.92)",
};

const btnPrimary: React.CSSProperties = {
  padding: "11px 12px",
  borderRadius: 12,
  border: "none",
  background: "rgba(59,130,246,.95)",
  color: "#fff",
  fontWeight: 950,
  cursor: "pointer",
};
