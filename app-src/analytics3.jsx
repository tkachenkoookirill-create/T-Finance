// T-Finance · Продвинутая аналитика — 5 модулей
const A3 = window.TFStore;
const { useMemo, useCallback } = React; // extend globals via Babel var compilation

// local useTip (same as analytics.jsx)
function useTip3() {
  const [tip, setTip] = useState(null);
  const show = (e, node) => setTip({ x: e.clientX, y: e.clientY, node });
  const move = (e) => setTip((t) => t ? { ...t, x: e.clientX, y: e.clientY } : t);
  const hide = () => setTip(null);
  const handlers = (node) => ({ onMouseEnter: (e) => show(e, node), onMouseMove: move, onMouseLeave: hide });
  const el = tip ? (
    <div style={{ position: "fixed", left: tip.x, top: tip.y, transform: "translate(-50%,calc(-100% - 12px))", zIndex: 80, pointerEvents: "none", background: "var(--ink)", color: "var(--bg)", padding: "8px 12px", borderRadius: "var(--r-sm)", boxShadow: "var(--shadow-3)", fontSize: 12.5, lineHeight: 1.45, whiteSpace: "nowrap", maxWidth: "60vw" }}>{tip.node}</div>
  ) : null;
  return { handlers, el };
}

// ── Advanced shell ────────────────────────────────────────
const ADV_TABS = [
  { key: "patterns",   label: "Паттерны" },
  { key: "flow",       label: "Потоки" },
  { key: "efficiency", label: "Эффективность" },
  { key: "scenarios",  label: "Сценарии" },
  { key: "health",     label: "Health Score" },
];

function AdvancedTab() {
  const [tab, setTab] = useState(localStorage.getItem("tf_adv_tab") || "patterns");
  const goTab = (k) => { setTab(k); localStorage.setItem("tf_adv_tab", k); };
  return (
    <div>
      <div style={{ display: "flex", gap: 0, overflowX: "auto", paddingBottom: 4, marginBottom: 20, borderBottom: "1px solid var(--line)" }}>
        {ADV_TABS.map((t) => (
          <button key={t.key} onClick={() => goTab(t.key)} style={{ border: "none", background: "none", padding: "7px 0", marginRight: 22, whiteSpace: "nowrap", fontSize: 13.5, fontWeight: 700, cursor: "pointer", color: tab === t.key ? "var(--brand-ink)" : "var(--ink-3)", borderBottom: tab === t.key ? "2px solid var(--brand)" : "2px solid transparent", marginBottom: -1 }}>{t.label}</button>
        ))}
      </div>
      {tab === "patterns"   && <PatternsTab />}
      {tab === "flow"       && <FlowTab />}
      {tab === "efficiency" && <EfficiencyTab />}
      {tab === "scenarios"  && <ScenariosTab />}
      {tab === "health"     && <HealthTab />}
    </div>
  );
}

// ════════════════════════════════════════════════════════
// МОДУЛЬ 1 · ПОВЕДЕНЧЕСКИЕ ПАТТЕРНЫ
// ════════════════════════════════════════════════════════
function PatternsTab() {
  return <div style={GRID}><ChronologyCard /><AnomalyCard /><TriggersCard /></div>;
}

function ChronologyCard() {
  const [view, setView] = useState("hourly");
  const hourly = A3.hourlySpending(90);
  const salary = A3.salaryDaySpending();
  const tip = useTip3();

  const maxH = Math.max(1, ...hourly.map((h) => h.total));
  const sortedH = hourly.slice().sort((a, b) => b.total - a.total);
  const dangerSet = new Set(sortedH.slice(0, 3).map((h) => h.h));
  const maxS = Math.max(1, ...salary.data.map((d) => d.total));
  const hasH = hourly.some((h) => h.total > 0);
  const hasS = salary.data.some((d) => d.total > 0);

  const hourlyInsight = () => {
    const top = sortedH[0];
    if (!top || top.total === 0) return null;
    const tag = top.h >= 12 && top.h <= 14 ? "обеденный импульс" : top.h >= 19 ? "вечерние покупки" : top.h >= 17 ? "после работы" : null;
    return "Пиковый час — " + top.h + ":00" + (tag ? " (" + tag + ")" : "");
  };
  const salaryInsight = () => salary.ratio ? "В первые 7 дней после зарплаты тратишь в " + salary.ratio.toFixed(1) + "× больше, чем в оставшиеся" : null;

  return (
    <ToolCard wide title="Хронология трат" hint="Распределение расходов по часам суток и по дням зарплатного цикла.">
      <div className="seg" style={{ alignSelf: "flex-start" }}>
        <button className={view === "hourly" ? "on" : ""} onClick={() => setView("hourly")}>По часам</button>
        <button className={view === "salary" ? "on" : ""} onClick={() => setView("salary")}>Цикл зарплаты</button>
      </div>
      {view === "hourly" ? (!hasH ? <NeedData /> : <>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 130, padding: "4px 0" }}>
          {hourly.map((h) => {
            const danger = dangerSet.has(h.h);
            return (
              <div key={h.h} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%", gap: 2, cursor: "default" }}
                {...tip.handlers(<span><b>{h.h}:00–{h.h + 1}:00</b><br />расход: {fmtMoney(h.total)}<br />{h.count} операции</span>)}>
                <div style={{ width: "75%", height: (h.total / maxH * 100) + "%", minHeight: h.total ? 2 : 0, background: danger ? "var(--neg)" : "var(--brand-tint)", border: danger ? "1px solid oklch(56% 0.18 25 / 0.4)" : "1px solid transparent", borderRadius: "3px 3px 0 0" }}></div>
                {h.h % 6 === 0 && <div className="sub" style={{ fontSize: 9.5 }}>{h.h}</div>}
              </div>
            );
          })}
        </div>
        <div className="row" style={{ gap: 12, fontSize: 12 }}>
          <span className="row" style={{ gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: "var(--neg)" }}></span>Пиковые часы</span>
          <span className="row" style={{ gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: "var(--brand-tint)", border: "1px solid var(--line)" }}></span>Обычные</span>
        </div>
        {hourlyInsight() && <div style={{ padding: "10px 14px", borderRadius: "var(--r-sm)", background: "var(--brand-tint)", color: "var(--brand-ink)", fontSize: 13, lineHeight: 1.5 }}>💡 {hourlyInsight()}</div>}
      </>) : (!hasS ? <NeedData msg="Добавь больше операций, чтобы увидеть цикл зарплаты." /> : <>
        <div className="sub" style={{ fontSize: 12.5 }}>Дата зарплаты: ~{salary.salaryDOM} число месяца</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 130, padding: "4px 0" }}>
          {salary.data.map((d, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%", gap: 2, cursor: "default" }}
              {...tip.handlers(<span><b>День {d.day}</b><br />расход: {fmtMoney(d.total)}<br />{d.count} операции</span>)}>
              <div style={{ width: "75%", height: (d.total / maxS * 100) + "%", minHeight: d.total ? 2 : 0, background: i < 7 ? "var(--neg)" : "var(--brand-tint)", borderRadius: "3px 3px 0 0" }}></div>
              {(i === 0 || (i + 1) % 7 === 0) && <div className="sub" style={{ fontSize: 9.5 }}>{i + 1}</div>}
            </div>
          ))}
        </div>
        {salaryInsight() && <div style={{ padding: "10px 14px", borderRadius: "var(--r-sm)", background: "oklch(56% 0.18 25 / 0.07)", color: "var(--neg)", fontSize: 13, lineHeight: 1.5 }}>💡 {salaryInsight()}</div>}
      </>)}
      {tip.el}
    </ToolCard>
  );
}

