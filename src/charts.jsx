// T-Finance · SVG chart library
// All charts are pure SVG — no external dependencies.
// Linear, Bars, Donut, Sankey, Heatmap, Candlestick, Sparklines.

// ─── helpers ────────────────────────────────────────────────────
function niceTicks(min, max, count = 4) {
  const range = max - min || 1;
  const step = Math.pow(10, Math.floor(Math.log10(range / count)));
  const err = (range / count) / step;
  const mult = err >= 7.5 ? 10 : err >= 3 ? 5 : err >= 1.5 ? 2 : 1;
  const s = mult * step;
  const t = [];
  for (let v = Math.ceil(min / s) * s; v <= max; v += s) t.push(v);
  return t;
}

// ─── Line chart ─────────────────────────────────────────────────
function LineChart({
  data = [], width = 640, height = 220, color = 'var(--brand)', fill = true,
  xLabels = [], yFormat = (v) => v, marker = null, padding = { l: 40, r: 16, t: 12, b: 28 },
}) {
  if (!data.length) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const r = max - min || 1;
  const innerW = width - padding.l - padding.r;
  const innerH = height - padding.t - padding.b;
  const step = innerW / (data.length - 1);
  const pts = data.map((v, i) => [padding.l + i * step, padding.t + innerH - ((v - min) / r) * innerH]);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = d + ` L ${padding.l + innerW} ${padding.t + innerH} L ${padding.l} ${padding.t + innerH} Z`;
  const ticks = niceTicks(min, max, 4);
  const id = 'lc-' + Math.random().toString(36).slice(2, 7);
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.20" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <g className="tf-chart-grid">
        {ticks.map((t, i) => {
          const y = padding.t + innerH - ((t - min) / r) * innerH;
          return (
            <g key={i}>
              <line x1={padding.l} x2={width - padding.r} y1={y} y2={y} strokeDasharray="2 4" />
              <text x={padding.l - 8} y={y + 3} textAnchor="end" className="tf-chart-axis">{yFormat(t)}</text>
            </g>
          );
        })}
      </g>
      {fill && <path d={area} fill={`url(#${id})`} />}
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {marker !== null && data[marker] !== undefined && (
        <g>
          <circle cx={pts[marker][0]} cy={pts[marker][1]} r="6" fill="var(--bg-elev)" stroke={color} strokeWidth="2" />
          <line x1={pts[marker][0]} x2={pts[marker][0]} y1={padding.t} y2={padding.t + innerH} stroke={color} strokeOpacity="0.3" strokeDasharray="3 3" />
        </g>
      )}
      {xLabels.length > 0 && xLabels.map((lbl, i) => {
        const x = padding.l + (i / (xLabels.length - 1)) * innerW;
        return <text key={i} x={x} y={height - 8} textAnchor="middle" className="tf-chart-axis">{lbl}</text>;
      })}
    </svg>
  );
}

// ─── Bar chart (categorized months) ─────────────────────────────
function BarChart({
  data = [], labels = [], width = 640, height = 200,
  color = 'var(--brand)', negColor = 'var(--neg)', yFormat = (v) => v,
  padding = { l: 40, r: 16, t: 12, b: 28 }, stacked = null,
}) {
  if (!data.length) return null;
  const max = Math.max(...data, 0);
  const min = Math.min(...data, 0);
  const innerW = width - padding.l - padding.r;
  const innerH = height - padding.t - padding.b;
  const slot = innerW / data.length;
  const bw = Math.min(slot * 0.6, 28);
  const zeroY = padding.t + innerH - ((0 - min) / (max - min || 1)) * innerH;
  const ticks = niceTicks(min, max, 4);
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <g className="tf-chart-grid">
        {ticks.map((t, i) => {
          const y = padding.t + innerH - ((t - min) / (max - min || 1)) * innerH;
          return (
            <g key={i}>
              <line x1={padding.l} x2={width - padding.r} y1={y} y2={y} strokeDasharray="2 4" />
              <text x={padding.l - 8} y={y + 3} textAnchor="end" className="tf-chart-axis">{yFormat(t)}</text>
            </g>
          );
        })}
      </g>
      {data.map((v, i) => {
        const x = padding.l + slot * i + (slot - bw) / 2;
        const y = v >= 0 ? padding.t + innerH - ((v - min) / (max - min || 1)) * innerH : zeroY;
        const h = Math.abs(((v) / (max - min || 1)) * innerH);
        const c = v >= 0 ? color : negColor;
        return <rect key={i} x={x} y={y} width={bw} height={Math.max(2, h)} rx="3" fill={c} />;
      })}
      {labels.map((lbl, i) => {
        const x = padding.l + slot * i + slot / 2;
        return <text key={i} x={x} y={height - 8} textAnchor="middle" className="tf-chart-axis">{lbl}</text>;
      })}
    </svg>
  );
}

