"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Kpi, Panel, Shell, useSession } from "@/components/Shell";
import { PageSkeleton } from "@/components/Skeleton";
import { api, money } from "@/lib/api";

type StaffHome = {
  monthlySalary: number;
  expectedNet: number;
  creditBalance: number;
  creditDeduction: number;
};

type Credit = {
  id: number;
  amount: number;
  reason: string;
  status: string;
  requestedAt: string;
};

export default function MePage() {
  const user = useSession();
  const router = useRouter();
  const [pay, setPay] = useState<StaffHome | null>(null);
  const [rows, setRows] = useState<Credit[]>([]);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "manager" && user.role !== "cleaner") {
      router.replace("/home");
      return;
    }
    (async () => {
      try {
        const [home, credits] = await Promise.all([
          api<StaffHome>("/api/staff/home"),
          api<Credit[]>("/api/credits?mine=1"),
        ]);
        setPay(home);
        setRows(credits);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load");
      }
    })();
  }, [user, router]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    setError("");
    setBusy(true);
    try {
      await api("/api/credits", {
        method: "POST",
        body: JSON.stringify({ amount: Number(amount), reason }),
      });
      setAmount("");
      setReason("");
      setMessage("Request submitted.");
      setRows(await api<Credit[]>("/api/credits?mine=1"));
      setPay(await api<StaffHome>("/api/staff/home"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit");
    } finally {
      setBusy(false);
    }
  }

  const approver = user?.role === "manager" ? "Admin" : "Manager";
  const loading = !!user && !error && !pay;

  return (
    <Shell loading={loading}>
      {!user ? <PageSkeleton /> : null}
      {error ? <div className="alert alert-danger">{error}</div> : null}
      {message ? <div className="alert alert-success">{message}</div> : null}

      {pay ? (
        <Panel title="My Salary" className="manager-card">
          <div className="earnings-grid daily-summary">
            <Kpi label="Monthly Salary" value={money(pay.monthlySalary)} />
            <Kpi label="Credit Deductions" value={money(pay.creditDeduction)} />
            <Kpi label="Expected Net Pay" value={money(pay.expectedNet)} />
            <Kpi label="Credit Balance" value={money(pay.creditBalance)} />
          </div>
          <p style={{ marginTop: "1rem", color: "var(--barbazza-cream)", fontSize: "0.9rem" }}>
            Approved credits are deducted from your salary. {approver} approval is required for new requests.
          </p>
        </Panel>
      ) : null}

      <Panel title="Request Credit" className="manager-card">
        <p>
          Request an advance against your salary. {approver} approval is required.
        </p>
        <form onSubmit={onSubmit} style={{ maxWidth: 500 }}>
          <div className="form-group">
            <label>Amount Needed (RWF)</label>
            <input
              required
              type="number"
              min={0}
              step={1000}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Reason for Credit Request</label>
            <textarea
              required
              rows={4}
              placeholder="Explain why you need this advance..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-action" disabled={busy}>
            {busy ? "Submitting…" : "Submit Request"}
          </button>
        </form>
      </Panel>

      <Panel title="My Credit Requests" className="manager-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Amount</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Requested</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4}>No requests.</td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td>{money(row.amount)}</td>
                  <td>{row.reason}</td>
                  <td>{row.status}</td>
                  <td>{row.requestedAt}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Panel>
    </Shell>
  );
}