function AnomalyCard() {
  const data = A3.anomalyDetector();
  const [read, setRead] = useState(() => { try { return JSON.parse(localStorage.getItem("tf_anom_read") || "[]"); } catch { return []; } });
  const markRead = (k) => { const n = [...read, k]; setRead(n); localStorage.setItem("tf_anom_read", JSON.stringify(n)); };
  const { categoryAnomalies: anoms, largeTx } = data;
  const hasData = anoms.length > 0 || largeTx.length > 0;

  return (
    <ToolCard title="Детектор аномалий" tag="алерт" hint="Категории, где текущий месяц превышает среднее+2σ за 6 мес, и разово крупные траты.">
      {!hasData ? <div className="empty" style={{ padding: "18px 8px", fontSize: 13, color: "var(--pos)" }}>✅ Всё в норме — аномалий нет</div> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {anoms.map((a) => {
            const isNew = !read.includes(a.catKey);
            return (
              <div key={a.catKey} onClick={() => markRead(a.catKey)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: "1px solid var(--line-2)", cursor: "pointer" }}>
                <span className="cat-ic" style={{ background: a.color, width: 32, height: 32, fontSize: 13 }}>{CAT_EMOJI[a.catKey] || "•"}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row" style={{ justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 13.5 }}>{a.label}</span>
                    <span className="pill neg">+{a.pct}%</span>
                  </div>
                  <div className="sub" style={{ fontSize: 12, marginTop: 2 }}>обычно {fmtMoney(a.mean)} · сейчас {fmtMoney(a.current)} · {a.sigma}σ</div>
                </div>
                {isNew && <span style={{ width: 8, height: 8, borderRadius: 99, background: "var(--neg)", flex: "none" }}></span>}
              </div>
            );
          })}
          {largeTx.length > 0 && <>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "var(--ink-4)", textTransform: "uppercase", margin: "12px 0 6px" }}>Крупные разовые траты (30 дней)</div>
            {largeTx.map((t) => (
              <div key={t.id} style={{ padding: "9px 0", borderBottom: "1px solid var(--line-2)" }}>
                <div className="row" style={{ justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 13.5 }}>{t.merchant || t.catLabel}</span>
                  <span className="mono" style={{ fontWeight: 700, color: "var(--neg)" }}>{fmtMoney(t.amount)}</span>
                </div>
                <div className="sub" style={{ fontSize: 12, marginTop: 2 }}>{t.catLabel} · в {t.multiplier}× больше среднего ({fmtMoney(t.catAvg)})</div>
              </div>
            ))}
          </>}
        </div>
      )}
    </ToolCard>
  );
}

