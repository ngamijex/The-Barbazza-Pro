"use client";

import { Panel, Shell } from "@/components/Shell";

export default function SettingsPage() {
  return (
    <Shell>
      <Panel title="System Settings" className="admin-card">
        <p style={{ color: "var(--barbazza-cream)" }}>
          System settings match the Shiny admin System Settings tab (commission defaults, shop info). Values already live
          in Neon — UI controls will bind to the same settings table.
        </p>
      </Panel>
    </Shell>
  );
}
