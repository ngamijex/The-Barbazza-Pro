"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BookingModal } from "@/components/public/BookingModal";
import { PublicShell, Stars } from "@/components/public/PublicShell";
import { mediaSrc, PublicBarber, publicApi } from "@/lib/publicApi";

export default function PublicHomePage() {
  const [barbers, setBarbers] = useState<PublicBarber[]>([]);
  const [bookBarber, setBookBarber] = useState<PublicBarber | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    publicApi<PublicBarber[]>("/barbers")
      .then((rows) => setBarbers(rows.slice(0, 3)))
      .catch(() => setBarbers([]));
  }, []);

  return (
    <PublicShell>
      <section className="public-hero">
        <motion.div
          className="public-hero-media"
          style={{ backgroundImage: "url(/public-art/hero-shop.jpg)" }}
          aria-hidden
          initial={reduceMotion ? false : { scale: 1.12 }}
          animate={reduceMotion ? undefined : { scale: 1 }}
          transition={{ duration: 12, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="public-hero-veil" aria-hidden />
        <div className="public-hero-grain" aria-hidden />
        <motion.div
          className="public-hero-sweep"
          aria-hidden
          initial={{ x: "-40%", opacity: 0 }}
          animate={reduceMotion ? { opacity: 0 } : { x: "120%", opacity: [0, 0.35, 0] }}
          transition={{ duration: 2.8, delay: 0.35, ease: "easeInOut" }}
        />

        <div className="public-hero-copy">
          <motion.h1
            className="public-hero-brand"
            initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <img src="/logo.png" alt="Barbazza" className="public-logo public-logo--hero" />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: reduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            A house of quiet craft. Choose your barber, book them in, and leave sharper than you arrived.
          </motion.p>

          <motion.div
            className="public-cta-row"
            initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: reduceMotion ? 0 : 0.48, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link href="/book" className="btn-ink">
              Book a barber
            </Link>
            <Link href="/team" className="btn-ghost-light">
              Meet the barbers
            </Link>
          </motion.div>
        </div>

      </section>

      <section className="public-section">
        <div className="public-split">
          <div>
            <h2>Cut with intention.</h2>
            <p className="lede">
              Black-and-white discipline. Real hands. Profiles with live stats from the floor — so you book the barber
              whose craft matches your style.
            </p>
            <Link href="/book" className="btn-ink" style={{ background: "var(--ink)", color: "#fff" }}>
              Reserve your time
            </Link>
          </div>
          <img src="/public-art/tools.jpg" alt="Client in the chair after a precise cut" />
        </div>
      </section>

      <section className="public-section" style={{ paddingTop: 0 }}>
        <h2>Featured chairs</h2>
        <p className="lede">Slogans, crafts, and live ratings — open a profile or book straight away.</p>
        <div className="barber-grid">
          {barbers.map((barber) => (
            <article key={barber.id} className="barber-card barber-card--rich">
              <div className="barber-card-media" style={{ backgroundImage: `url(${mediaSrc(barber.coverUrl)})` }}>
                <div className="barber-card-avatar" style={{ backgroundImage: `url(${mediaSrc(barber.avatarUrl)})` }} />
              </div>
              <div className="barber-card-body">
                <h3>{barber.name}</h3>
                <p className="barber-slogan">{barber.slogan}</p>
                <div className="action-chips">
                  {barber.actions.slice(0, 3).map((action) => (
                    <span key={action}>{action}</span>
                  ))}
                </div>
                <div className="barber-meta">
                  <Stars value={barber.rating} />
                  <span>{barber.clients90d} clients · 90d</span>
                </div>
                <div className="barber-card-actions">
                  <Link href={`/team/${barber.id}`} className="btn-ghost-dark">
                    View details
                  </Link>
                  <button
                    type="button"
                    className="btn-ink"
                    style={{ background: "var(--ink)", color: "#fff", border: "none" }}
                    onClick={() => setBookBarber(barber)}
                  >
                    Book
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
        {barbers.length === 0 ? (
          <p style={{ color: "var(--mute)" }}>Barbers will appear here once the shop roster is active.</p>
        ) : null}
      </section>

      <BookingModal barber={bookBarber} open={Boolean(bookBarber)} onClose={() => setBookBarber(null)} />
    </PublicShell>
  );
}
