// T-Finance · standalone store. All data in localStorage. No server.
(function () {
  const KEYS = {
    user: "tf_user",
    accounts: "tf_accounts",
    transactions: "tf_transactions",
    goals: "tf_goals",
    seeded: "tf_seeded_v1",
  };

  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch { return fallback; }
  }
  function save(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
  function nextId(rows) { return rows.reduce((m, r) => Math.max(m, r.id), 0) + 1; }

  const CATEGORIES = [
    // ── доходы ──
    { key: "salary",        label: "Основная зарплата",   color: "var(--c1)", kind: "income" },
    { key: "freelance",     label: "Подработка",          color: "var(--c2)", kind: "income" },
    { key: "dividends",     label: "Дивиденды",           color: "var(--c5)", kind: "income" },
    { key: "other_income",  label: "Прочие доходы",       color: "var(--c3)", kind: "income" },
    // ── расходы ──  essential = обязательный/фиксированный · impulse = спонтанный
    { key: "rent",          label: "Аренда / ипотека",    color: "var(--c1)", kind: "expense", essential: true,  impulse: false },
    { key: "food",          label: "Продукты",            color: "var(--c2)", kind: "expense", essential: true,  impulse: false },
    { key: "taxi",          label: "Такси",               color: "var(--c3)", kind: "expense", essential: false, impulse: true  },
    { key: "transport",     label: "Автобус / метро",     color: "var(--c3)", kind: "expense", essential: true,  impulse: false },
    { key: "utilities",     label: "Коммунальные услуги", color: "var(--c4)", kind: "expense", essential: true,  impulse: false },
    { key: "communication", label: "Связь / интернет",    color: "var(--c6)", kind: "expense", essential: true,  impulse: false },
    { key: "restaurants",   label: "Рестораны / кафе",    color: "var(--c3)", kind: "expense", essential: false, impulse: true  },
    { key: "clothing",      label: "Одежда / обувь",      color: "var(--c5)", kind: "expense", essential: false, impulse: true  },
    { key: "healthcare",    label: "Здоровье / медицина", color: "var(--c6)", kind: "expense", essential: true,  impulse: false },
    { key: "gym",           label: "Спортзал",            color: "var(--c1)", kind: "expense", essential: false, impulse: false },
    { key: "sport",         label: "Спорт",               color: "var(--c1)", kind: "expense", essential: false, impulse: false, hidden: true },
    { key: "education",     label: "Образование",         color: "var(--c2)", kind: "expense", essential: false, impulse: false },
    { key: "entertainment", label: "Развлечения",         color: "var(--c4)", kind: "expense", essential: false, impulse: true  },
    { key: "travel",        label: "Путешествия",         color: "var(--c2)", kind: "expense", essential: false, impulse: true  },
    { key: "other",         label: "Прочие расходы",      color: "var(--c7)", kind: "expense", essential: false, impulse: true  },
    { key: "services",      label: "Сервисы",             color: "var(--c5)", kind: "expense", essential: true,  impulse: false },
  ];

  const ACCOUNT_COLORS = ["var(--brand)", "var(--c2)", "var(--c3)", "var(--c4)", "var(--c5)", "var(--c6)"];

  function seedOnce() {
    if (localStorage.getItem(KEYS.seeded) === "1") return;
    save(KEYS.user, { full_name: "" });
    save(KEYS.accounts, [
      { id: 1, label: "Наличные",       type: "cash",    currency: "UZS", balance_minor: 0, color: "var(--brand)" },
      { id: 2, label: "Карта",          type: "debit",   currency: "UZS", balance_minor: 0, color: "var(--c2)" },
      { id: 3, label: "Накопительный",  type: "savings", currency: "UZS", balance_minor: 0, color: "var(--c6)" },
    ]);
    save(KEYS.transactions, []);
    save(KEYS.goals, []);
    localStorage.setItem(KEYS.seeded, "1");
  }

  // ── accounts ──────────────────────────────────────────────
  function getAccounts() { return load(KEYS.accounts, []); }
  function addAccount({ label, type, currency, color, opening }) {
    const rows = getAccounts();
    const acc = {
      id: nextId(rows),
      label: label || "Счёт",
      type: type || "debit",
      currency: currency || "UZS",
      balance_minor: 0,
      color: color || ACCOUNT_COLORS[rows.length % ACCOUNT_COLORS.length],
    };
    rows.push(acc);
    save(KEYS.accounts, rows);
    // opening balance recorded as an adjustment transaction so it shows in history
    if (opening) {
      addTransaction({
        account_id: acc.id, amount_minor: opening,
        direction: opening > 0 ? "inflow" : "outflow",
        merchant: "Начальный остаток", category_key: opening > 0 ? "other" : "other",
        occurred_at: new Date().toISOString(), opening: true,
      });
    }
    return acc;
  }
  function updateAccount(id, patch) {
    const rows = getAccounts();
    const a = rows.find((x) => x.id === id);
    if (a) { Object.assign(a, patch); save(KEYS.accounts, rows); }
    return a;
  }
  function deleteAccount(id) {
    save(KEYS.accounts, getAccounts().filter((a) => a.id !== id));
    save(KEYS.transactions, getTransactions().filter((t) => t.account_id !== id));
  }

  // ── transactions ──────────────────────────────────────────
  function getTransactions() { return load(KEYS.transactions, []); }
  function addTransaction(body) {
    const accounts = getAccounts();
    const acc = accounts.find((a) => a.id === body.account_id);
    if (!acc) throw new Error("Счёт не найден");
    const rows = getTransactions();
    const tx = {
      id: nextId(rows),
      account_id: body.account_id,
      amount_minor: body.amount_minor,
      direction: body.direction || (body.amount_minor > 0 ? "inflow" : "outflow"),
      merchant: body.merchant || "",
      note: body.note || "",
      occurred_at: body.occurred_at || new Date().toISOString(),
      category_key: body.category_key || null,
      transfer_group_id: body.transfer_group_id || null,
      opening: !!body.opening,
    };
    rows.push(tx);
    acc.balance_minor += tx.amount_minor;
    save(KEYS.transactions, rows);
    save(KEYS.accounts, accounts);
    return tx;
  }
  function updateTransaction(id, patch) {
    const rows = getTransactions();
    const tx = rows.find((t) => t.id === id);
    if (!tx) return;
    if (tx.transfer_group_id) return; // переводы редактируются только удалением
    const accounts = getAccounts();
    // откатываем прежнее влияние на баланс
    const oldAcc = accounts.find((a) => a.id === tx.account_id);
    if (oldAcc) oldAcc.balance_minor -= tx.amount_minor;
    // применяем изменения
    const allowed = ["account_id", "amount_minor", "direction", "merchant", "note", "occurred_at", "category_key"];
    allowed.forEach((k) => { if (k in patch) tx[k] = patch[k]; });
    // применяем новое влияние на баланс
    const newAcc = accounts.find((a) => a.id === tx.account_id);
    if (newAcc) newAcc.balance_minor += tx.amount_minor;
    save(KEYS.transactions, rows);
    save(KEYS.accounts, accounts);
    return tx;
  }
  function deleteTransaction(id) {
    const rows = getTransactions();
    const tx = rows.find((t) => t.id === id);
    if (!tx) return;
    const toRemove = tx.transfer_group_id
      ? rows.filter((t) => t.transfer_group_id === tx.transfer_group_id)
      : [tx];
    const accounts = getAccounts();
    toRemove.forEach((t) => {
      const acc = accounts.find((a) => a.id === t.account_id);
      if (acc) acc.balance_minor -= t.amount_minor;
    });
    const ids = new Set(toRemove.map((t) => t.id));
    save(KEYS.transactions, rows.filter((t) => !ids.has(t.id)));
    save(KEYS.accounts, accounts);
  }

  // ── transfers ─────────────────────────────────────────────
  function transfer({ from_account_id, to_account_id, amount_minor, note }) {
    const accounts = getAccounts();
    const src = accounts.find((a) => a.id === from_account_id);
    const dst = accounts.find((a) => a.id === to_account_id);
    if (!src || !dst) throw new Error("Счёт не найден");
    if (src.id === dst.id) throw new Error("Один и тот же счёт");
    const group = "t" + Date.now();
    const now = new Date().toISOString();
    addTransaction({ account_id: src.id, amount_minor: -amount_minor, direction: "transfer", merchant: "→ " + dst.label, note, occurred_at: now, transfer_group_id: group });
    addTransaction({ account_id: dst.id, amount_minor: amount_minor, direction: "transfer", merchant: "← " + src.label, note, occurred_at: now, transfer_group_id: group });
    return group;
  }

  // ── goals ─────────────────────────────────────────────────
  function getGoals() { return load(KEYS.goals, []); }
  function addGoal({ label, target_minor, current_minor, due_date }) {
    const rows = getGoals();
    const g = { id: nextId(rows), label, target_minor, current_minor: current_minor || 0, due_date: due_date || null };
    rows.push(g); save(KEYS.goals, rows); return g;
  }
  function updateGoal(id, patch) {
    const rows = getGoals();
    const g = rows.find((x) => x.id === id);
    if (g) { Object.assign(g, patch); save(KEYS.goals, rows); }
    return g;
  }
  function deleteGoal(id) { save(KEYS.goals, getGoals().filter((g) => g.id !== id)); }

  // ── analytics ─────────────────────────────────────────────
  function netWorth() {
    return getAccounts().reduce((s, a) => s + a.balance_minor, 0);
  }
  function monthFlow(d = new Date()) {
    const y = d.getFullYear(), m = d.getMonth();
    let inflow = 0, outflow = 0;
    getTransactions().forEach((t) => {
      if (t.direction === "transfer" || t.opening) return;
      const td = new Date(t.occurred_at);
      if (td.getFullYear() !== y || td.getMonth() !== m) return;
      if (t.amount_minor > 0) inflow += t.amount_minor; else outflow += -t.amount_minor;
    });
    return { inflow, outflow };
  }
  function categoryBreakdown(days = 30) {
    const since = Date.now() - days * 86400000;
    const byKey = new Map();
    getTransactions().forEach((t) => {
      if (t.amount_minor >= 0 || !t.category_key || t.opening) return;
      if (new Date(t.occurred_at).getTime() < since) return;
      byKey.set(t.category_key, (byKey.get(t.category_key) || 0) + -t.amount_minor);
    });
    return Array.from(byKey.entries()).map(([key, value]) => {
      const c = CATEGORIES.find((cc) => cc.key === key);
      return { key, label: c ? c.label : key, color: c ? c.color : "var(--c7)", value_minor: value };
    }).sort((a, b) => b.value_minor - a.value_minor);
  }
  function monthlySeries(months = 6) {
    const buckets = [];
    const start = new Date(); start.setDate(1); start.setMonth(start.getMonth() - months + 1);
    for (let i = 0; i < months; i++) {
      const d = new Date(start); d.setMonth(start.getMonth() + i);
      buckets.push({ y: d.getFullYear(), m: d.getMonth(), inflow: 0, outflow: 0 });
    }
    getTransactions().forEach((t) => {
      if (t.direction === "transfer" || t.opening) return;
      const d = new Date(t.occurred_at);
      const b = buckets.find((x) => x.y === d.getFullYear() && x.m === d.getMonth());
      if (!b) return;
      if (t.amount_minor > 0) b.inflow += t.amount_minor; else b.outflow += -t.amount_minor;
    });
    return buckets;
  }

  // ── advanced analytics ────────────────────────────────────
  function txClean() {
    return getTransactions().filter((t) => t.direction !== "transfer" && !t.opening);
  }
  function liquidAssets() {
    return getAccounts().filter((a) => a.type !== "credit").reduce((s, a) => s + Math.max(0, a.balance_minor), 0);
  }
  function avgMonthlyExpense(months = 3) {
    const s = monthlySeries(months);
    return s.reduce((a, b) => a + b.outflow, 0) / months;
  }

  // 1 · скользящее среднее расходов
  function movingAverage(months = 6, win = 3) {
    const all = monthlySeries(months + win - 1);
    const out = [];
    for (let i = win - 1; i < all.length; i++) {
      const slice = all.slice(i - win + 1, i + 1);
      const avg = slice.reduce((s, b) => s + b.outflow, 0) / win;
      out.push({ y: all[i].y, m: all[i].m, outflow: all[i].outflow, avg });
    }
    return out;
  }

  // 2 · MoM / YoY
  function momYoY() {
    const now = new Date();
    const rows = txClean();
    function spendFor(y, m) {
      let inf = 0, out = 0;
      rows.forEach((t) => {
        const d = new Date(t.occurred_at);
        if (d.getFullYear() === y && d.getMonth() === m) {
          if (t.amount_minor > 0) inf += t.amount_minor; else out += -t.amount_minor;
        }
      });
      return { inf, out };
    }
    const cur = spendFor(now.getFullYear(), now.getMonth());
    const pm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prev = spendFor(pm.getFullYear(), pm.getMonth());
    const prevY = spendFor(now.getFullYear() - 1, now.getMonth());
    const pct = (a, b) => (b > 0 ? (a - b) / b * 100 : null);
    return {
      spend: { cur: cur.out, prevM: prev.out, prevY: prevY.out, mom: pct(cur.out, prev.out), yoy: pct(cur.out, prevY.out) },
      income: { cur: cur.inf, prevM: prev.inf, prevY: prevY.inf, mom: pct(cur.inf, prev.inf), yoy: pct(cur.inf, prevY.inf) },
    };
  }

  // 3 · тепловая карта дней
  function dayHeatmap(days = 90) {
    const since = Date.now() - days * 86400000;
    const weekday = Array(7).fill(0);     // 0 = Пн … 6 = Вс
    const dom = Array(31).fill(0);        // число месяца
    txClean().forEach((t) => {
      if (t.amount_minor >= 0) return;
      const d = new Date(t.occurred_at);
      if (d.getTime() < since) return;
      weekday[(d.getDay() + 6) % 7] += -t.amount_minor;
      dom[d.getDate() - 1] += -t.amount_minor;
    });
    return { weekday, dom };
  }

  // 4 · норма сбережений — считаем только то, что реально ушло на накопительные счета
  function savingsRate(months = 3) {
    const s = monthlySeries(months);
    const income = s.reduce((a, b) => a + b.inflow, 0);
    const expense = s.reduce((a, b) => a + b.outflow, 0);
    const savingsIds = new Set(getAccounts().filter((a) => a.type === "savings").map((a) => a.id));
    const start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(1); start.setMonth(start.getMonth() - months + 1);
    let saved = 0; // чистый приток на накопительные счета за период (переводы тоже считаются)
    getTransactions().forEach((t) => {
      if (t.opening || !savingsIds.has(t.account_id)) return;
      if (new Date(t.occurred_at) < start) return;
      saved += t.amount_minor;
    });
    return { income, expense, saved, hasSavings: savingsIds.size > 0, rate: income > 0 ? saved / income * 100 : null };
  }

  // 5 · финансовый runway
  function runway() {
    const liquid = liquidAssets();
    const avg = avgMonthlyExpense(3);
    return { liquid, avgExpense: avg, months: avg > 0 ? liquid / avg : null };
  }

  // 6 · импульс vs план  ·  9 · фикс vs переменные
  function expenseSplit(days = 90) {
    const since = Date.now() - days * 86400000;
    let fixed = 0, variable = 0, impulse = 0, planned = 0;
    txClean().forEach((t) => {
      if (t.amount_minor >= 0) return;
      if (new Date(t.occurred_at).getTime() < since) return;
      const c = CATEGORIES.find((cc) => cc.key === t.category_key);
      const amt = -t.amount_minor;
      if (c && c.essential) fixed += amt; else variable += amt;
      if (c && c.impulse) impulse += amt; else planned += amt;
    });
    return { fixed, variable, impulse, planned, total: fixed + variable };
  }

  // 7 · подушка безопасности
  function emergencyFund() {
    const liquid = liquidAssets();
    const avg = avgMonthlyExpense(3);
    return { liquid, avgExpense: avg, months: avg > 0 ? liquid / avg : null, target3: avg * 3, target6: avg * 6 };
  }

  // 10 · концентрация дохода
  function incomeSources(days = 180) {
    const since = Date.now() - days * 86400000;
    const byKey = new Map();
    txClean().forEach((t) => {
      if (t.amount_minor <= 0) return;
      if (new Date(t.occurred_at).getTime() < since) return;
      const key = t.category_key || "other_income";
      byKey.set(key, (byKey.get(key) || 0) + t.amount_minor);
    });
    const total = Array.from(byKey.values()).reduce((a, b) => a + b, 0) || 1;
    const sources = Array.from(byKey.entries()).map(([key, v]) => {
      const c = CATEGORIES.find((cc) => cc.key === key);
      return { key, label: c ? c.label : key, color: c ? c.color : "var(--c7)", value: v, share: v / total * 100 };
    }).sort((a, b) => b.value - a.value);
    const hhi = sources.reduce((s, x) => s + Math.pow(x.share, 2), 0); // 0..10000
    return { sources, total, topShare: sources[0] ? sources[0].share : 0, hhi, count: sources.length };
  }

  // 11 · прогноз расходов
  function forecastSpend() {
    const s = monthlySeries(6);
    const completed = s.slice(0, -1);
    const basis = completed.slice(-3).filter((b) => b.outflow > 0);
    if (basis.length === 0) return { predicted: null };
    const avg = basis.reduce((a, b) => a + b.outflow, 0) / basis.length;
    let trend = 0;
    if (basis.length >= 2) trend = (basis[basis.length - 1].outflow - basis[0].outflow) / (basis.length - 1);
    return {
      predicted: Math.max(0, avg + trend / 2),
      min: Math.min(...basis.map((b) => b.outflow)),
      max: Math.max(...basis.map((b) => b.outflow)),
      avg, basisMonths: basis.length,
    };
  }

  // 12 · симулятор целей
  function simulateGoal(targetMinor, currentMinor, monthlyMinor, annualRatePct = 0) {
    if (targetMinor - currentMinor <= 0) return { months: 0, done: true };
    if (monthlyMinor <= 0) return { months: null };
    const r = annualRatePct / 100 / 12;
    let bal = currentMinor, months = 0;
    while (bal < targetMinor && months < 1200) { bal = bal * (1 + r) + monthlyMinor; months++; }
    return { months: months >= 1200 ? null : months, done: false };
  }

  // 13 · детектор подписок
  function detectSubscriptions() {
    const groups = new Map();
    txClean().forEach((t) => {
      if (t.amount_minor >= 0) return;
      const name = (t.merchant || "").trim().toLowerCase();
      if (!name) return;
      if (!groups.has(name)) groups.set(name, []);
      groups.get(name).push(t);
    });
    const subs = [];
    groups.forEach((list) => {
      if (list.length < 2) return;
      const months = new Set(list.map((t) => { const d = new Date(t.occurred_at); return d.getFullYear() + "-" + d.getMonth(); }));
      if (months.size < 2) return;
      const amts = list.map((t) => -t.amount_minor);
      const mean = amts.reduce((a, b) => a + b, 0) / amts.length;
      if (Math.max(...amts.map((a) => Math.abs(a - mean))) / mean > 0.25) return;
      const c = CATEGORIES.find((cc) => cc.key === list[0].category_key);
      subs.push({ name: list[0].merchant, amount: Math.round(mean), count: list.length, monthsSpan: months.size, annual: Math.round(mean * 12), color: c ? c.color : "var(--c7)", catKey: list[0].category_key });
    });
    subs.sort((a, b) => b.annual - a.annual);
    return { subs, annualTotal: subs.reduce((s, x) => s + x.annual, 0) };
  }

  // 14 · Net Worth во времени (точно — кумулятивная сумма операций)
  function netWorthSeries(months = 12) {
    const all = getTransactions().slice().sort((a, b) => a.occurred_at.localeCompare(b.occurred_at));
    const buckets = [];
    const start = new Date(); start.setDate(1); start.setMonth(start.getMonth() - months + 1);
    for (let i = 0; i < months; i++) {
      const d = new Date(start); d.setMonth(start.getMonth() + i);
      buckets.push({ y: d.getFullYear(), m: d.getMonth(), end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59), value: 0 });
    }
    let running = 0, ti = 0;
    for (const b of buckets) {
      while (ti < all.length && new Date(all[ti].occurred_at) <= b.end) { running += all[ti].amount_minor; ti++; }
      b.value = running;
    }
    return buckets;
  }

  // 15 · долговая нагрузка
  function debtLoad() {
    const credit = getAccounts().filter((a) => a.type === "credit");
    const debt = credit.reduce((s, a) => s + Math.max(0, -a.balance_minor), 0);
    const avgIncome = monthlySeries(3).reduce((a, b) => a + b.inflow, 0) / 3;
    return { hasCredit: credit.length > 0, debt, avgMonthlyIncome: avgIncome, dti: avgIncome * 12 > 0 ? debt / (avgIncome * 12) * 100 : null };
  }

  // 16 · поправка на инфляцию
  function inflationImpact(annualRatePct = 10) {
    const liquid = liquidAssets();
    const realIn1y = liquid / (1 + annualRatePct / 100);
    const series = netWorthSeries(13);
    const nowNW = series[series.length - 1].value;
    const yearAgoNW = series[0].value;
    const growthPct = yearAgoNW !== 0 ? (nowNW - yearAgoNW) / Math.abs(yearAgoNW) * 100 : null;
    return { liquid, annualRatePct, realIn1y, erosion: liquid - realIn1y, growthPct, beatsInflation: growthPct != null ? growthPct >= annualRatePct : null };
  }

  // ── ADVANCED ANALYTICS ───────────────────────────────────

  // 17 · hourly spending (0–23)
  function hourlySpending(days) {
    days = days || 90;
    var since = Date.now() - days * 86400000;
    var by = Array(24).fill(0), cnt = Array(24).fill(0);
    txClean().forEach(function(t) {
      if (t.amount_minor >= 0) return;
      var d = new Date(t.occurred_at);
      if (d.getTime() < since) return;
      by[d.getHours()] += -t.amount_minor;
      cnt[d.getHours()]++;
    });
    return by.map(function(total, h) { return { h: h, total: total, avg: cnt[h] > 0 ? total / cnt[h] : 0, count: cnt[h] }; });
  }

  // 18 · spending by day after salary
  function salaryDaySpending() {
    var txs = txClean();
    var domCount = Array(31).fill(0);
    txs.filter(function(t) { return t.amount_minor > 0; }).forEach(function(t) { domCount[new Date(t.occurred_at).getDate() - 1]++; });
    var salaryDOM = domCount.indexOf(Math.max.apply(null, domCount)) + 1;
    var salaryDates = [];
    var now = new Date();
    for (var i = 0; i < 8; i++) { salaryDates.push(new Date(now.getFullYear(), now.getMonth() - i, salaryDOM).getTime()); }
    salaryDates.sort(function(a, b) { return b - a; });
    var by = Array(31).fill(0), cnt = Array(31).fill(0);
    txs.forEach(function(t) {
      if (t.amount_minor >= 0) return;
      var ts = new Date(t.occurred_at).getTime();
      var prev = salaryDates.find(function(sd) { return sd <= ts; });
      if (!prev) return;
      var day = Math.floor((ts - prev) / 86400000);
      if (day >= 0 && day < 31) { by[day] += -t.amount_minor; cnt[day]++; }
    });
    var first7 = by.slice(0, 7).reduce(function(a, b) { return a + b; }, 0);
    var rest = by.slice(7).reduce(function(a, b) { return a + b; }, 0);
    return { data: by.map(function(total, i) { return { day: i + 1, total: total, count: cnt[i] }; }), salaryDOM: salaryDOM, first7: first7, rest: rest, ratio: rest > 0 ? first7 / rest : null };
  }

  // 19 · anomaly detector
  function anomalyDetector() {
    var now = new Date();
    var buckets = [];
    for (var i = 0; i <= 6; i++) { var d = new Date(now.getFullYear(), now.getMonth() - i, 1); buckets.push({ y: d.getFullYear(), m: d.getMonth(), cats: {} }); }
    txClean().forEach(function(t) {
      if (t.amount_minor >= 0) return;
      var d = new Date(t.occurred_at);
      var b = buckets.find(function(x) { return x.y === d.getFullYear() && x.m === d.getMonth(); });
      if (!b) return;
      var k = t.category_key || "other";
      b.cats[k] = (b.cats[k] || 0) + -t.amount_minor;
    });
    var current = buckets[0]; var history = buckets.slice(1);
    var catKeys = new Set(history.reduce(function(acc, b) { return acc.concat(Object.keys(b.cats)); }, []));
    var anomalies = [];
    catKeys.forEach(function(k) {
      var vals = history.map(function(b) { return b.cats[k] || 0; });
      var mean = vals.reduce(function(a, b) { return a + b; }, 0) / vals.length;
      if (mean < 500000) return;
      var std = Math.sqrt(vals.reduce(function(s, v) { return s + Math.pow(v - mean, 2); }, 0) / vals.length);
      var cur = current.cats[k] || 0;
      if (cur > mean + 2 * std) {
        var c = CATEGORIES.find(function(cc) { return cc.key === k; });
        anomalies.push({ catKey: k, label: c ? c.label : k, color: c ? c.color : "var(--c7)", mean: Math.round(mean), current: Math.round(cur), sigma: std > 0 ? Math.round((cur - mean) / std * 10) / 10 : 99, pct: Math.round((cur - mean) / mean * 100) });
      }
    });
    var catAmts = {};
    txClean().forEach(function(t) { if (t.amount_minor >= 0) return; var k = t.category_key || "other"; if (!catAmts[k]) catAmts[k] = []; catAmts[k].push(-t.amount_minor); });
    var catAvgMap = {};
    Object.keys(catAmts).forEach(function(k) { catAvgMap[k] = catAmts[k].reduce(function(a, b) { return a + b; }, 0) / catAmts[k].length; });
    var cutoff = Date.now() - 30 * 86400000;
    var largeTx = [];
    txClean().forEach(function(t) {
      if (t.amount_minor >= 0 || new Date(t.occurred_at).getTime() < cutoff) return;
      var k = t.category_key || "other"; var avg = catAvgMap[k] || 0;
      if (avg > 0 && -t.amount_minor > avg * 3) {
        var c = CATEGORIES.find(function(cc) { return cc.key === k; });
        largeTx.push({ id: t.id, merchant: t.merchant, amount: -t.amount_minor, catAvg: Math.round(avg), catLabel: c ? c.label : k, occurred_at: t.occurred_at, multiplier: Math.round(-t.amount_minor / avg * 10) / 10 });
      }
    });
    return { categoryAnomalies: anomalies.sort(function(a, b) { return b.pct - a.pct; }), largeTx: largeTx.sort(function(a, b) { return b.amount - a.amount; }).slice(0, 5) };
  }

  // 20 · stress triggers
  function stressTriggers(days) {
    days = days || 90;
    var since = Date.now() - days * 86400000;
    var grandTotal = 0;
    var ctx = { weekend: { total: 0, cats: {} }, weekday: { total: 0, cats: {} }, mStart: { total: 0, cats: {} }, mEnd: { total: 0, cats: {} } };
    txClean().forEach(function(t) {
      if (t.amount_minor >= 0) return;
      var d = new Date(t.occurred_at); if (d.getTime() < since) return;
      var amt = -t.amount_minor; var dow = d.getDay(); var dom = d.getDate(); var k = t.category_key || "other";
      grandTotal += amt;
      var add = function(c) { ctx[c].total += amt; ctx[c].cats[k] = (ctx[c].cats[k] || 0) + amt; };
      if (dow === 0 || dow === 6) add("weekend"); else add("weekday");
      if (dom <= 10) add("mStart");
      if (dom >= 21) add("mEnd");
    });
    var basePerDay = grandTotal / days;
    var mkCtx = function(key, label, ctxData, ndays) {
      var avgPerDay = ndays > 0 ? ctxData.total / ndays : 0;
      return { key: key, label: label, total: ctxData.total, avgPerDay: avgPerDay, basePerDay: basePerDay,
        pct: basePerDay > 0 ? (avgPerDay - basePerDay) / basePerDay * 100 : 0,
        topCats: Object.keys(ctxData.cats).map(function(k) { var c = CATEGORIES.find(function(cc) { return cc.key === k; }); return { key: k, label: c ? c.label : k, color: c ? c.color : "var(--c7)", value: ctxData.cats[k] }; }).sort(function(a, b) { return b.value - a.value; }).slice(0, 3) };
    };
    return [
      mkCtx("weekend", "Выходные", ctx.weekend, Math.round(days * 2 / 7)),
      mkCtx("weekday", "Будни", ctx.weekday, Math.round(days * 5 / 7)),
      mkCtx("mStart", "Начало месяца (1–10)", ctx.mStart, Math.round(days * 10 / 30)),
      mkCtx("mEnd", "Конец месяца (21–31)", ctx.mEnd, Math.round(days * 11 / 30)),
    ].filter(function(r) { return r.total > 0; }).sort(function(a, b) { return b.pct - a.pct; });
  }

  // 21 · sankey data
  function sankeyData(days) {
    days = days || 30;
    var since = Date.now() - days * 86400000;
    var txs = txClean().filter(function(t) { return new Date(t.occurred_at).getTime() >= since; });
    var incByKey = {}, expByCat = {}, totalIncome = 0, totalExpense = 0;
    txs.forEach(function(t) {
      if (t.amount_minor > 0) { var k = t.category_key || "other_income"; incByKey[k] = (incByKey[k] || 0) + t.amount_minor; totalIncome += t.amount_minor; }
      else { var k2 = t.category_key || "other"; expByCat[k2] = (expByCat[k2] || 0) + -t.amount_minor; totalExpense += -t.amount_minor; }
    });
    var totalSavings = 0;
    getAccounts().filter(function(a) { return a.type === "savings"; }).forEach(function(acc) {
      getTransactions().filter(function(t) { return t.account_id === acc.id && !t.opening && new Date(t.occurred_at).getTime() >= since; }).forEach(function(t) { if (t.amount_minor > 0) totalSavings += t.amount_minor; });
    });
    var remainder = Math.max(0, totalIncome - totalExpense - totalSavings);
    var incomes = Object.keys(incByKey).map(function(k) { var c = CATEGORIES.find(function(cc) { return cc.key === k; }); return { key: k, label: c ? c.label : "Доход", value: incByKey[k], color: c ? c.color : "var(--c1)" }; }).sort(function(a, b) { return b.value - a.value; });
    var expCats = Object.keys(expByCat).map(function(k) { var c = CATEGORIES.find(function(cc) { return cc.key === k; }); return { key: k, label: c ? c.label : k, value: expByCat[k], color: c ? c.color : "var(--c7)", essential: c ? !!c.essential : false }; }).sort(function(a, b) { return b.value - a.value; });
    var groups = [
      { key: "essential", label: "Обязательные", value: expCats.filter(function(c) { return c.essential; }).reduce(function(s, c) { return s + c.value; }, 0), color: "var(--c1)" },
      { key: "variable", label: "Переменные", value: expCats.filter(function(c) { return !c.essential; }).reduce(function(s, c) { return s + c.value; }, 0), color: "var(--c3)" },
    ];
    if (totalSavings > 0) groups.push({ key: "savings", label: "Накопления", value: totalSavings, color: "var(--pos)" });
    if (remainder > 0) groups.push({ key: "remainder", label: "Остаток", value: remainder, color: "var(--ink-4)" });
    return { incomes: incomes, groups: groups.filter(function(g) { return g.value > 0; }), expCats: expCats, totalIncome: totalIncome, totalExpense: totalExpense, totalSavings: totalSavings, remainder: remainder };
  }

  // 22 · counterparty analysis
  function counterparties(days) {
    days = days || 90;
    var since = Date.now() - days * 86400000;
    var prevSince = since - days * 86400000;
    var cur = {}, prev = {};
    txClean().forEach(function(t) {
      if (t.amount_minor >= 0) return;
      var name = (t.merchant || "").trim() || "(без названия)";
      var ts = new Date(t.occurred_at).getTime(); var amt = -t.amount_minor;
      if (ts >= since) { if (!cur[name]) cur[name] = { total: 0, count: 0, txs: [] }; cur[name].total += amt; cur[name].count++; cur[name].txs.push(t); }
      else if (ts >= prevSince) { if (!prev[name]) prev[name] = { total: 0 }; prev[name].total += amt; }
    });
    return Object.keys(cur).map(function(name) {
      var d = cur[name];
      return { name: name, total: d.total, count: d.count, avg: Math.round(d.total / d.count), trend: prev[name] ? (d.total - prev[name].total) / prev[name].total * 100 : null, txs: d.txs.sort(function(a, b) { return b.occurred_at.localeCompare(a.occurred_at); }) };
    }).sort(function(a, b) { return b.total - a.total; });
  }

  // 23 · health score
  function healthScore() {
    var sr = savingsRate(3); var run = runway(); var dl = debtLoad(); var inc = incomeSources(180); var ef = emergencyFund(); var series = monthlySeries(4);
    var srScore = sr.rate == null ? 0 : Math.min(100, Math.max(0, sr.rate / 20 * 100));
    var rwScore = run.months == null ? 100 : Math.min(100, Math.max(0, run.months / 6 * 100));
    var dtiScore = dl.dti == null ? 100 : Math.min(100, Math.max(0, 100 - dl.dti / 40 * 100));
    var divScore = inc.count === 0 ? 0 : inc.count === 1 ? 20 : inc.count === 2 ? 60 : 100;
    var efScore = Math.min(100, Math.max(0, (ef.months || 0) / 6 * 100));
    var last3 = series.slice(1); var trendScore = 50;
    if (last3.length >= 3) { var gr = last3[2].outflow > last3[1].outflow && last3[1].outflow > last3[0].outflow; var dc = last3[2].outflow < last3[1].outflow && last3[1].outflow < last3[0].outflow; trendScore = gr ? 0 : dc ? 100 : 50; }
    var total = Math.round(srScore * 0.25 + rwScore * 0.20 + dtiScore * 0.20 + divScore * 0.15 + efScore * 0.10 + trendScore * 0.10);
    var components = [
      { key: "sr", label: "Норма сбережений",      score: Math.round(srScore),  weight: 25, detail: sr.rate != null ? Math.round(sr.rate) + "% (цель 20%)" : "Нет данных" },
      { key: "rw", label: "Runway",                 score: Math.round(rwScore),  weight: 20, detail: run.months != null ? run.months.toFixed(1) + " мес (цель 6)" : "Нет данных" },
      { key: "dt", label: "Долговая нагрузка",      score: Math.round(dtiScore), weight: 20, detail: dl.dti != null ? Math.round(dl.dti) + "% DTI" : "Нет кредитных счетов" },
      { key: "dv", label: "Диверсификация дохода",  score: Math.round(divScore), weight: 15, detail: inc.count + " источник(а) дохода" },
      { key: "ef", label: "Подушка безопасности",   score: Math.round(efScore),  weight: 10, detail: ef.months != null ? ef.months.toFixed(1) + " из 6 мес" : "Нет данных" },
      { key: "tr", label: "Тренд расходов",         score: Math.round(trendScore),weight:10, detail: trendScore === 0 ? "Растут 3 мес подряд" : trendScore === 100 ? "Снижаются" : "Стабильны" },
    ];
    var worst = components.slice().sort(function(a, b) { return (a.score * a.weight) - (b.score * b.weight); })[0];
    return { total: total, components: components, worst: worst };
  }

  // 24 · smart recommendations
  function smartRecommendations() {
    var recs = [];
    var subs = detectSubscriptions().subs;
    var now = Date.now();
    subs.forEach(function(s) {
      var recent = txClean().some(function(t) { return (t.merchant || "").trim().toLowerCase() === s.name.toLowerCase() && (now - new Date(t.occurred_at).getTime()) < 60 * 86400000; });
      if (!recent) recs.push({ key: "unsub_" + s.name, priority: 80, icon: "🔁", title: "Неиспользуемая подписка: " + s.name, body: "Не использовалась 60+ дней · " + Math.round(s.amount / 100).toLocaleString("ru-RU") + " сум/мес" });
    });
    var run = runway();
    if (run.months != null && run.months < 3) recs.push({ key: "low_runway", priority: 95, icon: "🛟", title: "Маленькая подушка безопасности", body: "Хватит на " + run.months.toFixed(1) + " мес — доведи до 3+" });
    var sr = savingsRate(3);
    if (sr.rate != null && sr.rate < 10 && sr.income > 0) recs.push({ key: "low_sr", priority: 75, icon: "💰", title: "Низкая норма сбережений", body: "Откладываешь только " + Math.round(sr.rate) + "% дохода (цель: 20%)" });
    var inc = incomeSources(180);
    if (inc.count <= 1 && inc.total > 0) recs.push({ key: "inc_conc", priority: 60, icon: "⚠️", title: "Один источник дохода", body: "Высокий риск — диверсифицируй доходы" });
    var s4 = monthlySeries(4);
    var bCat = function(b) {
      var m = {}; var since = new Date(b.y, b.m, 1).getTime(); var until = new Date(b.y, b.m + 1, 0, 23, 59, 59).getTime();
      txClean().forEach(function(t) { if (t.amount_minor >= 0) return; var ts = new Date(t.occurred_at).getTime(); if (ts < since || ts > until) return; var k = t.category_key || "other"; m[k] = (m[k] || 0) + -t.amount_minor; }); return m;
    };
    var bd = s4.slice(0, 3).map(bCat);
    var allCatKeys = new Set(bd.reduce(function(acc, b) { return acc.concat(Object.keys(b)); }, []));
    allCatKeys.forEach(function(k) {
      var v0 = (bd[0] || {})[k] || 0, v1 = (bd[1] || {})[k] || 0, v2 = (bd[2] || {})[k] || 0;
      if (v2 > v1 && v1 > v0 && v0 > 0) {
        var c = CATEGORIES.find(function(cc) { return cc.key === k; });
        recs.push({ key: "grow_" + k, priority: 70, icon: "📈", title: "Траты «" + (c ? c.label : k) + "» растут", body: "+" + Math.round((v2 - v0) / v0 * 100) + "% за 3 месяца подряд" });
      }
    });
    return recs.sort(function(a, b) { return b.priority - a.priority; }).slice(0, 3);
  }

  // Advanced settings (hourly rate, TCO, self-investments, scenarios)
  function getAdvSettings() {
    try { var raw = localStorage.getItem("tf_adv"); return raw ? JSON.parse(raw) : { monthlyIncome: 0, workHours: 160, tcoAssets: [], selfInvest: [], scenarios: [] }; }
    catch(e) { return { monthlyIncome: 0, workHours: 160, tcoAssets: [], selfInvest: [], scenarios: [] }; }
  }
  function setAdvSettings(patch) { localStorage.setItem("tf_adv", JSON.stringify(Object.assign({}, getAdvSettings(), patch))); }

  // ── user ──────────────────────────────────────────────────
  function getUser() { return load(KEYS.user, { full_name: "" }); }
  function setUser(patch) { save(KEYS.user, { ...getUser(), ...patch }); }

  // ── backup / restore ──────────────────────────────────────
  function exportData() {
    const blob = {};
    for (const k of Object.values(KEYS)) blob[k] = load(k, null);
    blob.__app = "T-Finance";
    blob.__exported_at = new Date().toISOString();
    blob.__version = 1;
    return JSON.stringify(blob, null, 2);
  }
  function importData(json) {
    const blob = JSON.parse(json);
    for (const k of Object.values(KEYS)) {
      if (blob[k] != null) save(k, blob[k]);
    }
  }
  function wipe() {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  }

  seedOnce();

  // one-time: flip the demo RUB starter accounts to UZS
  function migrateUZS() {
    if (localStorage.getItem("tf_mig_uzs") === "1") return;
    const accs = getAccounts();
    let changed = false;
    accs.forEach((a) => { if (a.currency === "RUB") { a.currency = "UZS"; changed = true; } });
    if (changed) save(KEYS.accounts, accs);
    localStorage.setItem("tf_mig_uzs", "1");
  }
  migrateUZS();

  window.TFStore = {
    CATEGORIES, ACCOUNT_COLORS,
    getAccounts, addAccount, updateAccount, deleteAccount,
    getTransactions, addTransaction, updateTransaction, deleteTransaction, transfer,
    getGoals, addGoal, updateGoal, deleteGoal,
    netWorth, monthFlow, categoryBreakdown, monthlySeries,
    movingAverage, momYoY, dayHeatmap, savingsRate, runway, expenseSplit,
    emergencyFund, incomeSources, forecastSpend, simulateGoal, detectSubscriptions,
    netWorthSeries, debtLoad, inflationImpact, liquidAssets, avgMonthlyExpense,
    getUser, setUser,
    exportData, importData, wipe,
    hourlySpending, salaryDaySpending, anomalyDetector, stressTriggers,
    sankeyData, counterparties, healthScore, smartRecommendations,
    getAdvSettings, setAdvSettings,
  };
})();
