"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, Pill } from "@/components/ui";
import { fmtMoney } from "@/lib/money";

type Tx = { id: number; account_id: number; amount_minor: number; direction: string; merchant: string; note: string; occurred_at: string; category_key: string | null };

export default function HistoryPage() {
  const [txs, setTxs] = useState<Tx[]>([]);
  useEffect(() => { api<Tx[]>("/transactions?limit=200").then(setTxs); }, []);

  // Group by date
  const groups: Record<string, Tx[]> = {};
  for (const t of txs) {
    const day = new Date(t.occurred_at).toLocaleDateString("ru-RU", { day: "2-digit", month: "long" });
    (groups[day] ||= []).push(t);
  }

  return (
    <div className="flex flex-col gap-5 max-w-[1100px]">
      <div>
        <div className="text-[11px] uppercase tracking-[0.1em] text-ink-3 font-semibold">Инструменты</div>
        <h1 className="serif text-[40px] leading-none tracking-tight text-ink mt-1">История</h1>
      </div>

      <div className="flex flex-col gap-4">
        {Object.entries(groups).map(([day, items]) => (
          <Card key={day} flush>
            <div className="px-5 py-3 border-b border-line text-[13px] uppercase tracking-[0.04em] text-ink-2 font-semibold flex justify-between">
              <span>{day}</span>
              <span className="mono tnum text-ink-3">{items.length} операций</span>
            </div>
            <table className="w-full text-[13px]">
              <tbody>
                {items.map((t) => (
                  <tr key={t.id} className="border-b border-line-2 last:border-0">
                    <td className="px-5 py-3 text-ink">{t.merchant || "—"}</td>
                    <td className="px-5 py-3"><Pill>{t.category_key || t.direction}</Pill></td>
                    <td className="px-5 py-3 mono text-[11px] text-ink-3">{new Date(t.occurred_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}</td>
                    <td className={"px-5 py-3 text-right tnum mono " + (t.amount_minor < 0 ? "text-ink" : "text-pos")}>
                      {fmtMoney(t.amount_minor, { cur: "₽", sign: true })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ))}
        {txs.length === 0 && <Card><div className="text-ink-3 text-[13px]">Операций пока нет.</div></Card>}
      </div>
    </div>
  );
}
