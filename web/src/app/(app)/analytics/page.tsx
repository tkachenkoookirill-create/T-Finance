"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui";
import { fmtMoney } from "@/lib/money";

type CatSpend = { key: string; label: string; color_token: string; value_minor: number };
type MonthPt = { month: string; inflow_minor: number; outflow_minor: number };

export default function AnalyticsPage() {
  const [cats, setCats] = useState<CatSpend[]>([]);
  const [months, setMonths] = useState<MonthPt[]>([]);

  useEffect(() => {
    api<CatSpend[]>("/analytics/categories?days=30").then(setCats);
    api<MonthPt[]>("/analytics/monthly?months=12").then(setMonths);
  }, []);

  const maxMo = Math.max(1, ...months.map((m) => Math.max(m.inflow_minor, m.outflow_minor)));
  const totalSpend = cats.reduce((s, c) => s + c.value_minor, 0) || 1;

  return (
    <div className="flex flex-col gap-5 max-w-[1280px]">
      <div>
        <div className="text-[11px] uppercase tracking-[0.1em] text-ink-3 font-semibold">Инструменты</div>
        <h1 className="serif text-[40px] leading-none tracking-tight text-ink mt-1">Аналитика</h1>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-8">
          <div className="text-[13px] uppercase tracking-[0.04em] text-ink-2 font-semibold">Денежный поток · 12 мес.</div>
          <div className="grid grid-cols-12 gap-2 mt-3 h-[200px]">
            {months.map((m) => (
              <div key={m.month} className="flex flex-col justify-end items-center gap-1 h-full">
                <div className="w-full flex flex-col items-center gap-0.5 h-full justify-end">
                  <div className="w-3 rounded-sm" style={{ height: `${(m.inflow_minor / maxMo) * 80}%`, background: "var(--pos)" }} />
                  <div className="w-3 rounded-sm" style={{ height: `${(m.outflow_minor / maxMo) * 80}%`, background: "var(--neg)" }} />
                </div>
                <div className="mono text-[9px] text-ink-3">{m.month.slice(5)}</div>
              </div>
            ))}
            {months.length === 0 && <div className="col-span-12 text-ink-3 text-[12px]">Нет данных</div>}
          </div>
        </Card>

        <Card className="col-span-4">
          <div className="text-[13px] uppercase tracking-[0.04em] text-ink-2 font-semibold">Категории</div>
          <div className="flex flex-col gap-2">
            {cats.map((c) => {
              const w = Math.round((c.value_minor / totalSpend) * 100);
              return (
                <div key={c.key} className="flex flex-col gap-1">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-ink">{c.label}</span>
                    <span className="mono tnum text-ink-2">{fmtMoney(c.value_minor)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-bg-sunken overflow-hidden">
                    <div style={{ width: `${w}%`, background: c.color_token }} className="h-full" />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
