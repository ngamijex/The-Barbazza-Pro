"use client";

import { useEffect, useState } from "react";
import { Shell, useSession } from "@/components/Shell";
import { api, money } from "@/lib/api";

type Credit = {
  id: number;
  kind: "barber" | "staff";
  amount: number;
  reason: string;
  status: string;
  remaining: number;
  barberCode: string;
  barberName: string;
  personRole: string;
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

  function canDecide(row: Credit) {
    if (!user || row.status !== "pending") return false;
    if (user.role === "admin") {
      // Admin approves manager credits; can also decide barber/cleaner if needed
      return true;
    }
    if (user.role === "manager") {
      if (row.kind === "barber") return true;
      if (row.kind === "staff" && row.personRole === "cleaner") return true;
      return false;
    }
    return false;
  }

  async function decide(row: Credit, decision: "approved" | "rejected") {
    // Optimistic UI — move row out of pending immediately
    setPending((prev) => prev.filter((r) => !(r.id === row.id && r.kind === row.kind)));
    try {
      await api(`/api/credits/${row.id}/decide`, {
        method: "POST",
        body: JSON.stringify({ decision, kind: row.kind }),
      });
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update credit");
      void load();
    }
  }

  const title =
    user?.role === "admin"
      ? "Review and approve/reject manager credit requests"
      : "Review and approve/reject barber and cleaner credit requests";

  return (
    <Shell loading={loading && !error}>
      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="manager-card">
        <h3>Pending Credit Requests</h3>
        <p>{title}</p>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Name</th>
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
                  <tr key={`${row.kind}-${row.id}`}>
                    <td>
                      {row.personRole}
                      {row.kind === "barber" ? ` · ${row.barberCode}` : ""}
                    </td>
                    <td>{row.barberName}</td>
                    <td>{row.requestedAt}</td>
                    <td>{money(row.amount)}</td>
                    <td>{row.reason}</td>
                    <td>
                      {canDecide(row) ? (
                        <>
                          <button
                            type="button"
                            className="btn-action"
                            style={{ width: "auto", marginRight: 8 }}
                            onClick={() => decide(row, "approved")}
                          >
                            Approve
                          </button>
                          <button type="button" className="btn-logout" onClick={() => decide(row, "rejected")}>
                            Reject
                          </button>
                        </>
                      ) : (
                        <span style={{ opacity: 0.7 }}>Waiting</span>
                      )}
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
        <p>Credits that have been approved and are being deducted from salary</p>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Name</th>
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
                  <tr key={`a-${row.kind}-${row.id}`}>
                    <td>
                      {row.personRole}
                      {row.kind === "barber" ? ` · ${row.barberCode}` : ""}
                    </td>
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
                <th>Role</th>
                <th>Name</th>
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
                  <tr key={`h-${row.kind}-${row.id}`}>
                    <td>
                      {row.personRole}
                      {row.kind === "barber" ? ` · ${row.barberCode}` : ""}
                    </td>
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
