"use client";

import { FormEvent, useEffect, useState } from "react";
import { Panel, Shell, useSession } from "@/components/Shell";
import { api, money } from "@/lib/api";

type Credit = {
  id: number;
  amount: number;
  reason: string;
  status: string;
  requestedAt: string;
};

export default function CreditRequestPage() {
  const user = useSession();
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [rows, setRows] = useState<Credit[]>([]);
  const [message, setMessage] = useState("");

  async function load() {
    setRows(await api<Credit[]>("/api/credits"));
  }

  useEffect(() => {
    if (!user) return;
    load().catch((err) => setMessage(err.message));
  }, [user]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    try {
      await api("/api/credits", {
        method: "POST",
        body: JSON.stringify({ amount: Number(amount), reason }),
      });
      setAmount("");
      setReason("");
      setMessage("Request submitted.");
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not submit");
    }
  }

  return (
    <Shell>
      <Panel title="Request Emergency Credit" className="barber-card">
        <p>You can request an advance for emergencies. Manager approval required.</p>
        <form onSubmit={onSubmit} style={{ maxWidth: 500 }}>
          <div className="form-group">
            <label>Amount Needed (RWF)</label>
            <input required type="number" min={0} step={1000} value={amount} onChange={(e) => setAmount(e.target.value)} />
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
          <button type="submit" className="btn-action">
            Submit Request
          </button>
        </form>
        {message ? <p style={{ marginTop: "var(--space-4)" }}>{message}</p> : null}
      </Panel>

      <Panel title="My Credit Requests" className="barber-card">
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
