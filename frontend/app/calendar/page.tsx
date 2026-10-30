"use client";

import { useEffect, useMemo, useState } from "react";
import { Panel, Shell, useSession } from "@/components/Shell";
import { PageSkeleton } from "@/components/Skeleton";
import { api } from "@/lib/api";

type Booking = {
  id: number;
  clientName: string;
  phone: string;
  date: string;
  time: string;
  status: string;
  service: string;
  notes: string;
};

type Rating = { id: number; name: string; score: number; comment: string; date: string };
type Note = { id: number; title: string; body: string; link: string; read: boolean; createdAt: string };

export default function BarberCalendarPage() {
  const user = useSession();
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    const [cal, notif] = await Promise.all([
      api<{ bookings: Booking[]; ratings: Rating[] }>(`/api/barber/bookings?month=${month}`),
      api<Note[]>("/api/notifications"),
    ]);
    setBookings(cal.bookings);
    setRatings(cal.ratings);
    setNotes(notif);
    if (!selectedDay && cal.bookings[0]) setSelectedDay(cal.bookings[0].date);
  }

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    load()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user, month]);

  const daysInMonth = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    const count = new Date(y, m, 0).getDate();
    return Array.from({ length: count }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`);
  }, [month]);

  const byDay = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const b of bookings) {
      const list = map.get(b.date) || [];
      list.push(b);
      map.set(b.date, list);
    }
    return map;
  }, [bookings]);

  const dayBookings = selectedDay ? byDay.get(selectedDay) || [] : [];
  const unread = notes.filter((n) => !n.read).length;

  async function setStatus(id: number, status: string) {
    await api(`/api/barber/bookings/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    await load();
  }

  async function markRead(id?: number) {
    await api("/api/notifications/read", { method: "POST", body: JSON.stringify({ id: id || null }) });
    await load();
  }

  return (
    <Shell loading={loading && !error}>
      <Panel title="Bookings & calendar" className="manager-card">
        {error ? <div className="alert alert-danger">{error}</div> : null}
        <div className="form-group" style={{ maxWidth: 220 }}>
          <label className="form-label">Month</label>
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 6, marginBottom: 16 }}>
          {daysInMonth.map((day) => {
            const count = byDay.get(day)?.length || 0;
            const active = selectedDay === day;
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                style={{
                  minHeight: 54,
                  border: active ? "2px solid var(--barbazza-gold)" : "1px solid var(--barbazza-graphite)",
                  background: count ? "var(--barbazza-slate)" : "var(--barbazza-charcoal)",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontWeight: 700 }}>{Number(day.slice(-2))}</div>
                <div style={{ fontSize: 11, opacity: 0.75 }}>{count ? `${count} book` : "—"}</div>
              </button>
            );
          })}
        </div>

        <h3 style={{ marginTop: 0 }}>{selectedDay || "Select a day"}</h3>
        {!dayBookings.length ? <p style={{ color: "var(--barbazza-stone)" }}>No bookings this day.</p> : null}
        <table className="data-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Client</th>
              <th>Service</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {dayBookings.map((b) => (
              <tr key={b.id}>
                <td>{b.time}</td>
                <td>
                  {b.clientName}
                  <div style={{ fontSize: 12, opacity: 0.7 }}>{b.phone}</div>
                </td>
                <td>{b.service || "—"}</td>
                <td>{b.status}</td>
                <td style={{ whiteSpace: "nowrap" }}>
                  <button type="button" className="btn-primary" style={{ minHeight: 32, marginRight: 4 }} onClick={() => setStatus(b.id, "confirmed")}>
                    Confirm
                  </button>
                  <button type="button" className="btn-primary" style={{ minHeight: 32 }} onClick={() => setStatus(b.id, "cancelled")}>
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <Panel title={`Notifications${unread ? ` (${unread})` : ""}`} className="manager-card">
        <button type="button" className="btn-primary" style={{ marginBottom: 12 }} onClick={() => markRead()} disabled={!unread}>
          Mark all read
        </button>
        {!notes.length ? <p style={{ color: "var(--barbazza-stone)" }}>No notifications yet.</p> : null}
        <div style={{ display: "grid", gap: 8 }}>
          {notes.map((n) => (
            <article
              key={n.id}
              style={{
                padding: 12,
                border: "1px solid var(--barbazza-graphite)",
                background: n.read ? "transparent" : "var(--barbazza-slate)",
              }}
            >
              <strong>{n.title}</strong>
              <div style={{ fontSize: 12, opacity: 0.7 }}>{n.createdAt}</div>
              <p style={{ margin: "6px 0" }}>{n.body}</p>
              {!n.read ? (
                <button type="button" className="btn-primary" style={{ minHeight: 32 }} onClick={() => markRead(n.id)}>
                  Mark read
                </button>
              ) : null}
            </article>
          ))}
        </div>
      </Panel>

      <Panel title="Recent ratings" className="manager-card">
        {loading ? <PageSkeleton cards={1} kpis={0} /> : null}
        <table className="data-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Stars</th>
              <th>Comment</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {ratings.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.score}/5</td>
                <td>{r.comment || "—"}</td>
                <td>{r.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </Shell>
  );
}
