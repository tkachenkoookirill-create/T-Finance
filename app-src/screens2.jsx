// T-Finance · screens (part 2)
const S2 = window.TFStore;

// ════════════════════════════════════════════════════════
// ACCOUNTS
// ════════════════════════════════════════════════════════
function Accounts({ refresh }) {
  const accounts = S2.getAccounts();
  const [modal, setModal] = useState(null); // {mode, acc}
  const [xfer, setXfer] = useState(false);
  const total = S2.netWorth();

  return (
    <div>
      <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div><h1 className="h1">Счета</h1><div className="sub mono" style={{ marginTop: 2 }}>Итого: {fmtMoney(total)}</div></div>
        <div className="row" style={{ gap: 10 }}>
          {accounts.length > 1 && <button className="btn" onClick={() => setXfer(true)}><Icon name="transfer" size={16} /> Перевод</button>}
          <button className="btn brand" onClick={() => setModal({ mode: "new" })}><Icon name="plus" size={17} /> Новый счёт</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(248px,1fr))", gap: 14, marginTop: 20 }}>
        {accounts.map((a) => (
          <div key={a.id} className="card pad" style={{ gap: 10 }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <span className="dot" style={{ background: a.color, width: 12, height: 12 }}></span>
              <button className="btn sm" onClick={() => setModal({ mode: "edit", acc: a })} style={{ padding: "0 10px" }}>Изменить</button>
            </div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{a.label}</div>
            <div className="mono" style={{ fontSize: 26, fontWeight: 700 }}>{fmtMoney(a.balance_minor, { cur: CUR_SYMBOL[a.currency] })}</div>
            <div className="sub" style={{ fontSize: 12.5 }}>{ACC_TYPE[a.type] || a.type} · {a.currency}</div>
          </div>
        ))}
      </div>

      {modal && <AccountModal modal={modal} onClose={() => setModal(null)} refresh={refresh} />}
      {xfer && <TransferModal accounts={accounts} onClose={() => setXfer(false)} refresh={refresh} />}
    </div>
  );
}

