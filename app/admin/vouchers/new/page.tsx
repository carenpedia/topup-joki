"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { wibLocalToUtcIso } from "@/lib/wib";


type Target = "PUBLIC" | "MEMBER" | "RESELLER";
type DiscountType = "PERCENT" | "FIXED";

export default function AdminVoucherNewPage() {
  const router = useRouter();

  const [code, setCode] = useState("");
  const [target, setTarget] = useState<Target>("PUBLIC");
  const [discountType, setDiscountType] = useState<DiscountType>("PERCENT");
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minPurchase, setMinPurchase] = useState<number>(0);
  const [maxDiscount, setMaxDiscount] = useState<string>(""); // optional
  const [quotaTotal, setQuotaTotal] = useState<string>(""); // optional
  const [startAt, setStartAt] = useState<string>(""); // optional (datetime-local)
  const [endAt, setEndAt] = useState<string>(""); // optional
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit() {
    setErr(null);

    const finalCode = code.trim().toUpperCase();
    if (!finalCode) return setErr("Kode voucher wajib diisi.");

    // validasi ringan: huruf/angka/_/-
    if (!/^[A-Z0-9_-]{4,}$/.test(finalCode)) {
      return setErr("Format kode: minimal 4 karakter, hanya huruf/angka, boleh - atau _.");
    }

    // validasi basic value
    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      return setErr("Nilai diskon harus lebih dari 0.");
    }
    if (discountType === "PERCENT" && discountValue > 100) {
      return setErr("Diskon persen maksimal 100.");
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: finalCode,
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
      if (!res.ok) throw new Error(j.error ?? "Gagal membuat voucher");

      router.push("/admin/vouchers");
      router.refresh();
    } catch (e: any) {
      setErr(e?.message ?? "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="contact-section">
      <div className="contact-card">
        <div className="contact-header">
          <div className="contact-step">+</div>
          <div className="contact-title-wrap">
            <h4 className="contact-title">Buat Voucher</h4>
          </div>
        </div>

        <div className="contact-body">
          <div className="row" style={{ justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <div className="cardMuted">Isi form ini untuk membuat kode voucher baru.</div>
            <div
  style={{
    fontSize: 12,
    fontWeight: 700,
    color: "rgba(96,165,250,.9)",
    marginTop: 4,
  }}
>
  🕒 Timezone: WIB (Asia/Jakarta)
</div>

            <Link href="/admin/vouchers" className="voucherBtn" style={{ textDecoration: "none" }}>
              ← Kembali
            </Link>
          </div>

          <div className="spacer" />

          {err ? (
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

          <div className="spacer" />

          {/* Form grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="contact-label">Kode Voucher</label>
              <input
                className="contact-input"
                placeholder="Contoh: CAREN10"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
              />
              <div className="contact-hint">Minimal 4 karakter, huruf/angka, boleh - atau _.</div>
            </div>

            <div>
              <label className="contact-label">Target</label>
              <select className="contact-input" value={target} onChange={(e) => setTarget(e.target.value as Target)}>
                <option value="PUBLIC">PUBLIC</option>
                <option value="MEMBER">MEMBER</option>
                <option value="RESELLER">RESELLER</option>
              </select>
              <div className="contact-hint">Menentukan siapa yang boleh memakai voucher.</div>
            </div>

            <div>
              <label className="contact-label">Tipe Diskon</label>
              <select
                className="contact-input"
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as DiscountType)}
              >
                <option value="PERCENT">PERCENT</option>
                <option value="FIXED">FIXED</option>
              </select>
              <div className="contact-hint">PERCENT = persen, FIXED = rupiah.</div>
            </div>

            <div>
              <label className="contact-label">Nilai Diskon</label>
              <input
                className="contact-input"
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
              />
              <div className="contact-hint">
                {discountType === "PERCENT" ? "Contoh: 10 = diskon 10%" : "Contoh: 5000 = potong Rp 5.000"}
              </div>
            </div>

            <div>
              <label className="contact-label">Min Purchase (Rp)</label>
              <input
                className="contact-input"
                type="number"
                value={minPurchase}
                onChange={(e) => setMinPurchase(Number(e.target.value))}
              />
              <div className="contact-hint">Minimal total belanja agar voucher bisa dipakai.</div>
            </div>

            <div>
              <label className="contact-label">Max Discount (opsional)</label>
              <input
                className="contact-input"
                type="number"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                placeholder="Kosongkan jika tidak ada"
              />
              <div className="contact-hint">Batas maksimal potongan (berguna untuk PERCENT).</div>
            </div>

            <div>
              <label className="contact-label">Quota Total (opsional)</label>
              <input
                className="contact-input"
                type="number"
                value={quotaTotal}
                onChange={(e) => setQuotaTotal(e.target.value)}
                placeholder="Kosongkan = unlimited"
              />
              <div className="contact-hint">Batas total pemakaian voucher.</div>
            </div>

            <div>
              <label className="contact-label">Status</label>
              <select className="contact-input" value={isActive ? "1" : "0"} onChange={(e) => setIsActive(e.target.value === "1")}>
                <option value="1">ACTIVE</option>
                <option value="0">OFF</option>
              </select>
              <div className="contact-hint">Voucher OFF tidak bisa dipakai.</div>
            </div>

            <div>
              <label className="contact-label">Start At (opsional)</label>
              <input className="contact-input" type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
              <div className="contact-hint">Kosongkan jika langsung aktif.</div>
            </div>

            <div>
              <label className="contact-label">End At (opsional)</label>
              <input className="contact-input" type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
              <div className="contact-hint">Kosongkan jika tidak ada masa berakhir.</div>
            </div>
          </div>

          <div className="spacer" />

          <div className="row" style={{ justifyContent: "flex-end", gap: 10 }}>
            <Link href="/admin/vouchers" className="voucherBtn" style={{ textDecoration: "none" }}>
              Batal
            </Link>

            <button className="voucherBtn" type="button" onClick={onSubmit} disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan Voucher"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
