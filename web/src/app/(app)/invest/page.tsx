"use client";
import { useEffect, useState } from "react";
import { api, ApiError, Quote, Holding } from "@/lib/api";
import { Card, Pill, Sparkline, Button } from "@/components/ui";
import { fmtMoney, CUR_SYMBOL, pct } from "@/lib/money";

export default function InvestPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [portfolio, setPortfolio] = useState<Holding[]>([]);
  const [adding, setAdding] = useState("");
  const [addErr, setAddErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function refresh() {
    setLoading(true);
    Promise.all([
      api<Quote[]>("/investments/watchlist"),
      api<Holding[]>("/investments/portfolio"),
    ]).then(([q, p]) => { setQuotes(q); setPortfolio(p); }).finally(() => setLoading(false));
  }

  useEffect(() => { refresh(); }, []);

  async function addTicker(e: React.FormEvent) {
    e.preventDefault();
    setAddErr(null);
    const t = adding.trim().toUpperCase();
    if (!t) return;
    await api(`/investments/watchlist/${t}`, { method: "POST" });
    setAdding("");
    refresh();
  }

  async function trade(ticker: string, side: "buy" | "sell") {
    const qty = parseFloat(prompt(`${side === "buy" ? "Купить" : "Продать"} ${ticker} — сколько штук?`) || "");
    if (!qty || qty <= 0) return;
    try {
      await api("/investments/trade", { method: "POST", body: { ticker, side, quantity: qty } });
      refresh();
    } catch (e) {
      alert(e instanceof ApiError ? (e.body as any)?.detail || "Ошибка" : "Ошибка");
    }
  }

  async function removeWatch(ticker: string) {
    if (!confirm(`Убрать ${ticker} из наблюдения?`)) return;
    await api(`/investments/watchlist/${ticker}`, { method: "DELETE" });
    refresh();
  }

  return (
    <div className="flex flex-col gap-5 max-w-[1280px]">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.1em] text-ink-3 font-semibold">Инструменты</div>
          <h1 className="serif text-[40px] leading-none tracking-tight text-ink mt-1">Инвестиции</h1>
          <div className="text-ink-3 text-[12px] mt-1">Котировки · Московская биржа (iss.moex.com)</div>
        </div>
        <form onSubmit={addTicker} className="flex gap-2">
          <input value={adding} onChange={(e) => setAdding(e.target.value.toUpperCase())}
            placeholder="Тикер, напр. MGNT"
            className="h-9 px-3 rounded-sm bg-bg-elev border border-line text-ink text-[13px] mono w-40" />
          <Button type="submit" variant="ghost">＋ В наблюдение</Button>
        </form>
      </div>

      {addErr && <div className="text-neg text-[12px]">{addErr}</div>}

      <Card flush>
        <div className="px-5 py-4 border-b border-line text-[13px] uppercase tracking-[0.04em] text-ink-2 font-semibold">
          Наблюдение
        </div>
        <table className="w-full text-[13px]">
          <tbody>
            {loading && <tr><td className="px-5 py-6 text-ink-3 text-[12px]" colSpan={6}>Загружаем котировки с MOEX…</td></tr>}
            {!loading && quotes.map((q) => (
              <tr key={q.ticker} className="border-b border-line-2 last:border-0">
                <td className="px-5 py-3"><span className="mono text-[12px] text-ink-3">{q.ticker}</span></td>
                <td className="px-5 py-3 text-ink">{q.name}</td>
                <td className="px-5 py-3 text-right tnum mono text-ink">
                  {fmtMoney(q.price_minor, { cur: CUR_SYMBOL[q.currency] || "₽", decimals: 2 })}
                </td>
                <td className="px-5 py-3 text-right">
                  <Pill variant={q.change_pct >= 0 ? "pos" : "neg"}>{pct(q.change_pct)}</Pill>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex gap-1.5 justify-end">
                    <Button size="sm" variant="ghost" onClick={() => trade(q.ticker, "buy")}>Купить</Button>
                    <Button size="sm" variant="ghost" onClick={() => trade(q.ticker, "sell")}>Продать</Button>
                    <Button size="sm" variant="ghost" onClick={() => removeWatch(q.ticker)}>×</Button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && quotes.length === 0 && (
              <tr><td className="px-5 py-6 text-ink-3 text-[12px]" colSpan={6}>
                Наблюдение пусто. Добавь тикер выше (например: SBER, LKOH, GAZP).
              </td></tr>
            )}
          </tbody>
        </table>
      </Card>

      <Card>
        <div className="text-[13px] uppercase tracking-[0.04em] text-ink-2 font-semibold">Портфель</div>
        {portfolio.length === 0 ? (
          <div className="text-ink-3 text-[12px]">Пока пусто. Нажми «Купить» в таблице выше.</div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {portfolio.map((h) => {
              const q = quotes.find((qq) => qq.ticker === h.ticker);
              const pnl = q ? (q.price_minor - h.avg_price_minor) * h.quantity : 0;
              return (
                <div key={h.id} className="p-3 rounded-sm border border-line bg-bg-elev">
                  <div className="flex items-center justify-between">
                    <div className="mono text-[11px] text-ink-3">{h.ticker}</div>
                    {q && <Pill variant={q.change_pct >= 0 ? "pos" : "neg"}>{pct(q.change_pct)}</Pill>}
                  </div>
                  <div className="text-ink mt-1.5 tnum">{h.quantity} шт.</div>
                  <div className="mono text-[11px] text-ink-3 mt-1">
                    средняя {fmtMoney(h.avg_price_minor, { decimals: 2 })}
                  </div>
                  {q && (
                    <div className={"mono text-[12px] tnum mt-1 " + (pnl >= 0 ? "text-pos" : "text-neg")}>
                      {fmtMoney(pnl, { sign: true })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
