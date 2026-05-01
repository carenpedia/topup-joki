"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/app/components/ToastProvider";

type Detail = {
  id: string;
  productId: string;
  product: string;
  gameId: string;
  game: string;
  flashPrice: number;
  startAt: string;
  endAt: string;
  isActive: boolean;
  maxStock: number | null;
  soldCount: number;
  imageType: "PRODUCT" | "GAME";
  createdAt: string;
  updatedAt: string;
};

type GameMini = { id: string; name: string; key: string };
type ProductMini = { id: string; name: string };

function toLocalInputValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    d.getFullYear() +
    "-" +
    pad(d.getMonth() + 1) +
    "-" +
    pad(d.getDate()) +
    "T" +
    pad(d.getHours()) +
    ":" +
    pad(d.getMinutes())
  );
}

export default function FlashSaleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const r = useRouter();
  const toast = useToast();

  const [data, setData] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);

  // form states
  const [flashPrice, setFlashPrice] = useState<number>(0);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [maxStock, setMaxStock] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [imageType, setImageType] = useState<"PRODUCT" | "GAME">("PRODUCT");

  // dropdown
  const [games, setGames] = useState<GameMini[]>([]);
  const [products, setProducts] = useState<ProductMini[]>([]);
  const [gameId, setGameId] = useState("");
  const [productId, setProductId] = useState("");
  const [productQ, setProductQ] = useState("");

  const [loadingGame, setLoadingGame] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);

  async function loadGames() {
    setLoadingGame(true);
    try {
      const res = await fetch("/api/admin/games/mini", { cache: "no-store" });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || "Gagal load games");
      setGames(Array.isArray(j?.rows) ? j.rows : []);
    } catch (e: any) {
      toast.critical(e?.message || "Gagal load games");
    } finally {
      setLoadingGame(false);
    }
  }

  async function loadProducts(nextGameId: string, q: string) {
    setLoadingProduct(true);
    try {
      const qs = new URLSearchParams();
      qs.set("gameId", nextGameId);
      if (q.trim()) qs.set("q", q.trim());

      const res = await fetch(`/api/admin/products/mini?${qs.toString()}`, { cache: "no-store" });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || "Gagal load products");
      setProducts(Array.isArray(j?.rows) ? j.rows : []);
    } catch (e: any) {
      toast.critical(e?.message || "Gagal load products");
      setProducts([]);
    } finally {
      setLoadingProduct(false);
    }
  }

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/flash-sales/${id}`, { cache: "no-store" });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.critical(j?.error || "Gagal load detail flash sale");
        setData(null);
        return;
      }

      const row: Detail = j.row;
      setData(row);

      // base form
      setFlashPrice(Number(row.flashPrice || 0));
      setStartAt(toLocalInputValue(row.startAt));
      setEndAt(toLocalInputValue(row.endAt));
      setMaxStock(row.maxStock !== null && row.maxStock !== undefined ? String(row.maxStock) : "");
      setIsActive(Boolean(row.isActive));
      setImageType(row.imageType || "PRODUCT");

      // dropdown base
      setGameId(row.gameId || "");
      setProductId(row.productId || "");
      setProductQ("");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGames();
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!gameId) {
      setProducts([]);
      setProductId("");
      return;
    }
    loadProducts(gameId, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  useEffect(() => {
    if (!gameId) return;
    const t = setTimeout(() => {
      loadProducts(gameId, productQ);
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productQ]);

  const selectedGame = useMemo(() => games.find((g) => g.id === gameId), [games, gameId]);
  const selectedProduct = useMemo(() => products.find((p) => p.id === productId), [products, productId]);

  async function save() {
    if (!gameId) return toast.critical("Pilih game dulu");
    if (!productId) return toast.critical("Pilih product/nominal dulu");
    if (!flashPrice || flashPrice < 1) return toast.critical("Flash price harus > 0");

    try {
      const res = await fetch(`/api/admin/flash-sales/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          flashPrice,
          startAt: new Date(startAt).toISOString(),
          endAt: new Date(endAt).toISOString(),
          isActive,
          maxStock: maxStock ? parseInt(maxStock) : null,
          imageType,
        }),
      });

      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.critical(j?.error || `Gagal update (${res.status})`);
        return;
      }

      toast.success("Flash sale berhasil di-update");
      await load();
      r.refresh();
    } catch (e: any) {
      toast.critical(e?.message || "Network error");
    }
  }

  async function deactivate() {
    if (!confirm("Nonaktifkan flash sale ini?")) return;
    const res = await fetch(`/api/admin/flash-sales/${id}`, { method: "DELETE" });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.critical(j?.error || "Gagal menonaktifkan");
      return;
    }
    toast.success("Flash sale dinonaktifkan");
    await load();
    r.refresh();
  }

  return (
    <div className="contact-section">
      <div className="contact-card">
        <div className="contact-header">
          <div className="contact-step">F</div>
          <div className="contact-title-wrap">
            <h4 className="contact-title">Flash Sale Detail</h4>
          </div>
        </div>

        <div className="contact-body">
          {loading ? (
            <div style={{ opacity: 0.8, fontWeight: 900 }}>Loading...</div>
          ) : !data ? (
            <div style={{ color: "salmon", fontWeight: 900 }}>Data tidak ditemukan.</div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              <div className="cardMuted" style={{ fontWeight: 900 }}>
                Current:{" "}
                <span style={{ color: "rgba(255,255,255,.92)" }}>
                  {data.game} • {data.product}
                </span>
              </div>

              {/* GAME */}
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontWeight: 900, color: "#fff" }}>Game</span>
                <select
                  className="contact-input"
                  value={gameId}
                  onChange={(e) => {
                    setGameId(e.target.value);
                    setProductId("");
                    setProductQ("");
                  }}
                  disabled={loadingGame}
                >
                  <option value="">{loadingGame ? "Loading..." : "Pilih game..."}</option>
                  {games.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.key})
                    </option>
                  ))}
                </select>
              </label>

              {/* PRODUCT */}
              <div style={{ display: "grid", gap: 10 }}>
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontWeight: 900, color: "#fff" }}>Cari Product/Nominal</span>
                  <input
                    className="contact-input"
                    value={productQ}
                    onChange={(e) => setProductQ(e.target.value)}
                    placeholder={gameId ? "Ketik nama nominal..." : "Pilih game dulu"}
                    disabled={!gameId}
                  />
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontWeight: 900, color: "#fff" }}>Product/Nominal</span>
                  <select
                    className="contact-input"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    disabled={!gameId || loadingProduct}
                  >
                    <option value="">
                      {!gameId
                        ? "Pilih game dulu..."
                        : loadingProduct
                        ? "Loading..."
                        : products.length
                        ? "Pilih product..."
                        : "Tidak ada product untuk game ini"}
                    </option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="cardMuted" style={{ fontWeight: 900 }}>
                  {selectedGame ? (
                    <>
                      Game: <span style={{ color: "rgba(255,255,255,.92)" }}>{selectedGame.name}</span>
                    </>
                  ) : (
                    "Game: -"
                  )}
                  {" • "}
                  {selectedProduct ? (
                    <>
                      Product: <span style={{ color: "rgba(255,255,255,.92)" }}>{selectedProduct.name}</span>
                    </>
                  ) : (
                    "Product: -"
                  )}
                </div>
              </div>

              {/* FLASH PRICE */}
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontWeight: 900, color: "#fff" }}>Flash Price (Rp)</span>
                <input
                  className="contact-input"
                  type="number"
                  value={flashPrice}
                  onChange={(e) => setFlashPrice(Number(e.target.value))}
                />
              </label>

              {/* MAX STOCK & SOLD */}
              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontWeight: 900, color: "#fff" }}>Maksimal Stok (Opsional)</span>
                  <input
                    className="contact-input"
                    type="number"
                    value={maxStock}
                    onChange={(e) => setMaxStock(e.target.value)}
                    placeholder="Biarkan kosong jika tidak dibatasi"
                    min="1"
                  />
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontWeight: 900, color: "#fff" }}>Stok Terjual</span>
                  <input
                    className="contact-input"
                    type="number"
                    value={data.soldCount || 0}
                    disabled
                    style={{ opacity: 0.7 }}
                  />
                </label>
              </div>

              {/* IMAGE TYPE */}
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontWeight: 900, color: "#fff" }}>Tipe Gambar Tampilan</span>
                <select
                  className="contact-input"
                  value={imageType}
                  onChange={(e) => setImageType(e.target.value as any)}
                >
                  <option value="PRODUCT">Gambar Produk (Icon Nominal)</option>
                  <option value="GAME">Gambar Game (Logo Utama)</option>
                </select>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                  Pilih gambar mana yang akan muncul di section Flash Sale homepage.
                </div>
              </label>

              {/* DATES */}
              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontWeight: 900, color: "#fff" }}>Start</span>
                  <input
                    className="contact-input"
                    type="datetime-local"
                    value={startAt}
                    onChange={(e) => setStartAt(e.target.value)}
                  />
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontWeight: 900, color: "#fff" }}>End</span>
                  <input
                    className="contact-input"
                    type="datetime-local"
                    value={endAt}
                    onChange={(e) => setEndAt(e.target.value)}
                  />
                </label>
              </div>

              {/* ACTIVE */}
              <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                <span style={{ fontWeight: 900, color: "#fff" }}>Active</span>
              </label>

              {/* ACTIONS */}
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn-ghost btn-sm" onClick={() => r.back()}>
                  Batal
                </button>

                <button className="btn-ghost btn-sm" onClick={deactivate}>
                  Nonaktifkan
                </button>

                <button className="btn-primary btn-sm" onClick={save}>
                  Simpan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}