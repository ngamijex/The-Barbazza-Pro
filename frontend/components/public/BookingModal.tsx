"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { mediaSrc, money, PublicBarber, publicApi } from "@/lib/publicApi";

type Service = { id: number; name: string; price: number };

type Props = {
  barber: PublicBarber | null;
  open: boolean;
  onClose: () => void;
  onBooked?: (bookingId: number) => void;
  presetServiceId?: number | null;
};

export function BookingModal({ barber, open, onClose, onBooked, presetServiceId }: Props) {
  const [services, setServices] = useState<Service[]>([]);
  const [slots, setSlots] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [doneId, setDoneId] = useState<number | null>(null);
  const [form, setForm] = useState({
    serviceId: presetServiceId ? String(presetServiceId) : "",
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    date: "",
    time: "",
    notes: "",
  });

  const minDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    if (!open) return;
    setDoneId(null);
    setError("");
    setForm({
      serviceId: presetServiceId ? String(presetServiceId) : "",
      clientName: "",
      clientPhone: "",
      clientEmail: "",
      date: "",
      time: "",
      notes: "",
    });
    publicApi<Service[]>("/services")
      .then(setServices)
      .catch(() => setServices([]));
  }, [open, barber?.id, presetServiceId]);

  useEffect(() => {
    if (!open || !barber || !form.date) {
      setSlots([]);
      return;
    }
    publicApi<{ slots: string[] }>(`/slots?barberId=${barber.id}&date=${form.date}`)
      .then((data) => {
        setSlots(data.slots);
        setForm((f) => ({ ...f, time: data.slots.includes(f.time) ? f.time : "" }));
      })
      .catch(() => setSlots([]));
  }, [open, barber, form.date]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!barber) return;
    setBusy(true);
    setError("");
    try {
      const result = await publicApi<{ bookingId: number }>("/bookings", {
        method: "POST",
        body: JSON.stringify({
          barberId: barber.id,
          serviceId: form.serviceId ? Number(form.serviceId) : null,
          clientName: form.clientName,
          clientPhone: form.clientPhone,
          clientEmail: form.clientEmail,
          date: form.date,
          time: form.time,
          notes: form.notes,
        }),
      });
      setDoneId(result.bookingId);
      onBooked?.(result.bookingId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not book");
    } finally {
      setBusy(false);
    }
  }

  if (!open || !barber) return null;

  return (
    <div className="book-modal-root" role="dialog" aria-modal="true" aria-label={`Book ${barber.name}`}>
      <button type="button" className="book-modal-backdrop" aria-label="Close booking" onClick={onClose} />
      <div className="book-modal-panel">
        <button type="button" className="book-modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <div className="book-modal-head">
          <div className="book-modal-avatar" style={{ backgroundImage: `url(${mediaSrc(barber.avatarUrl)})` }} />
          <div>
            <p className="book-modal-kicker">Book a barber</p>
            <h3>{barber.name}</h3>
            <p>{barber.slogan}</p>
          </div>
        </div>

        {doneId ? (
          <div className="book-modal-success">
            <h4>Your barber is booked.</h4>
            <p>
              Booking #{doneId} is with the shop. Arrive a few minutes early — we&apos;ll take it from there.
            </p>
            <button type="button" className="btn-ink" style={{ background: "var(--ink)", color: "#fff" }} onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <form className="public-form book-modal-form" onSubmit={onSubmit}>
            {error ? <p style={{ color: "#8b1f1f", margin: 0 }}>{error}</p> : null}
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
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Fade preference, beard trim, arrival notes…"
              />
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
        )}
      </div>
    </div>
  );
}
