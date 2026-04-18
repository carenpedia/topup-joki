"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function TicketDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ticketNo = params.id;
  const waParam = searchParams.get("wa") || "";

  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const loadTicket = async () => {
    try {
      const sp = new URLSearchParams();
      if (waParam) sp.set("wa", waParam);
      
      const res = await fetch(`/api/user/tickets/${ticketNo}?${sp.toString()}`);
      const j = await res.json();

      if (!res.ok) {
        setErrorMsg(j.error || "Gagal memuat tiket.");
      } else {
        setTicket(j.ticket);
        scrollToBottom();
      }
    } catch (e: any) {
      setErrorMsg("Sistem sedang bermasalah.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
    // Refresh ticket chat every 20 seconds silently
    const interval = setInterval(() => {
       fetch(`/api/user/tickets/${ticketNo}?wa=${encodeURIComponent(waParam)}`)
         .then(r => r.json())
         .then(j => { if(j.ticket) { setTicket(j.ticket); scrollToBottom(); } });
    }, 20000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketNo, waParam]);

  const scrollToBottom = () => {
    setTimeout(() => {
      endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsReplying(true);
    try {
      const res = await fetch(`/api/user/tickets/${ticketNo}/reply?wa=${encodeURIComponent(waParam)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyText })
      });
      const j = await res.json();
      if (res.ok) {
        setReplyText("");
        loadTicket(); // Reload full chat
      } else {
        alert(j.error || "Gagal mengirim balasan.");
      }
    } catch (e) {
      alert("Error jaringan.");
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <main className="page">
      <div className="bgGlow" aria-hidden="true" />
      <div className="gridFx" aria-hidden="true" />
      <Navbar />

      <div className="shell" style={{ display: "flex", flexDirection: "column", minHeight: "80vh", padding: "40px 10px" }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", marginTop: 100 }}>Loading tiket...</div>
        ) : errorMsg ? (
          <div style={{ maxWidth: 500, margin: "100px auto", textAlign: "center" }}>
             <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 16 }}>Akses Ditolak</h2>
             <div style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", padding: 20, borderRadius: 16, fontWeight: 700 }}>{errorMsg}</div>
             <Link href="/bantuan" style={{ display: "inline-block", marginTop: 24, color: "#60a5fa", fontWeight: 800 }}>← Kembali ke Pusat Bantuan</Link>
          </div>
        ) : ticket ? (
          <div style={{ maxWidth: 700, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", height: "70vh" }}>
            
            {/* Header Area */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, background: "rgba(255,255,255,0.03)", padding: "20px 24px", borderRadius: 24, border: "1px solid rgba(255,255,255,0.05)" }}>
               <div>
                  <Link href="/bantuan" style={{ fontSize: 13, color: "#60a5fa", textDecoration: "none", fontWeight: 800, marginBottom: 8, display: "inline-block" }}>← Kembali</Link>
                  <h1 style={{ fontSize: 20, fontWeight: 900 }}>{ticket.title}</h1>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 700, marginTop: 4 }}>
                     Tiket #{ticket.ticketNo} • {ticket.topic}
                     {ticket.orderId && ` • Pesanan: ${ticket.orderId}`}
                  </div>
               </div>
               <div>
                  <span style={{ 
                    padding: "8px 16px", borderRadius: 12, fontSize: 12, fontWeight: 900,
                    background: ticket.status === "CLOSED" ? "rgba(239,68,68,0.15)" : ticket.status === "ANSWERED" ? "rgba(34,197,94,0.15)" : "rgba(59,130,246,0.15)",
                    color: ticket.status === "CLOSED" ? "#f87171" : ticket.status === "ANSWERED" ? "#4ade80" : "#60a5fa"
                  }}>
                     {ticket.status}
                  </span>
               </div>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, background: "rgba(0,0,0,0.2)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.05)", overflowY: "auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
               {ticket.replies?.map((r: any) => {
                 const isMe = !r.isAdmin && !r.isSystem;
                 
                 return (
                   <div key={r.id} style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start", width: "100%" }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.4)", marginBottom: 4, marginLeft: 4, marginRight: 4 }}>
                         {r.isSystem ? "🤖 CarenPedia Bot" : r.isAdmin ? "👑 Admin" : "Anda"} • {new Date(r.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                      <div style={{ 
                         maxWidth: "85%", 
                         padding: "14px 18px", 
                         borderRadius: 20,
                         borderBottomRightRadius: isMe ? 4 : 20,
                         borderBottomLeftRadius: !isMe ? 4 : 20,
                         fontSize: 14,
                         lineHeight: 1.5,
                         background: isMe ? "linear-gradient(135deg, #3b82f6, #2563eb)" : (r.isSystem ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.06)"),
                         border: isMe ? "none" : (r.isSystem ? "1px solid rgba(59,130,246,0.3)" : "1px solid rgba(255,255,255,0.05)"),
                         color: isMe ? "#fff" : (r.isSystem ? "#60a5fa" : "rgba(255,255,255,0.9)")
                      }}>
                         {r.message.split('\n').map((str: string, i: number) => <span key={i}>{str}<br/></span>)}
                      </div>
                   </div>
                 );
               })}
               <div ref={endOfMessagesRef} />
            </div>

            {/* Input Area */}
            {ticket.status !== "CLOSED" ? (
               <form onSubmit={handleReply} style={{ marginTop: 20, display: "flex", gap: 12 }}>
                  <input 
                    className="contact-input" 
                    style={{ flex: 1, padding: "16px 20px", borderRadius: 100, background: "rgba(255,255,255,0.04)" }}
                    placeholder="Tuliskan balasan Anda di sini..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    disabled={isReplying}
                  />
                  <button type="submit" disabled={isReplying || !replyText.trim()} style={{ 
                     background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff",
                     border: "none", borderRadius: 100, width: 52, height: 52, display: "grid", placeItems: "center",
                     cursor: "pointer", opacity: replyText.trim() ? 1 : 0.5
                  }}>
                     <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  </button>
               </form>
            ) : (
               <div style={{ marginTop: 20, textAlign: "center", padding: 16, background: "rgba(239,68,68,0.1)", borderRadius: 16, color: "#f87171", fontSize: 13, fontWeight: 700 }}>
                  Keluhan pelaporan Anda telah selesai dan tiket resmi ditutup.
               </div>
            )}
          </div>
        ) : null}
      </div>
      <Footer />
    </main>
  );
}
