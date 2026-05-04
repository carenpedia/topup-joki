"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Banner = {
  id: string;
  title: string | null;
  imageUrl: string;
  linkType: string;
  linkValue: string;
  sortOrder: number;
  isActive: boolean;
};

export default function EditBannerPage({ params }: { params: { id: string } }) {
  const r = useRouter();
  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState<Banner | null>(null);

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
      alert("Gambar berhasil diupload!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/admin/banners/${params.id}`);
      const j = await res.json();
      if (!res.ok) {
        setErr(j.error || "Gagal load banner");
        setLoading(false);
        return;
      }
      const b: Banner = j.row;
      setRow(b);
      setTitle(b.title || "");
      setImageUrl(b.imageUrl);
      setLinkType(b.linkType);
      setLinkValue(b.linkValue);
      setSortOrder(b.sortOrder);
      setIsActive(b.isActive);
      setLoading(false);
    })();
  }, [params.id]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setErr("");

    const res = await fetch(`/api/admin/banners/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, imageUrl, linkType, linkValue, sortOrder, isActive }),
    });
    const j = await res.json();
    if (!res.ok) {
      setErr(j.error || "Gagal update banner");
      return;
    }

    r.push("/admin/banners");
    r.refresh();
  }

  async function onDelete() {
    if (!confirm("Hapus banner ini?")) return;
    const res = await fetch(`/api/admin/banners/${params.id}`, { method: "DELETE" });
    const j = await res.json();
    if (!res.ok) {
      alert(j.error || "Gagal hapus");
      return;
    }
    r.push("/admin/banners");
    r.refresh();
  }

  if (loading) {
    return <main style={{ padding: 18, opacity: 0.75 }}>Loading...</main>;
  }

  if (!row) {
    return <main style={{ padding: 18, color: "salmon", fontWeight: 900 }}>{err || "Not found"}</main>;
  }

  return (
    <main style={{ padding: 18 }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 950 }}>Edit Banner</h1>
          <button onClick={onDelete} style={btnDanger}>Hapus</button>
        </div>

        <div style={{ height: 14 }} />

        <form onSubmit={onSave} style={{ display: "grid", gap: 12 }}>
          {err ? <div style={{ color: "salmon", fontWeight: 800 }}>{err}</div> : null}

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ opacity: 0.8, fontSize: 13 }}>Title (opsional)</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} style={inp} />
          </label>

          <div style={{ display: "grid", gap: 6 }}>
            <span style={{ opacity: 0.8, fontSize: 13 }}>Image (Upload atau URL)</span>
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
              style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 14, border: "1px solid rgba(255,255,255,.10)" }}
            />
          ) : null}

          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ opacity: 0.8, fontSize: 13 }}>Link Type</span>
              <select value={linkType} onChange={(e) => setLinkType(e.target.value)} style={inp as any}>
                <option value="GAME">GAME</option>
                <option value="URL">URL</option>
                <option value="PROMO">PROMO</option>
              </select>
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ opacity: 0.8, fontSize: 13 }}>Sort Order</span>
              <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} style={inp} />
            </label>
          </div>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ opacity: 0.8, fontSize: 13 }}>Link Value</span>
            <input value={linkValue} onChange={(e) => setLinkValue(e.target.value)} style={inp} />
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            <span style={{ fontWeight: 800 }}>Active</span>
          </label>

          <button type="submit" style={btnPrimary}>Simpan Perubahan</button>
        </form>
      </div>
    </main>
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

const btnDanger: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,.12)",
  background: "rgba(239,68,68,.18)",
  color: "rgba(255,255,255,.92)",
  fontWeight: 950,
  cursor: "pointer",
};
