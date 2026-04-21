"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import ProductFaqAccordion from "@/app/components/ProductFaqAccordion";
import { useToast } from "@/app/components/ToastProvider";

export type Audience = "PUBLIC" | "MEMBER" | "RESELLER";

type Props = {
  game: { id: string; key: string; name: string };
  audience?: Audience;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  publisher?: string;
  gateways?: Record<string, boolean>;
  methodFees?: MethodFee[];
  userBalance?: number;
  carenCoinLogo?: string | null;
};

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

type NominalRow = {
  id: string;
  name: string;
  group?: string | null;
  category?: { id: string, name: string, order: number } | null;
  basePrice: number;
  finalPrice: number;
  imageUrl?: string | null;
};

const LOGIN_VIA_OPTIONS = [
  { value: "MOONTON", label: "Moonton ID" },
  { value: "GOOGLE", label: "Google" },
  { value: "FACEBOOK", label: "Facebook" },
  { value: "VK", label: "VK" },
  { value: "TIKTOK", label: "TikTok" },
  { value: "TELEGRAM", label: "Telegram" },
];

function rupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function groupTitle(g: string) {
  // Hanya tampilkan header jika itu kategori dinamis dari database
  if (g.startsWith("CAT:")) return g.replace("CAT:", "");

  // Header untuk grup bawaan (Hemat, Best Seller, dll) dihilangkan agar tidak terlihat dummy
  return null;
}

