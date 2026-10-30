"use client";

import { FormEvent, useEffect, useState } from "react";
import { Panel, Shell, useSession } from "@/components/Shell";
import { api } from "@/lib/api";

type Category = { id: number; name: string; description: string; active: boolean };

const empty = { name: "", description: "", active: true };

export default function ExpenseCategoriesPage() {
  const user = useSession();
  const [rows, setRows] = useState<Category[]>([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<Category | null>(null);
  const [error, setError] = useState("");

  async function load() {
    setRows(await api<Category[]>("/api/categories"));
  }

  useEffect(() => {
    if (!user) return;
    load().catch((err) => setError(err.message));
  }, [user]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      if (editing) {
        await api(`/api/categories/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify({
            name: form.name,
            description: form.description,
            active: form.active,
          }),
        });
        setEditing(null);
      } else {
        await api("/api/categories", {
          method: "POST",
          body: JSON.stringify({ name: form.name, description: form.description, active: true }),
        });
      }
      setForm(empty);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    }
  }

  async function deactivate(id: number) {
    if (!confirm("Deactivate this category?")) return;
    await api(`/api/categories/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <Shell>
      <Panel title={editing ? `Edit ${editing.name}` : "Expense Categories"} className="admin-card">
        {error ? <div className="alert alert-danger">{error}</div> : null}
        <form onSubmit={onSubmit} className="service-form" style={{ marginBottom: "var(--space-4)" }}>
          <div className="form-grid form-grid-3">
            <div className="form-group">
              <label>Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            {editing ? (
              <div className="form-group">
                <label>Active</label>
                <select value={form.active ? "1" : "0"} onChange={(e) => setForm({ ...form, active: e.target.value === "1" })}>
                  <option value="1">Yes</option>
                  <option value="0">No</option>
                </select>
              </div>
            ) : null}
            <div className="form-group" style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
              <button type="submit" className="btn-action">
                {editing ? "Save" : "Add Category"}
              </button>
              {editing ? (
                <button type="button" className="btn-logout" onClick={() => { setEditing(null); setForm(empty); }}>
                  Cancel
                </button>
              ) : null}
            </div>
          </div>
        </form>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Active</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>{row.description || "-"}</td>
                <td>{row.active ? "Yes" : "No"}</td>
                <td style={{ whiteSpace: "nowrap" }}>
                  <button
                    type="button"
                    className="btn-action"
                    style={{ width: "auto", marginRight: 6 }}
                    onClick={() => {
                      setEditing(row);
                      setForm({ name: row.name, description: row.description, active: row.active });
                    }}
                  >
                    Edit
                  </button>
                  {row.active ? (
                    <button type="button" className="btn-logout" onClick={() => deactivate(row.id)}>
                      Delete
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </Shell>
  );
}
