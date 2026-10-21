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
    <Shell title="Service menu" subtitle="Prices the floor charges today.">
      {error ? <p className="mb-3 text-sm text-red-300">{error}</p> : null}
      <Panel title="Add a service">
        <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-[1fr_160px_auto]">
          <input required placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-2xl bg-field px-4 py-3" />
          <input required type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} className="rounded-2xl bg-field px-4 py-3" />
          <button className="rounded-2xl bg-gold px-5 py-3 font-semibold text-white">Add</button>
        </form>
      </Panel>
      <div className="mt-4 space-y-3">
        {services.map((service) => (
          <div key={service.id} className="flex items-center justify-between rounded-lg border border-line bg-panel px-4 py-4">
            <div>
              <p>{service.name}</p>
              <p className="text-xs text-mute">{service.active ? "On the menu" : "Hidden"}</p>
            </div>
            <p className="font-display text-gold">{money(service.price)}</p>
          </div>
        ))}
      </div>
    </Shell>
  );
}
