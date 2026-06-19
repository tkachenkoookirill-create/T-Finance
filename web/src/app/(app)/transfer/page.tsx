"use client";
import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Card, Button } from "@/components/ui";
import { fmtMoney, CUR_SYMBOL } from "@/lib/money";

type Account = { id: number; label: string; currency: string; balance_minor: number; last4: string };

export default function TransferPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [from, setFrom] = useState<number | null>(null);
  const [to, setTo] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<Account[]>("/accounts").then((acc) => {
      setAccounts(acc);
      if (acc.length >= 1) setFrom(acc[0].id);
      if (acc.length >= 2) setTo(acc[1].id);
    });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!from || !to) return;
    const amount_minor = Math.round(parseFloat(amount) * 100);
    if (!amount_minor || amount_minor <= 0) return;
    setBusy(true); setMsg(null);
    try {
      await api("/transfers", { method: "POST", body: { from_account_id: from, to_account_id: to, amount_minor, note } });
      setMsg({ kind: "ok", text: "Перевод выполнен" });
      setAmount("");
      api<Account[]>("/accounts").then(setAccounts);
    } catch (e) {
      const text = e instanceof ApiError ? (e.body as any)?.detail || "Ошибка" : "Ошибка";
      setMsg({ kind: "err", text });
    } finally { setBusy(false); }
  }

  return (
    <div className="max-w-[640px] flex flex-col gap-5">
      <div>
        <div className="text-[11px] uppercase tracking-[0.1em] text-ink-3 font-semibold">Деньги</div>
        <h1 className="serif text-[40px] leading-none tracking-tight text-ink mt-1">Перевод между счетами</h1>
      </div>

      <Card>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-[0.1em] text-ink-3 font-semibold">Откуда</span>
            <select value={from ?? ""} onChange={(e) => setFrom(Number(e.target.value))}
              className="h-10 px-3 rounded-sm bg-bg border border-line text-ink text-[14px]">
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.label} — {fmtMoney(a.balance_minor, { cur: CUR_SYMBOL[a.currency] || "₽" })}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-[0.1em] text-ink-3 font-semibold">Куда</span>
            <select value={to ?? ""} onChange={(e) => setTo(Number(e.target.value))}
              className="h-10 px-3 rounded-sm bg-bg border border-line text-ink text-[14px]">
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-[0.1em] text-ink-3 font-semibold">Сумма</span>
            <input type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)}
              className="h-12 px-3 rounded-sm bg-bg border border-line text-ink text-[24px] tnum mono" placeholder="0,00" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-[0.1em] text-ink-3 font-semibold">Комментарий</span>
            <input value={note} onChange={(e) => setNote(e.target.value)}
              className="h-10 px-3 rounded-sm bg-bg border border-line text-ink text-[14px]" />
          </label>
          {msg && <div className={msg.kind === "ok" ? "text-pos text-[13px]" : "text-neg text-[13px]"}>{msg.text}</div>}
          <Button type="submit" variant="brand" disabled={busy} className="h-10 justify-center">
            {busy ? "..." : "Перевести"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
