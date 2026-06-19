// T-Finance · Dashboards V1 & V2
// V1 Classic — Shopify-like SaaS layout, hero card, balanced grid
// V2 Data-heavy — Bloomberg-lite, sankey-first, monospace numbers

// ─── V1 · Classic ───────────────────────────────────────────────
function DashboardV1({ lang = 'ru' }) {
  const i = window.TFI18n[lang];
  const d = window.TFData;
  const cur = lang === 'ru' ? '₽' : '$';
  return (
    <div className="tf-app" data-screen-label="Dashboard V1 · Classic">
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar active="overview" lang={lang} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Topbar lang={lang} title={i.nav.overview} />
          <div className="tf-content" style={{ overflowY: 'auto' }}>
            {/* Greeting row */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div className="tf-h-eyebrow">{lang === 'ru' ? 'Вторник · 25 ноября' : 'Tuesday · Nov 25'}</div>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 400, margin: '6px 0 0', letterSpacing: '-0.02em' }}>{i.greeting}</h1>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="tf-btn tf-btn--ghost">{i.actions.topup}</button>
                <button className="tf-btn">{i.actions.send}</button>
              </div>
            </div>

            {/* Stat tiles */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--gap)' }}>
              <StatTile label={i.netWorth} value={fmtMoney(2349740, { lang, cur })} sub="+4.2%" tone="pos" sparkline={d.balance.slice(-30)} />
              <StatTile label={i.incomeMo} value={fmtMoney(258000, { lang, cur })} sub="+12%" tone="pos" sparkline={[170,180,195,210,200,230,258]} />
              <StatTile label={i.spendMo} value={fmtMoney(130800, { lang, cur })} sub="−8%" tone="pos" sparkline={[140,135,150,128,142,135,131]} />
              <StatTile label={i.invested} value={fmtMoney(612400, { lang, cur })} sub="+1.86%" tone="pos" sparkline={[600,595,605,608,612,615,612]} />
            </div>

            {/* Cashflow + Categories */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 'var(--gap)' }}>
              <div className="tf-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 className="tf-h-section">{i.cashflow}</h3>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>{i.cashflowSub}</div>
                  </div>
                  <PeriodSwitch lang={lang} />
                </div>
                <div style={{ display: 'flex', gap: 24, marginTop: 4 }}>
                  <div>
                    <div className="tf-h-eyebrow" style={{ color: 'var(--pos)' }}>{i.inflow}</div>
                    <div className="tf-num-big" style={{ fontSize: 22 }}>{fmtMoney(276000, { lang, cur })}</div>
                  </div>
                  <div>
                    <div className="tf-h-eyebrow" style={{ color: 'var(--neg)' }}>{i.outflow}</div>
                    <div className="tf-num-big" style={{ fontSize: 22 }}>{fmtMoney(130800, { lang, cur })}</div>
                  </div>
                  <div>
                    <div className="tf-h-eyebrow">{i.saved}</div>
                    <div className="tf-num-big" style={{ fontSize: 22, color: 'var(--brand)' }}>{fmtMoney(145200, { lang, cur })}</div>
                  </div>
                </div>
                <LineChart data={d.balance} width={620} height={200}
                  xLabels={lang === 'ru' ? ['авг','сен','окт','ноя'] : ['Aug','Sep','Oct','Nov']}
                  yFormat={(v) => (v / 1000).toFixed(0) + 'k'}
                  marker={d.balance.length - 1}
                />
              </div>

              <div className="tf-card">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h3 className="tf-h-section">{i.categories}</h3>
                  <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{i.month || (lang === 'ru' ? 'Ноябрь' : 'November')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
                  <Donut size={180} thick={26}
                    data={d.categories.map((c) => ({ value: c.value, color: c.color }))}
                    center={<div>
                      <div style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{i.spendMo}</div>
                      <div className="tf-num-big" style={{ fontSize: 22 }}>{fmtMoney(130800, { lang, cur })}</div>
                    </div>} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {d.categories.slice(0, 5).map((c) => (
                    <CategoryDot key={c.key} color={c.color} label={i[c.key]} value={fmtMoney(c.value, { lang, cur })}
                      sub={`${Math.round(c.value / d.categories.reduce((s, x) => s + x.value, 0) * 100)}%`} />
                  ))}
                </div>
              </div>
            </div>

            {/* Accounts row + recent activity */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 'var(--gap)' }}>
              <div className="tf-card">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h3 className="tf-h-section">{i.nav.accounts}</h3>
                  <span className="tf-btn tf-btn--ghost tf-btn--sm">{i.addAccount}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {d.accounts.map((a) => (
                    <div key={a.id} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: a.color }} />
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{lang === 'ru' ? a.label : a.labelEn}</span>
                        <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>·· {a.last4}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                        <span className="tf-num-big" style={{ fontSize: 20 }}>
                          {fmtMoney(a.amount, { lang, cur: a.cur, decimals: a.cur === '$' ? 2 : 0 })}
                        </span>
                        <Sparkline values={a.trend} width={64} height={20} color={a.color} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="tf-card">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h3 className="tf-h-section">{i.recent}</h3>
                  <span style={{ fontSize: 12, color: 'var(--ink-3)', cursor: 'pointer' }}>{i.seeAll}</span>
                </div>
                <div>
                  {d.transactions.slice(0, 5).map((tx) => <TxnRow key={tx.id} tx={tx} lang={lang} />)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── V2 · Data-heavy / Terminal ─────────────────────────────────
function DashboardV2({ lang = 'ru' }) {
  const i = window.TFI18n[lang];
  const d = window.TFData;
  const cur = lang === 'ru' ? '₽' : '$';
  return (
    <div className="tf-app" data-screen-label="Dashboard V2 · Data-heavy" data-density="compact">
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar active="overview" lang={lang} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Topbar lang={lang} title={i.nav.overview} />

          {/* Strip with quote ticker */}
          <div style={{ borderBottom: '1px solid var(--line)', padding: '8px 24px', display: 'flex', gap: 24, fontFamily: 'var(--font-mono)', fontSize: 11, overflow: 'hidden', whiteSpace: 'nowrap', background: 'var(--bg-sunken)' }}>
            {[
              { l: 'IMOEX', v: '3 142.86', d: '+0.42%', tone: 'pos' },
              { l: 'USD/RUB', v: '92.40', d: '−0.18%', tone: 'neg' },
              { l: 'EUR/RUB', v: '99.86', d: '+0.06%', tone: 'pos' },
              { l: 'BRENT', v: '$78.42', d: '+1.04%', tone: 'pos' },
              { l: 'GOLD', v: '$2 042', d: '−0.32%', tone: 'neg' },
              { l: 'BTC', v: '$72 412', d: '+2.18%', tone: 'pos' },
              { l: 'ETH', v: '$3 826', d: '+1.42%', tone: 'pos' },
              { l: 'SBER', v: '286.42', d: '+0.64%', tone: 'pos' },
            ].map((t, idx) => (
              <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: 'var(--ink-3)' }}>{t.l}</span>
                <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{t.v}</span>
                <span style={{ color: t.tone === 'pos' ? 'var(--pos)' : 'var(--neg)' }}>{t.d}</span>
              </span>
            ))}
          </div>

          <div className="tf-content" style={{ overflowY: 'auto', padding: '20px 24px' }}>
            {/* Hero — big number + sankey */}
            <div className="tf-card" style={{ padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="tf-h-eyebrow">{i.netWorth}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 6 }}>
                    <span className="tf-num-big" style={{ fontSize: 42 }}>{fmtMoney(2349740, { lang, cur })}</span>
                    <span className="tf-pill tf-pill--pos">+4.2% · {fmtMoney(94800, { lang, cur, sign: true })}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 24, marginTop: 14, fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
                    <span>{i.nav.accounts}: <span style={{ color: 'var(--ink)' }}>{fmtMoney(1737340, { lang, cur })}</span></span>
                    <span>{i.invested}: <span style={{ color: 'var(--ink)' }}>{fmtMoney(612400, { lang, cur })}</span></span>
                    <span>{lang === 'ru' ? 'Кэш-флоу ноя:' : 'Cashflow Nov:'} <span style={{ color: 'var(--pos)' }}>{fmtMoney(145200, { lang, cur, sign: true })}</span></span>
                  </div>
                </div>
                <PeriodSwitch lang={lang} value="90d" />
              </div>
              <LineChart data={d.balance} width={1080} height={180} fill
                xLabels={lang === 'ru' ? ['авг','сен','окт','ноя'] : ['Aug','Sep','Oct','Nov']}
                yFormat={(v) => (v / 1000).toFixed(0) + 'k'} marker={d.balance.length - 1} />
            </div>

            {/* Sankey + side stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 'var(--gap)' }}>
              <div className="tf-card">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h3 className="tf-h-section">{lang === 'ru' ? 'Поток денег · ноябрь' : 'Money flow · November'}</h3>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>276k {cur} → 276k {cur}</span>
                </div>
                <Sankey nodes={d.sankey.nodes} links={d.sankey.links} width={680} height={300} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap)' }}>
                <div className="tf-card">
                  <h3 className="tf-h-section">{i.watch}</h3>
                  <table style={{ width: '100%', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                    <tbody>
                      {d.watchlist.map((w) => (
                        <tr key={w.ticker}>
                          <td style={{ padding: '6px 0', fontWeight: 700 }}>{w.ticker}</td>
                          <td style={{ color: 'var(--ink-3)', fontSize: 11 }}>{lang === 'ru' ? w.name : w.nameEn}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>{w.price}</td>
                          <td style={{ textAlign: 'right', color: w.ch > 0 ? 'var(--pos)' : 'var(--neg)', width: 56 }}>{pct(w.ch)}</td>
                          <td style={{ width: 60 }}>
                            <Sparkline values={w.spark} width={56} height={20} color={w.ch > 0 ? 'var(--pos)' : 'var(--neg)'} fill={false} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="tf-card">
                  <h3 className="tf-h-section">{i.spendByMo}</h3>
                  <BarChart data={d.spend.map((v) => Math.abs(v) / 1000)}
                    labels={i.months}
                    width={420} height={140} color="var(--brand)"
                    yFormat={(v) => v.toFixed(0) + 'k'} />
                </div>
              </div>
            </div>

            {/* Bottom: heatmap + categories + recent */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 'var(--gap)' }}>
              <div className="tf-card">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h3 className="tf-h-section">{lang === 'ru' ? 'Расходы · 26 недель' : 'Spending · 26 weeks'}</h3>
                  <span style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>0 → 12k</span>
                </div>
                <Heatmap weeks={26} days={7}
                  values={d.heatmap}
                  labels={lang === 'ru' ? ['Пн','Ср','Пт'] : ['Mo','We','Fr']}
                  monthLabels={(lang === 'ru' ? ['Июн','Июл','Авг','Сен','Окт','Ноя'] : ['Jun','Jul','Aug','Sep','Oct','Nov']).map((m, idx) => ({ week: idx * 4 + 1, label: m }))} />
              </div>

              <div className="tf-card">
                <h3 className="tf-h-section">{i.categories}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {d.categories.map((c) => {
                    const total = d.categories.reduce((s, x) => s + x.value, 0);
                    const p = c.value / total;
                    return (
                      <div key={c.key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                          <span>{i[c.key]}</span>
                          <span className="tf-mono" style={{ color: 'var(--ink-3)' }}>{fmtMoney(c.value, { lang, cur })}</span>
                        </div>
                        <HBar segments={[{ value: p, color: c.color }, { value: 1 - p, color: 'var(--bg-sunken)' }]} height={6} />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="tf-card">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h3 className="tf-h-section">{i.recent}</h3>
                  <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{i.seeAll}</span>
                </div>
                <div>
                  {d.transactions.slice(0, 5).map((tx) => <TxnRow key={tx.id} tx={tx} lang={lang} />)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DashboardV1, DashboardV2 });
