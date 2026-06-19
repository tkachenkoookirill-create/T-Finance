// T-Finance · Analytics — shell, primitives, Обзор + Тренды
const A = window.TFStore;
const MONTHS_SHORT = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];

// ── shared presentational primitives ─────────────────────
function ToolCard({ title, hint, tag, children, wide }) {
  return (
    <div className="card pad" style={{ display: "flex", flexDirection: "column", gap: 14, gridColumn: wide ? "1 / -1" : "auto" }}>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15.5 }}>{title}</div>
          {hint && <div className="sub" style={{ fontSize: 12.5, marginTop: 3, maxWidth: 460, textWrap: "pretty", lineHeight: 1.45 }}>{hint}</div>}
        </div>
        {tag && <span className="pill" style={{ flex: "none" }}>{tag}</span>}
      </div>
      {children}
    </div>
  );
}

function NeedData({ msg }) {
  return <div className="empty" style={{ padding: "22px 8px", fontSize: 13 }}>{msg || "Недостаточно данных. Добавь больше операций, и инструмент оживёт."}</div>;
}

// floating tooltip that matches the toast/ink chrome — small, never full-screen
function useTip() {
  const [tip, setTip] = useState(null);
  const show = (e, node) => setTip({ x: e.clientX, y: e.clientY, node });
  const move = (e) => setTip((t) => (t ? { ...t, x: e.clientX, y: e.clientY } : t));
  const hide = () => setTip(null);
  const handlers = (node) => ({
    onMouseEnter: (e) => show(e, node),
    onMouseMove: move,
    onMouseLeave: hide,
  });
  const el = tip ? (
    <div style={{
      position: "fixed", left: tip.x, top: tip.y, transform: "translate(-50%, calc(-100% - 14px))", zIndex: 80, pointerEvents: "none",
      background: "var(--ink)", color: "var(--bg)", padding: "8px 11px", borderRadius: "var(--r-sm)",
      boxShadow: "var(--shadow-3)", fontSize: 12.5, lineHeight: 1.45, whiteSpace: "nowrap", maxWidth: "60vw",
    }}>{tip.node}</div>
  ) : null;
  return { handlers, el };
}

function Ring({ pct, size = 96, stroke = 9, color = "var(--brand)", track = "var(--bg-sunken)", children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(100, pct || 0));
  return (
    <div style={{ position: "relative", width: size, height: size, flex: "none" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - p / 100)} style={{ transition: "stroke-dashoffset .55s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center", lineHeight: 1.1 }}>{children}</div>
    </div>
  );
}

function SplitBar({ segments, height = 12 }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <div style={{ display: "flex", height, borderRadius: 99, overflow: "hidden", gap: 2, background: "var(--bg-sunken)" }}>
      {segments.map((s, i) => s.value > 0 ? <div key={i} title={s.label} style={{ width: (s.value / total * 100) + "%", background: s.color, minWidth: 2 }}></div> : null)}
    </div>
  );
}

function Legend({ items }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 18px", fontSize: 13 }}>
      {items.map((it, i) => (
        <span key={i} className="row" style={{ gap: 7 }}>
          <span className="dot" style={{ background: it.color }}></span>{it.label}
          {it.value != null && <b className="mono" style={{ fontWeight: 700 }}>{it.value}</b>}
        </span>
      ))}
    </div>
  );
}

