// T-Finance · screens
const S = window.TFStore;

// ── shared bits ──────────────────────────────────────────
function SectionTitle({ children, action }) {
  return (
    <div className="row" style={{ justifyContent: "space-between", margin: "26px 2px 12px" }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color: "var(--ink-3)", textTransform: "uppercase" }}>{children}</div>
      {action}
    </div>
  );
}

function CatIcon({ catKey, color }) {
  return <div className="cat-ic" style={{ background: color || "var(--c7)" }}>{CAT_EMOJI[catKey] || "•"}</div>;
}

function TxRow({ tx, accounts, onDelete, onEdit }) {
  const acc = accounts.find((a) => a.id === tx.account_id);
  const cat = S.CATEGORIES.find((c) => c.key === tx.category_key);
  const isTransfer = tx.direction === "transfer";
  const color = isTransfer ? "var(--c7)" : cat ? cat.color : "var(--c7)";
  const pos = tx.amount_minor > 0;
  return (
    <div className="txrow">
      <div className="cat-ic" style={{ background: color }}>{isTransfer ? "↔" : (CAT_EMOJI[tx.category_key] || "•")}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {tx.merchant || (cat ? cat.label : "Операция")}
        </div>
        <div className="sub" style={{ fontSize: 12.5 }}>
          {(cat ? cat.label : isTransfer ? "Перевод" : "—")} · {acc ? acc.label : "—"} · {timeLabel(tx.occurred_at)}
          {tx.note ? " · " + tx.note : ""}
        </div>
      </div>
      <div className="mono" style={{ fontWeight: 700, fontSize: 15, color: pos ? "var(--pos)" : "var(--ink)" }}>
        {fmtMoney(tx.amount_minor, { sign: true, cur: CUR_SYMBOL[acc ? acc.currency : "UZS"] })}
      </div>
      {onEdit && !isTransfer && (
        <button className="btn sm txrow-edit" onClick={() => onEdit(tx)} title="Изменить" style={{ width: 32, padding: 0, color: "var(--ink-3)" }}>
          <Icon name="edit" size={15} />
        </button>
      )}
      {onDelete && (
        <button className="btn sm" onClick={() => onDelete(tx)} title="Удалить" style={{ width: 32, padding: 0, color: "var(--ink-3)" }}>
          <Icon name="trash" size={15} />
        </button>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════════
function Dashboard({ go, version }) {
  const accounts = S.getAccounts();
  const txs = S.getTransactions().slice().sort((a, b) => b.occurred_at.localeCompare(a.occurred_at));
  const nw = S.netWorth();
  const flow = S.monthFlow();
  const cats = S.categoryBreakdown(30);
  const user = S.getUser();
  const hour = new Date().getHours();
  const greet = hour < 6 ? "Доброй ночи" : hour < 12 ? "Доброе утро" : hour < 18 ? "Добрый день" : "Добрый вечер";
  const monthName = new Date().toLocaleDateString("ru-RU", { month: "long" });

  return (
    <div>
      <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div className="sub">{greet}{user.full_name ? ", " + user.full_name : ""}</div>
          <h1 className="h1" style={{ marginTop: 2 }}>Главная</h1>
        </div>
        <button className="btn brand" onClick={() => go("add")}><Icon name="plus" size={17} /> Добавить операцию</button>
      </div>

      <div className="card pad" style={{ marginTop: 18, background: "var(--brand)", color: "var(--on-brand)", border: "none" }}>
        <div style={{ fontSize: 13, opacity: 0.8, fontWeight: 600 }}>Общий капитал</div>
        <div className="mono dash-capital" style={{ fontWeight: 700, marginTop: 4, letterSpacing: "-0.02em" }}>{fmtMoney(nw)}</div>
        <div className="row dash-flow" style={{ gap: 22, marginTop: 12, fontSize: 13 }}>
          <span style={{ opacity: 0.85 }}><Icon name="arrowDown" size={13} /> Доход · {monthName}: <b className="mono">{fmtMoney(flow.inflow)}</b></span>
          <span style={{ opacity: 0.85 }}><Icon name="arrowUp" size={13} /> Расход · {monthName}: <b className="mono">{fmtMoney(flow.outflow)}</b></span>
        </div>
      </div>

      <SectionTitle action={<button className="btn sm" onClick={() => go("accounts")}>Все счета</button>}>Счета</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(200px, 100%), 1fr))", gap: 12 }}>
        {accounts.map((a) => (
          <div key={a.id} className="card pad" style={{ gap: 8 }}>
            <div className="row" style={{ gap: 8 }}><span className="dot" style={{ background: a.color }}></span><span style={{ fontWeight: 600, fontSize: 13.5 }}>{a.label}</span></div>
            <div className="mono" style={{ fontSize: 22, fontWeight: 700 }}>{fmtMoney(a.balance_minor, { cur: CUR_SYMBOL[a.currency] })}</div>
            <div className="sub" style={{ fontSize: 12 }}>{ACC_TYPE[a.type] || a.type}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16, marginTop: 8, alignItems: "start" }} className="dash-cols">
        <div>
          <SectionTitle action={<button className="btn sm" onClick={() => go("history")}>Вся история</button>}>Недавние операции</SectionTitle>
          <div className="card pad">
            {txs.length === 0
              ? <div className="empty">Пока пусто. Нажми «Добавить операцию», чтобы записать первую.</div>
              : txs.slice(0, 7).map((t) => <TxRow key={t.id} tx={t} accounts={accounts} />)}
          </div>
        </div>
        <div>
          <SectionTitle>Категории · 30 дней</SectionTitle>
          <div className="card pad">
            {cats.length === 0 ? <div className="empty" style={{ padding: 28 }}>Нет расходов за период</div> : <CategoryBars cats={cats} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryBars({ cats }) {
  const total = cats.reduce((s, c) => s + c.value_minor, 0) || 1;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
      <div style={{ display: "flex", height: 10, borderRadius: 99, overflow: "hidden", gap: 2 }}>
        {cats.map((c) => <div key={c.key} style={{ width: (c.value_minor / total * 100) + "%", background: c.color }} title={c.label}></div>)}
      </div>
      {cats.map((c) => (
        <div key={c.key} className="row" style={{ justifyContent: "space-between", fontSize: 13.5 }}>
          <span className="row" style={{ gap: 8 }}><span className="dot" style={{ background: c.color }}></span>{c.label}</span>
          <span className="mono" style={{ fontWeight: 600 }}>{fmtMoney(c.value_minor)}</span>
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════
// ADD TRANSACTION
// ════════════════════════════════════════════════════════
window.CAT_PRESETS = {
  services:     ["Claude AI", "Yandex", "Spotify", "Whisper Flow", "tl;dv", "Sleep Cycle"],
  restaurants:  ["EVOS", "SUSU Пельмени", "Diet Bistro", "B&B", "Tim's"],
  gym:          ["Абонемент", "Тренер", "Спортпит"],
  food:         ["Korzinka", "Marko", "Havas"],
  taxi:         ["YandexGO", "WB Taxi"],
};

// ── Пользовательские пресеты (сохраняются в localStorage) ──
function loadCustomPresets() {
  try { return JSON.parse(localStorage.getItem("tf_custom_presets") || "{}"); } catch { return {}; }
}
function saveCustomPresets(data) {
  localStorage.setItem("tf_custom_presets", JSON.stringify(data));
}

function PresetPicker({ cat, merchant, setMerchant }) {
  const [custom, setCustom] = React.useState(loadCustomPresets);
  const [adding, setAdding] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const inputRef = React.useRef(null);

  React.useEffect(() => { if (adding && inputRef.current) inputRef.current.focus(); }, [adding]);

  const defaults = window.CAT_PRESETS[cat] || [];
  const mine = custom[cat] || [];
  const all = [...defaults, ...mine.filter((p) => !defaults.includes(p))];

  if (!all.length && !window.CAT_PRESETS[cat]) return null;

  function addCustom() {
    const val = draft.trim();
    if (!val) { setAdding(false); return; }
    const next = { ...custom, [cat]: [...(custom[cat] || []).filter((p) => p !== val), val] };
    saveCustomPresets(next);
    setCustom(next);
    setMerchant(val);
    setDraft("");
    setAdding(false);
  }

  function removeCustom(p) {
    const next = { ...custom, [cat]: (custom[cat] || []).filter((x) => x !== p) };
    saveCustomPresets(next);
    setCustom(next);
    if (merchant === p) setMerchant("");
  }

  return (
    <div className="field">
      <label>Быстрый выбор</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, alignItems: "center" }}>
        {all.map((p) => {
          const isDefault = defaults.includes(p);
          const active = merchant === p;
          return (
            <span key={p} style={{ display: "inline-flex", alignItems: "center", gap: 0 }}>
              <button type="button" onClick={() => setMerchant(active ? "" : p)}
                className="btn sm"
                style={{ borderColor: active ? "var(--brand)" : "var(--line)", background: active ? "var(--brand-tint)" : "var(--bg-elev)", color: active ? "var(--brand-ink)" : "var(--ink-2)", fontWeight: active ? 700 : 500, borderRadius: isDefault ? "var(--r-sm)" : "var(--r-sm) 0 0 var(--r-sm)", borderRight: isDefault ? "" : "none" }}>
                {p}
              </button>
              {!isDefault && (
                <button type="button" onClick={() => removeCustom(p)}
                  className="btn sm"
                  style={{ padding: "0 7px", borderRadius: "0 var(--r-sm) var(--r-sm) 0", color: "var(--ink-4)", borderColor: active ? "var(--brand)" : "var(--line)", background: active ? "var(--brand-tint)" : "var(--bg-elev)" }}
                  title="Удалить">×</button>
              )}
            </span>
          );
        })}
        {adding ? (
          <span style={{ display: "inline-flex", gap: 5 }}>
            <input ref={inputRef} className="input" value={draft} onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addCustom(); if (e.key === "Escape") { setAdding(false); setDraft(""); } }}
              placeholder="Своё название…"
              style={{ height: 32, width: 160, fontSize: 13, padding: "0 10px" }} />
            <button type="button" className="btn sm" onClick={addCustom} style={{ background: "var(--brand)", color: "var(--on-brand)", border: "none" }}>OK</button>
            <button type="button" className="btn sm" onClick={() => { setAdding(false); setDraft(""); }}>✕</button>
          </span>
        ) : (
          <button type="button" className="btn sm" onClick={() => setAdding(true)}
            style={{ color: "var(--ink-4)", borderStyle: "dashed" }}>+ своё</button>
        )}
      </div>
    </div>
  );
}
window.PresetPicker = PresetPicker;

function AddTransaction({ go, onDone }) {
  const accounts = S.getAccounts();
  const [dir, setDir] = useState("expense"); // expense | income
  const [amount, setAmount] = useState("");
  const [accId, setAccId] = useState(accounts[0] ? accounts[0].id : null);
  const [cat, setCat] = useState("food");
  const [merchant, setMerchant] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(inputDate());
  const amtRef = useRef(null);
  useEffect(() => { amtRef.current && amtRef.current.focus(); }, []);

  const cats = S.CATEGORIES.filter((c) => c.kind === (dir === "income" ? "income" : "expense"));
  useEffect(() => { if (!cats.find((c) => c.key === cat)) setCat(cats[0].key); }, [dir]);

  const minor = parseAmount(amount);
  const valid = minor > 0 && accId != null;

  function save(again) {
    if (!valid) return;
    const signed = dir === "income" ? minor : -minor;
    const occ = new Date(date + "T" + new Date().toTimeString().slice(0, 8)).toISOString();
    S.addTransaction({ account_id: accId, amount_minor: signed, direction: dir === "income" ? "inflow" : "outflow", merchant, note, category_key: cat, occurred_at: occ });
    if (again) {
      setAmount(""); setMerchant(""); setNote("");
      amtRef.current && amtRef.current.focus();
      onDone && onDone("saved");
    } else { go("history"); }
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <h1 className="h1">Новая операция</h1>
      <div className="sub" style={{ marginBottom: 18 }}>Записывай по одной — можно быстро добавлять подряд кнопкой «Сохранить и ещё».</div>

      <div className="seg" style={{ marginBottom: 18 }}>
        <button className={dir === "expense" ? "on" : ""} onClick={() => setDir("expense")}>Расход</button>
        <button className={dir === "income" ? "on" : ""} onClick={() => setDir("income")}>Доход</button>
      </div>

      <div className="card pad" style={{ gap: 18 }}>
        <div className="field">
          <label>Сумма</label>
          <div style={{ position: "relative" }}>
            <input ref={amtRef} className="input big mono" inputMode="decimal" placeholder="0" value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && save(true)} style={{ paddingRight: 72 }} />
            <span className="mono" style={{ position: "absolute", right: 16, top: 0, height: 64, display: "flex", alignItems: "center", fontSize: 21, color: "var(--ink-3)" }}>
              {CUR_SYMBOL[(accounts.find((a) => a.id === accId) || {}).currency || "UZS"]}
            </span>
          </div>
        </div>

        <div className="field">
          <label>Счёт</label>
          <select className="select" value={accId || ""} onChange={(e) => setAccId(Number(e.target.value))}>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.label} · {fmtMoney(a.balance_minor, { cur: CUR_SYMBOL[a.currency] })}</option>)}
          </select>
        </div>

        <div className="field">
          <label>Категория</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(126px,1fr))", gap: 8 }}>
            {cats.map((c) => (
              <button key={c.key} onClick={() => setCat(c.key)}
                className="btn sm" style={{ height: 38, justifyContent: "flex-start", gap: 7, borderColor: cat === c.key ? c.color : "var(--line)", background: cat === c.key ? "color-mix(in oklch, " + c.color + " 16%, var(--bg-elev))" : "var(--bg-elev)", fontWeight: cat === c.key ? 700 : 600 }}>
                <span>{CAT_EMOJI[c.key]}</span><span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        <PresetPicker cat={cat} merchant={merchant} setMerchant={setMerchant} />

        <div className="row add-form-row" style={{ gap: 12, alignItems: "stretch" }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Описание</label>
            <input className="input" placeholder={
              dir === "income" ? "Напр. Зарплата" :
              cat === "taxi" ? "Напр. Яндекс Go, InDriver, Uber" :
              cat === "transport" ? "Напр. маршрут 45, метро" :
              cat === "restaurants" ? "Напр. Coffee House, Dono Kebab" :
              cat === "services" ? "Напр. Claude, ChatGPT, Tilda, Netflix" :
              cat === "gym" ? "Напр. абонемент, тренер, протеин" :
              cat === "healthcare" ? "Напр. аптека, Аман Медикал, Инвитро" :
              cat === "food" ? "Напр. Korzinka, Macro" :
              "Напр. название места или товара"
            } value={merchant} onChange={(e) => setMerchant(e.target.value)} />
          </div>
          <div className="field" style={{ width: 170 }}>
            <label>Дата</label>
            <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label>Заметка <span style={{ color: "var(--ink-4)", fontWeight: 500 }}>(необязательно)</span></label>
          <input className="input" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
      </div>

      <div className="row" style={{ gap: 10, marginTop: 18 }}>
        <button className="btn brand" disabled={!valid} onClick={() => save(false)}><Icon name="check" size={17} /> Сохранить</button>
        <button className="btn" disabled={!valid} onClick={() => save(true)}>Сохранить и ещё</button>
      </div>
    </div>
  );
}

Object.assign(window, { SectionTitle, CatIcon, TxRow, Dashboard, CategoryBars, AddTransaction });
