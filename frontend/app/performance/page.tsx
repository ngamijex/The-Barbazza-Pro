"use client";

import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Kpi, Panel, Shell } from "@/components/Shell";
import { api, money } from "@/lib/api";

type Ranking = { rank: number; barberId: number; code: string; name: string; customers: number; earned: number; share: number };
type Perf = {
  month: string;
  salon: { income: number; customers: number; expenses: number; profit: number; days: number; avgDaily: number };
  ranking: Ranking[];
  trend: { date: string; total: number }[];
};
type BarberPerf = { name: string; customers: number; earned: number; avg: number; days: number; trend: { date: string; total: number }[] };
type Barber = { id: number; code: string; name: string };

export default function PerformancePage() {
  const months = useMemo(() => {
    return Array.from({ length: 24 }, (_, index) => {
      const date = new Date();
      date.setDate(1);
      date.setMonth(date.getMonth() - index);
      const value = date.toISOString().slice(0, 7);
      const label = date.toLocaleDateString("en", { month: "long", year: "numeric" });
      return { value, label };
    });
  }, []);
  const [month, setMonth] = useState(months[0].value);
  const [face, setFace] = useState<"salon" | "barber">("salon");
  const [data, setData] = useState<Perf | null>(null);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [barberId, setBarberId] = useState("");
  const [barber, setBarber] = useState<BarberPerf | null>(null);

  useEffect(() => {
    api<Perf>(`/api/dashboard/performance?month=${month}`).then(setData).catch(() => setData(null));
    api<Barber[]>("/api/barbers").then(setBarbers).catch(() => setBarbers([]));
  }, [month]);

  useEffect(() => {
    if (face !== "barber" || !barberId) return;
    api<BarberPerf>(`/api/dashboard/barber?month=${month}&barberId=${barberId}`).then(setBarber).catch(() => setBarber(null));
  }, [face, barberId, month]);

  return (
    <Shell>
      <Panel title="Monthly Performance Analytics" className="admin-card">
        <p style={{ fontSize: "0.9rem", color: "var(--barbazza-cream)", marginBottom: "var(--space-4)" }}>
          Select a month and switch between barbershop overview and a specific barber&apos;s monthly performance.
        </p>
        <div className="form-grid form-grid-2">
          <div className="form-group">
            <label>Select Month</label>
            <select value={month} onChange={(e) => setMonth(e.target.value)}>
              {months.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>View</label>
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <label>
                <input type="radio" checked={face === "salon"} onChange={() => setFace("salon")} /> Barbershop
              </label>
              <label>
                <input type="radio" checked={face === "barber"} onChange={() => setFace("barber")} /> Barber
              </label>
            </div>
          </div>
        </div>
      </Panel>

      {face === "salon" && data ? (
        <Panel title="Barbershop Performance" className="admin-card">
          <div className="daily-summary">
            <Kpi label="Total Customers" value={String(data.salon.customers)} />
            <Kpi label="Total Income" value={money(data.salon.income)} />
            <Kpi label="Total Expenses" value={money(data.salon.expenses)} />
            <Kpi label="Net Profit" value={money(data.salon.profit)} />
            <Kpi label="Days Worked" value={String(data.salon.days)} />
            <Kpi label="Avg Daily Income" value={money(data.salon.avgDaily)} />
          </div>
          <h4 style={{ marginTop: "var(--space-6)" }}>Income Trend - Selected Month</h4>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trend}>
                <XAxis dataKey="date" hide />
                <Tooltip formatter={(value) => money(Number(value))} />
                <Area dataKey="total" stroke="#0a0a0a" fill="rgba(10,10,10,0.08)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <h4 style={{ marginTop: "var(--space-6)" }}>Barber Rankings - Selected Month</h4>
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Barber</th>
                <th>Customers</th>
                <th>Earned</th>
                <th>Share</th>
              </tr>
            </thead>
            <tbody>
              {data.ranking.map((row) => (
                <tr key={row.barberId}>
                  <td>{row.rank}</td>
                  <td>
                    {row.name} ({row.code})
                  </td>
                  <td>{row.customers}</td>
                  <td>{money(row.earned)}</td>
                  <td>{row.share}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      ) : null}

      {face === "barber" ? (
        <Panel title="Barber Performance" className="admin-card">
          <div className="form-group" style={{ maxWidth: 360 }}>
            <label>Select Barber</label>
            <select value={barberId} onChange={(e) => setBarberId(e.target.value)}>
              <option value="">Select a barber</option>
              {barbers.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.code})
                </option>
              ))}
            </select>
          </div>
          {barber ? (
            <>
              <div className="daily-summary">
                <Kpi label="Customers" value={String(barber.customers)} />
                <Kpi label="Earned" value={money(barber.earned)} />
                <Kpi label="Avg service" value={money(barber.avg)} />
                <Kpi label="Days worked" value={String(barber.days)} />
              </div>
              <div style={{ height: 280, marginTop: "var(--space-4)" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barber.trend}>
                    <XAxis dataKey="date" hide />
                    <YAxis hide />
                    <Tooltip formatter={(value) => money(Number(value))} />
                    <Bar dataKey="total" fill="#0a0a0a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : null}
        </Panel>
      ) : null}
    </Shell>
  );
}
