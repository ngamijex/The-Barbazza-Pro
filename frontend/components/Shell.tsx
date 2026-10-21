"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  ChartColumn,
  ClipboardList,
  Home,
  Scissors,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Role, SessionUser } from "@/lib/api";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

/** Same role areas as the Shiny portals — labels match familiar tabs */
const NAV: Record<Role, NavItem[]> = {
  admin: [
    { href: "/home", label: "Dashboard", icon: Home },
    { href: "/performance", label: "Performance", icon: ChartColumn },
    { href: "/floor", label: "Daily Records", icon: CalendarDays },
    { href: "/people", label: "Users", icon: Users },
    { href: "/services", label: "Services", icon: Scissors },
  ],
  manager: [
    { href: "/home", label: "Operations", icon: Home },
    { href: "/floor", label: "Floor", icon: CalendarDays },
    { href: "/expenses", label: "Expenses", icon: Wallet },
    { href: "/reports", label: "Reports", icon: ClipboardList },
  ],
  supervisor: [
    { href: "/home", label: "Today", icon: Home },
    { href: "/floor", label: "Day View", icon: CalendarDays },
  ],
  barber: [
    { href: "/home", label: "Dashboard", icon: Home },
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
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  const user = useSession();
  const pathname = usePathname();
  const router = useRouter();

  if (!user) {
    return <div className="app-shell min-h-[100dvh] bg-white" />;
  }

  const items = NAV[user.role];

  function signOut() {
    localStorage.clear();
    router.replace("/");
  }

  return (
    <div className="app-shell">
      {/* Same header layout as Shiny: logo + BARBAZZA | welcome + role + logout */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between border-b-2 border-gold bg-panel px-4 py-3 shadow-card md:px-6"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Barbazza Logo" className="h-10 w-auto" />
          <h1 className="font-display text-2xl tracking-wide text-gold md:text-[1.6rem]">BARBAZZA</h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-cream md:gap-3">
          <span className="hidden sm:inline">Welcome, {user.fullName}</span>
          <span className="text-gold">({user.role.toUpperCase()})</span>
          <button type="button" onClick={signOut} className="btn-logout">
            Logout
          </button>
        </div>
      </header>

      {/* Desktop / tablet: horizontal tabs like Shiny tabsetPanel */}
      <nav className="sticky top-[66px] z-20 hidden border-b-2 border-gold bg-panel md:block">
        <div className="mx-auto flex max-w-6xl gap-0 overflow-x-auto px-2 no-scrollbar">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 border-b-[3px] px-4 py-3 text-sm ${
                  active ? "border-gold text-gold" : "border-transparent text-cream hover:text-gold"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="app-main mx-auto w-full max-w-6xl px-4 pt-4 md:px-6">
        <h2 className="mb-1 font-display text-2xl text-gold">{title}</h2>
        {subtitle ? <p className="mb-4 text-sm text-mute">{subtitle}</p> : <div className="mb-4" />}
        {children}
      </main>

      {/* Phone: bottom tabs — same destinations, app-like chrome */}
      <nav className="bottom-nav fixed inset-x-0 bottom-0 z-40 border-t-2 border-gold bg-panel/95 px-1 pt-1 shadow-glow backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-lg justify-around">
          {items.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-md px-1 py-2 text-[10px] ${
                  active ? "bg-field text-gold" : "text-mute"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="truncate font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function Kpi({ label, value, accent: _accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

export function Panel({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="admin-card">
      {title ? <h3>{title}</h3> : null}
      {children}
    </section>
  );
}
