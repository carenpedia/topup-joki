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
      { key: "userId", label: "User ID", placeholder: "Masukkan User ID", inputMode: "numeric", required: true },
    ],
  },

  ML_TYPE: {
    label: "Mobile Legends (User ID + Server)",
    description: "User ID + Zone ID / Server",
    fields: [
      { key: "userId", label: "User ID", placeholder: "Contoh: 12345678", inputMode: "numeric", required: true },
      { key: "server", label: "Zone ID", placeholder: "Contoh: 1234", inputMode: "numeric", required: true },
    ],
  },

  FF_TYPE: {
    label: "Free Fire (Player ID)",
    description: "Hanya Player ID",
    fields: [
      { key: "userId", label: "Player ID", placeholder: "Masukkan Player ID", inputMode: "numeric", required: true },
    ],
  },

  GENSHIN_TYPE: {
    label: "Genshin Impact (UID + Server)",
    description: "UID + pilihan Server region",
    fields: [
      { key: "userId", label: "UID", placeholder: "Contoh: 812345678", inputMode: "numeric", required: true },
      { key: "server", label: "Server", placeholder: "Pilih Server", required: true, type: "select", options: ["Asia", "America", "Europe", "TW/HK/MO"] },
    ],
  },

  RAGNAROK_TYPE: {
    label: "Ragnarok (User ID + Server)",
    description: "User ID + pilihan Server",
    fields: [
      { key: "userId", label: "User ID", placeholder: "Masukkan User ID", inputMode: "text", required: true },
      { key: "server", label: "Server", placeholder: "Pilih Server", required: true, type: "select", options: ["Eternal Love", "Midnight Party", "Memory of Faith"] },
    ],
  },

  WUTHERING_TYPE: {
    label: "Wuthering Waves (UID + Server)",
    description: "UID + pilihan Server region",
    fields: [
      { key: "userId", label: "UID", placeholder: "Masukkan UID", inputMode: "numeric", required: true },
      { key: "server", label: "Server", placeholder: "Pilih Server", required: true, type: "select", options: ["Asia Pacific", "America", "Europe", "South East Asia"] },
    ],
  },

  COD_TYPE: {
    label: "Call of Duty Mobile (Player ID + Open ID)",
    description: "Player ID + Open ID",
    fields: [
      { key: "userId", label: "Player ID", placeholder: "Masukkan Player ID", inputMode: "numeric", required: true },
      { key: "server", label: "Open ID", placeholder: "Masukkan Open ID", inputMode: "text", required: true },
    ],
  },

  VALORANT_TYPE: {
    label: "Valorant (Riot ID)",
    description: "Riot ID format: Nama#Tag",
    fields: [
      { key: "userId", label: "Riot ID", placeholder: "Contoh: Nama#1234", inputMode: "text", required: true },
    ],
  },

  AOV_TYPE: {
    label: "Arena of Valor / AOV (Player ID)",
    description: "Hanya Player ID",
    fields: [
      { key: "userId", label: "Player ID", placeholder: "Masukkan Player ID", inputMode: "numeric", required: true },
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
