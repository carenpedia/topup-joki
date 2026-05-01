"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/app/components/ToastProvider";
import { useAsyncAction } from "@/app/components/useAsyncAction";

type Setting = {
  id: string;
  key: string;
  value: string;
  group: string;
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [activeTab, setActiveTab] = useState("GENERAL");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const toast = useToast();
  const { loading: saving, run: saveSettings } = useAsyncAction();

  // Load settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengambil pengaturan");
      setSettings(data);
      
      // Initialize form data
      const initialForm: Record<string, string> = {};
      data.forEach((s: Setting) => {
        initialForm[s.key] = s.value;
      });
      setFormData(initialForm);
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleSave() {
    await saveSettings(async () => {
      try {
        const res = await fetch("/api/admin/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal menyimpan");
        
        toast.success("Pengaturan berhasil disimpan! Perubahan akan segera terlihat di seluruh situs.");
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  }

  const tabs = [
    { id: "GENERAL", label: "Umum", icon: "🌐" },
    { id: "CONTACT", label: "Kontak", icon: "📞" },
    { id: "GATEWAY", label: "Payment Gateway", icon: "💳" },
    { id: "DEPOSIT", label: "Pengaturan Deposit", icon: "💰" },
    { id: "SEO", label: "SEO & Metadata", icon: "🔍" },
  ];

  const filteredSettings = settings.filter(s => s.group === activeTab);

  // If no settings exist yet for a group, we can show default placeholders
  // In a real app, early-bootstrap seeds would handle this, but here we can manage it.

  return (
    <div className="admin-dashboard-wrapper">
      <div className="dashboard-title-section">
        <h1 className="dashboard-title">⚙️ Pengaturan Web</h1>
        <p className="dashboard-subtitle">Kelola konfigurasi global website Anda secara dinamis.</p>
      </div>

      <div className="settings-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span style={{ marginRight: 8 }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-card">
        <div className="settings-grid">
          {filteredSettings.length === 0 && (
            <div style={{ padding: "40px 0", textAlign: "center", color: "rgba(255,255,255,0.2)" }}>
              Belum ada konfigurasi untuk kategori ini di database.
              <br />
              Sistem akan otomatis menambahkannya saat Anda memasukkan data dan menyimpannya.
            </div>
          )}

          {activeTab === "GENERAL" && (
            <>
              <FormGroup 
                label="Logo Website (URL)"
                value={formData["SITE_LOGO"] || ""}
                onChange={(url) => setFormData(p => ({ ...p, SITE_LOGO: url }))}
                help="Masukkan URL logo (PNG Transparan direkomendasikan). Muncul di Navbar dan Footer."
              />
              <FormGroup 
                label="Nama Website" 
                value={formData["SITE_NAME"] || ""} 
                onChange={(v) => setFormData(p => ({ ...p, SITE_NAME: v }))}
                help="Nama yang muncul di judul halaman dan logo teks."
              />
              <FormGroup 
                label="Slogan / Deskripsi Singkat" 
                value={formData["SITE_SLOGAN"] || ""} 
                onChange={(v) => setFormData(p => ({ ...p, SITE_SLOGAN: v }))}
                help="Akan muncul di bagian footer dan meta deskripsi."
              />
              <FormGroup 
                label="Logo CarenCoin (URL)" 
                value={formData["CARENCOIN_LOGO"] || ""} 
                onChange={(v) => setFormData(p => ({ ...p, CARENCOIN_LOGO: v }))}
                help="Masukkan URL gambar koin (PNG Transparan). Digunakan di sistem pembayaran CarenCoin."
              />
            </>
          )}

          {activeTab === "CONTACT" && (
            <>
              <FormGroup 
                label="WhatsApp CS (dengan kode negara, misal: 62812345678)" 
                value={formData["SUPPORT_WHATSAPP"] || ""} 
                onChange={(v) => setFormData(p => ({ ...p, SUPPORT_WHATSAPP: v }))}
                help="Digunakan untuk tombol chat bantuan di seluruh situs."
              />
              <FormGroup 
                label="Instagram URL" 
                value={formData["INSTAGRAM_URL"] || ""} 
                onChange={(v) => setFormData(p => ({ ...p, INSTAGRAM_URL: v }))}
                help="Link profil instagram Anda."
              />
              <FormGroup 
                label="TikTok URL" 
                value={formData["TIKTOK_URL"] || ""} 
                onChange={(v) => setFormData(p => ({ ...p, TIKTOK_URL: v }))}
                help="Link profil TikTok Anda."
              />
            </>
          )}

          {activeTab === "GATEWAY" && (
            <>
              <FormGroup 
                label="Status Midtrans" 
                value={formData["ENABLE_MIDTRANS"] || "ON"} 
                onChange={(v) => setFormData(p => ({ ...p, ENABLE_MIDTRANS: v }))}
                help="Ketik 'ON' untuk aktif, 'OFF' untuk nonaktif."
              />
              <FormGroup 
                label="Status Duitku" 
                value={formData["ENABLE_DUITKU"] || "ON"} 
                onChange={(v) => setFormData(p => ({ ...p, ENABLE_DUITKU: v }))}
                help="Ketik 'ON' untuk aktif, 'OFF' untuk nonaktif."
              />
              <FormGroup 
                label="Status Tripay" 
                value={formData["ENABLE_TRIPAY"] || "ON"} 
                onChange={(v) => setFormData(p => ({ ...p, ENABLE_TRIPAY: v }))}
                help="Ketik 'ON' untuk aktif, 'OFF' untuk nonaktif."
              />
              <FormGroup 
                label="Status Xendit" 
                value={formData["ENABLE_XENDIT"] || "ON"} 
                onChange={(v) => setFormData(p => ({ ...p, ENABLE_XENDIT: v }))}
                help="Ketik 'ON' untuk aktif, 'OFF' untuk nonaktif."
              />
            </>
          )}

          {activeTab === "DEPOSIT" && (
            <>
              <div style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#f59e0b" }}>🏦 Akun Deposit Manual</h3>
                <p style={{ fontSize: 13, opacity: 0.6 }}>Informasi rekening yang muncul saat user memilih metode manual.</p>
              </div>
              <FormGroup 
                label="Nama Bank / E-Wallet" 
                value={formData["DEPOSIT_MANUAL_BANK"] || ""} 
                onChange={(v) => setFormData(p => ({ ...p, DEPOSIT_MANUAL_BANK: v }))}
                help="Misal: Bank BCA, Dana, OVO."
              />
              <FormGroup 
                label="Nomor Rekening / HP" 
                value={formData["DEPOSIT_MANUAL_NOREK"] || ""} 
                onChange={(v) => setFormData(p => ({ ...p, DEPOSIT_MANUAL_NOREK: v }))}
                help="Nomor rekening tujuan transfer."
              />
              <FormGroup 
                label="Atas Nama" 
                value={formData["DEPOSIT_MANUAL_NAME"] || ""} 
                onChange={(v) => setFormData(p => ({ ...p, DEPOSIT_MANUAL_NAME: v }))}
                help="Nama pemilik rekening."
              />

              <div style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", margin: "20px 0" }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#3b82f6" }}>⚡ Deposit Otomatis (Gateway)</h3>
                <p style={{ fontSize: 13, opacity: 0.6 }}>Pilih gateway mana yang digunakan untuk deposit otomatis.</p>
              </div>
              <FormGroup 
                label="Preferred Gateway" 
                value={formData["DEPOSIT_AUTO_GATEWAY"] || "TRIPAY"} 
                onChange={(v) => setFormData(p => ({ ...p, DEPOSIT_AUTO_GATEWAY: v.toUpperCase() }))}
                help="Ketik TRIPAY, XENDIT, MIDTRANS, atau DUITKU."
              />

              <div style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", margin: "20px 0" }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#ec4899" }}>💎 Join Reseller</h3>
                <p style={{ fontSize: 13, opacity: 0.6 }}>Atur biaya pendaftaran reseller.</p>
              </div>
              <FormGroup 
                label="Harga Upgrade Reseller (Rp)" 
                value={formData["RESELLER_UPGRADE_PRICE"] || "45000"} 
                onChange={(v) => setFormData(p => ({ ...p, RESELLER_UPGRADE_PRICE: v }))}
                help="Harga yang harus dibayar user untuk menjadi Reseller."
              />
            </>
          )}

          {activeTab === "SEO" && (
            <>
              <FormGroup 
                label="Buka-Tutup Maintenance Mode" 
                value={formData["MAINTENANCE_MODE"] || "OFF"} 
                onChange={(v) => setFormData(p => ({ ...p, MAINTENANCE_MODE: v }))}
                help="Ketik 'ON' untuk mengaktifkan mode perbaikan, 'OFF' untuk normal."
              />
              <FormGroup 
                label="Google Analytics ID" 
                value={formData["GA_ID"] || ""} 
                onChange={(v) => setFormData(p => ({ ...p, GA_ID: v }))}
                help="ID pelacakan Google Analytics (G-XXXXXX)."
              />
            </>
          )}

          <div style={{ marginTop: 20 }}>
            <button 
              className="btn-primary" 
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Menyimpan..." : "💾 Simpan Perubahan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



function FormGroup({ label, value, onChange, help }: { label: string, value: string, onChange: (v: string) => void, help?: string }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input 
        type="text" 
        className="form-input" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
      />
      {help && <p className="form-help">{help}</p>}
    </div>
  );
}
