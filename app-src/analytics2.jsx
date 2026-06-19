// T-Finance · Analytics — Поведение · Риски · Прогноз · Капитал
const A2 = window.TFStore;

function monthsToText(m) {
  if (m == null) return "—";
  if (m === 0) return "уже достигнута";
  const y = Math.floor(m / 12), r = m % 12;
  if (y === 0) return m + " мес";
  if (r === 0) return y + (y === 1 ? " год" : y < 5 ? " года" : " лет");
  return y + " г " + r + " мес";
}

// ════════════════════════════════════════════════════════
// ПОВЕДЕНИЕ
// ════════════════════════════════════════════════════════
function BehaviorTab() {
  return (
    <div style={GRID}>
      <SavingsRateCard />
      <RunwayCard />
      <ImpulseCard />
    </div>
  );
}

function SavingsRateCard() {
  const sr = A2.savingsRate(3);
  const rate = sr.rate;
  const has = sr.income > 0;
  const tone = rate == null ? "" : rate >= 20 ? "pos" : rate >= 0 ? "warn" : "neg";
  const color = tone === "pos" ? "var(--pos)" : tone === "neg" ? "var(--neg)" : "var(--warn)";
  const verdict = !sr.hasSavings
    ? "Заведи накопительный счёт (Uzum, Avo и т.п.) — тогда сюда попадут реальные сбережения."
    : rate == null ? ""
      : rate >= 20 ? "Отлично — ты выше цели 20%."
        : rate >= 0 ? "Ниже цели 20%. Есть куда расти."
          : "В этот период с накоплений снимали больше, чем откладывали.";

  return (
    <ToolCard title="Норма сбережений" tag="KPI"
      hint="Какая доля дохода реально уходит в накопления (Uzum, Avo и др.). Деньги, что просто лежат на карте или налом, не считаются — они ещё не отложены. Ориентир — 20%+.">
      {!has ? <NeedData msg="Нет доходов за период — норму не посчитать." /> : (
        <>
          <div className="row" style={{ gap: 18, alignItems: "center" }}>
            <Ring pct={rate} color={color}>
              <div>
                <div className="mono" style={{ fontSize: 22, fontWeight: 700, color }}>{Math.round(rate)}%</div>
                <div className="sub" style={{ fontSize: 10 }}>за 3 мес</div>
              </div>
            </Ring>
            <div style={{ flex: 1, minWidth: 0, fontSize: 13, color: "var(--ink-3)", lineHeight: 1.5 }}>{verdict}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 12, borderTop: "1px solid var(--line-2)" }}>
            <KV k="Доход" v={fmtMoney(sr.income)} />
            <KV k="Потрачено" v={fmtMoney(sr.expense)} />
            <KV k="В накопления" v={fmtMoney(sr.saved)} vColor={color} strong />
          </div>
        </>
      )}
    </ToolCard>
  );
}

function RunwayCard() {
  const r = A2.runway();
  const m = r.months;
  const has = r.avgExpense > 0;
  const tone = m == null ? "" : m >= 6 ? "pos" : m >= 3 ? "warn" : "neg";
  return (
    <ToolCard title="Финансовый runway" tag="KPI"
      hint="Сколько месяцев ты протянешь без дохода при текущих расходах.">
      {!has ? <NeedData msg="Нужны расходы за последние месяцы." /> : (
        <>
          <BigStat tone={tone} value={m == null ? "∞" : (m >= 100 ? "99+" : m.toFixed(1)) + " мес"} label="при текущем темпе трат" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <KV k="Ликвидные средства" v={fmtMoney(r.liquid)} />
            <KV k="Средний расход / мес" v={fmtMoney(r.avgExpense)} />
          </div>
        </>
      )}
    </ToolCard>
  );
}

