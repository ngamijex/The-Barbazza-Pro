"use client";

import { useEffect, useState } from "react";
import { Kpi, Panel, Shell, useSession } from "@/components/Shell";
import { api, money } from "@/lib/api";

type Day = {
  income: number;
  customers: number;
  expenses: number;
  profit: number;
  barbers: { code: string; name: string; clients: number; earned: number }[];
};

type Report = {
  date: string;
  customers: number;
  income: number;
  expenses: number;
  profit: number;
  locked: boolean;
};

export default function DailyReportPage() {
  const user = useSession();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [preview, setPreview] = useState<Day | null>(null);
  const [recent, setRecent] = useState<Report[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;
    api<Day>(`/api/day?date=${date}`).then(setPreview).catch(() => setPreview(null));
    const from = new Date();
    from.setDate(from.getDate() - 14);
    api<Report[]>(`/api/reports?from=${from.toISOString().slice(0, 10)}&to=${new Date().toISOString().slice(0, 10)}`)
      .then(setRecent)
      .catch(() => undefined);
  }, [user, date]);

  return (
    <Shell>
      <Panel title="Generate Daily Report" className="manager-card">
        <p style={{ color: "var(--barbazza-cream)", marginBottom: "var(--space-4)" }}>
          Generate professional daily report (Excel / Google Drive upload can be wired like the Shiny app).
        </p>
        <div className="form-grid form-grid-3">
          <div className="form-group">
            <label>Report Date</label>
            <input type="date" max={new Date().toISOString().slice(0, 10)} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Report Format</label>
            <select defaultValue="both">
              <option value="both">Both (Excel + Google Sheets)</option>
              <option value="excel">Excel Only</option>
              <option value="sheets">Google Sheets Only</option>
            </select>
          </div>
          <div className="form-group" style={{ display: "flex", alignItems: "flex-end" }}>
            <button
              type="button"
              className="btn-action"
              style={{ width: "100%", minHeight: 44 }}
              onClick={() =>
                setMessage("Report preview loaded for the selected date. Excel + Google Drive upload uses the same folder as Shiny.")
              }
            >
              Generate & Upload Report
            </button>
          </div>
        </div>
        {message ? <p style={{ marginTop: "var(--space-4)" }}>{message}</p> : null}
      </Panel>

      <Panel title="Google Drive Integration" className="manager-card">
        <p style={{ marginBottom: "var(--space-3)" }}>Reports are uploaded to your Google Drive folder:</p>
        <div style={{ background: "rgba(255,255,255,0.05)", padding: "var(--space-4)", borderRadius: "var(--radius-md)", marginBottom: "var(--space-3)" }}>
          <p style={{ margin: 0, fontFamily: "monospace", color: "var(--barbazza-gold)" }}>
            Folder ID: 1VFRjOtnY-wm-UCAjV34yS9MpNRfAxC3I
          </p>
        </div>
        <a
          href="https://drive.google.com/drive/folders/1VFRjOtnY-wm-UCAjV34yS9MpNRfAxC3I"
          target="_blank"
          rel="noreferrer"
          className="btn-action"
          style={{ display: "inline-block", textDecoration: "none" }}
        >
          Open Google Drive Folder
        </a>
      </Panel>

      <Panel title="Report Preview - Selected Date" className="manager-card">
        {preview ? (
          <div className="daily-summary">
            <Kpi label="Income" value={money(preview.income)} />
            <Kpi label="Customers" value={String(preview.customers)} />
            <Kpi label="Expenses" value={money(preview.expenses)} />
            <Kpi label="Net Profit" value={money(preview.profit)} />
          </div>
        ) : (
          <p>No data for this date.</p>
        )}
      </Panel>

      <Panel title="Recent Generated Reports" className="manager-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Customers</th>
              <th>Income</th>
              <th>Expenses</th>
              <th>Net Profit</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 ? (
              <tr>
                <td colSpan={6}>No reports yet.</td>
              </tr>
            ) : (
              recent.map((row) => (
                <tr key={row.date}>
                  <td>{row.date}</td>
                  <td>{row.customers}</td>
                  <td>{money(row.income)}</td>
                  <td>{money(row.expenses)}</td>
                  <td>{money(row.profit)}</td>
                  <td>{row.locked ? "Locked" : "Open"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Panel>
    </Shell>
  );
}
