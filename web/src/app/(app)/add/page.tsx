"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError, Account } from "@/lib/api";
import { Card, Button } from "@/components/ui";
import { fmtMoney, CUR_SYMBOL } from "@/lib/money";

const CATS = [
  { key: "food", label: "Продукты" },
  { key: "rent", label: "Аренда" },
  { key: "transport", label: "Транспорт" },
  { key: "entertainment", label: "Развлечения" },
  { key: "services", label: "Сервисы" },
  { key: "healthcare", label: "Здоровье" },
  { key: "other", label: "Прочее" },
  { key: "salary", label: "Зарплата" },
  { key: "freelance", label: "Фриланс" },
  { key: "dividends", label: "Дивиденды" },
];

export default function AddPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountId, setAccountId] = useState<number | null>(null);
  const [sign, setSign] = useState<"-" | "+">("-");
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [category, setCategory] = useState("food");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api<Account[]>("/accounts").then((a) => {
      setAccounts(a);
      if (a[0]) setAccountId(a[0].id);
    });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!accountId) return;
    const major = parseFloat(amount.replace(",", "."));
    if (!major || major <= 0) return;
    const amount_minor = Math.round(major * 100) * (sign === "-" ? -1 : 1);
    setBusy(true); setErr(null);
    try {
      await api("/transactions", {
        method: "POST",
        body: {
          account_id: accountId,
          amount_minor,
          direction: sign === "+" ? "inflow" : "outflow",
          merchant,
          category_key: category,
          occurred_at: new Date(date + "T12:00:00").toISOString(),
        },
      });
      router.push("/dashboard");
    } catch (e) {
      setErr(e instanceof ApiError ? (e.body as any)?.detail || "Ошибка" : "Ошибка");
    } finally { setBusy(false); }
  }

  return (
    <div className="max-w-[640px] flex flex-col gap-5">
      <div>
        <div className="text-[11px] uppercase tracking-[0.1em] text-ink-3 font-semibold">Новая операция</div>
        <h1 className="serif text-[40px] leading-none tracking-tight text-ink mt-1">Запись</h1>
      </div>

      <Card>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex gap-2">
            <button type="button" onClick={() => setSign("-")}
              className={"flex-1 h-10 rounded-sm border text-[13px] font-semibold " + (sign === "-" ? "bg-neg/10 text-neg border-neg/40" : "border-line text-ink-3")}>
              − Расход
            </button>
            <button type="button" onClick={() => setSign("+")}
              className={"flex-1 h-10 rounded-sm border text-[13px] font-semibold " + (sign === "+" ? "bg-pos/10 text-pos border-pos/40" : "border-line text-ink-3")}>
              + Доход
            </button>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-[0.1em] text-ink-3 font-semibold">Сумма</span>
            <input
              type="text" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="h-14 px-3 rounded-sm bg-bg border border-line text-ink text-[28px] tnum mono focus:outline-none focus:border-brand"
              autoFocus
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-[0.1em] text-ink-3 font-semibold">Счёт</span>
            <select value={accountId ?? ""} onChange={(e) => setAccountId(Number(e.target.value))}
              className="h-10 px-3 rounded-sm bg-bg border border-line text-ink text-[14px]">
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label} — {fmtMoney(a.balance_minor, { cur: CUR_SYMBOL[a.currency] || "₽" })}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-[0.1em] text-ink-3 font-semibold">Что / где</span>
            <input value={merchant} onChange={(e) => setMerchant(e.target.value)}
              placeholder="Пятёрочка, Яндекс Такси, …"
              className="h-10 px-3 rounded-sm bg-bg border border-line text-ink text-[14px] focus:outline-none focus:border-brand" />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-[0.1em] text-ink-3 font-semibold">Категория</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="h-10 px-3 rounded-sm bg-bg border border-line text-ink text-[14px]">
                {CATS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-[0.1em] text-ink-3 font-semibold">Дата</span>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="h-10 px-3 rounded-sm bg-bg border border-line text-ink text-[14px] mono" />
            </label>
          </div>

          {err && <div className="text-neg text-[13px]">{err}</div>}

          <div className="flex gap-2 mt-2">
            <Button type="submit" variant="brand" disabled={busy} className="h-10 justify-center flex-1">
              {busy ? "..." : "Записать"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.back()} className="h-10 justify-center">
              Отмена
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
