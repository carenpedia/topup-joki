"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { useToast } from "@/app/components/ToastProvider";
import { useAsyncAction } from "@/app/components/useAsyncAction";
import { getTargetConfig } from "@/lib/targetConfig";

export type Audience = "PUBLIC" | "MEMBER" | "RESELLER";
type PaymentMethod = "CarenCoin" | "Payment Gateway";

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

type ApiFlash = {
  id: string;
  flashPrice: number;
  endAt?: string;
};

type ApiRow = {
  id: string;
  name: string;
  group?: string | null;
  category?: { id: string, name: string, order: number } | null;
  basePrice: number;
  finalPrice: number;
  imageUrl?: string | null;
  flash?: ApiFlash | null;
};

type ApiResponse = {
  rows?: ApiRow[];
  audience?: Audience;
  error?: string;
};

function rupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function isLikelyEmail(v: string) {
  return /@/.test(v);
}

function normalizePhone(input: string) {
  let v = input.replace(/[^\d+]/g, "");
  if (v.startsWith("08")) v = "+62" + v.slice(1);
  if (v.startsWith("62")) v = "+62" + v.slice(2);
  return v;
}

function groupTitle(g: string) {
  // Hanya tampilkan header jika itu kategori dinamis dari database
  if (g.startsWith("CAT:")) return g.replace("CAT:", "");

  // Header untuk grup bawaan (Hemat, Best Seller, dll) dihilangkan agar tidak terlihat dummy
  return null;
}

