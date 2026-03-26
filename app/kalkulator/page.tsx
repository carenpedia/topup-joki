"use client";

import { useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Kalkulator() {
  const [match, setMatch] = useState("");
  const [wrNow, setWrNow] = useState("");
  const [wrTarget, setWrTarget] = useState("");

  const result = useMemo(() => {
    const m = Number(match);
    const a = Number(wrNow);
    const t = Number(wrTarget);

    if (!m || !a || !t) return null;
    if (m <= 0 || a <= 0 || t <= 0 || a > 100 || t > 100) return { err: "Input tidak valid." };

    const currentWins = Math.round((a / 100) * m);
    // cari x minimal win tambahan agar (wins+x)/(m+x) >= t/100
    let x = 0;
    while (((currentWins + x) / (m + x)) * 100 < t && x < 100000) x++;

    return {
      currentWins,
      needWins: x,
      nextWR: (((currentWins + x) / (m + x)) * 100).toFixed(2),
    };
  }, [match, wrNow, wrTarget]);

  return (
    <main className="page">
      <div className="bgGlow" aria-hidden="true" />
      <div className="gridFx" aria-hidden="true" />
      <Navbar />
      <div className="shell">

        <div className="section" style={{ maxWidth: 800, margin: "40px auto" }}>
          <div className="authCard" style={{ padding: "40px", position: "relative", overflow: "hidden" }}>
            
            {/* Dekorasi Glow Dalam Card */}
            <div style={{ position: "absolute", top: -100, right: -100, width: 300, height: 300, background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
            
            <div className="authHeader" style={{ marginBottom: 40 }}>
              <div className="authIconWrap" style={{ background: "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(109, 40, 217, 0.05))", borderColor: "rgba(139, 92, 246, 0.3)", color: "#a78bfa", boxShadow: "0 8px 24px rgba(139, 92, 246, 0.15)" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                  <polyline points="2 17 12 22 22 17"></polyline>
                  <polyline points="2 12 12 17 22 12"></polyline>
                </svg>
              </div>
              <div className="authTitle" style={{ fontSize: 32 }}>Kalkulator WR</div>
              <div className="authSub" style={{ fontSize: 16 }}>Hitung berapa win berturut-turut yang dibutuhkan untuk capai target WR-mu.</div>
            </div>

            <div className="row" style={{ gap: 24, marginBottom: 32 }}>
              <div style={{ flex: "1 1 200px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Total Match</div>
                <div className="authInputWrap" style={{ marginBottom: 0 }}>
                  <input className="input" value={match} onChange={(e) => setMatch(e.target.value)} placeholder="Contoh: 300" type="number" />
                  <svg className="authInputIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
              </div>

              <div style={{ flex: "1 1 200px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>WR Saat Ini (%)</div>
                <div className="authInputWrap" style={{ marginBottom: 0 }}>
                  <input className="input" value={wrNow} onChange={(e) => setWrNow(e.target.value)} placeholder="Contoh: 55" type="number" />
                  <svg className="authInputIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                </div>
              </div>

              <div style={{ flex: "1 1 200px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Target WR (%)</div>
                <div className="authInputWrap" style={{ marginBottom: 0 }}>
                  <input className="input" value={wrTarget} onChange={(e) => setWrTarget(e.target.value)} placeholder="Contoh: 60" type="number" />
                  <svg className="authInputIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                </div>
              </div>
            </div>

            <div style={{ borderTop: "1px dashed rgba(255,255,255,0.1)", paddingTop: 32 }}>
              {!result ? (
                <div style={{ textAlign: "center", padding: "20px", color: "rgba(255,255,255,0.3)", fontSize: 14, fontWeight: 500, background: "rgba(0,0,0,0.2)", borderRadius: 16 }}>
                  Isi semua form di atas untuk melihat estimasi jumlah kemenangan.
                </div>
              ) : "err" in result ? (
                <div style={{ textAlign: "center", padding: "20px", color: "#f87171", fontSize: 14, fontWeight: 600, background: "rgba(248, 113, 113, 0.1)", border: "1px solid rgba(248, 113, 113, 0.2)", borderRadius: 16 }}>
                  ⚠️ {result.err}
                </div>
              ) : (
                <div style={{
                    borderRadius: 20,
                    padding: 32,
                    background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))",
                    border: "1px solid rgba(139,92,246,0.3)",
                    boxShadow: "0 10px 30px rgba(139,92,246,0.15)",
                    textAlign: "center",
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  <div style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", fontWeight: 500, marginBottom: 8 }}>
                    Kamu butuh sekitar
                  </div>
                  <div style={{ fontSize: 48, fontWeight: 900, color: "#fff", lineHeight: 1, marginBottom: 8, textShadow: "0 4px 20px rgba(139,92,246,0.5)" }}>
                    {result.needWins} <span style={{ fontSize: 24, fontWeight: 700, color: "#a78bfa" }}>Win Tanpa Kalah</span>
                  </div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
                    Kemenangan saat ini: <b style={{ color: "#fff" }}>{result.currentWins}</b> &nbsp;•&nbsp; Prediksi akhir: <b style={{ color: "#10b981" }}>{result.nextWR}%</b>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
