"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Card, Pill, Sparkline, Button } from "@/components/ui";
import { fmtMoney, CUR_SYMBOL } from "@/lib/money";

type Account = { id: number; label: string; type: string; currency: string; balance_minor: number; last4: string; color: string };
type Tx = { id: number; account_id: number; amount_minor: number; merchant: string; occurred_at: string; category_key: string | null };
type NetWorth = { net_worth_minor: number; currency: string };
type CatSpend = { key: string; label: string; color_token: string; value_minor: number };

export default function Dashboard() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [net, setNet] = useState<NetWorth | null>(null);
  const [cats, setCats] = useState<CatSpend[]>([]);

  useEffect(() => {
    Promise.all([
      api<Account[]>("/accounts"),
      api<Tx[]>("/transactions?limit=8"),
      api<NetWorth>("/analytics/net-worth"),
      api<CatSpend[]>("/analytics/categories?days=30"),
    ]).then(([a, t, n, c]) => {
      setAccounts(a); setTxs(t); setNet(n); setCats(c);
    }).catch(console.error);
  }, []);

  const totalSpend = cats.reduce((s, c) => s + c.value_minor, 0) || 1;

  return (
    <div className="flex flex-col gap-5 max-w-[1280px]">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.1em] text-ink-3 font-semibold">Главная</div>
          <h1 className="serif text-[40px] leading-none tracking-tight text-ink mt-1">Добрый день, Алексей</h1>
        </div>
        <Link href="/add"><Button variant="brand">＋ Новая операция</Button></Link>
      </div>

      {/* Net worth + accounts grid */}
      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-4">
          <div className="text-[11px] uppercase tracking-[0.1em] text-ink-3 font-semibold">Общий капитал</div>
          <div className="serif text-[48px] tnum leading-none text-ink mt-1">
            {net ? fmtMoney(net.net_worth_minor, { cur: "₽" }) : "—"}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Pill variant="pos">↑ 4.2%</Pill>
            <span className="text-ink-3 text-[12px]">за 30 дней</span>
          </div>
        </Card>

        {accounts.slice(0, 3).map((a) => (
          <Card key={a.id} className="col-span-2.667" style={{ gridColumn: "span 2.667" } as any}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.1em] text-ink-3 font-semibold">{a.label}</div>
                <div className="mono text-[11px] text-ink-3 mt-0.5">··{a.last4}</div>
              </div>
              <span className="w-2 h-2 rounded-full" style={{ background: a.color }} />
            </div>
            <div className="serif text-[28px] tnum leading-none text-ink mt-2">
              {fmtMoney(a.balance_minor, { cur: CUR_SYMBOL[a.currency] || "₽" })}
            </div>
            <Sparkline values={[1, 1.02, 1.01, 1.04, 1.06, 1.05, 1.08]} width={140} height={28} color={a.color} />
          </Card>
        ))}
      </div>

      {/* Recent + categories */}
      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-8" flush>
          <div className="flex items-center justify-between px-5 py-4 border-b border-line">
            <div className="text-[13px] uppercase tracking-[0.04em] text-ink-2 font-semibold">Недавние операции</div>
            <button className="text-[12px] text-ink-3 hover:text-ink">Все →</button>
          </div>
          <table className="w-full text-[13px]">
            <tbody>
              {txs.map((t) => (
                <tr key={t.id} className="border-b border-line-2 last:border-0">
                  <td className="px-5 py-3 text-ink">{t.merchant || "—"}</td>
                  <td className="px-5 py-3 text-ink-3 mono text-[12px]">{new Date(t.occurred_at).toLocaleDateString("ru-RU")}</td>
                  <td className="px-5 py-3 text-ink-3 text-[12px]">{t.category_key || ""}</td>
                  <td className={"px-5 py-3 text-right tnum mono " + (t.amount_minor < 0 ? "text-ink" : "text-pos")}>
                    {fmtMoney(t.amount_minor, { cur: "₽", sign: true })}
                  </td>
                </tr>
              ))}
              {txs.length === 0 && (
                <tr><td className="px-5 py-6 text-ink-3 text-[12px]" colSpan={4}>Пока ничего нет — запусти <code className="mono">python -m app.seed</code></td></tr>
              )}
            </tbody>
          </table>
        </Card>

        <Card className="col-span-4">
          <div className="text-[13px] uppercase tracking-[0.04em] text-ink-2 font-semibold">Категории расходов</div>
          <div className="text-ink-3 text-[12px] -mt-2">Последние 30 дней</div>
          <div className="flex flex-col gap-2 mt-1">
            {cats.map((c) => {
              const w = Math.round((c.value_minor / totalSpend) * 100);
              return (
                <div key={c.key} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-ink">{c.label}</span>
                    <span className="mono tnum text-ink-2">{fmtMoney(c.value_minor)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-bg-sunken overflow-hidden">
                    <div style={{ width: `${w}%`, background: c.color_token }} className="h-full" />
                  </div>
                </div>
              );
            })}
            {cats.length === 0 && <div className="text-ink-3 text-[12px]">Нет данных за период</div>}
          </div>
        </Card>
      </div>
    </div>
  );
}
