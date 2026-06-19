"use client";
import { Sidebar, Topbar } from "@/components/shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex bg-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-auto p-7">{children}</div>
      </div>
    </div>
  );
}
