// T-Finance · Supporting web screens 3
// History, Credits & Deposits, Profile

// ─── History ────────────────────────────────────────────────────
function ScreenHistory({ lang = 'ru' }) {
  const i = window.TFI18n[lang];
  const d = window.TFData;
  const cur = lang === 'ru' ? '₽' : '$';
  // expanded
  const txs = [
    ...d.transactions,
    { id: 10, label: 'Wildberries', labelEn: 'Wildberries', cat: 'other', amount: -8420, day: '20.11', t: '16:32' },
    { id: 11, label: 'Перекрёсток', labelEn: 'Perekrestok', cat: 'food', amount: -2640, day: '20.11', t: '12:08' },
    { id: 12, label: 'Дивиденды · SBER', labelEn: 'Dividends · SBER', cat: 'dividends', amount: 4840, day: '19.11', t: '10:00', tag: 'inflow' },
    { id: 13, label: 'Аренда квартиры', labelEn: 'Rent', amount: -65000, day: '18.11', t: '09:00', recurring: true },
    { id: 14, label: 'Spotify', labelEn: 'Spotify', amount: -169, cat: 'services', day: '17.11', t: '23:12', recurring: true },
  ];
  const groups = {};
  txs.forEach((t) => { (groups[t.day] = groups[t.day] || []).push(t); });
  return (
    <div className="tf-app" data-screen-label="History">
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar active="history" lang={lang} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Topbar lang={lang} title={i.nav.history} />
          <div className="tf-content" style={{ overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div>
                <div className="tf-h-eyebrow">{lang === 'ru' ? '312 операций · ноябрь' : '312 transactions · November'}</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 32, marginTop: 4, letterSpacing: '-0.02em' }}>{i.nav.history}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="tf-btn tf-btn--ghost"><span style={{ width: 14, height: 14 }}>{Ico.filter}</span>{lang === 'ru' ? 'Фильтры' : 'Filters'}</button>
                <button className="tf-btn tf-btn--ghost">{lang === 'ru' ? 'Экспорт CSV' : 'Export CSV'}</button>
              </div>
            </div>

            {/* Filter chips */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { l: lang === 'ru' ? 'Все' : 'All', active: true, n: 312 },
                { l: i.inflow, n: 24 },
                { l: i.outflow, n: 288 },
                { l: i.food, n: 64 },
                { l: i.transport, n: 38 },
                { l: i.services, n: 12 },
                { l: lang === 'ru' ? 'Подписки' : 'Subscriptions', n: 14 },
              ].map((c) => (
                <span key={c.l} className={'tf-pill' + (c.active ? ' tf-pill--ink' : '')}>{c.l} <span style={{ opacity: 0.6, marginLeft: 2 }}>{c.n}</span></span>
              ))}
            </div>

            {/* Day groups */}
            {Object.entries(groups).map(([day, items]) => {
              const dayLabel = day === 'today' ? i.today : day === 'yesterday' ? i.yesterday : day;
              const sum = items.reduce((s, x) => s + x.amount, 0);
              return (
                <div key={day} className="tf-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="tf-h-section">{dayLabel}</h3>
                    <span className="tf-mono" style={{ fontSize: 12, color: sum > 0 ? 'var(--pos)' : 'var(--ink-3)' }}>
                      {fmtMoney(sum, { lang, cur, sign: true })}
                    </span>
                  </div>
                  <div>
                    {items.map((tx) => <TxnRow key={tx.id} tx={tx} lang={lang} />)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Credits & Deposits ─────────────────────────────────────────
function ScreenCredit({ lang = 'ru' }) {
  const i = window.TFI18n[lang];
  const cur = lang === 'ru' ? '₽' : '$';
  return (
    <div className="tf-app" data-screen-label="Credit & Deposits">
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar active="credit" lang={lang} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Topbar lang={lang} title={i.nav.credit} />
          <div className="tf-content" style={{ overflowY: 'auto' }}>
            <div className="tf-h-eyebrow">{i.nav.credit}</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 32, marginTop: -4, letterSpacing: '-0.02em' }}>
              {lang === 'ru' ? 'Накопления, кредиты, страхование' : 'Savings, loans, and insurance'}
            </div>

            {/* Active products */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--gap)' }}>
              <div className="tf-card tf-card--brand" style={{ padding: 22 }}>
                <div className="tf-h-eyebrow" style={{ color: 'oklch(85% 0.12 155)' }}>{lang === 'ru' ? 'ВАШ ВКЛАД' : 'YOUR DEPOSIT'}</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 42, letterSpacing: '-0.02em' }}>{fmtMoney(1240000, { lang, cur })}</div>
                <div style={{ display: 'flex', gap: 24, fontSize: 12, opacity: 0.85 }}>
                  <span>{lang === 'ru' ? 'Ставка' : 'Rate'} · <b>12.4%</b></span>
                  <span>{lang === 'ru' ? 'До' : 'Until'} · 14.04.2026</span>
                  <span>{lang === 'ru' ? 'Доход' : 'Income'} · <b>+{fmtMoney(86400, { lang, cur, sign: false })}</b></span>
                </div>
                <HBar used={0.42} color="oklch(85% 0.12 155)" track="color-mix(in oklch, var(--bg) 18%, transparent)" height={6} />
              </div>

              <div className="tf-card" style={{ padding: 22 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div className="tf-h-eyebrow">{lang === 'ru' ? 'ИПОТЕКА' : 'MORTGAGE'}</div>
                  <span className="tf-pill">{lang === 'ru' ? 'Стабильно' : 'On track'}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 42, letterSpacing: '-0.02em' }}>{fmtMoney(2840000, { lang, cur })}</div>
                <div style={{ display: 'flex', gap: 24, fontSize: 12, color: 'var(--ink-3)' }}>
                  <span>{lang === 'ru' ? 'Ставка' : 'Rate'} · <b style={{ color: 'var(--ink)' }}>9.2%</b></span>
                  <span>{lang === 'ru' ? 'Платёж' : 'Monthly'} · <b style={{ color: 'var(--ink)' }}>{fmtMoney(38400, { lang, cur })}</b></span>
                  <span>{lang === 'ru' ? 'Осталось' : 'Left'} · <b style={{ color: 'var(--ink)' }}>18 {lang === 'ru' ? 'лет' : 'yr'}</b></span>
                </div>
                <HBar used={0.21} color="var(--ink)" height={6} />
                <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{lang === 'ru' ? 'Выплачено 21% · следующий платёж 1 декабря' : '21% paid · next due Dec 1'}</div>
              </div>
            </div>

            {/* Marketplace */}
            <div className="tf-h-section">{lang === 'ru' ? 'Подходящие продукты' : 'Recommended for you'}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--gap)' }}>
              {[
                { name: lang === 'ru' ? 'Накопительный счёт' : 'Savings account', rate: '14.8%', sub: lang === 'ru' ? 'Любая сумма, без срока' : 'Any amount, no term', cta: lang === 'ru' ? 'Открыть' : 'Open', accent: 'var(--brand)' },
                { name: lang === 'ru' ? 'Вклад «Премиум»' : 'Premium deposit', rate: '16.2%', sub: lang === 'ru' ? 'От 100 000 ₽ · 6 мес' : 'From $100k · 6 mo', cta: lang === 'ru' ? 'Подобрать' : 'Pick term', accent: 'var(--c2)' },
                { name: lang === 'ru' ? 'Потреб. кредит' : 'Personal loan', rate: '12.9%', sub: lang === 'ru' ? 'До 5 млн · 5 лет' : 'Up to $5M · 5 yr', cta: lang === 'ru' ? 'Рассчитать' : 'Calculate', accent: 'var(--c4)' },
                { name: lang === 'ru' ? 'Кредитная карта' : 'Credit card', rate: '120 ' + (lang === 'ru' ? 'дней без %' : 'days · 0%'), sub: lang === 'ru' ? 'Лимит до 1 млн ₽' : 'Limit up to $1M', cta: lang === 'ru' ? 'Получить' : 'Apply', accent: 'var(--c5)' },
                { name: lang === 'ru' ? 'Авто-кредит' : 'Auto loan', rate: '11.4%', sub: lang === 'ru' ? 'Любой автосалон РФ' : 'Any dealer', cta: lang === 'ru' ? 'Подать' : 'Apply', accent: 'var(--c3)' },
                { name: lang === 'ru' ? 'Страхование жизни' : 'Life insurance', rate: '— ', sub: lang === 'ru' ? 'От 690 ₽/мес' : 'From $9/mo', cta: lang === 'ru' ? 'Подключить' : 'Connect', accent: 'var(--c6)' },
              ].map((p) => (
                <div key={p.name} className="tf-card" style={{ position: 'relative', overflow: 'hidden' }}>
                  <span style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: p.accent }} />
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 30, letterSpacing: '-0.02em', color: p.accent }}>{p.rate}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{p.sub}</div>
                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button className="tf-btn tf-btn--ghost tf-btn--sm">{p.cta} →</button>
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

// ─── Profile / Settings ─────────────────────────────────────────
function ScreenProfile({ lang = 'ru' }) {
  const i = window.TFI18n[lang];
  return (
    <div className="tf-app" data-screen-label="Profile">
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar active="profile" lang={lang} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Topbar lang={lang} title={i.nav.profile} />
          <div className="tf-content" style={{ overflowY: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--gap)' }}>
              {/* Side nav for settings */}
              <div className="tf-card" style={{ gap: 4 }}>
                {[
                  { l: lang === 'ru' ? 'Личные данные' : 'Personal info', active: true },
                  { l: lang === 'ru' ? 'Безопасность' : 'Security' },
                  { l: lang === 'ru' ? 'Уведомления' : 'Notifications' },
                  { l: lang === 'ru' ? 'Подписки' : 'Subscriptions' },
                  { l: lang === 'ru' ? 'Лимиты карт' : 'Card limits' },
                  { l: lang === 'ru' ? 'Налоги' : 'Tax documents' },
                  { l: lang === 'ru' ? 'Подключённые устройства' : 'Devices' },
                  { l: lang === 'ru' ? 'Закрыть аккаунт' : 'Close account', danger: true },
                ].map((s) => (
                  <div key={s.l} className={'tf-nav-item' + (s.active ? ' tf-nav-item--active' : '')}
                    style={s.danger ? { color: 'var(--neg)' } : {}}>
                    <span>{s.l}</span>
                  </div>
                ))}
              </div>

              {/* Main panel */}
              <div className="tf-card" style={{ padding: 24, gap: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 72, height: 72, borderRadius: 50, background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-2) 100%)', color: 'oklch(98% 0.02 155)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700 }}>АП</div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26 }}>{lang === 'ru' ? 'Алексей Петров' : 'Alex Petrov'}</div>
                    <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>{lang === 'ru' ? 'Клиент с 2019 · T-Black' : 'Client since 2019 · T-Black'}</div>
                  </div>
                  <button className="tf-btn tf-btn--ghost" style={{ marginLeft: 'auto' }}>{lang === 'ru' ? 'Сменить фото' : 'Change photo'}</button>
                </div>

                <div className="tf-divider" />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                  {[
                    { l: lang === 'ru' ? 'Имя' : 'First name', v: lang === 'ru' ? 'Алексей' : 'Alex' },
                    { l: lang === 'ru' ? 'Фамилия' : 'Last name', v: lang === 'ru' ? 'Петров' : 'Petrov' },
                    { l: lang === 'ru' ? 'Email' : 'Email', v: 'a.petrov@mail.com' },
                    { l: lang === 'ru' ? 'Телефон' : 'Phone', v: '+7 ··· ··· 18 42' },
                    { l: lang === 'ru' ? 'Дата рождения' : 'Date of birth', v: '14 мар 1989' },
                    { l: lang === 'ru' ? 'Город' : 'City', v: lang === 'ru' ? 'Москва' : 'Moscow' },
                  ].map((f) => (
                    <div key={f.l} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div className="tf-h-eyebrow" style={{ fontSize: 10 }}>{f.l}</div>
                      <div style={{ border: '1px solid var(--line)', borderRadius: 8, padding: '10px 12px', fontSize: 13 }}>{f.v}</div>
                    </div>
                  ))}
                </div>

                <div className="tf-divider" />

                {/* Security toggles */}
                <div>
                  <div className="tf-h-eyebrow" style={{ marginBottom: 10 }}>{lang === 'ru' ? 'Безопасность' : 'Security'}</div>
                  {[
                    { l: lang === 'ru' ? 'Биометрия Face ID' : 'Face ID', on: true },
                    { l: lang === 'ru' ? 'Двухфакторная авторизация' : 'Two-factor authentication', on: true },
                    { l: lang === 'ru' ? 'Подтверждение операций PUSH' : 'Push confirmation', on: true },
                    { l: lang === 'ru' ? 'Скрывать суммы на главной' : 'Hide amounts on overview', on: false },
                  ].map((t, idx) => (
                    <div key={t.l} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: idx ? '1px solid var(--line-2)' : 'none' }}>
                      <span style={{ fontSize: 13 }}>{t.l}</span>
                      <div style={{
                        width: 36, height: 22, borderRadius: 999, padding: 2,
                        background: t.on ? 'var(--brand)' : 'var(--line)',
                        display: 'flex', alignItems: 'center',
                        justifyContent: t.on ? 'flex-end' : 'flex-start',
                      }}>
                        <div style={{ width: 18, height: 18, borderRadius: 50, background: 'var(--bg-elev)', boxShadow: 'var(--shadow-1)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenHistory, ScreenCredit, ScreenProfile });
