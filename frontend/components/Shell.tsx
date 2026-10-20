"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Role, SessionUser } from "@/lib/api";
import { CalendarDays, Home, Scissors, Users, Wallet } from "lucide-react";

const NAV: Record<Role, { href: string; label: string; icon: typeof Home }[]> = {
  admin: [
    { href: "/home", label: "Home", icon: Home },
    { href: "/performance", label: "Month", icon: CalendarDays },
    { href: "/floor", label: "Floor", icon: Scissors },
    { href: "/people", label: "People", icon: Users },
    { href: "/services", label: "Menu", icon: Wallet },
  ],
  manager: [
    { href: "/home", label: "Today", icon: Home },
    { href: "/floor", label: "Floor", icon: Scissors },
    { href: "/expenses", label: "Spend", icon: Wallet },
    { href: "/reports", label: "Books", icon: CalendarDays },
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

export function Shell({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle?: string }) {
  const user = useSession();
  const pathname = usePathname();
  const router = useRouter();
  if (!user) return <div className="min-h-[100dvh] bg-ink" />;
  const items = NAV[user.role];

  return (
    <div className="min-h-[100dvh] bg-ink text-cream">
      <div className="mx-auto flex min-h-[100dvh] max-w-6xl">
        <aside className="sticky top-0 hidden h-[100dvh] w-64 shrink-0 flex-col border-r border-line bg-panel px-5 py-6 md:flex">
          <p className="font-display text-2xl gold-text">Barbazza</p>
          <p className="mt-1 text-xs uppercase tracking-[0.28em] text-mute">{user.role}</p>
          <nav className="mt-10 flex flex-col gap-1">
            {items.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm ${active ? "bg-gold text-ink" : "text-cream/80 hover:bg-white/5"}`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <button
            className="mt-auto rounded-2xl border border-line px-3 py-3 text-left text-sm text-mute"
            onClick={() => {
              localStorage.clear();
              router.replace("/");
            }}
          >
            Sign out · {user.fullName}
          </button>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-ink/80 px-4 py-4 backdrop-blur md:px-8">
            <div>
              <p className="text-[11px] uppercase tracking-[0.32em] text-gold md:hidden">Barbazza</p>
              <h1 className="font-display text-2xl leading-none md:text-3xl">{title}</h1>
              {subtitle ? <p className="mt-1 text-sm text-mute">{subtitle}</p> : null}
            </div>
            <button
              className="rounded-full border border-line px-3 py-2 text-xs uppercase tracking-widest text-mute md:hidden"
              onClick={() => {
                localStorage.clear();
                router.replace("/");
              }}
            >
              Out
            </button>
          </header>
          <main className="app-scroll flex-1 px-4 pb-28 pt-4 md:px-8 md:pb-10">{children}</main>
        </div>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-[#100e0c]/95 px-2 pb-[max(env(safe-area-inset-bottom),10px)] pt-2 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-lg justify-around">
          {items.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={`flex min-w-[64px] flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] ${active ? "text-gold" : "text-mute"}`}>
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function Kpi({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-[22px] border border-line bg-panel p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-mute">{label}</p>
      <p className={`mt-2 font-display text-2xl ${accent ? "text-gold" : "text-cream"}`}>{value}</p>
    </div>
  );
}

export function Panel({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[28px] border border-line bg-panel p-4 md:p-5">
      {title ? <h2 className="mb-4 font-display text-xl">{title}</h2> : null}
      {children}
    </section>
  );
}