// label / value row that never overlaps (value stays nowrap, label shrinks)
function KV({ k, v, vColor, strong }) {
  return (
    <div className="row" style={{ justifyContent: "space-between", gap: 14, alignItems: "baseline" }}>
      <span style={{ flex: "1 1 auto", minWidth: 0, fontSize: 13, color: strong ? "var(--ink)" : "var(--ink-3)", fontWeight: strong ? 600 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{k}</span>
      <span className="mono" style={{ flex: "none", whiteSpace: "nowrap", fontWeight: strong ? 700 : 600, color: vColor }}>{v}</span>
    </div>
  );
}

// big number + caption
function BigStat({ value, label, tone, sub }) {
  const color = tone === "pos" ? "var(--pos)" : tone === "neg" ? "var(--neg)" : tone === "warn" ? "var(--warn)" : "var(--ink)";
  return (
    <div>
      <div className="mono" style={{ fontSize: 30, fontWeight: 700, color, letterSpacing: "-0.02em", lineHeight: 1 }}>{value}</div>
      {label && <div className="sub" style={{ fontSize: 12.5, marginTop: 5 }}>{label}</div>}
      {sub}
    </div>
  );
}

// signed % chip for deltas (more = red for spend by default)
function DeltaChip({ pct, invert }) {
  if (pct == null) return <span className="pill" style={{ whiteSpace: "nowrap" }}>нет данных</span>;
  const up = pct >= 0;
  const bad = invert ? up : !up; // for spend: up = bad
  const cls = pct === 0 ? "" : bad ? "neg" : "pos";
  const arrow = up ? "▲" : "▼";
  return <span className={"pill " + cls} style={{ whiteSpace: "nowrap" }}>{arrow} {Math.abs(pct).toFixed(pct >= 100 || pct <= -100 ? 0 : 1)}%</span>;
}

// ════════════════════════════════════════════════════════
// SHELL
// ════════════════════════════════════════════════════════
const ANALYTICS_TABS = [
  { key: "overview",  label: "Обзор" },
  { key: "trends",    label: "Тренды" },
  { key: "behavior",  label: "Поведение" },
  { key: "risk",      label: "Риски" },
  { key: "forecast",  label: "Прогноз" },
  { key: "capital",   label: "Капитал" },
  { key: "advanced",  label: "🔬 Продвинутая" },
];

function Analytics({ go }) {
  const [tab, setTab] = useState(localStorage.getItem("tf_an_tab") || "overview");
  const goTab = (k) => { setTab(k); localStorage.setItem("tf_an_tab", k); };

  return (
    <div>
      <h1 className="h1">Аналитика</h1>
      <div className="sub" style={{ marginTop: 2, marginBottom: 16 }}>Инструменты считаются прямо из твоих операций — ничего не уходит на сервер.</div>

      <div className="an-tabs" style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 20, borderBottom: "1px solid var(--line)" }}>
        {ANALYTICS_TABS.map((t) => (
          <button key={t.key} onClick={() => goTab(t.key)}
            style={{
              border: "none", background: "none", padding: "9px 4px", margin: "0 8px 0 0", whiteSpace: "nowrap",
              fontSize: 14, fontWeight: 700, cursor: "pointer",
              color: tab === t.key ? "var(--brand-ink)" : "var(--ink-3)",
              borderBottom: tab === t.key ? "2px solid var(--brand)" : "2px solid transparent", marginBottom: -1,
            }}>{t.label}</button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab />}
      {tab === "trends" && <TrendsTab go={go} />}
      {tab === "behavior" && <BehaviorTab />}
      {tab === "risk" && <RiskTab />}
      {tab === "forecast" && <ForecastTab />}
      {tab === "capital"   && <CapitalTab />}
      {tab === "advanced"  && <AdvancedTab />}
    </div>
  );
}

const GRID = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(310px, 100%), 1fr))", gap: 16, alignItems: "start" };

// ════════════════════════════════════════════════════════
// ОБЗОР
// ════════════════════════════════════════════════════════
function OverviewTab() {
  const [days, setDays] = useState(30);
  const cats = A.categoryBreakdown(days);
  const series = A.monthlySeries(6);
  const maxVal = Math.max(1, ...series.map((b) => Math.max(b.inflow, b.outflow)));
  const totalSpend = cats.reduce((s, c) => s + c.value_minor, 0);
  const tip = useTip();
  const monthFull = (m) => ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"][m];

  return (
    <div style={GRID}>
      <ToolCard wide title="Расходы по категориям" tag={
        <span className="seg">
          {[30, 90, 365].map((d) => <button key={d} className={days === d ? "on" : ""} onClick={() => setDays(d)}>{d === 365 ? "Год" : d + " дн"}</button>)}
        </span>
      }>
        {cats.length === 0 ? <NeedData msg="Нет расходов за период." /> : (
          <>
            <div className="mono" style={{ fontSize: 24, fontWeight: 700 }}>{fmtMoney(totalSpend)}</div>
            <CategoryBars cats={cats} />
          </>
        )}
      </ToolCard>

      <ToolCard wide title="Поток по месяцам" hint="Доходы и расходы за последние 6 месяцев.">
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 200, padding: "8px 0" }}>
          {series.map((b, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end" }}>
              <div className="row" style={{ alignItems: "flex-end", gap: 4, height: "100%", width: "100%", justifyContent: "center" }}>
                <div {...tip.handlers(<span><b>{monthFull(b.m)}</b> · доход<br />{fmtMoney(b.inflow)}</span>)} style={{ width: "38%", maxWidth: 26, height: (b.inflow / maxVal * 100) + "%", background: "var(--pos)", borderRadius: "4px 4px 0 0", minHeight: b.inflow ? 3 : 0, cursor: "default" }}></div>
                <div {...tip.handlers(<span><b>{monthFull(b.m)}</b> · расход<br />{fmtMoney(b.outflow)}</span>)} style={{ width: "38%", maxWidth: 26, height: (b.outflow / maxVal * 100) + "%", background: "var(--neg)", borderRadius: "4px 4px 0 0", minHeight: b.outflow ? 3 : 0, cursor: "default" }}></div>
              </div>
              <div className="sub" style={{ fontSize: 11.5 }}>{MONTHS_SHORT[b.m]}</div>
            </div>
          ))}
        </div>
        <Legend items={[{ label: "Доход", color: "var(--pos)" }, { label: "Расход", color: "var(--neg)" }]} />
      </ToolCard>
      {tip.el}
    </div>
  );
}

