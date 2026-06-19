"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./ui";
import { I18N } from "@/lib/i18n";

const NAV = [
  { href: "/dashboard", key: "overview", group: "money" },
  { href: "/accounts", key: "accounts", group: "money" },
  { href: "/transfer", key: "transfer", group: "money" },
  { href: "/analytics", key: "analytics", group: "tools" },
  { href: "/invest", key: "invest", group: "tools" },
  { href: "/history", key: "history", group: "tools" },
  { href: "/credit", key: "credit", group: "tools" },
  { href: "/profile", key: "profile", group: "account" },
] as const;

export function Sidebar() {
  const path = usePathname();
  const t = I18N.ru;
  const groups = [
    { id: "money" as const, items: NAV.filter((n) => n.group === "money") },
    { id: "tools" as const, items: NAV.filter((n) => n.group === "tools") },
    { id: "account" as const, items: NAV.filter((n) => n.group === "account") },
  ];

  return (
    <aside className="w-60 border-r border-line bg-bg flex flex-col shrink-0 p-3.5">
      <div className="px-2 pt-1 pb-5"><Logo size={20} /></div>

      {groups.map((g) => (
        <div key={g.id}>
          <div className="text-[10px] tracking-[0.12em] uppercase text-ink-4 font-bold px-2.5 pt-3.5 pb-1.5">
            {t.section[g.id]}
          </div>
          {g.items.map((item) => {
            const active = path.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium " +
                  (active ? "bg-bg-sunken text-ink" : "text-ink-2 hover:text-ink")
                }
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: active ? "var(--brand)" : "var(--ink-4)" }} />
                {t.nav[item.key]}
              </Link>
            );
          })}
        </div>
      ))}

      <div className="mt-auto text-[10px] text-ink-4 px-2.5 py-2 mono">
        Данные в этом браузере · бэкап в Профиле
      </div>
    </aside>
  );
}

export function Topbar({ children }: { children?: React.ReactNode }) {
  return (
    <header className="h-16 border-b border-line px-6 flex items-center gap-4 shrink-0 bg-bg">
      <div className="flex-1 max-w-[480px] h-9 rounded-sm bg-bg-sunken border border-line px-3 flex items-center gap-2 text-ink-3 text-[13px]">
        <span>Поиск</span>
        <span className="ml-auto mono text-[10px] px-1.5 py-0.5 rounded bg-bg-elev border border-line">⌘K</span>
      </div>
      {children}
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
           style={{ background: "linear-gradient(135deg, var(--brand) 0%, var(--brand-2) 100%)" }}>
        AЛ
      </div>
    </header>
  );
}
