"use client";

import { usePathname } from "next/navigation";

function isPublicPath(pathname: string) {
  if (pathname === "/") return true;
  return pathname.startsWith("/team") || pathname.startsWith("/book");
}

/** Staff Shiny CSS only outside the public marketing/booking pages. */
export function ThemeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const publicRoute = isPublicPath(pathname);

  return (
    <>
      {!publicRoute ? (
        // eslint-disable-next-line @next/next/no-css-tags -- intentional route-scoped staff theme
        <link rel="stylesheet" href="/styles.css" data-barbazza-staff-theme="1" />
      ) : null}
      {children}
    </>
  );
}
