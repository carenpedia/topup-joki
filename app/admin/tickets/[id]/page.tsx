"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminTicketDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const ticketNo = params.id;

  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState<any>(null);
  
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const loadTicket = async () => {
    try {
      const res = await fetch(`/api/admin/tickets/${ticketNo}`);
      if (res.ok) {
        const j = await res.json();
        setTicket(j.ticket);
        scrollToBottom();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
    // Poll updates
    const interval = setInterval(() => {
       fetch(`/api/admin/tickets/${ticketNo}`).then(r=>r.json()).then(j=>{
          if(j.ticket){ setTicket(j.ticket); scrollToBottom(); }
       });
    }, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketNo]);

  const scrollToBottom = () => {
    setTimeout(() => {
      endOfMessagesRef.current?.scrollIntoView();
    }, 100);
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsReplying(true);
    try {
      const res = await fetch(`/api/admin/tickets/${ticketNo}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyText })
      });
      if (res.ok) {
        setReplyText("");
        loadTicket();
      } else {
        const j = await res.json();
        alert(j.error || "Gagal mengirim balasan.");
      }
    } catch (e) {
      alert("Error sistem.");
    } finally {
      setIsReplying(false);
    }
  };

  const handleChangeStatus = async (status: string) => {
     if(!confirm(`Yakin mengubah status jadi ${status}?`)) return;
     try {
        const res = await fetch(`/api/admin/tickets/${ticketNo}`, {
           method: "PATCH",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ status })
        });
        if(res.ok) loadTicket();
     } catch (e) {}
  }

  if (loading) return <div style={{ padding: 40, color: "rgba(255,255,255,0.5)" }}>Loading detail...</div>;
  if (!ticket) return <div style={{ padding: 40, color: "#ef4444" }}>Tiket tidak ditemukan.</div>;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, background: "rgba(255,255,255,0.02)", padding: 24, borderRadius: 20, border: "1px solid rgba(255,255,255,0.05)" }}>
         <div>
            <Link href="/admin/tickets" style={{ fontSize: 13, color: "#60a5fa", textDecoration: "none", fontWeight: 800, marginBottom: 8, display: "inline-block" }}>← Kembali ke Tabel</Link>
            <h1 style={{ fontSize: 24, fontWeight: 900 }}>{ticket.title}</h1>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 700, marginTop: 4, display: "flex", gap: 12 }}>
               <span>#{ticket.ticketNo}</span>
               <span>•</span>
               <span>{ticket.topic}</span>
               <span>•</span>
               <span style={{ color: ticket.userId ? "#60a5fa" : "#f59e0b" }}>
                  {ticket.userId ? `User: ${ticket.user?.username}` : `Tamu WA: ${ticket.contactWa}`}
               </span>
               {ticket.orderId && <span>• Order: {ticket.orderId}</span>}
            </div>
         </div>
         <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ 
              padding: "8px 16px", borderRadius: 12, fontSize: 12, fontWeight: 900,
              background: ticket.status === "CLOSED" ? "rgba(239,68,68,0.15)" : ticket.status === "ANSWERED" ? "rgba(34,197,94,0.15)" : "rgba(59,130,246,0.15)",
              color: ticket.status === "CLOSED" ? "#f87171" : ticket.status === "ANSWERED" ? "#4ade80" : "#60a5fa"
            }}>
               {ticket.status}
            </span>
            {ticket.status !== "CLOSED" && (
               <button onClick={() => handleChangeStatus("CLOSED")} style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px dashed rgba(239,68,68,0.3)", padding: "10px 16px", borderRadius: 12, fontWeight: 800, cursor: "pointer" }}>Tutup Tiket</button>
            )}
         </div>
      </div>

      {/* Chat Container */}
      <div style={{ flex: 1, minHeight: 400, background: "rgba(0,0,0,0.3)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.05)", overflowY: "auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
         {ticket.replies?.map((r: any) => {
           const isAdmin = r.isAdmin;
           
           return (
             <div key={r.id} style={{ display: "flex", flexDirection: "column", alignItems: isAdmin ? "flex-end" : "flex-start", width: "100%" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.4)", marginBottom: 4, marginLeft: 4, marginRight: 4 }}>
                   {r.isSystem ? "🤖 AUTO-REPLY SYSTEM" : isAdmin ? "👑 Anda (Admin)" : (ticket.userId ? "👤 Pelanggan" : "👤 Tamu")} • {new Date(r.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                </div>
                <div style={{ 
                   maxWidth: "75%", 
                   padding: "14px 18px", 
                   borderRadius: 20,
                   borderBottomRightRadius: isAdmin ? 4 : 20,
                   borderBottomLeftRadius: !isAdmin ? 4 : 20,
                   fontSize: 14,
                   lineHeight: 1.5,
                   background: r.isSystem ? "rgba(59,130,246,0.1)" : isAdmin ? "linear-gradient(135deg, #10b981, #059669)" : "rgba(255,255,255,0.06)",
                   border: r.isSystem ? "1px dashed rgba(59,130,246,0.3)" : isAdmin ? "none" : "1px solid rgba(255,255,255,0.05)",
                   color: r.isSystem ? "#60a5fa" : isAdmin ? "#fff" : "rgba(255,255,255,0.9)"
                }}>
                   {r.message.split('\n').map((str: string, i: number) => <span key={i}>{str}<br/></span>)}
                </div>
             </div>
           );
         })}
         <div ref={endOfMessagesRef} />
      </div>

      {ticket.status !== "CLOSED" ? (
         <div style={{ marginTop: 20, padding: 20, background: "rgba(255,255,255,0.02)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.05)" }}>
            <form onSubmit={handleReply} style={{ display: "flex", gap: 16 }}>
               <textarea 
                 className="contact-input" 
                 style={{ flex: 1, padding: "16px 20px", borderRadius: 16, background: "rgba(255,255,255,0.03)", resize: "vertical", minHeight: 80 }}
                 placeholder={`Balas pesan pelapor...`}
                 value={replyText}
                 onChange={e => setReplyText(e.target.value)}
                 disabled={isReplying}
               />
               <div style={{ display: "flex", flexDirection: "column", gap: 8, justifyContent: "space-between" }}>
                  <button type="submit" disabled={isReplying || !replyText.trim()} style={{ 
                     background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff", flex: 1,
                     border: "none", borderRadius: 16, padding: "0 24px", fontWeight: 800,
                     cursor: "pointer", opacity: replyText.trim() ? 1 : 0.5
                  }}>
                     Kirim Balasan
                  </button>
               </div>
            </form>
         </div>
      ) : (
         <div style={{ marginTop: 20, textAlign: "center", padding: 16, background: "rgba(239,68,68,0.1)", borderRadius: 16, color: "#f87171", fontSize: 13, fontWeight: 700 }}>
            Tiket ditutup. Anda tidak dapat mengirim balasan ke tiket yang sudah selesai.
         </div>
      )}
    </div>
  );
}