function ImpulseCard() {
  const s = A2.expenseSplit(90);
  const total = s.impulse + s.planned;
  const has = total > 0;
  const impPct = has ? s.impulse / total * 100 : 0;
  return (
    <ToolCard title="Импульс vs план" tag="поведение"
      hint="Разделение трат на запланированные и спонтанные — показывает, где «сливаются» деньги. За 90 дней.">
      {!has ? <NeedData /> : (
        <>
          <SplitBar segments={[{ label: "Плановые", value: s.planned, color: "var(--brand)" }, { label: "Импульсивные", value: s.impulse, color: "var(--c4)" }]} />
          <Legend items={[
            { label: "Плановые", color: "var(--brand)", value: " " + Math.round(100 - impPct) + "%" },
            { label: "Импульсивные", color: "var(--c4)", value: " " + Math.round(impPct) + "%" },
          ]} />
          <div className="row" style={{ justifyContent: "space-between", paddingTop: 4, fontSize: 13 }}>
            <span className="sub">Импульсивные траты</span><span className="mono" style={{ fontWeight: 700 }}>{fmtMoney(s.impulse)}</span>
          </div>
          <div className="sub" style={{ fontSize: 12 }}>{impPct > 35 ? "Высокая доля спонтанных трат — есть что оптимизировать." : "Большинство трат под контролем."}</div>
        </>
      )}
    </ToolCard>
  );
}

// ════════════════════════════════════════════════════════
// РИСКИ
// ════════════════════════════════════════════════════════
function RiskTab() {
  return (
    <div style={GRID}>
      <EmergencyFundCard />
      <FixedVariableCard />
      <IncomeConcentrationCard />
    </div>
  );
}

function EmergencyFundCard() {
  const e = A2.emergencyFund();
  const m = e.months;
  const has = e.avgExpense > 0;
  const pct = m == null ? 0 : Math.min(100, m / 6 * 100);
  const tone = m == null ? "" : m >= 6 ? "pos" : m >= 3 ? "warn" : "neg";
  const color = tone === "pos" ? "var(--pos)" : tone === "neg" ? "var(--neg)" : "var(--warn)";
  return (
    <ToolCard title="Подушка безопасности" tag="риск"
      hint="Хватает ли резервного фонда на 3–6 месяцев расходов.">
      {!has ? <NeedData msg="Нужны расходы за последние месяцы." /> : (
        <>
          <div className="row" style={{ gap: 18, alignItems: "center" }}>
            <Ring pct={pct} color={color}>
              <div>
                <div className="mono" style={{ fontSize: 20, fontWeight: 700, color }}>{m >= 100 ? "99+" : m.toFixed(1)}</div>
                <div className="sub" style={{ fontSize: 10 }}>мес из 6</div>
              </div>
            </Ring>
            <div style={{ flex: 1, minWidth: 0, fontSize: 13, color: "var(--ink-3)", lineHeight: 1.5 }}>{m >= 6 ? "Подушка собрана — ты защищён." : m >= 3 ? "База есть, дотяни до 6 месяцев." : "Подушка мала — это главный риск."}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <KV k="Резерв" v={fmtMoney(e.liquid)} />
            <KV k={"Цель · 6 мес"} v={fmtMoney(e.target6)} />
          </div>
          <div style={{ height: 8, borderRadius: 99, background: "var(--bg-sunken)", overflow: "hidden", position: "relative" }}>
            <div style={{ width: pct + "%", height: "100%", background: color, transition: "width .5s" }}></div>
            <div title="Минимум 3 мес" style={{ position: "absolute", left: "50%", top: -2, bottom: -2, width: 2, background: "var(--ink-4)" }}></div>
          </div>
        </>
      )}
    </ToolCard>
  );
}

function FixedVariableCard() {
  const s = A2.expenseSplit(90);
  const has = s.total > 0;
  const fixedPct = has ? s.fixed / s.total * 100 : 0;
  return (
    <ToolCard title="Фикс vs переменные" tag="риск"
      hint="Какая часть расходов обязательна — показывает гибкость бюджета в кризис. За 90 дней.">
      {!has ? <NeedData /> : (
        <>
          <BigStat value={Math.round(fixedPct) + "%"} label="расходов — обязательные" tone={fixedPct > 65 ? "warn" : undefined} />
          <SplitBar segments={[{ label: "Фиксированные", value: s.fixed, color: "var(--c1)" }, { label: "Переменные", value: s.variable, color: "var(--c3)" }]} />
          <Legend items={[
            { label: "Фикс", color: "var(--c1)", value: " " + fmtMoney(s.fixed) },
            { label: "Переменные", color: "var(--c3)", value: " " + fmtMoney(s.variable) },
          ]} />
          <div className="sub" style={{ fontSize: 12 }}>{fixedPct > 65 ? "Бюджет жёсткий: мало что можно урезать быстро." : "Хорошая гибкость — есть свободный манёвр."}</div>
        </>
      )}
    </ToolCard>
  );
}

