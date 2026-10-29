"use client";

import { useEffect, useState } from "react";
import { Shell, useSession } from "@/components/Shell";
import { api, money } from "@/lib/api";

type Credit = {
  id: number;
  amount: number;
  reason: string;
  status: string;
  remaining: number;
  barberCode: string;
  barberName: string;
  requestedAt: string;
  approvedBy: string;
};

export default function CreditsPage() {
  const user = useSession();
  const [pending, setPending] = useState<Credit[]>([]);
  const [active, setActive] = useState<Credit[]>([]);
  const [history, setHistory] = useState<Credit[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    const [p, a, h] = await Promise.all([
      api<Credit[]>("/api/credits?status=pending"),
      api<Credit[]>("/api/credits?status=approved"),
      api<Credit[]>("/api/credits?status=all"),
    ]);
    setPending(p);
    setActive(a.filter((row) => row.remaining > 0));
    setHistory(h);
  }

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    load()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  async function decide(id: number, decision: "approved" | "rejected") {
    await api(`/api/credits/${id}/decide`, { method: "POST", body: JSON.stringify({ decision }) });
    await load();
  }

  return (
    <Shell loading={loading && !error}>
      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="manager-card">
        <h3>Pending Credit Requests</h3>
        <p>Review and approve/reject barber credit requests</p>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Barber Code</th>
                <th>Barber Name</th>
                <th>Request Date</th>
                <th>Amount</th>
                <th>Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pending.length === 0 ? (
                <tr>
                  <td colSpan={6}>No pending credit requests</td>
                </tr>
              ) : (
                pending.map((row) => (
                  <tr key={row.id}>
                    <td>{row.barberCode}</td>
                    <td>{row.barberName}</td>
                    <td>{row.requestedAt}</td>
                    <td>{money(row.amount)}</td>
                    <td>{row.reason}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-action"
                        style={{ width: "auto", marginRight: 8 }}
                        onClick={() => decide(row.id, "approved")}
                      >
                        Approve
                      </button>
                      <button type="button" className="btn-logout" onClick={() => decide(row.id, "rejected")}>
                        Reject
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="manager-card">
        <h3>Active Credits</h3>
        <p>Credits that have been approved and are being deducted</p>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Barber Code</th>
                <th>Barber Name</th>
                <th>Amount</th>
                <th>Remaining</th>
                <th>Reason</th>
                <th>Approved By</th>
              </tr>
            </thead>
            <tbody>
              {active.length === 0 ? (
                <tr>
                  <td colSpan={6}>No active credits</td>
                </tr>
              ) : (
                active.map((row) => (
                  <tr key={row.id}>
                    <td>{row.barberCode}</td>
                    <td>{row.barberName}</td>
                    <td>{money(row.amount)}</td>
                    <td>{money(row.remaining)}</td>
                    <td>{row.reason}</td>
                    <td>{row.approvedBy || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="manager-card">
        <h3>Credit History</h3>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Barber Code</th>
                <th>Barber Name</th>
                <th>Request Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Reason</th>
                <th>Approved By</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={7}>No credit history</td>
                </tr>
              ) : (
                history.map((row) => (
                  <tr key={`h-${row.id}`}>
                    <td>{row.barberCode}</td>
                    <td>{row.barberName}</td>
                    <td>{row.requestedAt}</td>
                    <td>{money(row.amount)}</td>
                    <td>{row.status}</td>
                    <td>{row.reason}</td>
                    <td>{row.approvedBy || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}
