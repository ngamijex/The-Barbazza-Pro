"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PublicShell, Stars } from "@/components/public/PublicShell";
import { PageSkeleton } from "@/components/Skeleton";
import { BarberProfile, money, publicApi } from "@/lib/publicApi";

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
      <section className="public-section">
        <div className="public-split">
          <div
            style={{
              minHeight: 360,
              background: `url(/public-art/barber-craft.jpg) center/cover`,
              filter: "grayscale(1)",
            }}
          />
          <div>
            <p style={{ letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--mute)", fontSize: 12 }}>
              Chair {profile.code}
            </p>
            <h2 style={{ marginTop: 8 }}>{profile.name}</h2>
            <div className="barber-meta" style={{ marginBottom: "1.25rem" }}>
              <Stars value={profile.rating} />
              <span>{profile.reviews} reviews</span>
              <span>{profile.clients90d} clients · 90 days</span>
              <span>{profile.daysActive} active days</span>
            </div>
            <Link href={`/book?barber=${profile.id}`} className="btn-ink" style={{ background: "var(--ink)", color: "#fff" }}>
              Book {profile.name.split(" ")[0]}
            </Link>
          </div>
        </div>
      </section>

      <section className="public-section" style={{ paddingTop: 0 }}>
        <h2>Services</h2>
        <div className="barber-grid">
          {profile.services.map((service) => (
            <div key={service.id} className="barber-card-body" style={{ border: "1px solid var(--line)", background: "#fff" }}>
              <h3 style={{ fontSize: "1.35rem" }}>{service.name}</h3>
              <p style={{ margin: "0.35rem 0 0", color: "var(--mute)" }}>{money(service.price)}</p>
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
        <p className="lede">Honest notes help the next client choose well.</p>
        <form className="public-form" onSubmit={submitRating}>
          <label>
            Your name
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="How should we show you?" />
          </label>
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: 8 }}>Score</div>
            <div className="rating-row">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" className={score === n ? "active" : ""} onClick={() => setScore(n)}>
                  {n}
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
    </PublicShell>
  );
}
