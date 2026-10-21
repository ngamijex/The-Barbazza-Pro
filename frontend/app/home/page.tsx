"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Kpi, Panel, Shell, useSession } from "@/components/Shell";
import { api, money } from "@/lib/api";

type Overview = {
  totalUsers: number;
  activeBarbers: number;
  today: { income: number; customers: number };
  week: { income: number; customers: number; expenses: number; profit: number };
  month: { income: number; customers: number; expenses: number; profit: number; avgDaily: number };
  trend: { date: string; total: number }[];
};

type Day = {
  income: number;
  customers: number;
  expenses: number;
  profit: number;
  barbers: { code: string; name: string; clients: number; earned: number }[];
};

type BarberHome = {
  commissionRate: number;
  today: { gross: number; commission: number; shop: number; customers: number };
  month: { gross: number; commission: number; customers: number; bestDay: number; recruitmentDeduction: number; recruitmentBalance: number; expectedNet: number };
};

export default function HomePage() {
  const user = useSession();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [day, setDay] = useState<Day | null>(null);
  const [chair, setChair] = useState<BarberHome | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        if (user.role === "admin") setOverview(await api<Overview>("/api/dashboard/overview"));
        else if (user.role === "barber") setChair(await api<BarberHome>("/api/barber/home"));
        else setDay(await api<Day>("/api/day"));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load the floor");
      }
    };
    load();
  }, [user]);

  const title = user?.role === "barber" ? "Your chair" : user?.role === "admin" ? "House view" : "Today on the floor";

  return (
    <Shell title={title} subtitle={user ? `Welcome, ${user.fullName}` : ""}>
      {error ? <p className="mb-4 rounded-xl border border-burgundy/40 bg-burgundy/20 px-4 py-3 text-sm">{error}</p> : null}
      {user?.role === "admin" && overview ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi label="Today" value={money(overview.today.income)} accent />
            <Kpi label="Clients" value={String(overview.today.customers)} />
            <Kpi label="This week" value={money(overview.week.profit)} />
            <Kpi label="Active chairs" value={String(overview.activeBarbers)} />
          </div>
          <Panel title="This month">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Kpi label="Income" value={money(overview.month.income)} />
              <Kpi label="Expenses" value={money(overview.month.expenses)} />
              <Kpi label="Net" value={money(overview.month.profit)} accent />
              <Kpi label="Avg / day" value={money(overview.month.avgDaily)} />
            </div>
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={overview.trend}>
                  <XAxis dataKey="date" hide />
                  <Tooltip formatter={(value) => money(Number(value))} contentStyle={{ background: "#1a1816", border: "1px solid rgba(201,162,39,0.25)", color: "#f3efe6", borderRadius: 12 }} />
                  <Area dataKey="total" stroke="#c9a227" fill="rgba(201,162,39,0.18)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>
      ) : null}
      {(user?.role === "manager" || user?.role === "supervisor") && day ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Kpi label="Income" value={money(day.income)} accent />
            <Kpi label="Clients" value={String(day.customers)} />
            <Kpi label="Expenses" value={money(day.expenses)} />
            <Kpi label="Net" value={money(day.profit)} accent />
          </div>
          <Panel title="Chairs">
            <div className="space-y-3">
              {day.barbers.map((barber) => (
                <div key={barber.code} className="flex items-center justify-between rounded-2xl bg-ink px-4 py-3">
                  <div>
                    <p className="font-medium">{barber.name}</p>
                    <p className="text-xs text-mute">{barber.code} · {barber.clients} clients</p>
                  </div>
                  <p className="font-display text-lg text-gold">{money(barber.earned)}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      ) : null}
      {user?.role === "barber" && chair ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Kpi label="Gross today" value={money(chair.today.gross)} />
            <Kpi label={`Your ${chair.commissionRate}%`} value={money(chair.today.commission)} accent />
            <Kpi label="Clients" value={String(chair.today.customers)} />
            <Kpi label="Shop share" value={money(chair.today.shop)} />
          </div>
          <Panel title="This month">
            <div className="grid grid-cols-2 gap-3">
              <Kpi label="Gross" value={money(chair.month.gross)} />
              <Kpi label="Commission" value={money(chair.month.commission)} accent />
              <Kpi label="Best day" value={money(chair.month.bestDay)} />
              <Kpi label="Expected net" value={money(chair.month.expectedNet)} accent />
              <Kpi label="Advance left" value={money(chair.month.recruitmentBalance)} />
              <Kpi label="Monthly deduction" value={money(chair.month.recruitmentDeduction)} />
            </div>
          </Panel>
        </div>
      ) : null}
    </Shell>
  );
}
