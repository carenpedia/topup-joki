"use client";

import { useEffect, useState } from "react";
import AdminTable from "../../components/AdminTable";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminTicketsPage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const load = async () => {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      if (search) sp.set("search", search);
      const res = await fetch(`/api/admin/tickets?${sp.toString()}`);
      const data = await res.json();
      if (data.items) {
         setItems(data.items);
         applyFilters(data.items, statusFilter);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [search]); // eslint-disable-next-line react-hooks/exhaustive-deps

  const applyFilters = (data: any[], filter: string) => {
     if (filter === "ALL") {
        setFilteredItems(data);
     } else {
        setFilteredItems(data.filter(t => t.status === filter));
     }
  };

  useEffect(() => {
     applyFilters(items, statusFilter);
  }, [statusFilter, items]);

  const columns = [
    { header: "Tanggal", key: "createdAt", format: (val: any) => new Date(val).toLocaleString("id-ID") },
    { header: "No. Tiket", key: "ticketNo", render: (item: any) => (
       <div>
          <div style={{ fontWeight: 800 }}>{item.ticketNo}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{item.orderId ? `Order: ${item.orderId}` : "Status Transaksi"}</div>
       </div>
    )},
    { header: "Pelapor", key: "userId", render: (item: any) => (
       <div>
          {item.userId ? (
             <span style={{ color: "#60a5fa", fontWeight: 700 }}>{item.user?.username || "ID User"}</span>
          ) : (
             <span style={{ color: "#f59e0b", fontWeight: 700 }}>[GUEST] {item.contactWa}</span>
          )}
       </div>
    )},
    { header: "Topik & Judul", key: "topic", render: (item: any) => (
       <div style={{ maxWidth: 200, whiteSpace: "normal" }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>{item.topic}</div>
          <div style={{ fontSize: 13, fontWeight: 800 }}>{item.title}</div>
       </div>
    )},
    { header: "Status", key: "status", render: (item: any) => (
       <span style={{ 
            padding: "4px 8px", borderRadius: 8, fontSize: 11, fontWeight: 800,
            background: item.status === "CLOSED" ? "rgba(239,68,68,0.15)" : item.status === "ANSWERED" ? "rgba(34,197,94,0.15)" : item.status === "CUSTOMER_REPLY" ? "rgba(245,158,11,0.15)" : "rgba(59,130,246,0.15)",
            color: item.status === "CLOSED" ? "#f87171" : item.status === "ANSWERED" ? "#4ade80" : item.status === "CUSTOMER_REPLY" ? "#f59e0b" : "#60a5fa"
          }}>
             {item.status}
       </span>
    )}
  ];

  const actions = (item: any) => (
    <div style={{ display: "flex", gap: "8px" }}>
      <button 
         onClick={() => router.push(`/admin/tickets/${item.ticketNo}`)}
         className="adminActionBtn edit" 
         title="Buka Tiket"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
      </button>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
           <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Kelola Support Tickets</h1>
           <p style={{ color: "rgba(255,255,255,0.6)" }}>Pusat resolusi keluhan transaksi dari Member maupun Pelanggan Tamu (Guest).</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
         {["ALL", "OPEN", "CUSTOMER_REPLY", "ANSWERED", "CLOSED"].map(filter => (
            <button
               key={filter}
               onClick={() => setStatusFilter(filter)}
               style={{
                  padding: "8px 16px", borderRadius: 100, fontSize: 12, fontWeight: 800, cursor: "pointer",
                  background: statusFilter === filter ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.05)",
                  color: statusFilter === filter ? "#60a5fa" : "rgba(255,255,255,0.6)",
                  border: statusFilter === filter ? "1px solid rgba(59,130,246,0.4)" : "1px solid rgba(255,255,255,0.1)"
               }}
            >
               {filter === "CUSTOMER_REPLY" ? "REPLY" : filter}
            </button>
         ))}
      </div>

      <AdminTable
        columns={columns}
        data={filteredItems}
        actions={actions}
        searchPlaceholder="Cari Nomor Tiket / WhatsApp / Order ID..."
        targetSearch={search}
        onSearchChange={setSearch}
      />
    </div>
  );
}
