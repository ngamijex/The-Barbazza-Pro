"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, SessionUser } from "@/lib/api";

/** Exact Shiny login layout from app.R */
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
    <div className="login-container">
      <form className="login-box" onSubmit={onSubmit}>
        <Link href="/" className="login-back">
          ← Back
        </Link>
        <div className="login-logo">
          <img src="/logo.png" alt="Barbazza Logo" />
        </div>
        <h2
          style={{
            textAlign: "center",
            color: "var(--barbazza-cream)",
            fontSize: "var(--text-lg)",
            marginBottom: "var(--space-6)",
            fontWeight: 400,
          }}
        >
          Barbershop Management System
        </h2>

        {error ? <div className="alert alert-danger">{error}</div> : null}

        <div className="form-group">
          <label className="form-label">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            autoComplete="username"
            autoCapitalize="none"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
        </div>
        <div className="form-group">
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? "Processing..." : "Login"}
          </button>
        </div>
      </form>
    </div>
  );
}
