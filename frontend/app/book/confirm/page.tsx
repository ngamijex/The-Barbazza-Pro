"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PublicShell } from "@/components/public/PublicShell";

function ConfirmInner() {
  const params = useSearchParams();
  const id = params.get("id");

  return (
    <section className="public-section" style={{ textAlign: "center", maxWidth: 640 }}>
      <p style={{ letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--mute)", fontSize: 12 }}>Confirmed</p>
      <h2 style={{ marginTop: 10 }}>Your barber is booked.</h2>
      <p className="lede" style={{ margin: "0 auto 1.75rem" }}>
        Booking #{id || "—"} is with the shop. Arrive a few minutes early — we&apos;ll take it from there.
      </p>
      <div className="public-cta-row" style={{ justifyContent: "center" }}>
        <Link href="/team" className="btn-ink" style={{ background: "var(--ink)", color: "#fff" }}>
          Browse barbers
        </Link>
        <Link href="/" className="btn-ghost-light" style={{ color: "var(--ink)", borderColor: "var(--line)" }}>
          Home
        </Link>
      </div>
    </section>
  );
}

export default function BookConfirmPage() {
  return (
    <PublicShell>
      <Suspense>
        <ConfirmInner />
      </Suspense>
    </PublicShell>
  );
}