export default function TopupClient({
  game,
  audience: audienceProp,
  logoUrl,
  bannerUrl,
  publisher = "Official Publisher",
  hasJoki = false,
  targetType = "DEFAULT",
}: Props) {
  const router = useRouter();
  const targetConfig = getTargetConfig(targetType);
  const [targetInputs, setTargetInputs] = useState<Record<string, string>>({});

  // Helper: update satu field di targetInputs
  function setTargetField(key: string, value: string) {
    setTargetInputs((prev) => ({ ...prev, [key]: value }));
  }

  // Backward compat shortcuts
  const userId = targetInputs["userId"] || "";
  const server = targetInputs["server"] || "";

  const [audience, setAudience] = useState<Audience>(audienceProp || "PUBLIC");
  const [nominals, setNominals] = useState<NominalRow[]>([]);
  const [nominalLoading, setNominalLoading] = useState(false);
  const [nominalErr, setNominalErr] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("Payment Gateway");

  const [voucher, setVoucher] = useState("");
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [voucherMsg, setVoucherMsg] = useState("");

  const [contact, setContact] = useState("");

  const hasServer = targetConfig.fields.some((f) => f.key === "server");

  useEffect(() => {
    let alive = true;

    async function loadNominals() {
      setNominalLoading(true);
      setNominalErr("");

      try {
        const res = await fetch(`/api/topup/${game.key}/products?type=TOPUP`, {
          cache: "no-store",
        });
        const j = (await res.json().catch(() => ({}))) as ApiResponse;

        if (!res.ok) {
          throw new Error(j?.error || "Gagal load nominal dari DB");
        }

        const rowsRaw = Array.isArray(j?.rows) ? j.rows : [];
        const aud = (j?.audience || audienceProp || "PUBLIC") as Audience;

        const rows: NominalRow[] = rowsRaw.map((p) => ({
          id: String(p.id),
          name: String(p.name),
          group: p.group ?? null,
          category: p.category ?? null,
          basePrice: Number(p.basePrice || 0),
          finalPrice: Number(p.finalPrice || 0),
          flash: p.flash
            ? {
              id: String(p.flash.id),
              flashPrice: Number(p.flash.flashPrice || 0),
              endAt: p.flash.endAt ? String(p.flash.endAt) : undefined,
            }
            : null,
        }));

        if (!alive) return;

        setAudience(aud);
        setNominals(rows);

        if (selectedItemId && !rows.some((x) => x.id === selectedItemId)) {
          setSelectedItemId(null);
        }
      } catch (e: unknown) {
        if (!alive) return;
        const msg = e instanceof Error ? e.message : "Gagal load nominal";
        setNominalErr(msg);
      } finally {
        if (alive) setNominalLoading(false);
      }
    }

    loadNominals();

    return () => {
      alive = false;
    };
  }, [game.key, audienceProp]);

  const selectedItem = useMemo(() => {
    if (!selectedItemId) return null;
    return nominals.find((x) => x.id === selectedItemId) || null;
  }, [selectedItemId, nominals]);

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
        // Gabungkan semua yang tidak punya kategori ke satu grup tunggal "NONE"
        // Ini memastikan mereka tidak terpisah-pisah dan bisa diurutkan harga dari terkecil ke terbesar secara global
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
      arr.sort((a, b) => {
        const af = a.flash ? 0 : 1;
        const bf = b.flash ? 0 : 1;
        if (af !== bf) return af - bf;
        return (a.finalPrice || 0) - (b.finalPrice || 0);
      });
    }

    // Sort groups themselves by the assigned order
    result.sort((a, b) => {
      const orderA = orderMap.get(a[0]) ?? 9999;
      const orderB = orderMap.get(b[0]) ?? 9999;
      return orderA - orderB;
    });

    return result;
  }, [nominals]);

  const total = useMemo(() => {
    if (!selectedItem) return 0;
    return Number(selectedItem.finalPrice || 0);
  }, [selectedItem]);

  const checkoutStatus = useMemo(() => {
    for (const f of targetConfig.fields) {
      if (f.required && !(targetInputs[f.key] || "").trim()) return `Isi ${f.label} dulu`;
    }
    if (!selectedItem) return "Pilih nominal dulu";
    if (!paymentMethod) return "Pilih metode bayar dulu";
    if (!contact.trim()) return "Isi kontak dulu";
    return "Siap checkout";
  }, [targetInputs, targetConfig, selectedItem, paymentMethod, contact]);

  const canCheckout = useMemo(() => {
    for (const f of targetConfig.fields) {
      if (f.required && !(targetInputs[f.key] || "").trim()) return false;
    }
    if (!selectedItem) return false;
    if (!paymentMethod) return false;
    if (!contact.trim()) return false;
    return true;
  }, [targetInputs, targetConfig, selectedItem, paymentMethod, contact]);

  function applyVoucher() {
    const code = voucher.trim().toUpperCase();

    if (!code) {
      setVoucherApplied(false);
      setVoucherMsg("Masukkan kode voucher dulu.");
      return;
    }

    const ok = /^[A-Z0-9-]{4,20}$/.test(code);
    if (!ok) {
      setVoucherApplied(false);
      setVoucherMsg("Format voucher tidak valid.");
      return;
    }

    setVoucherApplied(true);
    setVoucherMsg(`Voucher diterapkan: ${code} (diskon nanti menyusul)`);
  }

  useEffect(() => {
    setVoucherApplied(false);
    setVoucherMsg("");
  }, [voucher]);

  const contactDisplay = useMemo(() => {
    const v = contact.trim();
    if (!v) return "";
    if (isLikelyEmail(v)) return v;
    return normalizePhone(v);
  }, [contact]);

  const toast = useToast();
  const { loading: checkoutLoading, run: runCheckout } = useAsyncAction();

  async function onCheckout() {
    if (!canCheckout) return;

    await runCheckout(async () => {
      try {
        const body = {
          gameKey: game.key,
          productId: selectedItem?.id,
          inputUserId: userId,
          inputServer: hasServer ? server : undefined,
          contactWhatsapp: contactDisplay,
          paymentMethod: paymentMethod === "CarenCoin" ? "CARENCOIN" : "GATEWAY",
          paymentGateway: paymentMethod === "Payment Gateway" ? "TRIPAY" : undefined,
          gatewayMethodKey: paymentMethod === "Payment Gateway" ? "QRIS" : undefined,
          voucherCode: voucherApplied ? voucher.trim().toUpperCase() : undefined,
        };

        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Gagal melakukan checkout");
        }

        toast.success("Pesanan berhasil dibuat!");
        
        // Redirect ke invoice atau URL pembayaran
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
        } else if (data.redirectUrl) {
          router.push(data.redirectUrl);
        } else if (data.orderNo) {
          router.push(`/invoice/${data.orderNo}`);
        }
      } catch (err: any) {
        toast.error(err.message || "Gagal membuat pesanan");
      }
    });
  }

  // Smooth scroll helper
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 100; // avoid fixed header if any
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

  const handleProductSelect = (id: string) => {
    const firstField = targetConfig.fields[0];
    if (firstField && !(targetInputs[firstField.key] || "").trim()) {
      toast.error(`⚠️ Silakan masukkan ${firstField.label} Anda terlebih dahulu!`);
      scrollTo("section-id");
      return;
    }
    
    setSelectedItemId(id);
    // Give state a moment to update/react before scrolling? Usually immediate is fine
    setTimeout(() => scrollTo("section-payment"), 100);
  };

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
        <div className="spacer" />

        {/* Tab Switcher: Top Up / Joki */}
        {hasJoki && (
          <div style={{
            display: "flex",
            background: "rgba(255,255,255,.06)",
            border: "1px solid rgba(255,255,255,.10)",
            borderRadius: 16,
            padding: 4,
            marginTop: 24,
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
              cursor: "default",
              boxShadow: "0 2px 14px rgba(59,130,246,.40)",
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
              🎮 Joki
            </Link>
          </div>
        )}
      </div>

      <div style={{ height: 32 }} />

      <div className="topupWrap">
        <div className="card" id="section-id">
          <div className="contact-header">
            <div className="contact-step">1</div>
            <div className="contact-title-wrap">
              <h4 className="contact-title">Masukkan Data Akun</h4>
            </div>
          </div>

          <div className="contact-body">
            {targetConfig.fields.map((field, idx) => (
              <div key={field.key}>
                {idx > 0 && <div className="spacer" />}
                <label className="contact-label">{field.label}</label>
                {field.type === "select" && field.options ? (
                  <select
                    className="contact-input"
                    value={targetInputs[field.key] || ""}
                    onChange={(e) => setTargetField(field.key, e.target.value)}
                  >
                    <option value="">-- Pilih {field.label} --</option>
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="contact-input"
                    value={targetInputs[field.key] || ""}
                    onChange={(e) => setTargetField(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    inputMode={field.inputMode || "text"}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="spacer" />

        <div className="card" id="section-nominal">
          <div className="contact-header">
            <div className="contact-step">2</div>
            <div className="contact-title-wrap">
              <h4 className="contact-title">Pilih Nominal</h4>
            </div>
          </div>

          <div className="contact-body">
            <div className="tpNomWrap">
              {nominalLoading ? (
                <div className="cardMuted" style={{ fontWeight: 900 }}>
                  Loading nominal...
                </div>
              ) : nominals.length === 0 ? (
                <div className="cardMuted" style={{ fontWeight: 900 }}>
                  Belum ada nominal untuk game ini. (Isi dari admin Products +
                  Prices)
                </div>
              ) : (
                <div className="nominalGroups">
                  {nominalErr ? (
                    <div
                      className="cardMuted"
                      style={{ fontWeight: 900, marginBottom: 10 }}
                    >
                      {nominalErr}
                    </div>
                  ) : null}

                  {grouped.map(([g, items]) => (
                    <div key={g} className="nominalGroup">
                      {groupTitle(g) && (
                        <div className="nominalGroupHeader">
                          {groupTitle(g)}
                        </div>
                      )}

                      <div className="tpNomGrid">
                        {items.map((p) => {
                          const active = selectedItemId === p.id;
                          const isFlash = !!p.flash;

                          return (
                            <button
                              key={p.id}
                              type="button"
                              className={`tpNomCard ${active ? "isActive" : ""
                                }`}
                              onClick={() => handleProductSelect(p.id)}
                            >
                              {isFlash ? (
                                <span className="tpNomFlash">FLASH SALE</span>
                              ) : null}

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
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="spacer" />

        <div className="card" id="section-payment">
          <div className="contact-header">
            <div className="contact-step">3</div>
            <div className="contact-title-wrap">
              <h4 className="contact-title">Metode Pembayaran</h4>
            </div>
          </div>

          <div className="contact-body">
            <div className="row" style={{ flexWrap: "wrap" }}>
              <button
                className="authBtn authBtnGhost"
                type="button"
                onClick={() => setPaymentMethod("CarenCoin")}
                style={{
                  borderColor:
                    paymentMethod === "CarenCoin"
                      ? "rgba(59,130,246,.65)"
                      : "rgba(255,255,255,.10)",
                  background:
                    paymentMethod === "CarenCoin"
                      ? "rgba(59,130,246,.15)"
                      : "rgba(255,255,255,.06)",
                }}
              >
                CarenCoin
              </button>

              <button
                className="authBtn authBtnGhost"
                type="button"
                onClick={() => setPaymentMethod("Payment Gateway")}
                style={{
                  borderColor:
                    paymentMethod === "Payment Gateway"
                      ? "rgba(59,130,246,.65)"
                      : "rgba(255,255,255,.10)",
                  background:
                    paymentMethod === "Payment Gateway"
                      ? "rgba(59,130,246,.15)"
                      : "rgba(255,255,255,.06)",
                }}
              >
                Payment Gateway
              </button>
            </div>

            <div className="spacer" />
            <div className="cardMuted">Dipilih: {paymentMethod}</div>
          </div>
        </div>

        <div className="spacer" />

        <div className="card">
          <div className="contact-header">
            <div className="contact-step">4</div>
            <div className="contact-title-wrap">
              <h4 className="contact-title">Kode Voucher</h4>
            </div>
          </div>

          <div className="contact-body">
            <label className="contact-label">Voucher (opsional)</label>

            <div className="row" style={{ alignItems: "center" }}>
              <input
                className="contact-input"
                value={voucher}
                onChange={(e) => setVoucher(e.target.value)}
                placeholder="Contoh: PROMO10"
              />

              <button
                className="authBtn"
                type="button"
                onClick={applyVoucher}
                style={{
                  background: "rgba(59,130,246,.95)",
                  color: "#fff",
                  padding: "12px 14px",
                  borderRadius: 14,
                  fontWeight: 950,
                  whiteSpace: "nowrap",
                }}
              >
                Terapkan
              </button>
            </div>

            {voucherMsg ? (
              <div
                className="cardMuted"
                style={{
                  marginTop: 10,
                  color: voucherApplied
                    ? "rgba(167,243,208,.95)"
                    : "rgba(229,231,235,.70)",
                }}
              >
                {voucherApplied ? "✅ " : "⚠️ "}
                {voucherMsg}
              </div>
            ) : null}
          </div>
        </div>

        <div className="spacer" />

        <div className="card">
          <div className="contact-header">
            <div className="contact-step">5</div>
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
              Contoh: +62 8983xxxxxx atau carenpedia@gmail.com
            </p>
          </div>
        </div>

        <div className="spacer" />
        <div className="spacer" />
      </div>
      <Footer />

      <div className="stickyWrap">
        <div className="stickyCard">
          <div className={`stickyInfoBox ${selectedItem ? 'isFilled' : 'isEmpty'}`}>
            {!selectedItem ? (
              <div className="stickyInfoText">
                Belum ada item produk yang dipilih.
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
              disabled={!canCheckout || checkoutLoading}
              onClick={onCheckout}
            >
              <div className="stickyBtnIcon">
                {checkoutLoading ? (
                  <div className="spinner-border spinner-border-sm" role="status" style={{ width: 16, height: 16, border: '2px solid' }}></div>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 8h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z" />
                    <path d="M16 10V6a4 4 0 0 0-8 0v4" />
                  </svg>
                )}
              </div>
              {checkoutLoading ? "Memproses..." : "Pesan Sekarang!"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}