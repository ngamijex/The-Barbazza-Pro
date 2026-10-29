"use client";

import { useEffect, useState } from "react";
import { Panel, Shell, useSession } from "@/components/Shell";
import { api } from "@/lib/api";

type Category = { id: number; name: string; description: string; active: boolean };

export default function ExpenseCategoriesPage() {
  const user = useSession();
  const [rows, setRows] = useState<Category[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    api<Category[]>("/api/categories")
      .then(setRows)
      .catch((err) => setError(err.message));
  }, [user]);

  return (
    <Shell>
      <Panel title="Expense Categories" className="admin-card">
        {error ? <div className="alert alert-danger">{error}</div> : null}
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Active</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>{row.description || "-"}</td>
                <td>{row.active ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </Shell>
  );
}
