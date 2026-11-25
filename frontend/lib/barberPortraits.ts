/** Confirmed Barbazza uniform portraits keyed by barber code. */
const PORTRAITS_BY_CODE: Record<string, string> = {
  B001: "/barbers/B001.jpg", // Damascene HAKIZIMANA
  B002: "/barbers/B002.jpg", // Eric Musabyimana
  B003: "/barbers/B003.jpg", // Innocent KABABA
  B005: "/barbers/B005.jpg", // Kwizera Eric
  B007: "/barbers/B007.jpg", // UWINEZA Flugency
  B008: "/barbers/B008.jpg", // Irakoze Barbazza
  B009: "/barbers/B009.jpg", // Kabera Bosco
  B011: "/barbers/B011.jpg", // Eric Hakizimana
};

/** Name fallbacks when code is missing or mismatched. */
const PORTRAITS_BY_NAME: Record<string, string> = {
  "damascene hakizimana": "/barbers/B001.jpg",
  damascene: "/barbers/B001.jpg",
  "eric musabyimana": "/barbers/B002.jpg",
  "innocent kababa": "/barbers/B003.jpg",
  kababa: "/barbers/B003.jpg",
  innocent: "/barbers/B003.jpg",
  "kwizera eric": "/barbers/B005.jpg",
  "uwineza flugency": "/barbers/B007.jpg",
  flugency: "/barbers/B007.jpg",
  "irakoze barbazza": "/barbers/B008.jpg",
  irakoze: "/barbers/B008.jpg",
  "kabera bosco": "/barbers/B009.jpg",
  kabera: "/barbers/B009.jpg",
  "eric hakizimana": "/barbers/B011.jpg",
};

export function portraitForBarber(code?: string | null, name?: string | null): string | null {
  if (code) {
    const byCode = PORTRAITS_BY_CODE[code.trim().toUpperCase()];
    if (byCode) return byCode;
  }
  if (name) {
    const key = name.trim().toLowerCase();
    if (PORTRAITS_BY_NAME[key]) return PORTRAITS_BY_NAME[key];
    for (const [fragment, path] of Object.entries(PORTRAITS_BY_NAME)) {
      if (key.includes(fragment) || fragment.includes(key)) return path;
    }
  }
  return null;
}

/** Prefer confirmed uniform portrait for avatar + cover on public profiles. */
export function withBarberPortrait<T extends { code: string; name: string; avatarUrl: string; coverUrl?: string }>(
  barber: T,
): T {
  const portrait = portraitForBarber(barber.code, barber.name);
  if (!portrait) return barber;
  return {
    ...barber,
    avatarUrl: portrait,
    coverUrl: portrait,
  };
}
