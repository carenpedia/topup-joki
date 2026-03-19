"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewUserPage() {
  const r = useRouter();

  const [username, setUsername] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"MEMBER" | "RESELLER">("MEMBER");

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, whatsapp, password, role }),
      });

      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(j?.error || "Gagal membuat user");
        return;
      }

      r.push("/admin/users");
      r.refresh();
    } catch (e: any) {
      setErr(e?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="contact-section">
      <div className="contact-card">
        {/* Header */}
        <div className="contact-header">
          <div className="contact-step">U</div>
          <div className="contact-title-wrap">
            <h4 className="contact-title">New User</h4>
          </div>
        </div>

        {/* Body */}
        <div className="contact-body">
          <div className="admin-actions" style={{ marginBottom: 12 }}>
            <button className="btn-ghost btn-sm" onClick={() => r.back()}>
              ← Back
            </button>
          </div>

          <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
            {err ? <div style={{ color: "salmon", fontWeight: 900 }}>{err}</div> : null}

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ color: "rgba(255,255,255,.92)", fontSize: 13, fontWeight: 900 }}>Username</span>
              <input
                className="contact-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="arya123"
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ color: "rgba(255,255,255,.92)", fontSize: 13, fontWeight: 900 }}>No. WhatsApp</span>
              <input
                className="contact-input"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+62 8xxx xxxx xxxx"
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ color: "rgba(255,255,255,.92)", fontSize: 13, fontWeight: 900 }}>Password</span>
              <input
                className="contact-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="min 6 karakter"
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ color: "rgba(255,255,255,.92)", fontSize: 13, fontWeight: 900 }}>Role</span>
              <select className="contact-input" value={role} onChange={(e) => setRole(e.target.value as any)}>
                <option value="MEMBER">MEMBER</option>
                <option value="RESELLER">RESELLER</option>
              </select>
            </label>

            <div className="admin-actions" style={{ marginTop: 6 }}>
              <button
                type="button"
                className="btn-ghost btn-sm"
                onClick={() => r.push("/admin/users")}
                disabled={loading}
              >
                Batal
              </button>

              <div className="admin-actions-right">
                <button type="submit" className="btn-primary btn-sm" disabled={loading}>
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
