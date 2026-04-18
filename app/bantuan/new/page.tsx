"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function NewTicketPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const [topic, setTopic] = useState("");
  const [title, setTitle] = useState("");
  const [orderId, setOrderId] = useState("");
  const [contactWa, setContactWa] = useState("");
  const [message, setMessage] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data?.user) {
        setUser(data.user);
        setContactWa(data.user.whatsapp || "");
      }
    } catch {
      // Not logged in
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!topic || !title || !message) {
      setErrorMsg("Harap lengkapi Topik, Judul, dan Pesan Keluhan Anda.");
      return;
    }

    if (!user && !contactWa) {
      setErrorMsg("Pelanggan Tamu wajib mengisi Nomor WhatsApp untuk kepentingan membalas pesan.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/user/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          title,
          orderId,
          contactWa,
          message,
        })
      });

      const j = await res.json();
      if (!res.ok) {
        setErrorMsg(j.error || "Gagal membuat tiket.");
        setIsSubmitting(false);
        return;
      }

      // Success, route to ticket detail
      alert(`Berhasil membuat tiket dengan Nomor: ${j.ticket.ticketNo}. Harap simpan nomor tiket ini jika Anda adalah Pelanggan Tamu!`);
      
      if (!user) {
         router.push(`/bantuan/${j.ticket.ticketNo}?wa=${encodeURIComponent(contactWa)}`);
      } else {
         router.push(`/bantuan`);
      }
    } catch (e: any) {
      setErrorMsg("Terjadi kesalahan sistem.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page">
      <div className="bgGlow" aria-hidden="true" />
      <div className="gridFx" aria-hidden="true" />
      <Navbar />

      <div className="shell" style={{ display: "flex", flexDirection: "column", minHeight: "80vh", padding: "60px 10px" }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", marginTop: 100 }}>Loading...</div>
        ) : (
          <div style={{ maxWidth: 650, margin: "0 auto", width: "100%" }}>
            
            <div style={{ marginBottom: 30 }}>
              <h1 style={{ fontSize: 28, fontWeight: 900 }}>Buka Tiket Bantuan</h1>
              <p style={{ color: "rgba(255,255,255,0.6)", marginTop: 4 }}>
                  Kami dan robot representatif kami siap memandu masalah Anda hingga tuntas.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 24, padding: "30px", backdropFilter: "blur(12px)" }}>
              {errorMsg && <div style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", padding: 12, borderRadius: 8, fontSize: 13, marginBottom: 20, fontWeight: 700 }}>{errorMsg}</div>}
              
              {!user && (
                 <div style={{ background: "rgba(245,158,11,0.1)", border: "1px dashed rgba(245,158,11,0.3)", padding: 16, borderRadius: 12, marginBottom: 24 }}>
                    <h4 style={{ color: "#f59e0b", fontSize: 13, fontWeight: 800, marginBottom: 4 }}>Informasi Pengguna Tamu</h4>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>Anda saat ini melapor tidak menggunakan akun. Harap masukkan Nomor WhatsApp dan simpan Nomor Tiket yang akan diberikan sesaat setelah pembuatan keluhan ini berhasil.</p>
                 </div>
              )}

              <div style={{ display: "grid", gap: 20 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>Topik Masalah</label>
                  <select 
                     className="contact-input" 
                     value={topic}
                     onChange={e => setTopic(e.target.value)}
                     style={{ background: "rgba(255,255,255,0.03)", padding: "14px 12px" }}
                  >
                     <option value="">Pilih Topik Keluhan...</option>
                     <option value="Topup Belum Masuk">Topup Belum Masuk</option>
                     <option value="Proses Joki Lama">Proses Joki Lama</option>
                     <option value="Gagal Pembayaran">Gagal Pembayaran</option>
                     <option value="Lainnya">Masalah Lainnya</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>Judul Deskripsi Singkat</label>
                  <input 
                    className="contact-input" 
                    style={{ background: "rgba(255,255,255,0.03)", padding: 14 }}
                    placeholder="Misal: Saya transfer 50rb kok belum terproses?"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                   <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>No. Faktur (Invoice) (Opsional)</label>
                      <input 
                        className="contact-input" 
                        style={{ background: "rgba(255,255,255,0.03)", padding: 14 }}
                        placeholder="Misal: INV-24XXXXX"
                        value={orderId}
                        onChange={e => setOrderId(e.target.value)}
                      />
                   </div>
                   <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>No. WhatsApp Berjalan</label>
                      <input 
                        className="contact-input" 
                        style={{ background: "rgba(255,255,255,0.03)", padding: 14 }}
                        placeholder="08123xxxxxx"
                        value={contactWa}
                        onChange={e => setContactWa(e.target.value)}
                        disabled={!!user}
                      />
                   </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>Detail Laporan</label>
                  <textarea 
                    className="contact-input" 
                    style={{ background: "rgba(255,255,255,0.03)", padding: 14, minHeight: 120, resize: "vertical" }}
                    placeholder="Ceritakan dengan jelas keluhan Anda di sini untuk mempermudah investigasi."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ marginTop: 30, display: "flex", gap: 14, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => router.back()} style={{
                   padding: "14px 24px", borderRadius: "12px", background: "transparent", color: "#fff",
                   border: "1px solid rgba(255,255,255,0.1)", fontWeight: 800, fontSize: 14, cursor: "pointer",
                }}>
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} style={{
                  padding: "14px 30px", borderRadius: "12px",
                  background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff",
                  border: "none", fontWeight: 800, fontSize: 14, cursor: "pointer",
                  boxShadow: "0 10px 20px rgba(16,185,129,0.3)"
                }}>
                  {isSubmitting ? "Mengirim..." : "Kirimkan Tiket Laporan"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
