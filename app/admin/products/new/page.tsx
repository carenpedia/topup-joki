"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Game = { id: string; name: string };

export default function AdminProductNewPage() {
  const router = useRouter();

  const [games, setGames] = useState<Game[]>([]);
  const [gameId, setGameId] = useState("");
  const [productCategoryId, setProductCategoryId] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  const [name, setName] = useState("");
  const [group, setGroup] = useState<"BEST_SELLER" | "HEMAT" | "SULTAN">("BEST_SELLER");
  const [provider, setProvider] = useState<"DIGIFLAZZ" | "APIGAMES">("DIGIFLAZZ");
  const [providerSku, setProviderSku] = useState("");
  const [type, setType] = useState<"TOPUP" | "JOKI">("TOPUP");
  const [minPayable, setMinPayable] = useState<string>("");
  const [isActive, setIsActive] = useState(true);

  // prices
  const [pricePublic, setPricePublic] = useState<string>("");
  const [priceMember, setPriceMember] = useState<string>("");
  const [priceReseller, setPriceReseller] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function loadGames() {
    const res = await fetch("/api/admin/games?active=1");
    const j = await res.json().catch(() => ({}));
    const items = j.items ?? [];
    setGames(items);
    if (!gameId && (items[0]?.id)) setGameId(items[0].id);
  }

  async function loadCategories(gId?: string, tProp?: string) {
    const targetGameId = gId || gameId;
    const targetType = tProp || type;
    if (!targetGameId) return;
    const res = await fetch(`/api/admin/product-categories?gameId=${targetGameId}&type=${targetType}`);
    const j = await res.json().catch(() => ({}));
    setCategories(j.items ?? []);
  }

  useEffect(() => {
    loadGames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadCategories();
    setProductCategoryId("");
  }, [gameId, type]);

  async function onSubmit() {
    setErr(null);

    if (!gameId) return setErr("Pilih game dulu.");
    if (!name.trim()) return setErr("Nama product wajib.");
    if (!providerSku.trim()) return setErr("Provider SKU wajib.");

    const prices: any = {
      PUBLIC: pricePublic.trim() ? Number(pricePublic) : undefined,
      MEMBER: priceMember.trim() ? Number(priceMember) : undefined,
      RESELLER: priceReseller.trim() ? Number(priceReseller) : undefined,
    };

    if (![prices.PUBLIC, prices.MEMBER, prices.RESELLER].some((x) => typeof x === "number" && x > 0)) {
      return setErr("Minimal isi 1 harga (PUBLIC/MEMBER/RESELLER).");
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId,
          name: name.trim(),
          productCategoryId: productCategoryId || null,
          group,
          provider,
          providerSku: providerSku.trim(),
          type,
          minPayable: minPayable.trim() ? Number(minPayable) : null,
          isActive,
          prices,
        }),
      });

      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error ?? "Gagal membuat product");

      router.push("/admin/products");
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
            <h4 className="contact-title">Buat Product</h4>
          </div>
        </div>

        <div className="contact-body">
          <div className="row" style={{ justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <div className="cardMuted">Buat nominal/topup item untuk game.</div>
            <Link href="/admin/products" className="voucherBtn" style={{ textDecoration: "none" }}>
              ← Kembali
            </Link>
          </div>

          <div className="spacer" />

          {err ? (
            <div style={{ padding: 12, borderRadius: 12, border: "1px solid rgba(239,68,68,.25)", background: "rgba(239,68,68,.08)", color: "rgba(255,255,255,.92)", fontSize: 13, fontWeight: 700 }}>
              {err}
            </div>
          ) : null}

          <div className="spacer" />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="contact-label">Game</label>
              <select className="contact-input" value={gameId} onChange={(e) => setGameId(e.target.value)}>
                <option value="">-- pilih --</option>
                {games.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="contact-label">Status</label>
              <select className="contact-input" value={isActive ? "1" : "0"} onChange={(e) => setIsActive(e.target.value === "1")}>
                <option value="1">ACTIVE</option>
                <option value="0">OFF</option>
              </select>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label className="contact-label">Nama Product</label>
              <input className="contact-input" placeholder="Contoh: 257 Diamonds" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div>
              <label className="contact-label">Kategori (Opsional)</label>
              <select className="contact-input" value={productCategoryId} onChange={(e) => setProductCategoryId(e.target.value)}>
                <option value="">-- Tanpa Kategori --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="contact-label">Tipe Product</label>
              <select className="contact-input" value={type} onChange={(e) => setType(e.target.value as any)}>
                <option value="TOPUP">TOPUP (Diamond/Item)</option>
                <option value="JOKI">JOKI (Layanan Joki)</option>
              </select>
            </div>

            <div>
              <label className="contact-label">Provider</label>
              <select className="contact-input" value={provider} onChange={(e) => setProvider(e.target.value as any)}>
                <option value="DIGIFLAZZ">DIGIFLAZZ</option>
                <option value="APIGAMES">APIGAMES</option>
              </select>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label className="contact-label">Provider SKU</label>
              <input className="contact-input" placeholder="SKU dari provider (unik)" value={providerSku} onChange={(e) => setProviderSku(e.target.value)} />
            </div>

            <div>
              <label className="contact-label">Min Payable (opsional)</label>
              <input className="contact-input" type="number" value={minPayable} onChange={(e) => setMinPayable(e.target.value)} placeholder="Kosongkan jika tidak ada" />
            </div>

            <div />

            {/* Prices */}
            <div style={{ gridColumn: "1 / -1", marginTop: 6, fontWeight: 950 }}>Harga per Audience</div>

            <div>
              <label className="contact-label">PUBLIC</label>
              <input className="contact-input" type="number" value={pricePublic} onChange={(e) => setPricePublic(e.target.value)} placeholder="ex: 15000" />
            </div>

            <div>
              <label className="contact-label">MEMBER</label>
              <input className="contact-input" type="number" value={priceMember} onChange={(e) => setPriceMember(e.target.value)} placeholder="ex: 14500" />
            </div>

            <div>
              <label className="contact-label">RESELLER</label>
              <input className="contact-input" type="number" value={priceReseller} onChange={(e) => setPriceReseller(e.target.value)} placeholder="ex: 14000" />
            </div>
          </div>

          <div className="spacer" />

          <div style={{
  display: "flex",
  justifyContent: "flex-end",
  gap: 12,
  marginTop: 10
}}>
  <Link
  href="/admin/products"
  style={{
    padding: "9px 18px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,.15)",
    background: "transparent",
    color: "rgba(255,255,255,.75)",
    fontWeight: 700,
    fontSize: 13,
    textDecoration: "none",
    backdropFilter: "blur(6px)",
    transition: "all 160ms ease",
  }}
  onMouseEnter={(e) => {
    const el = e.currentTarget;
    el.style.borderColor = "rgba(59,130,246,.55)";
    el.style.background = "rgba(59,130,246,.08)";
    el.style.color = "#fff";
    el.style.boxShadow =
      "0 0 0 1px rgba(59,130,246,.35), 0 8px 22px rgba(59,130,246,.25)";
    el.style.transform = "translateY(-1px)";
  }}
  onMouseLeave={(e) => {
    const el = e.currentTarget;
    el.style.borderColor = "rgba(255,255,255,.15)";
    el.style.background = "transparent";
    el.style.color = "rgba(255,255,255,.75)";
    el.style.boxShadow = "none";
    el.style.transform = "translateY(0)";
  }}
  onMouseDown={(e) => {
    const el = e.currentTarget;
    el.style.transform = "translateY(0.5px) scale(0.98)";
    el.style.boxShadow =
      "0 0 0 1px rgba(59,130,246,.45), 0 6px 16px rgba(59,130,246,.35)";
  }}
  onMouseUp={(e) => {
    const el = e.currentTarget;
    el.style.transform = "translateY(-1px)";
    el.style.boxShadow =
      "0 0 0 1px rgba(59,130,246,.35), 0 8px 22px rgba(59,130,246,.25)";
  }}
>
  Batal
</Link>


  <button
    onClick={onSubmit} disabled={saving}
    style={{
      padding: "9px 20px",
      borderRadius: 999,
      border: "none",
      fontSize: 13,
      fontWeight: 800,
      color: "#fff",
      cursor: "pointer",
      background: "linear-gradient(135deg, #3b82f6, #22d3ee)",
      boxShadow: "0 6px 16px rgba(59,130,246,.35)"
    }}
  >
    {saving ? "Menyimpan..." : "Simpan Product"}
  </button>
</div>

        </div>
      </div>
    </div>
  );
}
