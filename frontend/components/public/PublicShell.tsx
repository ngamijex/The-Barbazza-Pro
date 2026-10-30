"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import "@/app/public.css";
import { publicApi } from "@/lib/publicApi";
import { PublicShop, SHOP_FALLBACK, telHref } from "@/lib/shop";

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const onHero = pathname === "/";
  const [shop, setShop] = useState<PublicShop>(SHOP_FALLBACK);

  useEffect(() => {
    publicApi<PublicShop>("/shop")
      .then(setShop)
      .catch(() => setShop(SHOP_FALLBACK));
  }, []);

  const call = telHref(shop.phone);

  return (
    <div className={`public-shell public-body${onHero ? " public-shell--home" : " public-shell--inner"}`}>
      <header className={`public-nav${onHero ? " public-nav--hero" : " public-nav--inner"}`}>
        <Link href="/" className="public-brand" aria-label="Barbazza home">
          <img src="/logo.png" alt="Barbazza" className="public-logo public-logo--nav" />
        </Link>
        <Link href="/staff" className="public-nav-cta">
          Staff
        </Link>
      </header>
      {children}
      <footer className="public-footer">
        <img src="/logo.png" alt="Barbazza" className="public-logo public-logo--footer" />
        <p className="public-footer-tag">Craft in black &amp; white. Book a barber.</p>
        <div className="public-footer-contact">
          <a href={shop.mapsUrl} target="_blank" rel="noreferrer">
            {shop.address}
          </a>
          {call ? (
            <a href={call}>{shop.phone}</a>
          ) : (
            <span>{shop.phone}</span>
          )}
          {shop.whatsappUrl ? (
            <a href={shop.whatsappUrl} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          ) : null}
        </div>
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
