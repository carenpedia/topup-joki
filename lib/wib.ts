// lib/wib.ts
const WIB_OFFSET_MIN = 7 * 60;

/**
 * Convert datetime-local string (YYYY-MM-DDTHH:mm) that represents WIB time
 * into UTC ISO string for DB.
 *
 * Example input (WIB): 2026-02-12T15:30
 * Output (UTC ISO):    2026-02-12T08:30:00.000Z
 */
export function wibLocalToUtcIso(dtLocal: string): string | null {
  const s = (dtLocal ?? "").trim();
  if (!s) return null;

  // Expect: YYYY-MM-DDTHH:mm
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!m) return null;

  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const hh = Number(m[4]);
  const mm = Number(m[5]);

  // Convert WIB -> UTC by subtracting 7 hours
  const utcMs = Date.UTC(y, mo - 1, d, hh, mm) - WIB_OFFSET_MIN * 60_000;
  return new Date(utcMs).toISOString();
}

/**
 * Convert UTC ISO string from DB into datetime-local string (YYYY-MM-DDTHH:mm)
 * in WIB, regardless of device timezone.
 */
export function utcIsoToWibLocal(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  // Use Intl (built-in, not a library)
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}
