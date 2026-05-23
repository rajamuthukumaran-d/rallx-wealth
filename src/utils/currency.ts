const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  SGD: "S$",
  AUD: "A$",
  CAD: "C$",
  CHF: "CHF",
  HKD: "HK$",
};

export function getCurrencySymbol(code: string): string {
  return CURRENCY_SYMBOLS[code?.toUpperCase()] ?? code ?? "₹";
}

export function formatCurrency(value: number, symbol = "₹"): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}${symbol}${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}${symbol}${(abs / 1_000).toFixed(1)}k`;
  return `${sign}${symbol}${abs.toFixed(0)}`;
}

export function formatFullCurrency(value: number, symbol = "₹"): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  return `${sign}${symbol}${abs.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}
