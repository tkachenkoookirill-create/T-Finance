"use client";
import clsx from "clsx";

export function Logo({ size = 22, mark = false }: { size?: number; mark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2" style={{ fontFamily: "var(--font-sans)" }}>
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
        <rect x="0" y="0" width="32" height="32" rx="8" fill="var(--brand)" />
        <path d="M6 10 H26 M16 10 V24" stroke="oklch(98% 0.02 155)" strokeWidth="3.6" strokeLinecap="square" />
        <circle cx="24" cy="6" r="3" fill="var(--pos)" stroke="var(--brand)" strokeWidth="1.4" />
      </svg>
      {!mark && (
        <span style={{ fontFamily: "var(--font-serif)", fontSize: size * 0.95, letterSpacing: "-0.02em", fontWeight: 400 }}>
          T<span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: size * 0.72, letterSpacing: "-0.02em" }}>—Finance</span>
        </span>
      )}
    </span>
  );
}

export function Card({ className, children, flush = false, style }: { className?: string; children: React.ReactNode; flush?: boolean; style?: React.CSSProperties }) {
  return (
    <div
      style={style}
      className={clsx(
        "bg-bg-elev border border-line rounded-md flex flex-col gap-3",
        flush ? "" : "p-5",
        className
      )}
    >
      {children}
    </div>
  );
}

export function Pill({ children, variant = "neutral" }: { children: React.ReactNode; variant?: "neutral" | "pos" | "neg" | "brand" }) {
  const cls: Record<string, string> = {
    neutral: "bg-bg-sunken text-ink-2 border-line",
    pos: "bg-pos/10 text-pos border-pos/30",
    neg: "bg-neg/10 text-neg border-neg/30",
    brand: "bg-brand-tint text-brand border-brand/30",
  };
  return (
    <span className={clsx("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-semibold", cls[variant])}>
      {children}
    </span>
  );
}

export function Button({
  children, variant = "primary", size = "md", className, ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "brand"; size?: "sm" | "md" }) {
  const sz = size === "sm" ? "h-7 px-2.5 text-xs rounded-[8px]" : "h-9 px-3.5 text-[13px] rounded-sm";
  const variants: Record<string, string> = {
    primary: "bg-ink text-bg border-ink",
    ghost: "bg-transparent text-ink border-line",
    brand: "bg-brand text-[oklch(98%_0.02_155)] border-brand",
  };
  return (
    <button
      {...props}
      className={clsx("inline-flex items-center gap-2 border font-semibold whitespace-nowrap", sz, variants[variant], className)}
    >
      {children}
    </button>
  );
}

export function Sparkline({ values, width = 96, height = 28, color = "var(--brand)" }: { values: number[]; width?: number; height?: number; color?: string }) {
  if (!values.length) return null;
  const min = Math.min(...values), max = Math.max(...values);
  const r = max - min || 1;
  const pad = 2;
  const W = width - pad * 2, H = height - pad * 2;
  const step = W / (values.length - 1 || 1);
  const pts = values.map((v, i) => [pad + i * step, pad + H - ((v - min) / r) * H]);
  const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = d + ` L ${pad + W} ${height - pad} L ${pad} ${height - pad} Z`;
  const id = "sg-" + Math.random().toString(36).slice(2, 7);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
