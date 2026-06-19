// T-Finance · client-side store
// Single-user, all data in localStorage. Drop-in for the previous fetch-based
// api(): keeps the same signature so pages don't have to change.

const KEYS = {
  user: "tf_user",
  accounts: "tf_accounts",
  transactions: "tf_transactions",
  cards: "tf_cards",
  credits: "tf_credits",
  goals: "tf_goals",
  watchlist: "tf_watchlist",
  portfolio: "tf_portfolio",
  seeded: "tf_seeded_v1",
};

const isClient = typeof window !== "undefined";

function load<T>(key: string, fallback: T): T {
  if (!isClient) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch { return fallback; }
}
function save(key: string, val: unknown) {
  if (!isClient) return;
  window.localStorage.setItem(key, JSON.stringify(val));
  if (typeof window.__tfSchedulePush === "function") window.__tfSchedulePush();
}
function nextId<T extends { id: number }>(rows: T[]) {
  return rows.reduce((m, r) => Math.max(m, r.id), 0) + 1;
}

// ── types ─────────────────────────────────────────────────────────

export type User = { id: number; email: string; full_name: string; locale: string };
export type Account = {
  id: number; label: string; type: "debit" | "savings" | "fx" | "invest" | "credit";
  currency: string; balance_minor: number; last4: string; tier: string; color: string;
};
export type Tx = {
  id: number; account_id: number; amount_minor: number;
  direction: "inflow" | "outflow" | "transfer";
  merchant: string; note: string; is_recurring: boolean;
  occurred_at: string; category_key: string | null;
  transfer_group_id?: string | null;
};
export type Card = {
  id: number; account_id: number; type: "physical" | "virtual";
  status: "active" | "blocked" | "frozen" | "closed";
  label: string; last4: string; expiry: string | null; daily_limit_minor: number;
};
export type Credit = {
  id: number; product: string; principal_minor: number; rate_pct: number;
  term_months: number; status: string; monthly_payment_minor: number;
};
export type Goal = {
  id: number; label: string; target_minor: number; current_minor: number;
  due_date: string | null; currency: string;
};
export type Holding = { id: number; ticker: string; quantity: number; avg_price_minor: number };
export type Quote = {
  ticker: string; name: string; name_en: string; price_minor: number;
  currency: string; change_pct: number;
};

// ── categories (static) ───────────────────────────────────────────

export const CATEGORIES = [
  { key: "rent",          label: "Аренда",      color_token: "var(--c1)", kind: "expense" },
  { key: "food",          label: "Продукты",    color_token: "var(--c2)", kind: "expense" },
  { key: "transport",     label: "Транспорт",   color_token: "var(--c3)", kind: "expense" },
  { key: "entertainment", label: "Развлечения", color_token: "var(--c4)", kind: "expense" },
  { key: "services",      label: "Сервисы",     color_token: "var(--c5)", kind: "expense" },
  { key: "healthcare",    label: "Здоровье",    color_token: "var(--c6)", kind: "expense" },
  { key: "other",         label: "Прочее",      color_token: "var(--c7)", kind: "expense" },
  { key: "salary",        label: "Зарплата",    color_token: "var(--c1)", kind: "income" },
  { key: "freelance",     label: "Фриланс",     color_token: "var(--c2)", kind: "income" },
  { key: "dividends",     label: "Дивиденды",   color_token: "var(--c5)", kind: "income" },
];

// ── seed first-time ───────────────────────────────────────────────

const DEMO_TICKERS = ["SBER", "YNDX", "LKOH", "GAZP", "VTBR", "ROSN"];

