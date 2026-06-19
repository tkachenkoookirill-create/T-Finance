// T-Finance · Shared frame chrome
// Sidebar + topbar — reusable across dashboard variants.

function Sidebar({ active = 'overview', lang = 'ru' }) {
  const i = window.TFI18n[lang];
  const items = [
    { id: 'overview', icon: Ico.home, label: i.nav.overview, group: i.section.money },
    { id: 'accounts', icon: Ico.card, label: i.nav.accounts },
    { id: 'transfer', icon: Ico.arrows, label: i.nav.transfer },
    { id: 'analytics', icon: Ico.pie, label: i.nav.analytics, group: i.section.tools },
    { id: 'invest', icon: Ico.invest, label: i.nav.invest },
    { id: 'history', icon: Ico.list, label: i.nav.history },
    { id: 'credit', icon: Ico.credit, label: i.nav.credit },
    { id: 'profile', icon: Ico.settings, label: i.nav.profile, group: i.section.account },
  ];
  return (
    <aside className="tf-sidebar">
      <div className="tf-sidebar__brand">
        <TFLogo size={22} />
      </div>
      {items.map((it, idx) => (
        <React.Fragment key={it.id}>
          {it.group && <div className="tf-nav-group">{it.group}</div>}
          <div className={'tf-nav-item' + (active === it.id ? ' tf-nav-item--active' : '')}>
            <span className="tf-nav-item__icon">{it.icon}</span>
            <span>{it.label}</span>
            {it.id === 'history' && <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>312</span>}
          </div>
        </React.Fragment>
      ))}
      <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--ink-3)' }}>
        <div className="tf-avatar">АП</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ color: 'var(--ink)', fontWeight: 600 }}>Алексей П.</span>
          <span style={{ fontSize: 10 }}>{lang === 'ru' ? 'T-Black · Премиум' : 'T-Black · Premium'}</span>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ lang = 'ru', title, extras = null }) {
  return (
    <header className="tf-topbar">
      {title && <div style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>}
      <div className="tf-search">
        <span style={{ width: 14, height: 14, display: 'inline-flex' }}>{Ico.search}</span>
        <span>{lang === 'ru' ? 'Поиск операций, карт, тикеров…' : 'Search transactions, cards, tickers…'}</span>
        <span className="tf-kbd">⌘K</span>
      </div>
      {extras}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 16, height: 16, color: 'var(--ink-3)' }}>{Ico.bell}</span>
        <span style={{ width: 16, height: 16, color: 'var(--ink-3)' }}>{Ico.globe}</span>
        <div className="tf-avatar">АП</div>
      </div>
    </header>
  );
}

// Status pill, period switcher etc.
function PeriodSwitch({ lang = 'ru', value = '30d', onChange }) {
  const i = window.TFI18n[lang];
  const opts = [
    { v: '7d', l: i.days7 }, { v: '30d', l: i.days30 }, { v: '90d', l: i.days90 }, { v: '1y', l: i.year1 }, { v: 'all', l: i.everything },
  ];
  return (
    <div style={{ display: 'inline-flex', background: 'var(--bg-sunken)', border: '1px solid var(--line)', borderRadius: 999, padding: 3 }}>
      {opts.map((o) => (
        <button key={o.v}
          onClick={() => onChange && onChange(o.v)}
          style={{
            border: 'none', cursor: 'pointer',
            background: o.v === value ? 'var(--bg-elev)' : 'transparent',
            color: o.v === value ? 'var(--ink)' : 'var(--ink-3)',
            fontWeight: 600, fontSize: 11, fontFamily: 'var(--font-sans)',
            padding: '4px 10px', borderRadius: 999,
            boxShadow: o.v === value ? 'var(--shadow-1)' : 'none',
          }}
        >{o.l}</button>
      ))}
    </div>
  );
}

function CategoryDot({ color, label, value, sub }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
      <span style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
      <span style={{ flex: 1, color: 'var(--ink-2)' }}>{label}</span>
      <span className="tf-mono" style={{ color: 'var(--ink)', fontWeight: 600 }}>{value}</span>
      {sub && <span style={{ color: 'var(--ink-3)', fontSize: 11 }}>{sub}</span>}
    </div>
  );
}

function TxnRow({ tx, lang = 'ru' }) {
  const i = window.TFI18n[lang];
  const lbl = lang === 'ru' ? tx.label : tx.labelEn;
  const cat = i[tx.cat] || tx.cat;
  const isInflow = tx.amount > 0;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr auto auto', gap: 12, alignItems: 'center', padding: '10px 0', borderTop: '1px solid var(--line-2)' }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: isInflow ? 'color-mix(in oklch, var(--pos) 14%, transparent)' : 'var(--bg-sunken)',
        color: isInflow ? 'var(--pos)' : 'var(--ink-2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
      }}>{tx.icon || (isInflow ? '↓' : '↑')}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <span style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lbl}</span>
        <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{cat} · {tx.t}</span>
      </div>
      {tx.recurring && <span className="tf-pill" style={{ fontSize: 10 }}>{lang === 'ru' ? 'Подписка' : 'Recurring'}</span>}
      <span className="tf-mono tf-tnum" style={{ fontWeight: 600, color: isInflow ? 'var(--pos)' : 'var(--ink)', fontSize: 13 }}>
        {fmtMoney(tx.amount, { lang, sign: true, cur: lang === 'ru' ? '₽' : '$' })}
      </span>
    </div>
  );
}

function StatTile({ label, value, sub, tone, sparkline }) {
  return (
    <div className="tf-card" style={{ gap: 6 }}>
      <div className="tf-h-eyebrow">{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
        <span className="tf-num-big" style={{ fontSize: 26 }}>{value}</span>
        {sub && <span className="tf-pill" style={{
          background: tone === 'pos' ? 'color-mix(in oklch, var(--pos) 14%, transparent)' : tone === 'neg' ? 'color-mix(in oklch, var(--neg) 14%, transparent)' : 'var(--bg-sunken)',
          color: tone === 'pos' ? 'var(--pos)' : tone === 'neg' ? 'var(--neg)' : 'var(--ink-3)',
          borderColor: 'transparent',
        }}>{sub}</span>}
      </div>
      {sparkline && (
        <div style={{ marginTop: 6 }}>
          <Sparkline values={sparkline} width={180} height={36} color={tone === 'neg' ? 'var(--neg)' : 'var(--brand)'} />
        </div>
      )}
    </div>
  );
}

Object.assign(window, { Sidebar, Topbar, PeriodSwitch, CategoryDot, TxnRow, StatTile });
