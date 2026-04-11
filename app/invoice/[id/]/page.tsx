"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import "../invoice.css";

type OrderData = {
  orderNo: string;
  status: string;
  game: {
    name: string;
    logoUrl: string | null;
  } | null;
  productName: string;
  inputUserId: string;
  inputServer?: string;
  finalPayable: number;
  paymentMethod: string;
  paymentGateway?: string;
  gatewayMethodKey?: string;
  paidAt?: string;
  expiresAt?: string;
  createdAt: string;
  payment?: {
    gateway: string;
    status: string;
    raw: any;
  } | null;
};

function rupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export default function Invoice({ params }: { params: { id: string } }) {
  const [data, setData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState<number>(0);

  async function fetchOrder() {
    try {
      const res = await fetch(`/api/orders/${params.id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mengambil data pesanan");
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [params.id]);

  useEffect(() => {
    if (!data?.expiresAt || data.status !== "PENDING_PAYMENT") {
      setTimeLeft(0);
      return;
    }

    const timer = setInterval(() => {
      const diff = new Date(data.expiresAt!).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft(0);
        clearInterval(timer);
        fetchOrder();
      } else {
        setTimeLeft(Math.floor(diff / 1000));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [data]);

  const timerText = useMemo(() => {
    if (timeLeft <= 0) return "EXPIRED";
    const h = Math.floor(timeLeft / 3600);
    const m = Math.floor((timeLeft % 3600) / 60);
    const s = timeLeft % 60;
    return `${h > 0 ? `${h}:` : ""}${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, [timeLeft]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Berhasil disalin!");
  };

  if (loading) {
    return (
      <main className="invoicePage">
        <Navbar />
        <div className="invoiceWrap" style={{ textAlign: "center", padding: "100px 0" }}>
          <div className="spinner-border text-primary" role="status"></div>
          <p style={{ marginTop: 20, color: "rgba(255,255,255,0.5)" }}>Memuat detail pesanan...</p>
        </div>
        <Footer />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="invoicePage">
        <Navbar />
        <div className="invoiceWrap" style={{ textAlign: "center", padding: "100px 0" }}>
          <h2 style={{ color: "#ef4444" }}>Oops!</h2>
          <p style={{ color: "rgba(255,255,255,0.7)" }}>{error || "Pesanan tidak ditemukan"}</p>
          <button onClick={() => window.location.reload()} className="invoiceBtn invoiceBtnPrimary" style={{ margin: "20px auto" }}>
            Coba Lagi
          </button>
        </div>
        <Footer />
      </main>
    );
  }

  // Get QR URL if exists (Tripay specific)
  const qrUrl = data.payment?.raw?.qr_url || data.payment?.raw?.payment_url;
  const payCode = data.payment?.raw?.pay_code;

  return (
    <main className="invoicePage">
      <Navbar />

      <div className="invoiceWrap">
        <div className="invoiceHero">
          <div className={`invoiceStatusBadge status-${data.status}`}>
            <span className="dot" />
            {data.status.replace("_", " ")}
          </div>
          <h1 className="invoiceTitle">Terima Kasih!</h1>
          <p className="invoiceSub">Pesanan #{data.orderNo} sedang kami pantau.</p>
        </div>

        <div className="invoiceCard">
          <div className="gameInfoBox">
            {data.game?.logoUrl ? (
              <img src={data.game.logoUrl} alt={data.game.name} className="gameLogo" />
            ) : (
              <div className="gameLogo" style={{ background: "rgba(255,255,255,0.05)", display: "grid", placeItems: "center" }}>
                {data.game?.name[0]}
              </div>
            )}
            <div className="gameText">
              <div className="gameName">{data.game?.name}</div>
              <div className="productName">{data.productName}</div>
            </div>
          </div>

          <div className="invoiceSectionTitle">Detail Pesanan</div>
          <div className="invoiceGrid">
            <div className="invoiceItem">
              <span className="invoiceLabel">Nomor Order</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="invoiceValue">{data.orderNo}</span>
                <button onClick={() => copyToClipboard(data.orderNo)} className="copyBtn">Salin</button>
              </div>
            </div>
            <div className="invoiceItem">
              <span className="invoiceLabel">Waktu Transaksi</span>
              <span className="invoiceValue">{new Date(data.createdAt).toLocaleString("id-ID")}</span>
            </div>
            <div className="invoiceItem">
              <span className="invoiceLabel">User ID</span>
              <span className="invoiceValue">{data.inputUserId} {data.inputServer ? `(${data.inputServer})` : ""}</span>
            </div>
            <div className="invoiceItem">
              <span className="invoiceLabel">Metode Bayar</span>
              <span className="invoiceValue">{data.paymentMethod} {data.paymentGateway ? `- ${data.paymentGateway}` : ""}</span>
            </div>
          </div>

          <div className="invoiceDivider" />

          <div className="invoiceTotalRow">
            <span className="invoiceTotalLabel">Total Bayar</span>
            <span className="invoiceTotalPrice">{rupiah(data.finalPayable)}</span>
          </div>
        </div>

        {data.status === "PENDING_PAYMENT" && (
          <div className="invoiceCard" style={{ borderColor: "rgba(59, 130, 246, 0.3)", background: "rgba(59, 130, 246, 0.05)" }}>
            <div className="invoiceSectionTitle">Instruksi Pembayaran</div>
            
            {qrUrl && data.gatewayMethodKey === "QRIS" ? (
              <div className="qrContainer">
                <p className="invoiceLabel" style={{ textAlign: "center" }}>Scan QR Code di bawah ini</p>
                <div className="qrBox">
                  <img src={qrUrl} alt="QRIS" className="qrImg" />
                </div>
                <div className="invoiceTimer">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  Sudah bayar? Status akan update otomatis. Sisa waktu: {timerText}
                </div>
              </div>
            ) : payCode ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <p className="invoiceLabel">Kode Pembayaran / VA</p>
                <div style={{ fontSize: 28, fontWeight: 950, color: "#60a5fa", margin: "10px 0", letterSpacing: 2 }}>{payCode}</div>
                <button onClick={() => copyToClipboard(payCode)} className="invoiceBtn invoiceBtnGhost" style={{ margin: "0 auto" }}>Salin Kode</button>
                <div className="invoiceTimer" style={{ justifyContent: "center", marginTop: 20 }}>
                  Sisa waktu bayar: {timerText}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <p className="invoiceSub">Silakan selesaikan pembayaran melalui link berikut:</p>
                <a href={data.payment?.raw?.checkout_url || data.payment?.raw?.payment_url} target="_blank" rel="noreferrer" className="invoiceBtn invoiceBtnPrimary" style={{ marginTop: 16 }}>
                  Bayar Sekarang
                </a>
              </div>
            )}
          </div>
        )}

        {data.status === "PAID" || data.status === "SUCCESS" && (
          <div className="invoiceCard" style={{ borderColor: "rgba(16, 185, 129, 0.3)", background: "rgba(16, 185, 129, 0.05)" }}>
             <p style={{ textAlign: "center", color: "#10b981", fontWeight: 800 }}>
               ✅ Pembayaran Berhasil! Pesanan Anda sedang diproses dan akan segera masuk.
             </p>
          </div>
        )}

        <div className="invoiceActions">
          <button onClick={fetchOrder} className="invoiceBtn invoiceBtnGhost">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
            Cek Status
          </button>
          <a href="https://wa.me/62812345678" target="_blank" rel="noreferrer" className="invoiceBtn invoiceBtnGhost">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            Hubungi CS
          </a>
        </div>

        <div style={{ textAlign: "center", marginTop: 40 }}>
           <a href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, textDecoration: "none", fontWeight: 700 }}>
             &larr; Kembali ke Beranda
           </a>
        </div>
      </div>

      <Footer />
    </main>
  );
}
