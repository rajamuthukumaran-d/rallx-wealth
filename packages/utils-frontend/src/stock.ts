export const EXCHANGES: { label: string; value: string; suffix: string }[] = [
  { label: "NSE (India)", value: "NSE", suffix: ".NS" },
  { label: "BSE (India)", value: "BSE", suffix: ".BO" },
  { label: "NYSE (US)", value: "NYSE", suffix: "" },
  { label: "NASDAQ (US)", value: "NASDAQ", suffix: "" },
  { label: "Crypto", value: "CRYPTO", suffix: "" },
  { label: "LSE (London)", value: "LSE", suffix: ".L" },
  { label: "TSE (Tokyo)", value: "TSE", suffix: ".T" },
  { label: "SGX (Singapore)", value: "SGX", suffix: ".SI" },
];

export function buildYahooSymbol(symbol: string, exchange: string): string {
  const suffix = EXCHANGES.find((e) => e.value === exchange)?.suffix ?? "";
  return `${symbol.trim().toUpperCase()}${suffix}`;
}

export function convertToInr(amount: number, currency: string, usdToInr: number): number {
  if (!currency || currency === "INR") return amount;
  if (currency === "USD") return amount * usdToInr;
  // For other currencies, return as-is (no multi-hop conversion)
  return amount;
}

export function mapInstrumentType(instrumentType: string): string {
  switch (instrumentType.toUpperCase()) {
    case 'EQUITY': return 'stock';
    case 'ETF': return 'etf';
    case 'CRYPTOCURRENCY': return 'crypto';
    case 'MUTUALFUND': return 'mutual_fund';
    case 'BOND': return 'bonds';
    default: return '';
  }
}
