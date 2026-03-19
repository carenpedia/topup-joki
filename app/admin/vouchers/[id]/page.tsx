"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { utcIsoToWibLocal, wibLocalToUtcIso } from "@/lib/wib";


type Voucher = {
  id: string;
  code: string;
  target: "PUBLIC" | "MEMBER" | "RESELLER";
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  minPurchase: number;
  maxDiscount: number | null;
  quotaTotal: number | null;
  quotaUsed: number;
  startAt: string | null;
  endAt: string | null;
  isActive: boolean;
};

function toDatetimeLocal(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminVoucherEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [v, setV] = useState<Voucher | null>(null);

  // form states
  const [target, setTarget] = useState<Voucher["target"]>("PUBLIC");
  const [discountType, setDiscountType] = useState<Voucher["discountType"]>("PERCENT");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [minPurchase, setMinPurchase] = useState<number>(0);
  const [maxDiscount, setMaxDiscount] = useState<string>("");
  const [quotaTotal, setQuotaTotal] = useState<string>("");
  const [startAt, setStartAt] = useState<string>("");
  const [endAt, setEndAt] = useState<string>("");
  const [isActive, setIsActive] = useState(true);

  async function load() {
    setErr(null);
    setLoading(true);

    const res = await fetch(`/api/admin/vouchers/${id}`);
    const j = await res.json().catch(() => ({}));

    if (!res.ok) {
      setErr(j.error ?? "Gagal load voucher");
      setLoading(false);
      return;
    }

    const item: Voucher = j.item;
    setV(item);

    setTarget(item.target);
    setDiscountType(item.discountType);
    setDiscountValue(item.discountValue);
    setMinPurchase(item.minPurchase);
    setMaxDiscount(item.maxDiscount == null ? "" : String(item.maxDiscount));
    setQuotaTotal(item.quotaTotal == null ? "" : String(item.quotaTotal));
    setStartAt(utcIsoToWibLocal(item.startAt));
setEndAt(utcIsoToWibLocal(item.endAt));

    setIsActive(item.isActive);

    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function onSave() {
    if (!v) return;

    setErr(null);

    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      return setErr("Nilai diskon harus lebih dari 0.");
    }
    if (discountType === "PERCENT" && discountValue > 100) {
      return setErr("Diskon persen maksimal 100.");
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/vouchers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target,
          discountType,
          discountValue: Number(discountValue),
          minPurchase: Number(minPurchase) || 0,
          maxDiscount: maxDiscount.trim() ? Number(maxDiscount) : null,
          quotaTotal: quotaTotal.trim() ? Number(quotaTotal) : null,
          startAt: wibLocalToUtcIso(startAt),
endAt: wibLocalToUtcIso(endAt),

          isActive,
        }),
      });

      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error ?? "Gagal update voucher");

      await load();
      router.refresh();
    } catch (e: any) {
      setErr(e?.message ?? "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!v) return;
    const ok = confirm(`Hapus voucher "${v.code}"? Ini tidak bisa dibatalkan.`);
    if (!ok) return;

    setDeleting(true);
    setErr(null);

    try {
      const res = await fetch(`/api/admin/vouchers/${id}`, { method: "DELETE" });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error ?? "Gagal hapus voucher");

      router.push("/admin/vouchers");
      router.refresh();
    } catch (e: any) {
      setErr(e?.message ?? "Gagal hapus");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="contact-section">
      <div className="contact-card">
        <div className="contact-header">
          <div className="contact-step">E</div>
          <div className="contact-title-wrap">
            <h4 className="contact-title">Edit Voucher</h4>
          </div>
        </div>

        <div className="contact-body">
          <div className="row" style={{ justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <Link href="/admin/vouchers" className="voucherBtn" style={{ textDecoration: "none" }}>
              ← Kembali
            </Link>

            {v ? (
              <div className="cardMuted" style={{ fontWeight: 900 }}>
                Kode: <span style={{ color: "rgba(255,255,255,.92)" }}>{v.code}</span> • Used:{" "}
                {v.quotaUsed}/{v.quotaTotal ?? "∞"}
              </div>
            ) : null}
          </div>
        <div
  style={{
    fontSize: 12,
    fontWeight: 700,
    color: "rgba(96,165,250,.9)",
  }}
>
  🕒 Timezone: WIB (Asia/Jakarta)
</div>

<div className="spacer" />


          {loading ? (
            <div className="cardMuted">Loading…</div>
          ) : err ? (
            <div
              style={{
                padding: 12,
                borderRadius: 12,
                border: "1px solid rgba(239,68,68,.25)",
                background: "rgba(239,68,68,.08)",
                color: "rgba(255,255,255,.92)",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {err}
            </div>
          ) : null}

          {!loading && v ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="contact-label">Target</label>
                  <select className="contact-input" value={target} onChange={(e) => setTarget(e.target.value as any)}>
                    <option value="PUBLIC">PUBLIC</option>
                    <option value="MEMBER">MEMBER</option>
                    <option value="RESELLER">RESELLER</option>
                  </select>
                </div>

                <div>
                  <label className="contact-label">Status</label>
                  <select className="contact-input" value={isActive ? "1" : "0"} onChange={(e) => setIsActive(e.target.value === "1")}>
                    <option value="1">ACTIVE</option>
                    <option value="0">OFF</option>
                  </select>
                </div>

                <div>
                  <label className="contact-label">Tipe Diskon</label>
                  <select className="contact-input" value={discountType} onChange={(e) => setDiscountType(e.target.value as any)}>
                    <option value="PERCENT">PERCENT</option>
                    <option value="FIXED">FIXED</option>
                  </select>
                </div>

                <div>
                  <label className="contact-label">Nilai Diskon</label>
                  <input className="contact-input" type="number" value={discountValue} onChange={(e) => setDiscountValue(Number(e.target.value))} />
                  <div className="contact-hint">
                    {discountType === "PERCENT" ? "10 = 10%" : "5000 = potong Rp 5.000"}
                  </div>
                </div>

                <div>
                  <label className="contact-label">Min Purchase (Rp)</label>
                  <input className="contact-input" type="number" value={minPurchase} onChange={(e) => setMinPurchase(Number(e.target.value))} />
                </div>

                <div>
                  <label className="contact-label">Max Discount (opsional)</label>
                  <input className="contact-input" type="number" value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value)} placeholder="Kosongkan jika tidak ada" />
                </div>

                <div>
                  <label className="contact-label">Quota Total (opsional)</label>
                  <input className="contact-input" type="number" value={quotaTotal} onChange={(e) => setQuotaTotal(e.target.value)} placeholder="Kosongkan = unlimited" />
                </div>

                <div>
                  <label className="contact-label">Info Quota Used</label>
                  <input className="contact-input" value={String(v.quotaUsed)} disabled />
                  <div className="contact-hint">Quota used dihitung otomatis dari sistem.</div>
                </div>

                <div>
                  <label className="contact-label">Start At (opsional)</label>
                  <input className="contact-input" type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
                </div>

                <div>
                  <label className="contact-label">End At (opsional)</label>
                  <input className="contact-input" type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
                </div>
              </div>

              <div className="spacer" />

              <div className="row" style={{ justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="voucherBtn"
                  onClick={onDelete}
                  disabled={deleting}
                  style={{
                    background: "rgba(239,68,68,.10)",
                    borderColor: "rgba(239,68,68,.25)",
                  }}
                >
                  {deleting ? "Menghapus..." : "Hapus Voucher"}
                </button>

                <div className="row" style={{ gap: 10 }}>
                  <Link href="/admin/vouchers" className="voucherBtn" style={{ textDecoration: "none" }}>
                    Batal
                  </Link>

                  <button type="button" className="voucherBtn" onClick={onSave} disabled={saving}>
                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
