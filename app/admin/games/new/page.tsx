"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TARGET_TYPE_OPTIONS } from "@/lib/targetConfig";

export default function AdminGameNewPage() {
  const router = useRouter();

  const [key, setKey] = useState("");
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [hasJoki, setHasJoki] = useState(false);
  const [isPopuler, setIsPopuler] = useState(false);
  const [targetType, setTargetType] = useState("DEFAULT");

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "banner") {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(type);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", type === "logo" ? "games/logo" : "games/banner");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Upload gagal");

      if (type === "logo") setLogoUrl(j.url);
      else setBannerUrl(j.url);

      alert("Gambar berhasil diupload!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(null);
    }
  }

  async function onSubmit() {
    setErr(null);

    const k = key.trim();
    const n = name.trim();
    if (!k) return setErr("Key wajib diisi.");
    if (!/^[a-z0-9-]{3,}$/.test(k)) return setErr("Key harus slug (lowercase/angka/dash), min 3.");
    if (!n) return setErr("Nama game wajib diisi.");

    setSaving(true);
    try {
      const res = await fetch("/api/admin/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: k,
          name: n,
          logoUrl: logoUrl.trim() ? logoUrl.trim() : null,
          bannerUrl: bannerUrl.trim() ? bannerUrl.trim() : null,
          isActive,
          hasJoki,
          isPopuler,
          targetType,
        }),
      });

      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error ?? "Gagal membuat game");

      router.push("/admin/games");
      router.refresh();
    } catch (e: any) {
      setErr(e?.message ?? "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="contact-section">
      <div className="contact-card">
        <div className="contact-header">
          <div className="contact-step">+</div>
          <div className="contact-title-wrap">
            <h4 className="contact-title">Buat Game</h4>
          </div>
        </div>

        <div className="contact-body">
          <div className="row" style={{ justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <div className="cardMuted">Tambah game baru untuk catalog topup.</div>
            <Link href="/admin/games" className="voucherBtn" style={{ textDecoration: "none" }}>
              ← Kembali
            </Link>
          </div>

          <div className="spacer" />

          {err ? (
            <div
              style={{
                padding: 12,
                borderRadius: 12,
                border: "1px solid rgba(239,68,68,.25)",
                background: "rgba(239,68,68,.08)",
                color: "rgba(255,255,255,.92)",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {err}
            </div>
          ) : null}

          <div className="spacer" />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="contact-label">Key (slug)</label>
              <input
                className="contact-input"
                placeholder="mobile-legends"
                value={key}
                onChange={(e) => setKey(e.target.value.toLowerCase())}
              />
              <div className="contact-hint">Dipakai untuk URL & integrasi. Harus unik.</div>
            </div>

            <div>
              <label className="contact-label">Nama Game</label>
              <input className="contact-input" placeholder="Mobile Legends" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label className="contact-label">Logo Game (Upload atau URL)</label>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  className="contact-input"
                  placeholder="https://... atau upload file"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  style={{ flex: 1 }}
                />
                <label className="voucherBtn" style={{ cursor: "pointer", display: "inline-block", whiteSpace: "nowrap" }}>
                  {uploading === "logo" ? "..." : "📁 Upload"}
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleFileUpload(e, "logo")} disabled={!!uploading} />
                </label>
              </div>
              {logoUrl && (
                <div style={{ marginTop: 8 }}>
                  <img src={logoUrl} alt="Logo Preview" style={{ height: 60, borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)" }} />
                </div>
              )}
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label className="contact-label">Banner URL (Hero Topup - Upload atau URL)</label>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  className="contact-input"
                  placeholder="https://... atau upload file"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  style={{ flex: 1 }}
                />
                <label className="voucherBtn" style={{ cursor: "pointer", display: "inline-block", whiteSpace: "nowrap" }}>
                  {uploading === "banner" ? "..." : "📁 Upload"}
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleFileUpload(e, "banner")} disabled={!!uploading} />
                </label>
              </div>
              {bannerUrl && (
                <div style={{ marginTop: 8 }}>
                  <img src={bannerUrl} alt="Banner Preview" style={{ width: "100%", maxHeight: 120, objectFit: "cover", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)" }} />
                </div>
              )}
            </div>

            <div>
              <label className="contact-label">Status</label>
              <select className="contact-input" value={isActive ? "1" : "0"} onChange={(e) => setIsActive(e.target.value === "1")}>
                <option value="1">ACTIVE</option>
                <option value="0">OFF</option>
              </select>
            </div>

            <div>
              <label className="contact-label">Fitur Joki</label>
              <select className="contact-input" value={hasJoki ? "1" : "0"} onChange={(e) => setHasJoki(e.target.value === "1")}>
                <option value="0">❌ Tidak Support Joki</option>
                <option value="1">✅ Support Joki</option>
              </select>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label className="contact-label">Tampil di POPULER SEKARANG</label>
              <select className="contact-input" value={isPopuler ? "1" : "0"} onChange={(e) => setIsPopuler(e.target.value === "1")}>
                <option value="0">❌ Tidak tampil di Populer</option>
                <option value="1">🔥 Tampilkan di bagian Populer Sekarang</option>
              </select>
              <p className="contact-hint" style={{ marginTop: 4 }}>Game akan muncul di bagian atas homepage dengan card horizontal besar</p>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label className="contact-label">Tipe Input Target ID</label>
              <select className="contact-input" value={targetType} onChange={(e) => setTargetType(e.target.value)}>
                {TARGET_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <p className="contact-hint" style={{ marginTop: 4 }}>Menentukan form input yang tampil di halaman topup (User ID, Server, UID, dll)</p>
            </div>
          </div>

          <div className="spacer" />

          <div style={{
  display: "flex",
  justifyContent: "flex-end",
  gap: 12,
  marginTop: 10
}}>
  <Link
  href="/admin/games"
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
    onClick={onSubmit} disabled={saving}
    style={{
      padding: "9px 20px",
      borderRadius: 999,
      border: "none",
      fontSize: 13,
      fontWeight: 800,
      color: "#fff",
      cursor: "pointer",
      background: "linear-gradient(135deg, #3b82f6, #22d3ee)",
      boxShadow: "0 6px 16px rgba(59,130,246,.35)"
    }}
  >
    {saving ? "Menyimpan..." : "Simpan Game"}
  </button>
</div>

        </div>
      </div>
    </div>
  );
}
