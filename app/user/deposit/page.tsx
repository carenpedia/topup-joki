"use client";

import { useEffect, useState, useMemo } from "react";
import { useConfig } from "@/app/components/ConfigProvider";
import { useToast } from "@/app/components/ToastProvider";

type Method = {
  id: string;
  label: string;
  image: string | null;
  feeFixed: number;
  feePercent: number;
  category: string;
};

export default function UserDeposit() {
  const config = useConfig();
  const toast = useToast();
  
  const [amount, setAmount] = useState("");
  const [methodType, setMethodType] = useState<"otomatis" | "manual">("otomatis");
  
  const [autoMethods, setAutoMethods] = useState<Method[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [loadingMethods, setLoadingMethods] = useState(false);

  // Fetch automatic payment methods
  useEffect(() => {
    async function load() {
      setLoadingMethods(true);
      try {
        const res = await fetch("/api/user/balance/payment-methods");
        const j = await res.json();
        if (j.methods) setAutoMethods(j.methods);
      } catch (err) {
        console.error("Load Methods Error:", err);
      } finally {
        setLoadingMethods(false);
      }
    }
    load();
  }, []);

  const groupedMethods = useMemo(() => {
    const map = new Map<string, Method[]>();
    for (const m of autoMethods) {
      if (!map.has(m.category)) map.set(m.category, []);
      map.get(m.category)!.push(m);
    }
    return Array.from(map.entries());
  }, [autoMethods]);

  const selectedMethod = autoMethods.find(m => m.id === selectedMethodId);

  function handleDeposit() {
    if (!amount || Number(amount) < 10000) {
      toast.error("Minimal deposit adalah Rp 10.000");
      return;
    }
    if (methodType === "otomatis" && !selectedMethodId) {
      toast.error("Pilih metode pembayaran otomatis terlebih dahulu");
      return;
    }

    toast.info("Fitur pembuatan invoice deposit sedang diproses...");
    // Future: implement POST /api/user/balance/deposit
  }

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
        {/* 1. Nominal Input */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.8)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>1. Masukkan Nominal (Rp)</div>
          <div style={{ marginBottom: 12 }}>
            <input 
              className="contact-input" 
              type="number" 
              placeholder="Contoh: 50000" 
              style={{ fontSize: 20, fontWeight: 800, padding: "16px 24px" }}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
             {["10000", "20000", "50000", "100000", "250000", "500000"].map((nominal) => (
                <button 
                  key={nominal}
                  onClick={() => setAmount(nominal)}
                  style={{ 
                    padding: "8px 16px", borderRadius: 100, 
                    border: amount === nominal ? "1px solid #3b82f6" : "1px solid rgba(255,255,255,0.1)", 
                    background: amount === nominal ? "rgba(59,130,246,0.1)" : "rgba(255,255,255,0.03)",
                    color: amount === nominal ? "#60a5fa" : "rgba(255,255,255,0.5)",
                    fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.2s"
                  }}
                >
                  Rp {Number(nominal).toLocaleString("id-ID")}
                </button>
             ))}
          </div>
        </div>

        {/* 2. Tipe Pengisian */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.8)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>2. Tipe Pengisian</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div 
              onClick={() => setMethodType("otomatis")}
              style={{
                padding: 16, borderRadius: 16, border: methodType === "otomatis" ? "2px solid #3b82f6" : "1px solid rgba(255,255,255,0.05)",
                background: methodType === "otomatis" ? "rgba(59,130,246,0.05)" : "transparent",
                cursor: "pointer", transition: "all 0.2s"
              }}
            >
               <div style={{ fontSize: 15, fontWeight: 800, color: methodType === "otomatis" ? "#fff" : "rgba(255,255,255,0.6)", marginBottom: 4 }}>⚡ Otomatis (Instan)</div>
               <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: 0 }}>QRIS, VA, E-Wallet. Saldo langsung masuk.</p>
            </div>

            <div 
              onClick={() => setMethodType("manual")}
              style={{
                padding: 16, borderRadius: 16, border: methodType === "manual" ? "2px solid #f59e0b" : "1px solid rgba(255,255,255,0.05)",
                background: methodType === "manual" ? "rgba(245,158,11,0.05)" : "transparent",
                cursor: "pointer", transition: "all 0.2s"
              }}
            >
               <div style={{ fontSize: 15, fontWeight: 800, color: methodType === "manual" ? "#fff" : "rgba(255,255,255,0.6)", marginBottom: 4 }}>🏦 Manual (Konfirmasi)</div>
               <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: 0 }}>Transfer Bank & Upload bukti. Cek manual Admin.</p>
            </div>
          </div>
        </div>

        {/* 3. Detail Pembayaran */}
        {amount && Number(amount) >= 10000 ? (
          <div style={{ borderTop: "1px dashed rgba(255,255,255,0.1)", paddingTop: 32 }}>
            {methodType === "otomatis" ? (
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 16, color: "#fff" }}>Pilih Metode Pembayaran</h3>
                {loadingMethods ? (
                  <div style={{ padding: 20, color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Memuat metode pembayaran...</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {groupedMethods.map(([cat, items]) => (
                      <div key={cat}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.3)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>{cat}</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
                          {items.map(m => (
                            <div 
                              key={m.id}
                              onClick={() => setSelectedMethodId(m.id)}
                              style={{
                                padding: 12, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: selectedMethodId === m.id ? "1px solid #3b82f6" : "1px solid rgba(255,255,255,0.05)",
                                cursor: "pointer", transition: "all 0.1s", textAlign: "center"
                              }}
                            >
                               {m.image && <img src={m.image} alt={m.label} style={{ height: 20, marginBottom: 8, objectFit: "contain", filter: "brightness(1.2)" }} />}
                               <div style={{ fontSize: 12, fontWeight: 700, color: selectedMethodId === m.id ? "#fff" : "rgba(255,255,255,0.7)" }}>{m.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ background: "rgba(245,158,11,0.03)", border: "1px solid rgba(245,158,11,0.1)", padding: 24, borderRadius: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#f59e0b", marginBottom: 12 }}>Instruksi Transfer Manual</h3>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 20 }}>Silakan transfer nominal <strong>Rp {Number(amount).toLocaleString("id-ID")}</strong> ke:</p>
                
                <div style={{ background: "rgba(0,0,0,0.2)", padding: 20, borderRadius: 16, marginBottom: 24 }}>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{config.DEPOSIT_MANUAL_BANK || "Pilih Bank di Admin"}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: 1, marginBottom: 4 }}>{config.DEPOSIT_MANUAL_NOREK || "Belum diatur"}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>a.n {config.DEPOSIT_MANUAL_NAME || "Admin"}</div>
                </div>

                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 12 }}>Lampirkan Bukti Transfer</div>
                <div style={{ border: "2px dashed rgba(255,255,255,0.1)", borderRadius: 12, padding: 32, textAlign: "center", cursor: "pointer", background: "rgba(0,0,0,0.1)" }}>
                   <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, margin: 0 }}>Klik untuk pilih gambar bukti transfer (.JPG/.PNG)</p>
                </div>
              </div>
            )}
            
            <button 
              onClick={handleDeposit}
              style={{ 
                width: "100%", padding: 18, marginTop: 32, 
                background: "#3b82f6", color: "#fff", fontWeight: 800, fontSize: 16, 
                borderRadius: 16, border: "none", cursor: "pointer", 
                boxShadow: "0 8px 24px rgba(59,130,246,0.3)" 
              }}
            >
              Konfirmasi Deposit Rp {Number(amount).toLocaleString("id-ID")}
            </button>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "20px", background: "rgba(255,255,255,0.03)", borderRadius: 16, color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
            Minimal deposit saldo adalah Rp 10.000
          </div>
        )}
      </div>
    </div>
  );
}
