// T-Finance · screens (part 3) — Goals + Backup/Settings
const S3 = window.TFStore;

// ════════════════════════════════════════════════════════
// GOALS
// ════════════════════════════════════════════════════════
function Goals({ refresh }) {
  const goals = S3.getGoals();
  const [modal, setModal] = useState(null);
  return (
    <div>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1 className="h1">Цели</h1>
        <button className="btn brand" onClick={() => setModal({ mode: "new" })}><Icon name="plus" size={17} /> Новая цель</button>
      </div>
      {goals.length === 0
        ? <div className="card pad" style={{ marginTop: 20 }}><div className="empty">Поставь цель — отпуск, подушка безопасности, крупная покупка — и отслеживай прогресс.</div></div>
        : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 14, marginTop: 20 }}>
            {goals.map((g) => {
              const pct = Math.min(100, Math.round(g.current_minor / (g.target_minor || 1) * 100));
              return (
                <div key={g.id} className="card pad" style={{ gap: 12 }}>
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 700, fontSize: 15.5 }}>{g.label}</span>
                    <button className="btn sm" onClick={() => setModal({ mode: "edit", goal: g })}>Изменить</button>
                  </div>
                  <div className="row" style={{ justifyContent: "space-between", alignItems: "baseline" }}>
                    <span className="mono" style={{ fontSize: 20, fontWeight: 700 }}>{fmtMoney(g.current_minor)}</span>
                    <span className="sub mono">из {fmtMoney(g.target_minor)}</span>
                  </div>
                  <div style={{ height: 10, background: "var(--bg-sunken)", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ width: pct + "%", height: "100%", background: "var(--brand)", borderRadius: 99 }}></div>
                  </div>
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <span className="pill pos">{pct}%</span>
                    {g.due_date && <span className="sub">до {new Date(g.due_date).toLocaleDateString("ru-RU", { month: "short", year: "numeric" })}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      {modal && <GoalModal modal={modal} onClose={() => setModal(null)} refresh={refresh} />}
    </div>
  );
}

function GoalModal({ modal, onClose, refresh }) {
  const editing = modal.mode === "edit";
  const g = modal.goal || {};
  const [label, setLabel] = useState(g.label || "");
  const [target, setTarget] = useState(editing ? String(g.target_minor / 100) : "");
  const [current, setCurrent] = useState(editing ? String(g.current_minor / 100) : "");
  const [due, setDue] = useState(g.due_date ? inputDate(g.due_date) : "");
  function submit() {
    if (!label.trim()) return;
    const patch = { label, target_minor: parseAmount(target), current_minor: parseAmount(current), due_date: due ? new Date(due).toISOString() : null };
    if (editing) S3.updateGoal(g.id, patch); else S3.addGoal(patch);
    refresh(); onClose();
  }
  function remove() { if (confirm("Удалить цель?")) { S3.deleteGoal(g.id); refresh(); onClose(); } }
  return (
    <Modal title={editing ? "Изменить цель" : "Новая цель"} onClose={onClose}
      footer={<>
        {editing && <button className="btn danger" onClick={remove} style={{ marginRight: "auto" }}><Icon name="trash" size={15} /> Удалить</button>}
        <button className="btn" onClick={onClose}>Отмена</button>
        <button className="btn brand" onClick={submit} disabled={!label.trim()}>{editing ? "Сохранить" : "Создать"}</button>
      </>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="field"><label>Название</label><input className="input" value={label} placeholder="Напр. Отпуск" onChange={(e) => setLabel(e.target.value)} /></div>
        <div className="row" style={{ gap: 12 }}>
          <div className="field" style={{ flex: 1 }}><label>Цель (сумма)</label><input className="input mono" inputMode="decimal" placeholder="0" value={target} onChange={(e) => setTarget(e.target.value)} /></div>
          <div className="field" style={{ flex: 1 }}><label>Уже накоплено</label><input className="input mono" inputMode="decimal" placeholder="0" value={current} onChange={(e) => setCurrent(e.target.value)} /></div>
        </div>
        <div className="field"><label>Срок <span style={{ color: "var(--ink-4)", fontWeight: 500 }}>(необязательно)</span></label><input className="input" type="date" value={due} onChange={(e) => setDue(e.target.value)} /></div>
      </div>
    </Modal>
  );
}

// ════════════════════════════════════════════════════════
// SYNC SECTION
// ════════════════════════════════════════════════════════
function SyncSection() {
  const [syncId, setSyncId] = useState(() => (window.TFSync ? window.TFSync.getSyncId() : localStorage.getItem("tf_sync_id") || ""));
  const [status, setStatus] = useState(null); // { ok, text }
  const [copied, setCopied] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importKey, setImportKey] = useState("");
  const [importErr, setImportErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      const { status: s, ts } = e.detail;
      const time = ts ? new Date(ts).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }) : "";
      if (s === "synced")   setStatus({ ok: true,  text: "Синхронизировано · " + time });
      if (s === "pulled")   setStatus({ ok: true,  text: "Данные обновлены · " + time });
      if (s === "uptodate") setStatus({ ok: true,  text: "Данные актуальны · " + time });
      if (s === "pushing")  setStatus({ ok: null,  text: "Отправка…" });
      if (s === "error")    setStatus({ ok: false, text: "Ошибка синхронизации" });
    };
    window.addEventListener("tf_sync", handler);
    return () => window.removeEventListener("tf_sync", handler);
  }, []);

  function copy() {
    navigator.clipboard.writeText(syncId).catch(() => {});
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  async function syncNow() {
    if (!window.TFSync) return;
    setBusy(true); await window.TFSync.push(); setBusy(false);
  }

  async function doConnect() {
    if (!window.TFSync || !importKey.trim()) return;
    setImportErr(""); setBusy(true);
    const ok = await window.TFSync.connectKey(importKey.trim());
    setBusy(false);
    if (!ok) setImportErr("Ключ не найден. Проверь правильность — и что данные хоть раз синхронизировались с другого устройства.");
  }

  return (
    <div className="card pad" style={{ gap: 16, borderColor: "oklch(60% 0.13 240 / 0.35)" }}>
      {/* Header */}
      <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>☁️ Облачная синхронизация</div>
          <div className="sub" style={{ fontSize: 13, marginTop: 3 }}>Данные сохраняются автоматически и доступны на всех устройствах.</div>
        </div>
        {status && (
          <span className={"pill " + (status.ok === true ? "pos" : status.ok === false ? "neg" : "")} style={{ flex: "none", whiteSpace: "nowrap" }}>
            {status.ok === true ? "✓ " : status.ok === false ? "⚠ " : "⏳ "}{status.text}
          </span>
        )}
      </div>

      {/* Sync key */}
      <div style={{ background: "var(--bg-sunken)", borderRadius: "var(--r-sm)", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-4)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Ключ синхронизации</div>
        <div className="row" style={{ gap: 8 }}>
          <code style={{ flex: 1, fontSize: 11.5, fontFamily: "var(--font-mono)", color: "var(--ink-2)", wordBreak: "break-all", lineHeight: 1.6 }}>{syncId}</code>
          <button className="btn sm" onClick={copy} style={{ flex: "none" }}>{copied ? "✓ Скопирован" : "Копировать"}</button>
        </div>
        <div className="sub" style={{ fontSize: 12 }}>Введи этот ключ на другом устройстве, чтобы данные появились там.</div>
      </div>

      {/* Actions */}
      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        <button className="btn sm brand" onClick={syncNow} disabled={busy}>
          {busy ? "Синхронизирую…" : "↑ Синхронизировать сейчас"}
        </button>
        <button className="btn sm" onClick={() => { setImporting((i) => !i); setImportErr(""); }}>
          {importing ? "Отмена" : "Подключить другое устройство"}
        </button>
      </div>

      {/* Import key */}
      {importing && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Вставь ключ с другого устройства:</div>
          <div className="row" style={{ gap: 8 }}>
            <input className="input" style={{ flex: 1, fontFamily: "var(--font-mono)", fontSize: 12 }}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              value={importKey} onChange={(e) => setImportKey(e.target.value)} />
            <button className="btn sm brand" onClick={doConnect} disabled={!importKey.trim() || busy}>
              {busy ? "…" : "Подключить"}
            </button>
          </div>
          {importErr && <div style={{ fontSize: 12.5, color: "var(--neg)", lineHeight: 1.5 }}>{importErr}</div>}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════
// AI EXPORT
// ════════════════════════════════════════════════════════
function exportForAI() {
  const accounts = S3.getAccounts();
  const txs = S3.getTransactions().slice().sort((a, b) => b.occurred_at.localeCompare(a.occurred_at));
  const flow = S3.monthFlow();
  const cats = S3.categoryBreakdown(30);
  const sr = S3.savingsRate(3);
  const run = S3.runway();
  const ef = S3.emergencyFund();
  const now = new Date();
  const MONTHS = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
  const fmt = (minor, sym) => {
    sym = sym || "сум";
    return (minor / 100).toLocaleString("ru-RU", { maximumFractionDigits: 0 }) + " " + sym;
  };
  const L = [];
  const push = (...xs) => xs.forEach(x => L.push(x));

  push(
    "# T-Finance — финансовый отчёт для ИИ-анализа",
    "Дата: " + now.getDate() + " " + MONTHS[now.getMonth()] + " " + now.getFullYear(),
    ""
  );

  push("## Сводка");
  push("Общий капитал: " + fmt(S3.netWorth()));
  push("Доходы (" + MONTHS[now.getMonth()] + "): " + fmt(flow.inflow));
  push("Расходы (" + MONTHS[now.getMonth()] + "): " + fmt(flow.outflow));
  push("Баланс месяца: " + fmt(flow.inflow - flow.outflow));
  push("Операций всего: " + txs.filter(t => !t.opening).length);
  if (sr.rate !== null) L.push("Норма сбережений (3 мес): " + Math.round(sr.rate) + "%");
  if (run.months !== null) L.push("Runway (сколько месяцев хватит средств): " + run.months.toFixed(1) + " мес");
  if (ef.months !== null) L.push("Подушка безопасности: " + ef.months.toFixed(1) + " мес (цель: 3–6)");
  L.push("");

  push("## Счета");
  accounts.forEach(a => {
    const sym = CUR_SYMBOL[a.currency] || a.currency;
    L.push("- " + a.label + " (" + (ACC_TYPE[a.type] || a.type) + ", " + a.currency + "): " + fmt(a.balance_minor, sym));
  });
  L.push("");

  if (cats.length > 0) {
    push("## Расходы по категориям (последние 30 дней)");
    cats.forEach(c => L.push("- " + c.label + ": " + fmt(c.value_minor)));
    L.push("");
  }

  push(
    "## Все транзакции",
    "Дата | Тип | Категория | Описание | Сумма | Счёт",
    "-----|-----|-----------|----------|-------|-----"
  );
  txs.filter(t => !t.opening).forEach(t => {
    const acc = accounts.find(a => a.id === t.account_id);
    const cat = S3.CATEGORIES.find(c => c.key === t.category_key);
    const type = t.direction === "transfer" ? "Перевод" : t.amount_minor > 0 ? "Доход" : "Расход";
    const catLabel = cat ? cat.label : t.direction === "transfer" ? "Перевод" : "—";
    const sym = acc ? (CUR_SYMBOL[acc.currency] || acc.currency) : "сум";
    const amount = (t.amount_minor > 0 ? "+" : "−") + fmt(Math.abs(t.amount_minor), sym);
    const date = new Date(t.occurred_at).toLocaleDateString("ru-RU");
    const desc = (t.merchant || "—").replace(/\|/g, "/");
    const accLabel = acc ? acc.label : "—";
    const note = t.note ? " [" + t.note + "]" : "";
    L.push(date + " | " + type + " | " + catLabel + " | " + desc + note + " | " + amount + " | " + accLabel);
  });

  const blob = new Blob([L.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const el = document.createElement("a");
  el.href = url;
  el.download = "T-Finance-AI-" + now.toISOString().slice(0, 10) + ".txt";
  document.body.appendChild(el); el.click(); el.remove();
  URL.revokeObjectURL(url);
}

// ════════════════════════════════════════════════════════
// SETTINGS / BACKUP  ← главный экран для пользователя
// ════════════════════════════════════════════════════════
const LAST_BACKUP_KEY = "tf_last_backup";

function Settings({ refresh }) {
  const user = S3.getUser();
  const [name, setName] = useState(user.full_name || "");
  const [last, setLast] = useState(localStorage.getItem(LAST_BACKUP_KEY));
  const fileRef = useRef(null);
  const accounts = S3.getAccounts();
  const txCount = S3.getTransactions().length;

  function saveName() { S3.setUser({ full_name: name }); refresh(); }

  function downloadBackup() {
    const json = S3.exportData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
    a.href = url; a.download = `T-Finance-backup-${stamp}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    const now = new Date().toISOString();
    localStorage.setItem(LAST_BACKUP_KEY, now); setLast(now);
  }

  function restore(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        S3.importData(reader.result);
        alert("Данные восстановлены из бэкапа.");
        window.location.reload();
      } catch (err) { alert("Не удалось прочитать файл: " + err.message); }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function wipe() {
    if (confirm("Стереть ВСЕ данные на этом устройстве? Сначала скачай бэкап! Действие необратимо.")) {
      S3.wipe(); window.location.reload();
    }
  }

  const lastTxt = last ? new Date(last).toLocaleString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }) : null;

  return (
    <div style={{ maxWidth: 640 }}>
      <h1 className="h1">Профиль и бэкап</h1>

      <SectionTitle>Облачная синхронизация</SectionTitle>
      <SyncSection />

      <SectionTitle>Бэкап данных</SectionTitle>
      <div className="card pad" style={{ gap: 16, borderColor: "oklch(36% 0.08 155 / 0.25)" }}>
        <div className="row" style={{ gap: 12, alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Скачать бэкап</div>
            <div className="sub" style={{ fontSize: 13, marginTop: 3 }}>
              Сохранит все счета, операции и цели в один файл <span className="mono">.json</span>. Делай это регулярно — особенно перед чисткой браузера или сменой устройства.
            </div>
            {lastTxt
              ? <div className="pill pos" style={{ marginTop: 10 }}><Icon name="check" size={13} /> Последний бэкап: {lastTxt}</div>
              : <div className="pill neg" style={{ marginTop: 10 }}>Бэкап ещё не делался</div>}
          </div>
          <button className="btn brand" onClick={downloadBackup}><Icon name="download" size={17} /> Скачать</button>
        </div>
        <div style={{ height: 1, background: "var(--line)" }}></div>
        <div className="row" style={{ gap: 12, alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Восстановить из файла</div>
            <div className="sub" style={{ fontSize: 13, marginTop: 3 }}>Загрузит данные из ранее скачанного <span className="mono">.json</span>. Текущие данные на этом устройстве будут заменены.</div>
          </div>
          <button className="btn" onClick={() => fileRef.current.click()}><Icon name="upload" size={17} /> Загрузить</button>
          <input ref={fileRef} type="file" accept="application/json,.json" onChange={restore} style={{ display: "none" }} />
        </div>
      </div>

      <SectionTitle>Анализ с ИИ</SectionTitle>
      <div className="card pad" style={{ gap: 14, borderColor: "oklch(58% 0.13 240 / 0.3)" }}>
        <div className="row" style={{ gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>🤖 Выгрузить для ИИ</div>
            <div className="sub" style={{ fontSize: 13, marginTop: 4, lineHeight: 1.6 }}>
              Все транзакции, счета и ключевые метрики в одном текстовом файле. Отправь ChatGPT, Claude или любому другому ИИ — получи рекомендации по бюджету.
            </div>
            <div style={{ marginTop: 8, fontSize: 12.5, color: "var(--ink-3)" }}>
              {txCount} операций · {accounts.length} счетов · категории · метрики
            </div>
          </div>
          <button className="btn brand" onClick={exportForAI} style={{ flex: "none" }}>
            <Icon name="download" size={16} /> Скачать .txt
          </button>
        </div>
      </div>

      <SectionTitle>Где хранятся данные</SectionTitle>
      <div className="card pad sub" style={{ fontSize: 13.5, lineHeight: 1.6, gap: 6 }}>
        <div>Сейчас в этом приложении: <b className="mono">{accounts.length}</b> счетов, <b className="mono">{txCount}</b> операций.</div>
        <div>Основное хранилище — <b>localStorage</b> браузера + <b>Supabase</b> (облако). Данные синхронизируются автоматически.</div>
        <div style={{ color: "var(--pos)" }}>✓ Доступны на всех устройствах через ключ синхронизации.</div>
      </div>

      <SectionTitle>Имя</SectionTitle>
      <div className="card pad">
        <div className="row" style={{ gap: 10 }}>
          <input className="input" placeholder="Как к тебе обращаться" value={name} onChange={(e) => setName(e.target.value)} style={{ flex: 1 }} />
          <button className="btn" onClick={saveName}>Сохранить</button>
        </div>
      </div>

      <SectionTitle>Опасная зона</SectionTitle>
      <div className="card pad">
        <div className="row" style={{ justifyContent: "space-between", gap: 12 }}>
          <div className="sub" style={{ fontSize: 13 }}>Полностью очистить приложение и начать заново.</div>
          <button className="btn danger" onClick={wipe}><Icon name="trash" size={15} /> Стереть всё</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Goals, GoalModal, SyncSection, Settings });
