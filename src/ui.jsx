// T-Finance · Shared primitives
// Logo, icons, generic blocks reused across screens.

const TFLogo = ({ size = 22, color = 'currentColor', mark = false }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color, fontFamily: 'var(--font-sans)' }}>
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <rect x="0" y="0" width="32" height="32" rx="8" fill="var(--brand)" />
      <path d="M6 10 H26 M16 10 V24" stroke="oklch(98% 0.02 155)" strokeWidth="3.6" strokeLinecap="square" />
      <circle cx="24" cy="6" r="3" fill="var(--pos)" stroke="var(--brand)" strokeWidth="1.4" />
    </svg>
    {!mark && (
      <span style={{ fontFamily: 'var(--font-serif)', fontSize: size * 0.95, letterSpacing: '-0.02em', fontWeight: 400 }}>
        T<span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: size * 0.72, letterSpacing: '-0.02em' }}>—Finance</span>
      </span>
    )}
  </div>
);

// Inline icon set — single stroke style, 16px grid
const Ico = {
  home: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 11 12 4l8 7v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z"/></svg>,
  card: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h3"/></svg>,
  arrows: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M7 4v16m0-16-3 3m3-3 3 3M17 20V4m0 16-3-3m3 3 3-3"/></svg>,
  chart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 20V8m6 12V4m6 16v-8m6 8V12"/></svg>,
  pie: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 3v9h9"/><path d="M21 12a9 9 0 1 1-9-9"/></svg>,
  invest: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 17l6-6 4 4 8-8M14 7h7v7"/></svg>,
  list: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 6h16M4 12h16M4 18h10"/></svg>,
  credit: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 7h18v10H3z"/><path d="M3 11h18M7 15h2"/></svg>,
  settings: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.2-1.6l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2.7-1.6L13 2h-2l-.8 2.8a7 7 0 0 0-2.7 1.6l-2.3-.9-2 3.4 2 1.5A7 7 0 0 0 5 12a7 7 0 0 0 .2 1.6l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2.7 1.6L11 22h2l.8-2.8a7 7 0 0 0 2.7-1.6l2.3.9 2-3.4-2-1.5c.1-.5.2-1 .2-1.6Z"/></svg>,
  bell: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4l2-2zM10 20a2 2 0 0 0 4 0"/></svg>,
  search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>,
  plus: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 5v14M5 12h14"/></svg>,
  arrowUp: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5m0 0-6 6m6-6 6 6"/></svg>,
  arrowDown: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14m0 0-6-6m6 6 6-6"/></svg>,
  arrowRight: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 12h14m0 0-6-6m6 6-6 6"/></svg>,
  qr: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3M21 14v3M14 21h7M14 17h3v4"/></svg>,
  filter: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 5h18l-7 9v6l-4-2v-4z"/></svg>,
  dots: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M5 12h.01M12 12h.01M19 12h.01"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m5 13 4 4L19 7"/></svg>,
  arrowLeft: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M19 12H5m0 0 6 6m-6-6 6-6"/></svg>,
  shield: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 3 4 6v6c0 4.5 3.4 8.5 8 9 4.6-.5 8-4.5 8-9V6z"/></svg>,
  star: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="m12 3 2.7 5.6 6.2.9-4.5 4.3 1.1 6.2L12 17l-5.5 3 1-6.2L3 9.5l6.2-.9z"/></svg>,
  wallet: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 7v12h18V9H7a4 4 0 0 1-4-2zM3 7a2 2 0 0 1 2-2h14v4"/><circle cx="17" cy="14" r="1.4"/></svg>,
  scan: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 7V5a2 2 0 0 1 2-2h2M21 7V5a2 2 0 0 0-2-2h-2M3 17v2a2 2 0 0 0 2 2h2M21 17v2a2 2 0 0 1-2 2h-2M3 12h18"/></svg>,
  globe: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18A14 14 0 0 1 12 3"/></svg>,
};

const Logo = TFLogo;

// Sparkline (tiny inline chart for cards)
function Sparkline({ values = [], width = 96, height = 28, color = 'var(--brand)', fill = true, stroke = 1.5 }) {
  if (!values.length) return null;
  const min = Math.min(...values), max = Math.max(...values);
  const r = max - min || 1;
  const pad = 2;
  const W = width - pad * 2, H = height - pad * 2;
  const step = W / (values.length - 1 || 1);
  const pts = values.map((v, i) => [pad + i * step, pad + H - ((v - min) / r) * H]);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = d + ` L ${pad + W} ${height - pad} L ${pad} ${height - pad} Z`;
  const id = 'sg-' + Math.random().toString(36).slice(2, 7);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      {fill && (
        <>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#${id})`} />
        </>
      )}
      <path d={d} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Money formatter
function fmtMoney(n, { cur = '₽', decimals = 0, sign = false, lang = 'ru' } = {}) {
  const abs = Math.abs(n);
  const s = abs.toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const prefix = n < 0 ? '−' : (sign && n > 0 ? '+' : '');
  return lang === 'ru' ? `${prefix}${s} ${cur}` : `${prefix}${cur}${s}`;
}

function pct(n, sign = true) {
  const v = n.toFixed(2);
  return (sign && n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n).toFixed(2) + '%';
}

Object.assign(window, { TFLogo, Logo, Ico, Sparkline, fmtMoney, pct });
