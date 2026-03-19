"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function ResetPasswordPage() {
  const sp = useSearchParams();
  const r = useRouter();

  const uid = sp.get("uid") || "";
  const token = sp.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, token, newPassword }),
    });

    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(j?.error || "Gagal reset password");
      return;
    }

    setOk(true);
    setTimeout(() => r.push("/masuk"), 600);
  }

  return (
    <main className="page">
      <div className="bgGlow" aria-hidden="true" />
      <div className="gridFx" aria-hidden="true" />
      <div className="shell">
        <Navbar />
        <div className="section" style={{ maxWidth: 520, margin: "0 auto" }}>
          <div className="title">Reset Password</div>

          <div className="spacer" />

          {!uid || !token ? (
            <div className="kicker" style={{ color: "var(--bad)" }}>Link reset tidak valid.</div>
          ) : ok ? (
            <div className="kicker" style={{ color: "var(--ok)" }}>✅ Password berhasil diubah. Mengarah ke login...</div>
          ) : (
            <form onSubmit={submit}>
              <div className="kicker">Password Baru</div>
              <input
                className="input"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="minimal 6 karakter"
              />

              {err ? <div className="kicker" style={{ marginTop: 10, color: "var(--bad)" }}>{err}</div> : null}

              <div className="spacer" />
              <button className="btn btnPrimary" type="submit" style={{ width: "100%" }}>
                Simpan Password
              </button>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
