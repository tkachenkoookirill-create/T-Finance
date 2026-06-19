// T-Finance · Mobile screens + Onboarding
// All rendered inside iOS frames (402×874).

function MobileFrame({ children, dark = false, title = '', label = '' }) {
  return (
    <IOSDevice width={402} height={874} dark={dark} title={title}>
      <div data-screen-label={label} style={{ width: '100%', height: '100%' }}>{children}</div>
    </IOSDevice>
  );
}

function TabBar({ active = 'home', lang = 'ru' }) {
  const i = window.TFI18n[lang];
  const items = [
    { id: 'home', icon: Ico.home, label: i.nav.overview },
    { id: 'accounts', icon: Ico.card, label: i.nav.accounts.split(' ')[0] },
    { id: 'transfer', icon: Ico.arrows, label: i.actions.send },
    { id: 'invest', icon: Ico.invest, label: i.nav.invest },
    { id: 'profile', icon: Ico.settings, label: lang === 'ru' ? 'Ещё' : 'More' },
  ];
  return (
    <div className="tf-mobile__tab">
      {items.map((it) => (
        <div key={it.id} className={active === it.id ? 'is-active' : ''}>
          <span style={{ width: 22, height: 22 }}>{it.icon}</span>
          <span>{it.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Mobile Dashboard ───────────────────────────────────────────
function MobileHome({ lang = 'ru' }) {
  const i = window.TFI18n[lang];
  const d = window.TFData;
  const cur = lang === 'ru' ? '₽' : '$';
  return (
    <div className="tf-mobile">
      <div className="tf-mobile__hd">
        <div className="tf-avatar">АП</div>
        <TFLogo size={18} mark />
        <div style={{ display: 'flex', gap: 12, color: 'var(--ink-3)' }}>
          <span style={{ width: 20, height: 20 }}>{Ico.scan}</span>
          <span style={{ width: 20, height: 20 }}>{Ico.bell}</span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 18px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Balance card */}
        <div style={{ background: 'var(--ink)', color: 'var(--bg)', borderRadius: 18, padding: 18, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 110% -10%, var(--brand) 0%, transparent 50%)', opacity: 0.4 }} />
          <div className="tf-h-eyebrow" style={{ color: 'oklch(70% 0.05 155)' }}>{i.netWorth}</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 38, lineHeight: 1.1, letterSpacing: '-0.02em', marginTop: 4 }}>{fmtMoney(2349740, { lang, cur })}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <span style={{ fontSize: 12, color: 'oklch(85% 0.16 150)' }}>↑ +4.2% · {fmtMoney(94800, { lang, cur, sign: true })}</span>
          </div>
          <div style={{ marginTop: 8 }}>
            <Sparkline values={d.balance} width={340} height={48} color="oklch(85% 0.16 150)" stroke={1.5} />
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {[
            { l: i.actions.send, ic: Ico.arrowUp },
            { l: i.actions.topup, ic: Ico.plus },
            { l: i.actions.pay, ic: Ico.qr },
            { l: i.actions.exchange, ic: Ico.arrows },
          ].map((a) => (
            <div key={a.l} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: 10, background: 'var(--bg-sunken)', borderRadius: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: 'var(--bg-elev)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)' }}>
                <span style={{ width: 18, height: 18 }}>{a.ic}</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600 }}>{a.l}</span>
            </div>
          ))}
        </div>

        {/* Accounts horizontal */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <h3 className="tf-h-section">{i.nav.accounts}</h3>
            <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{i.seeAll}</span>
          </div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', margin: '0 -18px', padding: '0 18px' }}>
            {d.accounts.map((a) => (
              <div key={a.id} style={{ minWidth: 180, flexShrink: 0, border: '1px solid var(--line)', borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: a.color }} />
                  <span style={{ fontSize: 11, fontWeight: 600 }}>{lang === 'ru' ? a.label : a.labelEn}</span>
                </div>
                <div className="tf-num-big" style={{ fontSize: 18 }}>{fmtMoney(a.amount, { lang, cur: a.cur, decimals: a.cur === '$' ? 2 : 0 })}</div>
                <Sparkline values={a.trend} width={140} height={20} color={a.color} />
              </div>
            ))}
          </div>
        </div>

        {/* Spending donut card */}
        <div className="tf-card" style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
          <Donut size={92} thick={14}
            data={d.categories.map((c) => ({ value: c.value, color: c.color }))}
            center={<div style={{ fontSize: 12, fontWeight: 700 }}>{(130).toFixed(0)}k</div>} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <h3 className="tf-h-section" style={{ marginBottom: 4 }}>{i.spendMo}</h3>
            <CategoryDot color="var(--c1)" label={i.rent} value={fmtMoney(65000, { lang, cur })} />
            <CategoryDot color="var(--c2)" label={i.food} value={fmtMoney(28400, { lang, cur })} />
            <CategoryDot color="var(--c4)" label={i.entertainment} value={fmtMoney(12400, { lang, cur })} />
          </div>
        </div>

        {/* Recent */}
        <div className="tf-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3 className="tf-h-section">{i.recent}</h3>
            <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{i.seeAll}</span>
          </div>
          {d.transactions.slice(0, 4).map((tx) => <TxnRow key={tx.id} tx={tx} lang={lang} />)}
        </div>
      </div>
      <TabBar active="home" lang={lang} />
    </div>
  );
}

// ─── Mobile Transfer ────────────────────────────────────────────
function MobileTransfer({ lang = 'ru' }) {
  const i = window.TFI18n[lang];
  const cur = lang === 'ru' ? '₽' : '$';
  return (
    <div className="tf-mobile">
      <div className="tf-mobile__hd">
        <span style={{ width: 22, height: 22 }}>{Ico.arrowLeft}</span>
        <span style={{ fontWeight: 600, fontSize: 15 }}>{i.actions.send}</span>
        <span style={{ width: 22, height: 22, color: 'var(--ink-3)' }}>{Ico.dots}</span>
      </div>
      <div style={{ flex: 1, padding: '4px 18px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Amount display */}
        <div style={{ textAlign: 'center', padding: '24px 0 12px' }}>
          <div className="tf-h-eyebrow">{lang === 'ru' ? 'Сумма перевода' : 'Amount'}</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 64, letterSpacing: '-0.03em', lineHeight: 1 }}>
            12 500 <span style={{ color: 'var(--ink-3)', fontSize: 28 }}>{cur}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 6 }}>
            {lang === 'ru' ? 'Доступно: 482 340 ₽ · без комиссии' : 'Available: $482,340 · no fee'}
          </div>
        </div>

        {/* Recipient */}
        <div style={{ border: '1px solid var(--brand)', borderRadius: 14, padding: 14, display: 'flex', alignItems: 'center', gap: 12, background: 'var(--brand-tint)' }}>
          <div style={{ width: 40, height: 40, borderRadius: 50, background: 'oklch(85% 0.12 25)', color: 'oklch(35% 0.16 25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>М</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{lang === 'ru' ? 'Марина К.' : 'Marina K.'}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>+7 ··· ··· 28 14 · T-Finance</div>
          </div>
          <span style={{ width: 18, height: 18, color: 'var(--brand)' }}>{Ico.check}</span>
        </div>

        {/* From */}
        <div style={{ border: '1px solid var(--line)', borderRadius: 14, padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 28, height: 18, borderRadius: 4, background: 'linear-gradient(135deg, oklch(22% 0.018 250), oklch(12% 0.012 250))' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{lang === 'ru' ? 'С карты' : 'From'}</div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>T-Black ·· 4421</div>
          </div>
          <span style={{ width: 18, height: 18, color: 'var(--ink-3)' }}>{Ico.arrowRight}</span>
        </div>

        {/* Suggestions */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[1000, 5000, 10000, 25000].map((v) => (
            <span key={v} className="tf-pill">+{v.toLocaleString('ru-RU')}</span>
          ))}
        </div>

        {/* Keypad */}
        <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
          {['1','2','3','4','5','6','7','8','9','.','0','⌫'].map((k) => (
            <div key={k} style={{
              padding: '14px 0', textAlign: 'center',
              fontSize: 22, fontWeight: 500, fontFamily: 'var(--font-sans)',
            }}>{k}</div>
          ))}
        </div>

        <button className="tf-btn tf-btn--brand" style={{ height: 48, width: '100%', justifyContent: 'center', borderRadius: 12, fontSize: 14 }}>
          {lang === 'ru' ? 'Перевести 12 500 ₽' : 'Send $12,500'}
        </button>
      </div>
    </div>
  );
}

// ─── Mobile Asset detail ────────────────────────────────────────
function MobileAsset({ lang = 'ru' }) {
  const d = window.TFData;
  return (
    <div className="tf-mobile">
      <div className="tf-mobile__hd">
        <span style={{ width: 22, height: 22 }}>{Ico.arrowLeft}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: 'oklch(60% 0.14 25)', color: 'oklch(98% 0.005 80)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 10 }}>СБ</div>
          <span style={{ fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-mono)' }}>SBER</span>
        </div>
        <span style={{ width: 22, height: 22, color: 'var(--ink-3)' }}>{Ico.star}</span>
      </div>
      <div style={{ flex: 1, padding: '4px 18px 18px', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
        <div>
          <div className="tf-h-eyebrow">{lang === 'ru' ? 'Текущая цена' : 'Price'}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 44, letterSpacing: '-0.02em' }}>286.42 ₽</span>
            <span className="tf-pill tf-pill--pos">+1.86%</span>
          </div>
        </div>

        <div className="tf-card" style={{ padding: 0, overflow: 'hidden' }}>
          <Candlestick data={d.candles.slice(-30)} width={360} height={200} padding={{ l: 36, r: 8, t: 12, b: 24 }} />
          <div style={{ display: 'flex', justifyContent: 'space-around', padding: '6px 8px 10px', borderTop: '1px solid var(--line-2)' }}>
            {['1Д','1Н','1М','3М','1Г','ВСЕ'].map((p, idx) => (
              <span key={p} style={{
                fontSize: 11, fontWeight: 600,
                color: idx === 2 ? 'var(--ink)' : 'var(--ink-3)',
                padding: '4px 8px', borderRadius: 6,
                background: idx === 2 ? 'var(--bg-sunken)' : 'transparent',
              }}>{p}</span>
            ))}
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { l: lang === 'ru' ? 'Открытие' : 'Open', v: '281.18' },
            { l: lang === 'ru' ? 'Объём' : 'Volume', v: '12.4М' },
            { l: 'P/E', v: '4.82' },
            { l: lang === 'ru' ? 'Дивиденды' : 'Dividend', v: '11.4%' },
          ].map((s) => (
            <div key={s.l} style={{ background: 'var(--bg-sunken)', borderRadius: 10, padding: 12 }}>
              <div className="tf-h-eyebrow" style={{ fontSize: 9 }}>{s.l}</div>
              <div className="tf-num-big" style={{ fontSize: 18 }}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
          <button className="tf-btn tf-btn--ghost" style={{ flex: 1, height: 44, justifyContent: 'center', borderRadius: 12 }}>{lang === 'ru' ? 'Продать' : 'Sell'}</button>
          <button className="tf-btn tf-btn--brand" style={{ flex: 1, height: 44, justifyContent: 'center', borderRadius: 12 }}>{lang === 'ru' ? 'Купить' : 'Buy'}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Onboarding (3 screens) ─────────────────────────────────────
function OnboardingA({ lang = 'ru' }) {
  return (
    <div className="tf-mobile" data-screen-label="Onboarding 1 · Welcome" style={{ background: 'var(--ink)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 28, color: 'var(--bg)' }}>
        <TFLogo size={24} color="oklch(98% 0.005 80)" />
        <div style={{ marginTop: 'auto' }}>
          <div className="tf-h-eyebrow" style={{ color: 'oklch(70% 0.05 155)' }}>{lang === 'ru' ? 'ВАШИ ФИНАНСЫ' : 'YOUR FINANCES'}</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 44, letterSpacing: '-0.02em', lineHeight: 1, marginTop: 8 }}>
            {lang === 'ru' ? <>Деньги под<br />контролем,<br />без лишнего шума.</> : <>Money under<br />control, with<br />less noise.</>}
          </div>
          <div style={{ fontSize: 14, opacity: 0.7, marginTop: 16, lineHeight: 1.5, maxWidth: 280 }}>
            {lang === 'ru'
              ? 'T-Finance собирает все счета, карты и инвестиции в одно место — и подсказывает, куда уходят деньги.'
              : 'T-Finance brings every account, card and investment into one place — and shows you where the money goes.'}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 36, alignItems: 'center' }}>
            <span style={{ width: 22, height: 4, borderRadius: 2, background: 'oklch(85% 0.16 150)' }} />
            <span style={{ width: 6, height: 4, borderRadius: 2, background: 'oklch(40% 0.012 250)' }} />
            <span style={{ width: 6, height: 4, borderRadius: 2, background: 'oklch(40% 0.012 250)' }} />
            <button className="tf-btn tf-btn--brand" style={{ marginLeft: 'auto', height: 44, padding: '0 22px', borderRadius: 999 }}>
              {lang === 'ru' ? 'Далее' : 'Next'} →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OnboardingB({ lang = 'ru' }) {
  const d = window.TFData;
  return (
    <div className="tf-mobile" data-screen-label="Onboarding 2 · Connect">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 22, gap: 14 }}>
        <div className="tf-h-eyebrow">{lang === 'ru' ? 'ШАГ 2 ИЗ 3' : 'STEP 2 OF 3'}</div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 34, letterSpacing: '-0.02em', lineHeight: 1.05 }}>
          {lang === 'ru' ? 'Подключите свои счета' : 'Connect your accounts'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-3)', maxWidth: 320 }}>
          {lang === 'ru' ? 'Выберите банки — мы будем обновлять остатки и операции автоматически.' : 'Pick the banks — we will refresh balances and activity automatically.'}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          {[
            { n: 'T-Finance', sub: lang === 'ru' ? 'Главный счёт' : 'Primary', checked: true, c: 'var(--brand)' },
            { n: 'Сбер', sub: lang === 'ru' ? '2 карты' : '2 cards', checked: true, c: 'var(--c1)' },
            { n: 'Альфа', sub: lang === 'ru' ? '1 счёт' : '1 account', checked: true, c: 'var(--c4)' },
            { n: 'ВТБ', sub: lang === 'ru' ? 'Зарплатный' : 'Salary', checked: false, c: 'var(--c2)' },
            { n: lang === 'ru' ? 'Озон Банк' : 'Ozon Bank', sub: lang === 'ru' ? 'Кешбэк-карта' : 'Cashback card', checked: false, c: 'var(--c5)' },
            { n: lang === 'ru' ? 'Тинькофф Инвестиции' : 'Brokerage', sub: lang === 'ru' ? 'Брокерский' : 'Brokerage', checked: false, c: 'var(--c6)' },
          ].map((b) => (
            <div key={b.n} style={{
              border: '1px solid var(--line)',
              background: b.checked ? 'var(--brand-tint)' : 'var(--bg-elev)',
              borderColor: b.checked ? 'var(--brand)' : 'var(--line)',
              borderRadius: 12, padding: 12, display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: b.c, color: 'oklch(98% 0.005 80)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{b.n.charAt(0)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{b.n}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{b.sub}</div>
              </div>
              <div style={{
                width: 22, height: 22, borderRadius: 50,
                border: '1.5px solid ' + (b.checked ? 'var(--brand)' : 'var(--line)'),
                background: b.checked ? 'var(--brand)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'oklch(98% 0.02 155)',
              }}>{b.checked && <span style={{ width: 12, height: 12 }}>{Ico.check}</span>}</div>
            </div>
          ))}
        </div>

        <button className="tf-btn tf-btn--brand" style={{ marginTop: 'auto', height: 48, width: '100%', justifyContent: 'center', borderRadius: 12 }}>
          {lang === 'ru' ? 'Подключить 3 счёта' : 'Connect 3 accounts'}
        </button>
      </div>
    </div>
  );
}

function OnboardingC({ lang = 'ru' }) {
  return (
    <div className="tf-mobile" data-screen-label="Onboarding 3 · Goal">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 22, gap: 18 }}>
        <div className="tf-h-eyebrow">{lang === 'ru' ? 'ШАГ 3 ИЗ 3' : 'STEP 3 OF 3'}</div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 34, letterSpacing: '-0.02em', lineHeight: 1.05 }}>
          {lang === 'ru' ? 'На что копите в первую очередь?' : 'What are you saving for first?'}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
          {[
            { l: lang === 'ru' ? 'Финансовая подушка' : 'Safety net', ic: '🛟', sel: true },
            { l: lang === 'ru' ? 'Путешествия' : 'Travel', ic: '✈️' },
            { l: lang === 'ru' ? 'Жильё' : 'Home', ic: '🏠' },
            { l: lang === 'ru' ? 'Машина' : 'Car', ic: '🚗' },
            { l: lang === 'ru' ? 'Образование' : 'Education', ic: '📚' },
            { l: lang === 'ru' ? 'Инвестиции' : 'Investing', ic: '📈', sel: true },
          ].map((g) => (
            <div key={g.l} style={{
              border: '1.5px solid ' + (g.sel ? 'var(--brand)' : 'var(--line)'),
              background: g.sel ? 'var(--brand-tint)' : 'var(--bg-elev)',
              borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 6,
              minHeight: 92,
            }}>
              <div style={{ fontSize: 26 }}>{g.ic}</div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{g.l}</div>
              {g.sel && <div style={{ position: 'absolute' }} />}
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--bg-sunken)', borderRadius: 12, padding: 14 }}>
          <div className="tf-h-eyebrow" style={{ fontSize: 10 }}>{lang === 'ru' ? 'РЕКОМЕНДУЕМ ОТКЛАДЫВАТЬ' : 'WE SUGGEST'}</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28 }}>15% {lang === 'ru' ? 'от дохода' : 'of income'}</div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{lang === 'ru' ? 'Около 31 500 ₽ в месяц' : 'Around $4,200 per month'}</div>
        </div>

        <button className="tf-btn tf-btn--brand" style={{ marginTop: 'auto', height: 48, justifyContent: 'center', borderRadius: 12 }}>
          {lang === 'ru' ? 'Готово · Открыть T-Finance' : 'Done · Open T-Finance'} →
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { MobileFrame, MobileHome, MobileTransfer, MobileAsset, OnboardingA, OnboardingB, OnboardingC });
