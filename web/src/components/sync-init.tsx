"use client";
import { useEffect } from "react";
import { initSync } from "@/lib/sync";

export function SyncInit() {
  useEffect(() => { initSync(); }, []);
  return null;
}
