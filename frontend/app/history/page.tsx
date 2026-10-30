"use client";

import { useEffect, useState } from "react";
import { Kpi, Panel, Shell, useSession } from "@/components/Shell";
import { api, money } from "@/lib/api";

type BarberHome = {
  commissionRate: number;
  today: { gross: number; commission: number; customers: number };
  week: { gross: number; commission: number; customers: number };
  month: { gross: number; commission: number; customers: number };
};

type DayDetail = {
  date: string;
  servicesCount: number;
  customers: number;
  gross: number;
  commission: number;
  services: { service: string; amount: number; customer: string; time: string }[];
};

export default function HistoryPage() {
  const user = useSession();
  const [period, setPeriod] = useState<"today" | "week" | "month">("today");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [home, setHome] = useState<BarberHome | null>(null);
  const [day, setDay] = useState<DayDetail | null>(null);
  const [error, setError] = useState("");

  const monthStart = new Date();
  monthStart.setDate(1);

  useEffect(() => {
    if (!user) return;
    api<BarberHome>("/api/barber/home")
      .then(setHome)
      .catch((err) => setError(err.message));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    api<DayDetail>(`/api/barber/day?date=${date}`)
      .then(setDay)
      .catch((err) => setError(err.message));
  }, [user, date]);

  return (
    <Shell>
      {error ? <div className="alert alert-danger">{error}</div> : null}
      <Panel title="Performance History" className="barber-card">
        <div className="period-selector" style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-4)" }}>
          {(
            [
              ["today", "Today"],
              ["week", "This Week"],
              ["month", "This Month"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={period === key ? "btn-action" : "btn-logout"}
              style={{ width: "auto" }}
              onClick={() => setPeriod(key)}
            >
              {label}
            </button>
          ))}
        </div>
        {home ? (
          <div className="earnings-grid daily-summary">
            {period === "today" ? (
              <>
                <Kpi label="Gross Income" value={money(home.today.gross)} />
                <Kpi label="Commission" value={money(home.today.commission)} />
                <Kpi label="Customers" value={String(home.today.customers)} />
              </>
            ) : period === "week" ? (
              <>
                <Kpi label="Gross Income" value={money(home.week.gross)} />
                <Kpi label="Commission" value={money(home.week.commission)} />
                <Kpi label="Customers" value={String(home.week.customers)} />
              </>
            ) : (
              <>
                <Kpi label="Gross Income" value={money(home.month.gross)} />
                <Kpi label="Commission" value={money(home.month.commission)} />
                <Kpi label="Customers" value={String(home.month.customers)} />
              </>
            )}
          </div>
        ) : null}
      </Panel>

      <Panel title="View Specific Day Records" className="barber-card">
        <p style={{ fontSize: "0.9rem", color: "var(--barbazza-cream)", marginBottom: "var(--space-4)" }}>
          Select any day from this month to view detailed records
        </p>
        <div style={{ maxWidth: 300, marginBottom: "var(--space-6)" }}>
          <label>Select Date:</label>
          <input
            type="date"
            value={date}
            min={monthStart.toISOString().slice(0, 10)}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <h4>Summary for Selected Day</h4>
        {day ? (
          <>
            <div className="earnings-grid daily-summary" style={{ marginBottom: "var(--space-4)" }}>
              <Kpi label="Services Performed" value={String(day.servicesCount)} />
              <Kpi label="Customers Served" value={String(day.customers)} />
              <Kpi label="Gross Income" value={money(day.gross)} />
              <Kpi label="Your Commission (40%)" value={money(day.commission)} />
            </div>
            <h4>Services Performed</h4>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Amount</th>
                  <th>Customer</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {day.services.length === 0 ? (
                  <tr>
                    <td colSpan={4}>No services on this day.</td>
                  </tr>
                ) : (
                  day.services.map((s, i) => (
                    <tr key={`${s.time}-${i}`}>
                      <td>{s.service}</td>
                      <td>{money(s.amount)}</td>
                      <td>{s.customer}</td>
                      <td>{s.time}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </>
        ) : null}
      </Panel>
    </Shell>
  );
}
