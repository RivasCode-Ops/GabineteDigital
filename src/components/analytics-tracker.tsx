"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

let sessionId: string | null = null;
if (typeof window !== "undefined") {
  sessionId = sessionStorage.getItem("analytics_session");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("analytics_session", sessionId);
  }
}

async function track(page: string, action: string, label?: string, duration?: number) {
  try {
    await fetch("/api/v1/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page, action, label, sessionId, duration }),
    });
  } catch {}
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const startRef = useRef(Date.now());
  const lastPath = useRef(pathname);

  useEffect(() => {
    const currentPath = lastPath.current;
    if (currentPath !== pathname) {
      const elapsed = Math.round((Date.now() - startRef.current) / 1000);
      track(currentPath, "leave", undefined, elapsed);
      startRef.current = Date.now();
      lastPath.current = pathname;
    }
    track(pathname, "view");
  }, [pathname]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const label = target.getAttribute("data-analytics") || target.textContent?.trim().slice(0, 50);
      if (label) track(pathname, "click", label);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);

  return null;
}