// ════════════════════════════════════════════════════════
// ТРЕНДЫ
// ════════════════════════════════════════════════════════
function TrendsTab({ go }) {
  return (
    <div style={GRID}>
      <MovingAvgCard />
      <MomYoyCard />
      <HeatmapCard go={go} />
    </div>
  );
}

function MovingAvgCard() {
  const [win, setWin] = useState(3);
  const data = A.movingAverage(6, win);
  const hasData = data.some((d) => d.outflow > 0);
  const max = Math.max(1, ...data.map((d) => Math.max(d.outflow, d.avg)));
  const last = data[data.length - 1];
  const n = data.length;
  const pts = data.map((d, i) => `${(i + 0.5) / n * 100},${100 - d.avg / max * 100}`).join(" ");
  const tip = useTip();

  return (
    <ToolCard title="Скользящее среднее" tag="тренд"
      hint="Средние расходы за несколько месяцев — убирает сезонные всплески и показывает реальный тренд.">
      <div className="seg" style={{ alignSelf: "flex-start" }}>
        {[3, 6].map((w) => <button key={w} className={win === w ? "on" : ""} onClick={() => setWin(w)}>{w} мес</button>)}
      </div>
      {!hasData ? <NeedData /> : (
        <>
          <div style={{ position: "relative", height: 150 }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: "100%" }}>
              {data.map((d, i) => (
                <div key={i} {...tip.handlers(<span><b>{MONTHS_SHORT[d.m]}</b><br />расход: {fmtMoney(d.outflow)}<br />среднее за {win} мес: {fmtMoney(d.avg)}</span>)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%", gap: 6, cursor: "default" }}>
                  <div style={{ width: "58%", maxWidth: 30, height: (d.outflow / max * 100) + "%", background: "var(--bg-sunken)", border: "1px solid var(--line)", borderRadius: "4px 4px 0 0", minHeight: 2 }}></div>
                  <div className="sub" style={{ fontSize: 11 }}>{MONTHS_SHORT[d.m]}</div>
                </div>
              ))}
            </div>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", left: 0, right: 0, top: 0, height: "calc(100% - 22px)", width: "100%", overflow: "visible", pointerEvents: "none" }}>
              <polyline points={pts} fill="none" stroke="var(--brand)" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
              {data.map((d, i) => <circle key={i} cx={(i + 0.5) / n * 100} cy={100 - d.avg / max * 100} r="1.6" fill="var(--brand)" vectorEffect="non-scaling-stroke" />)}
            </svg>
          </div>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span className="row" style={{ gap: 7, fontSize: 12.5, color: "var(--ink-3)" }}><span style={{ width: 14, height: 2, background: "var(--brand)", borderRadius: 2 }}></span>Среднее за {win} мес</span>
            <span className="mono" style={{ fontWeight: 700 }}>{fmtMoney(last.avg)}</span>
          </div>
          {tip.el}
        </>
      )}
    </ToolCard>
  );
}

