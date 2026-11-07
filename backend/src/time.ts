/** Shop clock: Kigali time. Business day rolls at DAY_CLOSE_HOUR (default 14:00). */

export const SHOP_TIMEZONE = "Africa/Kigali";

export const DAY_CLOSE_HOUR = Math.min(
  23,
  Math.max(0, Number.parseInt(process.env.DAY_CLOSE_HOUR || "14", 10) || 14)
);

/** Apply process-wide TZ so Date/logging match the shop. */
export function applyShopTimezone() {
  process.env.TZ = SHOP_TIMEZONE;
}

/**
 * Postgres expression for the shop business date.
 * Requires the DB session timezone to be Africa/Kigali.
 * Before DAY_CLOSE_HOUR, still counts as the previous calendar day.
 */
export const BUSINESS_DATE_SQL = `(CURRENT_DATE - (CASE WHEN EXTRACT(HOUR FROM CURRENT_TIMESTAMP)::integer < ${DAY_CLOSE_HOUR} THEN 1 ELSE 0 END))`;

/** YYYY-MM-DD business date in Kigali (same rules as BUSINESS_DATE_SQL). */
export function businessDate(now = new Date()): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: SHOP_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .filter((p) => p.type !== "literal")
      .map((p) => [p.type, p.value])
  ) as Record<string, string>;

  let year = Number(parts.year);
  let month = Number(parts.month);
  let day = Number(parts.day);
  let hour = Number(parts.hour);
  if (hour === 24) hour = 0;

  if (hour < DAY_CLOSE_HOUR) {
    const prev = new Date(Date.UTC(year, month - 1, day) - 86_400_000);
    year = prev.getUTCFullYear();
    month = prev.getUTCMonth() + 1;
    day = prev.getUTCDate();
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Calendar YYYY-MM-DD in Kigali (no 14:00 rollover). */
export function kigaliCalendarDate(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SHOP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
