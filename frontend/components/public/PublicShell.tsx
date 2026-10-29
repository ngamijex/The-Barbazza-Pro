"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "@/app/public.css";

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="public-shell public-body">
      <header className="public-nav">
        <Link href="/" className="public-brand">
          <img src="/logo.png" alt="Barbazza" />
          <span>BARBAZZA</span>
        </Link>
        <nav className="public-nav-links" aria-label="Public">
          <Link href="/team" className={pathname.startsWith("/team") ? "active" : undefined}>
            Barbers
          </Link>
          <Link href="/book" className={pathname.startsWith("/book") ? "active" : undefined}>
            Book
          </Link>
          <Link href="/staff" className="public-nav-cta">
            Staff
          </Link>
        </nav>
      </header>
      {children}
      <footer className="public-footer">
        <strong>BARBAZZA</strong>
        Craft in black &amp; white. Book your chair.
      </footer>
    </div>
  );
}

export function Stars({ value }: { value: number | null }) {
  if (value == null) return <span className="stars">New</span>;
  const full = Math.round(value);
  return (
    <span className="stars" aria-label={`${value} out of 5`}>
      {"★".repeat(Math.max(0, Math.min(5, full)))}
      {"☆".repeat(Math.max(0, 5 - Math.min(5, full)))}
      <span style={{ marginLeft: 6, color: "var(--mute)", fontWeight: 500 }}>{value.toFixed(1)}</span>
    </span>
  );
}
