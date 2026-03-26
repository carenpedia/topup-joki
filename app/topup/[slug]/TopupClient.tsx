"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

type Audience = "PUBLIC" | "MEMBER" | "RESELLER";
type PaymentMethod = "CarenCoin" | "Payment Gateway";

type Props = {
  game: {
    id: string;
    key: string;
    name: string;
  };
  audience?: Audience;
  heroImage?: string | null;
  publisher?: string;
  hasJoki?: boolean;
};

type NominalRow = {
  id: string;
  name: string;
  group?: string | null;
  basePrice: number;
  finalPrice: number;
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
  basePrice: number;
  finalPrice: number;
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
  const k = g.toUpperCase();
  if (k === "BEST_SELLER") return "Best Seller";
  if (k === "HEMAT") return "Hemat";
  if (k === "SULTAN") return "Sultan";
  return "Lainnya";
}

export default function TopupClient({
  game,
  audience: audienceProp,
  heroImage,
  publisher = "Official Publisher",
  hasJoki = false,
}: Props) {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [server, setServer] = useState("");

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

  const isML = game.key === "mobile-legends";

  useEffect(() => {
    let alive = true;

    async function loadNominals() {
      setNominalLoading(true);
      setNominalErr("");

      try {
        const res = await fetch(`/api/topup/${game.key}/products`, {
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

    for (const it of nominals) {
      const g = (it.group || "LAIN").toUpperCase();
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(it);
    }

    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => {
        const af = a.flash ? 0 : 1;
        const bf = b.flash ? 0 : 1;
        if (af !== bf) return af - bf;
        return (a.finalPrice || 0) - (b.finalPrice || 0);
      });
      map.set(k, arr);
    }

    const order = ["BEST_SELLER", "HEMAT", "SULTAN", "LAIN"];

    return Array.from(map.entries()).sort((a, b) => {
      const ai = order.indexOf(a[0]);
      const bi = order.indexOf(b[0]);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
  }, [nominals]);

  const total = useMemo(() => {
    if (!selectedItem) return 0;
    return Number(selectedItem.finalPrice || 0);
  }, [selectedItem]);

  const checkoutStatus = useMemo(() => {
    if (!userId.trim()) return "Isi User ID dulu";
    if (isML && !server.trim()) return "Isi Server (khusus ML) dulu";
    if (!selectedItem) return "Pilih nominal dulu";
    if (!paymentMethod) return "Pilih metode bayar dulu";
    if (!contact.trim()) return "Isi kontak dulu";
    return "Siap checkout";
  }, [userId, server, isML, selectedItem, paymentMethod, contact]);

  const canCheckout = useMemo(() => {
    if (!userId.trim()) return false;
    if (isML && !server.trim()) return false;
    if (!selectedItem) return false;
    if (!paymentMethod) return false;
    if (!contact.trim()) return false;
    return true;
  }, [userId, server, isML, selectedItem, paymentMethod, contact]);

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

  function onCheckout() {
    alert(
      [
        `GAME: ${game.name}`,
        `USER ID: ${userId}${isML ? ` (${server})` : ""}`,
        `NOMINAL: ${selectedItem?.name ?? "-"}`,
        `PAY: ${paymentMethod}`,
        `VOUCHER: ${voucherApplied ? voucher.trim().toUpperCase() : "-"}`,
        `KONTAK: ${contactDisplay || "-"}`,
        `TOTAL: ${total > 0 ? rupiah(total) : "-"}`,
      ].join("\n")
    );
  }

  return (
    <main className="topupPage">
      <Navbar />
      <div className="topupWrap">

        <div className="spacer" />

        <div className="tpGameStrip">
          <div className="tpGameStripLeft">
            <div className="tpGameCover">
              {heroImage ? (
                <img
                  src={heroImage}
                  alt={game.name}
                  className="tpGameCoverImg"
                />
              ) : (
                <div className="tpGameCoverFallback" />
              )}
            </div>

            <div className="tpGameMeta">
              <div className="tpGameName">{game.name}</div>
              <div className="tpGamePublisher">{publisher}</div>

              <div className="tpGameBadges">
                <span className="tpGameBadge">⚡ Proses Cepat</span>
                <span className="tpGameBadge">💬 Chat 24/7</span>
                <span className="tpGameBadge">🛡️ Pembayaran Aman</span>
              </div>
            </div>
          </div>
        </div>

        <div className="tpBenefitRow">
          <div className="tpBenefitCard">🛡️ Jaminan Layanan</div>
          <div className="tpBenefitCard">📞 Layanan 24 Jam</div>
          <div className="tpBenefitCard">💳 Aman & Terpercaya</div>
          <div className="tpBenefitCard">⚡ Cepat & Otomatis</div>
        </div>

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
        <div className="card">
          <div className="contact-header">
            <div className="contact-step">1</div>
            <div className="contact-title-wrap">
              <h4 className="contact-title">Masukkan User ID</h4>
            </div>
          </div>

          <div className="contact-body">
            <label className="contact-label">User ID</label>
            <input
              className="contact-input"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Contoh: 12345678"
              inputMode="numeric"
            />

            {isML ? (
              <>
                <div className="spacer" />
                <label className="contact-label">Server (khusus ML)</label>
                <input
                  className="contact-input"
                  value={server}
                  onChange={(e) => setServer(e.target.value)}
                  placeholder="Contoh: 1234"
                  inputMode="numeric"
                />
              </>
            ) : null}
          </div>
        </div>

        <div className="spacer" />

        <div className="card">
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
                      <div className="nominalGroupHeader">
                        {groupTitle(g)}
                      </div>

                      <div className="tpNomGrid">
                        {items.map((p) => {
                          const active = selectedItemId === p.id;
                          const isFlash = !!p.flash;

                          return (
                            <button
                              key={p.id}
                              type="button"
                              className={`tpNomCard ${
                                active ? "isActive" : ""
                              }`}
                              onClick={() => setSelectedItemId(p.id)}
                            >
                              <div className="tpNomTop">
                                <div className="tpNomName">{p.name}</div>
                                {isFlash ? (
                                  <span className="tpNomFlash">FLASH SALE</span>
                                ) : null}
                              </div>

                              <div className="tpNomPriceRow">
                                {isFlash ? (
                                  <>
                                    <span className="tpNomOld">
                                      {rupiah(p.basePrice)}
                                    </span>
                                    <span className="tpNomNow">
                                      {rupiah(p.finalPrice)}
                                    </span>
                                  </>
                                ) : (
                                  <span className="tpNomNow">
                                    {rupiah(p.finalPrice)}
                                  </span>
                                )}
                              </div>

                              <div className="tpNomBottom">
                                <span className="tpNomHint">
                                  {isFlash && p.flash?.endAt
                                    ? `Berakhir: ${new Date(
                                        p.flash.endAt
                                      ).toLocaleString("id-ID")}`
                                    : "Klik untuk pilih"}
                                </span>

                                <span className="tpNomInstant" title="Proses Instant Cepat">
                                  <span className="tpNomBolt">⚡</span>
                                </span>
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

        <div className="card">
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
        <div className="stickyBar">
          <div className="stickyLeft">
            <div className="stickyStatus">{checkoutStatus}</div>

            <div className="stickyTotalRow">
              <div className="stickyLabel">Total</div>
              <div className="stickyTotal">
                {total > 0 ? rupiah(total) : "—"}
              </div>
            </div>

            <div className="stickyStatus" style={{ opacity: 0.85 }}>
              {selectedItem
                ? `${game.name} • ${selectedItem.name} • ${paymentMethod}${
                    voucherApplied ? ` • Voucher` : ""
                  }`
                : `${game.name} • pilih nominal`}
            </div>
          </div>

          <button
            className="stickyBtn"
            disabled={!canCheckout}
            onClick={onCheckout}
          >
            Pesan Sekarang
          </button>
        </div>
      </div>
    </main>
  );
}