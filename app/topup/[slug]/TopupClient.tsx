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
            flash: p.flash
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
    return Array.from(map.entries()).sort((a,b) => a[0].localeCompare(b[0]));
  }, [nominals]);

  // Grouped Gateway Methods
  const groupedMethods = useMemo(() => {
    const map = new Map<string, MethodFee[]>();
    for (const m of methodFees) {
      // Filter by enabled gateway settings
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
    if (!selectedItem) return toast.error("Pilih nominal produk dulu.");
    if (activePaymentType === "GATEWAY" && !selectedMethodId) return toast.error("Pilih metode pembayaran.");
    if (!contact.trim()) return toast.error("Masukkan nomor WhatsApp Anda.");

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

  return (
    <main className="topupPage">
      <Script 
        src="https://app.sandbox.midtrans.com/snap/snap.js" 
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
      />
      <Navbar />

      {/* Hero Banner Section */}
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
            </div>
          </div>
        </div>
      </div>

      <div className="topupWrap">
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
                  <input className="contact-input" placeholder={f.label} value={targetInputs[f.key]||""} onChange={(e)=>setTargetInputs({...targetInputs, [f.key]: e.target.value})} />
                </div>
              ))}
            </div>
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
            {nominalLoading ? <div>Loading...</div> : groupedNominals.map(([g, items]) => (
              <div key={g} className="nominalGroup" style={{ marginBottom: 24 }}>
                <div className="nominalGroupHeader">{g.replace("CAT:", "")}</div>
                <div className="tpNomGrid">
                  {items.map((p) => (
                    <button key={p.id} className={`tpNomCard ${selectedItemId === p.id ? "isActive" : ""}`} onClick={() => { setSelectedItemId(p.id); scrollTo("section-payment"); }}>
                      <div className="tpNomTop"><span className="tpNomName">{p.name}</span></div>
                      <div className="tpNomMain"><span className="tpNomPriceNow">{rupiah(p.finalPrice)}</span></div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="spacer" />

        {/* Step 3: Payment Accordion */}
        <div className="card" id="section-payment">
          <div className="contact-header">
            <div className="contact-step">3</div>
            <div className="contact-title-wrap"><h4 className="contact-title">Metode Pembayaran</h4></div>
          </div>
          <div className="contact-body">
            <div className="tpPayAccordion">
              {/* Carencoin Option (Simplified) */}
              <div className={`tpPayCategory ${activePaymentType === "CarenCoin" ? "isOpen" : ""}`}>
                <button className="tpPayCategoryHeader" onClick={() => { setActivePaymentType("CarenCoin"); setSelectedMethodId(null); }}>
                  <div className="tpPayCategoryIcon">🪙</div>
                  <div className="tpPayCategoryTitle">CarenCoin (Saldo)</div>
                </button>
              </div>

              {/* Gateway Categories */}
              {groupedMethods.map(([cat, methods]) => (
                <div key={cat} className={`tpPayCategory ${openCategory === cat && activePaymentType === "GATEWAY" ? "isOpen" : ""}`}>
                  <button className="tpPayCategoryHeader" onClick={() => { setOpenCategory(openCategory === cat ? null : cat); setActivePaymentType("GATEWAY"); }}>
                    <div className="tpPayCategoryIcon">
                      {cat === "E-Wallet" ? "📱" : cat === "Virtual Account" ? "🏛️" : cat === "QRIS" ? "🤳" : "💳"}
                    </div>
                    <div className="tpPayCategoryTitle">{cat}</div>
                    <div className="tpPayCategoryChevron">▼</div>
                  </button>
                  <div className="tpPayCategoryContent">
                    <div className="tpPayInnerList">
                      {methods.map(m => (
                        <button 
                          key={m.id} 
                          className={`tpMethodBtn ${selectedMethodId === m.id ? "isSelected" : ""}`}
                          onClick={() => setSelectedMethodId(m.id)}
                        >
                          <div className="tpMethodLogoWrap">
                            {m.image ? <img src={m.image} alt={m.label} className="tpMethodLogo" /> : <span className="tpMethodLogoFallback">{m.label[0]}</span>}
                          </div>
                          <div className="tpMethodInfo">
                            <span className="tpMethodName">{m.label}</span>
                            <span className="tpMethodPrice">
                              {selectedItem ? rupiah(calculatePrice(selectedItem.finalPrice, m)) : "Pilih nominal"}
                            </span>
                          </div>
                          <div className="tpMethodCheck">✓</div>
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

        {/* Step 4: Checkout Action */}
        <div className="card">
          <div className="contact-header">
            <div className="contact-step">4</div>
            <div className="contact-title-wrap"><h4 className="contact-title">Pembayaran</h4></div>
          </div>
          <div className="contact-body">
            <input className="contact-input" placeholder="Nomor WhatsApp (628...)" value={contact} onChange={(e)=>setContact(e.target.value)} style={{ marginBottom: 12 }} />
            <div style={{ display: "flex", gap: 10 }}>
              <input className="contact-input" placeholder="Kode Voucher" value={voucher} onChange={(e)=>setVoucher(e.target.value)} />
              <button className="btn-ghost" style={{ padding: "0 20px" }} onClick={() => {setVoucherApplied(true); setVoucherMsg("Voucher dicek...");}}>Pakai</button>
            </div>
            {voucherMsg && <div style={{ fontSize: 11, marginTop: 4, color: "#3b82f6" }}>{voucherMsg}</div>}
            
            <button className="stickyBtn" style={{ marginTop: 24, padding: "16px" }} disabled={checkoutLoading} onClick={onCheckout}>
              {checkoutLoading ? "Memproses..." : `Beli Sekarang — ${selectedItem ? rupiah(totalToPayComputed) : "Pilih Nominal"}`}
            </button>
          </div>
        </div>
      </div>
      <div style={{ height: 80 }} />
      <Footer />
    </main>
  );
}