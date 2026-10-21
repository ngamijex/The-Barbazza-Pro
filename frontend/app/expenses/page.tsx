"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ExpensesRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/floor");
  }, [router]);
  return null;
}
