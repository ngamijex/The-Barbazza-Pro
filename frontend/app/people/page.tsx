"use client";

import { FormEvent, useEffect, useState } from "react";
import { Panel, Shell } from "@/components/Shell";
import { api, money } from "@/lib/api";

type UserRow = {
  id: number;
  username: string;
  fullName: string;
  role: string;
  email: string;
  phone: string;
  active: boolean;
  barberCode: string;
  commissionRate: number;
  recruitmentAdvance: number;
  advanceRemaining: number;
  alreadyPaid: number;
  monthlyDeduction: number;
};

const empty = {
  username: "",
  fullName: "",
  password: "",
  role: "barber",
  email: "",
  phone: "",
  commissionRate: 40,
  recruitmentAdvance: 0,
  monthlyDeduction: 0,
};

export default function PeoplePage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [message, setMessage] = useState("");

  async function load() {
    setUsers(await api<UserRow[]>("/api/users"));
  }

  useEffect(() => {
    load().catch((err) => setMessage(err.message));
  }, []);

  async function createUser(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    try {
      await api("/api/users", { method: "POST", body: JSON.stringify(form) });
      setForm(empty);
      await load();
      setMessage("User created.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not create user");
    }
  }

  async function saveEdit(event: FormEvent) {
    event.preventDefault();
    if (!editing) return;
    try {
      await api(`/api/users/${editing.id}`, {
        method: "PUT",
        body: JSON.stringify({
          fullName: editing.fullName,
          role: editing.role,
          email: editing.email,
          phone: editing.phone,
          active: editing.active,
          password: form.password || undefined,
          commissionRate: editing.commissionRate,
          recruitmentAdvance: editing.recruitmentAdvance,
          monthlyDeduction: editing.monthlyDeduction,
        }),
      });
      setEditing(null);
      setForm(empty);
      await load();
      setMessage("Saved. Amount already paid was kept.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save");
    }
  }

  async function recover() {
    const result = await api<{ updated: number }>("/api/users/recover-advances", { method: "POST" });
    await load();
    setMessage(`Recovered ${result.updated} balance${result.updated === 1 ? "" : "s"}.`);
  }

  return (
    <Shell title="People" subtitle="Roles, chairs, and recruitment balances.">
      {message ? <p className="mb-3 text-sm text-gold">{message}</p> : null}
      <button onClick={recover} className="mb-4 rounded-md border border-gold px-4 py-2 text-sm text-mute">Recover advance balances</button>
      <Panel title={editing ? `Edit ${editing.username}` : "New person"}>
        <form onSubmit={editing ? saveEdit : createUser} className="grid gap-3 md:grid-cols-2">
          {!editing ? <input required placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="rounded-2xl bg-field px-4 py-3" /> : null}
          <input required placeholder="Full name" value={editing ? editing.fullName : form.fullName} onChange={(e) => editing ? setEditing({ ...editing, fullName: e.target.value }) : setForm({ ...form, fullName: e.target.value })} className="rounded-2xl bg-field px-4 py-3" />
          <input placeholder={editing ? "New password (optional)" : "Password"} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="rounded-2xl bg-field px-4 py-3" />
          <select value={editing ? editing.role : form.role} onChange={(e) => editing ? setEditing({ ...editing, role: e.target.value }) : setForm({ ...form, role: e.target.value })} className="rounded-2xl bg-field px-4 py-3">
            {["admin", "manager", "supervisor", "barber"].map((role) => <option key={role}>{role}</option>)}
          </select>
          {(editing ? editing.role : form.role) === "barber" ? (
            <>
              <input type="number" placeholder="Commission %" value={editing ? editing.commissionRate : form.commissionRate} onChange={(e) => {
                const value = Number(e.target.value);
                editing ? setEditing({ ...editing, commissionRate: value }) : setForm({ ...form, commissionRate: value });
              }} className="rounded-2xl bg-field px-4 py-3" />
              <input type="number" placeholder="Recruitment advance" value={editing ? editing.recruitmentAdvance : form.recruitmentAdvance} onChange={(e) => {
                const value = Number(e.target.value);
                editing ? setEditing({ ...editing, recruitmentAdvance: value }) : setForm({ ...form, recruitmentAdvance: value });
              }} className="rounded-2xl bg-field px-4 py-3" />
              {editing ? <p className="text-sm text-mute md:col-span-2">Already paid {money(editing.alreadyPaid)} · remaining {money(editing.advanceRemaining)}. Changing the advance keeps what was already paid.</p> : null}
            </>
          ) : null}
          <button className="rounded-2xl bg-gold py-3 font-semibold text-white md:col-span-2">{editing ? "Save changes" : "Create"}</button>
          {editing ? <button type="button" onClick={() => setEditing(null)} className="text-sm text-mute md:col-span-2">Cancel</button> : null}
        </form>
      </Panel>
      <div className="mt-4 space-y-3">
        {users.map((person) => (
          <button key={person.id} onClick={() => setEditing(person)} className="block w-full rounded-lg border border-line bg-panel p-4 text-left">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{person.fullName}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-gold">{person.role}{person.barberCode ? ` · ${person.barberCode}` : ""}</p>
              </div>
              <span className="text-xs text-mute">{person.active ? "Active" : "Off"}</span>
            </div>
            {person.role === "barber" ? <p className="mt-2 text-sm text-mute">Paid {money(person.alreadyPaid)} · left {money(person.advanceRemaining)}</p> : null}
          </button>
        ))}
      </div>
    </Shell>
  );
}
