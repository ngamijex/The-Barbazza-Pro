"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Old route — Barber dashboard is home */
export default function ChairRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/home");
  }, [router]);
  return null;
}
