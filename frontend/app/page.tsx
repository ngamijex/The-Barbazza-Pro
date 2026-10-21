"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
    <main className="app-shell relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[url('/logo.png')] bg-center bg-no-repeat opacity-[0.03]" />
      <motion.form
        onSubmit={onSubmit}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-[380px] rounded-[1.75rem] border border-gold/30 bg-panel/95 p-7 shadow-lift backdrop-blur-xl"
      >
        <div className="mb-6 text-center">
          <img src="/logo.png" alt="Barbazza" className="mx-auto mb-4 h-auto w-[140px] drop-shadow-[0_0_24px_rgba(201,162,39,0.25)]" />
          <p className="font-display text-3xl tracking-[0.2em] text-gold">BARBAZZA</p>
          <p className="mt-2 text-sm text-mute">Operations · Performance · Payroll</p>
        </div>

        {error ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 rounded-xl border border-burgundy/40 bg-burgundy/20 px-4 py-3 text-sm text-cream"
          >
            {error}
          </motion.p>
        ) : null}

        <label className="mb-4 block text-sm font-medium text-mute">
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-2"
            autoComplete="username"
            placeholder="Your username"
            required
          />
        </label>
        <label className="mb-6 block text-sm font-medium text-mute">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2"
            autoComplete="current-password"
            placeholder="Your password"
            required
          />
        </label>
        <button disabled={busy} className="btn-gold w-full uppercase tracking-[0.18em]">
          {busy ? "Signing in…" : "Enter"}
        </button>
        <p className="mt-5 text-center text-[11px] uppercase tracking-[0.2em] text-mute">Same accounts · Neon database</p>
      </motion.form>
    </main>
  );
}
