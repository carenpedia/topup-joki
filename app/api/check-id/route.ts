import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Konfigurasi game untuk validasi nickname via Codashop
 * Menggunakan data yang sudah teruji dari library check-ign (karyanayandi)
 * 
 * - voucherPricePointId: ID price point yang valid di Codashop
 * - price: harga produk yang valid
 * - voucherTypeName: nama tipe voucher di sistem Codashop
 * - voucherTypeId/gvtId: optional identifiers
 * - needsZone: apakah game ini butuh zone/server ID
 * - apiSlug: slug untuk fallback API isan.eu.org
 */
type GameConfig = {
  voucherPricePointId: string;
  price: string;
  voucherTypeName: string;
  voucherTypeId?: string;
  gvtId?: string;
  needsZone: boolean;
  useRoles?: boolean; // AOV & CODM use confirmationFields.roles
  apiSlug: string;    // untuk fallback ke isan.eu.org
};

const GAME_CONFIG: Record<string, GameConfig> = {
  // Mobile Legends
  "mobile-legends": {
    voucherPricePointId: "4150",
    price: "1579.0",
    voucherTypeName: "MOBILE_LEGENDS",
    voucherTypeId: "1",
    gvtId: "1",
    needsZone: true,
    apiSlug: "ml",
  },
  "mlbb": {
    voucherPricePointId: "4150",
    price: "1579.0",
    voucherTypeName: "MOBILE_LEGENDS",
    voucherTypeId: "1",
    gvtId: "1",
    needsZone: true,
    apiSlug: "ml",
  },

  // Free Fire
  "free-fire": {
    voucherPricePointId: "8050",
    price: "1000.0",
    voucherTypeName: "FREEFIRE",
    voucherTypeId: "1",
    gvtId: "1",
    needsZone: false,
    apiSlug: "ff",
  },
  "freefire": {
    voucherPricePointId: "8050",
    price: "1000.0",
    voucherTypeName: "FREEFIRE",
    voucherTypeId: "1",
    gvtId: "1",
    needsZone: false,
    apiSlug: "ff",
  },
  "ff": {
    voucherPricePointId: "8050",
    price: "1000.0",
    voucherTypeName: "FREEFIRE",
    voucherTypeId: "1",
    gvtId: "1",
    needsZone: false,
    apiSlug: "ff",
  },

  // Genshin Impact
  "genshin-impact": {
    voucherPricePointId: "116054",
    price: "16500.0",
    voucherTypeName: "GENSHIN_IMPACT",
    needsZone: true,
    apiSlug: "gi",
  },
  "genshin": {
    voucherPricePointId: "116054",
    price: "16500.0",
    voucherTypeName: "GENSHIN_IMPACT",
    needsZone: true,
    apiSlug: "gi",
  },

  // Honkai Star Rail
  "honkai-star-rail": {
    voucherPricePointId: "855316",
    price: "16000.0",
    voucherTypeName: "HONKAI_STAR_RAIL",
    needsZone: true,
    apiSlug: "hsr",
  },
  "honkai": {
    voucherPricePointId: "855316",
    price: "16000.0",
    voucherTypeName: "HONKAI_STAR_RAIL",
    needsZone: true,
    apiSlug: "hsr",
  },

  // Arena of Valor
  "arena-of-valor": {
    voucherPricePointId: "7946",
    price: "10000.0",
    voucherTypeName: "AOV",
    voucherTypeId: "1",
    gvtId: "1",
    needsZone: false,
    useRoles: true,
    apiSlug: "aov",
  },
  "aov": {
    voucherPricePointId: "7946",
    price: "10000.0",
    voucherTypeName: "AOV",
    voucherTypeId: "1",
    gvtId: "1",
    needsZone: false,
    useRoles: true,
    apiSlug: "aov",
  },

  // Call of Duty Mobile
  "call-of-duty-mobile": {
    voucherPricePointId: "46114",
    price: "5000.0",
    voucherTypeName: "CALL_OF_DUTY",
    voucherTypeId: "1",
    gvtId: "1",
    needsZone: false,
    useRoles: true,
    apiSlug: "codm",
  },
  "codm": {
    voucherPricePointId: "46114",
    price: "5000.0",
    voucherTypeName: "CALL_OF_DUTY",
    voucherTypeId: "1",
    gvtId: "1",
    needsZone: false,
    useRoles: true,
    apiSlug: "codm",
  },

  // Valorant
  "valorant": {
    voucherPricePointId: "115691",
    price: "15000.0",
    voucherTypeName: "VALORANT",
    voucherTypeId: "109",
    gvtId: "139",
    needsZone: false,
    apiSlug: "valo",
  },

  // Honkai Impact 3
  "honkai-impact-3": {
    voucherPricePointId: "48160",
    price: "16500.0",
    voucherTypeName: "HONKAI_IMPACT",
    needsZone: false,
    apiSlug: "hi",
  },
};

