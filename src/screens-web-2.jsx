// T-Finance · Supporting web screens 2
// Analytics, Investments, Asset detail, History, Credits, Profile

// ─── Analytics ──────────────────────────────────────────────────
function ScreenAnalytics({ lang = 'ru' }) {
  const i = window.TFI18n[lang];
  const d = window.TFData;
  const cur = lang === 'ru' ? '₽' : '$';
  return (
    <div className="tf-app" data-screen-label="Analytics">
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar active="analytics" lang={lang} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Topbar lang={lang} title={i.nav.analytics} />
          <div className="tf-content" style={{ overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div className="tf-h-eyebrow">{i.nav.analytics}</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 32, marginTop: 4, letterSpacing: '-0.02em' }}>{lang === 'ru' ? 'Куда уходят деньги' : 'Where the money goes'}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <PeriodSwitch lang={lang} value="90d" />
                <button className="tf-btn tf-btn--ghost"><span style={{ width: 14, height: 14 }}>{Ico.filter}</span>{lang === 'ru' ? 'Фильтр' : 'Filter'}</button>
              </div>
            </div>

            {/* KPI strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--gap)' }}>
              <StatTile label={i.inflow + ' · 90d'} value={fmtMoney(810000, { lang, cur })} sub="+8%" tone="pos" />
              <StatTile label={i.outflow + ' · 90d'} value={fmtMoney(384200, { lang, cur })} sub="−3%" tone="pos" />
              <StatTile label={lang === 'ru' ? 'Средний чек' : 'Avg transaction'} value={fmtMoney(2840, { lang, cur })} sub="+1.2%" tone="neg" />
              <StatTile label={lang === 'ru' ? 'Норма сбережений' : 'Savings rate'} value="52.6%" sub="+4 пп" tone="pos" />
            </div>

            {/* Sankey big */}
            <div className="tf-card">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3 className="tf-h-section">{lang === 'ru' ? 'Поток денег' : 'Money flow'}</h3>
                <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{lang === 'ru' ? 'Источники → T-Finance → Категории' : 'Sources → T-Finance → Categories'}</span>
              </div>
              <Sankey nodes={d.sankey.nodes} links={d.sankey.links} width={1100} height={320} />
            </div>

            {/* Bars + Heatmap */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 'var(--gap)' }}>
              <div className="tf-card">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h3 className="tf-h-section">{i.spendByMo}</h3>
                  <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
                    <span><span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--brand)', borderRadius: 2, marginRight: 4 }} />{i.outflow}</span>
                    <span><span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--c2)', borderRadius: 2, marginRight: 4 }} />{i.inflow}</span>
                  </div>
                </div>
                <div style={{ position: 'relative' }}>
                  <BarChart data={d.spend.map((v) => Math.abs(v) / 1000)}
                    labels={i.months} width={680} height={220} color="var(--brand)"
                    yFormat={(v) => v.toFixed(0) + 'k'} />
                </div>
              </div>

              <div className="tf-card">
                <h3 className="tf-h-section">{lang === 'ru' ? 'Календарь активности' : 'Activity calendar'}</h3>
                <Heatmap weeks={26} days={7}
                  values={d.heatmap}
                  labels={lang === 'ru' ? ['Пн','Ср','Пт'] : ['Mo','We','Fr']}
                  monthLabels={(lang === 'ru' ? ['Июн','Июл','Авг','Сен','Окт','Ноя'] : ['Jun','Jul','Aug','Sep','Oct','Nov']).map((m, idx) => ({ week: idx * 4 + 1, label: m }))} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, fontSize: 11, color: 'var(--ink-3)' }}>
                  <span>{lang === 'ru' ? 'Меньше' : 'Less'}</span>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[0.1, 0.3, 0.5, 0.7, 0.9].map((o) => <span key={o} style={{ width: 10, height: 10, background: 'var(--brand)', opacity: o, borderRadius: 2 }} />)}
                  </div>
                  <span>{lang === 'ru' ? 'Больше' : 'More'}</span>
                </div>
              </div>
            </div>

            {/* Categories table */}
            <div className="tf-card tf-card--flush">
              <table className="tf-table">
                <thead>
                  <tr>
                    <th>{i.categories}</th>
                    <th>{lang === 'ru' ? 'Транзакций' : 'Transactions'}</th>
                    <th>{lang === 'ru' ? 'Бюджет' : 'Budget'}</th>
                    <th style={{ textAlign: 'right' }}>{lang === 'ru' ? 'Сумма' : 'Amount'}</th>
                    <th style={{ textAlign: 'right' }}>%</th>
                  </tr>
                </thead>
                <tbody>
                  {d.categories.map((c) => {
                    const total = d.categories.reduce((s, x) => s + x.value, 0);
                    const p = c.value / total;
                    return (
                      <tr key={c.key}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ width: 10, height: 10, borderRadius: 3, background: c.color }} />
                            <span style={{ fontWeight: 600 }}>{i[c.key]}</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--ink-3)' }}>{Math.round(8 + Math.random() * 14)}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, maxWidth: 220 }}>
                            <HBar used={p * 1.4} color={c.color} height={6} />
                            <span className="tf-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{Math.round(p * 140)}%</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}><span className="tf-num-mono" style={{ fontWeight: 600 }}>{fmtMoney(c.value, { lang, cur })}</span></td>
                        <td style={{ textAlign: 'right', color: 'var(--ink-3)' }}>{Math.round(p * 100)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Investments / Portfolio ────────────────────────────────────
function ScreenInvest({ lang = 'ru' }) {
  const i = window.TFI18n[lang];
  const d = window.TFData;
  const cur = lang === 'ru' ? '₽' : '$';
  const portfolio = [
    { ticker: 'SBER', name: 'Сбер', nameEn: 'Sberbank', qty: 240, price: 286.42, ch: 1.84, alloc: 0.18, color: 'var(--c1)' },
    { ticker: 'YNDX', name: 'Яндекс', nameEn: 'Yandex', qty: 14, price: 3142.00, ch: -0.62, alloc: 0.14, color: 'var(--c2)' },
    { ticker: 'LKOH', name: 'Лукойл', nameEn: 'Lukoil', qty: 22, price: 7128.00, ch: 0.42, alloc: 0.22, color: 'var(--c3)' },
    { ticker: 'AAPL', name: 'Apple', nameEn: 'Apple', qty: 8, price: 189.60, ch: 0.86, alloc: 0.10, color: 'var(--c5)' },
    { ticker: 'OBLG', name: 'ОФЗ-26240', nameEn: 'OFZ-26240', qty: 100, price: 932.40, ch: 0.04, alloc: 0.24, color: 'var(--c6)' },
    { ticker: 'GOLD', name: 'Золото', nameEn: 'Gold', qty: 4.2, price: 6320, ch: -0.32, alloc: 0.08, color: 'var(--c7)' },
    { ticker: 'CASH', name: 'Свободные ₽', nameEn: 'Cash', qty: 1, price: 24800, ch: 0, alloc: 0.04, color: 'var(--c4)' },
  ];
  return (
    <div className="tf-app" data-screen-label="Investments">
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar active="invest" lang={lang} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Topbar lang={lang} title={i.nav.invest} />
          <div className="tf-content" style={{ overflowY: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 'var(--gap)' }}>
              <div className="tf-card" style={{ padding: 26 }}>
                <div className="tf-h-eyebrow">{i.portfolio}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 6 }}>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: 40, letterSpacing: '-0.02em' }}>{fmtMoney(612400, { lang, cur })}</span>
                  <span className="tf-pill tf-pill--pos">+1.86% · {fmtMoney(11200, { lang, cur, sign: true })}</span>
                  <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{lang === 'ru' ? 'за сегодня' : 'today'}</span>
                </div>
                <div style={{ display: 'flex', gap: 24, marginTop: 10, fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
                  <span>{lang === 'ru' ? 'Доходность за год:' : 'YTD return:'} <span style={{ color: 'var(--pos)' }}>+18.4%</span></span>
                  <span>{lang === 'ru' ? 'Дивиденды (год):' : 'Dividends YTD:'} <span style={{ color: 'var(--ink)' }}>{fmtMoney(28400, { lang, cur })}</span></span>
                  <span>{lang === 'ru' ? 'IRR:' : 'IRR:'} <span style={{ color: 'var(--ink)' }}>+14.2%</span></span>
                </div>
                <LineChart data={d.balance.map((v) => v * 0.3 + 480000)} width={720} height={220}
                  xLabels={lang === 'ru' ? ['авг','сен','окт','ноя'] : ['Aug','Sep','Oct','Nov']}
                  yFormat={(v) => (v / 1000).toFixed(0) + 'k'} />
              </div>

              <div className="tf-card">
                <h3 className="tf-h-section">{lang === 'ru' ? 'Аллокация' : 'Allocation'}</h3>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0' }}>
                  <Donut size={180} thick={22}
                    data={portfolio.map((p) => ({ value: p.alloc, color: p.color }))}
                    center={<div><div style={{ fontSize: 22, fontWeight: 600 }}>7</div><div style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{lang === 'ru' ? 'активов' : 'assets'}</div></div>} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {portfolio.slice(0, 5).map((p) => (
                    <CategoryDot key={p.ticker} color={p.color} label={lang === 'ru' ? p.name : p.nameEn} value={`${Math.round(p.alloc * 100)}%`} />
                  ))}
                </div>
              </div>
            </div>

            {/* Holdings table */}
            <div className="tf-card tf-card--flush">
              <table className="tf-table">
                <thead>
                  <tr>
                    <th>{lang === 'ru' ? 'Тикер' : 'Ticker'}</th>
                    <th>{lang === 'ru' ? 'Кол-во' : 'Qty'}</th>
                    <th>{lang === 'ru' ? 'Цена' : 'Price'}</th>
                    <th>{lang === 'ru' ? 'День' : 'Day'}</th>
                    <th>{lang === 'ru' ? 'Доля' : 'Allocation'}</th>
                    <th style={{ textAlign: 'right' }}>{lang === 'ru' ? 'Стоимость' : 'Value'}</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.map((p) => (
                    <tr key={p.ticker}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
                          <div>
                            <div className="tf-mono" style={{ fontWeight: 700, fontSize: 13 }}>{p.ticker}</div>
                            <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{lang === 'ru' ? p.name : p.nameEn}</div>
                          </div>
                        </div>
                      </td>
                      <td className="tf-mono" style={{ color: 'var(--ink-3)' }}>{p.qty}</td>
                      <td className="tf-mono">{p.price.toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US')}</td>
                      <td><span style={{ color: p.ch > 0 ? 'var(--pos)' : p.ch < 0 ? 'var(--neg)' : 'var(--ink-3)' }}>{pct(p.ch)}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, maxWidth: 180 }}>
                          <HBar used={p.alloc * 4} color={p.color} height={5} />
                          <span className="tf-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{Math.round(p.alloc * 100)}%</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}><span className="tf-num-mono" style={{ fontWeight: 600 }}>{fmtMoney(p.qty * p.price, { lang, cur, decimals: 0 })}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Asset detail (price chart) ─────────────────────────────────
function ScreenAsset({ lang = 'ru' }) {
  const i = window.TFI18n[lang];
  const d = window.TFData;
  const cur = lang === 'ru' ? '₽' : '$';
  return (
    <div className="tf-app" data-screen-label="Asset Detail">
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar active="invest" lang={lang} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Topbar lang={lang} />
          <div className="tf-content" style={{ overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button className="tf-btn tf-btn--ghost tf-btn--sm"><span style={{ width: 14, height: 14 }}>{Ico.arrowLeft}</span></button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'oklch(60% 0.14 25)', color: 'oklch(98% 0.005 80)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>СБ</div>
                <div>
                  <div className="tf-mono" style={{ fontWeight: 700, fontSize: 16 }}>SBER</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{lang === 'ru' ? 'Сбербанк · MOEX · RUB' : 'Sberbank · MOEX · RUB'}</div>
                </div>
              </div>
              <span className="tf-pill tf-pill--pos" style={{ marginLeft: 'auto' }}>★ {lang === 'ru' ? 'В наблюдении' : 'Watching'}</span>
              <button className="tf-btn tf-btn--ghost">{lang === 'ru' ? 'Продать' : 'Sell'}</button>
              <button className="tf-btn">{lang === 'ru' ? 'Купить' : 'Buy'}</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 56, letterSpacing: '-0.03em' }}>286.42 ₽</span>
              <span className="tf-pill tf-pill--pos">+5.24 · +1.86%</span>
              <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{lang === 'ru' ? '14:08 · MOEX' : '14:08 · MOEX'}</span>
            </div>

            <div className="tf-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <PeriodSwitch lang={lang} value="90d" />
                <div style={{ display: 'flex', gap: 6 }}>
                  <span className="tf-pill" style={{ cursor: 'pointer' }}>{lang === 'ru' ? 'Линия' : 'Line'}</span>
                  <span className="tf-pill tf-pill--ink">{lang === 'ru' ? 'Свечи' : 'Candles'}</span>
                  <span className="tf-pill" style={{ cursor: 'pointer' }}>{lang === 'ru' ? 'Объём' : 'Volume'}</span>
                </div>
              </div>
              <Candlestick data={d.candles} width={1100} height={300}
                upColor="var(--pos)" downColor="var(--neg)" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--gap)' }}>
              {[
                { l: lang === 'ru' ? 'Открытие' : 'Open', v: '281.18' },
                { l: lang === 'ru' ? 'Макс. день' : 'Day high', v: '287.62' },
                { l: lang === 'ru' ? 'Мин. день' : 'Day low', v: '280.42' },
                { l: lang === 'ru' ? 'Объём' : 'Volume', v: '12.4М' },
                { l: 'P/E', v: '4.82' },
                { l: lang === 'ru' ? 'Капитализация' : 'Market cap', v: '6.3 трлн ₽' },
                { l: lang === 'ru' ? 'Дивиденды' : 'Dividend', v: '11.4%' },
                { l: lang === 'ru' ? 'Бета' : 'Beta', v: '1.18' },
              ].map((s) => (
                <div key={s.l} className="tf-card" style={{ gap: 4 }}>
                  <div className="tf-h-eyebrow">{s.l}</div>
                  <div className="tf-num-big" style={{ fontSize: 22 }}>{s.v}</div>
                </div>
              ))}
            </div>

            <div className="tf-card">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3 className="tf-h-section">{lang === 'ru' ? 'Новости' : 'News'}</h3>
                <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{lang === 'ru' ? '3 источника' : '3 sources'}</span>
              </div>
              {[
                { t: lang === 'ru' ? 'Сбер представил Q3 — прибыль выросла на 14%' : 'Sberbank Q3 results — profit up 14%', src: 'Interfax', d: '2ч' },
                { t: lang === 'ru' ? 'Аналитики повысили целевую цену до 320 ₽' : 'Analysts raise target to 320 ₽', src: 'Bloomberg', d: '5ч' },
                { t: lang === 'ru' ? 'Запущен новый сервис для клиентов МСБ' : 'New service launched for SMB clients', src: 'Reuters', d: '1д' },
              ].map((n, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderTop: idx ? '1px solid var(--line-2)' : 'none' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-sunken)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--ink-3)' }}>📰</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{n.t}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{n.src} · {n.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenAnalytics, ScreenInvest, ScreenAsset });
