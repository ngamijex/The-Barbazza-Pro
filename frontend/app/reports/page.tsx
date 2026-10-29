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
    <Shell>
      <Panel title="Reports & Analytics" className="admin-card">
        <div className="form-grid form-grid-2" style={{ marginBottom: "var(--space-4)" }}>
          <div className="form-group">
            <label>Start Date</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
        {error ? <div className="alert alert-danger">{error}</div> : null}
        <div className="daily-summary" style={{ marginBottom: "var(--space-4)" }}>
          <Kpi label="Total Income" value={money(totals.income)} />
          <Kpi label="Total Expenses" value={money(totals.expenses)} />
          <Kpi label="Net Profit" value={money(totals.profit)} />
          <Kpi label="Total Customers" value={String(totals.customers)} />
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Customers</th>
              <th>Income</th>
              <th>Expenses</th>
              <th>Net Profit</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6}>No reports in this range.</td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.date}>
                  <td>{row.date}</td>
                  <td>{row.customers}</td>
                  <td>{money(row.income)}</td>
                  <td>{money(row.expenses)}</td>
                  <td>{money(row.profit)}</td>
                  <td>{row.locked ? "Locked" : "Open"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Panel>
    </Shell>
  );
}
