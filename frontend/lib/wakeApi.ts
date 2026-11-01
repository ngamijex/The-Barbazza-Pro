import { API } from "@/lib/api";

let waking: Promise<void> | null = null;
let lastWake = 0;

/** Ping the API so cold hosts (e.g. Render free) are warm before login/saves. */
export function wakeApi() {
  const now = Date.now();
  if (now - lastWake < 45_000 && waking) return waking;
  lastWake = now;
  waking = fetch(`${API}/api/health`, { method: "GET", cache: "no-store", keepalive: true })
    .then(() => undefined)
    .catch(() => undefined)
    .finally(() => {
      waking = null;
    });
  return waking;
}