function seedOnce() {
  if (!isClient) return;
  if (window.localStorage.getItem(KEYS.seeded) === "1") return;

  save(KEYS.user, { id: 1, email: "you@local", full_name: "", locale: "ru" });

  const now = new Date();
  const iso = (d: Date) => d.toISOString();

  const accounts: Account[] = [
    { id: 1, label: "Главный счёт", type: "debit",   currency: "RUB", balance_minor: 48_234_000,  last4: "4421", tier: "Black",   color: "var(--brand)" },
    { id: 2, label: "Накопительный", type: "savings", currency: "RUB", balance_minor: 124_000_000, last4: "8814", tier: "",        color: "var(--c2)" },
    { id: 3, label: "Брокерский",   type: "invest",  currency: "RUB", balance_minor: 61_240_000,  last4: "0341", tier: "",        color: "var(--c5)" },
  ];
  save(KEYS.accounts, accounts);

  const seedTx: Omit<Tx, "id">[] = [
    { account_id: 1, amount_minor: +21_000_000, direction: "inflow",  merchant: "Зарплата",     note: "", is_recurring: false, occurred_at: iso(new Date(now.getTime() - 1 * 3600_000)), category_key: "salary" },
    { account_id: 1, amount_minor: -124_000,    direction: "outflow", merchant: "Vkusvill",     note: "", is_recurring: false, occurred_at: iso(new Date(now.getTime() - 3 * 3600_000)), category_key: "food" },
    { account_id: 1, amount_minor: -39_900,     direction: "outflow", merchant: "Yandex Plus",  note: "", is_recurring: true,  occurred_at: iso(new Date(now.getTime() - 6 * 3600_000)), category_key: "services" },
    { account_id: 1, amount_minor: -345_000,    direction: "outflow", merchant: "Кафе Пушкин",  note: "", is_recurring: false, occurred_at: iso(new Date(now.getTime() - 25 * 3600_000)), category_key: "food" },
    { account_id: 1, amount_minor: -129_000,    direction: "outflow", merchant: "Apple.com",    note: "", is_recurring: false, occurred_at: iso(new Date(now.getTime() - 28 * 3600_000)), category_key: "entertainment" },
    { account_id: 1, amount_minor: -6_400,      direction: "outflow", merchant: "Метро",        note: "", is_recurring: false, occurred_at: iso(new Date(now.getTime() - 33 * 3600_000)), category_key: "transport" },
    { account_id: 1, amount_minor: -6_500_000,  direction: "outflow", merchant: "Аренда квартиры", note: "", is_recurring: true, occurred_at: iso(new Date(now.getTime() - 6 * 86400_000)), category_key: "rent" },
  ];
  save(KEYS.transactions, seedTx.map((t, i) => ({ ...t, id: i + 1 })));

  save(KEYS.cards, [] as Card[]);
  save(KEYS.credits, [] as Credit[]);
  save(KEYS.goals, [
    { id: 1, label: "Отпуск · Грузия", target_minor: 18_000_000, current_minor: 12_400_000, due_date: null, currency: "RUB" },
  ] as Goal[]);
  save(KEYS.watchlist, DEMO_TICKERS);
  save(KEYS.portfolio, [] as Holding[]);

  window.localStorage.setItem(KEYS.seeded, "1");
}

// ── MOEX quotes ───────────────────────────────────────────────────
// Бесплатное публичное API Московской биржи. CORS-friendly, без ключа.
// https://iss.moex.com/iss/reference/

const RUS_NAMES: Record<string, [string, string]> = {
  SBER: ["Сбер", "Sberbank"], YNDX: ["Яндекс", "Yandex"], LKOH: ["Лукойл", "Lukoil"],
  GAZP: ["Газпром", "Gazprom"], VTBR: ["ВТБ", "VTB"], ROSN: ["Роснефть", "Rosneft"],
  MGNT: ["Магнит", "Magnit"], MTSS: ["МТС", "MTS"], TCSG: ["TCS Group", "TCS Group"],
  NVTK: ["НОВАТЭК", "Novatek"], PLZL: ["Полюс", "Polyus"], MOEX: ["МосБиржа", "MOEX"],
};

export async function fetchMoexQuotes(tickers: string[]): Promise<Quote[]> {
  if (!tickers.length) return [];
  const url = `https://iss.moex.com/iss/engines/stock/markets/shares/boards/TQBR/securities.json?securities=${tickers.join(",")}&iss.meta=off`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json() as any;
    // data.marketdata.columns + .data
    const cols: string[] = data.marketdata.columns;
    const rows: any[][] = data.marketdata.data;
    const iSec  = cols.indexOf("SECID");
    const iLast = cols.indexOf("LAST");
    const iCh   = cols.indexOf("LASTTOPREVPRICE");

    const out: Quote[] = [];
    for (const r of rows) {
      const t = r[iSec] as string;
      const price = (r[iLast] as number) ?? 0;
      if (!price) continue;
      const names = RUS_NAMES[t] ?? [t, t];
      out.push({
        ticker: t,
        name: names[0],
        name_en: names[1],
        price_minor: Math.round(price * 100),
        currency: "RUB",
        change_pct: Number(r[iCh] ?? 0),
      });
    }
    return out;
  } catch {
    return [];
  }
}

