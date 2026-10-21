"use client";

import { useEffect, useState } from "react";
import { Kpi, Panel, Shell } from "@/components/Shell";
import { api, money } from "@/lib/api";

type Report = {
  date: string;
  customers: number;
  income: number;
  expenses: number;
  profit: number;
  locked: boolean;
};

export default function ReportsPage() {
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<Report[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Report[]>(`/api/reports?from=${from}&to=${to}`)
      .then(setRows)
      .catch((err) => setError(err.message));
  }, [from, to]);

  const totals = rows.reduce(
    (acc, row) => ({
      income: acc.income + row.income,
      expenses: acc.expenses + row.expenses,
      profit: acc.profit + row.profit,
      customers: acc.customers + row.customers,
    }),
    { income: 0, expenses: 0, profit: 0, customers: 0 }
  );

  return (
    <Shell title="Reports & Analytics" subtitle="Daily reports from the books.">
      <Panel title="Daily Reports">
        <div className="mb-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          <label className="text-sm text-cream">
            Start Date
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1" />
          </label>
          <label className="text-sm text-cream">
            End Date
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1" />
          </label>
        </div>
        {error ? <p className="mb-3 border-l-4 border-error bg-red-50 px-3 py-2 text-sm">{error}</p> : null}
        <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi label="Total Income" value={money(totals.income)} />
          <Kpi label="Total Expenses" value={money(totals.expenses)} />
          <Kpi label="Net Profit" value={money(totals.profit)} />
          <Kpi label="Total Customers" value={String(totals.customers)} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-mute">
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-3">Customers</th>
                <th className="py-2 pr-3">Income</th>
                <th className="py-2 pr-3">Expenses</th>
                <th className="py-2 pr-3">Net Profit</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-mute">
                    No reports in this range.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.date} className="border-b border-line/70">
                    <td className="py-2.5 pr-3">{row.date}</td>
                    <td className="py-2.5 pr-3">{row.customers}</td>
                    <td className="py-2.5 pr-3">{money(row.income)}</td>
                    <td className="py-2.5 pr-3">{money(row.expenses)}</td>
                    <td className="py-2.5 pr-3 font-medium text-gold">{money(row.profit)}</td>
                    <td className="py-2.5">{row.locked ? "Locked" : "Open"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </Shell>
  );
}
