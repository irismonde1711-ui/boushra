"use client";

import { useEffect } from "react";
import { ADMIN_BASE } from "@/config/site";

export default function AdminPwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // In development Next's chunk URLs aren't content-hashed, so a caching worker would
    // keep serving stale code after every edit — only run it in production builds.
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()));
      return;
    }

    navigator.serviceWorker
      .register("/admin-sw.js", { scope: ADMIN_BASE })
      .catch((err) => console.warn("Admin SW registration failed:", err));
  }, []);

  return null;
}
