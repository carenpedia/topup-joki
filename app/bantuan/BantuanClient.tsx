"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function BantuanClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);

  // Guest Search Form
  const [ticketNo, setTicketNo] = useState("");
  const [contactWa, setContactWa] = useState("");
  const [searchError, setSearchError] = useState("");

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data?.user) {
        setUser(data.user);
        loadTickets();
      }
    } catch {
      // Not logged in
    } finally {
      setLoading(false);
    }
  };

  const loadTickets = async () => {
    try {
      const res = await fetch("/api/user/tickets");
      if (res.ok) {
        const j = await res.json();
        setTickets(j.items || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleGuestSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketNo || !contactWa) {
      setSearchError("Nomor Tiket dan Nomor WhatsApp wajib diisi!");
      return;
    }
    // Redirect to the ticket details directly, passing the tracking verify params
    router.push(`/bantuan/${ticketNo}?wa=${encodeURIComponent(contactWa)}`);
  };

  return (
    <main className="page">
      <div className="bgGlow" aria-hidden="true" />
      <div className="gridFx" aria-hidden="true" />
      <Navbar />

      <div className="shell" style={{ display: "flex", flexDirection: "column", minHeight: "80vh", padding: "60px 10px" }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", marginTop: 100 }}>Loading...</div>
        ) : user ? (
          // VIEW UNTUK MEMBER (LOGGED IN)
          <div style={{ maxWidth: 800, margin: "0 auto", width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 900 }}>Pusat Bantuan</h1>
                <p style={{ color: "rgba(255,255,255,0.6)", marginTop: 4 }}>Daftar riwayat keluhan/komplain Anda.</p>
              </div>
              <Link href="/bantuan/new" className="voucherBtn" style={{ textDecoration: "none", display: "inline-block" }}>
                + Buat Laporan
              </Link>
            </div>

            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 24, padding: "20px" }}>
              {tickets.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.4)" }}>
                  Anda belum pernah membuat laporan bantuan.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {tickets.map(t => (
                    <Link
                      key={t.id}
                      href={`/bantuan/${t.ticketNo}`}
                      style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
                        borderRadius: 16, padding: "16px 20px", textDecoration: "none", color: "#fff",
                        transition: "all 0.2s"
                      }}
                      onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                      onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                    >
                       <div>
                          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>{t.title}</div>
                          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>🎟️ {t.ticketNo} • {new Date(t.createdAt).toLocaleDateString("id-ID")}</div>
                       </div>
                       <div>
                          <span style={{ 
                            padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 800,
                            background: t.status === "CLOSED" ? "rgba(255,0,0,0.1)" : t.status === "ANSWERED" ? "rgba(34,197,94,0.15)" : "rgba(59,130,246,0.15)",
                            color: t.status === "CLOSED" ? "#f87171" : t.status === "ANSWERED" ? "#4ade80" : "#60a5fa"
                          }}>
                             {t.status}
                          </span>
                       </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          // VIEW UNTUK TAMU (GUEST)
          <div style={{ maxWidth: 500, margin: "0 auto", width: "100%", marginTop: 40 }}>
            <div style={{ textAlign: "center", marginBottom: 30 }}>
              <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>Pusat Cek Bantuan</h1>
              <p style={{ color: "rgba(255,255,255,0.6)" }}>Lacak balasan pelaporan Anda dengan Nomor Tiket yang telah diberikan.</p>
            </div>

            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 24, padding: "30px", backdropFilter: "blur(12px)" }}>
                <form onSubmit={handleGuestSearch}>
                  {searchError && <div style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", padding: 12, borderRadius: 8, fontSize: 13, marginBottom: 16, fontWeight: 700 }}>{searchError}</div>}
                  
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>Nomor Tiket (Misal: TKT-1234ABCD)</label>
                    <input 
                      className="contact-input" 
                      style={{ background: "rgba(255,255,255,0.03)", padding: 14 }}
                      placeholder="Masukkan Nomor Tiket"
                      value={ticketNo}
                      onChange={e => setTicketNo(e.target.value)}
                    />
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>Nomor WhatsApp Verifikasi</label>
                    <input 
                      className="contact-input" 
                      style={{ background: "rgba(255,255,255,0.03)", padding: 14 }}
                      placeholder="Masukkan WA saat buat tiket (Misal: 08123..)"
                      value={contactWa}
                      onChange={e => setContactWa(e.target.value)}
                    />
                  </div>

                  <button type="submit" style={{
                    width: "100%", padding: "14px", borderRadius: "12px",
                    background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff",
                    border: "none", fontWeight: 800, fontSize: 15, cursor: "pointer",
                    boxShadow: "0 10px 20px rgba(59,130,246,0.3)"
                  }}>
                    Buka Percakapan Tiket
                  </button>
                </form>

                <div style={{ marginTop: 24, padding: "16px", background: "rgba(59,130,246,0.05)", border: "1px dashed rgba(59,130,246,0.2)", borderRadius: 16, textAlign: "center" }}>
                   <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>Belum memiliki tiket keluhan?</div>
                   <Link href="/bantuan/new" style={{ color: "#60a5fa", fontWeight: 900, fontSize: 15, textDecoration: "none" }}>Buat Laporan Baru →</Link>
                </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