export default function JokiClient({
  game,
  audience: audienceProp,
  logoUrl,
  bannerUrl,
  publisher = "Professional Joki",
  gateways = { MIDTRANS: true, DUITKU: true, TRIPAY: true, XENDIT: true },
  methodFees = [],
  userBalance = 0,
  carenCoinLogo = null,
}: Props) {
  const router = useRouter();

  // Step 1 — Data Akun
  const [loginVia, setLoginVia] = useState("MOONTON");
  const [userIdNickname, setUserIdNickname] = useState("");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [noteForJoki, setNoteForJoki] = useState("");

  // Step 2 — Pilih Paket
  const [nominals, setNominals] = useState<NominalRow[]>([]);
  const [nominalLoading, setNominalLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Step 3 — Request Hero
  const [heroes, setHeroes] = useState<string[]>([""]);

  // Step 4 — Pembayaran
  const [activePaymentType, setActivePaymentType] = useState<"CARENCOIN" | "GATEWAY">("GATEWAY");
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [openCategory, setOpenCategory] = useState<string | null>("E-Wallet");

  // Step 5 — Voucher
  const [voucher, setVoucher] = useState("");
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [voucherMsg, setVoucherMsg] = useState("");

  // Step 6 — Kontak
  const [contact, setContact] = useState("");

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

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState("");
  const toast = useToast();

  // Smooth scroll helper
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const handlePackageSelect = (id: string) => {
    if (!userIdNickname.trim() || !loginId.trim() || !password.trim()) {
      toast.error("⚠️ Silakan lengkapi data akun Anda terlebih dahulu!");
      scrollTo("section-account");
      return;
    }

    setSelectedId(id);
    setTimeout(() => scrollTo("section-payment"), 100);
  };

  // Load nominals
  useEffect(() => {
    let alive = true;
    async function load() {
      setNominalLoading(true);
      try {
        const res = await fetch(`/api/topup/${game.key}/products?type=JOKI`, { cache: "no-store" });
        const j = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(j?.error || "Gagal load paket");
        const rows = Array.isArray(j?.rows) ? j.rows : [];
        if (alive) {
          setNominals(
            rows.map((p: any) => ({
              id: String(p.id),
              name: String(p.name),
              group: p.group ?? null,
              category: p.category ?? null,
              basePrice: Number(p.basePrice || 0),
              finalPrice: Number(p.finalPrice || 0),
            }))
          );
        }
      } catch {
        if (alive) setNominals([]);
      } finally {
        if (alive) setNominalLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [game.key]);

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

  const selectedItem = useMemo(() => nominals.find((x) => x.id === selectedId) || null, [selectedId, nominals]);

  // Helper: calculate total displayed in button (nominal + payment fee)
  function getComputedTotal() {
    if (!selectedItem) return 0;
    if (activePaymentType === "CARENCOIN") return selectedItem.finalPrice;
    const m = methodFees.find(x => x.id === selectedMethodId);
    if (!m) return selectedItem.finalPrice;
    return calculatePrice(selectedItem.finalPrice, m);
  }
  const totalToPayComputed = getComputedTotal();

  const grouped = useMemo((): Array<[string, NominalRow[]]> => {
    const map = new Map<string, NominalRow[]>();
    const orderMap = new Map<string, number>();

    for (const it of nominals) {
      let key = "";
      let sortVal = 999;

      if (it.category) {
        key = `CAT:${it.category.name}`;
        sortVal = it.category.order;
      } else {
        key = "NONE";
        sortVal = 9999;
      }

      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(it);
      orderMap.set(key, sortVal);
    }

    const result = Array.from(map.entries());

    // Sort items within each group
    for (const [, arr] of result) {
      arr.sort((a, b) => (a.finalPrice || 0) - (b.finalPrice || 0));
    }

    // Sort groups themselves by the assigned order
    result.sort((a, b) => {
      const orderA = orderMap.get(a[0]) ?? 9999;
      const orderB = orderMap.get(b[0]) ?? 9999;
      return orderA - orderB;
    });

    return result;
  }, [nominals]);

  function addHero() {
    setHeroes((h) => [...h, ""]);
  }
  function removeHero(i: number) {
    setHeroes((h) => h.filter((_, j) => j !== i));
  }
  function setHero(i: number, val: string) {
    setHeroes((h) => h.map((x, j) => (j === i ? val : x)));
  }

  const canCheckout = useMemo(() => {
    if (!userIdNickname.trim()) return false;
    if (!loginId.trim()) return false;
    if (!password.trim()) return false;
    if (!selectedItem && nominals.length > 0) return false;
    if (!contact.trim()) return false;
    return true;
  }, [userIdNickname, loginId, password, selectedItem, nominals.length, contact]);

  const checkoutStatus = useMemo(() => {
    if (!userIdNickname.trim()) return "Isi User ID & Nickname dulu";
    if (!loginId.trim()) return "Isi Login ID dulu";
    if (!password.trim()) return "Isi Password dulu";
    if (!selectedItem && nominals.length > 0) return "Pilih paket dulu";
    if (!contact.trim()) return "Isi kontak dulu";
    return "Siap order";
  }, [userIdNickname, loginId, password, selectedItem, nominals.length, contact]);

  async function onCheckout() {
    if (!canCheckout || submitting) return;
    setSubmitErr("");
    setSubmitting(true);

    try {
      const filteredHeroes = heroes.filter((h) => h.trim());
      const body: any = {
        gameKey: game.key,
        contactWhatsapp: contact,
        paymentMethod: activePaymentType,
        loginVia,
        userIdNickname: userIdNickname.trim(),
        loginId: loginId.trim(),
        password: password.trim(),
        noteForJoki: noteForJoki.trim() || undefined,
        heroes: filteredHeroes,
        voucherCode: voucherApplied ? voucher.trim().toUpperCase() : undefined,
      };

      if (selectedItem) {
        body.productId = selectedItem.id;
      } else {
        // Tidak ada nominal yang terpilih (game tanpa paket harga) — harga custom 0
        body.finalPayable = 0;
      }

      body.paymentMethod = activePaymentType;
      body.methodId = selectedMethodId;

      const res = await fetch("/api/checkout/joki", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSubmitErr(j?.error || `Gagal checkout (${res.status})`);
        return;
      }

      if (j.redirectUrl) {
        router.push(j.redirectUrl);
      } else if (j.paymentUrl) {
        window.location.href = j.paymentUrl;
      } else {
        router.push(`/invoice/${j.orderNo}`);
      }
    } catch (e: any) {
      setSubmitErr(e?.message || "Terjadi kesalahan, coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="topupPage">
      <Navbar />

      <div className="tpNewHero">
        <div className="tpNewHeroBanner">
          {bannerUrl ? (
            <img src={bannerUrl} alt={game.name} className="tpNewHeroBannerImg" />
          ) : (
            <div className="tpNewHeroBannerFallback" />
          )}
          <div className="tpNewHeroOverlay" />
        </div>

        <div className="topupWrap">
          <div className="tpNewHeroContent">
            <div className="tpNewHeroLogoCard">
              {logoUrl ? (
                <img src={logoUrl} alt={game.name} className="tpNewHeroLogoImg" />
              ) : (
                <div className="tpNewHeroLogoFallback">{game.name[0]}</div>
              )}
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
        <div className="spacer desktop-only" />

        {/* Tab Switcher */}
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
          <Link
            href={`/topup/${game.key}`}
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
            💎 Top Up
          </Link>
          <div style={{
            flex: 1,
            textAlign: "center",
            padding: "11px 16px",
            borderRadius: 12,
            background: "linear-gradient(135deg, rgba(139,92,246,.95), rgba(109,40,217,.95))",
            color: "#fff",
            fontWeight: 800,
            fontSize: 14,
            cursor: "default",
            boxShadow: "0 2px 14px rgba(139,92,246,.40)",
          }}>
            🎮 Joki
          </div>
        </div>

        <div className="tpMainLayout">
          <div className="tpLeftCol">
            {/* Step 1 — Data Akun */}
            <div className="card" id="section-account">
              <div className="contact-header">
                <div className="contact-step">1</div>
                <div className="contact-title-wrap">
                  <h4 className="contact-title">Masukkan Data Akun</h4>
                </div>
              </div>
              <div className="contact-body">
                <label className="contact-label">Login Via</label>
                <select
                  className="contact-input"
                  value={loginVia}
                  onChange={(e) => setLoginVia(e.target.value)}
                >
                  {LOGIN_VIA_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>

                <div className="spacer" />
                <label className="contact-label">User ID &amp; Nickname</label>
                <input
                  className="contact-input"
                  value={userIdNickname}
                  onChange={(e) => setUserIdNickname(e.target.value)}
                  placeholder="Contoh: 12345678 (NamaAkun)"
                />

                <div className="spacer" />
                <label className="contact-label">
                  {loginVia === "MOONTON" ? "Moonton ID / Email" : loginVia === "GOOGLE" ? "Email Google" : `${LOGIN_VIA_OPTIONS.find(o => o.value === loginVia)?.label || ""} ID / Email`}
                </label>
                <input
                  className="contact-input"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="Email / No. HP / ID akun"
                />

                <div className="spacer" />
                <label className="contact-label">Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    className="contact-input"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password akun game"
                    style={{ paddingRight: 48 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "rgba(255,255,255,.6)",
                      cursor: "pointer",
                      fontSize: 14,
                      padding: 0,
                    }}
                  >
                    {showPassword ? "Sembunyikan" : "Tampilkan"}
                  </button>
                </div>
                <p className="contact-hint">
                  ⚠️ Data akun kamu hanya digunakan untuk proses joki dan akan dijaga kerahasiaannya.
                </p>
                <p style={{
                  margin: "10px 0 0",
                  fontSize: 11,
                  lineHeight: 1.4,
                  color: "rgba(250,204,21,.7)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 6,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(250,204,21,.8)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <span>Harap masukkan ID Server dengan benar, kesalahan input bukan tanggung jawab kami.</span>
                </p>
              </div>
            </div>

            <div className="spacer" />

            {/* Step 2 — Request Hero */}
            <div className="card">
              <div className="contact-header">
                <div className="contact-step">2</div>
                <div className="contact-title-wrap">
                  <h4 className="contact-title">Request Hero (Opsional)</h4>
                </div>
              </div>
              <div className="contact-body">
                <label className="contact-label">Hero yang ingin dipakai penjoki</label>
                {heroes.map((h, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <input
                      className="contact-input"
                      value={h}
                      onChange={(e) => setHero(i, e.target.value)}
                      placeholder={`Nama hero ${i + 1}`}
                      style={{ flex: 1 }}
                    />
                    {heroes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeHero(i)}
                        style={{
                          background: "rgba(239,68,68,.15)",
                          border: "1px solid rgba(239,68,68,.4)",
                          color: "#f87171",
                          borderRadius: 10,
                          padding: "0 14px",
                          cursor: "pointer",
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addHero}
                  style={{
                    background: "rgba(59,130,246,.12)",
                    border: "1px solid rgba(59,130,246,.35)",
                    color: "rgba(147,197,253,.9)",
                    borderRadius: 10,
                    padding: "8px 16px",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 13,
                    marginTop: 4,
                  }}
                >
                  + Tambah Hero
                </button>

                <div className="spacer" />
                <label className="contact-label">Catatan untuk Penjoki (opsional)</label>
                <textarea
                  className="contact-input"
                  value={noteForJoki}
                  onChange={(e) => setNoteForJoki(e.target.value)}
                  placeholder="Contoh: Push ke Mythic, mainkan agresif, dll."
                  rows={3}
                  style={{ resize: "vertical" }}
                />
              </div>
            </div>

            <div className="spacer" />

            {/* Step 3 — Pilih Paket */}
            <div className="card" id="section-package">
              <div className="contact-header">
                <div className="contact-step">3</div>
                <div className="contact-title-wrap">
                  <h4 className="contact-title">Pilih Paket Joki</h4>
                </div>
              </div>
              <div className="contact-body">
                {nominalLoading ? (
                  <div className="cardMuted">Memuat paket...</div>
                ) : nominals.length === 0 ? (
                  <div className="cardMuted">Belum ada paket harga untuk game ini. Hubungi admin untuk info harga.</div>
                ) : (
                  <div className="nominalGroups">
                    {grouped.map(([g, items]) => {
                      const title = groupTitle(g);
                      return (
                        <div key={g} className="nominalGroup" style={{ marginBottom: 24 }}>
                          {title && <div className="nominalGroupHeader">{title}</div>}
                          <div className="tpNomGrid">
                            {items.map((p) => {
                              const active = selectedId === p.id;
                              return (
                                <button
                                  key={p.id}
                                  type="button"
                                  className={`tpNomCard ${active ? "isActive" : ""}`}
                                  onClick={() => handlePackageSelect(p.id)}
                                >
                                  <div className="tpNomTop">
                                    <span className="tpNomName">{p.name}</span>
                                  </div>

                                  <div className="tpNomMain">
                                    <div className="tpNomIcon">
                                      {p.imageUrl ? (
                                        <img src={p.imageUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                                      ) : (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="#4ed6ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M6 3h12l4 8-10 10L2 11l4-8z"></path>
                                          <path d="M12 3v18"></path>
                                          <path d="M2 11h20"></path>
                                          <path d="M6 3L12 11L18 3"></path>
                                        </svg>
                                      )}
                                    </div>
                                    <span className="tpNomPriceNow">
                                      {rupiah(p.finalPrice).replace(",00", "").replace("Rp", "Rp ")}
                                    </span>
                                  </div>

                                  <div className="tpNomBottom">
                                    <div className="tpInstanBadge">
                                      <svg viewBox="0 0 24 24">
                                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                                      </svg>
                                      <span className="tpInstanText">Instan</span>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="spacer" />

            {/* Step 4 — Pilihan Pembayaran */}
            <div className="card" id="section-payment">
              <div className="contact-header">
                <div className="contact-step">4</div>
                <div className="contact-title-wrap">
                  <h4 className="contact-title">Pilih Pembayaran</h4>
                </div>
              </div>
              <div className="contact-body">
                <div className="tpPayAccordion">
                  {/* Special CarenCoin Category */}
                  <div className={`tpPayCategory premium-cat ${activePaymentType === "CARENCOIN" ? "isSelected" : ""}`}>
                    <div className="tpRibbon">BEST PRICE</div>
                    <button
                      className="tpPayCategoryHeader caren-header"
                      onClick={() => { setActivePaymentType("CARENCOIN"); setSelectedMethodId(null); }}
                    >
                      <div className="tpPayHeaderTop">
                        <div className="caren-left-group">
                          <div className="tpPayCategoryIcon caren-icon">
                            {carenCoinLogo ? <img src={carenCoinLogo} alt="CC" style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : "🪙"}
                          </div>
                          <div className="tpPayCategorySubTitle">
                            <div className="tpPayCategoryTitle" style={{ fontSize: '13px' }}>CarenCoin</div>
                            <div className="tpPayCategoryBalance" style={{ color: userBalance === 0 && audienceProp === "PUBLIC" ? "#f87171" : "#fff" }}>
                              {userBalance === 0 && audienceProp === "PUBLIC" ? "Max. Rp 0" : rupiah(userBalance)}
                            </div>
                          </div>
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

            {/* Step 5 — Voucher */}
            <div className="card">
              <div className="contact-header">
                <div className="contact-step">5</div>
                <div className="contact-title-wrap">
                  <h4 className="contact-title">Kode Voucher</h4>
                </div>
              </div>
              <div className="contact-body">
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    className="contact-input"
                    placeholder="Masukkan Kode Voucher"
                    value={voucher}
                    onChange={(e) => setVoucher(e.target.value)}
                  />
                  <button
                    className="btn-promo"
                    onClick={() => {
                      setVoucherApplied(true);
                      setVoucherMsg("Voucher dicek...");
                    }}
                  >
                    Gunakan
                  </button>
                </div>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 6, fontStyle: "italic" }}>
                  Masukkan kode promo jika ada (Opsional)
                </p>
                {voucherMsg && (
                  <div style={{ fontSize: 11, marginTop: 4, color: "#3b82f6" }}>
                    {voucherMsg}
                  </div>
                )}
              </div>
            </div>

            <div className="spacer" />

            {/* Step 6 — Kontak */}
            <div className="card">
              <div className="contact-header">
                <div className="contact-step">6</div>
                <div className="contact-title-wrap">
                  <h4 className="contact-title">Detail Kontak</h4>
                </div>
              </div>
              <div className="contact-body">
                <label className="contact-label">No. WhatsApp / Email</label>
                <input
                  className="contact-input"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Masukkan No. WhatsApp / email"
                />
                <p className="contact-hint">
                  Kami akan mengirim update progress joki lewat kontak ini.
                </p>
              </div>
            </div>

            {submitErr && (
              <div style={{ marginTop: 12, color: "#f87171", fontWeight: 700, fontSize: 14 }}>
                ⚠️ {submitErr}
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
                  <b>{activePaymentType === "CARENCOIN" ? "CarenCoin" : (methodFees.find(x => x.id === selectedMethodId)?.label || "-")}</b>
                </div>
                <div className="tpSideRow">
                  <span>Biaya Layanan</span>
                  <b>
                    {selectedItem && activePaymentType === "GATEWAY" && selectedMethodId
                      ? rupiah(getFeeAmount(selectedItem.finalPrice, methodFees.find(x => x.id === selectedMethodId)!))
                      : "Rp 0"}
                  </b>
                </div>
              </div>

              <div className="tpSideTotal">
                <div className="tpSideTotalLabel">Total Pembayaran</div>
                <div className="tpSideTotalValue">{selectedItem ? rupiah(totalToPayComputed) : "Rp 0"}</div>
              </div>

              <button className="tpBtnCheckoutSide" disabled={submitting || !selectedItem} onClick={onCheckout}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                {submitting ? "Memproses..." : "Pesan Sekarang"}
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
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

      <ProductFaqAccordion />
      <Footer />

      {/* Sticky Bar */}
      <div className="stickyWrap">
        <div className="stickyCard">
          <div className={`stickyInfoBox ${selectedItem ? 'isFilled' : 'isEmpty'}`}>
            {!selectedItem ? (
              <div className="stickyInfoText">
                Belum ada paket joki yang dipilih.
              </div>
            ) : (
              <>
                {logoUrl ? (
                  <img src={logoUrl} alt={game.name} className="stickyInfoLogo" />
                ) : (
                  <div className="stickyInfoLogo" style={{ background: 'rgba(255,255,255,0.1)', display: 'grid', placeItems: 'center', fontSize: 20 }}>
                    {game.name[0]}
                  </div>
                )}
                <div className="stickyInfoContent">
                  <div className="stickyInfoGame">{game.name}</div>
                  <div className="stickyInfoProduct">{selectedItem.name}</div>
                </div>
                <div className="stickyInfoChevron">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"></path></svg>
                </div>
              </>
            )}
          </div>

          <div className="stickyAction">
            <button
              className="stickyBtn"
              disabled={!canCheckout || submitting}
              onClick={onCheckout}
            >
              <div className="stickyBtnIcon">
                {submitting ? (
                  <div className="spinner-border spinner-border-sm" role="status" style={{ width: 16, height: 16, border: '2px solid' }}></div>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 8h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z" />
                    <path d="M16 10V6a4 4 0 0 0-8 0v4" />
                  </svg>
                )}
              </div>
              {submitting ? "Memproses..." : "Pesan Sekarang!"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
