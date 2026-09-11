"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function Presence() {
  const path = usePathname();

  useEffect(() => {
    void fetch("/api/analytics/presence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path }),
      keepalive: true,
    }).catch(() => undefined);
  }, [path]);

  return null;
}
