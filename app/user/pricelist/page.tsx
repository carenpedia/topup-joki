"use client";

import { useState } from "react";

// Mock Data
const categories = ["Games", "Voucher", "Pulsa"];
const mockProducts = [
  { id: 1, game: "Mobile Legends", product: "86 Diamonds", public: 22000, reseller: 19500 },
  { id: 2, game: "Mobile Legends", product: "172 Diamonds", public: 44000, reseller: 39000 },
  { id: 3, game: "Mobile Legends", product: "257 Diamonds", public: 66000, reseller: 58500 },
  { id: 4, game: "Mobile Legends", product: "Weekly Diamond Pass", public: 28000, reseller: 25500 },
  { id: 5, game: "Free Fire", product: "140 Diamonds", public: 20000, reseller: 18000 },
  { id: 6, game: "Free Fire", product: "355 Diamonds", public: 50000, reseller: 45000 },
  { id: 7, game: "PUBG Mobile", product: "60 UC", public: 15000, reseller: 13500 },
];

export default function ResellerPriceList() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = mockProducts.filter(p => 
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

      <div className="tableWrap" style={{ padding: 1 }}>
         <table style={{ width: "100%", minWidth: 600 }}>
            <thead>
               <tr>
                  <th style={{ padding: "16px 20px" }}>Game</th>
                  <th style={{ padding: "16px 20px" }}>Produk</th>
                  <th style={{ padding: "16px 20px", textAlign: "right", color: "rgba(255,255,255,0.4)" }}>Harga Publik</th>
                  <th style={{ padding: "16px 20px", textAlign: "right", color: "#10b981" }}>Harga Reseller</th>
                  <th style={{ padding: "16px 20px", textAlign: "right", color: "#f59e0b" }}>Profit Margin</th>
               </tr>
            </thead>
            <tbody>
               {filteredProducts.map((p) => {
                 const profit = p.public - p.reseller;
                 return (
                   <tr key={p.id}>
                      <td style={{ padding: "16px 20px", fontWeight: 700 }}>{p.game}</td>
                      <td style={{ padding: "16px 20px", color: "rgba(255,255,255,0.7)" }}>{p.product}</td>
                      <td style={{ padding: "16px 20px", textAlign: "right", color: "rgba(255,255,255,0.4)", textDecoration: "line-through" }}>Rp {p.public.toLocaleString("id-ID")}</td>
                      <td style={{ padding: "16px 20px", textAlign: "right", color: "#10b981", fontWeight: 800 }}>Rp {p.reseller.toLocaleString("id-ID")}</td>
                      <td style={{ padding: "16px 20px", textAlign: "right", color: "#f59e0b", fontWeight: 700 }}>+ Rp {profit.toLocaleString("id-ID")}</td>
                   </tr>
                 );
               })}
               {filteredProducts.length === 0 && (
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
