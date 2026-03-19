"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewCategoryPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, sortOrder, isActive }),
      });

      const j = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(j?.error || "Gagal membuat kategori");
        return;
      }

      router.push(`/admin/categories/${j.id}`);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="contact-section">
      <div className="contact-card">
        <div className="contact-header">
          <div className="contact-step">C</div>
          <div className="contact-title-wrap">
            <h4 className="contact-title">Tambah Kategori</h4>
          </div>
        </div>

        <div className="contact-body">
          <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
            <input
              className="contact-input"
              placeholder="Nama Kategori"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

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
              <button
                type="button"
                className="btn-ghost btn-xs"
                onClick={() => router.back()}
              >
                Batal
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
