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

type Generated = {
  ok: boolean;
  date: string;
  customers: number;
  income: number;
  expenses: number;
  profit: number;
  barbers: { code: string; name: string; clients: number; earned: number }[];
};

function downloadCsv(generated: Generated) {
  const lines = [
    ["Barbazza Daily Report", generated.date],
    [],
    ["Metric", "Value"],
    ["Customers", String(generated.customers)],
    ["Income", String(generated.income)],
    ["Expenses", String(generated.expenses)],
    ["Net Profit", String(generated.profit)],
    [],
    ["Barber", "Code", "Clients", "Earned"],
    ...generated.barbers.map((b) => [b.name, b.code, String(b.clients), String(b.earned)]),
  ];
  const csv = lines.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `barbazza-daily-report-${generated.date}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function DailyReportPage() {
  const user = useSession();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [format, setFormat] = useState("excel");
  const [preview, setPreview] = useState<Day | null>(null);
  const [recent, setRecent] = useState<Report[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    api<Day>(`/api/day?date=${date}`).then(setPreview).catch(() => setPreview(null));
    const from = new Date();
    from.setDate(from.getDate() - 14);
    api<Report[]>(`/api/reports?from=${from.toISOString().slice(0, 10)}&to=${new Date().toISOString().slice(0, 10)}`)
      .then(setRecent)
      .catch(() => undefined);
  }, [user, date]);

  async function generate() {
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const result = await api<Generated>("/api/reports/generate", {
        method: "POST",
        body: JSON.stringify({ date, format }),
      });
      setPreview({
        income: result.income,
        customers: result.customers,
        expenses: result.expenses,
        profit: result.profit,
        barbers: result.barbers,
      });
      if (format === "excel" || format === "both") {
        downloadCsv(result);
      }
      setMessage(
        format === "sheets"
          ? `Report saved for ${result.date}. Open the Google Drive folder to archive/share (Sheets auto-upload uses the same Drive folder as Shiny).`
          : `Report generated for ${result.date}. CSV downloaded (Excel-compatible).`
      );
      const from = new Date();
      from.setDate(from.getDate() - 14);
      setRecent(
        await api<Report[]>(`/api/reports?from=${from.toISOString().slice(0, 10)}&to=${new Date().toISOString().slice(0, 10)}`)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generate failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell>
      <Panel title="Generate Daily Report" className="manager-card">
        <p style={{ color: "var(--barbazza-cream)", marginBottom: "var(--space-4)" }}>
          Generate the professional daily report snapshot (same Neon daily_reports table as Shiny). CSV download is
          Excel-compatible; Google Drive folder link is unchanged.
        </p>
        {error ? <div className="alert alert-danger">{error}</div> : null}
        <div className="form-grid form-grid-3">
          <div className="form-group">
            <label>Report Date</label>
            <input type="date" max={new Date().toISOString().slice(0, 10)} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Report Format</label>
            <select value={format} onChange={(e) => setFormat(e.target.value)}>
              <option value="both">Both (Excel CSV + Drive folder)</option>
              <option value="excel">Excel CSV Only</option>
              <option value="sheets">Google Sheets / Drive folder</option>
            </select>
          </div>
          <div className="form-group" style={{ display: "flex", alignItems: "flex-end" }}>
            <button type="button" className="btn-action" style={{ width: "100%", minHeight: 44 }} onClick={generate} disabled={busy}>
              {busy ? "Generating…" : "Generate & Upload Report"}
            </button>
          </div>
        </div>
        {message ? <p style={{ marginTop: "var(--space-4)" }}>{message}</p> : null}
      </Panel>

      <Panel title="Google Drive Integration" className="manager-card">
        <p style={{ marginBottom: "var(--space-3)" }}>Reports are uploaded / archived to your Google Drive folder:</p>
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
          <>
            <div className="daily-summary">
              <Kpi label="Income" value={money(preview.income)} />
              <Kpi label="Customers" value={String(preview.customers)} />
              <Kpi label="Expenses" value={money(preview.expenses)} />
              <Kpi label="Net Profit" value={money(preview.profit)} />
            </div>
            <table className="data-table" style={{ marginTop: "var(--space-4)" }}>
              <thead>
                <tr>
                  <th>Barber</th>
                  <th>Code</th>
                  <th>Clients</th>
                  <th>Earned</th>
                </tr>
              </thead>
              <tbody>
                {preview.barbers.map((b) => (
                  <tr key={b.code}>
                    <td>{b.name}</td>
                    <td>{b.code}</td>
                    <td>{b.clients}</td>
                    <td>{money(b.earned)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <p>No preview yet.</p>
        )}
      </Panel>

      <Panel title="Recent Daily Reports" className="manager-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Customers</th>
              <th>Income</th>
              <th>Expenses</th>
              <th>Profit</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((r) => (
              <tr key={r.date}>
                <td>{r.date}</td>
                <td>{r.customers}</td>
                <td>{money(r.income)}</td>
                <td>{money(r.expenses)}</td>
                <td>{money(r.profit)}</td>
                <td>{r.locked ? "Locked" : "Open"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </Shell>
  );
}
