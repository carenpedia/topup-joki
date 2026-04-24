"use client";

import { useState, useEffect } from "react";

type ProductPriceRow = {
  id: string;
  game: string;
  product: string;
  public: number;
  reseller: number;
};

export default function ResellerPriceList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<ProductPriceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/user/pricelist");
        const j = await res.json();
        if (res.ok) setProducts(j.rows);
      } catch (e) {
        console.error("Pricelist Load Error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredProducts = products.filter(p => 
    p.game.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.product.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Harga Khusus Reseller</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>Daftar lengkap perbandingan harga publik dan VIP Reseller.</p>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
        <div className="authInputWrap" style={{ marginBottom: 0, flexGrow: 1, maxWidth: 400 }}>
           <input 
             className="input" 
             type="text" 
             placeholder="Cari Game atau Nominal..." 
             style={{ padding: "14px 16px 14px 44px", borderRadius: 16, background: "rgba(255,255,255,0.05)" }}
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
           <svg className="authInputIcon" style={{ left: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>
      </div>

      <div className="tableWrap" style={{ padding: 1, overflowX: "auto" }}>
         <table style={{ width: "100%", minWidth: 700 }}>
            <thead>
               <tr>
                  <th style={{ padding: "16px 20px", textAlign: "left" }}>Game</th>
                  <th style={{ padding: "16px 20px", textAlign: "left" }}>Produk</th>
                  <th style={{ padding: "16px 20px", textAlign: "right", color: "rgba(255,255,255,0.4)" }}>Harga Publik</th>
                  <th style={{ padding: "16px 20px", textAlign: "right", color: "#10b981" }}>Harga Reseller</th>
                  <th style={{ padding: "16px 20px", textAlign: "right", color: "#f59e0b" }}>Profit Margin</th>
               </tr>
            </thead>
            <tbody>
               {loading ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "rgba(255,255,255,0.4)" }}>Memuat data harga...</td>
                  </tr>
               ) : filteredProducts.map((p) => {
                 const profit = p.public - p.reseller;
                 return (
                   <tr key={p.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                      <td style={{ padding: "16px 20px", fontWeight: 700 }}>{p.game}</td>
                      <td style={{ padding: "16px 20px", color: "rgba(255,255,255,0.7)" }}>{p.product}</td>
                      <td style={{ padding: "16px 20px", textAlign: "right", color: "rgba(255,255,255,0.4)", textDecoration: "line-through", fontSize: 13 }}>Rp {p.public.toLocaleString("id-ID")}</td>
                      <td style={{ padding: "16px 20px", textAlign: "right", color: "#10b981", fontWeight: 800 }}>Rp {p.reseller.toLocaleString("id-ID")}</td>
                      <td style={{ padding: "16px 20px", textAlign: "right", color: "#f59e0b", fontWeight: 700 }}>+ Rp {profit.toLocaleString("id-ID")}</td>
                   </tr>
                 );
               })}
               {!loading && filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "rgba(255,255,255,0.4)" }}>Produk tidak ditemukan.</td>
                  </tr>
               )}
            </tbody>
         </table>
      </div>

    </div>
  );
}
