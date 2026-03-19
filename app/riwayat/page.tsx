"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";

type Row = {
  invoiceId: string;
  status: "PENDING" | "PAID" | "FAILED" | "EXPIRED";
  tanggal: string;
  nominal: string;
  total: string;
  gameSlug: string;
};

const demo: Row[] = [
  { invoiceId: "INV-001", status: "PAID", tanggal: "2026-02-07", nominal: "86 Diamonds", total: "Rp 20.000", gameSlug: "mobile-legends" },
  { invoiceId: "INV-002", status: "PENDING", tanggal: "2026-02-08", nominal: "172 Diamonds", total: "Rp 38.000", gameSlug: "free-fire" },
];

export default function Riwayat() {
  const [invoice, setInvoice] = useState("");

  return (
    <main className="page">
      <div className="bgGlow" aria-hidden="true" />
      <div className="gridFx" aria-hidden="true" />
      <div className="shell">
        <Navbar />

        <div className="section" style={{ maxWidth: 640, margin: "40px auto" }}>
          <div className="authCard" style={{ padding: "32px 40px" }}>
            <div className="title" style={{ textAlign: "center", fontSize: 28, marginBottom: 8 }}>Lacak Pesanan</div>
            <div className="subtitle" style={{ textAlign: "center", marginBottom: 32 }}>Masukkan No. Invoice untuk melacak status pesanan Anda.</div>

            <div className="row" style={{ flexWrap: "nowrap" }}>
              <div className="authInputWrap" style={{ flex: 1, marginBottom: 0 }}>
                <input 
                  className="input" 
                  value={invoice} 
                  onChange={(e) => setInvoice(e.target.value)} 
                  placeholder="Contoh: INV-001" 
                  style={{ padding: "16px 16px 16px 48px", fontSize: 16 }}
                />
                <svg className="authInputIcon" style={{ left: 18, width: 20, height: 20 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <Link 
                className="btn btnPrimary" 
                href={invoice ? `/invoice/${encodeURIComponent(invoice)}` : "#"} 
                style={{ 
                  opacity: invoice ? 1 : 0.5, 
                  pointerEvents: invoice ? "auto" : "none",
                  padding: "0 32px",
                  fontSize: 16
                }}
              >
                Cari
              </Link>
            </div>
          </div>
        </div>

        <div className="section" style={{ marginTop: 60 }}>
          <div className="title" style={{ marginBottom: 20, fontSize: 20 }}>Transaksi Terakhir <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 500, marginLeft: 12 }}>*Contoh Data</span></div>

          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>No. Invoice</th>
                  <th>Produk</th>
                  <th>Nominal</th>
                  <th>Total Harga</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {demo.map((r) => (
                  <tr key={r.invoiceId}>
                    <td style={{ fontWeight: 800, color: "#fff" }}>{r.invoiceId}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#60a5fa", fontWeight: 800, fontSize: 10 }}>
                          {r.gameSlug.substring(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 700 }}>{r.gameSlug.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase())}</span>
                      </div>
                    </td>
                    <td>{r.nominal}</td>
                    <td style={{ fontWeight: 800, color: "#60a5fa" }}>{r.total}</td>
                    <td style={{ color: "rgba(255,255,255,0.5)" }}>{r.tanggal}</td>
                    <td>
                      <span className={`badge ${r.status === "PAID" ? "success" : "warning"}`}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <Link className="btn btnGhost" href={`/invoice/${r.invoiceId}`} style={{ padding: "8px 14px", fontSize: 12 }}>
                          Detail
                        </Link>
                        <Link className="btn btnPrimary" href={`/topup/${r.gameSlug}`} style={{ padding: "8px 14px", fontSize: 12 }}>
                          Beli Lagi
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
