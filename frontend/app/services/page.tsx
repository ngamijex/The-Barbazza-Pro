"use client";

import { FormEvent, useEffect, useState } from "react";
import { Panel, Shell } from "@/components/Shell";
import { api, money } from "@/lib/api";

type Service = { id: number; name: string; price: number; description: string; active: boolean };

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setServices(await api<Service[]>("/api/services"));
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      await api("/api/services", { method: "POST", body: JSON.stringify({ name, price: Number(price), active: true }) });
      setName("");
      setPrice("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    }
  }

  return (
    <Shell>
      {error ? <div className="alert alert-danger">{error}</div> : null}
      <Panel title="Service Management" className="admin-card">
        <form onSubmit={onSubmit} className="service-form">
          <div className="form-grid form-grid-3">
            <div className="form-group">
              <label>Service Name</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Base Price (RWF)</label>
              <input required type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div className="form-group" style={{ display: "flex", alignItems: "flex-end" }}>
              <button type="submit" className="btn-action" style={{ width: "100%" }}>
                Add Service
              </button>
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
              <th>Active</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id}>
                <td>{service.name}</td>
                <td>{money(service.price)}</td>
                <td>{service.active ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </Shell>
  );
}
