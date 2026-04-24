"use client";

import { useState, useEffect, useMemo } from "react";
import { useConfig } from "@/app/components/ConfigProvider";
import { useToast } from "@/app/components/ToastProvider";

type Method = {
  id: string;
  label: string;
  image: string | null;
  category: string;
};

export default function JoinResellerClient() {
  const config = useConfig();
  const toast = useToast();
  
  const [showModal, setShowModal] = useState(false);
  const [methodType, setMethodType] = useState<"otomatis" | "manual">("otomatis");
  const [autoMethods, setAutoMethods] = useState<Method[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSuccessManual, setIsSuccessManual] = useState(false);

  useEffect(() => {
    if (showModal && !isSuccessManual) {
      async function load() {
        try {
          const res = await fetch("/api/user/balance/payment-methods");
          const j = await res.json();
          if (j.methods) setAutoMethods(j.methods);
        } catch (e) { console.error(e); }
      }
      load();
    }
  }, [showModal, isSuccessManual]);

  const groupedMethods = useMemo(() => {
    const map = new Map<string, Method[]>();
    for (const m of autoMethods) {
      if (!map.has(m.category)) map.set(m.category, []);
      map.get(m.category)!.push(m);
    }
    return Array.from(map.entries());
  }, [autoMethods]);

  async function handleJoin() {
    if (methodType === "otomatis" && !selectedMethodId) {
      toast.error("Pilih metode pembayaran otomatis");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/user/reseller-upgrade", {
        method: "POST",
        body: JSON.stringify({
          type: methodType,
          methodId: selectedMethodId
        })
      });
      const j = await res.json();
      
      if (!res.ok) throw new Error(j.error);

      if (j.checkoutUrl) {
        window.location.href = j.checkoutUrl;
      } else if (j.manual) {
        setIsSuccessManual(true);
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  const rawPrice = config.RESELLER_UPGRADE_PRICE || "45000";
  const price = Number(rawPrice.toString().replace(/[^0-9]/g, ""));

  return (
    <>
      <button 
        className="btn btnPrimary" 
        style={{ padding: "16px 40px", fontSize: 16 }}
        onClick={() => {
          setIsSuccessManual(false);
          setShowModal(true);
        }}
      >
        Daftar Reseller Sekarang
      </button>

      {showModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)",
          zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20
        }}>
          <div style={{
            background: "#0c0c16", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 24, width: "100%", maxWidth: 500, padding: 32,
            maxHeight: "90vh", overflowY: "auto", position: "relative",
            textAlign: isSuccessManual ? "center" : "left"
          }}>
            <button 
              onClick={() => setShowModal(false)}
              style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", color: "#fff", fontSize: 24, cursor: "pointer" }}
            >&times;</button>

            {isSuccessManual ? (
              <div style={{ padding: "20px 0" }}>
                 <div style={{ fontSize: 64, marginBottom: 20 }}>💎</div>
                 <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 16, lineHeight: 1.3 }}>
                   Welcome calon bos muda,<br/>
                   <span style={{ color: "#60a5fa" }}>sebentar lagi kamu akan menjadi bagian dari CarenPedia</span>
                 </h2>
                 <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>
                   Silahkan hubungi admin untuk konfirmasi pendaftaran kamu agar segera diproses.
                 </p>
                 <a 
                   href={`https://wa.me/${config.SUPPORT_WHATSAPP}?text=${encodeURIComponent("Halo admin, saya ingin join bagian dari CarenPedia. Saya sudah membayar")}`} 
                   target="_blank" 
                   style={{ 
                     display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                     padding: 18, background: "#10b981", color: "#fff", borderRadius: 16, 
                     fontSize: 16, fontWeight: 800, textDecoration: "none",
                     boxShadow: "0 8px 20px rgba(16,185,129,0.3)"
                   }}
                 >
                   Konfirmasi ke Admin
                 </a>
              </div>
            ) : (
              <>
                <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Upgrade Reseller VIP</h2>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 24 }}>
                  Biaya pendaftaran: <span style={{ color: "#fff", fontWeight: 800 }}>Rp {price.toLocaleString("id-ID")}</span>
                </p>

                {/* Tipe Pembayaran */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
                   <button 
                     onClick={() => setMethodType("otomatis")}
                     style={{
                       padding: 12, borderRadius: 12, border: methodType === "otomatis" ? "2px solid #3b82f6" : "1px solid rgba(255,255,255,0.1)",
                       background: methodType === "otomatis" ? "rgba(59,130,246,0.1)" : "transparent",
                       color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer"
                     }}
                   >Otomatis</button>
                   <button 
                     onClick={() => setMethodType("manual")}
                     style={{
                       padding: 12, borderRadius: 12, border: methodType === "manual" ? "2px solid #f59e0b" : "1px solid rgba(255,255,255,0.1)",
                       background: methodType === "manual" ? "rgba(245,158,11,0.1)" : "transparent",
                       color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer"
                     }}
                   >Manual</button>
                </div>

                {methodType === "otomatis" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {groupedMethods.map(([cat, items]) => (
                      <div key={cat}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.3)", marginBottom: 8, textTransform: "uppercase" }}>{cat}</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                           {items.map(m => (
                             <div 
                               key={m.id}
                               onClick={() => setSelectedMethodId(m.id)}
                               style={{
                                 padding: 10, borderRadius: 10, border: selectedMethodId === m.id ? "1px solid #3b82f6" : "1px solid rgba(255,255,255,0.05)",
                                 background: "rgba(255,255,255,0.02)", cursor: "pointer", textAlign: "center"
                               }}
                             >
                                {m.image && <img src={m.image} alt={m.label} style={{ height: 16, marginBottom: 4, filter: "brightness(1.2)" }} />}
                                <div style={{ fontSize: 11, fontWeight: 700 }}>{m.label}</div>
                             </div>
                           ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ background: "rgba(245,158,11,0.05)", border: "1px dashed rgba(245,158,11,0.2)", padding: 20, borderRadius: 16 }}>
                     <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>Silakan transfer ke rekening berikut secara manual:</p>
                     <div style={{ background: "rgba(0,0,0,0.3)", padding: 16, borderRadius: 12, marginBottom: 4 }}>
                       <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{config.DEPOSIT_MANUAL_BANK}</div>
                       <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: 1 }}>{config.DEPOSIT_MANUAL_NOREK}</div>
                       <div style={{ fontSize: 13, marginTop: 2 }}>a.n {config.DEPOSIT_MANUAL_NAME}</div>
                     </div>
                  </div>
                )}

                <button 
                  onClick={handleJoin}
                  disabled={loading}
                  style={{
                    width: "100%", padding: 18, marginTop: 32, borderRadius: 16,
                    background: "#3b82f6", color: "#fff", fontWeight: 800, border: "none",
                    cursor: "pointer", opacity: loading ? 0.5 : 1,
                    fontSize: 16, boxShadow: "0 8px 20px rgba(59,130,246,0.2)"
                  }}
                >
                  {loading ? "Memproses..." : methodType === "otomatis" ? `Bayar Rp ${price.toLocaleString("id-ID")}` : "Saya Sudah Transfer & Daftar"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