// ── error type kept for page compatibility ───────────────────────

export class ApiError extends Error {
  constructor(public status: number, public body: unknown) { super(`API ${status}`); }
}

// ── shimmed auth helpers (no real auth; kept for page compat) ────

export function getToken(): string | null { return "local"; }
export function setTokens(_a: string, _r: string) {}
export function clearTokens() {
  if (!isClient) return;
  if (confirm("Стереть ВСЕ данные T-Finance с этого устройства?")) {
    Object.values(KEYS).forEach((k) => window.localStorage.removeItem(k));
    window.location.href = "/";
  }
}

// ── dispatcher: keeps fetch-like signature ───────────────────────

function delay<T>(value: T): Promise<T> {
  return new Promise((r) => setTimeout(() => r(value), 0));
}

export async function api<T = unknown>(
  path: string,
  opts: { method?: string; body?: any } = {}
): Promise<T> {
  if (!isClient) return delay(undefined as unknown as T);
  seedOnce();
  const method = (opts.method || "GET").toUpperCase();
  const m = path.match(/^([^?]+)(\?(.*))?$/);
  const route = m ? m[1] : path;
  const qs = new URLSearchParams(m && m[3] ? m[3] : "");

  // — auth shim
  if (route === "/auth/me") return delay(load(KEYS.user, { id: 1, email: "you@local", full_name: "", locale: "ru" }) as T);
  if (route === "/auth/login" || route === "/auth/register") {
    return delay({ access_token: "local", refresh_token: "local" } as unknown as T);
  }

  // — accounts
  if (route === "/accounts" && method === "GET") return delay(load<Account[]>(KEYS.accounts, []) as T);
  if (route === "/accounts" && method === "POST") {
    const rows = load<Account[]>(KEYS.accounts, []);
    const next: Account = {
      id: nextId(rows),
      label: opts.body.label, type: opts.body.type || "debit",
      currency: opts.body.currency || "RUB", balance_minor: 0,
      last4: opts.body.last4 || "", tier: opts.body.tier || "",
      color: opts.body.color || "var(--brand)",
    };
    rows.push(next); save(KEYS.accounts, rows);
    return delay(next as T);
  }
  const accMatch = route.match(/^\/accounts\/(\d+)$/);
  if (accMatch && method === "DELETE") {
    const id = parseInt(accMatch[1], 10);
    save(KEYS.accounts, load<Account[]>(KEYS.accounts, []).filter((a) => a.id !== id));
    return delay(undefined as unknown as T);
  }

  // — transactions
  if (route === "/transactions" && method === "GET") {
    const rows = load<Tx[]>(KEYS.transactions, []);
    const accId = qs.get("account_id");
    const limit = Math.min(parseInt(qs.get("limit") || "50", 10), 500);
    let out = rows;
    if (accId) out = out.filter((t) => t.account_id === parseInt(accId, 10));
    out = out.slice().sort((a, b) => b.occurred_at.localeCompare(a.occurred_at)).slice(0, limit);
    return delay(out as T);
  }
  if (route === "/transactions" && method === "POST") {
    const accounts = load<Account[]>(KEYS.accounts, []);
    const acc = accounts.find((a) => a.id === opts.body.account_id);
    if (!acc) throw new ApiError(404, { detail: "Account not found" });
    const rows = load<Tx[]>(KEYS.transactions, []);
    const tx: Tx = {
      id: nextId(rows),
      account_id: opts.body.account_id,
      amount_minor: opts.body.amount_minor,
      direction: opts.body.direction || (opts.body.amount_minor > 0 ? "inflow" : "outflow"),
      merchant: opts.body.merchant || "",
      note: opts.body.note || "",
      is_recurring: !!opts.body.is_recurring,
      occurred_at: opts.body.occurred_at || new Date().toISOString(),
      category_key: opts.body.category_key || null,
    };
    rows.push(tx);
    acc.balance_minor += tx.amount_minor;
    save(KEYS.transactions, rows); save(KEYS.accounts, accounts);
    return delay(tx as T);
  }
  const txMatch = route.match(/^\/transactions\/(\d+)$/);
  if (txMatch && method === "DELETE") {
    const id = parseInt(txMatch[1], 10);
    const rows = load<Tx[]>(KEYS.transactions, []);
    const tx = rows.find((t) => t.id === id);
    if (tx) {
      const accounts = load<Account[]>(KEYS.accounts, []);
      const acc = accounts.find((a) => a.id === tx.account_id);
      if (acc) { acc.balance_minor -= tx.amount_minor; save(KEYS.accounts, accounts); }
      save(KEYS.transactions, rows.filter((t) => t.id !== id));
    }
    return delay(undefined as unknown as T);
  }

  // — transfers
  if (route === "/transfers" && method === "POST") {
    const accounts = load<Account[]>(KEYS.accounts, []);
    const src = accounts.find((a) => a.id === opts.body.from_account_id);
    const dst = accounts.find((a) => a.id === opts.body.to_account_id);
    if (!src || !dst) throw new ApiError(404, { detail: "Account not found" });
    if (src.id === dst.id) throw new ApiError(400, { detail: "Same account" });
    if (src.balance_minor < opts.body.amount_minor) throw new ApiError(400, { detail: "Недостаточно средств" });
    const group = "t" + Date.now();
    const rows = load<Tx[]>(KEYS.transactions, []);
    const now = new Date().toISOString();
    const outTx: Tx = { id: nextId(rows), account_id: src.id, amount_minor: -opts.body.amount_minor, direction: "transfer", merchant: `→ ${dst.label}`, note: opts.body.note || "", is_recurring: false, occurred_at: now, category_key: null, transfer_group_id: group };
    rows.push(outTx);
    const inTx: Tx = { id: nextId(rows), account_id: dst.id, amount_minor: opts.body.amount_minor, direction: "transfer", merchant: `← ${src.label}`, note: opts.body.note || "", is_recurring: false, occurred_at: now, category_key: null, transfer_group_id: group };
    rows.push(inTx);
    src.balance_minor -= opts.body.amount_minor;
    dst.balance_minor += opts.body.amount_minor;
    save(KEYS.transactions, rows); save(KEYS.accounts, accounts);
    return delay({ group, from: src.id, to: dst.id, amount_minor: opts.body.amount_minor } as T);
  }

  // — analytics
  if (route === "/analytics/net-worth") {
    const accounts = load<Account[]>(KEYS.accounts, []);
    const total = accounts.reduce((s, a) => s + (a.currency === "RUB" ? a.balance_minor : 0), 0);
    return delay({ net_worth_minor: total, currency: "RUB" } as T);
  }
  if (route === "/analytics/categories") {
    const days = parseInt(qs.get("days") || "30", 10);
    const since = Date.now() - days * 86400_000;
    const rows = load<Tx[]>(KEYS.transactions, []).filter(
      (t) => t.amount_minor < 0 && t.category_key && new Date(t.occurred_at).getTime() >= since
    );
    const byKey = new Map<string, number>();
    rows.forEach((t) => byKey.set(t.category_key!, (byKey.get(t.category_key!) || 0) + -t.amount_minor));
    const out = Array.from(byKey.entries()).map(([key, value]) => {
      const c = CATEGORIES.find((cc) => cc.key === key);
      return { key, label: c?.label || key, color_token: c?.color_token || "var(--c7)", value_minor: value };
    }).sort((a, b) => b.value_minor - a.value_minor);
    return delay(out as T);
  }
  if (route === "/analytics/monthly") {
    const months = parseInt(qs.get("months") || "12", 10);
    const rows = load<Tx[]>(KEYS.transactions, []);
    const buckets = new Map<string, { inflow: number; outflow: number }>();
    const start = new Date(); start.setMonth(start.getMonth() - months + 1); start.setDate(1);
    for (let i = 0; i < months; i++) {
      const d = new Date(start); d.setMonth(start.getMonth() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      buckets.set(key, { inflow: 0, outflow: 0 });
    }
    rows.forEach((t) => {
      const d = new Date(t.occurred_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const b = buckets.get(key);
      if (!b) return;
      if (t.amount_minor > 0) b.inflow += t.amount_minor; else b.outflow += -t.amount_minor;
    });
    return delay(Array.from(buckets.entries()).map(([month, v]) => ({ month, inflow_minor: v.inflow, outflow_minor: v.outflow })) as T);
  }

  // — investments
  if (route === "/investments/watchlist") {
    const tickers = load<string[]>(KEYS.watchlist, DEMO_TICKERS);
    const quotes = await fetchMoexQuotes(tickers);
    return delay(quotes as T);
  }
  if (route === "/investments/quotes") {
    const quotes = await fetchMoexQuotes(DEMO_TICKERS);
    return delay(quotes as T);
  }
  if (route === "/investments/portfolio") return delay(load<Holding[]>(KEYS.portfolio, []) as T);

  const wlAdd = route.match(/^\/investments\/watchlist\/([A-Z0-9]+)$/);
  if (wlAdd && method === "POST") {
    const list = load<string[]>(KEYS.watchlist, []);
    if (!list.includes(wlAdd[1])) { list.push(wlAdd[1]); save(KEYS.watchlist, list); }
    return delay({ ok: true } as T);
  }
  if (wlAdd && method === "DELETE") {
    save(KEYS.watchlist, load<string[]>(KEYS.watchlist, []).filter((t) => t !== wlAdd[1]));
    return delay(undefined as unknown as T);
  }
  if (route === "/investments/trade" && method === "POST") {
    const port = load<Holding[]>(KEYS.portfolio, []);
    const quotes = await fetchMoexQuotes([opts.body.ticker]);
    const q = quotes[0];
    if (!q) throw new ApiError(404, { detail: "Тикер не найден" });
    const existing = port.find((h) => h.ticker === opts.body.ticker);
    if (opts.body.side === "buy") {
      if (existing) {
        const total = existing.avg_price_minor * existing.quantity + q.price_minor * opts.body.quantity;
        existing.quantity += opts.body.quantity;
        existing.avg_price_minor = Math.round(total / existing.quantity);
      } else {
        port.push({ id: nextId(port), ticker: opts.body.ticker, quantity: opts.body.quantity, avg_price_minor: q.price_minor });
      }
    } else {
      if (!existing || existing.quantity < opts.body.quantity) throw new ApiError(400, { detail: "Недостаточно акций" });
      existing.quantity -= opts.body.quantity;
      if (existing.quantity === 0) port.splice(port.indexOf(existing), 1);
    }
    save(KEYS.portfolio, port);
    return delay((existing || port[port.length - 1]) as T);
  }

  // — credits
  if (route === "/credits" && method === "GET") return delay(load<Credit[]>(KEYS.credits, []) as T);
  if (route === "/credits/apply" && method === "POST") {
    const RATES: Record<string, number> = { cash: 18.9, mortgage: 12.4, card: 23.5, deposit: -12.4 };
    const rate = RATES[opts.body.product];
    const months = opts.body.term_months;
    const principal = opts.body.principal_minor;
    const r = Math.abs(rate) / 100 / 12;
    const pmt = months > 0 && r > 0 ? Math.round(principal * r / (1 - Math.pow(1 + r, -months))) : Math.round(principal / months);
    const rows = load<Credit[]>(KEYS.credits, []);
    const c: Credit = { id: nextId(rows), product: opts.body.product, principal_minor: principal, rate_pct: rate, term_months: months, status: "pending", monthly_payment_minor: pmt };
    rows.push(c); save(KEYS.credits, rows);
    return delay(c as T);
  }

  // — goals
  if (route === "/goals" && method === "GET") return delay(load<Goal[]>(KEYS.goals, []) as T);
  if (route === "/goals" && method === "POST") {
    const rows = load<Goal[]>(KEYS.goals, []);
    const g: Goal = { id: nextId(rows), label: opts.body.label, target_minor: opts.body.target_minor, current_minor: opts.body.current_minor || 0, due_date: opts.body.due_date || null, currency: opts.body.currency || "RUB" };
    rows.push(g); save(KEYS.goals, rows);
    return delay(g as T);
  }

  throw new ApiError(404, { detail: `Route ${method} ${route} not implemented` });
}

// ── data export / import (manual backup) ─────────────────────────

export function exportData(): string {
  const blob: Record<string, unknown> = {};
  for (const k of Object.values(KEYS)) blob[k] = load(k, null);
  blob.__exported_at = new Date().toISOString();
  blob.__version = 1;
  return JSON.stringify(blob, null, 2);
}

export function importData(json: string) {
  const blob = JSON.parse(json);
  for (const k of Object.values(KEYS)) {
    if (blob[k] != null) save(k, blob[k]);
  }
  window.location.reload();
}

export function updateUser(patch: Partial<User>) {
  const u = load<User>(KEYS.user, { id: 1, email: "you@local", full_name: "", locale: "ru" });
  save(KEYS.user, { ...u, ...patch });
}
