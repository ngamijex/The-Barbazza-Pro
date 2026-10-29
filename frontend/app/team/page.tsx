"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PublicShell, Stars } from "@/components/public/PublicShell";
import { PageSkeleton } from "@/components/Skeleton";
import { PublicBarber, publicApi } from "@/lib/publicApi";

export default function PublicTeamPage() {
  const [barbers, setBarbers] = useState<PublicBarber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        <p className="lede">
          Every profile shows real floor activity and client ratings. Pick the craft that fits you — then book in
          seconds.
        </p>
        {error ? <p style={{ color: "#8b1f1f" }}>{error}</p> : null}
        {loading ? <PageSkeleton cards={2} kpis={0} /> : null}
        <div className="barber-grid">
          {barbers.map((barber, index) => (
            <Link key={barber.id} href={`/team/${barber.id}`} className="barber-card">
              <div
                className="barber-card-media"
                style={{
                  backgroundImage: `url(/public-art/${index % 2 === 0 ? "barber-craft.jpg" : "tools.jpg"})`,
                }}
              />
              <div className="barber-card-body">
                <h3>{barber.name}</h3>
                <p style={{ margin: 0, color: "var(--mute)" }}>{barber.specialty}</p>
                <div className="barber-meta">
                  <Stars value={barber.rating} />
                  <span>
                    {barber.reviews} review{barber.reviews === 1 ? "" : "s"}
                  </span>
                  <span>{barber.clients90d} clients</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
