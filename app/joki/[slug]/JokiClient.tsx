"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { useToast } from "@/app/components/ToastProvider";

export type Audience = "PUBLIC" | "MEMBER" | "RESELLER";

type Props = {
  game: { id: string; key: string; name: string };
  audience?: Audience;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  publisher?: string;
};

type NominalRow = {
  id: string;
  name: string;
  group?: string | null;
  basePrice: number;
  finalPrice: number;
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
  const k = g.toUpperCase();
  if (k === "BEST_SELLER") return "Best Seller";
  if (k === "HEMAT") return "Hemat";
  if (k === "SULTAN") return "Sultan";
  return "Lainnya";
}

export default function JokiClient({
  game,
  audience: audienceProp,
  logoUrl,
  bannerUrl,
  publisher = "Professional Joki",
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
  const [paymentMethod, setPaymentMethod] = useState<"CarenCoin" | "Payment Gateway">("Payment Gateway");

  // Step 5 — Kontak
  const [contact, setContact] = useState("");

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

  const selectedItem = useMemo(() => nominals.find((x) => x.id === selectedId) || null, [selectedId, nominals]);

  const grouped = useMemo((): Array<[string, NominalRow[]]> => {
    const map = new Map<string, NominalRow[]>();
    for (const it of nominals) {
      const g = (it.group || "LAIN").toUpperCase();
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(it);
    }
    const order = ["BEST_SELLER", "HEMAT", "SULTAN", "LAIN"];
    return Array.from(map.entries()).sort((a, b) => {
      const ai = order.indexOf(a[0]);
      const bi = order.indexOf(b[0]);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
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
        paymentMethod: paymentMethod === "CarenCoin" ? "CARENCOIN" : "GATEWAY",
        loginVia,
        userIdNickname: userIdNickname.trim(),
        loginId: loginId.trim(),
        password: password.trim(),
        noteForJoki: noteForJoki.trim() || undefined,
        heroes: filteredHeroes,
      };

      if (selectedItem) {
        body.productId = selectedItem.id;
      } else {
        // Tidak ada nominal yang terpilih (game tanpa paket harga) — harga custom 0
        body.finalPayable = 0;
      }

      if (paymentMethod === "Payment Gateway") {
        body.paymentGateway = "TRIPAY";
        body.gatewayMethodKey = "QRIS";
      }

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
        <div className="spacer" />

        {/* Tab Switcher */}
        <div style={{
          display: "flex",
          background: "rgba(255,255,255,.06)",
          border: "1px solid rgba(255,255,255,.10)",
          borderRadius: 16,
          padding: 4,
          marginTop: 24,
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
      </div>

      <div style={{ height: 32 }} />      <div className="topupWrap">

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
                {grouped.map(([g, items]) => (
                  <div key={g} className="nominalGroup">
                    <div className="nominalGroupHeader">{groupTitle(g)}</div>
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
                                {/* High Fidelity Diamond Icon */}
                                <svg viewBox="0 0 24 24" fill="none" stroke="#4ed6ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M6 3h12l4 8-10 10L2 11l4-8z"></path>
                                  <path d="M12 3v18"></path>
                                  <path d="M2 11h20"></path>
                                  <path d="M6 3L12 11L18 3"></path>
                                </svg>
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

        <div className="spacer" />

        {/* Step 4 — Metode Pembayaran */}
        <div className="card" id="section-payment">
          <div className="contact-header">
            <div className="contact-step">4</div>
            <div className="contact-title-wrap">
              <h4 className="contact-title">Metode Pembayaran</h4>
            </div>
          </div>
          <div className="contact-body">
            <div className="row" style={{ flexWrap: "wrap" }}>
              {(["CarenCoin", "Payment Gateway"] as const).map((m) => (
                <button
                  key={m}
                  className="authBtn authBtnGhost"
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  style={{
                    borderColor: paymentMethod === m ? "rgba(59,130,246,.65)" : "rgba(255,255,255,.10)",
                    background: paymentMethod === m ? "rgba(59,130,246,.15)" : "rgba(255,255,255,.06)",
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="spacer" />
            <div className="cardMuted">Dipilih: {paymentMethod}</div>
          </div>
        </div>

        <div className="spacer" />

        {/* Step 5 — Kontak */}
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
              Kami akan mengirim update progress joki lewat kontak ini.
            </p>
          </div>
        </div>

        {submitErr && (
          <div style={{ marginTop: 12, color: "#f87171", fontWeight: 700, fontSize: 14 }}>
            ⚠️ {submitErr}
          </div>
        )}

        <div className="spacer" />
        <div className="spacer" />
      </div>

      <Footer />

      {/* Sticky Bar */}
      <div className="stickyWrap">
        <div className="stickyBar">
          <div className="stickyLeft">
            <div className="stickyStatus">{checkoutStatus}</div>
            <div className="stickyTotalRow">
              <div className="stickyLabel">Total</div>
              <div className="stickyTotal">
                {selectedItem ? rupiah(selectedItem.finalPrice) : "—"}
              </div>
            </div>
            <div className="stickyStatus" style={{ opacity: 0.85 }}>
              {selectedItem
                ? `${game.name} • ${selectedItem.name} • ${paymentMethod}`
                : `${game.name} • Joki`}
            </div>
          </div>

          <button
            className="stickyBtn"
            disabled={!canCheckout || submitting}
            onClick={onCheckout}
          >
            {submitting ? "Memproses..." : "Pesan Sekarang"}
          </button>
        </div>
      </div>
    </main>
  );
}