// Simple in-memory cache agar tidak terlalu sering hit endpoint
const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = 60 * 1000; // Cache 60 detik

function getCached(key: string) {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expiry) return entry.data;
  cache.delete(key);
  return null;
}

function setCache(key: string, data: any) {
  cache.set(key, { data, expiry: Date.now() + CACHE_TTL });
  // Bersihkan cache lama jika terlalu banyak
  if (cache.size > 500) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
}

/**
 * Resolve zoneId untuk Genshin Impact berdasarkan prefix UID
 */
function resolveGenshinZone(userId: string): string {
  if (userId.startsWith("6")) return "os_usa";
  if (userId.startsWith("7")) return "os_euro";
  if (userId.startsWith("8")) return "os_asia";
  if (userId.startsWith("9")) return "os_cht";
  return "os_asia"; // default
}

/**
 * Resolve zoneId untuk Honkai Star Rail berdasarkan prefix UID
 */
function resolveHSRZone(userId: string): string {
  if (userId.startsWith("6")) return "prod_official_usa";
  if (userId.startsWith("7")) return "prod_official_eur";
  if (userId.startsWith("8")) return "prod_official_asia";
  if (userId.startsWith("9")) return "prod_official_cht";
  return "prod_official_asia"; // default
}

/**
 * Metode 1: Langsung ke Codashop via initPayment.action
 * Endpoint yang benar adalah /initPayment.action (bukan /initPayment)
 */
async function checkViaCodashop(
  config: GameConfig,
  userId: string,
  zoneId: string
): Promise<{ success: boolean; nickname?: string; region?: string | null; message?: string }> {
  // Build form body sesuai format yang benar
  const params = new URLSearchParams();
  params.append("voucherPricePoint.id", config.voucherPricePointId);
  params.append("voucherPricePoint.price", config.price);
  params.append("voucherPricePoint.variablePrice", "0");
  params.append("user.userId", userId);

  if (config.needsZone || zoneId) {
    params.append("user.zoneId", zoneId);
  }

  params.append("voucherTypeName", config.voucherTypeName);
  params.append("shopLang", "id_ID");

  if (config.voucherTypeId) {
    params.append("voucherTypeId", config.voucherTypeId);
  }
  if (config.gvtId) {
    params.append("gvtId", config.gvtId);
  }

  const response = await fetch("https://order-sg.codashop.com/initPayment.action", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
    signal: AbortSignal.timeout(8000),
  });

  const data = await response.json();

  if (data.RESULT_CODE === "SUCCESS" || data.success === true) {
    const cf = data.confirmationFields;
    if (!cf) {
      return { success: false, message: "Respon tidak memiliki data konfirmasi" };
    }

    let nickname = "";

    // AOV & CODM menggunakan roles[0].role
    if (config.useRoles && cf.roles && cf.roles.length > 0) {
      nickname = cf.roles[0].role;
    } else if (cf.username) {
      // Decode URL-encoded nickname
      nickname = decodeURIComponent(cf.username.replace(/\+/g, " "));
    }

    if (!nickname) {
      return { success: false, message: "Username tidak ditemukan dalam respon" };
    }

    return {
      success: true,
      nickname,
      region: cf.country || cf.region || null,
    };
  }

  // Error dari Codashop
  if (data.errorMsg) {
    return { success: false, message: data.errorMsg };
  }

  return { success: false, message: "ID tidak valid atau tidak ditemukan" };
}

