"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, SessionUser } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("barbazza_token")) router.replace("/home");
  }, [router]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await api<{ token: string; user: SessionUser }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      localStorage.setItem("barbazza_token", result.token);
      localStorage.setItem("barbazza_user", JSON.stringify(result.user));
      router.replace("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative min-h-[100dvh] overflow-hidden px-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.18),_transparent_42%),linear-gradient(180deg,#120f0c,#090807)]" />
      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col justify-end pb-10 pt-16 sm:justify-center">
        <p className="font-display text-sm uppercase tracking-[0.42em] text-gold">The Barbazza</p>
        <h1 className="mt-3 font-display text-5xl leading-none text-cream">The floor, in your pocket.</h1>
        <p className="mt-4 max-w-sm text-mute">Income, chairs, expenses, and payroll — the same shop, rebuilt for every screen.</p>
        <form onSubmit={onSubmit} className="mt-10 rounded-[28px] border border-line bg-panel/90 p-5 shadow-glow backdrop-blur">
          <label className="mb-4 block text-sm text-mute">
            Username
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-line bg-ink px-4 py-4 text-cream outline-none focus:border-gold"
              autoComplete="username"
            />
          </label>
          <label className="mb-4 block text-sm text-mute">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-line bg-ink px-4 py-4 text-cream outline-none focus:border-gold"
              autoComplete="current-password"
            />
          </label>
          {error ? <p className="mb-3 text-sm text-red-300">{error}</p> : null}
          <button
            disabled={busy}
            className="w-full rounded-2xl bg-gold py-4 font-semibold text-ink active:scale-[0.98] disabled:opacity-60"
          >
            {busy ? "Opening the shop…" : "Enter"}
          </button>
        </form>
      </div>
    </main>
  );
}
