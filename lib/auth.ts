import bcrypt from "bcryptjs";

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
