"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CalendarDays,
  ChartColumn,
  ClipboardList,
  Home,
  LogOut,
  Scissors,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Role, SessionUser } from "@/lib/api";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

const NAV: Record<Role, NavItem[]> = {
  admin: [
    { href: "/home", label: "Home", icon: Home },
    { href: "/performance", label: "Month", icon: ChartColumn },
    { href: "/floor", label: "Floor", icon: CalendarDays },
    { href: "/people", label: "People", icon: Users },
    { href: "/services", label: "Menu", icon: Scissors },
  ],
  manager: [
    { href: "/home", label: "Today", icon: Home },
    { href: "/floor", label: "Floor", icon: CalendarDays },
    { href: "/expenses", label: "Spend", icon: Wallet },
    { href: "/reports", label: "Books", icon: ClipboardList },
  ],
  supervisor: [
    { href: "/home", label: "Today", icon: Home },
    { href: "/floor", label: "Day", icon: CalendarDays },
  ],
  barber: [
    { href: "/home", label: "Today", icon: Home },
    { href: "/chair", label: "Chair", icon: Scissors },
  ],
};

export function useSession() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("barbazza_user");
    const token = localStorage.getItem("barbazza_token");
    if (!raw || !token) {
      router.replace("/");
      return;
    }
    setUser(JSON.parse(raw));
  }, [router]);

  return user;
}

export function Shell({
  children,
  title,
  subtitle,
  action,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  const user = useSession();
  const pathname = usePathname();
  const router = useRouter();
  if (!user) {
    return (
      <div className="app-shell flex min-h-[100dvh] items-center justify-center">
        <div className="h-10 w-10 animate-pulse rounded-full border-2 border-gold/40 border-t-gold" />
      </div>
    );
  }
  const items = NAV[user.role];

  function signOut() {
    localStorage.clear();
    router.replace("/");
  }

  return (
    <div className="app-shell">
      <header
        className="sticky top-0 z-30 border-b border-line/80 bg-night/85 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-xl md:px-6"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <img src="/logo.png" alt="Barbazza" className="h-9 w-auto shrink-0 md:h-10" />
            <div className="min-w-0">
              <p className="font-display text-xl tracking-[0.14em] text-gold md:text-2xl">BARBAZZA</p>
              <p className="truncate text-[11px] uppercase tracking-[0.18em] text-mute">
                {user.role} · {user.fullName.split(" ")[0]}
              </p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-field/50 px-3 py-2 text-sm text-cream transition hover:border-gold/40"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4 text-gold" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Desktop secondary nav under header */}
      <nav className="sticky top-[72px] z-20 hidden border-b border-line/60 bg-night/80 backdrop-blur-xl md:block">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 no-scrollbar md:px-6">
          {items.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm transition ${
                  active ? "border-gold text-gold" : "border-transparent text-mute hover:text-cream"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="app-main mx-auto w-full max-w-6xl px-4 pt-5 md:px-6">
        <div className="mb-5 flex items-end justify-between gap-3">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <h1 className="font-display text-3xl text-cream md:text-4xl">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-mute">{subtitle}</p> : null}
          </motion.div>
          {action}
        </div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
          {children}
        </motion.div>
      </main>

      {/* Mobile bottom tab bar — native app feel */}
      <nav className="bottom-nav fixed inset-x-0 bottom-0 z-40 border-t border-line/80 bg-night/92 px-2 pt-2 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-lg items-stretch justify-around">
          {items.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex min-w-[64px] flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] transition ${
                  active ? "text-gold" : "text-mute"
                }`}
              >
                {active ? (
                  <motion.span
                    layoutId="tab-glow"
                    className="absolute inset-0 rounded-2xl bg-gold/10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                ) : null}
                <Icon className={`relative z-10 h-5 w-5 ${active ? "text-gold" : ""}`} />
                <span className="relative z-10 font-medium tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function Kpi({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="kpi-card">
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-mute">{label}</p>
      <p className={`mt-2 font-display text-2xl md:text-3xl ${accent ? "text-gold-soft" : "text-cream"}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-mute">{hint}</p> : null}
    </div>
  );
}

export function Panel({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`card p-4 md:p-5 ${className}`}>
      {title ? <h2 className="mb-4 font-display text-2xl text-gold">{title}</h2> : null}
      {children}
    </section>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line px-4 py-10 text-center text-sm text-mute">{message}</div>
  );
}
