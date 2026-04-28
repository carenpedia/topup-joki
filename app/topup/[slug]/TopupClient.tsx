"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import ProductFaqAccordion from "@/app/components/ProductFaqAccordion";
import { useToast } from "@/app/components/ToastProvider";
import { useAsyncAction } from "@/app/components/useAsyncAction";
import { getTargetConfig } from "@/lib/targetConfig";
import Script from "next/script";

export type Audience = "PUBLIC" | "GOLD" | "SILVER";
type PaymentMethodType = "CarenCoin" | "GATEWAY";

type MethodFee = {
  id: string;
  gateway: string;
  methodKey: string;
  label: string;
  category: string;
  image: string | null;
  feeFixed: number;
  feePercent: number;
  minFee: number | null;
  maxFee: number | null;
};


type Props = {
  game: {
    id: string;
    key: string;
    name: string;
  };
  audience?: Audience;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  publisher?: string;
  hasJoki?: boolean;
  targetType?: string;
  gateways?: Record<string, boolean>;
  methodFees?: MethodFee[];
  userBalance?: number;
  carenCoinLogo?: string | null;
};

type NominalRow = {
  id: string;
  name: string;
  group?: string | null;
  category?: { id: string, name: string, order: number } | null;
  basePrice: number;
  finalPrice: number;
  imageUrl?: string | null;
  flash: null | { id: string; flashPrice: number; endAt?: string };
};

function rupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function normalizePhone(input: string) {
  let v = input.replace(/[^\d+]/g, "");
  if (v.startsWith("08")) v = "+62" + v.slice(1);
  if (v.startsWith("62")) v = "+62" + v.slice(2);
  return v;
}

