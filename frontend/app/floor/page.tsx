"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Old route — Daily Records is the Shiny tab name */
export default function FloorRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/daily-records");
  }, [router]);
  return null;
}
