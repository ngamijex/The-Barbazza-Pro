"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { BookingModal } from "@/components/public/BookingModal";
import { PublicShell, Stars } from "@/components/public/PublicShell";
import { PageSkeleton } from "@/components/Skeleton";
import { BarberProfile, mediaSrc, money, PublicBarber, publicApi } from "@/lib/publicApi";
import { telHref } from "@/lib/shop";

export default function BarberProfilePage() {
  const params = useParams();
  const id = Number(params.id);
  const [profile, setProfile] = useState<BarberProfile | null>(null);
  const [error, setError] = useState("");
  const [score, setScore] = useState(5);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [bookServiceId, setBookServiceId] = useState<number | null>(null);

  async function load() {
    setProfile(await publicApi<BarberProfile>(`/barbers/${id}`));
  }

  useEffect(() => {
    if (!id) return;
    load().catch((err) => setError(err.message));
  }, [id]);

  async function submitRating(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await publicApi("/ratings", {
        method: "POST",
        body: JSON.stringify({ barberId: id, clientName: name, score, comment }),
      });
      setName("");
      setComment("");
      setMessage("Thank you — your rating is live.");
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save rating");
    } finally {
      setBusy(false);
    }
  }

  const bookBarber: PublicBarber | null = useMemo(() => {
    if (!profile) return null;
    return {
      id: profile.id,
      code: profile.code,
      name: profile.name,
      slogan: profile.slogan,
      bio: profile.bio,
      specialty: profile.actions[0] || "",
      actions: profile.actions,
      avatarUrl: profile.avatarUrl,
      coverUrl: profile.coverUrl,
      clients90d: profile.clients90d,
      rating: profile.rating,
      reviews: profile.reviews,
    };
  }, [profile]);

  if (!profile && !error) {
    return (
      <PublicShell>
        <section className="public-section">
          <PageSkeleton />
        </section>
      </PublicShell>
    );
  }

  if (error || !profile) {
    return (
      <PublicShell>
        <section className="public-section">
          <p>{error || "Barber not found"}</p>
          <Link href="/team">Back to the chairs</Link>
        </section>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <section className="profile-hero" style={{ backgroundImage: `url(${mediaSrc(profile.coverUrl)})` }}>
        <div className="profile-hero-veil" />
        <div className="profile-hero-inner">
          <div className="profile-avatar" style={{ backgroundImage: `url(${mediaSrc(profile.avatarUrl)})` }} />
          <div>
            <p className="profile-kicker">Chair {profile.code}</p>
            <h1>{profile.name}</h1>
            <p className="profile-slogan">{profile.slogan}</p>
            <div className="barber-meta" style={{ marginBottom: "1rem", color: "rgba(255,255,255,0.85)" }}>
              <Stars value={profile.rating} />
              <span>{profile.reviews} reviews</span>
              <span>{profile.clients90d} clients · 90d</span>
            </div>
            <div className="action-chips action-chips--light">
              {profile.actions.map((action) => (
                <span key={action}>{action}</span>
              ))}
            </div>
            <div className="public-cta-row" style={{ marginTop: "1.25rem" }}>
              <button
                type="button"
                className="btn-ink"
                style={{ border: "none", cursor: "pointer" }}
                onClick={() => {
                  setBookServiceId(null);
                  setBookOpen(true);
                }}
              >
                Book this barber
              </button>
              <Link href="/team" className="btn-ghost-light">
                All barbers
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="public-section">
        <h2>Contact</h2>
        {profile.phone ? (
          <div className="shop-contact shop-contact--compact">
            <a className="shop-contact-card" href={telHref(profile.phone)}>
              <span className="shop-contact-label">Phone</span>
              <strong>{profile.phone}</strong>
              <span className="shop-contact-action">Call this barber</span>
            </a>
            {profile.whatsappUrl ? (
              <a className="shop-contact-card" href={profile.whatsappUrl} target="_blank" rel="noreferrer">
                <span className="shop-contact-label">WhatsApp</span>
                <strong>{profile.phone}</strong>
                <span className="shop-contact-action">Message</span>
              </a>
            ) : null}
          </div>
        ) : (
          <p className="lede" style={{ marginBottom: "1.5rem" }}>
            Contact for this chair will appear once their phone is set in staff People.
          </p>
        )}

        <h2>About</h2>
        <p className="lede" style={{ marginBottom: "1.5rem" }}>
          {profile.bio}
        </p>

        <h2>Work</h2>
        <p className="lede">Cuts and finishes from this chair.</p>
        {profile.portfolio.length === 0 ? (
          <p style={{ color: "var(--mute)" }}>Portfolio photos will appear once uploaded by the barber or admin.</p>
        ) : (
          <div className="portfolio-grid">
            {profile.portfolio.map((item) => (
              <figure key={item.id} className="portfolio-item">
                <div style={{ backgroundImage: `url(${mediaSrc(item.imageUrl)})` }} />
                {item.caption ? <figcaption>{item.caption}</figcaption> : null}
              </figure>
            ))}
          </div>
        )}
      </section>

      <section className="public-section" style={{ paddingTop: 0 }}>
        <h2>Services</h2>
        <div className="barber-grid">
          {profile.services.map((service) => (
            <div key={service.id} className="barber-card-body" style={{ border: "1px solid var(--line)", background: "#fff" }}>
              <h3 style={{ fontSize: "1.25rem" }}>{service.name}</h3>
              <p style={{ margin: "0.35rem 0 0.85rem", color: "var(--mute)" }}>{money(service.price)}</p>
              <button
                type="button"
                className="btn-ink"
                style={{ background: "var(--ink)", color: "#fff", minHeight: 38, fontSize: "0.8rem", border: "none", cursor: "pointer" }}
                onClick={() => {
                  setBookServiceId(service.id);
                  setBookOpen(true);
                }}
              >
                Book
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="public-section" style={{ paddingTop: 0 }}>
        <h2>Client voices</h2>
        <div style={{ display: "grid", gap: "0.85rem", marginBottom: "2rem" }}>
          {profile.ratings.length === 0 ? <p style={{ color: "var(--mute)" }}>No ratings yet — be the first.</p> : null}
          {profile.ratings.map((rating) => (
            <article key={rating.id} style={{ background: "#fff", border: "1px solid var(--line)", padding: "1rem 1.1rem" }}>
              <div className="barber-meta" style={{ marginTop: 0 }}>
                <strong>{rating.name}</strong>
                <Stars value={rating.score} />
                <span>{rating.date}</span>
              </div>
              {rating.comment ? <p style={{ margin: "0.65rem 0 0", lineHeight: 1.55 }}>{rating.comment}</p> : null}
            </article>
          ))}
        </div>

        <h2>Rate this barber</h2>
        <form className="public-form" onSubmit={submitRating}>
          <label>
            Your name
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="How should we show you?" />
          </label>
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: 8 }}>Rating</div>
            <div className="rating-row rating-row--stars" role="group" aria-label={`${score} out of 5 stars`}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={n <= score ? "active" : ""}
                  onClick={() => setScore(n)}
                  aria-label={`${n} star${n === 1 ? "" : "s"}`}
                  aria-pressed={n <= score}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <label>
            Comment (optional)
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="The fade, the talk, the finish…" />
          </label>
          <button type="submit" className="btn-ink" style={{ background: "var(--ink)", color: "#fff", border: "none" }} disabled={busy}>
            {busy ? "Saving…" : "Submit rating"}
          </button>
          {message ? <p style={{ margin: 0 }}>{message}</p> : null}
        </form>
      </section>

      <BookingModal
        barber={bookBarber}
        open={bookOpen}
        presetServiceId={bookServiceId}
        onClose={() => {
          setBookOpen(false);
          setBookServiceId(null);
        }}
      />
    </PublicShell>
  );
}
