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
  monthlySalary: number;
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
  monthlySalary: 0,
};

const ROLES = ["admin", "manager", "supervisor", "barber", "cleaner"] as const;

function needsSalary(role: string) {
  return role === "manager" || role === "cleaner";
}

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

  // Browser password managers autofill this create form (looks like "edit"). Clear after mount.
  useEffect(() => {
    if (editing) return;
    const clear = () => setForm(empty);
    clear();
    const t = window.setTimeout(clear, 50);
    const t2 = window.setTimeout(clear, 300);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(t2);
    };
  }, [editing]);

  async function createUser(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    if (needsSalary(form.role) && !(Number(form.monthlySalary) > 0)) {
      setMessage("Monthly salary is required for managers and cleaners.");
      return;
    }
    try {
      await api("/api/users", { method: "POST", body: JSON.stringify(form) });
      setForm(empty);
      setMessage("User created.");
      void load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not create user");
    }
  }

  async function saveEdit(event: FormEvent) {
    event.preventDefault();
    if (!editing) return;
    if (needsSalary(editing.role) && !(Number(editing.monthlySalary) >= 0)) {
      setMessage("Monthly salary must be set for managers and cleaners.");
      return;
    }
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
          monthlySalary: editing.monthlySalary,
        }),
      });
      setEditing(null);
      setForm(empty);
      setMessage("Saved. Amount already paid was kept.");
      void load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save");
    }
  }

  async function recover() {
    const result = await api<{ updated: number }>("/api/users/recover-advances", { method: "POST" });
    setMessage(`Recovered ${result.updated} balance${result.updated === 1 ? "" : "s"}.`);
    void load();
  }

  async function deleteUser(person: UserRow) {
    if (!confirm(`Delete / deactivate ${person.fullName}? They will no longer be able to sign in.`)) return;
    try {
      await api(`/api/users/${person.id}`, { method: "DELETE" });
      if (editing?.id === person.id) setEditing(null);
      setMessage("User deactivated.");
      void load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not delete user");
    }
  }

  const role = editing ? editing.role : form.role;

  return (
    <Shell>
      {message ? <p style={{ marginBottom: "var(--space-3)", color: "var(--barbazza-gold)" }}>{message}</p> : null}
      <button type="button" onClick={recover} className="btn-action" style={{ width: "auto", marginBottom: "var(--space-4)" }}>
        Recover advance balances
      </button>
      <Panel title={editing ? `Edit ${editing.username}` : "Add new user"} className="admin-card">
        <form
          onSubmit={editing ? saveEdit : createUser}
          className="service-form"
          autoComplete="off"
          data-lpignore="true"
          data-1p-ignore="true"
        >
          {/* Absorb browser autofill so create fields stay blank */}
          {!editing ? (
            <div aria-hidden style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }}>
              <input type="text" name="prevent_autofill_user" autoComplete="username" tabIndex={-1} />
              <input type="password" name="prevent_autofill_pass" autoComplete="current-password" tabIndex={-1} />
            </div>
          ) : null}
          <div className="form-grid form-grid-2">
            {!editing ? (
              <div className="form-group">
                <label>Username</label>
                <input
                  required
                  name="barbazza_new_username"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
              </div>
            ) : null}
            <div className="form-group">
              <label>Full name</label>
              <input
                required
                name="barbazza_full_name"
                autoComplete="off"
                value={editing ? editing.fullName : form.fullName}
                onChange={(e) =>
                  editing ? setEditing({ ...editing, fullName: e.target.value }) : setForm({ ...form, fullName: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>{editing ? "New password (optional)" : "Password"}</label>
              <input
                type="password"
                name="barbazza_new_password"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select
                value={role}
                onChange={(e) =>
                  editing ? setEditing({ ...editing, role: e.target.value }) : setForm({ ...form, role: e.target.value })
                }
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            {role === "barber" ? (
              <>
                <div className="form-group">
                  <label>Commission %</label>
                  <input
                    type="number"
                    value={editing ? editing.commissionRate : form.commissionRate}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      editing ? setEditing({ ...editing, commissionRate: value }) : setForm({ ...form, commissionRate: value });
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>Recruitment advance</label>
                  <input
                    type="number"
                    value={editing ? editing.recruitmentAdvance : form.recruitmentAdvance}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      editing
                        ? setEditing({ ...editing, recruitmentAdvance: value })
                        : setForm({ ...form, recruitmentAdvance: value });
                    }}
                  />
                </div>
                {editing ? (
                  <p style={{ gridColumn: "1 / -1", color: "var(--barbazza-cream)", fontSize: "0.9rem" }}>
                    Already paid {money(editing.alreadyPaid)} · remaining {money(editing.advanceRemaining)}. Changing the
                    advance keeps what was already paid.
                  </p>
                ) : null}
              </>
            ) : null}
            {needsSalary(role) ? (
              <div className="form-group">
                <label>Monthly salary (RWF)</label>
                <input
                  required
                  type="number"
                  min={0}
                  step={1000}
                  value={editing ? editing.monthlySalary : form.monthlySalary}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    editing ? setEditing({ ...editing, monthlySalary: value }) : setForm({ ...form, monthlySalary: value });
                  }}
                />
              </div>
            ) : null}
          </div>
          <button type="submit" className="btn-action">
            {editing ? "Save changes" : "Create"}
          </button>
          {editing ? (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setForm(empty);
              }}
              style={{ marginLeft: 12 }}
            >
              Cancel
            </button>
          ) : null}
        </form>
      </Panel>
      <Panel title="Users" className="admin-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Role</th>
              <th>Salary</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((person) => (
              <tr key={person.id}>
                <td>{person.fullName}</td>
                <td>{person.username}</td>
                <td>
                  {person.role}
                  {person.barberCode ? ` · ${person.barberCode}` : ""}
                </td>
                <td>{needsSalary(person.role) ? money(person.monthlySalary) : "—"}</td>
                <td>{person.active ? "Active" : "Off"}</td>
                <td style={{ whiteSpace: "nowrap" }}>
                  <button
                    type="button"
                    className="btn-action"
                    style={{ width: "auto", marginRight: 6 }}
                    onClick={() => {
                      setForm({ ...empty, password: "" });
                      setEditing(person);
                    }}
                  >
                    Edit
                  </button>
                  {person.active ? (
                    <button type="button" className="btn-logout" onClick={() => deleteUser(person)}>
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
