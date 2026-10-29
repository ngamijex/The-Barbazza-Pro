"use client";

import { useEffect, useState } from "react";
import { Kpi, Panel, Shell, useSession } from "@/components/Shell";
import { api, money } from "@/lib/api";

type BarberHome = {
  commissionRate: number;
  today: { gross: number; commission: number; customers: number };
  month: { gross: number; commission: number; customers: number };
};

export default function HistoryPage() {
  const user = useSession();
  const [period, setPeriod] = useState<"today" | "week" | "month">("today");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [home, setHome] = useState<BarberHome | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    api<BarberHome>("/api/barber/home")
      .then(setHome)
      .catch((err) => setError(err.message));
  }, [user]);

  const monthStart = new Date();
  monthStart.setDate(1);

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
        <p style={{ color: "var(--barbazza-cream)" }}>Date: {date}</p>
      </Panel>
    </Shell>
  );
}
