// T-Finance · Dashboards V3 & V4
// V3 Editorial — Big serif headline, sparse, minimal numbers
// V4 Story — Card-stack narrative, heatmap and donut dominant

// ─── V3 · Editorial / Minimal ───────────────────────────────────
function DashboardV3({ lang = 'ru' }) {
  const i = window.TFI18n[lang];
  const d = window.TFData;
  const cur = lang === 'ru' ? '₽' : '$';
  return (
    <div className="tf-app" data-screen-label="Dashboard V3 · Editorial" data-density="comfortable">
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar active="overview" lang={lang} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Topbar lang={lang} />
          <div className="tf-content" style={{ overflowY: 'auto', padding: '40px 64px', gap: 28 }}>
            {/* Editorial hero */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 48, alignItems: 'end', paddingBottom: 12 }}>
              <div>
                <div className="tf-h-eyebrow" style={{ marginBottom: 18 }}>{lang === 'ru' ? 'Капитал · 25 ноября 2025' : 'Net worth · Nov 25, 2025'}</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 88, lineHeight: 0.95, letterSpacing: '-0.03em', fontWeight: 400 }}>
                  {fmtMoney(2349740, { lang, cur })}
                </div>
                <div style={{ marginTop: 18, fontSize: 14, color: 'var(--ink-3)', maxWidth: 460, lineHeight: 1.5 }}>
                  {lang === 'ru'
                    ? <>За этот месяц вы заработали <b style={{ color: 'var(--ink)' }}>+94 800 ₽</b> и сократили расходы на 8%. Накопления растут — продолжайте в том же духе.</>
                    : <>This month you earned <b style={{ color: 'var(--ink)' }}>+$94,800</b> and cut spending by 8%. Savings are climbing — keep going.</>}
                </div>
              </div>
              <div>
                <LineChart data={d.balance} width={520} height={220}
                  yFormat={(v) => (v / 1000).toFixed(0) + 'k'}
                  xLabels={lang === 'ru' ? ['Авг','Сен','Окт','Ноя'] : ['Aug','Sep','Oct','Nov']} />
              </div>
            </div>

            <div className="tf-divider" />

            {/* Three editorial blocks */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="tf-h-eyebrow">{i.inflow}</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 44, lineHeight: 1, fontWeight: 400, letterSpacing: '-0.02em' }}>{fmtMoney(276000, { lang, cur })}</div>
                <Sparkline values={[180,175,210,180,195,240,180,180,230,200,195,210,228,240,258,276]} width={260} height={48} color="var(--pos)" />
                <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                  {lang === 'ru' ? '3 источника · 8 поступлений' : '3 sources · 8 deposits'}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="tf-h-eyebrow">{i.outflow}</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 44, lineHeight: 1, fontWeight: 400, letterSpacing: '-0.02em' }}>{fmtMoney(130800, { lang, cur })}</div>
                <Sparkline values={[140,138,150,132,145,128,150,140,132,135,128,135,140,128,132,131]} width={260} height={48} color="var(--neg)" />
                <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                  {lang === 'ru' ? '47 транзакций · бюджет −8%' : '47 transactions · −8% vs budget'}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="tf-h-eyebrow">{i.saved}</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 44, lineHeight: 1, fontWeight: 400, letterSpacing: '-0.02em', color: 'var(--brand)' }}>{fmtMoney(145200, { lang, cur })}</div>
                <Sparkline values={[40,55,72,68,84,95,108,118,124,128,134,140,142,144,145,145.2]} width={260} height={48} color="var(--brand)" />
                <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                  {lang === 'ru' ? '52.6% от дохода · цель 50%' : '52.6% of income · target 50%'}
                </div>
              </div>
            </div>

            <div className="tf-divider" />

            {/* Categories essay + goals */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
              <div>
                <div className="tf-h-eyebrow" style={{ marginBottom: 14 }}>{i.categories}</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, lineHeight: 1.3, marginBottom: 18, letterSpacing: '-0.01em' }}>
                  {lang === 'ru'
                    ? <>Половина расходов — это <b>аренда</b>. Дальше идут продукты, развлечения и здоровье.</>
                    : <>Half of your spending is <b>rent</b>. Then groceries, entertainment, and healthcare.</>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <Donut size={150} thick={20}
                    data={d.categories.map((c) => ({ value: c.value, color: c.color }))} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {d.categories.slice(0, 5).map((c) => (
                      <CategoryDot key={c.key} color={c.color} label={i[c.key]} value={fmtMoney(c.value, { lang, cur })} />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="tf-h-eyebrow" style={{ marginBottom: 14 }}>{i.goals}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {d.goals.map((g) => {
                    const p = g.current / g.target;
                    return (
                      <div key={g.label} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, letterSpacing: '-0.01em' }}>{lang === 'ru' ? g.label : g.labelEn}</div>
                          <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{lang === 'ru' ? g.due : g.dueEn}</div>
                        </div>
                        <HBar used={p} color="var(--brand)" height={6} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
                          <span>{fmtMoney(g.current, { lang, cur })} / {fmtMoney(g.target, { lang, cur })}</span>
                          <span>{Math.round(p * 100)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── V4 · Story / Modular cards ─────────────────────────────────
function DashboardV4({ lang = 'ru' }) {
  const i = window.TFI18n[lang];
  const d = window.TFData;
  const cur = lang === 'ru' ? '₽' : '$';
  return (
    <div className="tf-app" data-screen-label="Dashboard V4 · Story">
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar active="overview" lang={lang} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Topbar lang={lang} />
          <div className="tf-content" style={{ overflowY: 'auto' }}>

            {/* Hero — split: balance card + quick actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 'var(--gap)' }}>
              <div className="tf-card tf-card--ink" style={{ padding: 28, gap: 20, position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', inset: 0, opacity: 0.06,
                  background: `radial-gradient(circle at 90% 10%, oklch(98% 0.02 155) 0%, transparent 50%)`,
                }} />
                <div className="tf-h-eyebrow" style={{ color: 'oklch(70% 0.05 155)' }}>{i.netWorth}</div>
                <div className="tf-num-big" style={{ fontSize: 46, color: 'oklch(98% 0.02 155)' }}>
                  {fmtMoney(2349740, { lang, cur })}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="tf-pill tf-pill--pos" style={{ background: 'color-mix(in oklch, var(--pos) 26%, transparent)', borderColor: 'transparent', color: 'oklch(85% 0.16 150)' }}>↑ +4.2%</span>
                  <span style={{ fontSize: 12, color: 'oklch(70% 0.02 250)' }}>
                    {fmtMoney(94800, { lang, cur, sign: true })} {lang === 'ru' ? 'за месяц' : 'this month'}
                  </span>
                </div>
                <div style={{ marginTop: 8 }}>
                  <Sparkline values={d.balance} width={520} height={56} color="oklch(85% 0.16 150)" stroke={2} />
                </div>
                <div style={{ display: 'flex', gap: 24, fontSize: 12, color: 'oklch(70% 0.02 250)' }}>
                  <div><div style={{ fontSize: 10, opacity: 0.7 }}>{i.nav.accounts}</div><div className="tf-num-mono" style={{ color: 'oklch(98% 0.02 155)', fontSize: 14, fontWeight: 600 }}>{fmtMoney(1737340, { lang, cur })}</div></div>
                  <div><div style={{ fontSize: 10, opacity: 0.7 }}>{i.invested}</div><div className="tf-num-mono" style={{ color: 'oklch(98% 0.02 155)', fontSize: 14, fontWeight: 600 }}>{fmtMoney(612400, { lang, cur })}</div></div>
                  <div><div style={{ fontSize: 10, opacity: 0.7 }}>{lang === 'ru' ? 'Накопления' : 'Savings'}</div><div className="tf-num-mono" style={{ color: 'oklch(98% 0.02 155)', fontSize: 14, fontWeight: 600 }}>{fmtMoney(1240000, { lang, cur })}</div></div>
                </div>
              </div>

              <div className="tf-card" style={{ gap: 14 }}>
                <h3 className="tf-h-section">{lang === 'ru' ? 'Быстрые действия' : 'Quick actions'}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { key: 'send', icon: '↑' },
                    { key: 'request', icon: '↓' },
                    { key: 'topup', icon: '+' },
                    { key: 'pay', icon: '⎙' },
                    { key: 'exchange', icon: '⇆' },
                    { key: 'invest', icon: '↗' },
                  ].map((a) => (
                    <div key={a.key} style={{ border: '1px solid var(--line)', borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--bg-sunken)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'var(--brand)' }}>{a.icon}</div>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{i.actions[a.key]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Heatmap-led story */}
            <div className="tf-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 className="tf-h-section">{lang === 'ru' ? 'Когда вы тратите' : 'When you spend'}</h3>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>
                    {lang === 'ru' ? 'Чем темнее квадрат, тем больше операций' : 'The darker the square, the more spending'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 18, fontSize: 11, color: 'var(--ink-3)' }}>
                  <span>{lang === 'ru' ? 'Пиковый день: суббота' : 'Peak day: Saturday'}</span>
                  <span>{lang === 'ru' ? 'Тихий день: вторник' : 'Quiet day: Tuesday'}</span>
                </div>
              </div>
              <Heatmap weeks={26} days={7}
                values={d.heatmap}
                labels={lang === 'ru' ? ['Пн','Ср','Пт'] : ['Mo','We','Fr']}
                monthLabels={(lang === 'ru' ? ['Июн','Июл','Авг','Сен','Окт','Ноя'] : ['Jun','Jul','Aug','Sep','Oct','Nov']).map((m, idx) => ({ week: idx * 4 + 1, label: m }))} />
            </div>

            {/* Categories donut + upcoming + watchlist */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--gap)' }}>
              <div className="tf-card">
                <h3 className="tf-h-section">{i.categories}</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 0' }}>
                  <Donut size={180} thick={18}
                    data={d.categories.map((c) => ({ value: c.value, color: c.color }))}
                    center={<div>
                      <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em' }}>{fmtMoney(130800, { lang, cur })}</div>
                      <div style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{lang === 'ru' ? '47 операций' : '47 transactions'}</div>
                    </div>} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {d.categories.slice(0, 4).map((c) => (
                    <CategoryDot key={c.key} color={c.color} label={i[c.key]} value={fmtMoney(c.value, { lang, cur })} />
                  ))}
                </div>
              </div>

              <div className="tf-card">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h3 className="tf-h-section">{i.upcoming}</h3>
                  <span className="tf-pill">{fmtMoney(70198, { lang, cur })}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {d.upcoming.map((u, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderTop: idx ? '1px solid var(--line-2)' : 'none' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-sunken)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{u.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{lang === 'ru' ? u.label : u.labelEn}</div>
                        <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{lang === 'ru' ? u.in : u.inEn}</div>
                      </div>
                      <div className="tf-mono" style={{ fontWeight: 600, fontSize: 13 }}>{fmtMoney(u.amount, { lang, cur })}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="tf-card">
                <h3 className="tf-h-section">{i.goals}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 2 }}>
                  {d.goals.map((g) => {
                    const p = g.current / g.target;
                    return (
                      <div key={g.label} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{lang === 'ru' ? g.label : g.labelEn}</span>
                          <span className="tf-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{Math.round(p * 100)}%</span>
                        </div>
                        <HBar used={p} color="var(--brand)" height={5} />
                        <div className="tf-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                          {fmtMoney(g.current, { lang, cur })} / {fmtMoney(g.target, { lang, cur })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DashboardV3, DashboardV4 });
