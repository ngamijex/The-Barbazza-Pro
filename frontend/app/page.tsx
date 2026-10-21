"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, SessionUser } from "@/lib/api";

/** Login matches Shiny login box: logo, title, username, password, Login button */
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
    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }
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
      setError(err instanceof Error ? err.message : "Invalid username or password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-white px-4 py-8">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-[350px] rounded-xl border-2 border-gold bg-panel p-6 shadow-glow"
      >
        <div className="mb-5 text-center">
          <img src="/logo.png" alt="Barbazza Logo" className="mx-auto mb-4 h-auto w-[150px]" />
        </div>
        <h2 className="mb-6 text-center text-lg text-cream">Barbershop Management System</h2>

        {error ? (
          <div className="mb-4 border-l-4 border-error bg-red-50 px-4 py-3 text-sm text-cream">{error}</div>
        ) : null}

        <label className="mb-4 block font-medium text-cream">
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-2"
            autoComplete="username"
            placeholder="Enter your username"
          />
        </label>
        <label className="mb-4 block font-medium text-cream">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2"
            autoComplete="current-password"
            placeholder="Enter your password"
          />
        </label>
        <button type="submit" disabled={busy} className="btn-primary">
          {busy ? "Processing..." : "Login"}
        </button>
      </form>
    </main>
  );
}
