"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { PublicShell, Stars } from "@/components/public/PublicShell";
import { PublicBarber, publicApi } from "@/lib/publicApi";

const BRAND = "BARBAZZA";

export default function PublicHomePage() {
  const [barbers, setBarbers] = useState<PublicBarber[]>([]);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    publicApi<PublicBarber[]>("/barbers")
      .then((rows) => setBarbers(rows.slice(0, 3)))
      .catch(() => setBarbers([]));
  }, []);

  const letterStagger = reduceMotion ? 0 : 0.055;
  const letterDuration = reduceMotion ? 0.01 : 0.55;

  return (
    <PublicShell>
      <section className="public-hero">
        <motion.div
          className="public-hero-media"
          style={{ backgroundImage: "url(/public-art/hero-shop.jpg)" }}
          aria-hidden
          initial={reduceMotion ? false : { scale: 1.18, x: "2%" }}
          animate={reduceMotion ? undefined : { scale: 1.04, x: "-1%" }}
          transition={{ duration: 14, ease: [0.22, 1, 0.36, 1] }}
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
            aria-label="BARBAZZA"
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: letterStagger, delayChildren: 0.12 } },
            }}
          >
            {BRAND.split("").map((letter, i) => (
              <motion.span
                key={`${letter}-${i}`}
                className="public-hero-letter"
                variants={{
                  hidden: { opacity: 0, y: reduceMotion ? 0 : 42, rotateX: reduceMotion ? 0 : 55 },
                  show: {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    transition: { duration: letterDuration, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
              >
                {letter}
              </motion.span>
            ))}
          </motion.h1>

          <motion.div
            className="public-hero-rule"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: reduceMotion ? 0.01 : 0.9, delay: reduceMotion ? 0 : 0.75, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden
          />

          <motion.p
            initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: reduceMotion ? 0 : 0.85, ease: [0.22, 1, 0.36, 1] }}
          >
            A house of quiet craft. Choose your barber, book the chair, and leave sharper than you arrived.
          </motion.p>

          <motion.div
            className="public-cta-row"
            initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: reduceMotion ? 0 : 1.05, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link href="/book" className="btn-ink">
              Book a chair
            </Link>
            <Link href="/team" className="btn-ghost-light">
              Meet the barbers
            </Link>
          </motion.div>
        </div>

        <motion.div
          className="public-hero-scroll"
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduceMotion ? 0 : 1.4, duration: 0.6 }}
        >
          <span />
        </motion.div>
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
        <p className="lede">Rated by clients. Proven on the floor.</p>
        <div className="barber-grid">
          {barbers.map((barber, index) => (
            <Link key={barber.id} href={`/team/${barber.id}`} className="barber-card">
              <div
                className="barber-card-media"
                style={{
                  backgroundImage: `url(/public-art/${index % 2 === 0 ? "barber-craft.jpg" : "hero-shop.jpg"})`,
                }}
              />
              <div className="barber-card-body">
                <h3>{barber.name}</h3>
                <p style={{ margin: 0, color: "var(--mute)", fontSize: "0.92rem" }}>{barber.specialty}</p>
                <div className="barber-meta">
                  <Stars value={barber.rating} />
                  <span>{barber.clients90d} clients · 90d</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {barbers.length === 0 ? (
          <p style={{ color: "var(--mute)" }}>Barbers will appear here once the shop roster is active.</p>
        ) : null}
      </section>
    </PublicShell>
  );
}
