"use client";

import { FormEvent, useEffect, useState } from "react";
import { Panel, Shell, useSession } from "@/components/Shell";
import { api, money } from "@/lib/api";

type Settings = {
  shop_name: string;
  shop_address: string;
  shop_phone: string;
  shop_email: string;
  currency: string;
  timezone: string;
  tax_rate: string;
  commission_rate: string;
};

type LockedDay = { date: string; income: number; expenses: number; profit: number; status: string };

export default function SettingsPage() {
  const user = useSession();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [locked, setLocked] = useState<LockedDay[]>([]);
  const [lockDate, setLockDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const [s, days] = await Promise.all([api<Settings>("/api/settings"), api<LockedDay[]>("/api/locked-days")]);
    setSettings(s);
    setLocked(days);
  }

  useEffect(() => {
    if (!user) return;
    load().catch((err) => setError(err.message));
  }, [user]);

  async function saveSettings(event: FormEvent) {
    event.preventDefault();
    if (!settings) return;
    setBusy(true);
    setMessage("");
    setError("");
    try {
      await api("/api/settings", { method: "PUT", body: JSON.stringify(settings) });
      setMessage("Settings saved successfully.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function lockDay() {
    setBusy(true);
    setMessage("");
    setError("");
    try {
      await api("/api/days/lock", { method: "POST", body: JSON.stringify({ date: lockDate }) });
      setMessage(`Day ${lockDate} locked.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lock failed");
    } finally {
      setBusy(false);
    }
  }

  async function unlockDay() {
    setBusy(true);
    setMessage("");
    setError("");
    try {
      await api("/api/days/unlock", { method: "POST", body: JSON.stringify({ date: lockDate }) });
      setMessage(`Day ${lockDate} unlocked.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unlock failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell>
      {error ? <div className="alert alert-danger">{error}</div> : null}
      {message ? <p>{message}</p> : null}

      <Panel title="Application Settings" className="admin-card">
        {!settings ? (
          <p>Loading…</p>
        ) : (
          <form onSubmit={saveSettings}>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label>Shop Name</label>
                <input value={settings.shop_name} onChange={(e) => setSettings({ ...settings, shop_name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Shop Address</label>
                <input value={settings.shop_address} onChange={(e) => setSettings({ ...settings, shop_address: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Shop Phone</label>
                <input value={settings.shop_phone} onChange={(e) => setSettings({ ...settings, shop_phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Shop Email</label>
                <input value={settings.shop_email} onChange={(e) => setSettings({ ...settings, shop_email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Currency</label>
                <input value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Timezone</label>
                <input value={settings.timezone} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Tax Rate (%)</label>
                <input type="number" value={settings.tax_rate} onChange={(e) => setSettings({ ...settings, tax_rate: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Default Commission Rate (%)</label>
                <input
                  type="number"
                  value={settings.commission_rate}
                  onChange={(e) => setSettings({ ...settings, commission_rate: e.target.value })}
                />
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? "Saving…" : "Save Settings"}
            </button>
          </form>
        )}
      </Panel>

      <Panel title="Day Locking & Management" className="admin-card">
        <p style={{ color: "var(--barbazza-cream)" }}>Lock days to prevent further modifications to transactions and reports.</p>
        <div className="form-grid form-grid-3">
          <div className="form-group">
            <label>Select Date to Lock/Unlock</label>
            <input type="date" value={lockDate} onChange={(e) => setLockDate(e.target.value)} />
          </div>
          <div className="form-group" style={{ display: "flex", alignItems: "flex-end" }}>
            <button type="button" className="btn-primary" style={{ width: "100%", background: "#c0392b" }} onClick={lockDay} disabled={busy}>
              Lock Day
            </button>
          </div>
          <div className="form-group" style={{ display: "flex", alignItems: "flex-end" }}>
            <button type="button" className="btn-primary" style={{ width: "100%", background: "#2d5a3f" }} onClick={unlockDay} disabled={busy}>
              Unlock Day
            </button>
          </div>
        </div>
        <h4 style={{ marginTop: "var(--space-5)" }}>Locked Days</h4>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Income</th>
              <th>Expenses</th>
              <th>Profit</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {locked.length === 0 ? (
              <tr>
                <td colSpan={5}>No locked days.</td>
              </tr>
            ) : (
              locked.map((row) => (
                <tr key={row.date}>
                  <td>{row.date}</td>
                  <td>{money(row.income)}</td>
                  <td>{money(row.expenses)}</td>
                  <td>{money(row.profit)}</td>
                  <td>{row.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Panel>
    </Shell>
  );
}
