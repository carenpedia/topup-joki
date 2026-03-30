export type Game = {
  slug: string;
  name: string;
  tag?: string;
  category: "populer" | "lain";
  logoText: string;
  imageUrl?: string; // URL gambar asli (jika ada)
};

export const promoSlides = [
  { title: "Promo Biru Week", desc: "Diskon khusus beberapa game populer", pill: "PROMO" },
  { title: "Flash Sale", desc: "Waktu terbatas — cek item yang lagi turun", pill: "FLASH" },
  { title: "Reseller Join 45K", desc: "Mulai jualan & dapet harga khusus", pill: "RESELLER" },
];

export const games: Game[] = [
  { slug: "free-fire-flash", name: "Free Fire FLASH SALE", tag: "Hemat", category: "populer", logoText: "FF" },
  { slug: "mobile-legends", name: "Mobile Legends", tag: "Populer", category: "populer", logoText: "ML" },
  { slug: "free-fire", name: "Free Fire", category: "populer", logoText: "FF" },
  { slug: "roblox-login", name: "ROBUX VIA LOGIN - ROBLOX", category: "populer", logoText: "RBX" },
  { slug: "genshin-impact", name: "Genshin Impact", category: "populer", logoText: "GI" },
  { slug: "pubg-mobile", name: "PUBG Mobile", category: "populer", logoText: "PUBG" },

export type Game = {
  slug: string;
  name: string;
  tag?: string;
  category: "populer" | "lain";
  logoText: string;
  imageUrl?: string; // URL gambar asli (jika ada)
};

export const promoSlides = [
  { title: "Promo Biru Week", desc: "Diskon khusus beberapa game populer", pill: "PROMO" },
  { title: "Flash Sale", desc: "Waktu terbatas — cek item yang lagi turun", pill: "FLASH" },
  { title: "Reseller Join 45K", desc: "Mulai jualan & dapet harga khusus", pill: "RESELLER" },
];

export const games: Game[] = [
  { slug: "free-fire-flash", name: "Free Fire FLASH SALE", tag: "Hemat", category: "populer", logoText: "FF" },
  { slug: "mobile-legends", name: "Mobile Legends", tag: "Populer", category: "populer", logoText: "ML" },
  { slug: "free-fire", name: "Free Fire", category: "populer", logoText: "FF" },
  { slug: "roblox-login", name: "ROBUX VIA LOGIN - ROBLOX", category: "populer", logoText: "RBX" },
  { slug: "genshin-impact", name: "Genshin Impact", category: "populer", logoText: "GI" },
  { slug: "pubg-mobile", name: "PUBG Mobile", category: "populer", logoText: "PUBG" },

  { slug: "valorant", name: "Valorant", category: "lain", logoText: "VAL" },
  { slug: "honkai-star-rail", name: "Honkai: Star Rail", category: "lain", logoText: "HSR" },
  { slug: "codm", name: "Call of Duty Mobile", category: "lain", logoText: "COD" },
  { slug: "steam-wallet", name: "Steam Wallet", category: "lain", logoText: "SW" },
  { slug: "point-blank", name: "Point Blank", category: "lain", logoText: "PB" },
  { slug: "eggy-party", name: "Eggy Party", category: "lain", logoText: "EP" },
  { slug: "clash-of-clans", name: "Clash of Clans", category: "lain", logoText: "COC" },
  { slug: "hay-day", name: "Hay Day", category: "lain", logoText: "HD" },
];

export const SUPPORT_WHATSAPP = "628983994865";
