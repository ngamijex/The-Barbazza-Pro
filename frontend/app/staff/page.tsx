"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { api, SessionUser } from "@/lib/api";
import { wakeApi } from "@/lib/wakeApi";

/** Exact Shiny login layout from app.R */
export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    wakeApi();
    router.prefetch("/home");
    if (localStorage.getItem("barbazza_token")) {
      window.location.replace("/home");
    }
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
      await wakeApi();
      const result = await api<{ token: string; user: SessionUser }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      localStorage.setItem("barbazza_token", result.token);
      localStorage.setItem("barbazza_user", JSON.stringify(result.user));
      // Hard navigation is faster than waiting on soft route transition + home data gate
      window.location.href = "/home";
    } catch (err) {
      setBusy(false);
      setError(err instanceof Error ? err.message : "Invalid username or password");
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
        <h2 className="login-subtitle">Barbershop Management System</h2>

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
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={0}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <div className="form-group">
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? "Signing in…" : "Login"}
          </button>
        </div>
      </form>
    </div>
  );
}
