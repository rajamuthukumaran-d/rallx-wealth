// Uses Yahoo Finance v8 chart API — no auth required.
// Supports US stocks, Indian stocks (NSE/BSE), crypto, ETFs, etc.

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  currency: string;
}

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

async function chartFetch(yahooSymbol: string): Promise<any> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1d&range=1d`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  const json = await res.json();

  if (!res.ok || !json?.chart?.result?.[0]) {
    const errMsg =
      json?.chart?.error?.description ??
      `No data found for "${yahooSymbol}". Check the symbol and exchange.`;
    throw new Error(errMsg);
  }

  const meta = json.chart.result[0].meta;
  if (!meta?.regularMarketPrice) throw new Error(`No price available for "${yahooSymbol}".`);
  return meta;
}

export async function fetchStockQuote(symbol: string, exchange: string): Promise<StockQuote> {
  const yahooSymbol = buildYahooSymbol(symbol, exchange);
  const meta = await chartFetch(yahooSymbol);

  return {
    symbol: meta.symbol ?? yahooSymbol,
    name: meta.shortName ?? meta.longName ?? yahooSymbol,
    price: meta.regularMarketPrice,
    currency: meta.currency ?? "USD",
  };
}

// Cached exchange rate — refreshed once per app session
let _usdToInr: number | null = null;

export async function getUsdToInrRate(): Promise<number> {
  if (_usdToInr !== null) return _usdToInr;
  try {
    const meta = await chartFetch("USDINR=X");
    _usdToInr = meta.regularMarketPrice;
  } catch {
    _usdToInr = 84; // fallback if offline
  }
  return _usdToInr!;
}

export function convertToInr(amount: number, currency: string, usdToInr: number): number {
  if (!currency || currency === "INR") return amount;
  if (currency === "USD") return amount * usdToInr;
  // For other currencies, return as-is (no multi-hop conversion)
  return amount;
}