function IncomeConcentrationCard() {
  const c = A2.incomeSources(180);
  const has = c.count > 0;
  const top = Math.round(c.topShare);
  const risk = c.count <= 1 ? { t: "Высокий риск", tone: "neg" } : c.topShare > 70 ? { t: "Средний риск", tone: "warn" } : { t: "Диверсифицировано", tone: "pos" };
  const color = risk.tone === "pos" ? "var(--pos)" : risk.tone === "neg" ? "var(--neg)" : "var(--warn)";
  return (
    <ToolCard title="Концентрация дохода" tag="риск"
      hint="Один источник дохода = высокий риск. Чем разнообразнее источники, тем устойчивее. За 180 дней.">
      {!has ? <NeedData msg="Пока нет данных о доходах." /> : (
        <>
          <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-end" }}>
            <BigStat value={top + "%"} label={"в одном источнике · " + c.count + (c.count === 1 ? " источник" : " источника")} />
            <span className="pill" style={{ color, borderColor: color }}>{risk.t}</span>
          </div>
          <SplitBar segments={c.sources.map((s) => ({ label: s.label, value: s.value, color: s.color }))} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}>
            {c.sources.map((s) => (
              <div key={s.key} className="row" style={{ justifyContent: "space-between" }}>
                <span className="row" style={{ gap: 8 }}><span className="dot" style={{ background: s.color }}></span>{s.label}</span>
                <span className="mono">{Math.round(s.share)}%</span>
              </div>
            ))}
          </div>
        </>
      )}
    </ToolCard>
  );
}

// ════════════════════════════════════════════════════════
// ПРОГНОЗ
// ════════════════════════════════════════════════════════
function ForecastTab() {
  return (
    <div style={GRID}>
      <ForecastCard />
      <GoalSimulatorCard />
      <SubscriptionsCard />
    </div>
  );
}

function ForecastCard() {
  const f = A2.forecastSpend();
  const nextMonth = new Date(); nextMonth.setMonth(nextMonth.getMonth() + 1);
  const nm = nextMonth.toLocaleDateString("ru-RU", { month: "long" });
  return (
    <ToolCard title="Прогноз расходов" tag="AI"
      hint="На основе истории предсказывает, сколько ты потратишь в следующем месяце.">
      {f.predicted == null ? <NeedData msg="Нужно минимум 1 завершённый месяц с расходами." /> : (
        <>
          <BigStat value={"≈ " + fmtMoney(f.predicted)} label={"ожидаемые расходы · " + nm} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <KV k="Вероятный диапазон" v={f.min === f.max ? fmtMoney(f.predicted) : fmtMoney(f.min) + " – " + fmtMoney(f.max)} />
            <KV k="Расчёт по" v={f.basisMonths + " мес истории"} />
          </div>
          <div className="sub" style={{ fontSize: 12 }}>Прогноз = среднее за последние месяцы с поправкой на тренд.</div>
        </>
      )}
    </ToolCard>
  );
}

