"use client";

import { useEffect, useState } from "react";
import { Panel, Shell, useSession } from "@/components/Shell";
import { PageSkeleton } from "@/components/Skeleton";
import { api, money } from "@/lib/api";

type Barber = { code: string; name: string; clients: number; earned: number };

/** Manager portal — Barber Performance (Today) */
export default function BarbersPage() {
  const user = useSession();
  const [rows, setRows] = useState<Barber[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api<{ barbers: Barber[] }>("/api/day")
      .then((day) => setRows(day.barbers))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <Shell loading={loading && !error}>
      <Panel title="Barber Performance - Today" className="manager-card">
        {error ? <div className="alert alert-danger">{error}</div> : null}
        {!loading ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Barber</th>
                <th>Code</th>
                <th>Clients</th>
                <th>Earned</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.code}>
                  <td>{row.name}</td>
                  <td>{row.code}</td>
                  <td>{row.clients}</td>
                  <td>{money(row.earned)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <PageSkeleton cards={1} kpis={0} />
        )}
      </Panel>
    </Shell>
  );
}
