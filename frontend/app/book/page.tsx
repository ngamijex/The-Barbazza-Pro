"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BookingModal } from "@/components/public/BookingModal";
import { PublicShell, Stars } from "@/components/public/PublicShell";
import { PageSkeleton } from "@/components/Skeleton";
import { mediaSrc, PublicBarber, publicApi } from "@/lib/publicApi";

function BookChairs() {
  const search = useSearchParams();
  const presetBarber = Number(search.get("barber") || 0);
  const presetService = Number(search.get("service") || 0) || null;

  const [barbers, setBarbers] = useState<PublicBarber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<PublicBarber | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    publicApi<PublicBarber[]>("/barbers")
      .then((rows) => {
        setBarbers(rows);
        if (presetBarber) {
          const match = rows.find((b) => b.id === presetBarber);
          if (match) {
            setSelected(match);
            setModalOpen(true);
          }
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [presetBarber]);

  function openBook(barber: PublicBarber) {
    setSelected(barber);
    setModalOpen(true);
  }

  return (
    <>
      <section className="public-section">
        <h2>Book a barber</h2>
        <p className="lede">Choose your barber — then book in a quick popup. Same craft cards, less friction.</p>
        {error ? <p style={{ color: "#8b1f1f" }}>{error}</p> : null}
        {loading ? <PageSkeleton cards={2} kpis={0} /> : null}
        <div className="barber-grid">
          {barbers.map((barber) => (
            <article key={barber.id} className="barber-card barber-card--rich">
              <div className="barber-card-media" style={{ backgroundImage: `url(${mediaSrc(barber.coverUrl)})` }}>
                <div className="barber-card-avatar" style={{ backgroundImage: `url(${mediaSrc(barber.avatarUrl)})` }} />
              </div>
              <div className="barber-card-body">
                <h3>{barber.name}</h3>
                <p className="barber-slogan">{barber.slogan}</p>
                {barber.bio ? (
                  <p className="barber-card-desc">{barber.bio.length > 120 ? `${barber.bio.slice(0, 117)}…` : barber.bio}</p>
                ) : null}
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
                  <button type="button" className="btn-ink" style={{ background: "var(--ink)", color: "#fff", border: "none" }} onClick={() => openBook(barber)}>
                    Book
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
        {!loading && barbers.length === 0 ? (
          <p style={{ color: "var(--mute)" }}>Barbers will appear here once the shop roster is active.</p>
        ) : null}
      </section>

      <BookingModal
        barber={selected}
        open={modalOpen}
        presetServiceId={selected?.id === presetBarber ? presetService : null}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}

export default function BookPage() {
  return (
    <PublicShell>
      <Suspense
        fallback={
          <section className="public-section">
            <PageSkeleton />
          </section>
        }
      >
        <BookChairs />
      </Suspense>
    </PublicShell>
  );
}
