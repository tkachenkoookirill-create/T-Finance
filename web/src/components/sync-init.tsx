"use client";
import { useEffect } from "react";
import { initSync } from "@/lib/sync";

export function SyncInit() {
  useEffect(() => {
    // удаляем старые service workers
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
    }
    initSync();
  }, []);
  return null;
}
