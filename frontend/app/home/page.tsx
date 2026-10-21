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
  month: {
    gross: number;
    commission: number;
    customers: number;
    bestDay: number;
    recruitmentDeduction: number;
    recruitmentBalance: number;
    expectedNet: number;
  };
};

export default function HomePage() {
  const user = useSession();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [day, setDay] = useState<Day | null>(null);
  const [chair, setChair] = useState<BarberHome | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        if (user.role === "admin") setOverview(await api<Overview>("/api/dashboard/overview"));
        else if (user.role === "barber") setChair(await api<BarberHome>("/api/barber/home"));
        else setDay(await api<Day>("/api/day"));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load dashboard");
      }
    })();
  }, [user]);

  const title =
    user?.role === "admin"
      ? "System Overview"
      : user?.role === "barber"
        ? "Today's Financial Summary"
        : "Today's Summary";

  return (
    <Shell title={title} subtitle={user ? `Welcome, ${user.fullName}` : undefined}>
      {error ? <p className="mb-4 border-l-4 border-error bg-red-50 px-4 py-3 text-sm">{error}</p> : null}

      {user?.role === "admin" && overview ? (
        <div className="space-y-4">
          <Panel title="System Overview">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Kpi label="Total Users" value={String(overview.totalUsers)} />
              <Kpi label="Active Barbers" value={String(overview.activeBarbers)} />
              <Kpi label="Today's Income" value={money(overview.today.income)} />
              <Kpi label="Today's Customers" value={String(overview.today.customers)} />
            </div>
          </Panel>
          <Panel title="This Week Performance">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Kpi label="Weekly Income" value={money(overview.week.income)} />
              <Kpi label="Weekly Customers" value={String(overview.week.customers)} />
              <Kpi label="Weekly Expenses" value={money(overview.week.expenses)} />
              <Kpi label="Net Profit" value={money(overview.week.profit)} />
            </div>
          </Panel>
          <Panel title="This Month Performance">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
              <Kpi label="Monthly Income" value={money(overview.month.income)} />
              <Kpi label="Monthly Customers" value={String(overview.month.customers)} />
              <Kpi label="Monthly Expenses" value={money(overview.month.expenses)} />
              <Kpi label="Net Profit" value={money(overview.month.profit)} />
              <Kpi label="Avg Daily Income" value={money(overview.month.avgDaily)} />
            </div>
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={overview.trend}>
                  <XAxis dataKey="date" hide />
                  <Tooltip
                    formatter={(value) => money(Number(value))}
                    contentStyle={{ background: "#fff", border: "1px solid #e8e8e8", color: "#0a0a0a" }}
                  />
                  <Area dataKey="total" stroke="#0a0a0a" fill="rgba(10,10,10,0.08)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>
      ) : null}

      {(user?.role === "manager" || user?.role === "supervisor") && day ? (
        <div className="space-y-4">
          <Panel>
            <div className="grid grid-cols-2 gap-3">
              <Kpi label="Total Income" value={money(day.income)} />
              <Kpi label="Total Customers" value={String(day.customers)} />
              <Kpi label="Total Expenses" value={money(day.expenses)} />
              <Kpi label="Net Profit" value={money(day.profit)} />
            </div>
          </Panel>
          <Panel title="Barber Performance">
            <div className="space-y-2">
              {day.barbers.map((b) => (
                <div key={b.code} className="flex items-center justify-between rounded border border-line bg-field px-4 py-3">
                  <div>
                    <p className="font-medium text-cream">{b.name}</p>
                    <p className="text-xs text-mute">
                      {b.code} · {b.clients} clients
                    </p>
                  </div>
                  <p className="font-semibold text-gold">{money(b.earned)}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      ) : null}

      {user?.role === "barber" && chair ? (
        <div className="space-y-4">
          <Panel title="Today's Financial Summary">
            <div className="grid grid-cols-2 gap-3">
              <Kpi label="Gross Income (100%)" value={money(chair.today.gross)} />
              <Kpi label={`Your Commission (${chair.commissionRate}%)`} value={money(chair.today.commission)} />
              <Kpi label="Shop Share" value={money(chair.today.shop)} />
              <Kpi label="Customers Served" value={String(chair.today.customers)} />
            </div>
          </Panel>
          <Panel title="This Month's Performance">
            <div className="grid grid-cols-2 gap-3">
              <Kpi label="Gross Income" value={money(chair.month.gross)} />
              <Kpi label="Your Commission" value={money(chair.month.commission)} />
              <Kpi label="Best Day Income" value={money(chair.month.bestDay)} />
              <Kpi label="Expected Net Income" value={money(chair.month.expectedNet)} />
              <Kpi label="Recruitment Balance" value={money(chair.month.recruitmentBalance)} />
              <Kpi label="Monthly Deduction" value={money(chair.month.recruitmentDeduction)} />
            </div>
          </Panel>
        </div>
      ) : null}
    </Shell>
  );
}
