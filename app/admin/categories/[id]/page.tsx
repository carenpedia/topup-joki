"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Detail = {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  gameCount: number;
  createdAt: string;
  updatedAt: string;
};

export default function CategoryDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [data, setData] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/categories/${params.id}`, {
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
      const res = await fetch(`/api/admin/categories/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          sortOrder: data.sortOrder,
          isActive: data.isActive,
        }),
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
    if (!confirm("Yakin hapus kategori ini?")) return;

    const res = await fetch(`/api/admin/categories/${params.id}`, {
      method: "DELETE",
    });

    const j = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert(j?.error || "Gagal hapus");
      return;
    }

    router.push("/admin/categories");
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
          <div className="contact-step">C</div>
          <div className="contact-title-wrap">
            <h4 className="contact-title">Detail Kategori</h4>
          </div>
        </div>

        <div className="contact-body">
          {/* Info readonly */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "140px 1fr",
              gap: "8px 16px",
              fontSize: 14,
              marginBottom: 20,
            }}
          >
            <span style={{ opacity: 0.7 }}>ID</span>
            <span>{data.id}</span>

            <span style={{ opacity: 0.7 }}>Jumlah Game</span>
            <span>{data.gameCount} game terhubung</span>
          </div>

          <form onSubmit={save} style={{ display: "grid", gap: 12 }}>
            <input
              className="contact-input"
              placeholder="Nama Kategori"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
            />

            <input
              className="contact-input"
              type="number"
              placeholder="Sort Order"
              value={data.sortOrder}
              onChange={(e) =>
                setData({ ...data, sortOrder: Number(e.target.value) })
              }
            />

            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={data.isActive}
                onChange={(e) =>
                  setData({ ...data, isActive: e.target.checked })
                }
              />
              <span>Active</span>
            </label>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                className="btn-ghost btn-xs"
                onClick={() => router.back()}
              >
                Kembali
              </button>
              <button
                type="button"
                className="btn-ghost btn-xs"
                onClick={remove}
                style={{ color: "#ef4444" }}
              >
                Hapus
              </button>
              <button
                type="submit"
                className="btn-primary btn-xs"
                disabled={saving}
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
