"use client";

import { useState } from "react";

export default function UserDeposit() {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("otomatis"); // otomatis atau manual

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Isi Saldo</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>Pilih nominal dan sistem pembayaran untuk menambah Carencoin.</p>
      </div>

      <div style={{ 
        background: "rgba(255,255,255,0.02)", 
        border: "1px solid rgba(255,255,255,0.05)", 
        borderRadius: 24, padding: "32px 32px 40px" 
      }}>
        {/* Nominal Input */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.8)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>1. Masukkan Nominal (Rp)</div>
          <div className="authInputWrap" style={{ marginBottom: 0 }}>
            <input 
              className="input" 
              type="number" 
              placeholder="Contoh: 50000" 
              style={{ fontSize: 20, fontWeight: 800, padding: "20px 24px" }}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
             {["10000", "50000", "100000", "500000"].map((nominal) => (
                <button 
                  key={nominal}
                  onClick={() => setAmount(nominal)}
                  style={{ 
                    padding: "8px 16px", borderRadius: 100, 
                    border: amount === nominal ? "1px solid #3b82f6" : "1px solid rgba(255,255,255,0.1)", 
                    background: amount === nominal ? "rgba(59,130,246,0.1)" : "transparent",
                    color: amount === nominal ? "#60a5fa" : "rgba(255,255,255,0.5)",
                    fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s"
                  }}
                >
                  Rp {Number(nominal).toLocaleString("id-ID")}
                </button>
             ))}
          </div>
        </div>

        {/* Tipe Pembayaran */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.8)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>2. Tipe Pengisian</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Otomatis */}
            <div 
              onClick={() => setMethod("otomatis")}
              style={{
                padding: 20, borderRadius: 16, border: method === "otomatis" ? "2px solid #3b82f6" : "2px solid rgba(255,255,255,0.05)",
                background: method === "otomatis" ? "rgba(59,130,246,0.05)" : "transparent",
                cursor: "pointer", transition: "all 0.2s"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                 <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(59,130,246,0.15)", color: "#60a5fa", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                 </div>
                 <div style={{ fontSize: 16, fontWeight: 800, color: method === "otomatis" ? "#fff" : "rgba(255,255,255,0.7)" }}>Otomatis (Cepat)</div>
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, paddingLeft: 52 }}>Pilih metode pembayaran (QRIS, VA) dan saldo akan masuk seketika setelah dibayar.</p>
            </div>

            {/* Manual */}
            <div 
              onClick={() => setMethod("manual")}
              style={{
                padding: 20, borderRadius: 16, border: method === "manual" ? "2px solid #f59e0b" : "2px solid rgba(255,255,255,0.05)",
                background: method === "manual" ? "rgba(245,158,11,0.05)" : "transparent",
                cursor: "pointer", transition: "all 0.2s"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                 <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(245,158,11,0.15)", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                 </div>
                 <div style={{ fontSize: 16, fontWeight: 800, color: method === "manual" ? "#fff" : "rgba(255,255,255,0.7)" }}>Manual (Upload Bukti)</div>
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, paddingLeft: 52 }}>Transfer langsung ke reksadana kami dan upload bukti TF untuk dikonfirmasi Admin secara manual.</p>
            </div>
          </div>
        </div>

        {/* Dynamic Payment Gateways Area (Only if valid amount) */}
        {amount && Number(amount) >= 10000 ? (
           <div style={{ borderTop: "1px dashed rgba(255,255,255,0.1)", paddingTop: 32 }}>
             {method === "otomatis" ? (
               <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>Pilih Metode (Otomatis)</h3>
                  <div style={{ padding: 24, background: "rgba(0,0,0,0.2)", borderRadius: 16, textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
                     [List API Payment Gateway seperti QRIS, VA BCA, DANA akan dirender di sini]
                  </div>
               </div>
             ) : (
               <div style={{ background: "rgba(245,158,11,0.05)", border: "1px dashed rgba(245,158,11,0.2)", padding: 24, borderRadius: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "#f59e0b", marginBottom: 12 }}>Instruksi Transfer Manual</h3>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 16, lineHeight: 1.6 }}>Silakan transfer nominal pas <strong>Rp {Number(amount).toLocaleString("id-ID")}</strong> ke rekening berikut:</p>
                  
                  <div style={{ background: "rgba(0,0,0,0.3)", padding: 16, borderRadius: 12, marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Bank BCA a.n CarenPedia Official</div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", letterSpacing: 1 }}>876543210</div>
                    </div>
                    <button style={{ padding: "8px 16px", background: "rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12, fontWeight: 700, color: "#fff", border: "none" }}>Salin</button>
                  </div>

                  <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.8)", marginBottom: 12 }}>Upload Bukti Pembayaran</div>
                  <div style={{ border: "2px dashed rgba(255,255,255,0.2)", borderRadius: 12, padding: 32, textAlign: "center", cursor: "pointer", background: "rgba(0,0,0,0.1)" }}>
                     <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: 0 }}>Pilih File / Tarik gambar kesini (.JPG / .PNG)</p>
                  </div>
               </div>
             )}
             
             <button style={{ width: "100%", padding: 20, marginTop: 32, background: "#3b82f6", color: "#fff", fontWeight: 800, fontSize: 16, borderRadius: 16, border: "none", cursor: "pointer", boxShadow: "0 8px 24px rgba(59,130,246,0.3)" }}>
                Konfirmasi Deposit Rp {Number(amount).toLocaleString("id-ID")}
             </button>
           </div>
        ) : (
           <div style={{ textAlign: "center", padding: "24px", background: "rgba(0,0,0,0.2)", borderRadius: 16, color: "rgba(255,255,255,0.3)", fontSize: 14, fontWeight: 500 }}>
             Minimal isi saldo adalah Rp 10.000
           </div>
        )}
      </div>

    </div>
  );
}
