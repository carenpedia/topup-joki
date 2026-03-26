"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

type Status = "PENDING" | "PAID" | "EXPIRED" | "FAILED";

export default function Invoice({ params }: { params: { id: string } }) {
  const [status, setStatus] = useState<Status>("PENDING");
  const [secondsLeft, setSecondsLeft] = useState(15 * 60); // 15 menit demo

  // countdown timer
  useEffect(() => {
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) return 0;
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // simulate websocket updates (placeholder)
  useEffect(() => {
    // TODO: connect WebSocket dan update status dari server
    // contoh: ws.onmessage -> setStatus(...)
  }, []);

  useEffect(() => {
    if (secondsLeft === 0 && status === "PENDING") setStatus("EXPIRED");
  }, [secondsLeft, status]);

  const timerText = useMemo(() => {
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, [secondsLeft]);

  return (
    <main className="page">
      <div className="bgGlow" aria-hidden="true" />
      <div className="gridFx" aria-hidden="true" />
      <Navbar />
      <div className="shell">

        <div className="section">
          <div className="title">Invoice</div>
          <div className="subtitle">ID: {params.id}</div>
        </div>

        <div className="section">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div>
              <div className="kicker">Status</div>
              <div style={{ fontWeight: 980, fontSize: 18 }}>
                <span style={{ color: statusColor(status) }}>{status}</span>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div className="kicker">Expired Timer</div>
              <div style={{ fontWeight: 980, fontSize: 18 }}>{timerText}</div>
            </div>
          </div>

          <div className="spacer" />

          <div className="kicker">
            Pembayaran: Xendit / Tripay / QRIS (nanti diisi detail channel + QR/VA).
          </div>

          <div className="spacer" />

          <div className="row">
            <button className="btn btnPrimary" type="button" onClick={() => setStatus("PAID")}>
              Simulasi: Set PAID
            </button>
            <button className="btn btnGhost" type="button" onClick={() => setStatus("FAILED")}>
              Simulasi: Set FAILED
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

function statusColor(s: string) {
  if (s === "PAID") return "var(--ok)";
  if (s === "PENDING") return "var(--warn)";
  if (s === "EXPIRED") return "rgba(229,231,235,.55)";
  return "var(--bad)";
}
