"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Product = {
  id: string;
  gameId: string;
  name: string;
  group: "BEST_SELLER" | "HEMAT" | "SULTAN";
  provider: "DIGIFLAZZ" | "APIGAMES";
  providerSku: string;
  isActive: boolean;
  minPayable: number | null;
  prices: { audience: "PUBLIC" | "MEMBER" | "RESELLER"; price: number }[];
  game: { id: string; name: string };
};

type Game = { id: string; name: string };

export default function AdminProductEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [games, setGames] = useState<Game[]>([]);
  const [p, setP] = useState<Product | null>(null);

  const [gameId, setGameId] = useState("");
  const [name, setName] = useState("");
  const [group, setGroup] = useState<Product["group"]>("BEST_SELLER");
  const [provider, setProvider] = useState<Product["provider"]>("DIGIFLAZZ");
  const [providerSku, setProviderSku] = useState("");
  const [minPayable, setMinPayable] = useState<string>("");
  const [isActive, setIsActive] = useState(true);

  const [pricePublic, setPricePublic] = useState<string>("");
  const [priceMember, setPriceMember] = useState<string>("");
  const [priceReseller, setPriceReseller] = useState<string>("");

  async function loadGames() {
    const res = await fetch("/api/admin/games?active=1");
    const j = await res.json().catch(() => ({}));
    setGames(j.items ?? []);
  }

  async function load() {
    setErr(null);
    setLoading(true);

    const res = await fetch(`/api/admin/products/${id}`);
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(j.error ?? "Gagal load product");
      setLoading(false);
      return;
    }

    const item: Product = j.item;
    setP(item);

    setGameId(item.gameId);
    setName(item.name);
    setGroup(item.group);
    setProvider(item.provider);
    setProviderSku(item.providerSku);
    setMinPayable(item.minPayable == null ? "" : String(item.minPayable));
    setIsActive(item.isActive);

    const map = new Map(item.prices.map((x) => [x.audience, x.price]));
    setPricePublic(map.get("PUBLIC") != null ? String(map.get("PUBLIC")) : "");
    setPriceMember(map.get("MEMBER") != null ? String(map.get("MEMBER")) : "");
    setPriceReseller(map.get("RESELLER") != null ? String(map.get("RESELLER")) : "");

    setLoading(false);
  }

  useEffect(() => {
    loadGames();
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function onSave() {
    setErr(null);
    if (!name.trim()) return setErr("Nama product wajib.");
    if (!providerSku.trim()) return setErr("Provider SKU wajib.");

    const prices: any = {
      PUBLIC: pricePublic.trim() ? Number(pricePublic) : null,
      MEMBER: priceMember.trim() ? Number(priceMember) : null,
      RESELLER: priceReseller.trim() ? Number(priceReseller) : null,
    };

    // minimal 1 harga
    if (![prices.PUBLIC, prices.MEMBER, prices.RESELLER].some((x) => typeof x === "number" && x > 0)) {
      return setErr("Minimal isi 1 harga (PUBLIC/MEMBER/RESELLER).");
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId,
          name: name.trim(),
          group,
          provider,
          providerSku: providerSku.trim(),
          minPayable: minPayable.trim() ? Number(minPayable) : null,
          isActive,
          prices,
        }),
      });

      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error ?? "Gagal update product");

      await load();
      router.refresh();
    } catch (e: any) {
      setErr(e?.message ?? "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!p) return;
    const ok = confirm(`Hapus product "${p.name}"? Jika sudah dipakai order bisa gagal. (Rekomendasi: OFF saja)`);
    if (!ok) return;

    setDeleting(true);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error ?? "Gagal hapus product");

      router.push("/admin/products");
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
            <h4 className="contact-title">Edit Product</h4>
          </div>
        </div>

        <div className="contact-body">
          <div className="row" style={{ justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <Link href="/admin/products" className="voucherBtn" style={{ textDecoration: "none" }}>
              ← Kembali
            </Link>

            {p ? <div className="cardMuted" style={{ fontWeight: 900 }}>{p.game.name} • {p.group} • {p.provider}</div> : null}
          </div>

          <div className="spacer" />

          {loading ? (
            <div className="cardMuted">Loading…</div>
          ) : err ? (
            <div style={{ padding: 12, borderRadius: 12, border: "1px solid rgba(239,68,68,.25)", background: "rgba(239,68,68,.08)", color: "rgba(255,255,255,.92)", fontSize: 13, fontWeight: 700 }}>
              {err}
            </div>
          ) : null}

          {!loading && p ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="contact-label">Game</label>
                  <select className="contact-input" value={gameId} onChange={(e) => setGameId(e.target.value)}>
                    {games.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
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
                  <input className="contact-input" value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div>
                  <label className="contact-label">Group</label>
                  <select className="contact-input" value={group} onChange={(e) => setGroup(e.target.value as any)}>
                    <option value="BEST_SELLER">BEST_SELLER</option>
                    <option value="HEMAT">HEMAT</option>
                    <option value="SULTAN">SULTAN</option>
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
                  <input className="contact-input" value={providerSku} onChange={(e) => setProviderSku(e.target.value)} />
                </div>

                <div>
                  <label className="contact-label">Min Payable (opsional)</label>
                  <input className="contact-input" type="number" value={minPayable} onChange={(e) => setMinPayable(e.target.value)} />
                </div>

                <div />

                <div style={{ gridColumn: "1 / -1", marginTop: 6, fontWeight: 950 }}>Harga per Audience</div>

                <div>
                  <label className="contact-label">PUBLIC</label>
                  <input className="contact-input" type="number" value={pricePublic} onChange={(e) => setPricePublic(e.target.value)} />
                </div>

                <div>
                  <label className="contact-label">MEMBER</label>
                  <input className="contact-input" type="number" value={priceMember} onChange={(e) => setPriceMember(e.target.value)} />
                </div>

                <div>
                  <label className="contact-label">RESELLER</label>
                  <input className="contact-input" type="number" value={priceReseller} onChange={(e) => setPriceReseller(e.target.value)} />
                </div>
              </div>

              <div className="spacer" />

              <div className="row" style={{ justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="voucherBtn"
                  onClick={onDelete}
                  disabled={deleting}
                  style={{ background: "rgba(239,68,68,.10)", borderColor: "rgba(239,68,68,.25)" }}
                >
                  {deleting ? "Menghapus..." : "Hapus Product"}
                </button>

                <div className="row" style={{ gap: 10 }}>
                  <Link href="/admin/products" className="voucherBtn" style={{ textDecoration: "none" }}>
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
