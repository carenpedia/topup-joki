import { cookies } from "next/headers";
import { verifySession } from "./auth";

export async function requireAdmin() {
  const token = cookies().get("session")?.value;
  if (!token) return { ok: false as const, status: 401, error: "Unauthorized" };

  try {
    const s = await verifySession(token);
    if (s.role !== "ADMIN") return { ok: false as const, status: 403, error: "Forbidden" };
    return { ok: true as const, session: s };
  } catch {
    return { ok: false as const, status: 401, error: "Invalid session" };
  }
}
