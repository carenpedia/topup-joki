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
  const [imageUrl, setImageUrl] = useState("");
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
          imageUrl: imageUrl.trim() || null,
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
    <div className="admin-dashboard-wrapper">
      <header className="admin-page-header">
        <div className="admin-page-title-wrap">
          <h1 className="admin-page-title">Create Product</h1>
          <p className="admin-page-subtitle">Add a new diamond or joki service item to the catalog.</p>
        </div>
        <Link href="/admin/products" className="admin-btn admin-btn-ghost">
          ← Back to Catalog
        </Link>
      </header>

      <div className="admin-card">
        <div className="admin-card-header">
          <h4 className="admin-card-title">Product Information</h4>
        </div>
        <div className="admin-card-body">
          {err && (
            <div className="admin-badge admin-badge-error" style={{ width: "100%", padding: "12px", borderRadius: "10px", marginBottom: "20px", justifyContent: "flex-start", textTransform: "none" }}>
              {err}
            </div>
          )}

          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label className="admin-label">Target Game</label>
              <select className="admin-select" value={gameId} onChange={(e) => setGameId(e.target.value)}>
                <option value="">-- Select Game --</option>
                {games.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Availability Status</label>
              <select className="admin-select" value={isActive ? "1" : "0"} onChange={(e) => setIsActive(e.target.value === "1")}>
                <option value="1">ACTIVE</option>
                <option value="0">OFF / MAINTENANCE</option>
              </select>
            </div>

            <div className="admin-form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="admin-label">Product Display Name</label>
              <input className="admin-input" placeholder="e.g. 257 Diamonds" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Category (Optional)</label>
              <select className="admin-select" value={productCategoryId} onChange={(e) => setProductCategoryId(e.target.value)}>
                <option value="">-- No Category --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Product Type</label>
              <select className="admin-select" value={type} onChange={(e) => setType(e.target.value as any)}>
                <option value="TOPUP">TOPUP (Instant Item)</option>
                <option value="JOKI">JOKI (Manual Service)</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Provider Connection</label>
              <select className="admin-select" value={provider} onChange={(e) => setProvider(e.target.value as any)}>
                <option value="DIGIFLAZZ">DIGIFLAZZ</option>
                <option value="APIGAMES">APIGAMES</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Provider SKU</label>
              <input
                className="admin-input"
                placeholder="e.g. ml500"
                value={providerSku}
                onChange={(e) => setProviderSku(e.target.value)}
              />
            </div>

            <div className="admin-form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="admin-label">Custom Image URL (Optional)</label>
              <input
                className="admin-input"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <p className="admin-page-subtitle" style={{ marginTop: 4 }}>Leave empty to use the default diamond icon.</p>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Min Payable Amount (Optional)</label>
              <input className="admin-input" type="number" value={minPayable} onChange={(e) => setMinPayable(e.target.value)} placeholder="Default: 0" />
            </div>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h4 className="admin-card-title">Pricing Configuration</h4>
        </div>
        <div className="admin-card-body">
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label className="admin-label">Public Price (IDR)</label>
              <input className="admin-input" type="number" value={pricePublic} onChange={(e) => setPricePublic(e.target.value)} placeholder="15000" />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Member Price (IDR)</label>
              <input className="admin-input" type="number" value={priceMember} onChange={(e) => setPriceMember(e.target.value)} placeholder="14500" />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Reseller Price (IDR)</label>
              <input className="admin-input" type="number" value={priceReseller} onChange={(e) => setPriceReseller(e.target.value)} placeholder="14000" />
            </div>
          </div>
        </div>
        <div className="admin-card-header" style={{ borderTop: "1px solid var(--admin-border)", borderBottom: "none", justifyContent: "flex-end", gap: 12 }}>
          <Link href="/admin/products" className="admin-btn admin-btn-ghost">
            Cancel
          </Link>
          <button
            onClick={onSubmit}
            disabled={saving}
            className="admin-btn admin-btn-primary"
            style={{ minWidth: 160 }}
          >
            {saving ? "Saving..." : "Create Product"}
          </button>
        </div>
      </div>
    </div>
  );
}
