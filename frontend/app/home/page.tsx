"use client";

import { FormEvent, useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Kpi, Panel, Shell, useSession } from "@/components/Shell";
import { PageSkeleton } from "@/components/Skeleton";
import { api, money } from "@/lib/api";

type Operations = {
  today: { income: number; customers: number; expenses: number; profit: number };
  month: {
    income: number;
    customers: number;
    expenses: number;
    profit: number;
    services: number;
    avgDaily: number;
    label: string;
  };
  trend: { date: string; total: number }[];
  transactions: {
    id: number;
    service: string;
    amount: number;
    customer: string;
    barberCode: string;
    barberName: string;
    time: string;
  }[];
};

type Overview = {
  totalUsers: number;
  activeBarbers: number;
  today: { income: number; customers: number };
  week: { income: number; customers: number; expenses: number; profit: number };
  month: { income: number; customers: number; expenses: number; profit: number; avgDaily: number };
  trend: { date: string; total: number }[];
  topBarbers: { code: string; name: string; customers: number; earned: number; avg: number }[];
  recentActivity: { action: string; table: string; time: string }[];
};

type Day = {
  income: number;
  customers: number;
  expenses: number;
  profit: number;
  barbers: { code: string; name: string; clients: number; earned: number }[];
  expenseRows: { category: string; description: string; amount: number; time: string; addedBy: string }[];
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

type Option = { id: number; name: string; price?: number; code?: string };

export default function HomePage() {
  const user = useSession();
  const [ops, setOps] = useState<Operations | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [day, setDay] = useState<Day | null>(null);
  const [chair, setChair] = useState<BarberHome | null>(null);
  const [error, setError] = useState("");
  const [barbers, setBarbers] = useState<Option[]>([]);
  const [services, setServices] = useState<Option[]>([]);
  const [form, setForm] = useState({
    barberId: "",
    serviceId: "",
    amount: "",
    customerName: "",
    notes: "",
  });
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  async function loadManager() {
    setOps(await api<Operations>("/api/operations"));
  }

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        if (user.role === "admin") setOverview(await api<Overview>("/api/dashboard/overview"));
        else if (user.role === "manager") {
          const [opsData, b, s] = await Promise.all([
            api<Operations>("/api/operations"),
            api<{ id: number; name: string; code: string }[]>("/api/barbers"),
            api<Option[]>("/api/services"),
          ]);
          setOps(opsData);
          setBarbers(b.map((row) => ({ id: row.id, name: `${row.name} (${row.code})`, code: row.code })));
          setServices(s);
        } else if (user.role === "supervisor") {
          setDay(await api<Day>(`/api/day?date=${date}`));
        } else if (user.role === "barber") {
          setChair(await api<BarberHome>("/api/barber/home"));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load");
      }
    })();
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
          notes: form.notes,
        }),
      });
      setForm({ barberId: "", serviceId: "", amount: "", customerName: "", notes: "" });
      await loadManager();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add service");
    }
  }

  async function removeTx(id: number) {
    if (!confirm("Delete this transaction?")) return;
    await api(`/api/transactions/${id}`, { method: "DELETE" });
    await loadManager();
  }

  const cardClass =
    user?.role === "admin" ? "admin-card" : user?.role === "barber" ? "barber-card" : user?.role === "supervisor" ? "supervisor-card" : "manager-card";

  const loading =
    !!user &&
    !error &&
    ((user.role === "manager" && !ops) ||
      (user.role === "admin" && !overview) ||
      (user.role === "supervisor" && !day) ||
      (user.role === "barber" && !chair));

  return (
    <Shell loading={loading}>
      {error ? <div className="alert alert-danger">{error}</div> : null}
      {!user ? <PageSkeleton /> : null}

      {/* ===== MANAGER: Daily Operations (exact Shiny sections) ===== */}
      {user?.role === "manager" && ops ? (
        <>
          <Panel title="Today's Summary" className="manager-card">
            <div className="daily-summary">
              <Kpi label="Total Income" value={money(ops.today.income)} />
              <Kpi label="Total Customers" value={String(ops.today.customers)} />
              <Kpi label="Total Expenses" value={money(ops.today.expenses)} />
              <Kpi label="Net Profit" value={money(ops.today.profit)} />
            </div>
          </Panel>

          <Panel title="This Month's Summary" className="manager-card">
            <p style={{ fontSize: "0.9rem", color: "var(--barbazza-cream)", marginBottom: "var(--space-4)" }}>
              Month of {ops.month.label}
            </p>
            <div className="daily-summary">
              <Kpi label="Total Income" value={money(ops.month.income)} />
              <Kpi label="Total Customers" value={String(ops.month.customers)} />
              <Kpi label="Total Expenses" value={money(ops.month.expenses)} />
              <Kpi label="Net Profit" value={money(ops.month.profit)} />
              <Kpi label="Total Services" value={String(ops.month.services)} />
              <Kpi label="Average Daily Income" value={money(ops.month.avgDaily)} />
            </div>
          </Panel>

          <Panel title="Income Trend - This Month" className="manager-card">
            <p style={{ fontSize: "0.9rem", color: "var(--barbazza-cream)", marginBottom: "var(--space-4)" }}>
              Total barbershop income performance this month
            </p>
            <div style={{ height: 300, position: "relative" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ops.trend}>
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

          <Panel title="Add Service Transaction" className="manager-card">
            <form onSubmit={addService} className="service-form">
              <div className="form-grid form-grid-3">
                <div className="form-group">
                  <label>Select Barber *</label>
                  <select
                    required
                    value={form.barberId}
                    onChange={(e) => setForm({ ...form, barberId: e.target.value })}
                  >
                    <option value="">Select...</option>
                    {barbers.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Select Service *</label>
                  <select
                    required
                    value={form.serviceId}
                    onChange={(e) => {
                      const service = services.find((s) => s.id === Number(e.target.value));
                      setForm({
                        ...form,
                        serviceId: e.target.value,
                        amount: service?.price != null ? String(service.price) : form.amount,
                      });
                    }}
                  >
                    <option value="">Select...</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Amount (RWF) *</label>
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
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label>Customer Name (Optional)</label>
                  <input
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Notes (Optional)</label>
                  <textarea
                    rows={2}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" className="btn-action">
                Add Service
              </button>
            </form>
          </Panel>

          <Panel title="Today's Transactions" className="manager-card">
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Barber</th>
                    <th>Service</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {ops.transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6}>No transactions today.</td>
                    </tr>
                  ) : (
                    ops.transactions.map((tx) => (
                      <tr key={tx.id}>
                        <td>{tx.time}</td>
                        <td>
                          {tx.barberName} ({tx.barberCode})
                        </td>
                        <td>{tx.service}</td>
                        <td>{tx.customer || "-"}</td>
                        <td>{money(tx.amount)}</td>
                        <td>
                          <button type="button" className="btn-logout" onClick={() => removeTx(tx.id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      ) : null}

      {/* ===== ADMIN: Dashboard ===== */}
      {user?.role === "admin" && overview ? (
        <>
          <Panel title="System Overview" className="admin-card">
            <div className="daily-summary">
              <Kpi label="Total Users" value={String(overview.totalUsers)} />
              <Kpi label="Active Barbers" value={String(overview.activeBarbers)} />
              <Kpi label="Today's Income" value={money(overview.today.income)} />
              <Kpi label="Today's Customers" value={String(overview.today.customers)} />
            </div>
          </Panel>
          <Panel title="This Week Performance" className="admin-card">
            <div className="daily-summary">
              <Kpi label="Weekly Income" value={money(overview.week.income)} />
              <Kpi label="Weekly Customers" value={String(overview.week.customers)} />
              <Kpi label="Weekly Expenses" value={money(overview.week.expenses)} />
              <Kpi label="Net Profit" value={money(overview.week.profit)} />
            </div>
          </Panel>
          <Panel title="This Month Performance" className="admin-card">
            <div className="daily-summary">
              <Kpi label="Monthly Income" value={money(overview.month.income)} />
              <Kpi label="Monthly Customers" value={String(overview.month.customers)} />
              <Kpi label="Monthly Expenses" value={money(overview.month.expenses)} />
              <Kpi label="Net Profit" value={money(overview.month.profit)} />
              <Kpi label="Avg Daily Income" value={money(overview.month.avgDaily)} />
            </div>
          </Panel>
          <Panel title="Income Trend - This Month" className="admin-card">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={overview.trend}>
                  <XAxis dataKey="date" hide />
                  <Tooltip formatter={(value) => money(Number(value))} />
                  <Area dataKey="total" stroke="#0a0a0a" fill="rgba(10,10,10,0.08)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>
          <Panel title="Top Performing Barbers (This Month)" className="admin-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Barber</th>
                  <th>Services</th>
                  <th>Total Income</th>
                  <th>Avg Service</th>
                </tr>
              </thead>
              <tbody>
                {(overview.topBarbers || []).length === 0 ? (
                  <tr>
                    <td colSpan={4}>No data.</td>
                  </tr>
                ) : (
                  overview.topBarbers.map((row) => (
                    <tr key={row.code}>
                      <td>{row.name}</td>
                      <td>{row.customers}</td>
                      <td>{money(row.earned)}</td>
                      <td>{money(row.avg)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Panel>
          <Panel title="Recent System Activity" className="admin-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Table</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {(overview.recentActivity || []).length === 0 ? (
                  <tr>
                    <td colSpan={3}>No activity.</td>
                  </tr>
                ) : (
                  overview.recentActivity.map((row, i) => (
                    <tr key={`${row.time}-${i}`}>
                      <td>{row.action}</td>
                      <td>{row.table}</td>
                      <td>{row.time}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Panel>
        </>
      ) : null}

      {/* ===== SUPERVISOR ===== */}
      {user?.role === "supervisor" ? (
        <Panel title="Today's Barber Performance" className="supervisor-card">
          <p style={{ fontSize: "0.9rem", color: "var(--barbazza-cream)", marginBottom: "var(--space-4)" }}>
            Select a date to view barber performance and expenses.
          </p>
          <div style={{ maxWidth: 320, marginBottom: "var(--space-5)" }}>
            <label>Select Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          {day ? (
            <>
              <div className="daily-summary" style={{ marginBottom: "var(--space-6)" }}>
                <Kpi label="Total Income Today" value={money(day.income)} />
                <Kpi label="Total Clients Today" value={String(day.customers)} />
                <Kpi label="Total Expenses Today" value={money(day.expenses)} />
                <Kpi label="Net Profit Today" value={money(day.profit)} />
              </div>
              <h4 style={{ color: "var(--barbazza-gold)", marginBottom: "var(--space-4)" }}>Barber Breakdown</h4>
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
              <h4 style={{ color: "var(--barbazza-gold)", margin: "var(--space-6) 0 var(--space-4)" }}>
                Today&apos;s Expenses
              </h4>
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
                  {day.expenseRows.length === 0 ? (
                    <tr>
                      <td colSpan={5}>No expenses.</td>
                    </tr>
                  ) : (
                    day.expenseRows.map((row, i) => (
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
            </>
          ) : null}
        </Panel>
      ) : null}

      {/* ===== BARBER: Dashboard ===== */}
      {user?.role === "barber" && chair ? (
        <>
          <Panel title="Today's Financial Summary" className={cardClass}>
            <div className="earnings-grid daily-summary">
              <Kpi label="Gross Income (100%)" value={money(chair.today.gross)} />
              <Kpi label={`Your Commission (${chair.commissionRate}%)`} value={money(chair.today.commission)} />
              <Kpi label="Shop Share" value={money(chair.today.shop)} />
              <Kpi label="Customers Served" value={String(chair.today.customers)} />
            </div>
          </Panel>
          <Panel title="This Month's Performance" className={cardClass}>
            <div className="earnings-grid daily-summary">
              <Kpi label="Gross Income" value={money(chair.month.gross)} />
              <Kpi label="Your Commission" value={money(chair.month.commission)} />
              <Kpi label="Best Day Income" value={money(chair.month.bestDay)} />
              <Kpi label="Expected Net Income" value={money(chair.month.expectedNet)} />
              <Kpi label="Recruitment Balance" value={money(chair.month.recruitmentBalance)} />
              <Kpi label="Monthly Deduction" value={money(chair.month.recruitmentDeduction)} />
            </div>
          </Panel>
        </>
      ) : null}
    </Shell>
  );
}
