"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../legal.css";

export default function KebijakanPrivasiPage() {
  return (
    <main className="legalPage">
      <div className="legalBgGlow" aria-hidden="true" />
      <Navbar />

      <div className="legalShell">
        {/* Hero Section */}
        <div className="legalHero">
          <div className="legalHeroIcon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h1 className="legalHeroTitle">Kebijakan Privasi</h1>
          <p className="legalHeroSub">
            Terakhir diperbarui: 7 April 2026
          </p>
        </div>

        {/* Content */}
        <div className="legalCard">
          <div className="legalIntro">
            <p>
              <strong>CarenPedia</strong> berkomitmen untuk melindungi privasi dan keamanan data pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi yang Anda berikan saat menggunakan layanan kami.
            </p>
          </div>

          <section className="legalSection">
            <div className="legalSectionNum">01</div>
            <h2>Informasi yang Kami Kumpulkan</h2>
            <p>Kami mengumpulkan beberapa jenis informasi untuk memberikan layanan yang optimal:</p>

            <h3>a. Informasi Pribadi</h3>
            <ul>
              <li>Nama lengkap</li>
              <li>Alamat email</li>
              <li>Nomor telepon / WhatsApp</li>
              <li>Informasi akun game (User ID, Server ID)</li>
            </ul>

            <h3>b. Informasi Transaksi</h3>
            <ul>
              <li>Riwayat pembelian dan pembayaran</li>
              <li>Metode pembayaran yang digunakan</li>
              <li>Status dan detail pesanan</li>
            </ul>

            <h3>c. Informasi Teknis</h3>
            <ul>
              <li>Alamat IP</li>
              <li>Jenis perangkat dan browser</li>
              <li>Data cookie dan sesi</li>
              <li>Halaman yang dikunjungi dan waktu kunjungan</li>
            </ul>
          </section>

          <section className="legalSection">
            <div className="legalSectionNum">02</div>
            <h2>Penggunaan Informasi</h2>
            <p>Informasi yang kami kumpulkan digunakan untuk:</p>
            <ul>
              <li><strong>Memproses transaksi</strong> – Mengirimkan produk digital yang dipesan oleh Pengguna.</li>
              <li><strong>Verifikasi identitas</strong> – Memastikan keamanan akun dan mencegah tindakan penipuan.</li>
              <li><strong>Komunikasi</strong> – Mengirimkan notifikasi pesanan, pembaruan layanan, dan informasi promosi (jika disetujui).</li>
              <li><strong>Peningkatan layanan</strong> – Menganalisis pola penggunaan untuk mengoptimalkan pengalaman Pengguna.</li>
              <li><strong>Kepatuhan hukum</strong> – Memenuhi kewajiban hukum dan regulasi yang berlaku.</li>
            </ul>
          </section>

          <section className="legalSection">
            <div className="legalSectionNum">03</div>
            <h2>Penyimpanan & Keamanan Data</h2>
            <ul>
              <li>Seluruh data pribadi disimpan dengan <strong>enkripsi yang aman</strong> dan dilindungi oleh sistem keamanan berlapis.</li>
              <li>Kami menggunakan protokol <strong>HTTPS/SSL</strong> untuk melindungi transmisi data antara Pengguna dan Platform.</li>
              <li>Akses terhadap data pribadi dibatasi hanya untuk personel yang berwenang dan memiliki kebutuhan operasional.</li>
              <li>Data pribadi akan disimpan selama diperlukan untuk tujuan yang dinyatakan dalam kebijakan ini, atau selama diwajibkan oleh hukum.</li>
              <li>Kata sandi Pengguna disimpan dalam bentuk <strong>hash terenkripsi</strong> dan tidak dapat dibaca oleh siapa pun, termasuk tim CarenPedia.</li>
            </ul>
          </section>

          <section className="legalSection">
            <div className="legalSectionNum">04</div>
            <h2>Pembagian Data kepada Pihak Ketiga</h2>
            <p>CarenPedia <strong>tidak menjual, memperdagangkan, atau menyewakan</strong> data pribadi Anda kepada pihak ketiga. Namun, kami dapat membagikan informasi dalam situasi berikut:</p>
            <ul>
              <li><strong>Penyedia layanan pembayaran</strong> – Untuk memproses transaksi pembayaran secara aman (contoh: Tripay, Midtrans).</li>
              <li><strong>Penyedia layanan game</strong> – Untuk memproses top up dan pengiriman item digital (contoh: Digiflazz).</li>
              <li><strong>Kewajiban hukum</strong> – Jika diwajibkan oleh hukum, proses hukum, atau permintaan pemerintah yang sah.</li>
              <li><strong>Pencegahan penipuan</strong> – Untuk melindungi hak, properti, dan keamanan CarenPedia serta Pengguna.</li>
            </ul>
          </section>

          <section className="legalSection">
            <div className="legalSectionNum">05</div>
            <h2>Cookies & Teknologi Pelacakan</h2>
            <ul>
              <li>Platform kami menggunakan <strong>cookies</strong> untuk menyimpan preferensi Pengguna dan meningkatkan fungsionalitas situs.</li>
              <li>Cookies sesi digunakan untuk menjaga login Pengguna tetap aktif selama sesi browsing.</li>
              <li>Pengguna dapat mengelola pengaturan cookies melalui pengaturan browser masing-masing.</li>
              <li>Menonaktifkan cookies dapat memengaruhi fungsionalitas tertentu dari Platform.</li>
            </ul>
          </section>

          <section className="legalSection">
            <div className="legalSectionNum">06</div>
            <h2>Hak-Hak Pengguna</h2>
            <p>Sebagai Pengguna, Anda memiliki hak untuk:</p>
            <ul>
              <li><strong>Mengakses data</strong> – Meminta salinan data pribadi yang kami simpan tentang Anda.</li>
              <li><strong>Memperbarui data</strong> – Memperbaiki atau memperbarui informasi yang tidak akurat.</li>
              <li><strong>Menghapus data</strong> – Mengajukan permintaan penghapusan data pribadi Anda, dengan memperhatikan ketentuan penyimpanan legal.</li>
              <li><strong>Menolak pemasaran</strong> – Berhenti berlangganan dari komunikasi promosi kapan saja.</li>
              <li><strong>Menarik persetujuan</strong> – Mencabut izin pengolahan data yang sebelumnya telah diberikan.</li>
            </ul>
          </section>

          <section className="legalSection">
            <div className="legalSectionNum">07</div>
            <h2>Perlindungan Data Anak</h2>
            <ul>
              <li>Layanan CarenPedia tidak ditujukan untuk anak di bawah <strong>13 tahun</strong> tanpa pengawasan orang tua/wali.</li>
              <li>Kami tidak secara sengaja mengumpulkan data dari anak di bawah 13 tahun.</li>
              <li>Jika kami mengetahui bahwa data anak di bawah umur telah terkumpul tanpa izin orang tua, kami akan segera menghapus data tersebut.</li>
            </ul>
          </section>

          <section className="legalSection">
            <div className="legalSectionNum">08</div>
            <h2>Perubahan Kebijakan Privasi</h2>
            <ul>
              <li>CarenPedia berhak untuk memperbarui Kebijakan Privasi ini kapan saja.</li>
              <li>Perubahan signifikan akan diinformasikan melalui pemberitahuan di Platform atau melalui email.</li>
              <li>Penggunaan Platform setelah perubahan kebijakan dianggap sebagai persetujuan terhadap kebijakan yang diperbarui.</li>
              <li>Tanggal &quot;Terakhir diperbarui&quot; di bagian atas dokumen ini menunjukkan versi terkini.</li>
            </ul>
          </section>

          <section className="legalSection">
            <div className="legalSectionNum">09</div>
            <h2>Hubungi Kami</h2>
            <p>
              Jika Anda memiliki pertanyaan, keluhan, atau permintaan terkait Kebijakan Privasi ini, silakan hubungi kami melalui:
            </p>
            <div className="legalContactBox">
              <div className="legalContactItem">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.16 19.38L21.8 22l-2.62-.64A10 10 0 1 1 21.16 14.6l-1 2.5a3 3 0 0 0 .97 2.27z" />
                </svg>
                <span>WhatsApp Customer Service</span>
              </div>
              <div className="legalContactItem">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
                <span>Instagram @carenpedia</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
