"use client";
import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Card, Button, Pill } from "@/components/ui";
import { fmtMoney } from "@/lib/money";

type Credit = { id: number; product: string; principal_minor: number; rate_pct: number; term_months: number; status: string; monthly_payment_minor: number };

const PRODUCTS = [
  { key: "cash",     label: "Потребительский", rate: 18.9 },
  { key: "mortgage", label: "Ипотека",         rate: 12.4 },
  { key: "card",     label: "Кредитка",        rate: 23.5 },
  { key: "deposit",  label: "Вклад",           rate: -12.4 },
];

export default function CreditPage() {
  const [items, setItems] = useState<Credit[]>([]);
  const [product, setProduct] = useState("cash");
  const [amount, setAmount] = useState("300000");
  const [months, setMonths] = useState("24");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => { api<Credit[]>("/credits").then(setItems); }, []);

  async function apply(e: React.FormEvent) {
    e.preventDefault();
    try {
      const c = await api<Credit>("/credits/apply", {
        method: "POST",
        body: { product, principal_minor: Math.round(parseFloat(amount) * 100), term_months: parseInt(months, 10) },
      });
      setItems((s) => [c, ...s]);
      setMsg("Заявка отправлена");
    } catch (e) {
      setMsg(e instanceof ApiError ? (e.body as any)?.detail || "Ошибка" : "Ошибка");
    }
  }

  return (
    <div className="flex flex-col gap-5 max-w-[1100px]">
      <div>
        <div className="text-[11px] uppercase tracking-[0.1em] text-ink-3 font-semibold">Инструменты</div>
        <h1 className="serif text-[40px] leading-none tracking-tight text-ink mt-1">Кредиты и вклады</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <div className="text-[13px] uppercase tracking-[0.04em] text-ink-2 font-semibold">Подать заявку</div>
          <form onSubmit={apply} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-[0.1em] text-ink-3 font-semibold">Продукт</span>
              <select value={product} onChange={(e) => setProduct(e.target.value)}
                className="h-10 px-3 rounded-sm bg-bg border border-line text-ink text-[14px]">
                {PRODUCTS.map((p) => <option key={p.key} value={p.key}>{p.label} · {p.rate}%</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-[0.1em] text-ink-3 font-semibold">Сумма, ₽</span>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                className="h-10 px-3 rounded-sm bg-bg border border-line text-ink mono tnum" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-[0.1em] text-ink-3 font-semibold">Срок, мес.</span>
              <input type="number" value={months} onChange={(e) => setMonths(e.target.value)}
                className="h-10 px-3 rounded-sm bg-bg border border-line text-ink mono tnum" />
            </label>
            {msg && <div className="text-pos text-[12px]">{msg}</div>}
            <Button type="submit" variant="brand" className="h-10 justify-center">Отправить заявку</Button>
          </form>
        </Card>

        <Card flush>
          <div className="px-5 py-4 border-b border-line text-[13px] uppercase tracking-[0.04em] text-ink-2 font-semibold">
            Мои заявки
          </div>
          {items.length === 0 ? <div className="p-5 text-ink-3 text-[12px]">Заявок нет</div> : (
            <table className="w-full text-[13px]">
              <tbody>
                {items.map((c) => (
                  <tr key={c.id} className="border-b border-line-2 last:border-0">
                    <td className="px-5 py-3 text-ink">{c.product}</td>
                    <td className="px-5 py-3 mono tnum text-ink-2">{fmtMoney(c.principal_minor)} · {c.term_months} мес.</td>
                    <td className="px-5 py-3 mono tnum text-ink-3">{c.rate_pct}%</td>
                    <td className="px-5 py-3"><Pill>{c.status}</Pill></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
}
