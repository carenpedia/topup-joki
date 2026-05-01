"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useConfig } from "../components/ConfigProvider";
import "../legal.css";

export default function SyaratKetentuanPage() {
  const config = useConfig();
  const SUPPORT_WHATSAPP = config.SUPPORT_WHATSAPP;
  const INSTAGRAM_URL = config.INSTAGRAM_URL;

  return (
    <main className="legalPage">
      <div className="legalBgGlow" aria-hidden="true" />
      <Navbar />

      <div className="legalShell">
        {/* Hero Section */}
        <div className="legalHero">
          <div className="legalHeroIcon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <h1 className="legalHeroTitle">Syarat & Ketentuan</h1>
          <p className="legalHeroSub">
            Terakhir diperbarui: 7 April 2026
          </p>
        </div>

        {/* Content */}
        <div className="legalCard">
          <div className="legalIntro">
            <p>
              Selamat datang di <strong>CarenPedia</strong>. Dengan mengakses dan menggunakan layanan kami, Anda menyetujui untuk mematuhi dan terikat oleh syarat dan ketentuan berikut. Harap baca dengan seksama sebelum menggunakan layanan kami.
            </p>
          </div>

          <section className="legalSection">
            <div className="legalSectionNum">01</div>
            <h2>Definisi</h2>
            <ul>
              <li><strong>&quot;Platform&quot;</strong> mengacu pada situs web CarenPedia beserta seluruh layanan yang tersedia di dalamnya.</li>
              <li><strong>&quot;Pengguna&quot;</strong> adalah setiap individu yang mengakses dan/atau menggunakan layanan yang disediakan oleh Platform.</li>
              <li><strong>&quot;Layanan&quot;</strong> merujuk pada seluruh produk dan fitur yang tersedia di Platform, termasuk namun tidak terbatas pada top up game, joki game, pembelian voucher, dan layanan digital lainnya.</li>
              <li><strong>&quot;Akun&quot;</strong> berarti akun terdaftar milik Pengguna pada Platform.</li>
            </ul>
          </section>

          <section className="legalSection">
            <div className="legalSectionNum">02</div>
            <h2>Ketentuan Umum</h2>
            <ul>
              <li>Pengguna harus berusia minimal <strong>13 tahun</strong> atau memiliki izin dari orang tua/wali untuk menggunakan Platform.</li>
              <li>Dengan mendaftar akun, Pengguna menjamin bahwa informasi yang diberikan adalah <strong>akurat dan benar</strong>.</li>
              <li>CarenPedia berhak untuk mengubah, memodifikasi, atau memperbarui syarat dan ketentuan ini kapan saja tanpa pemberitahuan terlebih dahulu.</li>
              <li>Pengguna bertanggung jawab penuh atas keamanan akun dan kata sandi masing-masing.</li>
            </ul>
          </section>

          <section className="legalSection">
            <div className="legalSectionNum">03</div>
            <h2>Layanan Top Up & Joki</h2>
            <ul>
              <li>CarenPedia menyediakan layanan top up game dan joki game dengan proses yang cepat dan aman.</li>
              <li>Pengguna <strong>wajib memasukkan data akun game dengan benar</strong> (User ID, Server ID, dll). Kesalahan dalam pengisian data menjadi tanggung jawab Pengguna sepenuhnya.</li>
              <li>Proses top up akan dilakukan secara otomatis setelah pembayaran dikonfirmasi. Waktu pemrosesan bervariasi tergantung provider.</li>
              <li>Untuk layanan joki, estimasi waktu pengerjaan bersifat perkiraan dan dapat berubah sesuai kondisi.</li>
              <li>Pengguna dilarang memberikan informasi login yang melanggar ketentuan game terkait.</li>
            </ul>
          </section>

          <section className="legalSection">
            <div className="legalSectionNum">04</div>
            <h2>Harga & Pembayaran</h2>
            <ul>
              <li>Semua harga yang tertera di Platform adalah dalam mata uang <strong>Rupiah (IDR)</strong> dan sudah termasuk biaya layanan.</li>
              <li>CarenPedia menyediakan berbagai metode pembayaran termasuk QRIS, transfer bank, e-wallet, dan metode lainnya.</li>
              <li>Harga dapat berubah sewaktu-waktu tanpa pemberitahuan. Harga yang berlaku adalah harga pada saat transaksi dilakukan.</li>
              <li>Pembayaran yang telah dikonfirmasi <strong>tidak dapat dibatalkan</strong> kecuali dalam kondisi tertentu yang disetujui oleh CarenPedia.</li>
            </ul>
          </section>

          <section className="legalSection">
            <div className="legalSectionNum">05</div>
            <h2>Kebijakan Pengembalian Dana (Refund)</h2>
            <ul>
              <li>Pengembalian dana hanya dapat dilakukan jika terjadi <strong>kegagalan sistem</strong> dari pihak CarenPedia.</li>
              <li>Jika kesalahan berasal dari Pengguna (contoh: salah input ID), maka pengembalian dana <strong>tidak berlaku</strong>.</li>
              <li>Proses refund membutuhkan waktu <strong>1-7 hari kerja</strong> setelah pengajuan disetujui.</li>
              <li>Pengajuan refund harus dilakukan melalui Customer Service resmi CarenPedia via WhatsApp.</li>
            </ul>
          </section>

          <section className="legalSection">
            <div className="legalSectionNum">06</div>
            <h2>Larangan Pengguna</h2>
            <p>Pengguna dilarang untuk:</p>
            <ul>
              <li>Menggunakan Platform untuk tujuan ilegal atau yang melanggar hukum yang berlaku.</li>
              <li>Melakukan tindakan yang dapat mengganggu, merusak, atau menghambat operasional Platform.</li>
              <li>Menyebarkan informasi palsu, menyesatkan, atau menipu terkait layanan CarenPedia.</li>
              <li>Melakukan penipuan atau tindakan curang termasuk namun tidak terbatas pada chargeback, penggunaan kartu curian, atau metode pembayaran ilegal.</li>
              <li>Membuatakun ganda untuk tujuan penyalahgunaan promosi atau program referral.</li>
            </ul>
          </section>

          <section className="legalSection">
            <div className="legalSectionNum">07</div>
            <h2>Batasan Tanggung Jawab</h2>
            <ul>
              <li>CarenPedia tidak bertanggung jawab atas kerugian yang timbul akibat <strong>kesalahan Pengguna</strong> dalam menggunakan layanan.</li>
              <li>CarenPedia tidak bertanggung jawab atas gangguan layanan yang disebabkan oleh force majeure, termasuk bencana alam, gangguan internet, atau kebijakan pihak ketiga.</li>
              <li>CarenPedia tidak menjamin bahwa layanan akan selalu tersedia tanpa gangguan atau error.</li>
            </ul>
          </section>

          <section className="legalSection">
            <div className="legalSectionNum">08</div>
            <h2>Hak Kekayaan Intelektual</h2>
            <ul>
              <li>Seluruh konten di Platform termasuk logo, desain, teks, dan grafik adalah milik CarenPedia dan dilindungi oleh hukum hak cipta.</li>
              <li>Pengguna dilarang menyalin, memodifikasi, atau mendistribusikan konten tanpa izin tertulis dari CarenPedia.</li>
            </ul>
          </section>

          <section className="legalSection">
            <div className="legalSectionNum">09</div>
            <h2>Penyelesaian Sengketa</h2>
            <ul>
              <li>Segala perselisihan yang timbul akan diselesaikan secara musyawarah terlebih dahulu.</li>
              <li>Jika musyawarah tidak mencapai kesepakatan, maka akan diselesaikan melalui jalur hukum yang berlaku di Indonesia.</li>
            </ul>
          </section>

          <section className="legalSection">
            <div className="legalSectionNum">10</div>
            <h2>Hubungi Kami</h2>
            <p>
              Jika Anda memiliki pertanyaan terkait Syarat & Ketentuan ini, silakan hubungi kami melalui:
            </p>
            <div className="legalContactBox">
              <a href={`https://wa.me/${SUPPORT_WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="legalContactItem">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.16 19.38L21.8 22l-2.62-.64A10 10 0 1 1 21.16 14.6l-1 2.5a3 3 0 0 0 .97 2.27z" />
                </svg>
                <span>WhatsApp Customer Service: {SUPPORT_WHATSAPP}</span>
              </a>
              <a href={config.INSTAGRAM_URL || "#"} target="_blank" rel="noopener noreferrer" className="legalContactItem">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
                <span>Instagram @{config.SITE_NAME?.toLowerCase()?.replace(/\s+/g, '_') || "caren_pedia"}</span>
              </a>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
