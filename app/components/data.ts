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
  { slug: "mobile-legends", name: "Mobile Legends", tag: "Populer", category: "populer", logoText: "ML" },
  { slug: "free-fire", name: "Free Fire", tag: "Hemat", category: "populer", logoText: "FF" },
  { slug: "pubg-mobile", name: "PUBG Mobile", tag: "Aman", category: "populer", logoText: "PUBG" },
  { slug: "genshin-impact", name: "Genshin Impact", tag: "Terlaris", category: "populer", logoText: "GI" },

  { slug: "valorant", name: "Valorant", category: "lain", logoText: "VAL" },
  { slug: "honkai-star-rail", name: "Honkai: Star Rail", category: "lain", logoText: "HSR" },
  { slug: "codm", name: "Call of Duty Mobile", category: "lain", logoText: "COD" },
  { slug: "steam-wallet", name: "Steam Wallet", category: "lain", logoText: "SW" },
];
