"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookingModal } from "@/components/public/BookingModal";
import { PublicShell, Stars } from "@/components/public/PublicShell";
import { PageSkeleton } from "@/components/Skeleton";
import { mediaSrc, PublicBarber, publicApi } from "@/lib/publicApi";

export default function PublicTeamPage() {
  const [barbers, setBarbers] = useState<PublicBarber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookBarber, setBookBarber] = useState<PublicBarber | null>(null);

  useEffect(() => {
    publicApi<PublicBarber[]>("/barbers")
      .then(setBarbers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicShell>
      <section className="public-section">
        <h2>The chairs</h2>
        <p className="lede">Each barber brings a different hand, slogan, and set of crafts. Open a profile, see the work, book a barber.</p>
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
                  {barber.actions.slice(0, 4).map((action) => (
                    <span key={action}>{action}</span>
                  ))}
                </div>
                <div className="barber-meta">
                  <Stars value={barber.rating} />
                  <span>
                    {barber.reviews} review{barber.reviews === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="barber-card-actions">
                  <Link href={`/team/${barber.id}`} className="btn-ghost-dark">
                    View profile
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
        {!loading && barbers.length === 0 ? (
          <p style={{ color: "var(--mute)" }}>Barbers will appear here once the shop roster is active.</p>
        ) : null}
      </section>

      <BookingModal barber={bookBarber} open={Boolean(bookBarber)} onClose={() => setBookBarber(null)} />
    </PublicShell>
  );
}
