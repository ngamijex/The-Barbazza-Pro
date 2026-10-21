"use client";

import { FormEvent, useEffect, useState } from "react";
import { Kpi, Panel, Shell, useSession } from "@/components/Shell";
import { api, money } from "@/lib/api";

type Day = {
  date: string;
  income: number;
  customers: number;
  expenses: number;
  profit: number;
  barbers: { code: string; name: string; clients: number; earned: number }[];
  expenseRows: { category: string; description: string; amount: number; time: string; addedBy: string }[];
};
type Option = { id: number; name: string; price?: number; code?: string };
type BarberOption = { id: number; name: string; code: string };

export default function FloorPage() {
  const user = useSession();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [day, setDay] = useState<Day | null>(null);
  const [error, setError] = useState("");
  const [barbers, setBarbers] = useState<BarberOption[]>([]);
  const [services, setServices] = useState<Option[]>([]);
  const [categories, setCategories] = useState<Option[]>([]);
  const [form, setForm] = useState({ barberId: "", serviceId: "", amount: "", customerName: "" });
  const [expense, setExpense] = useState({ categoryId: "", amount: "", description: "" });

  async function load(selected = date) {
    setDay(await api<Day>(`/api/day?date=${selected}`));
  }

  useEffect(() => {
    if (!user) return;
    load(date).catch((err) => setError(err.message));
    if (user.role === "manager" || user.role === "admin") {
      api<BarberOption[]>("/api/barbers").then((rows) => setBarbers(rows.map((row) => ({ ...row, name: `${row.name} (${row.code})` })))).catch(() => undefined);
      api<Option[]>("/api/services").then(setServices).catch(() => undefined);
      api<Option[]>("/api/categories").then(setCategories).catch(() => undefined);
    }
  }, [user, date]);

  async function addService(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await api("/api/transactions", {
        method: "POST",
        body: JSON.stringify({
          barberId: Number(form.barberId),
          serviceId: Number(form.serviceId),
          amount: Number(form.amount),
          customerName: form.customerName,
        }),
      });
      setForm({ barberId: "", serviceId: "", amount: "", customerName: "" });
      await load(new Date().toISOString().slice(0, 10));
      setDate(new Date().toISOString().slice(0, 10));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add service");
    }
  }

  async function addExpense(event: FormEvent) {
    event.preventDefault();
    try {
      await api("/api/expenses", {
        method: "POST",
        body: JSON.stringify({
          categoryId: Number(expense.categoryId),
          amount: Number(expense.amount),
          description: expense.description,
          date,
        }),
      });
      setExpense({ categoryId: "", amount: "", description: "" });
      await load(date);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add expense");
    }
  }

  const canWrite = user?.role === "manager" || user?.role === "admin";

  return (
    <Shell title="The floor" subtitle="Any day, every chair, every expense.">
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mb-4 w-full rounded-2xl border border-line bg-panel px-4 py-3 md:max-w-xs" />
      {error ? <p className="mb-3 rounded-xl border border-burgundy/40 bg-burgundy/20 px-4 py-3 text-sm">{error}</p> : null}
      {day ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Kpi label="Income" value={money(day.income)} accent />
            <Kpi label="Clients" value={String(day.customers)} />
            <Kpi label="Expenses" value={money(day.expenses)} />
            <Kpi label="Net" value={money(day.profit)} accent />
          </div>
          {canWrite && date === new Date().toISOString().slice(0, 10) ? (
            <Panel title="Add a service">
              <form onSubmit={addService} className="grid gap-3 md:grid-cols-2">
                <select required value={form.barberId} onChange={(e) => setForm({ ...form, barberId: e.target.value })} className="rounded-2xl bg-ink px-4 py-3">
                  <option value="">Barber</option>
                  {barbers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
                <select required value={form.serviceId} onChange={(e) => {
                  const service = services.find((item) => item.id === Number(e.target.value));
                  setForm({ ...form, serviceId: e.target.value, amount: service?.price ? String(service.price) : form.amount });
                }} className="rounded-2xl bg-ink px-4 py-3">
                  <option value="">Service</option>
                  {services.filter((item) => item.name).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
                <input required type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="rounded-2xl bg-ink px-4 py-3" />
                <input placeholder="Client name" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="rounded-2xl bg-ink px-4 py-3" />
                <button className="btn-gold md:col-span-2">Record service</button>
              </form>
            </Panel>
          ) : null}
          <Panel title="Barbers">
            <div className="space-y-2">
              {day.barbers.map((barber) => (
                <div key={barber.code} className="flex items-center justify-between rounded-2xl bg-ink px-4 py-3">
                  <div>
                    <p>{barber.name}</p>
                    <p className="text-xs text-mute">{barber.code} · {barber.clients} clients</p>
                  </div>
                  <p className="text-gold">{money(barber.earned)}</p>
                </div>
              ))}
            </div>
          </Panel>
          {canWrite ? (
            <Panel title="Add an expense">
              <form onSubmit={addExpense} className="grid gap-3">
                <select required value={expense.categoryId} onChange={(e) => setExpense({ ...expense, categoryId: e.target.value })} className="rounded-2xl bg-ink px-4 py-3">
                  <option value="">Category</option>
                  {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
                <input required type="number" placeholder="Amount" value={expense.amount} onChange={(e) => setExpense({ ...expense, amount: e.target.value })} className="rounded-2xl bg-ink px-4 py-3" />
                <input required placeholder="What was it for?" value={expense.description} onChange={(e) => setExpense({ ...expense, description: e.target.value })} className="rounded-2xl bg-ink px-4 py-3" />
                <button className="rounded-2xl border border-gold py-3 text-gold">Save expense</button>
              </form>
            </Panel>
          ) : null}
          <Panel title="Expenses">
            <div className="space-y-2">
              {day.expenseRows.length === 0 ? <p className="text-mute">No expenses on this date.</p> : null}
              {day.expenseRows.map((row, index) => (
                <div key={`${row.time}-${index}`} className="rounded-2xl bg-ink px-4 py-3">
                  <div className="flex justify-between gap-3">
                    <p>{row.category}</p>
                    <p className="text-gold">{money(row.amount)}</p>
                  </div>
                  <p className="text-sm text-mute">{row.description}</p>
                  <p className="text-xs text-mute">{row.time} · {row.addedBy}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      ) : null}
    </Shell>
  );
}