function AccountModal({ modal, onClose, refresh }) {
  const editing = modal.mode === "edit";
  const a = modal.acc || {};
  const [label, setLabel] = useState(a.label || "");
  const [type, setType] = useState(a.type || "cash");
  const [currency, setCurrency] = useState(a.currency || "UZS");
  const [color, setColor] = useState(a.color || S2.ACCOUNT_COLORS[0]);
  const [opening, setOpening] = useState("");

  function submit() {
    if (!label.trim()) return;
    if (editing) S2.updateAccount(a.id, { label, type, currency, color });
    else S2.addAccount({ label, type, currency, color, opening: parseAmount(opening) });
    refresh(); onClose();
  }
  function remove() {
    if (confirm(`Удалить счёт «${a.label}» и все его операции? Это нельзя отменить.`)) {
      S2.deleteAccount(a.id); refresh(); onClose();
    }
  }

  return (
    <Modal title={editing ? "Изменить счёт" : "Новый счёт"} onClose={onClose}
      footer={<>
        {editing && <button className="btn danger" onClick={remove} style={{ marginRight: "auto" }}><Icon name="trash" size={15} /> Удалить</button>}
        <button className="btn" onClick={onClose}>Отмена</button>
        <button className="btn brand" onClick={submit} disabled={!label.trim()}>{editing ? "Сохранить" : "Создать"}</button>
      </>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="field"><label>Название</label><input className="input" value={label} placeholder="Напр. Наличные" onChange={(e) => setLabel(e.target.value)} /></div>
        <div className="row" style={{ gap: 12 }}>
          <div className="field" style={{ flex: 1 }}><label>Тип</label>
            <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
              {Object.entries(ACC_TYPE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="field" style={{ width: 120 }}><label>Валюта</label>
            <select className="select" value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {Object.keys(CUR_SYMBOL).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        {!editing && (
          <div className="field"><label>Текущий остаток <span style={{ color: "var(--ink-4)", fontWeight: 500 }}>(необязательно)</span></label>
            <input className="input mono" inputMode="decimal" placeholder="0" value={opening} onChange={(e) => setOpening(e.target.value)} /></div>
        )}
        <div className="field"><label>Цвет</label>
          <div className="row" style={{ gap: 8 }}>
            {S2.ACCOUNT_COLORS.map((c) => (
              <button key={c} onClick={() => setColor(c)} style={{ width: 30, height: 30, borderRadius: 8, background: c, border: color === c ? "3px solid var(--ink)" : "1px solid var(--line)", padding: 0 }}></button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function TransferModal({ accounts, onClose, refresh }) {
  const [from, setFrom] = useState(accounts[0].id);
  const [to, setTo] = useState(accounts[1] ? accounts[1].id : accounts[0].id);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const minor = parseAmount(amount);
  const valid = minor > 0 && from !== to;
  function submit() {
    if (!valid) return;
    try { S2.transfer({ from_account_id: from, to_account_id: to, amount_minor: minor, note }); refresh(); onClose(); }
    catch (e) { alert(e.message); }
  }
  return (
    <Modal title="Перевод между счетами" onClose={onClose}
      footer={<><button className="btn" onClick={onClose}>Отмена</button><button className="btn brand" onClick={submit} disabled={!valid}>Перевести</button></>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="field"><label>Откуда</label><select className="select" value={from} onChange={(e) => setFrom(Number(e.target.value))}>{accounts.map((a) => <option key={a.id} value={a.id}>{a.label} · {fmtMoney(a.balance_minor, { cur: CUR_SYMBOL[a.currency] })}</option>)}</select></div>
        <div className="field"><label>Куда</label><select className="select" value={to} onChange={(e) => setTo(Number(e.target.value))}>{accounts.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}</select></div>
        <div className="field"><label>Сумма</label><input className="input mono" inputMode="decimal" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
        <div className="field"><label>Заметка</label><input className="input" value={note} onChange={(e) => setNote(e.target.value)} /></div>
      </div>
    </Modal>
  );
}

// ════════════════════════════════════════════════════════
// HISTORY
// ════════════════════════════════════════════════════════
function History({ refresh, go }) {
  const accounts = S2.getAccounts();
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [dayFilter, setDayFilter] = useState(null);
  useEffect(() => {
    if (window.__tfDayFilter) { setDayFilter(window.__tfDayFilter); window.__tfDayFilter = null; }
  }, []);

  let txs = S2.getTransactions().slice().sort((a, b) => b.occurred_at.localeCompare(a.occurred_at));
  if (filter !== "all") txs = txs.filter((t) => t.account_id === Number(filter));
  if (dayFilter) {
    txs = txs.filter((t) => {
      const d = new Date(t.occurred_at);
      return dayFilter.mode === "weekday" ? (d.getDay() + 6) % 7 === dayFilter.value : d.getDate() === dayFilter.value + 1;
    });
  }

  function del(tx) {
    if (confirm("Удалить операцию? Баланс счёта вернётся к прежнему.")) { S2.deleteTransaction(tx.id); refresh(); }
  }

  // group by day
  const groups = [];
  txs.forEach((t) => {
    const lbl = dayLabel(t.occurred_at);
    let g = groups.find((x) => x.lbl === lbl);
    if (!g) { g = { lbl, items: [], sum: 0 }; groups.push(g); }
    g.items.push(t);
    if (!t.opening && t.direction !== "transfer") g.sum += t.amount_minor;
  });

  return (
    <div>
      <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <h1 className="h1">История</h1>
        <button className="btn brand" onClick={() => go("add")}><Icon name="plus" size={17} /> Добавить</button>
      </div>
      <div className="row" style={{ gap: 10, margin: "16px 0", flexWrap: "wrap" }}>
        <select className="select" style={{ width: "auto", height: 38 }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Все счета</option>
          {accounts.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
        </select>
        {dayFilter && (
          <button className="pill" onClick={() => setDayFilter(null)} style={{ cursor: "pointer", height: 38, padding: "0 14px", background: "var(--brand-tint)", color: "var(--brand-ink)", borderColor: "var(--brand)", whiteSpace: "nowrap" }}>
            {dayFilter.mode === "weekday" ? "День: " : "Число: "}{dayFilter.label}
            <Icon name="x" size={13} />
          </button>
        )}
        <span className="sub">{txs.length} операций</span>
      </div>

      {groups.length === 0
        ? <div className="card pad"><div className="empty">Здесь появятся операции. Нажми «Добавить».</div></div>
        : groups.map((g) => (
          <div key={g.lbl} style={{ marginBottom: 18 }}>
            <div className="row" style={{ justifyContent: "space-between", margin: "0 4px 6px" }}>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>{g.lbl}</div>
              {g.sum !== 0 && <div className="mono sub" style={{ fontSize: 12.5 }}>{fmtMoney(g.sum, { sign: true })}</div>}
            </div>
            <div className="card pad" style={{ paddingTop: 4, paddingBottom: 4 }}>
              {g.items.map((t) => <TxRow key={t.id} tx={t} accounts={accounts} onDelete={del} onEdit={setEditing} />)}
            </div>
          </div>
        ))}
      {editing && <EditTxModal tx={editing} accounts={accounts} onClose={() => setEditing(null)} refresh={refresh} />}
    </div>
  );
}

function EditTxModal({ tx, accounts, onClose, refresh }) {
  const isIncome = tx.amount_minor > 0;
  const [dir, setDir] = useState(isIncome ? "income" : "expense");
  const [amount, setAmount] = useState(String(Math.abs(tx.amount_minor) / 100));
  const [accId, setAccId] = useState(tx.account_id);
  const [cat, setCat] = useState(tx.category_key || "food");
  const [merchant, setMerchant] = useState(tx.merchant || "");
  const [note, setNote] = useState(tx.note || "");
  const [date, setDate] = useState(inputDate(tx.occurred_at));

  const cats = S2.CATEGORIES.filter((c) => c.kind === (dir === "income" ? "income" : "expense"));
  useEffect(() => { if (!cats.find((c) => c.key === cat)) setCat(cats[0].key); }, [dir]);

  const minor = parseAmount(amount);
  const valid = minor > 0 && accId != null;

  function submit() {
    if (!valid) return;
    const signed = dir === "income" ? minor : -minor;
    const orig = new Date(tx.occurred_at);
    const occ = new Date(date + "T" + orig.toTimeString().slice(0, 8)).toISOString();
    S2.updateTransaction(tx.id, {
      account_id: accId, amount_minor: signed,
      direction: dir === "income" ? "inflow" : "outflow",
      merchant, note, category_key: cat, occurred_at: occ,
    });
    refresh(); onClose();
  }
  function remove() {
    if (confirm("Удалить операцию? Баланс счёта вернётся к прежнему.")) { S2.deleteTransaction(tx.id); refresh(); onClose(); }
  }

  const curSym = CUR_SYMBOL[(accounts.find((a) => a.id === accId) || {}).currency || "UZS"];

  return (
    <Modal title="Изменить операцию" onClose={onClose} wide
      footer={<>
        <button className="btn danger" onClick={remove} style={{ marginRight: "auto" }}><Icon name="trash" size={15} /> Удалить</button>
        <button className="btn" onClick={onClose}>Отмена</button>
        <button className="btn brand" onClick={submit} disabled={!valid}>Сохранить</button>
      </>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="seg" style={{ alignSelf: "flex-start" }}>
          <button className={dir === "expense" ? "on" : ""} onClick={() => setDir("expense")}>Расход</button>
          <button className={dir === "income" ? "on" : ""} onClick={() => setDir("income")}>Доход</button>
        </div>

        <div className="row add-form-row" style={{ gap: 12 }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Сумма</label>
            <div style={{ position: "relative" }}>
              <input className="input mono" inputMode="decimal" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ paddingRight: 56 }} />
              <span className="mono" style={{ position: "absolute", right: 13, top: 0, height: 44, display: "flex", alignItems: "center", fontSize: 15, color: "var(--ink-3)" }}>{curSym}</span>
            </div>
          </div>
          <div className="field" style={{ width: 170 }}>
            <label>Дата</label>
            <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
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

        <div className="field">
          <label>Описание</label>
          <input className="input" placeholder={dir === "income" ? "Напр. Зарплата" : "Напр. Пятёрочка"} value={merchant} onChange={(e) => setMerchant(e.target.value)} />
        </div>
        <div className="field">
          <label>Заметка <span style={{ color: "var(--ink-4)", fontWeight: 500 }}>(необязательно)</span></label>
          <input className="input" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
      </div>
    </Modal>
  );
}

// ════════════════════════════════════════════════════════
// ANALYTICS — see analytics.jsx + analytics2.jsx
// ════════════════════════════════════════════════════════

Object.assign(window, { Accounts, AccountModal, TransferModal, History, EditTxModal });
