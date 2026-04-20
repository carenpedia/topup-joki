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
  const [voucher, setVoucher] = useState("");
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [voucherMsg, setVoucherMsg] = useState("");

  const userId = targetInputs["userId"] || "";
  const server = targetInputs["server"] || "";
  const hasServer = targetConfig.fields.some((f) => f.key === "server");

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

  // Helper: calculate total displayed in button (nominal + payment fee)
  function getComputedTotal() {
    if (!selectedItem) return 0;
    if (activePaymentType === "CarenCoin") return selectedItem.finalPrice;
    const m = methodFees.find(x => x.id === selectedMethodId);
    if (!m) return selectedItem.finalPrice;
    return calculatePrice(selectedItem.finalPrice, m);
  }
  const totalToPayComputed = getComputedTotal();

  async function onCheckout() {
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

    if (!contact.trim()) {
      toast.critical("Harap masukkan nomer whatsapp/email kamu");
      scrollTo("section-contact");
      return;
    }

    await runCheckout(async () => {
      try {
        const body = {
          gameKey: game.key,
          productId: selectedItem.id,
          inputUserId: userId,
          inputServer: hasServer ? server : undefined,
          contactWhatsapp: contact,
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
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  </div>
                  <span>Aman & Terpercaya</span>
                </div>
                <div className="tpNewFeatureItem">
                  <div className="tpNewFeatureIcon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  </div>
                  <span>Layanan 24 Jam</span>
                </div>
                <div className="tpNewFeatureItem">
                  <div className="tpNewFeatureIcon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                  </div>
                  <span>Proses satset</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="topupWrap">
        {/* Tab Switcher (Restored) */}
        {hasJoki && (
          <div className="tpTabSwitcher" style={{ display: "flex", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.10)", borderRadius: 16, padding: 4, marginTop: 24 }}>
            <div style={{ flex: 1, textAlign: "center", padding: "11px 16px", borderRadius: 12, background: "linear-gradient(135deg, rgba(59,130,246,.95), rgba(37,99,235,.95))", color: "#fff", fontWeight: 800, fontSize: 14 }}>💎 Top Up</div>
            <Link href={`/joki/${game.key}`} style={{ flex: 1, textAlign: "center", padding: "11px 16px", color: "rgba(255,255,255,.60)", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>🎮 Joki</Link>
          </div>
        )}

        <div style={{ height: 32 }} />

        {/* Step 1: Account Data (Restored Attention Text) */}
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
                  <input className="contact-input" placeholder={f.label} value={targetInputs[f.key] || ""} onChange={(e) => setTargetInputs({ ...targetInputs, [f.key]: e.target.value })} />
                </div>
              ))}
            </div>
            <p style={{ margin: "10px 0 0", fontSize: 11, lineHeight: 1.4, color: "rgba(250,204,21,.7)", display: "flex", alignItems: "flex-start", gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(250,204,21,.8)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
              <span>Harap masukkan {targetConfig.fields.map((f) => f.label).join(" & ")} dengan benar, kesalahan input bukan tanggung jawab kami.</span>
            </p>
          </div>
        </div>

        <div className="spacer" />

        {/* Step 2: Nominals (Restored bottom border & Instant badge) */}
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
                      {p.flash && <span className="tpNomFlash">FLASH SALE</span>}
                      <div className="tpNomTop"><span className="tpNomName">{p.name}</span></div>
                      <div className="tpNomMain">
                        <div className="tpNomIcon">
                          {p.imageUrl ? <img src={p.imageUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <svg viewBox="0 0 24 24" fill="none" stroke="#4ed6ff" strokeWidth="2.5"><path d="M6 3h12l4 8-10 10L2 11l4-8z"></path><path d="M12 3v18"></path><path d="M2 11h20"></path><path d="M6 3L12 11L18 3"></path></svg>}
                        </div>
                        <span className="tpNomPriceNow">{rupiah(p.finalPrice).replace(",00", "").replace("Rp", "Rp ")}</span>
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

        {/* Step 3: Pilihan Pembayaran (Redesigned) */}
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
                      <div className="tpPayCategoryTitle">CarenCoin (Saldo)</div>
                    </div>
                    <div className="tpPayCategoryBalance" style={{ color: userBalance === 0 && audienceProp === "PUBLIC" ? "#f87171" : "#fff" }}>
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
                              Biaya: {selectedItem ? rupiah(getFeeAmount(selectedItem.finalPrice, m)) : "-"}
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
              <input className="contact-input" placeholder="Masukkan Kode Voucher" value={voucher} onChange={(e) => setVoucher(e.target.value)} />
              <button className="btn-ghost" style={{ padding: "0 20px" }} onClick={() => { setVoucherApplied(true); setVoucherMsg("Voucher dicek..."); }}>Pakai</button>
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
            <div className="contact-title-wrap"><h4 className="contact-title">Konfirmasi WhatsApp</h4></div>
          </div>
          <div className="contact-body">
            <input className="contact-input" placeholder="Masukkan Nomor WhatsApp (628...)" value={contact} onChange={(e) => setContact(e.target.value)} />
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 6, fontStyle: "italic" }}>
              Nomer ini akan dihubungi jika terjadi masalah
            </p>
          </div>
        </div>
      </div>

      <div style={{ height: 120 }} />

      {/* Sticky Checkout Bar (Restored) */}
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
                <div className="stickyInfoChevron">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"></polyline></svg>
                </div>
              </>
            ) : (
              <div className="stickyInfoText">Belum ada item produk yang dipilih.</div>
            )}
          </div>
          <div className="stickyAction">
            <button className="stickyBtn" disabled={checkoutLoading || !selectedItem} onClick={onCheckout}>
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
    </main>
  );
}