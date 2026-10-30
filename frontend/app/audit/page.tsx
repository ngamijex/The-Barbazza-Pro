"use client";

import { FormEvent, useEffect, useState } from "react";
import { Panel, Shell, useSession } from "@/components/Shell";
import { api } from "@/lib/api";

type AuditRow = {
  timestamp: string;
  action: string;
  table: string;
  recordId: number | null;
  userId: number | null;
};

export default function AuditPage() {
  const user = useSession();
  const [action, setAction] = useState("");
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const q = new URLSearchParams({ from, to });
      if (action) q.set("action", action);
      setRows(await api<AuditRow[]>(`/api/audit?${q}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  function onFilter(event: FormEvent) {
    event.preventDefault();
    load();
  }

  return (
    <Shell loading={loading && !error && rows.length === 0}>
      <Panel title="System Audit Logs" className="admin-card">
        <form onSubmit={onFilter} className="form-grid form-grid-3" style={{ marginBottom: "var(--space-4)" }}>
          <div className="form-group">
            <label>Action Type</label>
            <select value={action} onChange={(e) => setAction(e.target.value)}>
              <option value="">All</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="LOGIN">LOGIN</option>
              <option value="LOCK_DAY">LOCK_DAY</option>
              <option value="UNLOCK_DAY">UNLOCK_DAY</option>
            </select>
          </div>
          <div className="form-group">
            <label>Start Date</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="form-group" style={{ display: "flex", alignItems: "flex-end" }}>
            <button type="submit" className="btn-primary" style={{ width: "100%" }}>
              Filter Logs
            </button>
          </div>
        </form>
        {error ? <div className="alert alert-danger">{error}</div> : null}
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action</th>
              <th>Table</th>
              <th>Record ID</th>
              <th>User ID</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5}>No audit logs in this range.</td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={`${row.timestamp}-${i}`}>
                  <td>{row.timestamp}</td>
                  <td>{row.action}</td>
                  <td>{row.table}</td>
                  <td>{row.recordId ?? "—"}</td>
                  <td>{row.userId ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Panel>
    </Shell>
  );
}
