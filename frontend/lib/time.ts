/** Shop clock mirrors the API: Africa/Kigali, business day rolls at 14:00. */

export const SHOP_TIMEZONE = "Africa/Kigali";
export const DAY_CLOSE_HOUR = 14;

/** YYYY-MM-DD business date in Kigali (before 14:00 still counts as yesterday). */
export function shopBusinessDate(now = new Date()): string {
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

/** Calendar YYYY-MM-DD in Kigali (no day-close rollover). */
export function kigaliCalendarDate(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SHOP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function shopMonthKey(now = new Date()): string {
  return shopBusinessDate(now).slice(0, 7);
}
