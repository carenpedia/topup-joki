import "server-only";
import bcrypt from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";
import type { NextRequest } from "next/server";

export type SessionPayload = {
  userId: string;
  role: "MEMBER" | "RESELLER" | "ADMIN";
};

const COOKIE_NAME = "session";

// Wajib ada di .env: AUTH_SECRET="random panjang"
const secret = process.env.AUTH_SECRET;
if (!secret) {
  throw new Error("AUTH_SECRET belum di-set di .env");
}
const KEY = new TextEncoder().encode(secret);

/* =========================
 * Password hashing
 * ========================= */
export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
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
    .sign(KEY);
}

export async function verifySession(token: string): Promise<SessionPayload> {
  const { payload } = await jwtVerify(token, KEY);
  const userId = String(payload.userId || "");
  const role = String(payload.role || "") as SessionPayload["role"];

  if (payload.status === "SUSPENDED") {
    throw new Error("Akun kamu sedang diblokir Admin, Silahkan Hubungi CS/Admin.");
  }

  if (!userId) throw new Error("Invalid session (missing userId)");
  if (role !== "MEMBER" && role !== "RESELLER" && role !== "ADMIN") {
    throw new Error("Invalid session (role)");
  }

  return { userId, role };
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

/* =========================
 * Reset password token helpers
 * ========================= */
export function randomToken(len = 48) {
  // token URL-safe (base64url-ish)
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_";
  let out = "";
  const buf = crypto.getRandomValues(new Uint8Array(len));
  for (let i = 0; i < buf.length; i++) out += chars[buf[i] % chars.length];
  return out;
}

export async function hashToken(token: string) {
  // token reset jangan disimpan plain text di DB
  return bcrypt.hash(token, 10);
}

export async function verifyToken(token: string, hash: string) {
  return bcrypt.compare(token, hash);
}
