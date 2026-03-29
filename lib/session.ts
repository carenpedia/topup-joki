import { jwtVerify, SignJWT } from "jose";
import type { NextRequest } from "next/server";

export type SessionPayload = {
    userId: string;
    role: "MEMBER" | "RESELLER" | "ADMIN";
    status?: "ACTIVE" | "SUSPENDED" | "DELETED";
};

const COOKIE_NAME = "session";

// Wajib ada di .env: AUTH_SECRET="random panjang"
const DEFAULT_SECRET = "128ard128n4b1l4k4zu41ly010603f02030";

function getSecretKey() {
    const secret = process.env.AUTH_SECRET || DEFAULT_SECRET;
    return new TextEncoder().encode(secret);
}

/* =========================
 * Session JWT (cookie 'session')
 * ========================= */
export async function signSession(payload: SessionPayload) {
    // exp 7 hari
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(getSecretKey());
}

export async function verifySession(token: string): Promise<SessionPayload> {
    const { payload } = await jwtVerify(token, getSecretKey());
    const userId = String(payload.userId || "");
    const role = String(payload.role || "") as SessionPayload["role"];
    const status = (payload.status as SessionPayload["status"]) || "ACTIVE"; // Fallback to ACTIVE

    if (status === "SUSPENDED") {
        throw new Error("Akun kamu sedang diblokir Admin, Silahkan Hubungi CS/Admin.");
    }

    if (!userId) throw new Error("Invalid session (missing userId)");
    if (role !== "MEMBER" && role !== "RESELLER" && role !== "ADMIN") {
        throw new Error("Invalid session (role)");
    }

    return { userId, role, status };
}

/* =========================
 * Helpers: read session from cookies
 * ========================= */
export function getSessionTokenFromRequest(req: NextRequest): string | null {
    return req.cookies.get(COOKIE_NAME)?.value || null;
}

export async function requireSession(req: NextRequest): Promise<SessionPayload> {
    const token = getSessionTokenFromRequest(req);
    if (!token) throw new Error("Unauthorized");
    return verifySession(token);
}

export async function requireAdmin(req: NextRequest): Promise<SessionPayload> {
    const s = await requireSession(req);
    if (s.role !== "ADMIN") throw new Error("Forbidden");
    return s;
}