function GoalSimulatorCard() {
  const goals = A2.getGoals();
  const [gid, setGid] = useState(goals[0] ? goals[0].id : "manual");
  const [monthly, setMonthly] = useState("");
  const [rate, setRate] = useState(0);
  const [target, setTarget] = useState("");

  const goal = goals.find((g) => g.id === gid);
  const targetMinor = goal ? goal.target_minor : parseAmount(target);
  const currentMinor = goal ? goal.current_minor : 0;
  const monthlyMinor = parseAmount(monthly);
  const res = A2.simulateGoal(targetMinor, currentMinor, monthlyMinor, rate);
  const ready = targetMinor > 0 && monthlyMinor > 0;

  return (
    <ToolCard title="Симулятор целей" tag="прогноз"
      hint="«Если откладывать X в месяц — цель достигнута через N». Подбери темп и увидишь срок.">
      <div className="field">
        <label>Цель</label>
        <select className="select" value={gid} onChange={(e) => setGid(e.target.value === "manual" ? "manual" : Number(e.target.value))}>
          {goals.map((g) => <option key={g.id} value={g.id}>{g.label} · {fmtMoney(g.target_minor)}</option>)}
          <option value="manual">Своя сумма…</option>
        </select>
      </div>
      {gid === "manual" && (
        <div className="field">
          <label>Сумма цели</label>
          <input className="input" inputMode="decimal" placeholder="0" value={target} onChange={(e) => setTarget(e.target.value)} />
        </div>
      )}
      <div className="field">
        <label>Откладывать в месяц</label>
        <input className="input mono" inputMode="decimal" placeholder="0" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
      </div>
      <div className="field">
        <label>Доходность вложений (годовых)</label>
        <div className="seg" style={{ alignSelf: "flex-start" }}>
          {[0, 5, 10, 15].map((r) => <button key={r} className={rate === r ? "on" : ""} onClick={() => setRate(r)}>{r}%</button>)}
        </div>
      </div>
      <div style={{ padding: "14px 16px", borderRadius: "var(--r-sm)", background: "var(--brand-tint)", color: "var(--brand-ink)" }}>
        {!ready ? <span style={{ fontSize: 13 }}>Введи сумму цели и ежемесячный взнос.</span> : res.done
          ? <span style={{ fontWeight: 700 }}>Цель уже достигнута 🎉</span>
          : res.months == null
            ? <span style={{ fontSize: 13 }}>С таким взносом цель почти недостижима — увеличь сумму.</span>
            : <div><div style={{ fontSize: 13 }}>Цель будет достигнута через</div><div className="mono" style={{ fontSize: 26, fontWeight: 700, marginTop: 2 }}>{monthsToText(res.months)}</div></div>}
      </div>
    </ToolCard>
  );
}

function SubscriptionsCard() {
  const { subs, annualTotal } = A2.detectSubscriptions();
  return (
    <ToolCard title="Детектор подписок" tag="авто"
      hint="Автоопределение повторяющихся платежей и их суммарная стоимость в год."
      wide={subs.length > 4}>
      {subs.length === 0 ? <NeedData msg="Повторяющихся платежей не найдено. Подписки определяются по одинаковым названиям в разные месяцы." /> : (
        <>
          <BigStat tone="neg" value={fmtMoney(annualTotal)} label="в год на регулярные платежи" />
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {subs.map((s, i) => (
              <div key={i} className="row" style={{ justifyContent: "space-between", padding: "10px 0", borderBottom: i < subs.length - 1 ? "1px solid var(--line-2)" : "none" }}>
                <span className="row" style={{ gap: 10, minWidth: 0 }}>
                  <span className="cat-ic" style={{ background: s.color, width: 32, height: 32, fontSize: 14 }}>{CAT_EMOJI[s.catKey] || "🔁"}</span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</span>
                    <span className="sub" style={{ fontSize: 12 }}>{s.count} платежа · ~{fmtMoney(s.amount)}/мес</span>
                  </span>
                </span>
                <span className="mono" style={{ fontWeight: 700 }}>{fmtMoney(s.annual)}/год</span>
              </div>
            ))}
          </div>
        </>
      )}
    </ToolCard>
  );
}

// ════════════════════════════════════════════════════════
// КАПИТАЛ
// ════════════════════════════════════════════════════════
function CapitalTab() {
  return (
    <div style={GRID}>
      <NetWorthCard />
      <DebtLoadCard />
      <InflationCard />
    </div>
  );
}

