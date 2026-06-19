// T-Finance · UI primitives + helpers
const { useState, useEffect, useRef } = React;

// ── money ────────────────────────────────────────────────
function fmtMoney(minor, { cur = "сум", sign = false, decimals = 0 } = {}) {
  const major = minor / 100;
  const abs = Math.abs(major);
  const s = abs.toLocaleString("ru-RU", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const prefix = major < 0 ? "−" : sign && major > 0 ? "+" : "";
  return `${prefix}${s} ${cur}`;
}
const CUR_SYMBOL = { UZS: "сум", RUB: "₽", USD: "$", EUR: "€", GBP: "£", CNY: "¥" };

// parse "1 234,50" / "1234.5" → minor units
function parseAmount(str) {
  if (!str) return 0;
  const clean = String(str).replace(/\s/g, "").replace(",", ".").replace(/[^\d.\-]/g, "");
  const v = parseFloat(clean);
  return isNaN(v) ? 0 : Math.round(v * 100);
}

// ── icons (stroked, 1.6) ─────────────────────────────────
function Icon({ name, size = 18, className }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" };
  const paths = {
    home: <><path d="M3 10.5 12 3l9 7.5" {...p} /><path d="M5 9.5V21h14V9.5" {...p} /></>,
    wallet: <><rect x="3" y="6" width="18" height="13" rx="2.5" {...p} /><path d="M16 12.5h2.5" {...p} /><path d="M3 9h14a2 2 0 0 1 2 2" {...p} /></>,
    plus: <><path d="M12 5v14M5 12h14" {...p} /></>,
    list: <><path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" {...p} /></>,
    chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" {...p} /></>,
    transfer: <><path d="M7 7h13l-3-3M17 17H4l3 3" {...p} /></>,
    target: <><circle cx="12" cy="12" r="8" {...p} /><circle cx="12" cy="12" r="3.4" {...p} /></>,
    settings: <><circle cx="12" cy="12" r="3" {...p} /><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2-1.2l-.4-2.5h-4l-.4 2.5a7 7 0 0 0-2 1.2l-2.3-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2 1.2l.4 2.5h4l.4-2.5a7 7 0 0 0 2-1.2l2.3 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z" {...p} /></>,
    download: <><path d="M12 3v12M7 11l5 4 5-4M5 21h14" {...p} /></>,
    upload: <><path d="M12 21V9M7 13l5-4 5 4M5 3h14" {...p} /></>,
    trash: <><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" {...p} /></>,
    arrowDown: <><path d="M12 5v14M6 13l6 6 6-6" {...p} /></>,
    arrowUp: <><path d="M12 19V5M6 11l6-6 6 6" {...p} /></>,
    x: <><path d="M6 6l12 12M18 6L6 18" {...p} /></>,
    check: <><path d="M5 12l5 5L20 6" {...p} /></>,
    edit: <><path d="M4 20h4L19 9l-4-4L4 16v4Z" {...p} /><path d="M14 6l4 4" {...p} /></>,
    moon: <><path d="M20 14.5A8 8 0 0 1 9.5 4 7 7 0 1 0 20 14.5Z" {...p} /></>,
    sun: <><circle cx="12" cy="12" r="4" {...p} /><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" {...p} /></>,
    shield: <><path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" {...p} /></>,
    repeat: <><path d="M4 9a5 5 0 0 1 5-5h7l-2.5-2.5M20 15a5 5 0 0 1-5 5H8l2.5 2.5" {...p} /></>,
    spark: <><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" {...p} /><path d="M18 16l.7 2 .3.7M5 18l.5 1.5" {...p} /></>,
    scale: <><path d="M12 4v16M6 8h12M6 8l-3 6a3 3 0 0 0 6 0L6 8Zm12 0-3 6a3 3 0 0 0 6 0l-3-6ZM7 20h10" {...p} /></>,
    pulse: <><path d="M3 12h4l2 6 4-14 2 8h6" {...p} /></>,
    calendar: <><rect x="3.5" y="5" width="17" height="16" rx="2.5" {...p} /><path d="M3.5 9.5h17M8 3v4M16 3v4" {...p} /></>,
    layers: <><path d="M12 3 3 8l9 5 9-5-9-5Z" {...p} /><path d="M3 13l9 5 9-5" {...p} /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>{paths[name]}</svg>;
}

const CAT_EMOJI = {
  // доходы
  salary: "💼", freelance: "💻", dividends: "📈", other_income: "💰",
  // расходы
  rent: "🏠", food: "🛒", transport: "🚇", utilities: "💡", communication: "📶",
  restaurants: "🍽️", clothing: "👕", healthcare: "💊", sport: "🏋️", education: "🎓",
  entertainment: "🎬", travel: "✈️", other: "•", services: "🔁",
  transfer: "↔",
};

function Logo({ size = 22, mark = false }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
        <rect x="0" y="0" width="32" height="32" rx="8" fill="var(--brand)" />
        <path d="M6 10 H26 M16 10 V24" stroke="var(--on-brand)" strokeWidth="3.6" strokeLinecap="square" />
        <circle cx="24" cy="6" r="3" fill="var(--pos)" stroke="var(--brand)" strokeWidth="1.4" />
      </svg>
      {!mark && (
        <span style={{ fontFamily: "var(--font-serif)", fontSize: size * 0.95, letterSpacing: "-0.02em" }}>
          T<span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: size * 0.7 }}>—Finance</span>
        </span>
      )}
    </span>
  );
}

function Modal({ title, onClose, children, footer, wide }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={wide ? { maxWidth: 560 } : null}>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{title}</h3>
          <button className="btn sm" onClick={onClose} style={{ width: 34, padding: 0 }}><Icon name="x" size={16} /></button>
        </div>
        {children}
        {footer && <div className="row" style={{ justifyContent: "flex-end", gap: 10, marginTop: 22 }}>{footer}</div>}
      </div>
    </div>
  );
}

// account type → label
const ACC_TYPE = {
  cash: "Наличные", debit: "Карта", savings: "Накопительный", fx: "Валютный", invest: "Брокерский", credit: "Кредитный",
};

// date helpers
function dayLabel(iso) {
  const d = new Date(iso);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const that = new Date(d); that.setHours(0, 0, 0, 0);
  const diff = Math.round((today - that) / 86400000);
  if (diff === 0) return "Сегодня";
  if (diff === 1) return "Вчера";
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" }) +
    (d.getFullYear() !== today.getFullYear() ? " " + d.getFullYear() : "");
}
function timeLabel(iso) { return new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }); }
function inputDate(iso) {
  const d = iso ? new Date(iso) : new Date();
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d - off).toISOString().slice(0, 10);
}

Object.assign(window, { fmtMoney, CUR_SYMBOL, parseAmount, Icon, CAT_EMOJI, Logo, Modal, ACC_TYPE, dayLabel, timeLabel, inputDate });