/**
 * Metode 2 (Fallback): Gunakan API publik isan.eu.org
 * API ini juga mengambil data dari Codashop tapi dari Cloudflare Workers
 */
async function checkViaFallbackAPI(
  config: GameConfig,
  userId: string,
  zoneId: string
): Promise<{ success: boolean; nickname?: string; region?: string | null; message?: string }> {
  const params = new URLSearchParams();
  params.append("id", userId);
  if (zoneId) {
    params.append("server", zoneId);
  }
  params.append("decode", "false"); // Lebih stabil

  const url = `https://api.isan.eu.org/nickname/${config.apiSlug}?${params.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    signal: AbortSignal.timeout(10000),
  });

  const data = await response.json();

  if (data.success && data.name) {
    const nickname = decodeURIComponent(
      (data.name as string).replace(/\+/g, " ")
    );
    return {
      success: true,
      nickname,
      region: data.server || null,
    };
  }

  return {
    success: false,
    message: data.message || "ID tidak ditemukan",
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, message: "Request body kosong" });
    }

    const { userId, zoneId, gameCode } = body;

    if (!userId || !gameCode) {
      return NextResponse.json({ success: false, message: "User ID dan Game Code wajib diisi" });
    }

    // Cari konfigurasi game
    const gameKey = gameCode.toLowerCase().trim();
    const config = GAME_CONFIG[gameKey];

    if (!config) {
      return NextResponse.json({ success: false, message: "Validasi tidak tersedia untuk game ini" });
    }

    // Resolve zoneId untuk game yang auto-detect region
    let resolvedZoneId = zoneId || "";
    if (gameKey.includes("genshin") && !zoneId) {
      resolvedZoneId = resolveGenshinZone(userId);
    } else if ((gameKey.includes("honkai-star") || gameKey === "honkai") && !zoneId) {
      resolvedZoneId = resolveHSRZone(userId);
    }

    // Cek cache
    const cacheKey = `${gameKey}:${userId}:${resolvedZoneId}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // === Metode 1: Codashop Langsung ===
    try {
      const result = await checkViaCodashop(config, userId, resolvedZoneId);
      if (result.success) {
        setCache(cacheKey, result);
        return NextResponse.json(result);
      }

      // Jika ID memang tidak valid, langsung return error tanpa fallback
      if (result.message && (
        result.message.includes("tidak valid") ||
        result.message.includes("not found") ||
        result.message.includes("invalid")
      )) {
        return NextResponse.json(result);
      }

      // Codashop gagal, tapi bukan karena ID invalid — coba fallback
      console.log("[CHECK_ID] Codashop gagal, mencoba fallback...", result.message);
    } catch (codashopErr: any) {
      console.log("[CHECK_ID] Codashop error, mencoba fallback...", codashopErr.message);
    }

    // === Metode 2: Fallback ke API isan.eu.org ===
    try {
      const fallbackResult = await checkViaFallbackAPI(config, userId, resolvedZoneId);
      if (fallbackResult.success) {
        setCache(cacheKey, fallbackResult);
      }
      return NextResponse.json(fallbackResult);
    } catch (fallbackErr: any) {
      console.error("[CHECK_ID] Fallback juga gagal:", fallbackErr.message);
      return NextResponse.json({
        success: false,
        message: "Gagal memvalidasi ID. Silakan coba lagi nanti.",
      });
    }
  } catch (error: any) {
    console.error("[CHECK_ID_ERROR]", error.message);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan sistem. Silakan coba lagi.",
      },
      { status: 500 }
    );
  }
}