// ─── Donut chart ────────────────────────────────────────────────
function Donut({ data = [], size = 200, thick = 28, gap = 0.012, center = null }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = size / 2 - 4;
  const ri = r - thick;
  let a = -Math.PI / 2;
  const arc = (a0, a1, c) => {
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const x0 = size / 2 + Math.cos(a0) * r, y0 = size / 2 + Math.sin(a0) * r;
    const x1 = size / 2 + Math.cos(a1) * r, y1 = size / 2 + Math.sin(a1) * r;
    const xi0 = size / 2 + Math.cos(a0) * ri, yi0 = size / 2 + Math.sin(a0) * ri;
    const xi1 = size / 2 + Math.cos(a1) * ri, yi1 = size / 2 + Math.sin(a1) * ri;
    return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} L ${xi1} ${yi1} A ${ri} ${ri} 0 ${large} 0 ${xi0} ${yi0} Z`;
  };
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {data.map((d, i) => {
        const sweep = (d.value / total) * Math.PI * 2;
        const a0 = a + gap / 2;
        const a1 = a + sweep - gap / 2;
        a += sweep;
        return <path key={i} d={arc(a0, a1)} fill={d.color || 'var(--brand)'} />;
      })}
      {center && (
        <foreignObject x="0" y="0" width={size} height={size}>
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', pointerEvents: 'none' }}>{center}</div>
        </foreignObject>
      )}
    </svg>
  );
}

// ─── Heatmap calendar ───────────────────────────────────────────
function Heatmap({
  weeks = 26, days = 7, values = [], size = 12, gap = 3, color = 'var(--brand)',
  labels = ['Пн', 'Ср', 'Пт'], monthLabels = [],
}) {
  // values: flat array of length weeks*days, magnitude 0..1
  const w = weeks * (size + gap) + 28;
  const h = days * (size + gap) + 20;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      {monthLabels.map((m, i) => (
        <text key={i} x={28 + m.week * (size + gap)} y={10} className="tf-chart-axis">{m.label}</text>
      ))}
      {Array.from({ length: weeks }).map((_, x) =>
        Array.from({ length: days }).map((_, y) => {
          const v = values[x * days + y] ?? 0;
          const opacity = v === 0 ? 0.08 : 0.18 + v * 0.82;
          return (
            <rect key={`${x}-${y}`} x={28 + x * (size + gap)} y={16 + y * (size + gap)}
              width={size} height={size} rx="2.5" fill={color} opacity={opacity} />
          );
        })
      )}
      {labels.map((lbl, i) => (
        <text key={lbl} x={0} y={22 + (i * 2) * (size + gap) + size * 0.7} className="tf-chart-axis">{lbl}</text>
      ))}
    </svg>
  );
}

// ─── Sankey (3-tier money flow) ─────────────────────────────────
function Sankey({ width = 720, height = 320, nodes = [], links = [], padding = 18 }) {
  // nodes: [{id, label, col, value, color}] cols 0..N
  // links: [{source, target, value}]
  const cols = Math.max(...nodes.map((n) => n.col)) + 1;
  const colW = 14;
  const colGap = (width - cols * colW) / (cols - 1);
  // group by col, compute scale
  const byCol = Array.from({ length: cols }, () => []);
  nodes.forEach((n) => byCol[n.col].push(n));
  const totals = byCol.map((g) => g.reduce((s, n) => s + n.value, 0));
  const maxTotal = Math.max(...totals);
  const innerH = height - padding * 2;
  const scale = innerH / maxTotal;
  // assign y for each node
  const nodeMap = {};
  byCol.forEach((g) => {
    let y = padding + (innerH - g.reduce((s, n) => s + n.value, 0) * scale) / 2;
    g.forEach((n) => {
      const nh = n.value * scale;
      nodeMap[n.id] = { ...n, x: n.col * (colW + colGap), y, h: nh };
      y += nh + 4;
    });
  });
  // links — offsets within nodes
  const srcOff = {}, tgtOff = {};
  const linkPaths = links.map((l) => {
    const s = nodeMap[l.source], t = nodeMap[l.target];
    const sh = l.value * scale, th = l.value * scale;
    const so = srcOff[l.source] = (srcOff[l.source] || 0);
    const to = tgtOff[l.target] = (tgtOff[l.target] || 0);
    srcOff[l.source] = so + sh;
    tgtOff[l.target] = to + th;
    const x0 = s.x + colW, x1 = t.x;
    const y0 = s.y + so + sh / 2, y1 = t.y + to + th / 2;
    const mx = (x0 + x1) / 2;
    const d = `M ${x0} ${y0} C ${mx} ${y0}, ${mx} ${y1}, ${x1} ${y1}`;
    return { d, w: sh, color: t.color || s.color, opacity: 0.42 };
  });
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      {linkPaths.map((l, i) => (
        <path key={i} d={l.d} stroke={l.color} strokeWidth={Math.max(1, l.w)} fill="none" opacity={l.opacity} strokeLinecap="butt" />
      ))}
      {Object.values(nodeMap).map((n) => (
        <g key={n.id}>
          <rect x={n.x} y={n.y} width={colW} height={Math.max(2, n.h)} fill={n.color || 'var(--brand)'} rx="2" />
          <text x={n.col === 0 ? n.x - 8 : n.x + colW + 8}
            y={n.y + n.h / 2 + 4}
            textAnchor={n.col === 0 ? 'end' : 'start'}
            fontSize="11" fill="var(--ink-2)" fontWeight="600">
            {n.label}
          </text>
          <text x={n.col === 0 ? n.x - 8 : n.x + colW + 8}
            y={n.y + n.h / 2 + 18}
            textAnchor={n.col === 0 ? 'end' : 'start'}
            fontSize="10" fill="var(--ink-3)" fontFamily="var(--font-mono)">
            {n.subLabel || ''}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ─── Candlestick chart ──────────────────────────────────────────
function Candlestick({
  data = [], width = 720, height = 240, padding = { l: 48, r: 16, t: 12, b: 28 },
  upColor = 'var(--pos)', downColor = 'var(--neg)',
}) {
  if (!data.length) return null;
  const min = Math.min(...data.map((d) => d.l));
  const max = Math.max(...data.map((d) => d.h));
  const r = max - min || 1;
  const innerW = width - padding.l - padding.r;
  const innerH = height - padding.t - padding.b;
  const slot = innerW / data.length;
  const cw = Math.min(slot * 0.7, 10);
  const yOf = (v) => padding.t + innerH - ((v - min) / r) * innerH;
  const ticks = niceTicks(min, max, 5);
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <g className="tf-chart-grid">
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padding.l} x2={width - padding.r} y1={yOf(t)} y2={yOf(t)} strokeDasharray="2 4" />
            <text x={padding.l - 8} y={yOf(t) + 3} textAnchor="end" className="tf-chart-axis">{t.toFixed(0)}</text>
          </g>
        ))}
      </g>
      {data.map((d, i) => {
        const x = padding.l + slot * i + slot / 2;
        const up = d.c >= d.o;
        const c = up ? upColor : downColor;
        const yH = yOf(d.h), yL = yOf(d.l);
        const yT = yOf(Math.max(d.o, d.c)), yB = yOf(Math.min(d.o, d.c));
        return (
          <g key={i}>
            <line x1={x} x2={x} y1={yH} y2={yL} stroke={c} strokeWidth="1" />
            <rect x={x - cw / 2} y={yT} width={cw} height={Math.max(1, yB - yT)} fill={c} rx="1" />
          </g>
        );
      })}
    </svg>
  );
}

// ─── Stacked horizontal bar (budget vs spent) ───────────────────
function HBar({ used = 0.6, color = 'var(--brand)', track = 'var(--bg-sunken)', height = 8, segments = null }) {
  return (
    <div style={{ height, background: track, borderRadius: 999, overflow: 'hidden', display: 'flex' }}>
      {segments ? (
        segments.map((s, i) => (
          <div key={i} style={{ width: (s.value * 100) + '%', background: s.color, opacity: s.opacity || 1 }} />
        ))
      ) : (
        <div style={{ width: (Math.min(1, used) * 100) + '%', background: color }} />
      )}
    </div>
  );
}

Object.assign(window, { LineChart, BarChart, Donut, Heatmap, Sankey, Candlestick, HBar });
