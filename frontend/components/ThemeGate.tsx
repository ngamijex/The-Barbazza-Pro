"use client";

/**
 * Public pages isolate themselves via public.css (`html:has(.public-shell)`).
 * Staff theme CSS is loaded from the root layout <head> so it is present on first paint
 * (avoids login/card FOUC from a late client-only stylesheet inject).
 */
export function ThemeGate({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