export default function TopupClient({
  game,
  audience: audienceProp,
  logoUrl,
  bannerUrl,
  publisher = "Official Publisher",
  hasJoki = false,
  targetType = "DEFAULT",
  gateways = { MIDTRANS: true, DUITKU: true, TRIPAY: true, XENDIT: true },
  methodFees = [],
  userBalance = 0,
  carenCoinLogo = null,
}: Props) {
  const router = useRouter();
  const toast = useToast();
  const targetConfig = getTargetConfig(targetType);

  const [targetInputs, setTargetInputs] = useState<Record<string, string>>({});
  const [nominals, setNominals] = useState<NominalRow[]>([]);
  const [nominalLoading, setNominalLoading] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [activePaymentType, setActivePaymentType] = useState<PaymentMethodType>("GATEWAY");
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [openCategory, setOpenCategory] = useState<string | null>("E-Wallet"); // Default open E-Wallet

  const [contact, setContact] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [waCountry, setWaCountry] = useState({ name: "Indonesia", code: "+62", iso: "ID" });
  const [showStickyDetails, setShowStickyDetails] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // States untuk Cek ID Otomatis
  const [checkResult, setCheckResult] = useState<{ nickname: string, region: string | null } | null>(null);
  const [checkLoading, setCheckLoading] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [showCountryList, setShowCountryList] = useState(false);
  const [voucher, setVoucher] = useState("");
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [voucherMsg, setVoucherMsg] = useState("");

  const [reviewsData, setReviewsData] = useState<{ reviews: any[], totalCount: number, averageRating: number }>({
    reviews: [],
    totalCount: 14515,
    averageRating: 4.99
  });
  const [expandedReviews, setExpandedReviews] = useState(false);

  // Load Reviews
  useEffect(() => {
    async function loadReviews() {
      try {
        const res = await fetch(`/api/reviews?gameId=${game.id}`);
        const j = await res.json();
        if (res.ok) setReviewsData(j);
      } catch (e) {
        console.error("Review Load Error:", e);
      }
    }
    loadReviews();
  }, [game.id]);

  const userId = targetInputs["userId"] || "";
  const server = targetInputs["server"] || "";
  const hasServer = targetConfig.fields.some((f) => f.key === "server");

  // Logika Cek ID Otomatis (Debounced)
  useEffect(() => {
    if (!userId.trim() || (hasServer && !server.trim())) {
      setCheckResult(null);
      setCheckError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckLoading(true);
      setCheckError(null);
      
      try {
        const res = await fetch("/api/check-id", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, zoneId: server, gameCode: game.key })
        });
        const data = await res.json();
        if (data.success) {
          setCheckResult({ nickname: data.nickname, region: data.region });
        } else {
          setCheckError(data.message);
        }
      } catch (e) {
        console.error("Check ID Error:", e);
      } finally {
        setCheckLoading(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [userId, server, game.key, hasServer]);

  // Load Nominals
  useEffect(() => {
    async function loadNominals() {
      setNominalLoading(true);
      try {
        const res = await fetch(`/api/topup/${game.key}/products?type=TOPUP`);
        const j = await res.json();
        if (res.ok) {
          setNominals(j.rows.map((p: any) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            finalPrice: p.finalPrice,
            basePrice: p.basePrice,
            flash: p.flash,
            imageUrl: p.imageUrl
          })));
        }
      } catch (e) {
        console.error("Nominal Load Error:", e);
      } finally {
        setNominalLoading(false);
      }
    }
    loadNominals();
  }, [game.key]);

  const selectedItem = nominals.find(n => n.id === selectedItemId);

  // Grouped Nominals
  const groupedNominals = useMemo(() => {
    const map = new Map<string, NominalRow[]>();
    for (const it of nominals) {
      const g = it.category ? `CAT:${it.category.name}` : "NONE";
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(it);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [nominals]);

  // Grouped Gateway Methods
  const groupedMethods = useMemo(() => {
    const map = new Map<string, MethodFee[]>();
    for (const m of methodFees) {
      if (!gateways[m.gateway]) continue;
      if (!map.has(m.category)) map.set(m.category, []);
      map.get(m.category)!.push(m);
    }
    return Array.from(map.entries());
  }, [methodFees, gateways]);

  function calculatePrice(basePrice: number, method: MethodFee) {
    let fee = method.feeFixed + Math.floor((basePrice * method.feePercent) / 100);
    if (method.minFee !== null && fee < method.minFee) fee = method.minFee;
    if (method.maxFee !== null && fee > method.maxFee) fee = method.maxFee;
    return basePrice + fee;
  }

  function getFeeAmount(basePrice: number, method: MethodFee) {
    let fee = method.feeFixed + Math.floor((basePrice * method.feePercent) / 100);
    if (method.minFee !== null && fee < method.minFee) fee = method.minFee;
    if (method.maxFee !== null && fee > method.maxFee) fee = method.maxFee;
    return fee;
  }

  const { loading: checkoutLoading, run: runCheckout } = useAsyncAction();

  // Helper: calculate total displayed in button (nominal + payment fee - voucher)
  function getComputedTotal() {
    if (!selectedItem) return 0;
    let base = selectedItem.finalPrice;
    let fee = 0;
    
    if (activePaymentType === "GATEWAY") {
      const m = methodFees.find(x => x.id === selectedMethodId);
      if (m) fee = getFeeAmount(base, m);
    }
    
    return Math.max(base + fee - voucherDiscount, 0);
  }
  const totalToPayComputed = getComputedTotal();

  // Validate inputs and show modal
  function onCheckoutClick() {
    if (!selectedItem) {
      toast.critical("Pilih nominal produk terlebih dahulu.");
      scrollTo("section-nominal");
      return;
    }

    // Validasi Data Akun (ID / Server)
    const missingField = targetConfig.fields.find(f => !targetInputs[f.key]?.trim());
    if (missingField) {
      toast.critical(`Harap isi ${missingField.label} terlebih dahulu`);
      scrollTo("section-id");
      return;
    }

    if (activePaymentType === "GATEWAY" && !selectedMethodId) {
      toast.critical("Pilih metode pembayaran terlebih dahulu.");
      scrollTo("section-payment");
      return;
    }

    if (!contactEmail.trim()) {
      toast.critical("Harap masukkan alamat email untuk pengiriman invoice");
      scrollTo("section-contact");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      toast.critical("Format email tidak valid");
      scrollTo("section-contact");
      return;
    }

    if (!contact.trim()) {
      toast.critical("Harap masukkan nomor WhatsApp kamu");
      scrollTo("section-contact");
      return;
    }

    setShowConfirmModal(true);
  }

  async function processCheckout() {
    setShowConfirmModal(false);
    if (!selectedItem) return; // Fix TS Error

    await runCheckout(async () => {
      try {
        const body = {
          gameKey: game.key,
          productId: selectedItem.id,
          inputUserId: userId,
          inputServer: hasServer ? server : undefined,
          contactWhatsapp: waCountry.code + contact,
          contactEmail: contactEmail,
          paymentMethod: activePaymentType,
          methodId: selectedMethodId,
          voucherCode: voucherApplied ? voucher.trim().toUpperCase() : undefined,
        };

        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Checkout gagal");

        if (data.gateway === "MIDTRANS" && data.snapToken) {
          if ((window as any).snap) {
            (window as any).snap.pay(data.snapToken, {
              onSuccess: () => router.push(`/invoice/${data.orderNo}`),
              onPending: () => router.push(`/invoice/${data.orderNo}`),
              onClose: () => router.push(`/invoice/${data.orderNo}`),
            });
            return;
          }
        }

        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
        } else {
          router.push(`/invoice/${data.orderNo}`);
        }
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  }

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleProductSelect = (id: string) => {
    setSelectedItemId(id);

    // UX: Check if account fields are filled
    const missingField = targetConfig.fields.find(f => !targetInputs[f.key]?.trim());

    setTimeout(() => {
      if (missingField) {
        scrollTo("section-id");
        toast.critical(`Harap isi ${missingField.label} terlebih dahulu`);
      } else {
        scrollTo("section-payment");
      }
    }, 100);
  };

  return (
    <main className="topupPage">
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
      />
      <Navbar />

      {/* Hero Banner Section (Restored features) */}
      <div className="tpNewHero">
        <div className="tpNewHeroBanner">
          {bannerUrl ? <img src={bannerUrl} alt={game.name} className="tpNewHeroBannerImg" /> : <div className="tpNewHeroBannerFallback" />}
          <div className="tpNewHeroOverlay" />
        </div>
        <div className="topupWrap">
          <div className="tpNewHeroContent">
            <div className="tpNewHeroLogoCard">
              {logoUrl ? <img src={logoUrl} alt={game.name} className="tpNewHeroLogoImg" /> : <div className="tpNewHeroLogoFallback">{game.name[0]}</div>}
            </div>
            <div className="tpNewHeroInfo">
              <h1 className="tpNewHeroTitle">{game.name}</h1>
              <p className="tpNewHeroPublisher">{publisher}</p>

              <div className="tpNewHeroFeatures">
                <div className="tpNewFeatureItem">
                  <div className="tpNewFeatureIcon">
                    <svg className="tpVerifyBadgeAnim" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L10.24 3.76L7.75 3.12L6.34 5.34L3.89 5.86L3.8 8.41L1.82 10.02L2.83 12.35L1.82 14.68L3.8 16.29L3.89 18.84L6.34 19.36L7.75 21.58L10.24 20.94L12 22.7L13.76 20.94L16.25 21.58L17.66 19.36L20.11 18.84L20.2 16.29L22.18 14.68L21.17 12.35L22.18 10.02L20.2 8.41L20.11 5.86L17.66 5.34L16.25 3.12L13.76 3.76L12 2Z" fill="#3b82f6" />
                      <path className="tpVerifyCheck" d="M10.5 15.5L6.5 11.5L7.91 10.09L10.5 12.67L16.09 7.09L17.5 8.5L10.5 15.5Z" fill="white" />
                    </svg>
                  </div>
                  <span>Aman & Terpercaya</span>
                </div>
                <div className="tpNewFeatureItem">
                  <div className="tpNewFeatureIcon">
                    <svg className="tpVerifyBadgeAnim" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      <g className="tpVerifyCheck">
                        <path d="M8 10h.01"></path>
                        <path d="M12 10h.01"></path>
                        <path d="M16 10h.01"></path>
                      </g>
                    </svg>
                  </div>
                  <span>Layanan 24 Jam</span>
                </div>
                <div className="tpNewFeatureItem">
                  <div className="tpNewFeatureIcon">
                    <svg className="tpFlashAnim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                  </div>
                  <span>Proses satset</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="topupWrap">
        {hasJoki && (
          <div
            className="tpTabSwitcher"
            style={{
              display: "flex",
              background: "rgba(255,255,255,.06)",
              border: "1px solid rgba(255,255,255,.10)",
              borderRadius: 16,
              padding: 4,
              marginBottom: 24,
            }}>
            <div style={{
              flex: 1,
              textAlign: "center",
              padding: "11px 16px",
              borderRadius: 12,
              background: "linear-gradient(135deg, rgba(59,130,246,.95), rgba(37,99,235,.95))",
              color: "#fff",
              fontWeight: 800,
              fontSize: 14,
            }}>
              💎 Top Up
            </div>
            <Link
              href={`/joki/${game.key}`}
              style={{
                flex: 1,
                textAlign: "center",
                padding: "11px 16px",
                borderRadius: 12,
                color: "rgba(255,255,255,.60)",
                fontWeight: 700,
                fontSize: 14,
                textDecoration: "none",
                display: "block",
              }}
            >
              🎮 JOKI
            </Link>
          </div>
        )}

        <div className="tpMainLayout">
          <div className="tpLeftCol">
            {/* Step 1: Account Data */}
            <div className="card" id="section-id">
              <div className="contact-header">
                <div className="contact-step">1</div>
                <div className="contact-title-wrap"><h4 className="contact-title">Masukkan Data Akun</h4></div>
              </div>
              <div className="contact-body">
                <div className="row" style={{ gap: 12 }}>
                  {targetConfig.fields.map((f) => (
                    <div key={f.key} style={{ flex: "1 0 calc(50% - 6px)" }}>
                      <label className="contact-label">{f.label}</label>
                      <input 
                        className="contact-input" 
                        placeholder={f.label} 
                        value={targetInputs[f.key] || ""} 
                        onChange={(e) => setTargetInputs({ ...targetInputs, [f.key]: e.target.value })}
                        type={(game.key.includes("mobile-legends") || game.key.includes("free-fire") || game.key.includes("genshin") || game.key.includes("pubg") || game.key.includes("higgs") || game.key.includes("domino") || game.key.includes("stumble") || game.key.includes("eggy")) && (f.label.toLowerCase().includes("id") || f.label.toLowerCase().includes("uid") || f.label.toLowerCase().includes("zone") || f.label.toLowerCase().includes("server")) ? "tel" : "text"}
                        inputMode={(game.key.includes("mobile-legends") || game.key.includes("free-fire") || game.key.includes("genshin") || game.key.includes("pubg") || game.key.includes("higgs") || game.key.includes("domino") || game.key.includes("stumble") || game.key.includes("eggy")) && (f.label.toLowerCase().includes("id") || f.label.toLowerCase().includes("uid") || f.label.toLowerCase().includes("zone") || f.label.toLowerCase().includes("server")) ? "numeric" : "text"}
                      />
                    </div>
                  ))}
                </div>

                {/* Display Hasil Cek ID */}
                {(checkLoading || checkResult || checkError) && (
                  <div style={{ 
                    marginTop: 16, padding: "12px 16px", borderRadius: 12, 
                    background: checkError ? "rgba(239,68,68,0.05)" : "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.05) 100%)",
                    border: `1px solid ${checkError ? "rgba(239,68,68,0.2)" : "rgba(59, 130, 246, 0.3)"}`,
                    boxShadow: checkError ? "none" : "0 4px 20px -2px rgba(59, 130, 246, 0.1)",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    minHeight: 48, position: "relative", overflow: "hidden"
                  }}>
                    {checkLoading && (
                      <div style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
                        <div className="spinner-tiny" style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.1)", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                        Mengecek Username...
                      </div>
                    )}
                    
                    {checkResult && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase" }}>Username Terdeteksi</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 15, fontWeight: 900, color: "#4ade80" }}>{checkResult.nickname}</span>
                          {checkResult.region && (
                            <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>
                              from <span style={{ fontWeight: 800, color: "rgba(255,255,255,0.85)" }}>{checkResult.region}</span> {{"Indonesia":"🇮🇩","Malaysia":"🇲🇾","Singapore":"🇸🇬","Thailand":"🇹🇭","Philippines":"🇵🇭","Vietnam":"🇻🇳","Brazil":"🇧🇷","India":"🇮🇳","Japan":"🇯🇵","Korea":"🇰🇷","Russia":"🇷🇺","Turkey":"🇹🇷","Myanmar":"🇲🇲","Cambodia":"🇰🇭","Taiwan":"🇹🇼"}[checkResult.region] || "🌐"}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {checkError && !checkLoading && (
                      <div style={{ color: "#f87171", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        {checkError}
                      </div>
                    )}
                  </div>
                )}

                <p style={{ margin: "10px 0 0", fontSize: 11, lineHeight: 1.4, color: "rgba(250,204,21,.7)", display: "flex", alignItems: "flex-start", gap: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(250,204,21,.8)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                  <span>Harap masukkan {targetConfig.fields.map((f) => f.label).join(" & ")} dengan benar, kesalahan input bukan tanggung jawab kami.</span>
                </p>
              </div>
            </div>

            <div className="spacer" />

            {/* Step 2: Nominals */}
            <div className="card" id="section-nominal">
              <div className="contact-header">
                <div className="contact-step">2</div>
                <div className="contact-title-wrap"><h4 className="contact-title">Pilih Nominal</h4></div>
              </div>
              <div className="contact-body">
                {nominalLoading ? (
                  <div style={{ padding: 20, textAlign: "center", color: "rgba(255,255,255,0.4)" }}>Memuat produk...</div>
                ) : groupedNominals.map(([g, items]) => (
                  <div key={g} className="nominalGroup" style={{ marginBottom: 24 }}>
                    <div className="nominalGroupHeader">{g.replace("CAT:", "")}</div>
                    <div className="tpNomGrid">
                      {items.map((p) => (
                        <button key={p.id} className={`tpNomCard ${selectedItemId === p.id ? "isActive" : ""}`} onClick={() => handleProductSelect(p.id)}>
                          {p.flash && p.basePrice > p.finalPrice && (
                            <div className="tpRibbon">FLASH SALE</div>
                          )}
                          <div className="tpNomTop"><span className="tpNomName">{p.name}</span></div>
                          <div className="tpNomMain">
                            <div className="tpNomIcon">
                              {p.imageUrl ? <img src={p.imageUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <svg viewBox="0 0 24 24" fill="none" stroke="#4ed6ff" strokeWidth="2.5"><path d="M6 3h12l4 8-10 10L2 11l4-8z"></path><path d="M12 3v18"></path><path d="M2 11h20"></path><path d="M6 3L12 11L18 3"></path></svg>}
                            </div>
                            <div className="tpNomPriceWrap">
                              {p.flash && p.basePrice > p.finalPrice && (
                                <span className="tpNomPriceOriginal">{rupiah(p.basePrice).replace(",00", "").replace("Rp", "Rp ")}</span>
                              )}
                              <span className="tpNomPriceNow">{rupiah(p.finalPrice).replace(",00", "").replace("Rp", "Rp ")}</span>
                            </div>
                          </div>
                          <div className="tpNomBottom">
                            <div className="tpInstanBadge">
                              <svg viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
                              <span className="tpInstanText">Instan</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="spacer" />

            {/* Step 3: Pilihan Pembayaran */}
            <div className="card" id="section-payment">
              <div className="contact-header">
                <div className="contact-step">3</div>
                <div className="contact-title-wrap"><h4 className="contact-title">Pilih Pembayaran</h4></div>
              </div>
              <div className="contact-body">
                <div className="tpPayAccordion">
                  {/* Special CarenCoin Category */}
                  <div className={`tpPayCategory premium-cat ${activePaymentType === "CarenCoin" ? "isSelected" : ""}`}>
                    <div className="tpRibbon">BEST PRICE</div>
                    <button
                      className="tpPayCategoryHeader caren-header"
                      onClick={() => { setActivePaymentType("CarenCoin"); setSelectedMethodId(null); }}
                    >
                      <div className="tpPayHeaderTop">
                        <div className="caren-left-group">
                          <div className="tpPayCategoryIcon caren-icon">
                            {carenCoinLogo ? <img src={carenCoinLogo} alt="CC" style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : "🪙"}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div className="tpPayCategoryTitle" style={{ fontSize: '14px' }}>CarenCoin</div>
                            <div style={{ fontSize: '10px', color: '#fff', fontWeight: '600', marginTop: '1px', fontStyle: 'italic' }}>(Bebas Biaya Admin)</div>
                          </div>
                        </div>
                        <div className="tpPayCategoryBalance" style={{ 
                          color: userBalance === 0 && audienceProp === "PUBLIC" ? "#f87171" : "#fff",
                          marginRight: '28px',
                          marginTop: '2px'
                        }}>
                          {userBalance === 0 && audienceProp === "PUBLIC" ? "Max. Rp 0" : rupiah(userBalance)}
                        </div>
                      </div>
                    </button>
                  </div>

                  {groupedMethods.map(([cat, methods]) => (
                    <div key={cat} className={`tpPayCategory ${openCategory === cat && activePaymentType === "GATEWAY" ? "isOpen" : ""}`}>
                      <button className="tpPayCategoryHeader" onClick={() => { setOpenCategory(openCategory === cat ? null : cat); setActivePaymentType("GATEWAY"); }}>
                        <div className="tpPayHeaderTop">
                          <div className="tpPayCategoryTitle">{cat}</div>
                          <div className="tpPayCategoryChevron">▼</div>
                        </div>
                        <div className="tpPayHeaderBottom">
                          <div className="tpPayLogoPreview">
                            {methods.slice(0, 8).map(m => (
                              <img key={m.id} src={m.image || ""} alt={m.label} className="preview-logo-tiny" />
                            ))}
                          </div>
                        </div>
                      </button>
                      <div className="tpPayCategoryContent">
                        <div className="tpPayInnerGrid">
                          {methods.map(m => (
                            <button key={m.id} className={`tpMethodCard ${selectedMethodId === m.id ? "isSelected" : ""}`} onClick={() => setSelectedMethodId(m.id)}>
                              <div className="tpMethodTop">
                                <div className="tpMethodLogoExpand">
                                  {m.image ? <img src={m.image} alt={m.label} className="expand-logo" /> : <span className="expand-logo-text">{m.label?.[0]}</span>}
                                </div>
                                <div className="tpMethodPriceMain">
                                  {selectedItem ? rupiah(calculatePrice(selectedItem.finalPrice, m)) : "Pilih nominal"}
                                </div>
                              </div>
                              <div className="tpMethodDashed" />
                              <div className="tpMethodBottom">
                                <div className="tpMethodFeeText">
                                  Sudah termasuk pajak
                                </div>
                              </div>
                              {selectedMethodId === m.id && <div className="tpMethodMark">✓</div>}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="spacer" />

            {/* Step 4: Voucher */}
            <div className="card">
              <div className="contact-header">
                <div className="contact-step">4</div>
                <div className="contact-title-wrap"><h4 className="contact-title">Kode Voucher</h4></div>
              </div>
              <div className="contact-body">
                <div style={{ display: "flex", gap: 10 }}>
                  <input className="contact-input" placeholder="Masukkan Kode Voucher" value={voucher} onChange={(e) => { setVoucher(e.target.value); if(voucherApplied) { setVoucherApplied(false); setVoucherDiscount(0); setVoucherMsg(""); } }} />
                  <button 
                    className="btn-promo" 
                    disabled={!voucher.trim() || !selectedItem}
                    onClick={async () => { 
                      setVoucherMsg("Mengecek...");
                      try {
                        const res = await fetch("/api/vouchers/check", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ code: voucher, basePrice: selectedItem?.finalPrice || 0 })
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.error);
                        setVoucherApplied(true);
                        setVoucherDiscount(data.discount);
                        setVoucherMsg(data.message);
                        toast.success(data.message);
                      } catch (err: any) {
                        setVoucherApplied(false);
                        setVoucherDiscount(0);
                        setVoucherMsg(err.message);
                        toast.error(err.message);
                      }
                    }}
                  >
                    Gunakan
                  </button>
                </div>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 6, fontStyle: "italic" }}>
                  Masukkan kode promo jika ada (Opsional)
                </p>
                {voucherMsg && <div style={{ fontSize: 11, marginTop: 4, color: "#3b82f6" }}>{voucherMsg}</div>}
              </div>
            </div>

            <div className="spacer" />

            {/* Step 5: Contact */}
            <div className="card" id="section-contact">
              <div className="contact-header">
                <div className="contact-step">5</div>
                <div className="contact-title-wrap"><h4 className="contact-title">Detail Kontak</h4></div>
              </div>
              <div className="contact-body">
                <label className="tpContactLabel">Email</label>
                <input 
                  className="contact-input" 
                  placeholder="example@gmail.com" 
                  value={contactEmail} 
                  onChange={(e) => setContactEmail(e.target.value)} 
                />

                <div style={{ height: 16 }} />

                <label className="tpContactLabel">No. WhatsApp</label>
                <div className="tpWaInputGroup">
                  <button className="tpWaRegionBtn" onClick={() => setShowCountryList(true)}>
                    <img src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${waCountry.iso}.svg`} className="tpWaFlag" alt={waCountry.name} />
                    <span className="tpWaChevron">▼</span>
                  </button>
                  <div className="tpWaDivider" />
                  <div className="tpWaNumberWrap">
                    <div className="tpWaPrefix">{waCountry.code}</div>
                    <input 
                      className="contact-input tpWaInputWithPrefix" 
                      placeholder="8123456789" 
                      value={contact} 
                      onChange={(e) => setContact(e.target.value.replace(/\D/g, ""))} 
                      type="tel"
                      inputMode="numeric"
                    />
                  </div>
                </div>

                <span className="tpContactAttention">
                  **Nomor ini akan dihubungi jika terjadi masalah
                </span>

                <div className="tpInfoBox">
                  <div className="tpInfoIcon">i</div>
                  <div className="tpInfoText">
                    invoice transaksi akan dikirimkan ke email yang kamu isi diatas
                  </div>
                </div>
              </div>
            </div>

            {/* Region Modal */}
            {showCountryList && (
              <div className="tpRegionOverlay" onClick={() => setShowCountryList(false)}>
                <div className="tpRegionModal" onClick={(e) => e.stopPropagation()}>
                  <div className="tpRegionTitle">Pilih Negara</div>
                  <div className="tpRegionList">
                    {[
                      { name: "Indonesia", code: "+62", iso: "ID" },
                      { name: "Malaysia", code: "+60", iso: "MY" },
                      { name: "Singapore", code: "+65", iso: "SG" },
                      { name: "Thailand", code: "+66", iso: "TH" },
                      { name: "Vietnam", code: "+84", iso: "VN" },
                      { name: "Philippines", code: "+63", iso: "PH" },
                    ].map((c) => (
                      <button 
                        key={c.iso} 
                        className={`tpRegionItem ${waCountry.iso === c.iso ? "isActive" : ""}`}
                        onClick={() => { setWaCountry(c); setShowCountryList(false); }}
                      >
                        <img src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${c.iso}.svg`} className="tpRegionFlag" alt={c.name} />
                        <span>{c.name}</span>
                        <span className="tpRegionCode">{c.code}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="tpRightCol">
            {/* Rating Widget */}
            <div className="tpSidebarCard tpRatingCard">
              <div className="tpRatingLabel">Ulasan dan rating</div>
              <div className="tpRatingTop">
                <div className="tpRatingValue">{reviewsData.averageRating}</div>
                <div className="tpRatingStarsWrap">
                  <div className="tpRatingStars">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                    ))}
                  </div>
                  <div className="tpRatingTotal">Berdasarkan total {reviewsData.totalCount.toLocaleString("id-ID")} rating</div>
                </div>
              </div>
            </div>

            {/* Support Widget */}
            <div className="tpSidebarCard tpHelpCard">
              <div className="tpHelpIcon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              </div>
              <div className="tpHelpText">
                <b>Butuh Bantuan?</b>
                <p>Kamu bisa hubungi admin disini.</p>
              </div>
            </div>

            {/* Checkout Summary Card */}
            <div className="tpSidebarCard tpCheckoutSideCard">
              <div className="tpSideProdInfo">
                <img src={selectedItem?.imageUrl || logoUrl || ""} alt="Prod" className="tpSideProdImg" />
                <div className="tpSideProdText">
                  <b>{game.name}</b>
                  <p>{selectedItem ? selectedItem.name : "Belum memilih nominal"}</p>
                </div>
              </div>

              <div className="tpSideDetails">
                <div className="tpSideRow">
                  <span>Harga</span>
                  <b>{selectedItem ? rupiah(selectedItem.finalPrice) : "-"}</b>
                </div>
                <div className="tpSideRow">
                  <span>Metode Pembayaran</span>
                  <b>{activePaymentType === "CarenCoin" ? "CarenCoin" : (methodFees.find(x => x.id === selectedMethodId)?.label || "-")}</b>
                </div>
                <div className="tpSideRow">
                  <span>Biaya Layanan</span>
                  <b>
                    {selectedItem && activePaymentType === "GATEWAY" && selectedMethodId
                      ? rupiah(getFeeAmount(selectedItem.finalPrice, methodFees.find(x => x.id === selectedMethodId)!))
                      : "Rp 0"}
                  </b>
                </div>
                {voucherApplied && voucherDiscount > 0 && (
                  <div className="tpSideRow" style={{ color: "#4ade80" }}>
                    <span>Potongan Promo</span>
                    <b style={{ color: "#4ade80" }}>-{rupiah(voucherDiscount)}</b>
                  </div>
                )}
              </div>

              <div className="tpSideTotal">
                <div className="tpSideTotalLabel">Total Pembayaran</div>
                <div className="tpSideTotalValue">{selectedItem ? rupiah(totalToPayComputed) : "Rp 0"}</div>
              </div>

              <button className="tpBtnCheckoutSide" disabled={checkoutLoading || !selectedItem} onClick={onCheckoutClick}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                {checkoutLoading ? "Memproses..." : "Pesan Sekarang"}
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section (Desktop side, Mobile bottom) */}
        <div className="tpReviewSection">
          <div className="tpReviewHeader">
            <h3 className="tpReviewTitle">Ulasan dan Rating</h3>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginLeft: 'auto', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', gap: 3, color: "#fbbf24" }}>
                  {[...Array(5)].map((_, i) => <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>)}
                </div>
                <span style={{ fontSize: 13, color: "#fff", fontWeight: 800 }}>{reviewsData.averageRating}/5.0</span>
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>
                ({reviewsData.totalCount.toLocaleString("id-ID")} ulasan)
              </div>
            </div>
          </div>
          <div className="tpReviewList">
            {reviewsData.reviews.slice(0, expandedReviews ? 10 : 4).map((rev, i) => (
              <div key={rev.id || i} className="tpReviewItem">
                <div className="tpReviewUser">
                  <div className="tpReviewAvatar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  </div>
                  <div className="tpReviewMeta">
                    <b>{rev.userName}</b>
                    <span>{rev.createdAt ? new Date(rev.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'long' }) : "Baru saja"} • Terverifikasi</span>
                  </div>
                  <div className="tpReviewStars">
                    {[...Array(rev.rating)].map((_, i) => <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>)}
                  </div>
                </div>
                <p className="tpReviewContent">{rev.comment}</p>
                {rev.isVerified && <div className="tpReviewBadge">✓ Produk Sesuai</div>}
              </div>
            ))}

            {!expandedReviews && reviewsData.reviews.length > 4 && (
              <button 
                onClick={() => setExpandedReviews(true)}
                className="tpBtnShowMore"
              >
                Lihat ulasan lainnya
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ height: 120 }} />

      {/* Sticky Checkout Bar (Mobile Only via CSS display:none) */}
      <div className="stickyWrap">
        <div className="stickyCard">
          <div className={`stickyInfoBox ${selectedItem ? "isFilled" : "isEmpty"}`}>
            {selectedItem ? (
              <>
                <img src={selectedItem.imageUrl || logoUrl || ""} alt="Game" className="stickyInfoLogo" />
                <div className="stickyInfoContent">
                  <div className="stickyInfoGame">{game.name}</div>
                  <div className="stickyInfoProduct">{selectedItem.name}</div>
                </div>
                <div className={`stickyInfoChevron ${showStickyDetails ? "isExpanded" : ""}`} onClick={(e) => { e.stopPropagation(); setShowStickyDetails(!showStickyDetails); }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"></polyline></svg>
                </div>
              </>
            ) : (
              <div className="stickyInfoText">Belum ada item produk yang dipilih.</div>
            )}
          </div>

          {/* New Expanded Details */}
          {selectedItem && (
            <div className={`stickyDetailsArea ${showStickyDetails ? "isOpen" : ""}`}>
              <div className="stickyDetailRow">
                <span>Harga Produk</span>
                <b>{rupiah(selectedItem.finalPrice)}</b>
              </div>
              <div className="stickyDetailRow">
                <span>Biaya Layanan</span>
                <b>
                  {activePaymentType === "GATEWAY" && selectedMethodId
                    ? rupiah(getFeeAmount(selectedItem.finalPrice, methodFees.find(x => x.id === selectedMethodId)!))
                    : "Rp 0"}
                </b>
              </div>
              {voucherApplied && voucherDiscount > 0 && (
                <div className="stickyDetailRow" style={{ color: "#4ade80" }}>
                  <span>Potongan Promo</span>
                  <b style={{ color: "#4ade80" }}>-{rupiah(voucherDiscount)}</b>
                </div>
              )}
              <div className="stickyDetailDivider" />
              <div className="stickyDetailRow total">
                <span>Total Pembayaran</span>
                <b>{rupiah(totalToPayComputed)}</b>
              </div>
            </div>
          )}
          <div className="stickyAction">
            <button className="stickyBtn" disabled={checkoutLoading || !selectedItem} onClick={onCheckoutClick}>
              <div className="stickyBtnIcon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              </div>
              {checkoutLoading ? "Memproses..." : selectedItem ? `Beli Sekarang — ${rupiah(totalToPayComputed)}` : "Pilih Produk"}
            </button>
          </div>
        </div>
      </div>

      <ProductFaqAccordion />
      <Footer />

      {/* Confirmation Modal */}
      {showConfirmModal && selectedItem && (
        <div className="tpModalOverlay" onClick={() => !checkoutLoading && setShowConfirmModal(false)}>
          <div className="tpModalBox" onClick={e => e.stopPropagation()}>
            <div className="tpModalHeader">
              <h3 className="tpModalTitle">Konfirmasi Pesanan</h3>
              <button className="tpModalClose" onClick={() => setShowConfirmModal(false)}>✕</button>
            </div>
            
            <div className="tpModalContent">
              <div className="tpModalItemCard">
                <img src={selectedItem.imageUrl || logoUrl || ""} alt="Game" className="tpModalItemImg" />
                <div className="tpModalItemInfo">
                  <h5>{game.name}</h5>
                  <p>{selectedItem.name}</p>
                </div>
              </div>

              <div className="tpModalDetailList">
                <div className="tpModalDetailRow">
                  <span className="tpModalDetailLabel">Data Tujuan</span>
                  <span className="tpModalDetailValue">
                    {userId} {hasServer && server ? `(${server})` : ""}
                    {checkResult?.nickname && <div style={{ fontSize: 12, color: "#4ade80", marginTop: 4 }}>{checkResult.nickname}</div>}
                  </span>
                </div>
                
                <div className="tpModalDivider" />

                <div className="tpModalDetailRow">
                  <span className="tpModalDetailLabel">Harga Produk</span>
                  <span className="tpModalDetailValue">{rupiah(selectedItem.finalPrice)}</span>
                </div>
                <div className="tpModalDetailRow">
                  <span className="tpModalDetailLabel">Metode Bayar</span>
                  <span className="tpModalDetailValue">
                    {activePaymentType === "CarenCoin" ? "CarenCoin" : methodFees.find(x => x.id === selectedMethodId)?.label}
                  </span>
                </div>
                <div className="tpModalDetailRow">
                  <span className="tpModalDetailLabel">Biaya Layanan</span>
                  <span className="tpModalDetailValue">
                    {activePaymentType === "GATEWAY" && selectedMethodId
                      ? rupiah(getFeeAmount(selectedItem.finalPrice, methodFees.find(x => x.id === selectedMethodId)!))
                      : "Rp 0"}
                  </span>
                </div>
                {voucherApplied && voucherDiscount > 0 && (
                  <div className="tpModalDetailRow">
                    <span className="tpModalDetailLabel">Diskon Promo</span>
                    <span className="tpModalDetailValue success">-{rupiah(voucherDiscount)}</span>
                  </div>
                )}
                
                <div className="tpModalDivider" />
                
                <div className="tpModalDetailRow">
                  <span className="tpModalDetailLabel" style={{ fontSize: 16 }}>Total Bayar</span>
                  <span className="tpModalDetailValue highlight">{rupiah(totalToPayComputed)}</span>
                </div>
              </div>
            </div>

            <div className="tpModalFooter">
              <button 
                className="tpModalBtnCancel" 
                onClick={() => setShowConfirmModal(false)}
                disabled={checkoutLoading}
              >
                Batal
              </button>
              <button 
                className="tpModalBtnConfirm" 
                onClick={processCheckout}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? "Memproses..." : "Konfirmasi Pesanan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}