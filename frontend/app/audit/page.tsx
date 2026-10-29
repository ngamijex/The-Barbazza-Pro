"use client";

import { Panel, Shell } from "@/components/Shell";

export default function AuditPage() {
  return (
    <Shell>
      <Panel title="Audit Logs" className="admin-card">
        <p style={{ color: "var(--barbazza-cream)" }}>
          Audit log table from the Shiny admin portal — wired to the same database logging next (login attempts and write
          actions).
        </p>
      </Panel>
    </Shell>
  );
}