function TriggersCard() {
  const data = A3.stressTriggers(90);
  return (
    <ToolCard title="Стресс-триггеры" tag="паттерн" hint="В каких контекстах расходы выше базового уровня. Топ-3 категории вклада в каждый всплеск. За 90 дней.">
      {!data.length ? <NeedData /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {data.slice(0, 4).map((ctx) => {
            const isMore = ctx.pct > 0;
            return (
              <div key={ctx.key} style={{ padding: "12px 14px", borderRadius: "var(--r-sm)", border: "1px solid var(--line)", background: "var(--bg-elev)" }}>
                <div className="row" style={{ justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{ctx.label}</span>
                  <span className={"pill " + (isMore ? "neg" : "pos")}>{isMore ? "+" : ""}{Math.round(ctx.pct)}% к базе</span>
                </div>
                <div className="sub" style={{ fontSize: 12, marginBottom: 8 }}>{fmtMoney(Math.round(ctx.avgPerDay))}/день · база {fmtMoney(Math.round(ctx.basePerDay))}/день</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {ctx.topCats.map((c) => (
                    <span key={c.key} className="row" style={{ gap: 5, fontSize: 12, background: "var(--bg-sunken)", padding: "3px 9px", borderRadius: 99, border: "1px solid var(--line)" }}>
                      <span className="dot" style={{ background: c.color }}></span>{c.label}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ToolCard>
  );
}

// ════════════════════════════════════════════════════════
// МОДУЛЬ 2 · ГРАФ ДЕНЕЖНЫХ ПОТОКОВ
// ════════════════════════════════════════════════════════
function FlowTab() {
  return <div style={GRID}><SankeyCard /><CounterpartiesCard /></div>;
}

function SankeyCard() {
  const [days, setDays] = useState(30);
  const data = A3.sankeyData(days);
  const containerRef = useRef(null);
  const [w, setW] = useState(560);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(([e]) => setW(Math.floor(e.contentRect.width)));
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const H = 290, NW = 16, GAP = 7;

  function layout(items, xPos) {
    const total = items.reduce((s, n) => s + n.value, 0) || 1;
    const usable = H - GAP * Math.max(0, items.length - 1);
    let y = 0;
    return items.map((item) => {
      const h = Math.max(6, item.value / total * usable);
      const node = { ...item, x: xPos, y, h, total };
      y += h + GAP;
      return node;
    });
  }

  const showCats = data.expCats.filter((c) => c.value > 0).slice(0, 9);
  const c1x = 14, c2x = Math.round((w - NW) / 2), c3x = w - NW - 14;
  const col1 = layout(data.incomes, c1x);
  const col2 = layout(data.groups, c2x);
  const col3 = layout(showCats, c3x);

  function buildFlows(srcs, dsts, getFlowVal) {
    const flows = [];
    const sp = Object.fromEntries(srcs.map((n) => [n.key, n.y]));
    const dp = Object.fromEntries(dsts.map((n) => [n.key, n.y]));
    srcs.forEach((src) => {
      dsts.forEach((dst) => {
        const { sh, dh, val, color } = getFlowVal(src, dst);
        if (sh < 1 || dh < 1) return;
        flows.push({ x0: src.x + NW, y0: sp[src.key] + sh / 2, x1: dst.x, y1: dp[dst.key] + dh / 2, sw: (sh + dh) / 2, color, val, label: src.label + " → " + dst.label });
        sp[src.key] += sh;
        dp[dst.key] += dh;
      });
    });
    return flows;
  }

  const totalInc = col1.reduce((s, n) => s + n.value, 0) || 1;
  const totalGrp = col2.reduce((s, n) => s + n.value, 0) || 1;
  const flows1 = col1.length && col2.length ? buildFlows(col1, col2, (src, dst) => ({
    sh: Math.max(1, src.h * dst.value / totalGrp),
    dh: Math.max(1, dst.h * src.value / totalInc),
    val: Math.round(src.value * dst.value / totalGrp),
    color: src.color,
  })) : [];

  const grpCatTotal = { essential: 0, variable: 0 };
  showCats.forEach((c) => { const g = c.essential ? "essential" : "variable"; grpCatTotal[g] += c.value; });
  const flows2 = col2.length && col3.length ? buildFlows(
    col2.filter((g) => g.key === "essential" || g.key === "variable"),
    col3,
    (grp, cat) => {
      if ((cat.essential ? "essential" : "variable") !== grp.key) return { sh: 0, dh: 0, val: 0, color: grp.color };
      const gTotal = grpCatTotal[grp.key] || 1;
      const ratio = cat.value / gTotal;
      return { sh: Math.max(1, grp.h * ratio), dh: cat.h, val: cat.value, color: grp.color };
    }
  ) : [];

  function FlowPath({ x0, y0, x1, y1, sw, color, label, val }) {
    const cx = x0 + (x1 - x0) * 0.5;
    const d = `M${x0},${y0} C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
    return <path d={d} fill="none" stroke={color} strokeWidth={Math.max(2, sw)} strokeOpacity="0.38"
      style={{ cursor: "pointer" }}
      onMouseEnter={(e) => setTooltip({ x: e.clientX, y: e.clientY, label, val })}
      onMouseMove={(e) => setTooltip((t) => t ? { ...t, x: e.clientX, y: e.clientY } : t)}
      onMouseLeave={() => setTooltip(null)} />;
  }

  const fs = Math.max(9.5, Math.min(11.5, w / 58));
  const hasData = col1.length > 0 || col2.length > 0;

  return (
    <ToolCard wide title="Граф денежных потоков" hint="Как деньги перетекают: источники дохода → группы расходов → категории. Наведи на поток — увидишь сумму.">
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <span className="sub" style={{ fontSize: 12.5 }}>Период:</span>
        <span className="seg">
          {[[30, "Мес"], [90, "3 мес"], [365, "Год"]].map(([d, l]) => <button key={d} className={days === d ? "on" : ""} onClick={() => setDays(d)}>{l}</button>)}
        </span>
      </div>
      {!hasData ? <NeedData msg="Нет операций за выбранный период." /> : <>
        <div ref={containerRef}>
          <svg width={w} height={H + 44} style={{ overflow: "visible", display: "block" }}>
            {flows1.map((f, i) => <FlowPath key={"f1" + i} {...f} />)}
            {flows2.map((f, i) => <FlowPath key={"f2" + i} {...f} />)}
            {col1.map((n) => <g key={n.key}>
              <rect x={n.x} y={n.y} width={NW} height={n.h} rx={4} fill={n.color} />
              <text x={n.x - 5} y={n.y + n.h / 2 + 4} fontSize={fs} fill="var(--ink-2)" textAnchor="end" style={{ userSelect: "none" }}>{n.label}</text>
            </g>)}
            {col2.map((n) => <g key={n.key}>
              <rect x={n.x} y={n.y} width={NW} height={n.h} rx={4} fill={n.color} />
              <text x={n.x + NW / 2} y={n.y + n.h + 14} fontSize={fs - 0.5} fill="var(--ink-3)" textAnchor="middle" style={{ userSelect: "none" }}>{n.label}</text>
            </g>)}
            {col3.map((n) => <g key={n.key}>
              <rect x={n.x} y={n.y} width={NW} height={n.h} rx={4} fill={n.color} />
              <text x={n.x + NW + 5} y={n.y + n.h / 2 + 4} fontSize={fs} fill="var(--ink-2)" textAnchor="start" style={{ userSelect: "none" }}>{n.label}</text>
            </g>)}
            {[["ДОХОДЫ", c1x + NW / 2], ["ГРУППЫ", c2x + NW / 2], ["КАТЕГОРИИ", c3x + NW / 2]].map(([lbl, lx]) => (
              <text key={lbl} x={lx} y={H + 36} fontSize={10} fill="var(--ink-4)" textAnchor="middle" fontWeight="700" letterSpacing="0.07em" style={{ userSelect: "none" }}>{lbl}</text>
            ))}
          </svg>
        </div>
        <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 8, paddingTop: 4 }}>
          <span className="sub" style={{ fontSize: 12.5 }}>Доход: <b className="mono" style={{ color: "var(--pos)" }}>{fmtMoney(data.totalIncome)}</b></span>
          <span className="sub" style={{ fontSize: 12.5 }}>Расход: <b className="mono" style={{ color: "var(--neg)" }}>{fmtMoney(data.totalExpense)}</b></span>
          {data.remainder > 0 && <span className="sub" style={{ fontSize: 12.5 }}>Остаток: <b className="mono">{fmtMoney(data.remainder)}</b></span>}
        </div>
      </>}
      {tooltip && (
        <div style={{ position: "fixed", left: tooltip.x, top: tooltip.y, transform: "translate(-50%,calc(-100% - 12px))", zIndex: 80, pointerEvents: "none", background: "var(--ink)", color: "var(--bg)", padding: "8px 12px", borderRadius: "var(--r-sm)", fontSize: 12.5, lineHeight: 1.5, whiteSpace: "nowrap", boxShadow: "var(--shadow-3)" }}>
          {tooltip.label}<br /><b>{fmtMoney(tooltip.val)}</b>
        </div>
      )}
    </ToolCard>
  );
}

function CounterpartiesCard() {
  const [days, setDays] = useState(90);
  const [selected, setSelected] = useState(null);
  const data = A3.counterparties(days);
  const accounts = A3.getAccounts();

  return (
    <ToolCard wide title="Анализ контрагентов" hint="Кому платишь больше всего — сумма, средний чек, тренд к прошлому периоду.">
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <span className="sub" style={{ fontSize: 12.5 }}>{data.length} получателей</span>
        <span className="seg">
          {[[30, "30 дн"], [90, "90 дн"], [180, "6 мес"]].map(([d, l]) => <button key={d} className={days === d ? "on" : ""} onClick={() => setDays(d)}>{l}</button>)}
        </span>
      </div>
      {!data.length ? <NeedData msg="Нет расходов за период." /> : <>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div className="row" style={{ padding: "5px 4px", borderBottom: "2px solid var(--line)", fontSize: 11, fontWeight: 700, color: "var(--ink-4)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            <span style={{ flex: "1 1 auto" }}>Получатель</span>
            <span style={{ width: 96, textAlign: "right" }}>Сумма</span>
            <span style={{ width: 48, textAlign: "right" }}>Чеков</span>
            <span style={{ width: 64, textAlign: "right" }}>Тренд</span>
          </div>
          {data.slice(0, 14).map((cp) => (
            <div key={cp.name} onClick={() => setSelected(cp)}
              style={{ display: "flex", alignItems: "center", padding: "10px 4px", borderBottom: "1px solid var(--line-2)", cursor: "pointer" }}>
              <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cp.name}</div>
                <div className="sub" style={{ fontSize: 11.5 }}>ср. чек {fmtMoney(cp.avg)}</div>
              </div>
              <span className="mono" style={{ width: 96, textAlign: "right", fontWeight: 700, fontSize: 14 }}>{fmtMoney(cp.total)}</span>
              <span style={{ width: 48, textAlign: "right", color: "var(--ink-3)", fontSize: 13 }}>{cp.count}</span>
              <span style={{ width: 64, textAlign: "right" }}>
                {cp.trend == null
                  ? <span className="sub" style={{ fontSize: 11 }}>новый</span>
                  : <span className={"pill " + (cp.trend > 10 ? "neg" : cp.trend < -10 ? "pos" : "")} style={{ fontSize: 11, padding: "2px 7px" }}>{cp.trend > 0 ? "▲" : "▼"} {Math.abs(Math.round(cp.trend))}%</span>}
              </span>
            </div>
          ))}
        </div>
      </>}
      {selected && (
        <Modal title={selected.name} onClose={() => setSelected(null)}>
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
            <BigStat value={fmtMoney(selected.total)} label={selected.count + " операции"} />
            <div style={{ textAlign: "right" }}><div className="mono" style={{ fontWeight: 700, fontSize: 20 }}>{fmtMoney(selected.avg)}</div><div className="sub" style={{ fontSize: 12 }}>ср. чек</div></div>
          </div>
          <div style={{ maxHeight: 380, overflowY: "auto" }}>
            {selected.txs.slice(0, 20).map((tx) => {
              const acc = accounts.find((a) => a.id === tx.account_id);
              return (
                <div key={tx.id} className="row" style={{ padding: "10px 0", borderBottom: "1px solid var(--line-2)", justifyContent: "space-between" }}>
                  <div><div style={{ fontWeight: 600, fontSize: 13.5 }}>{tx.merchant || "—"}</div><div className="sub" style={{ fontSize: 12 }}>{new Date(tx.occurred_at).toLocaleDateString("ru-RU")} · {acc ? acc.label : "—"}</div></div>
                  <span className="mono" style={{ fontWeight: 700, color: "var(--neg)" }}>{fmtMoney(-tx.amount_minor)}</span>
                </div>
              );
            })}
          </div>
        </Modal>
      )}
    </ToolCard>
  );
}

// ════════════════════════════════════════════════════════
// МОДУЛЬ 3 · ФИНАНСОВАЯ ЭФФЕКТИВНОСТЬ
// ════════════════════════════════════════════════════════
function EfficiencyTab() {
  return <div style={GRID}><HourlyRateCard /><TCOCard /><SelfInvestCard /></div>;
}

function HourlyRateCard() {
  const [sett, setSett] = useState(() => A3.getAdvSettings());
  const [edit, setEdit] = useState(false);
  const [incVal, setIncVal] = useState(sett.monthlyIncome ? (sett.monthlyIncome / 100).toString() : "");
  const [hrVal, setHrVal] = useState(sett.workHours ? sett.workHours.toString() : "160");

  const hourRate = sett.workHours > 0 && sett.monthlyIncome > 0 ? sett.monthlyIncome / sett.workHours : 0;
  const cats = A3.categoryBreakdown(30);

  function save() {
    const n = { ...sett, monthlyIncome: parseAmount(incVal), workHours: parseInt(hrVal) || 160 };
    A3.setAdvSettings(n); setSett(n); setEdit(false);
  }

  return (
    <ToolCard title="Цена твоего часа" tag="эффективность" hint="Сколько часов работы стоит каждая трата в месяце. Задай доход и часы — и увидишь категории по-новому.">
      {edit ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="field"><label>Месячный доход</label><input className="input" inputMode="decimal" placeholder="5 000 000" value={incVal} onChange={(e) => setIncVal(e.target.value)} /></div>
          <div className="field"><label>Рабочих часов в месяц</label><input className="input" inputMode="numeric" placeholder="160" value={hrVal} onChange={(e) => setHrVal(e.target.value)} /></div>
          <div className="row" style={{ gap: 8 }}><button className="btn brand" onClick={save}>Сохранить</button><button className="btn" onClick={() => setEdit(false)}>Отмена</button></div>
        </div>
      ) : !hourRate ? (
        <div style={{ padding: "14px", borderRadius: "var(--r-sm)", background: "var(--brand-tint)", color: "var(--brand-ink)", fontSize: 13, lineHeight: 1.6 }}>
          Укажи доход и рабочие часы, чтобы видеть стоимость каждой категории в часах работы.
          <br /><button className="btn sm" style={{ marginTop: 10 }} onClick={() => setEdit(true)}>Настроить</button>
        </div>
      ) : <>
        <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-end" }}>
          <BigStat value={fmtMoney(Math.round(hourRate))} label={"1 час · " + sett.workHours + " ч/мес"} />
          <button className="btn sm" onClick={() => setEdit(true)}><Icon name="edit" size={14} /> Изменить</button>
        </div>
        {cats.length > 0 && <>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "var(--ink-4)", textTransform: "uppercase" }}>Категории за 30 дней</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {cats.slice(0, 7).map((c) => {
              const hrs = (c.value_minor / hourRate).toFixed(1);
              return (
                <div key={c.key} className="row" style={{ justifyContent: "space-between", gap: 10 }}>
                  <span className="row" style={{ gap: 8, minWidth: 0, flex: 1 }}>
                    <span className="dot" style={{ background: c.color }}></span>
                    <span style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.label}</span>
                  </span>
                  <span style={{ display: "flex", gap: 12, flex: "none" }}>
                    <span className="mono" style={{ fontSize: 13, color: "var(--ink-3)" }}>{hrs} ч</span>
                    <span className="mono" style={{ fontWeight: 700, fontSize: 13 }}>{fmtMoney(c.value_minor)}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </>}
      </>}
    </ToolCard>
  );
}

function TCOCard() {
  const [sett, setSett] = useState(() => A3.getAdvSettings());
  const [show, setShow] = useState(false);
  const [nm, setNm] = useState(""); const [cost, setCost] = useState(""); const [yrs, setYrs] = useState("3"); const [mo, setMo] = useState(""); const [resale, setResale] = useState("0");

  function add() {
    const a = { id: Date.now(), name: nm, cost: parseAmount(cost), years: parseFloat(yrs) || 3, monthly: parseAmount(mo), resale: parseAmount(resale) };
    const n = { ...sett, tcoAssets: [...(sett.tcoAssets || []), a] };
    A3.setAdvSettings(n); setSett(n); setShow(false); setNm(""); setCost(""); setYrs("3"); setMo(""); setResale("0");
  }
  function del(id) { const n = { ...sett, tcoAssets: (sett.tcoAssets || []).filter((x) => x.id !== id) }; A3.setAdvSettings(n); setSett(n); }
  const tco = (a) => { const m = a.years * 12; const tot = a.cost + a.monthly * m - a.resale; return { total: tot, perMonth: tot / m, perDay: tot / (m * 30) }; };

  const assets = sett.tcoAssets || [];
  return (
    <ToolCard title="Стоимость владения (TCO)" tag="калькулятор" hint="Покупка + обслуживание − продажа = реальная цена в месяц. Сравни активы между собой.">
      {!assets.length && !show && (
        <div className="empty" style={{ padding: "18px 0", fontSize: 13 }}>Добавь актив (авто, техника, жильё) — увидишь реальную стоимость в месяц.<br /><button className="btn sm" style={{ marginTop: 10 }} onClick={() => setShow(true)}>+ Добавить</button></div>
      )}
      {show && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "14px", border: "1px solid var(--line)", borderRadius: "var(--r-sm)", background: "var(--bg-sunken)" }}>
          <div className="field"><label>Название</label><input className="input" placeholder="Автомобиль" value={nm} onChange={(e) => setNm(e.target.value)} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div className="field"><label>Стоимость покупки</label><input className="input" inputMode="decimal" placeholder="0" value={cost} onChange={(e) => setCost(e.target.value)} /></div>
            <div className="field"><label>Срок (лет)</label><input className="input" inputMode="decimal" placeholder="3" value={yrs} onChange={(e) => setYrs(e.target.value)} /></div>
            <div className="field"><label>Расходы/мес</label><input className="input" inputMode="decimal" placeholder="0" value={mo} onChange={(e) => setMo(e.target.value)} /></div>
            <div className="field"><label>Цена продажи</label><input className="input" inputMode="decimal" placeholder="0" value={resale} onChange={(e) => setResale(e.target.value)} /></div>
          </div>
          <div className="row" style={{ gap: 8 }}><button className="btn brand sm" onClick={add} disabled={!nm || !cost}>Добавить</button><button className="btn sm" onClick={() => setShow(false)}>Отмена</button></div>
        </div>
      )}
      {assets.length > 0 && <>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {assets.map((a) => { const t = tco(a); return (
            <div key={a.id} style={{ padding: "13px 0", borderBottom: "1px solid var(--line-2)" }}>
              <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{a.name}</span>
                <button className="btn sm danger" style={{ width: 28, height: 28, padding: 0 }} onClick={() => del(a.id)}>×</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {[["Итого за " + a.years + " л", fmtMoney(Math.round(t.total))], ["В месяц", fmtMoney(Math.round(t.perMonth))], ["В день", fmtMoney(Math.round(t.perDay))]].map(([lbl, val]) => (
                  <div key={lbl}><div className="mono" style={{ fontWeight: 700, fontSize: 14, color: lbl === "В месяц" ? "var(--neg)" : "var(--ink)" }}>{val}</div><div className="sub" style={{ fontSize: 11 }}>{lbl}</div></div>
                ))}
              </div>
            </div>
          ); })}
        </div>
        <button className="btn sm" onClick={() => setShow(true)}>+ Добавить актив</button>
      </>}
    </ToolCard>
  );
}

function SelfInvestCard() {
  const [sett, setSett] = useState(() => A3.getAdvSettings());
  const [show, setShow] = useState(false);
  const [nm, setNm] = useState(""); const [cost, setCost] = useState(""); const [gain, setGain] = useState(""); const [mos, setMos] = useState("6");

  function add() {
    const inv = { id: Date.now(), name: nm, cost: parseAmount(cost), expectedGain: parseAmount(gain), months: parseInt(mos) || 6, createdAt: new Date().toISOString() };
    const n = { ...sett, selfInvest: [...(sett.selfInvest || []), inv] };
    A3.setAdvSettings(n); setSett(n); setShow(false); setNm(""); setCost(""); setGain(""); setMos("6");
  }
  function del(id) { const n = { ...sett, selfInvest: (sett.selfInvest || []).filter((x) => x.id !== id) }; A3.setAdvSettings(n); setSett(n); }

  const invs = sett.selfInvest || [];
  const totalInv = invs.reduce((s, i) => s + (i.cost || 0), 0);
  const avgROI = invs.filter((i) => i.cost > 0 && i.expectedGain > 0).reduce((s, i) => s + (i.expectedGain * i.months / i.cost * 100), 0) / Math.max(1, invs.filter((i) => i.cost > 0 && i.expectedGain > 0).length);

  return (
    <ToolCard title="ROI инвестиций в себя" tag="эффективность" hint="Отслеживай отдачу от курсов, книг, инструментов. ROI = (прирост дохода × месяцев) / стоимость.">
      {!invs.length && !show && (
        <div className="empty" style={{ padding: "18px 0", fontSize: 13 }}>Добавляй курсы, книги, оборудование — приложение посчитает ROI и напомнит оценить результат.<br /><button className="btn sm" style={{ marginTop: 10 }} onClick={() => setShow(true)}>+ Добавить</button></div>
      )}
      {show && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "14px", border: "1px solid var(--line)", borderRadius: "var(--r-sm)", background: "var(--bg-sunken)" }}>
          <div className="field"><label>Название</label><input className="input" placeholder="Курс Python" value={nm} onChange={(e) => setNm(e.target.value)} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div className="field"><label>Стоимость</label><input className="input" inputMode="decimal" value={cost} onChange={(e) => setCost(e.target.value)} /></div>
            <div className="field"><label>Прирост дохода/мес</label><input className="input" inputMode="decimal" value={gain} onChange={(e) => setGain(e.target.value)} /></div>
            <div className="field"><label>Через сколько месяцев</label><input className="input" inputMode="numeric" value={mos} onChange={(e) => setMos(e.target.value)} /></div>
          </div>
          <div className="row" style={{ gap: 8 }}><button className="btn brand sm" onClick={add} disabled={!nm || !cost}>Добавить</button><button className="btn sm" onClick={() => setShow(false)}>Отмена</button></div>
        </div>
      )}
      {invs.length > 0 && <>
        {totalInv > 0 && <div className="row" style={{ gap: 20 }}><BigStat value={Math.round(avgROI) + "%"} label="средний ROI" tone={avgROI > 100 ? "pos" : avgROI > 0 ? "warn" : "neg"} /><div><div className="mono" style={{ fontSize: 18, fontWeight: 700 }}>{fmtMoney(totalInv)}</div><div className="sub" style={{ fontSize: 12 }}>вложено</div></div></div>}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {invs.map((inv) => {
            const roi = inv.cost > 0 && inv.expectedGain > 0 ? Math.round(inv.expectedGain * inv.months / inv.cost * 100) : null;
            const doneDate = new Date(inv.createdAt); doneDate.setMonth(doneDate.getMonth() + inv.months);
            const isPast = doneDate < new Date();
            return (
              <div key={inv.id} style={{ padding: "11px 0", borderBottom: "1px solid var(--line-2)" }}>
                <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 13.5 }}>{inv.name}</span>
                  <div className="row" style={{ gap: 6 }}>
                    {roi != null && <span className={"pill " + (roi > 100 ? "pos" : roi > 0 ? "" : "neg")}>{roi}% ROI</span>}
                    {isPast && <span className="pill warn">Оцени!</span>}
                    <button className="btn sm danger" style={{ width: 28, height: 28, padding: 0 }} onClick={() => del(inv.id)}>×</button>
                  </div>
                </div>
                <div className="sub" style={{ fontSize: 12 }}>{fmtMoney(inv.cost)} · +{fmtMoney(inv.expectedGain)}/мес × {inv.months} мес{!isPast ? " · " + doneDate.toLocaleDateString("ru-RU", { month: "short", year: "numeric" }) : ""}</div>
              </div>
            );
          })}
        </div>
        <button className="btn sm" onClick={() => setShow(true)}>+ Добавить</button>
      </>}
    </ToolCard>
  );
}

// ════════════════════════════════════════════════════════
// МОДУЛЬ 4 · СЦЕНАРНОЕ ПЛАНИРОВАНИЕ
// ════════════════════════════════════════════════════════
function ScenariosTab() {
  return <div style={GRID}><WhatIfCard /><StressTestCard /><FIRECard /></div>;
}

function WhatIfCard() {
  const sr = A3.savingsRate(3);
  const baseInc = sr.income / 3 || 0;
  const baseExp = sr.expense / 3 || 0;
  const [incAdj, setIncAdj] = useState(0);
  const [expAdj, setExpAdj] = useState(0);
  const [srPct, setSrPct] = useState(Math.max(0, sr.rate != null ? Math.round(sr.rate) : 10));
  const [sett, setSett] = useState(() => A3.getAdvSettings());
  const [scenName, setScenName] = useState("");
  const [saved, setSaved] = useState(false);

  const adjInc = baseInc * (1 + incAdj / 100);
  const adjExp = baseExp * (1 + expAdj / 100);
  const adjSaved = adjInc * (srPct / 100);
  const liquid = A3.liquidAssets();
  const newRunway = adjExp > 0 ? liquid / adjExp : null;
  const fireTarget = adjExp * 12 * 25;
  const nw = A3.netWorth();
  const monthsToFire = adjSaved > 0 && fireTarget > nw ? (fireTarget - nw) / adjSaved : null;

  function saveScen() {
    const sc = { id: Date.now(), name: scenName || "Сценарий " + ((sett.scenarios || []).length + 1), incAdj, expAdj, srPct };
    const n = { ...sett, scenarios: [...(sett.scenarios || []).slice(-4), sc] };
    A3.setAdvSettings(n); setSett(n); setSaved(true); setScenName("");
    setTimeout(() => setSaved(false), 2000);
  }
  function loadScen(s) { setIncAdj(s.incAdj); setExpAdj(s.expAdj); setSrPct(s.srPct); }

  function Slider({ label, value, onChange, min, max }) {
    return (
      <div className="field">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <label style={{ fontWeight: 600, fontSize: 12.5, color: "var(--ink-2)" }}>{label}</label>
          <span className={"pill " + (value > 0 ? "pos" : value < 0 ? "neg" : "")} style={{ fontSize: 11 }}>{value > 0 ? "+" : ""}{value}%</span>
        </div>
        <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ width: "100%", accentColor: "var(--brand)" }} />
      </div>
    );
  }

  return (
    <ToolCard wide title="What-if симулятор" hint="Двигай ползунки — смотри как меняются норма сбережений, runway и дата FIRE в реальном времени.">
      {!baseInc && !baseExp ? <NeedData msg="Нужна история операций для расчётов." /> : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Slider label="Доход" value={incAdj} onChange={setIncAdj} min={-50} max={50} />
            <Slider label="Расходы" value={expAdj} onChange={setExpAdj} min={-30} max={50} />
            <div className="field">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <label style={{ fontWeight: 600, fontSize: 12.5, color: "var(--ink-2)" }}>Норма сбережений</label>
                <span className="pill" style={{ fontSize: 11 }}>{srPct}%</span>
              </div>
              <input type="range" min={0} max={60} value={srPct} onChange={(e) => setSrPct(Number(e.target.value))} style={{ width: "100%", accentColor: "var(--brand)" }} />
            </div>
            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <input className="input" placeholder="Имя сценария…" value={scenName} onChange={(e) => setScenName(e.target.value)} style={{ flex: 1, minWidth: 120, height: 36, fontSize: 13 }} />
              <button className="btn sm brand" onClick={saveScen}>{saved ? "✓ Сохранён" : "Сохранить"}</button>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <KV k="Доход / мес" v={fmtMoney(Math.round(adjInc))} strong />
            <KV k="Расходы / мес" v={fmtMoney(Math.round(adjExp))} />
            <KV k="Норма сбережений" v={srPct + "%"} vColor={srPct >= 20 ? "var(--pos)" : srPct >= 10 ? "var(--warn)" : "var(--neg)"} strong />
            <KV k="Runway" v={newRunway != null ? newRunway.toFixed(1) + " мес" : "∞"} vColor={newRunway != null && newRunway < 3 ? "var(--neg)" : "var(--pos)"} />
            <KV k="До FIRE" v={monthsToFire != null ? (monthsToFire / 12).toFixed(1) + " лет" : nw >= fireTarget ? "FIRE! 🎉" : "∞"} />
            {(sett.scenarios || []).length > 0 && (
              <div style={{ paddingTop: 8, borderTop: "1px solid var(--line-2)" }}>
                <div className="sub" style={{ fontSize: 11.5, marginBottom: 6 }}>Сохранённые:</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {(sett.scenarios || []).map((s) => <button key={s.id} className="btn sm" onClick={() => loadScen(s)} style={{ whiteSpace: "nowrap" }}>{s.name}</button>)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </ToolCard>
  );
}

function StressTestCard() {
  const sr = A3.savingsRate(3);
  const baseExp = sr.expense / 3 || 0;
  const baseInc = sr.income / 3 || 0;
  const liquid = A3.liquidAssets();
  const [customInc, setCustomInc] = useState(-30);
  const [customExp, setCustomExp] = useState(10);
  const [showCustom, setShowCustom] = useState(false);

  const PRESETS = [{ label: "Мягкий", inc: -20, exp: 0 }, { label: "Средний", inc: -40, exp: 0 }, { label: "Жёсткий", inc: -60, exp: 20 }];
  const scenarios = [...PRESETS, ...(showCustom ? [{ label: "Свой", inc: customInc, exp: customExp }] : [])];

  function calc({ inc, exp }) {
    const ni = baseInc * (1 + inc / 100);
    const ne = baseExp * (1 + exp / 100);
    const months = ne > 0 ? liquid / ne : null;
    return { months: months != null ? Math.round(months * 10) / 10 : null, safe: months != null && months >= 3, ne };
  }

  return (
    <ToolCard wide title="Стресс-тест бюджета" hint="Сколько хватит подушки при падении дохода. Преднастроенные кризисные сценарии + свой.">
      {!baseExp ? <NeedData msg="Нужны расходы для стресс-теста." /> : <>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr>
              {["Сценарий", "Доход", "Расходы", "Runway", ""].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "5px 8px 8px 0", fontSize: 11, fontWeight: 700, color: "var(--ink-4)", letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: "2px solid var(--line)", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {scenarios.map((preset, i) => {
                const r = calc(preset);
                return (
                  <tr key={i} style={{ borderBottom: "1px solid var(--line-2)" }}>
                    <td style={{ padding: "10px 8px 10px 0", fontWeight: 700 }}>{preset.label}</td>
                    <td style={{ padding: "10px 8px 10px 0", color: "var(--neg)" }}>{preset.inc}%</td>
                    <td style={{ padding: "10px 8px 10px 0", color: preset.exp > 0 ? "var(--neg)" : "var(--ink-3)" }}>+{preset.exp}%</td>
                    <td style={{ padding: "10px 8px 10px 0" }}><span className="mono" style={{ fontWeight: 700 }}>{r.months != null ? r.months + " мес" : "∞"}</span></td>
                    <td style={{ padding: "10px 0" }}><span className={"pill " + (r.safe ? "pos" : "neg")}>{r.safe ? "Безопасно" : "Риск"}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {showCustom ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, paddingTop: 4 }}>
            <div className="field"><div className="row" style={{ justifyContent: "space-between" }}><label>Падение дохода</label><span className="pill neg" style={{ fontSize: 11 }}>{customInc}%</span></div><input type="range" min={-80} max={0} value={customInc} onChange={(e) => setCustomInc(Number(e.target.value))} style={{ width: "100%", accentColor: "var(--brand)" }} /></div>
            <div className="field"><div className="row" style={{ justifyContent: "space-between" }}><label>Рост расходов</label><span className="pill neg" style={{ fontSize: 11 }}>+{customExp}%</span></div><input type="range" min={0} max={50} value={customExp} onChange={(e) => setCustomExp(Number(e.target.value))} style={{ width: "100%", accentColor: "var(--brand)" }} /></div>
          </div>
        ) : (
          <button className="btn sm" onClick={() => setShowCustom(true)}>+ Свой сценарий</button>
        )}
      </>}
    </ToolCard>
  );
}

function FIRECard() {
  const [desiredExp, setDesiredExp] = useState("");
  const avgExp = A3.avgMonthlyExpense(6);
  const nw = A3.netWorth();
  const sr = A3.savingsRate(3);
  const avgInc = sr.income / 3;
  const avgSaved = sr.saved / 3;
  const tip = useTip3();

  const monthlyExp = desiredExp ? parseAmount(desiredExp) : avgExp;
  const fireTarget = monthlyExp * 12 * 25;
  const progress = fireTarget > 0 ? Math.min(100, nw / fireTarget * 100) : 0;
  const toneColor = progress < 20 ? "var(--neg)" : progress < 60 ? "var(--warn)" : "var(--pos)";
  const monthsLeft = avgSaved > 0 && fireTarget > nw ? (fireTarget - nw) / avgSaved : null;

  const RATES = [5, 10, 15, 20, 25, 30];
  const yearsAt = (r) => { const ms = avgInc * r / 100; if (ms <= 0) return null; if (nw >= fireTarget) return 0; return (fireTarget - nw) / ms / 12; };
  const maxYrs = 50;

  return (
    <ToolCard wide title="FIRE-число" hint="Финансовая независимость = расходы × 12 × 25 (правило 4%). При текущих сбережениях — когда достигнешь.">
      {avgExp === 0 ? <NeedData msg="Нужна история расходов." /> : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="field">
              <label>Желаемые расходы на пенсии / мес</label>
              <input className="input" inputMode="decimal" placeholder={"Сейчас: " + Math.round(avgExp / 100).toLocaleString("ru-RU") + " сум"} value={desiredExp} onChange={(e) => setDesiredExp(e.target.value)} />
            </div>
            <div>
              <div className="sub" style={{ fontSize: 12, marginBottom: 4 }}>FIRE-число</div>
              <div className="mono" style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}>{fmtMoney(fireTarget)}</div>
            </div>
            <KV k="Текущий Net Worth" v={fmtMoney(nw)} />
            <KV k="Достигнуто" v={Math.round(progress) + "%"} vColor={toneColor} strong />
            {monthsLeft != null && <KV k="При текущих сбережениях" v={(monthsLeft / 12).toFixed(1) + " лет"} />}
            <div style={{ height: 8, borderRadius: 99, background: "var(--bg-sunken)", overflow: "hidden" }}>
              <div style={{ width: progress + "%", height: "100%", background: toneColor, transition: "width .6s" }}></div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-3)", marginBottom: 10 }}>Лет до FIRE при норме сбережений</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {RATES.map((r) => {
                const yrs = yearsAt(r);
                const pct = yrs == null ? 100 : yrs === 0 ? 0 : Math.min(100, yrs / maxYrs * 100);
                const col = r >= 20 ? "var(--pos)" : r >= 10 ? "var(--warn)" : "var(--brand)";
                return (
                  <div key={r} className="row" style={{ gap: 10 }}
                    {...tip.handlers(<span><b>{r}% сбережений</b><br />{fmtMoney(Math.round(avgInc * r / 100))}/мес<br />{yrs == null ? "Невозможно" : yrs === 0 ? "Уже FIRE!" : yrs.toFixed(1) + " лет"}</span>)}>
                    <span style={{ width: 34, textAlign: "right", fontSize: 12.5, color: "var(--ink-3)", fontWeight: 700, flex: "none" }}>{r}%</span>
                    <div style={{ flex: 1, height: 14, borderRadius: 99, background: "var(--bg-sunken)", overflow: "hidden" }}>
                      <div style={{ width: (100 - pct) + "%", height: "100%", background: col, transition: "width .4s" }}></div>
                    </div>
                    <span className="mono" style={{ width: 56, fontSize: 12, fontWeight: 700, flex: "none", color: col }}>{yrs == null ? "∞" : yrs === 0 ? "FIRE!" : yrs.toFixed(1) + " л"}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {tip.el}
    </ToolCard>
  );
}

// ════════════════════════════════════════════════════════
// МОДУЛЬ 5 · HEALTH SCORE
// ════════════════════════════════════════════════════════
function HealthTab() {
  return <div style={GRID}><HealthScoreCard /><DigestCard /><RecommendationsCard /></div>;
}

function HealthScoreCard() {
  const data = A3.healthScore();
  const [expanded, setExpanded] = useState(false);
  const { total, components, worst } = data;
  const scoreColor = total >= 71 ? "var(--pos)" : total >= 41 ? "var(--warn)" : "var(--neg)";
  const scoreLabel = total >= 71 ? "Финансово здоров" : total >= 41 ? "Есть куда расти" : "Высокий финриск";

  return (
    <ToolCard wide title="Финансовый Health Score" tag="KPI" hint="Общее здоровье финансов: 6 компонентов с весами. Нажми «Детализация» — раскроется разбивка с объяснением каждого.">
      <div className="row" style={{ gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ cursor: "pointer", flex: "none" }} onClick={() => setExpanded((e) => !e)}>
          <Ring pct={total} size={124} stroke={13} color={scoreColor}>
            <div style={{ textAlign: "center" }}>
              <div className="mono" style={{ fontSize: 34, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{total}</div>
              <div className="sub" style={{ fontSize: 10, marginTop: 2 }}>из 100</div>
            </div>
          </Ring>
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ fontWeight: 700, fontSize: 17, color: scoreColor, marginBottom: 6 }}>{scoreLabel}</div>
          {worst && <div style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.55 }}>Тянет вниз: <b style={{ color: "var(--ink-2)" }}>{worst.label}</b> — {worst.detail}</div>}
          <button className="btn sm" style={{ marginTop: 12 }} onClick={() => setExpanded((e) => !e)}>
            {expanded ? "Свернуть ▲" : "Детализация ▼"}
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px", minWidth: 200 }}>
          {components.map((c) => {
            const col = c.score >= 70 ? "var(--pos)" : c.score >= 40 ? "var(--warn)" : "var(--neg)";
            return (
              <div key={c.key}>
                <div className="row" style={{ justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{c.label}</span>
                  <span className="mono" style={{ fontSize: 11.5, fontWeight: 700, color: col }}>{c.score}</span>
                </div>
                <div style={{ height: 4, borderRadius: 99, background: "var(--bg-sunken)", overflow: "hidden" }}>
                  <div style={{ width: c.score + "%", height: "100%", background: col }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {expanded && (
        <div style={{ paddingTop: 16, borderTop: "1px solid var(--line)", display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "var(--ink-4)", textTransform: "uppercase", marginBottom: 6 }}>Детализация компонентов</div>
          {components.map((c) => {
            const col = c.score >= 70 ? "var(--pos)" : c.score >= 40 ? "var(--warn)" : "var(--neg)";
            return (
              <div key={c.key} style={{ padding: "10px 0", borderBottom: "1px solid var(--line-2)" }}>
                <div className="row" style={{ justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{c.label}</span>
                  <div className="row" style={{ gap: 8 }}><span className="sub" style={{ fontSize: 12 }}>{c.weight}%</span><span className="mono" style={{ fontWeight: 700, color: col }}>{c.score} / 100</span></div>
                </div>
                <div style={{ height: 5, borderRadius: 99, background: "var(--bg-sunken)", overflow: "hidden", marginBottom: 5 }}>
                  <div style={{ width: c.score + "%", height: "100%", background: col, transition: "width .5s" }}></div>
                </div>
                <div className="sub" style={{ fontSize: 12 }}>{c.detail}</div>
              </div>
            );
          })}
        </div>
      )}
    </ToolCard>
  );
}

function DigestCard() {
  const digest = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - 7);
    const series = A3.monthlySeries(3);
    const curM = series[series.length - 1]; const prevM = series[series.length - 2];
    const facts = [];

    const weekSpend = A3.getTransactions().filter((t) => {
      if (t.amount_minor >= 0 || t.direction === "transfer" || t.opening) return false;
      return new Date(t.occurred_at) >= weekStart;
    }).reduce((s, t) => s + -t.amount_minor, 0);

    const days = now.getDate() || 1;
    const avg7 = curM.outflow / days * 7;
    const pct = avg7 > 0 ? Math.round((weekSpend - avg7) / avg7 * 100) : 0;
    if (weekSpend > 0) facts.push({ emoji: pct > 15 ? "📈" : pct < -15 ? "📉" : "📊", text: "На этой неделе потрачено " + fmtMoney(weekSpend) + " — " + (pct > 0 ? "+" : "") + pct + "% к обычной неделе" });

    if (curM.outflow > 0 && prevM && prevM.outflow > 0) {
      const mom = Math.round((curM.outflow - prevM.outflow) / prevM.outflow * 100);
      facts.push({ emoji: mom > 0 ? "⬆️" : "⬇️", text: "Расходы " + MONTHS_SHORT[curM.m] + ": " + fmtMoney(curM.outflow) + " (" + (mom > 0 ? "+" : "") + mom + "% к прошлому)" });
    }

    const { annualTotal } = A3.detectSubscriptions();
    if (annualTotal > 0) facts.push({ emoji: "🔁", text: "Регулярные платежи — " + fmtMoney(annualTotal) + " в год (" + fmtMoney(Math.round(annualTotal / 12)) + "/мес)" });

    const sr = A3.savingsRate(3);
    if (sr.rate != null) facts.push({ emoji: sr.rate >= 20 ? "✅" : "💡", text: "Норма сбережений (3 мес): " + Math.round(sr.rate) + "%" + (sr.rate >= 20 ? " — цель достигнута!" : " (цель 20%)") });

    const recs = A3.smartRecommendations();
    return { facts: facts.slice(0, 3), rec: recs[0] || null };
  }, []);

  return (
    <ToolCard title="Умный дайджест" tag="авто" hint="Автоматически сформированный еженедельный отчёт на основе твоих данных.">
      {!digest.facts.length ? <NeedData msg="Нужно больше данных для дайджеста." /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "var(--ink-4)", textTransform: "uppercase", marginBottom: 2 }}>
            Неделя до {new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}
          </div>
          {digest.facts.map((f, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", borderRadius: "var(--r-sm)", background: "var(--bg-sunken)", fontSize: 13, lineHeight: 1.5 }}>
              <span style={{ fontSize: 18, flex: "none", lineHeight: 1.2 }}>{f.emoji}</span><span>{f.text}</span>
            </div>
          ))}
          {digest.rec && (
            <div style={{ padding: "10px 12px", borderRadius: "var(--r-sm)", background: "var(--brand-tint)", color: "var(--brand-ink)", fontSize: 13, lineHeight: 1.5, marginTop: 4 }}>
              <div style={{ fontWeight: 700, marginBottom: 2 }}>💡 Рекомендация</div>
              {digest.rec.body}
            </div>
          )}
        </div>
      )}
    </ToolCard>
  );
}

function RecommendationsCard() {
  const [dismissed, setDismissed] = useState(() => { try { return JSON.parse(localStorage.getItem("tf_recs_dis") || "{}"); } catch { return {}; } });
  function dismiss(key) { const n = { ...dismissed, [key]: Date.now() + 30 * 86400000 }; setDismissed(n); localStorage.setItem("tf_recs_dis", JSON.stringify(n)); }

  const recs = A3.smartRecommendations().filter((r) => { const exp = dismissed[r.key]; return !exp || Date.now() > exp; });

  return (
    <ToolCard title="Умные рекомендации" tag="авто" hint="Проверяются при открытии. Можно скрыть на 30 дней — кнопка «Знаю».">
      {!recs.length ? (
        <div className="empty" style={{ padding: "18px 8px", fontSize: 13, color: "var(--pos)" }}>✅ Нет активных рекомендаций</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {recs.map((r) => (
            <div key={r.key} style={{ padding: "12px 14px", borderRadius: "var(--r-sm)", border: "1px solid var(--line)", background: "var(--bg-elev)", display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ fontSize: 22, flex: "none", lineHeight: 1.2 }}>{r.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 3 }}>{r.title}</div>
                <div className="sub" style={{ fontSize: 12.5, lineHeight: 1.45 }}>{r.body}</div>
              </div>
              <button className="btn sm" onClick={() => dismiss(r.key)} style={{ flex: "none", color: "var(--ink-4)", border: "none", background: "none", fontSize: 11.5, padding: "0 4px" }}>Знаю</button>
            </div>
          ))}
        </div>
      )}
    </ToolCard>
  );
}

Object.assign(window, { AdvancedTab });
