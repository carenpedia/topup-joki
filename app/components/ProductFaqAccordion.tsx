"use client";

import React, { useState } from "react";

const FAQ_DATA = [
  {
    question: "Bagaimana cara melakukan pesanan?",
    answer: "Sangat mudah! Masukkan data akun (ID & Server/Nickname), pilih nominal produk yang Anda inginkan, tentukan metode pembayaran, isi kontak WhatsApp, dan klik tombol 'Pesan Sekarang!'.",
  },
  {
    question: "Berapa lama waktu proses transaksinya?",
    answer: "Sebagian besar layanan kami diproses secara Instan (detik itu juga). Untuk beberapa layanan khusus seperti Joki, estimasi waktu penyelesaian bergantung pada antrean dan kerumitan target yang diminta.",
  },
  {
    question: "Apakah data akun untuk Joki aman?",
    answer: "Tentu! Kami menerapkan standar privasi yang ketat. Semua data login Anda diamankan dan pesanan dikerjakan oleh profesional. Setelah pengerjaan selesai, kami merekomendasikan Anda untuk segera mengganti kata sandi.",
  },
  {
    question: "Apa yang harus dilakukan jika pesanan lama atau bermasalah?",
    answer: "Jika pesanan Anda belum masuk lewat dari 15 menit atau terdapat kendala dalam transaksi, segera hubungi Pusat Bantuan kami melalui WhatsApp. Jangan lupa sertakan Nomor Pesanan/Invoice Anda.",
  },
  {
    question: "Metode pembayaran apa saja yang tersedia?",
    answer: "Kami menerima berbagai bentuk pembayaran mulai dari E-Wallet (OVO, DANA, GoPay, ShopeePay, LinkAja), Transfer Bank (BCA, Mandiri, BNI, BRI), QRIS, hingga berbagai gerai minimarket.",
  },
];

export default function ProductFaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // Default open first

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="topupWrap" style={{ marginTop: 24 }}>
      <div className="faqSection">
        <h3 className="faqTitle">Pertanyaan Umum (FAQ)</h3>
        
        <div className="faqAccordionList">
          {FAQ_DATA.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className={`faqItem ${isOpen ? "open" : ""}`}>
                <button
                  type="button"
                  className="faqHeader"
                  onClick={() => toggle(idx)}
                >
                  <span className="faqQuestionText">{item.question}</span>
                  <div className={`faqIcon ${isOpen ? "rotate" : ""}`}>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </button>
                
                <div className="faqContentWrap">
                  <div className="faqContentInner">
                    <p className="faqAnswerText">{item.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
