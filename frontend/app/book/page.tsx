"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PublicShell } from "@/components/public/PublicShell";
import { PageSkeleton } from "@/components/Skeleton";
import { PublicBarber, money, publicApi } from "@/lib/publicApi";

type Service = { id: number; name: string; price: number };

function BookForm() {
  const router = useRouter();
  const search = useSearchParams();
  const presetBarber = Number(search.get("barber") || 0);

  const [barbers, setBarbers] = useState<PublicBarber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    barberId: presetBarber ? String(presetBarber) : "",
    serviceId: "",
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    date: "",
    time: "",
    notes: "",
  });

  const minDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    Promise.all([publicApi<PublicBarber[]>("/barbers"), publicApi<Service[]>("/services")])
      .then(([b, s]) => {
        setBarbers(b);
        setServices(s);
        if (!form.barberId && b[0]) setForm((f) => ({ ...f, barberId: String(b[0].id) }));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!form.barberId || !form.date) {
      setSlots([]);
      return;
    }
    publicApi<{ slots: string[] }>(`/slots?barberId=${form.barberId}&date=${form.date}`)
      .then((data) => {
        setSlots(data.slots);
        setForm((f) => ({ ...f, time: data.slots.includes(f.time) ? f.time : "" }));
      })
      .catch(() => setSlots([]));
  }, [form.barberId, form.date]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await publicApi<{ bookingId: number }>("/bookings", {
        method: "POST",
        body: JSON.stringify({
          barberId: Number(form.barberId),
          serviceId: form.serviceId ? Number(form.serviceId) : null,
          clientName: form.clientName,
          clientPhone: form.clientPhone,
          clientEmail: form.clientEmail,
          date: form.date,
          time: form.time,
          notes: form.notes,
        }),
      });
      router.push(`/book/confirm?id=${result.bookingId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not book");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <section className="public-section">
        <PageSkeleton cards={2} />
      </section>
    );
  }

  return (
    <section className="public-section">
      <h2>Book a chair</h2>
      <p className="lede">Pick your barber, service, and time. Confirmation is instant — the shop sees it right away.</p>
      {error ? <p style={{ color: "#8b1f1f" }}>{error}</p> : null}
      <form className="public-form" onSubmit={onSubmit}>
        <label>
          Barber
          <select required value={form.barberId} onChange={(e) => setForm({ ...form, barberId: e.target.value, time: "" })}>
            <option value="">Select a barber</option>
            {barbers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Service
          <select value={form.serviceId} onChange={(e) => setForm({ ...form, serviceId: e.target.value })}>
            <option value="">Select a service (optional)</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {money(s.price)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Date
          <input
            required
            type="date"
            min={minDate}
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value, time: "" })}
          />
        </label>
        <div>
          <div style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: 8 }}>Time</div>
          {!form.date ? (
            <p style={{ color: "var(--mute)", margin: 0 }}>Choose a date to see open slots.</p>
          ) : slots.length === 0 ? (
            <p style={{ color: "var(--mute)", margin: 0 }}>No open slots that day — try another date.</p>
          ) : (
            <div className="slot-grid">
              {slots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  className={`slot-btn ${form.time === slot ? "active" : ""}`}
                  onClick={() => setForm({ ...form, time: slot })}
                >
                  {slot}
                </button>
              ))}
            </div>
          )}
        </div>
        <label>
          Your name
          <input required value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} />
        </label>
        <label>
          Phone
          <input required value={form.clientPhone} onChange={(e) => setForm({ ...form, clientPhone: e.target.value })} />
        </label>
        <label>
          Email (optional)
          <input type="email" value={form.clientEmail} onChange={(e) => setForm({ ...form, clientEmail: e.target.value })} />
        </label>
        <label>
          Notes
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Fade preference, beard trim, arrival notes…" />
        </label>
        <button
          type="submit"
          className="btn-ink"
          style={{ background: "var(--ink)", color: "#fff", border: "none" }}
          disabled={busy || !form.time}
        >
          {busy ? "Booking…" : "Confirm booking"}
        </button>
      </form>
    </section>
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
        <BookForm />
      </Suspense>
    </PublicShell>
  );
}
