"use client";

import { FormEvent, useEffect, useState } from "react";
import { Panel, Shell } from "@/components/Shell";
import { api, money } from "@/lib/api";

type Service = { id: number; name: string; price: number; description: string; active: boolean };

const empty = { name: "", price: "", description: "", active: true };

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<Service | null>(null);
  const [error, setError] = useState("");

  async function load() {
    setServices(await api<Service[]>("/api/services"));
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      if (editing) {
        await api(`/api/services/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify({
            name: form.name,
            price: Number(form.price),
            description: form.description,
            active: form.active,
          }),
        });
        setEditing(null);
      } else {
        await api("/api/services", {
          method: "POST",
          body: JSON.stringify({
            name: form.name,
            price: Number(form.price),
            description: form.description,
            active: true,
          }),
        });
      }
      setForm(empty);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    }
  }

  async function deactivate(id: number) {
    if (!confirm("Deactivate this service?")) return;
    await api(`/api/services/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <Shell>
      {error ? <div className="alert alert-danger">{error}</div> : null}
      <Panel title={editing ? `Edit ${editing.name}` : "Service Management"} className="admin-card">
        <form onSubmit={onSubmit} className="service-form">
          <div className="form-grid form-grid-3">
            <div className="form-group">
              <label>Service Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Base Price (RWF)</label>
              <input required type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
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
              <button type="submit" className="btn-action" style={{ width: "100%" }}>
                {editing ? "Save changes" : "Add Service"}
              </button>
              {editing ? (
                <button type="button" className="btn-logout" onClick={() => { setEditing(null); setForm(empty); }}>
                  Cancel
                </button>
              ) : null}
            </div>
          </div>
        </form>
      </Panel>
      <Panel title="Services" className="admin-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Description</th>
              <th>Active</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id}>
                <td>{service.name}</td>
                <td>{money(service.price)}</td>
                <td>{service.description || "—"}</td>
                <td>{service.active ? "Yes" : "No"}</td>
                <td style={{ whiteSpace: "nowrap" }}>
                  <button
                    type="button"
                    className="btn-action"
                    style={{ width: "auto", marginRight: 6 }}
                    onClick={() => {
                      setEditing(service);
                      setForm({
                        name: service.name,
                        price: String(service.price),
                        description: service.description,
                        active: service.active,
                      });
                    }}
                  >
                    Edit
                  </button>
                  {service.active ? (
                    <button type="button" className="btn-logout" onClick={() => deactivate(service.id)}>
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
