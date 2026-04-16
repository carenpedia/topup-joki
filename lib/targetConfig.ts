/**
 * lib/targetConfig.ts
 * Konfigurasi input target ID per tipe game.
 * Setiap game punya field `targetType` (String) di database,
 * yang di-mapping ke konfigurasi input fields di sini.
 */

export type TargetFieldConfig = {
  key: string;         // key untuk state & payload (misal: "userId", "server")
  label: string;       // label yang tampil di form
  placeholder: string;
  inputMode?: "numeric" | "text";
  required: boolean;
  type?: "text" | "select";
  options?: string[];  // untuk type="select", list pilihan
  hint?: string;       // teks bantuan kecil di bawah input
};

export type TargetTypeConfig = {
  label: string;           // nama tipe untuk dropdown di admin
  description: string;     // deskripsi singkat
  fields: TargetFieldConfig[];
};

/**
 * Mapping targetType → konfigurasi input fields.
 * Dipakai di:
 * - TopupClient.tsx: render input form
 * - Admin games form: dropdown pilihan tipe
 */
export const TARGET_TYPE_MAP: Record<string, TargetTypeConfig> = {
  DEFAULT: {
    label: "Default (User ID saja)",
    description: "Hanya 1 input: User ID",
    fields: [
      { key: "userId", label: "User ID", placeholder: "Masukkan User ID", inputMode: "numeric", required: true, hint: "Buka profil di game → ID ada di bawah username" },
    ],
  },

  ML_TYPE: {
    label: "Mobile Legends (User ID + Server)",
    description: "User ID + Zone ID / Server",
    fields: [
      { key: "userId", label: "User ID", placeholder: "Contoh: 12345678", inputMode: "numeric", required: true, hint: "Klik avatar profil → lihat angka di bawah nama" },
      { key: "server", label: "Server", placeholder: "Contoh: 1234", inputMode: "numeric", required: true, hint: "Angka dalam kurung di samping User ID" },
    ],
  },

  FF_TYPE: {
    label: "Free Fire (Player ID)",
    description: "Hanya Player ID",
    fields: [
      { key: "userId", label: "Player ID", placeholder: "Masukkan Player ID", inputMode: "numeric", required: true, hint: "Buka profil → ID ada di bagian atas profil" },
    ],
  },

  GENSHIN_TYPE: {
    label: "Genshin Impact (UID + Server)",
    description: "UID + pilihan Server region",
    fields: [
      { key: "userId", label: "UID", placeholder: "Contoh: 812345678", inputMode: "numeric", required: true, hint: "Buka Paimon Menu → lihat UID di pojok kanan bawah" },
      { key: "server", label: "Server", placeholder: "Pilih Server", required: true, type: "select", options: ["Asia", "America", "Europe", "TW/HK/MO"], hint: "Pilih sesuai region server akun kamu" },
    ],
  },

  RAGNAROK_TYPE: {
    label: "Ragnarok (User ID + Server)",
    description: "User ID + pilihan Server",
    fields: [
      { key: "userId", label: "User ID", placeholder: "Masukkan User ID", inputMode: "text", required: true, hint: "Buka Settings → lihat User ID di info akun" },
      { key: "server", label: "Server", placeholder: "Pilih Server", required: true, type: "select", options: ["Eternal Love", "Midnight Party", "Memory of Faith"], hint: "Pilih server tempat karakter kamu berada" },
    ],
  },

  WUTHERING_TYPE: {
    label: "Wuthering Waves (UID + Server)",
    description: "UID + pilihan Server region",
    fields: [
      { key: "userId", label: "UID", placeholder: "Masukkan UID", inputMode: "numeric", required: true, hint: "Buka Menu → Profile → lihat UID di sisi kiri" },
      { key: "server", label: "Server", placeholder: "Pilih Server", required: true, type: "select", options: ["Asia Pacific", "America", "Europe", "South East Asia"], hint: "Pilih sesuai region server akun kamu" },
    ],
  },

  COD_TYPE: {
    label: "Call of Duty Mobile (Player ID + Open ID)",
    description: "Player ID + Open ID",
    fields: [
      { key: "userId", label: "Player ID", placeholder: "Masukkan Player ID", inputMode: "numeric", required: true, hint: "Buka profil → lihat ID numerik di bawah nama" },
      { key: "server", label: "Open ID", placeholder: "Masukkan Open ID", inputMode: "text", required: true, hint: "Tersedia di Settings → Legal & Privacy → Open ID" },
    ],
  },

  VALORANT_TYPE: {
    label: "Valorant (Riot ID)",
    description: "Riot ID format: Nama#Tag",
    fields: [
      { key: "userId", label: "Riot ID", placeholder: "Contoh: Nama#1234", inputMode: "text", required: true, hint: "Format: NamaAkun#Tagline (contoh: Sultan#1234)" },
    ],
  },

  AOV_TYPE: {
    label: "Arena of Valor / AOV (Player ID)",
    description: "Hanya Player ID",
    fields: [
      { key: "userId", label: "Player ID", placeholder: "Masukkan Player ID", inputMode: "numeric", required: true, hint: "Buka profil → Player ID ada di bawah avatar" },
    ],
  },
};

/** Daftar key untuk dropdown di admin */
export const TARGET_TYPE_OPTIONS = Object.entries(TARGET_TYPE_MAP).map(([value, cfg]) => ({
  value,
  label: cfg.label,
}));

/** Get config, fallback ke DEFAULT jika tidak ditemukan */
export function getTargetConfig(targetType: string | null | undefined): TargetTypeConfig {
  return TARGET_TYPE_MAP[targetType || "DEFAULT"] || TARGET_TYPE_MAP["DEFAULT"];
}
