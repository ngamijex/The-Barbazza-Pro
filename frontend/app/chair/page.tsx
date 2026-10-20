"use client";

import { useEffect, useState } from "react";
import { Kpi, Panel, Shell } from "@/components/Shell";
import { api, money } from "@/lib/api";

type BarberHome = {
  commissionRate: number;
  month: { gross: number; commission: number; customers: number; bestDay: number; recruitmentBalance: number; expectedNet: number };
};

export default function ChairPage() {
  const [data, setData] = useState<BarberHome | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<BarberHome>("/api/barber/home").then(setData).catch((err) => setError(err.message));
  }, []);

  return (
    <Shell title="This month" subtitle="What your chair has already earned.">
      {error ? <p className="text-red-300">{error}</p> : null}
      {data ? (
        <Panel title={`${data.commissionRate}% commission`}>
          <div className="grid grid-cols-2 gap-3">
            <Kpi label="Gross" value={money(data.month.gross)} />
            <Kpi label="Yours" value={money(data.month.commission)} accent />
            <Kpi label="Clients" value={String(data.month.customers)} />
            <Kpi label="Best day" value={money(data.month.bestDay)} />
            <Kpi label="Advance left" value={money(data.month.recruitmentBalance)} />
            <Kpi label="Expected take-home" value={money(data.month.expectedNet)} accent />
          </div>
        </Panel>
      ) : null}
    </Shell>
  );
}
