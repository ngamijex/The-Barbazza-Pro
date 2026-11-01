"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  CalendarDays,
  ChartColumn,
  ClipboardList,
  CreditCard,
  Home,
  Scissors,
  Settings,
  Shield,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import { clearApiCache, readSession, Role, SessionUser } from "@/lib/api";
import { wakeApi } from "@/lib/wakeApi";
import { AppBootSkeleton, PageSkeleton } from "@/components/Skeleton";

type NavItem = {
  href: string;
  label: string;
  short: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
};

/** Exact Shiny tab labels — short/icons used only on mobile bottom bar */
const NAV: Record<Role, NavItem[]> = {
  admin: [
    { href: "/home", label: "Dashboard", short: "Home", icon: Home },
    { href: "/performance", label: "Performance Dashboard", short: "Perf", icon: ChartColumn },
    { href: "/people", label: "User Management", short: "Users", icon: Users },
    { href: "/profile", label: "Public Profiles", short: "Profiles", icon: UserRound },
    { href: "/services", label: "Service Management", short: "Services", icon: Scissors },
    { href: "/expense-categories", label: "Expense Categories", short: "Cats", icon: Wallet },
    { href: "/credits", label: "Credit Approvals", short: "Credits", icon: CreditCard },
    { href: "/reports", label: "Reports & Analytics", short: "Reports", icon: ClipboardList },
    { href: "/audit", label: "Audit Logs", short: "Audit", icon: Shield },
    { href: "/settings", label: "System Settings", short: "Settings", icon: Settings },
    { href: "/daily-records", label: "Daily Records", short: "Records", icon: CalendarDays },
  ],
  manager: [
    { href: "/home", label: "Daily Operations", short: "Ops", icon: Home },
    { href: "/expenses", label: "Expenses", short: "Spend", icon: Wallet },
    { href: "/barbers", label: "Barbers", short: "Barbers", icon: Users },
    { href: "/profile", label: "Public Profiles", short: "Profiles", icon: UserRound },
    { href: "/daily-report", label: "Daily Report", short: "Report", icon: ClipboardList },
    { href: "/credits", label: "Credit Approvals", short: "Credits", icon: CreditCard },
    { href: "/credit", label: "Request Credit", short: "Credit", icon: CreditCard },
    { href: "/daily-records", label: "Daily Records", short: "Records", icon: CalendarDays },
    { href: "/monthly-closing", label: "Monthly Closing", short: "Closing", icon: ChartColumn },
  ],
  supervisor: [{ href: "/home", label: "Today's Barber Performance", short: "Today", icon: Home }],
  barber: [
    { href: "/home", label: "Dashboard", short: "Home", icon: Home },
    { href: "/calendar", label: "Bookings & Calendar", short: "Bookings", icon: Bell },
    { href: "/profile", label: "My Public Profile", short: "Profile", icon: UserRound },
    { href: "/history", label: "History", short: "History", icon: CalendarDays },
    { href: "/credit", label: "Request Credit", short: "Credit", icon: CreditCard },
  ],
  cleaner: [
    { href: "/home", label: "Dashboard", short: "Home", icon: Home },
    { href: "/credit", label: "Request Credit", short: "Credit", icon: CreditCard },
  ],
};

export function useSession() {
  const router = useRouter();
  // Always start null so SSR + first client paint match (avoid hydration mismatch)
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    wakeApi();
    const session = readSession();
    if (!session) {
      router.replace("/staff");
      return;
    }
    setUser(session);
  }, [router]);

  return user;
}

export function Shell({
  children,
  loading = false,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  loading?: boolean;
}) {
  const user = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    for (const item of NAV[user.role]) {
      if (item.href !== pathname) router.prefetch(item.href);
    }
  }, [user, pathname, router]);

  if (!user) {
    return <AppBootSkeleton />;
  }

  const items = NAV[user.role];
  const tabsClass =
    user.role === "admin" ? "admin-tabs role-tabs desktop-tabs" : user.role === "manager" ? "manager-tabs role-tabs desktop-tabs" : "role-tabs desktop-tabs";

  function signOut() {
    clearApiCache();
    localStorage.clear();
    router.replace("/staff");
  }

  return (
    <div className="app-shell">
      <header className="main-header app-header">
        <div className="header-logo">
          <img src="/logo.png" alt="Barbazza Logo" />
          <div className="header-brand">
            <h1 className="header-title">BARBAZZA</h1>
            <p className="header-role-mobile">
              {user.role.toUpperCase()} · {user.fullName.split(" ")[0]}
            </p>
          </div>
        </div>
        <div className="header-user">
          <span className="header-welcome">Welcome, {user.fullName}</span>
          <span className="header-role-desk" style={{ color: "var(--barbazza-gold)" }}>
            ({user.role.toUpperCase()})
          </span>
          <button type="button" onClick={signOut} className="btn-logout">
            Logout
          </button>
        </div>
      </header>

      {items.length > 1 ? (
        <nav className={tabsClass}>
          <div className="role-tabs-inner">
            {items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} prefetch className={active ? "active" : undefined}>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}

      <main className="app-content">{loading ? <PageSkeleton /> : children}</main>

      {/* Mobile app bottom tab bar */}
      {items.length > 1 ? (
        <nav className="mobile-bottom-nav" aria-label="Primary">
          <div className="mobile-bottom-nav-inner">
            {items.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} prefetch className={`mobile-tab ${active ? "active" : ""}`}>
                  <Icon size={20} className="mobile-tab-icon" />
                  <span>{item.short}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}
    </div>
  );
}

export function Kpi({ label, value }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="summary-card stat-card">
      <div className="summary-label stat-label">{label}</div>
      <div className="summary-value stat-value">{value}</div>
    </div>
  );
}

export function Panel({
  title,
  children,
  className = "manager-card",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      {title ? <h3>{title}</h3> : null}
      {children}
    </section>
  );
}
