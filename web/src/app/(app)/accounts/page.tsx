"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, Button, Pill } from "@/components/ui";
import { fmtMoney, CUR_SYMBOL } from "@/lib/money";

type Account = { id: number; label: string; type: string; currency: string; balance_minor: number; last4: string; color: string; tier: string };

export default function AccountsPage() {
  const [items, setItems] = useState<Account[]>([]);
  useEffect(() => { api<Account[]>("/accounts").then(setItems).catch(console.error); }, []);

  return (
    <div className="flex flex-col gap-5 max-w-[1280px]">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.1em] text-ink-3 font-semibold">Деньги</div>
          <h1 className="serif text-[40px] leading-none tracking-tight text-ink mt-1">Счета и карты</h1>
        </div>
        <Button variant="brand">＋ Новый счёт</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((a) => (
          <Card key={a.id}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.1em] text-ink-3 font-semibold">{a.label}</div>
                <div className="mono text-[11px] text-ink-3 mt-0.5">··{a.last4} · {a.type}</div>
              </div>
              {a.tier && <Pill variant="brand">{a.tier}</Pill>}
            </div>
            <div className="serif text-[32px] tnum leading-none text-ink mt-2">
              {fmtMoney(a.balance_minor, { cur: CUR_SYMBOL[a.currency] || "₽" })}
            </div>
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="ghost">Пополнить</Button>
              <Button size="sm" variant="ghost">Перевести</Button>
              <Button size="sm" variant="ghost">Реквизиты</Button>
            </div>
          </Card>
        ))}
        {items.length === 0 && <Card><div className="text-ink-3 text-[13px]">Счетов пока нет. Создай первый.</div></Card>}
      </div>
    </div>
  );
}
