// Money helpers — always in MINOR units.

export function fmtMoney(
  minor: number,
  { cur = "₽", lang = "ru", sign = false, decimals = 0 }: { cur?: string; lang?: "ru" | "en"; sign?: boolean; decimals?: number } = {}
): string {
  const major = minor / 100;
  const abs = Math.abs(major);
  const s = abs.toLocaleString(lang === "ru" ? "ru-RU" : "en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const prefix = major < 0 ? "−" : sign && major > 0 ? "+" : "";
  return lang === "ru" ? `${prefix}${s} ${cur}` : `${prefix}${cur}${s}`;
}

export function pct(n: number, sign = true): string {
  return (sign && n > 0 ? "+" : n < 0 ? "−" : "") + Math.abs(n).toFixed(2) + "%";
}

export const CUR_SYMBOL: Record<string, string> = {
  RUB: "₽", USD: "$", EUR: "€", GBP: "£", CNY: "¥",
};