function MomYoyCard() {
  const d = A.momYoY();
  const monthName = new Date().toLocaleDateString("ru-RU", { month: "long" });

  function Row({ title, cur, base, pct, invert, baseLabel }) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 7, padding: "12px 0", borderBottom: "1px solid var(--line-2)" }}>
        <div className="row" style={{ justifyContent: "space-between", gap: 10 }}>
          <span style={{ fontWeight: 600, fontSize: 13.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</span>
          <DeltaChip pct={pct} invert={invert} />
        </div>
        <div className="row" style={{ justifyContent: "space-between", gap: 10, fontSize: 12.5, color: "var(--ink-3)" }}>
          <span style={{ whiteSpace: "nowrap" }}>{baseLabel}: <span className="mono">{fmtMoney(base)}</span></span>
          <span style={{ whiteSpace: "nowrap" }}>сейчас: <span className="mono" style={{ color: "var(--ink)", fontWeight: 600 }}>{fmtMoney(cur)}</span></span>
        </div>
      </div>
    );
  }

  const empty = !d.spend.cur && !d.spend.prevM && !d.spend.prevY;
  return (
    <ToolCard title="MoM / YoY сравнение" tag="тренд"
      hint="Изменение месяц к месяцу и год к году — сразу видно аномалии и рост трат.">
      {empty ? <NeedData /> : (
        <div>
          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.05em", color: "var(--ink-4)", textTransform: "uppercase", marginBottom: 2 }}>Расходы · {monthName}</div>
          <Row title="Месяц к месяцу" cur={d.spend.cur} base={d.spend.prevM} pct={d.spend.mom} invert baseLabel="прошлый мес" />
          <Row title="Год к году" cur={d.spend.cur} base={d.spend.prevY} pct={d.spend.yoy} invert baseLabel="год назад" />
          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.05em", color: "var(--ink-4)", textTransform: "uppercase", margin: "14px 0 2px" }}>Доходы</div>
          <Row title="Месяц к месяцу" cur={d.income.cur} base={d.income.prevM} pct={d.income.mom} baseLabel="прошлый мес" />
        </div>
      )}
    </ToolCard>
  );
}

function HeatmapCard({ go }) {
  const [view, setView] = useState("weekday");
  const h = A.dayHeatmap(90);
  const arr = view === "weekday" ? h.weekday : h.dom;
  const max = Math.max(1, ...arr);
  const hasData = arr.some((v) => v > 0);
  const wdLabels = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  const wdFull = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];
  const tip = useTip();

  function cellColor(v) {
    if (v <= 0) return "var(--bg-sunken)";
    const t = 0.15 + 0.85 * (v / max);
    return `color-mix(in oklch, var(--neg) ${Math.round(t * 100)}%, var(--bg-sunken))`;
  }
  function open(mode, value) {
    window.__tfDayFilter = mode === "weekday"
      ? { mode, value, label: wdFull[value] }
      : { mode, value, label: (value + 1) + " число" };
    go && go("history");
  }

  return (
    <ToolCard wide title="Тепловая карта дней" tag="визуал"
      hint="В какие дни недели и числа месяца ты тратишь больше всего, за последние 90 дней. Число в ячейке — доля расходов относительно самого «дорогого» дня (он = 100%). Наведи — точная сумма, нажми — операции этого дня в Истории.">
      <div className="seg" style={{ alignSelf: "flex-start" }}>
        <button className={view === "weekday" ? "on" : ""} onClick={() => setView("weekday")}>По дням недели</button>
        <button className={view === "dom" ? "on" : ""} onClick={() => setView("dom")}>По числам месяца</button>
      </div>
      {!hasData ? <NeedData /> : view === "weekday" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
          {h.weekday.map((v, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div {...tip.handlers(<span><b>{wdFull[i]}</b><br />{v > 0 ? "расход: " + fmtMoney(v) : "нет расходов"}</span>)}
                onClick={() => open("weekday", i)}
                style={{ height: 56, borderRadius: 10, background: cellColor(v), border: "1px solid var(--line)", display: "grid", placeItems: "center", color: v / max > 0.55 ? "#fff" : "var(--ink-3)", fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>
                {v > 0 ? Math.round(v / max * 100) + "%" : ""}
              </div>
              <div className="sub" style={{ fontSize: 12, marginTop: 5 }}>{wdLabels[i]}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(30px, 1fr))", gap: 5 }}>
          {h.dom.map((v, i) => (
            <div key={i} {...tip.handlers(<span><b>{i + 1} число</b><br />{v > 0 ? "расход: " + fmtMoney(v) : "нет расходов"}</span>)}
              onClick={() => open("dom", i)}
              style={{ aspectRatio: "1", borderRadius: 7, background: cellColor(v), border: "1px solid var(--line)", display: "grid", placeItems: "center", fontSize: 10.5, fontWeight: 600, color: v / max > 0.55 ? "#fff" : "var(--ink-4)", cursor: "pointer" }}>
              {i + 1}
            </div>
          ))}
        </div>
      )}
      {tip.el}
    </ToolCard>
  );
}

Object.assign(window, {
  MONTHS_SHORT, ToolCard, NeedData, Ring, SplitBar, Legend, KV, BigStat, DeltaChip, GRID,
  Analytics, OverviewTab, TrendsTab,
});
