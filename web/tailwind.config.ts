import type { Config } from "tailwindcss";

// We expose the T-Finance design tokens (from styles.css) to Tailwind so that
// `bg-bg`, `text-ink`, `border-line`, `bg-brand`, etc. work everywhere.
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-elev": "var(--bg-elev)",
        "bg-sunken": "var(--bg-sunken)",
        ink: "var(--ink)",
        "ink-2": "var(--ink-2)",
        "ink-3": "var(--ink-3)",
        "ink-4": "var(--ink-4)",
        line: "var(--line)",
        "line-2": "var(--line-2)",
        brand: "var(--brand)",
        "brand-2": "var(--brand-2)",
        "brand-tint": "var(--brand-tint)",
        pos: "var(--pos)",
        neg: "var(--neg)",
        warn: "var(--warn)",
        info: "var(--info)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
        serif: ["var(--font-serif)"],
      },
      borderRadius: {
        xs: "var(--r-xs)",
        sm: "var(--r-sm)",
        md: "var(--r-md)",
        lg: "var(--r-lg)",
        xl: "var(--r-xl)",
      },
      boxShadow: {
        "tf-1": "var(--shadow-1)",
        "tf-2": "var(--shadow-2)",
        "tf-3": "var(--shadow-3)",
      },
    },
  },
  plugins: [],
};
export default config;