function NetWorthCard() {
  const series = A2.netWorthSeries(12);
  const vals = series.map((b) => b.value);
  const has = vals.some((v) => v !== 0);
  const min = Math.min(0, ...vals), max = Math.max(1, ...vals);
  const span = max - min || 1;
  const now = vals[vals.length - 1], start = vals[0];
  const change = now - start;
  const n = series.length;
  const x = (i) => i / (n - 1) * 100;
  const y = (v) => 100 - (v - min) / span * 100;
  const line = series.map((b, i) => `${x(i)},${y(b.value)}`).join(" ");
  const area = `0,100 ${line} 100,100`;

  return (
    <ToolCard wide title="Net Worth — чистый капитал" tag="капитал"
      hint="Активы минус обязательства. Главный показатель финансового здоровья — смотри на динамику за 12 месяцев.">
      {!has ? <NeedData msg="Капитал появится, как только добавишь счета и операции." /> : (
        <>
          <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-end" }}>
            <BigStat value={fmtMoney(now)} label="сейчас" />
            <div style={{ textAlign: "right" }}>
              <DeltaChip pct={start !== 0 ? change / Math.abs(start) * 100 : null} />
              <div className="sub" style={{ fontSize: 12, marginTop: 4 }}>{change >= 0 ? "+" : "−"}{fmtMoney(Math.abs(change))} за год</div>
            </div>
          </div>
          <div style={{ position: "relative", height: 150 }}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height: "100%", overflow: "visible" }}>
              <defs>
                <linearGradient id="nwgrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon points={area} fill="url(#nwgrad)" />
              <polyline points={line} fill="none" stroke="var(--brand)" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
              {min < 0 && <line x1="0" y1={y(0)} x2="100" y2={y(0)} stroke="var(--ink-4)" strokeWidth="1" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />}
            </svg>
          </div>
          <div className="row" style={{ justifyContent: "space-between", fontSize: 11.5, color: "var(--ink-4)" }}>
            <span>{MONTHS_SHORT[series[0].m]}</span><span>{MONTHS_SHORT[series[n - 1].m]}</span>
          </div>
        </>
      )}
    </ToolCard>
  );
}

function DebtLoadCard() {
  const d = A2.debtLoad();
  const tone = d.dti == null ? "" : d.dti < 30 ? "pos" : d.dti < 50 ? "warn" : "neg";
  return (
    <ToolCard title="Долговая нагрузка" tag="долг"
      hint="Какой % годового дохода составляют твои долги и кредиты (debt-to-income).">
      {!d.hasCredit ? <NeedData msg="Нет кредитных счетов. Добавь счёт типа «Кредитный», чтобы учитывать долги." /> : (
        <>
          <BigStat tone={tone} value={d.dti == null ? "—" : Math.round(d.dti) + "%"} label="долг к годовому доходу" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <KV k="Текущий долг" v={fmtMoney(d.debt)} />
            <KV k="Доход / мес (средн.)" v={fmtMoney(d.avgMonthlyIncome)} />
          </div>
          {d.dti != null && <div className="sub" style={{ fontSize: 12 }}>{d.dti < 30 ? "Здоровый уровень долга." : d.dti < 50 ? "Умеренная нагрузка — держи под контролем." : "Высокая долговая нагрузка."}</div>}
        </>
      )}
    </ToolCard>
  );
}

function InflationCard() {
  const [rate, setRate] = useState(10);
  const f = A2.inflationImpact(rate);
  const has = f.liquid > 0;
  return (
    <ToolCard title="Поправка на инфляцию" tag="реальные данные"
      hint="Реальная стоимость накоплений с учётом инфляции — сохраняют ли деньги ценность?">
      <div className="field">
        <label>Годовая инфляция</label>
        <div className="seg" style={{ alignSelf: "flex-start" }}>
          {[5, 10, 15, 20].map((r) => <button key={r} className={rate === r ? "on" : ""} onClick={() => setRate(r)}>{r}%</button>)}
        </div>
      </div>
      {!has ? <NeedData msg="Нет ликвидных накоплений для расчёта." /> : (
        <>
          <div className="row" style={{ gap: 20, flexWrap: "wrap" }}>
            <BigStat value={fmtMoney(f.liquid)} label="сейчас, номинально" />
            <BigStat tone="neg" value={fmtMoney(Math.round(f.realIn1y))} label={"через год в нынешних деньгах"} />
          </div>
          <div className="row" style={{ justifyContent: "space-between", fontSize: 13, paddingTop: 4 }}>
            <span className="sub">Потеря от инфляции за год</span><span className="mono" style={{ color: "var(--neg)", fontWeight: 700 }}>−{fmtMoney(Math.round(f.erosion))}</span>
          </div>
          {f.beatsInflation != null && (
            <div className="row" style={{ gap: 8 }}>
              <span className={"pill " + (f.beatsInflation ? "pos" : "neg")}>{f.beatsInflation ? "Обгоняешь инфляцию" : "Отстаёшь от инфляции"}</span>
              <span className="sub" style={{ fontSize: 12 }}>капитал {f.growthPct >= 0 ? "+" : ""}{Math.round(f.growthPct)}% за год</span>
            </div>
          )}
        </>
      )}
    </ToolCard>
  );
}

Object.assign(window, { BehaviorTab, RiskTab, ForecastTab, CapitalTab });
