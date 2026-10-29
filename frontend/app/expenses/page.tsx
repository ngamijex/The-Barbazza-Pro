"use client";

import { FormEvent, useEffect, useState } from "react";
import { Panel, Shell, useSession } from "@/components/Shell";
import { api, money } from "@/lib/api";

type Option = { id: number; name: string; code?: string };
type ExpenseRow = { category: string; description: string; amount: number; time: string; addedBy: string };

export default function ExpensesPage() {
  const user = useSession();
  const [categories, setCategories] = useState<Option[]>([]);
  const [barbers, setBarbers] = useState<Option[]>([]);
  const [rows, setRows] = useState<ExpenseRow[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    categoryId: "",
    expenseType: "shop",
    barberId: "",
    description: "",
    amount: "",
    receipt: "",
  });

  async function load() {
    const day = await api<{ expenseRows: ExpenseRow[] }>(`/api/day?date=${form.date}`);
    setRows(day.expenseRows);
  }

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      api<Option[]>("/api/categories").then(setCategories).catch(() => undefined),
      api<{ id: number; name: string; code: string }[]>("/api/barbers")
        .then((list) => setBarbers(list.map((b) => ({ id: b.id, name: `${b.name} (${b.code})` }))))
        .catch(() => undefined),
      load().catch((err) => setError(err.message)),
    ]).finally(() => setLoading(false));
  }, [user, form.date]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await api("/api/expenses", {
        method: "POST",
        body: JSON.stringify({
          categoryId: Number(form.categoryId),
          amount: Number(form.amount),
          description: form.description,
          date: form.date,
          expenseType: form.expenseType,
          barberId: form.expenseType === "barber" && form.barberId ? Number(form.barberId) : null,
          receiptNumber: form.receipt || null,
        }),
      });
      setForm({ ...form, categoryId: "", description: "", amount: "", receipt: "", barberId: "" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not record expense");
    }
  }

  return (
    <Shell loading={loading && !error}>
      <Panel title="Record Expense" className="manager-card">
        {error ? <div className="alert alert-danger">{error}</div> : null}
        <form onSubmit={onSubmit} className="service-form">
          <div className="form-grid form-grid-4">
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">Select...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Type</label>
              <select value={form.expenseType} onChange={(e) => setForm({ ...form, expenseType: e.target.value })}>
                <option value="shop">Shop</option>
                <option value="barber">Barber</option>
              </select>
            </div>
            <div className="form-group">
              <label>Barber (if applicable)</label>
              <select
                value={form.barberId}
                onChange={(e) => setForm({ ...form, barberId: e.target.value })}
                disabled={form.expenseType !== "barber"}
              >
                <option value="">Select...</option>
                {barbers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-grid form-grid-3">
            <div className="form-group" style={{ gridColumn: "span 2" }}>
              <label>Description</label>
              <input
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Amount (RWF)</label>
              <input
                required
                type="number"
                min={0}
                step={100}
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Receipt Number (Optional)</label>
            <input value={form.receipt} onChange={(e) => setForm({ ...form, receipt: e.target.value })} />
          </div>
          <button type="submit" className="btn-action">
            Record Expense
          </button>
        </form>
      </Panel>

      <Panel title="Today's Expenses" className="manager-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Time</th>
              <th>Added By</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5}>No expenses for this date.</td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={`${row.time}-${i}`}>
                  <td>{row.category}</td>
                  <td>{row.description}</td>
                  <td>{money(row.amount)}</td>
                  <td>{row.time}</td>
                  <td>{row.addedBy}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Panel>
    </Shell>
  );
}
