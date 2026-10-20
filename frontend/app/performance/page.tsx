"use client";

import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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
    return Array.from({ length: 18 }, (_, index) => {
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
    <Shell title="Monthly performance" subtitle="Salon pulse, then each chair.">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <select value={month} onChange={(e) => setMonth(e.target.value)} className="rounded-2xl border border-line bg-panel px-4 py-3">
          {months.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
        <div className="grid grid-cols-2 rounded-2xl border border-line bg-panel p-1">
          {(["salon", "barber"] as const).map((item) => (
            <button key={item} onClick={() => setFace(item)} className={`rounded-xl px-4 py-2 capitalize ${face === item ? "bg-gold text-ink" : "text-mute"}`}>
              {item === "salon" ? "Barbershop" : "Barber"}
            </button>
          ))}
        </div>
      </div>
      {face === "salon" && data ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            <Kpi label="Customers" value={String(data.salon.customers)} />
            <Kpi label="Income" value={money(data.salon.income)} accent />
            <Kpi label="Expenses" value={money(data.salon.expenses)} />
            <Kpi label="Net" value={money(data.salon.profit)} accent />
            <Kpi label="Days" value={String(data.salon.days)} />
            <Kpi label="Avg daily" value={money(data.salon.avgDaily)} />
          </div>
          <Panel title="Ranking">
            <div className="space-y-3">
              {data.ranking.map((row) => (
                <div key={row.barberId} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl bg-ink px-3 py-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-gold text-sm font-semibold text-ink">{row.rank}</span>
                  <div>
                    <p>{row.name}</p>
                    <p className="text-xs text-mute">{row.customers} clients · {row.share}% of the house</p>
                  </div>
                  <p className="text-right font-display text-gold">{money(row.earned)}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      ) : null}
      {face === "barber" ? (
        <div className="space-y-4">
          <select value={barberId} onChange={(e) => setBarberId(e.target.value)} className="w-full rounded-2xl border border-line bg-panel px-4 py-3">
            <option value="">Select a barber</option>
            {barbers.map((item) => (
              <option key={item.id} value={item.id}>{item.name} ({item.code})</option>
            ))}
          </select>
          {barber ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Kpi label="Customers" value={String(barber.customers)} />
                <Kpi label="Earned" value={money(barber.earned)} accent />
                <Kpi label="Avg service" value={money(barber.avg)} />
                <Kpi label="Days worked" value={String(barber.days)} />
              </div>
              <Panel title={barber.name}>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barber.trend}>
                      <XAxis dataKey="date" hide />
                      <YAxis hide />
                      <Tooltip formatter={(value) => money(Number(value))} contentStyle={{ background: "#141210", border: "1px solid #2a241c" }} />
                      <Bar dataKey="total" fill="#d4af37" radius={6} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Panel>
            </>
          ) : null}
        </div>
      ) : null}
    </Shell>
  );
}
