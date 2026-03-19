"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Game = {
  id: string;
  key: string;
  name: string;
  logoUrl: string | null;
  isActive: boolean;
};

export default function AdminGameEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [g, setG] = useState<Game | null>(null);

  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  async function load() {
    setErr(null);
    setLoading(true);

    const res = await fetch(`/api/admin/games/${id}`);
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(j.error ?? "Gagal load game");
      setLoading(false);
      return;
    }

    const item: Game = j.item;
    setG(item);

    setName(item.name);
    setLogoUrl(item.logoUrl ?? "");
    setIsActive(item.isActive);

    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function onSave() {
    if (!g) return;
    setErr(null);

    const n = name.trim();
    if (!n) return setErr("Nama game wajib diisi.");

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/games/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: n,
          logoUrl: logoUrl.trim() ? logoUrl.trim() : null,
          isActive,
        }),
      });

      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error ?? "Gagal update game");

      await load();
      router.refresh();
    } catch (e: any) {
      setErr(e?.message ?? "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!g) return;
    const ok = confirm(`Hapus game "${g.name}"? Kalau masih terpakai produk/order bisa gagal. (Rekomendasi: OFF saja)`);
    if (!ok) return;

    setDeleting(true);
    setErr(null);

    try {
      const res = await fetch(`/api/admin/games/${id}`, { method: "DELETE" });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error ?? "Gagal hapus game");

      router.push("/admin/games");
      router.refresh();
    } catch (e: any) {
      setErr(e?.message ?? "Gagal hapus");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="contact-section">
      <div className="contact-card">
        <div className="contact-header">
          <div className="contact-step">E</div>
          <div className="contact-title-wrap">
            <h4 className="contact-title">Edit Game</h4>
          </div>
        </div>

        <div className="contact-body">
          <div className="row" style={{ justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <Link href="/admin/games" className="voucherBtn" style={{ textDecoration: "none" }}>
              ← Kembali
            </Link>

            {g ? (
              <div className="cardMuted" style={{ fontWeight: 900 }}>
                key: <span style={{ color: "rgba(255,255,255,.92)" }}>{g.key}</span>
              </div>
            ) : null}
          </div>

          <div className="spacer" />

          {loading ? (
            <div className="cardMuted">Loading…</div>
          ) : err ? (
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

          {!loading && g ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="contact-label">Nama Game</label>
                  <input className="contact-input" value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="contact-label">Logo URL (opsional)</label>
                  <input className="contact-input" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." />
                </div>

                <div>
                  <label className="contact-label">Status</label>
                  <select className="contact-input" value={isActive ? "1" : "0"} onChange={(e) => setIsActive(e.target.value === "1")}>
                    <option value="1">ACTIVE</option>
                    <option value="0">OFF</option>
                  </select>
                </div>
              </div>

              <div className="spacer" />

              <div className="row" style={{ justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="voucherBtn"
                  onClick={onDelete}
                  disabled={deleting}
                  style={{
                    background: "rgba(239,68,68,.10)",
                    borderColor: "rgba(239,68,68,.25)",
                  }}
                >
                  {deleting ? "Menghapus..." : "Hapus Game"}
                </button>

                <div className="row" style={{ gap: 10 }}>
                  <Link href="/admin/games" className="voucherBtn" style={{ textDecoration: "none" }}>
                    Batal
                  </Link>
                  <button type="button" className="voucherBtn" onClick={onSave} disabled={saving}>
                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
