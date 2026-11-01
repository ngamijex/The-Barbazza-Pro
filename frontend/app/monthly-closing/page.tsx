"use client";

import { useEffect, useMemo, useState } from "react";
import { Shell, useSession } from "@/components/Shell";
import { api, money } from "@/lib/api";

type MonthOption = { key: string; label: string };

type ClosingRow = {
  barberId: number;
  barberCode: string;
  fullName: string;
  commissionRate: number;
  recruitmentDeduction: number;
  recruitmentBalance: number;
  grossIncome: number;
  creditDeduction: number;
  commissionEarned: number;
  totalDeductions: number;
  netSalary: number;
};

type HistoryRow = {
  barberCode: string;
  barberName: string;
  month: number;
  year: number;
  grossIncome: number;
  commission: number;
  recruitmentDeduction: number;
  creditDeduction: number;
  netSalary: number;
  paidDate: string;
  status: string;
};

export default function MonthlyClosingPage() {
  const user = useSession();
  const [months, setMonths] = useState<MonthOption[]>([]);
  const [month, setMonth] = useState("");
  const [summary, setSummary] = useState<ClosingRow[]>([]);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [booted, setBooted] = useState(false);

  async function loadHistory() {
    setHistory(await api<HistoryRow[]>("/api/monthly-closing/history"));
  }

  async function loadMonths() {
    const list = await api<MonthOption[]>("/api/monthly-closing/months");
    setMonths(list);
    if (list.length > 0) {
      setMonth((current) => current || list[0].key);
    } else {
      setMonth("");
    }
  }

  useEffect(() => {
    if (!user) return;
    Promise.all([loadMonths(), loadHistory()])
      .then(() => setBooted(true))
      .catch((err) => {
        setError(err.message);
        setBooted(true);
      });
  }, [user]);

  useEffect(() => {
    if (!user || !month) {
      setSummary([]);
      return;
    }
    api<ClosingRow[]>(`/api/monthly-closing/summary?month=${month}`)
      .then(setSummary)
      .catch((err) => setError(err.message));
  }, [user, month]);

  const totals = useMemo(
    () => ({
      barbers: summary.length,
      grossIncome: summary.reduce((s, r) => s + r.grossIncome, 0),
      commission: summary.reduce((s, r) => s + r.commissionEarned, 0),
      deductions: summary.reduce((s, r) => s + r.totalDeductions, 0),
      netSalary: summary.reduce((s, r) => s + r.netSalary, 0),
    }),
    [summary]
  );

  const monthLabel = months.find((m) => m.key === month)?.label || month;

  /** Month can be closed only after the calendar month has fully ended */
  const monthHasEnded = useMemo(() => {
    if (!/^\d{4}-\d{2}$/.test(month)) return false;
    const now = new Date();
    const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return month < currentKey;
  }, [month]);

  const isAdmin = user?.role === "admin";
  const canProcess = Boolean(isAdmin && month) && summary.length > 0 && monthHasEnded && !busy;

  async function processPayments() {
    if (!isAdmin || !month || !monthHasEnded) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await api<{ processed: number }>("/api/monthly-closing/process", {
        method: "POST",
        body: JSON.stringify({ month }),
      });
      setConfirmOpen(false);
      setMessage(`Successfully processed ${result.processed} payments for ${monthLabel}`);
      await Promise.all([loadMonths(), loadHistory()]);
      setSummary([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process payments");
    } finally {
      setBusy(false);
    }
  }

  function netStyle(value: number) {
    if (value < 0) return { fontWeight: 700 as const, color: "var(--barbazza-error)" };
    return { fontWeight: 700 as const, color: "var(--barbazza-gold)" };
  }

  return (
    <Shell loading={!booted && !error}>
      {error ? <div className="alert alert-danger">{error}</div> : null}
      {message ? (
        <div className="alert" style={{ borderLeft: "4px solid var(--barbazza-success)", background: "rgba(45,90,63,0.12)" }}>
          {message}
        </div>
      ) : null}

      <div className="manager-card">
        <h3>Close Month & Process Payments</h3>
        <p style={{ fontSize: "0.9rem", color: "var(--barbazza-cream)", marginBottom: "var(--space-4)" }}>
          {isAdmin
            ? "Calculate and pay barber salaries for the month"
            : "Preview barber salaries for the month. Only admin can process payments and close the month."}
        </p>

        <div style={{ maxWidth: 300, marginBottom: "var(--space-6)" }}>
          <label>Select Month to Close:</label>
          <select value={month} onChange={(e) => setMonth(e.target.value)}>
            {months.length === 0 ? <option value="">No months available to close</option> : null}
            {months.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div
          style={{
            background: "var(--barbazza-warning)",
            color: "var(--barbazza-charcoal)",
            padding: "var(--space-4)",
            borderRadius: "var(--radius-md)",
            marginBottom: "var(--space-2)",
          }}
        >
          <h4 style={{ margin: "0 0 var(--space-2) 0" }}>Important</h4>
          <p style={{ margin: 0 }}>Closing a month will:</p>
          <ul>
            <li>Calculate final salaries for all barbers</li>
            <li>Deduct recruitment advances</li>
            <li>Deduct approved credit balances</li>
            <li>Update recruitment balance (reduce by monthly deduction)</li>
            <li>Record payment in monthly_salaries table</li>
            <li>Lock the month (cannot be modified)</li>
          </ul>
        </div>
      </div>

      <div className="manager-card">
        <h4>Barbers Payment Summary</h4>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Barber Code</th>
                <th>Barber Name</th>
                <th>Gross Income</th>
                <th>Commission Rate</th>
                <th>Commission Earned</th>
                <th>Recruitment Deduction</th>
                <th>Credit Deduction</th>
                <th>Total Deductions</th>
                <th>Net Salary</th>
              </tr>
            </thead>
            <tbody>
              {!month || summary.length === 0 ? (
                <tr>
                  <td colSpan={9}>{month ? "No barber data for selected month" : "Select a month"}</td>
                </tr>
              ) : (
                summary.map((row) => (
                  <tr key={row.barberId}>
                    <td>{row.barberCode}</td>
                    <td>{row.fullName}</td>
                    <td>{money(row.grossIncome)}</td>
                    <td>{row.commissionRate}%</td>
                    <td>{money(row.commissionEarned)}</td>
                    <td>{money(row.recruitmentDeduction)}</td>
                    <td>{money(row.creditDeduction)}</td>
                    <td>{money(row.totalDeductions)}</td>
                    <td style={netStyle(row.netSalary)}>{money(row.netSalary)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {summary.some((row) => row.netSalary < 0) ? (
          <p style={{ marginTop: "var(--space-3)", color: "var(--barbazza-error)", fontSize: "0.9rem" }}>
            Negative net salary means deductions exceeded commission for that barber — they owe the shop.
          </p>
        ) : null}
      </div>

      <div className="manager-card" style={{ textAlign: "center" }}>
        {!isAdmin ? (
          <p style={{ color: "var(--barbazza-cream)", marginBottom: 0 }}>
            View only. Ask an admin to process payments and close the month.
          </p>
        ) : (
          <>
            {month && !monthHasEnded ? (
              <p style={{ color: "var(--barbazza-cream)", marginBottom: "var(--space-4)" }}>
                This month is still in progress. You can process payments only after the month has ended on the calendar.
              </p>
            ) : null}
            <button
              type="button"
              disabled={!canProcess}
              onClick={() => setConfirmOpen(true)}
              style={{
                background: "var(--barbazza-gold)",
                color: "white",
                border: "none",
                padding: "var(--space-5) var(--space-8)",
                borderRadius: "var(--radius-md)",
                fontWeight: "bold",
                fontSize: "var(--text-xl)",
                cursor: canProcess ? "pointer" : "not-allowed",
                opacity: canProcess ? 1 : 0.6,
              }}
            >
              Process All Payments & Close Month
            </button>
          </>
        )}
      </div>

      <div className="manager-card">
        <h4>Payment History</h4>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Barber Code</th>
                <th>Barber Name</th>
                <th>Month</th>
                <th>Year</th>
                <th>Gross Income</th>
                <th>Commission</th>
                <th>Recruitment Ded.</th>
                <th>Credit Ded.</th>
                <th>Net Salary</th>
                <th>Payment Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={11}>No payment history</td>
                </tr>
              ) : (
                history.map((row, index) => (
                  <tr key={`${row.barberCode}-${row.year}-${row.month}-${index}`}>
                    <td>{row.barberCode}</td>
                    <td>{row.barberName}</td>
                    <td>{row.month}</td>
                    <td>{row.year}</td>
                    <td>{money(row.grossIncome)}</td>
                    <td>{money(row.commission)}</td>
                    <td>{money(row.recruitmentDeduction)}</td>
                    <td>{money(row.creditDeduction)}</td>
                    <td style={netStyle(row.netSalary)}>{money(row.netSalary)}</td>
                    <td>{row.paidDate}</td>
                    <td>{row.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {confirmOpen && isAdmin ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div className="manager-card" style={{ maxWidth: 640, width: "100%", margin: 0 }}>
            <h3>Confirm Monthly Payment Processing</h3>
            <p>You are about to close the month and process payments for:</p>
            <p>
              <strong>{monthLabel}</strong>
            </p>
            <h4>Summary:</h4>
            <ul>
              <li>Total Barbers: {totals.barbers}</li>
              <li>Total Gross Income: {money(totals.grossIncome)}</li>
              <li>Total Commission: {money(totals.commission)}</li>
              <li>Total Deductions: {money(totals.deductions)}</li>
              <li>Total Net Salary: {money(totals.netSalary)}</li>
            </ul>
            <div
              style={{
                background: "var(--barbazza-warning)",
                padding: "var(--space-4)",
                borderRadius: "var(--radius-md)",
                color: "var(--barbazza-charcoal)",
                marginBottom: "var(--space-4)",
              }}
            >
              <strong>Warning:</strong>
              <ul>
                <li>This action will record all payments in the database</li>
                <li>Recruitment balances will be reduced by monthly deduction amounts</li>
                <li>Credit balances will be reduced by deduction amounts</li>
                <li>This action cannot be undone</li>
                <li>The month will be marked as closed</li>
              </ul>
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={busy}
                style={{
                  background: "var(--barbazza-error)",
                  color: "white",
                  border: "none",
                  padding: "var(--space-3) var(--space-5)",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={processPayments}
                disabled={busy}
                style={{
                  background: "var(--barbazza-success)",
                  color: "white",
                  border: "none",
                  padding: "var(--space-3) var(--space-5)",
                  borderRadius: "var(--radius-md)",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                {busy ? "Processing..." : "Confirm & Process Payments"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </Shell>
  );
}
