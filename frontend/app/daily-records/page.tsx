"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Kpi, Panel, Shell, useSession } from "@/components/Shell";
import { api, money } from "@/lib/api";

type Day = {
  income: number;
  customers: number;
  expenses: number;
  profit: number;
  barbers: { code: string; name: string; clients: number; earned: number }[];
  expenseRows: { category: string; description: string; amount: number; time: string; addedBy: string }[];
};

type Tx = {
  id: number;
  service: string;
  amount: number;
  customer: string;
  barberCode: string;
  barberName: string;
  time: string;
};

export default function DailyRecordsPage() {
  const user = useSession();
  const router = useRouter();
  const monthStart = new Date();
  monthStart.setDate(1);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [day, setDay] = useState<Day | null>(null);
  const [tx, setTx] = useState<Tx[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") {
      router.replace("/home");
      return;
    }
    setLoading(true);
    Promise.all([api<Day>(`/api/day?date=${date}`), api<Tx[]>(`/api/transactions?date=${date}`)])
      .then(([d, t]) => {
        setDay(d);
        setTx(t);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user, date, router]);

  return (
    <Shell loading={loading && !error}>
      <Panel title="View Specific Day Records" className="manager-card">
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
        {error ? <div className="alert alert-danger">{error}</div> : null}
        {day ? (
          <>
            <h4>Summary for Selected Day</h4>
            <div className="daily-summary" style={{ marginBottom: "var(--space-6)" }}>
              <Kpi label="Total Income" value={money(day.income)} />
              <Kpi label="Total Customers" value={String(day.customers)} />
              <Kpi label="Total Expenses" value={money(day.expenses)} />
              <Kpi label="Net Profit" value={money(day.profit)} />
            </div>
          </>
        ) : null}
      </Panel>

      <Panel title="Transactions" className="manager-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Barber</th>
              <th>Service</th>
              <th>Customer</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {tx.length === 0 ? (
              <tr>
                <td colSpan={5}>No transactions.</td>
              </tr>
            ) : (
              tx.map((row) => (
                <tr key={row.id}>
                  <td>{row.time}</td>
                  <td>
                    {row.barberName} ({row.barberCode})
                  </td>
                  <td>{row.service}</td>
                  <td>{row.customer || "-"}</td>
                  <td>{money(row.amount)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Panel>

      {day ? (
        <>
          <Panel title="Expenses" className="manager-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {day.expenseRows.length === 0 ? (
                  <tr>
                    <td colSpan={4}>No expenses.</td>
                  </tr>
                ) : (
                  day.expenseRows.map((row, i) => (
                    <tr key={`${row.time}-${i}`}>
                      <td>{row.category}</td>
                      <td>{row.description}</td>
                      <td>{money(row.amount)}</td>
                      <td>{row.time}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Panel>
          <Panel title="Barber Performance" className="manager-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Barber</th>
                  <th>Code</th>
                  <th>Clients</th>
                  <th>Earned</th>
                </tr>
              </thead>
              <tbody>
                {day.barbers.map((b) => (
                  <tr key={b.code}>
                    <td>{b.name}</td>
                    <td>{b.code}</td>
                    <td>{b.clients}</td>
                    <td>{money(b.earned)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </>
      ) : null}
    </Shell>
  );
}
