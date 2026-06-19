// T-Finance · Supporting web screens
// Accounts, Transfer, Analytics, Investments, Asset detail, History, Credits, Profile

// ─── Accounts & Cards ───────────────────────────────────────────
function ScreenAccounts({ lang = 'ru' }) {
  const i = window.TFI18n[lang];
  const d = window.TFData;
  const cur = lang === 'ru' ? '₽' : '$';
  return (
    <div className="tf-app" data-screen-label="Accounts & Cards">
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar active="accounts" lang={lang} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Topbar lang={lang} title={i.nav.accounts} />
          <div className="tf-content" style={{ overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div className="tf-h-eyebrow">{lang === 'ru' ? '4 счёта · 3 карты' : '4 accounts · 3 cards'}</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 36, lineHeight: 1, marginTop: 4, letterSpacing: '-0.02em' }}>{fmtMoney(2349740, { lang, cur })}</div>
              </div>
              <button className="tf-btn">{i.addAccount}</button>
            </div>

            {/* Cards strip */}
            <div className="tf-h-section">{lang === 'ru' ? 'Карты' : 'Cards'}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--gap)' }}>
              {[
                { name: 'T-Black', sub: 'Visa Infinite', bg: 'linear-gradient(135deg, oklch(22% 0.018 250) 0%, oklch(12% 0.012 250) 100%)', last: '4421', tier: 'BLACK', accent: 'var(--brand)' },
                { name: 'T-Travel', sub: 'Mastercard World', bg: 'linear-gradient(135deg, var(--brand) 0%, oklch(28% 0.06 155) 100%)', last: '0118', tier: 'TRAVEL', accent: 'oklch(80% 0.12 65)' },
                { name: 'T-Junior', sub: lang === 'ru' ? 'Карта для подростка' : 'Card for teen', bg: 'linear-gradient(135deg, oklch(58% 0.14 25) 0%, oklch(40% 0.16 25) 100%)', last: '7702', tier: 'JUNIOR', accent: 'oklch(98% 0.005 80)' },
              ].map((c) => (
                <div key={c.last} style={{
                  borderRadius: 18, padding: 22, background: c.bg, color: 'oklch(98% 0.005 80)',
                  aspectRatio: '1.586/1', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
                  boxShadow: '0 8px 30px -10px oklch(0% 0 0 / 0.3)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 11, opacity: 0.7, letterSpacing: '0.18em', fontWeight: 600 }}>T—FINANCE</div>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, marginTop: 2, letterSpacing: '-0.01em' }}>{c.name}</div>
                    </div>
                    <div style={{ width: 36, height: 26, borderRadius: 4, background: c.accent, opacity: 0.9 }} />
                  </div>
                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div className="tf-mono" style={{ fontSize: 16, letterSpacing: '0.18em' }}>•• {c.last}</div>
                    <div style={{ fontSize: 10, opacity: 0.6, letterSpacing: '0.16em' }}>{c.sub.toUpperCase()}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Accounts table */}
            <div className="tf-h-section">{lang === 'ru' ? 'Счета' : 'Accounts'}</div>
            <div className="tf-card tf-card--flush">
              <table className="tf-table">
                <thead>
                  <tr>
                    <th>{lang === 'ru' ? 'Счёт' : 'Account'}</th>
                    <th>{lang === 'ru' ? 'Тип' : 'Type'}</th>
                    <th>{lang === 'ru' ? 'Динамика 30д' : '30d trend'}</th>
                    <th style={{ textAlign: 'right' }}>{lang === 'ru' ? 'Баланс' : 'Balance'}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {d.accounts.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'color-mix(in oklch, ' + a.color + ' 18%, transparent)', color: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>
                            {(lang === 'ru' ? a.label : a.labelEn).charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{lang === 'ru' ? a.label : a.labelEn}</div>
                            <div className="tf-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>·· {a.last4}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="tf-pill">{a.type === 'debit' ? (lang === 'ru' ? 'Дебетовый' : 'Debit') : a.type === 'savings' ? (lang === 'ru' ? 'Накопит.' : 'Savings') : a.type === 'fx' ? (lang === 'ru' ? 'Валютный' : 'FX') : (lang === 'ru' ? 'Брокер' : 'Brokerage')}</span>{a.rate && <span className="tf-pill tf-pill--brand" style={{ marginLeft: 6 }}>{a.rate}</span>}</td>
                      <td><Sparkline values={a.trend} width={120} height={26} color={a.color} /></td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="tf-num-big" style={{ fontSize: 16 }}>{fmtMoney(a.amount, { lang, cur: a.cur, decimals: a.cur === '$' ? 2 : 0 })}</div>
                      </td>
                      <td style={{ width: 36, color: 'var(--ink-3)' }}><div style={{ width: 16, height: 16 }}>{Ico.arrowRight}</div></td>
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

// ─── Transfer screen ────────────────────────────────────────────
function ScreenTransfer({ lang = 'ru' }) {
  const i = window.TFI18n[lang];
  const cur = lang === 'ru' ? '₽' : '$';
  return (
    <div className="tf-app" data-screen-label="Transfer">
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar active="transfer" lang={lang} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Topbar lang={lang} title={i.nav.transfer} />
          <div className="tf-content" style={{ overflowY: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--gap)' }}>
              {/* Transfer form */}
              <div className="tf-card" style={{ padding: 26, gap: 18 }}>
                <div className="tf-h-eyebrow">{lang === 'ru' ? 'Новый перевод' : 'New transfer'}</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, letterSpacing: '-0.02em' }}>{lang === 'ru' ? 'Перевод другу или себе' : 'Send to a friend or yourself'}</div>

                {/* From */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div className="tf-h-eyebrow" style={{ fontSize: 10 }}>{lang === 'ru' ? 'Откуда' : 'From'}</div>
                  <div style={{ border: '1px solid var(--line)', borderRadius: 10, padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--brand-tint)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>Г</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{lang === 'ru' ? 'Главный счёт' : 'Everyday'}</div>
                      <div className="tf-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>·· 4421 · {fmtMoney(482340, { lang, cur })}</div>
                    </div>
                    <div style={{ color: 'var(--ink-3)', width: 16, height: 16 }}>{Ico.dots}</div>
                  </div>
                </div>

                {/* Amount */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div className="tf-h-eyebrow" style={{ fontSize: 10 }}>{lang === 'ru' ? 'Сумма' : 'Amount'}</div>
                  <div style={{ border: '1px solid var(--brand)', borderRadius: 10, padding: '16px 14px', display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: 40, lineHeight: 1, letterSpacing: '-0.02em' }}>{lang === 'ru' ? '12 500' : '12,500'}</span>
                    <span style={{ fontSize: 16, color: 'var(--ink-3)' }}>{cur}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-3)' }}>{lang === 'ru' ? 'Без комиссии' : 'No fee'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {[1000, 5000, 10000, 25000].map((v) => (
                      <span key={v} className="tf-pill" style={{ cursor: 'pointer' }}>+{fmtMoney(v, { lang, cur: '' })}</span>
                    ))}
                  </div>
                </div>

                {/* To — recipient */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div className="tf-h-eyebrow" style={{ fontSize: 10 }}>{lang === 'ru' ? 'Получатель' : 'To'}</div>
                  <div style={{ border: '1px solid var(--line)', borderRadius: 10, padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 50, background: 'oklch(85% 0.12 25)', color: 'oklch(35% 0.16 25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>М</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{lang === 'ru' ? 'Марина К.' : 'Marina K.'}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>+7 ··· ··· 28 14 · {lang === 'ru' ? 'T-Finance' : 'T-Finance'}</div>
                    </div>
                    <span className="tf-pill tf-pill--brand">{lang === 'ru' ? 'Найдено' : 'Found'}</span>
                  </div>
                </div>

                {/* Message */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div className="tf-h-eyebrow" style={{ fontSize: 10 }}>{lang === 'ru' ? 'Сообщение' : 'Message'}</div>
                  <div style={{ border: '1px solid var(--line)', borderRadius: 10, padding: 12, color: 'var(--ink-3)', fontSize: 13 }}>
                    {lang === 'ru' ? 'За ужин в субботу 🍝' : 'Saturday dinner 🍝'}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{lang === 'ru' ? 'Перевод придёт мгновенно' : 'Transfer arrives instantly'}</div>
                  <button className="tf-btn tf-btn--brand">{lang === 'ru' ? 'Перевести 12 500 ₽' : 'Send $12,500'} →</button>
                </div>
              </div>

              {/* Right column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap)' }}>
                <div className="tf-card">
                  <h3 className="tf-h-section">{lang === 'ru' ? 'Частые получатели' : 'Frequent'}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                    {[
                      { n: 'Марина', c: 'oklch(85% 0.12 25)', i: 'М' },
                      { n: 'Дмитрий', c: 'oklch(85% 0.12 240)', i: 'Д' },
                      { n: 'Иван', c: 'var(--brand-tint)', i: 'И' },
                      { n: 'Ольга', c: 'oklch(85% 0.12 320)', i: 'О' },
                    ].map((p) => (
                      <div key={p.n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 50, background: p.c, color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>{p.i}</div>
                        <div style={{ fontSize: 11 }}>{p.n}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="tf-card">
                  <h3 className="tf-h-section">{lang === 'ru' ? 'Способы' : 'Methods'}</h3>
                  {[
                    { l: lang === 'ru' ? 'По номеру телефона' : 'By phone', s: 'СБП', i: '📱' },
                    { l: lang === 'ru' ? 'По QR-коду' : 'By QR code', s: lang === 'ru' ? 'Бизнес' : 'Business', i: '⌗' },
                    { l: lang === 'ru' ? 'По реквизитам' : 'By IBAN', s: 'SWIFT', i: '🏦' },
                    { l: lang === 'ru' ? 'Между счетами' : 'Between accounts', s: lang === 'ru' ? 'Бесплатно' : 'Free', i: '⇆' },
                  ].map((m, idx) => (
                    <div key={m.l} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: idx ? '1px solid var(--line-2)' : 'none' }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--bg-sunken)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{m.i}</div>
                      <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{m.l}</div>
                      <span className="tf-pill">{m.s}</span>
                    </div>
                  ))}
                </div>

                <div className="tf-card tf-card--ghost">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 24, height: 24, color: 'var(--brand)' }}>{Ico.shield}</span>
                    <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.5 }}>
                      {lang === 'ru' ? 'Все переводы защищены биометрией и одноразовыми ключами.' : 'All transfers protected by biometrics and one-time keys.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenAccounts, ScreenTransfer });
