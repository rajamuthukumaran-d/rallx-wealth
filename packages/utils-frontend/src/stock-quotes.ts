import type { StockQuote } from "@rallx-wealth/types-common";
import { buildYahooSymbol } from "./stock.ts";

export type { StockQuote } from "@rallx-wealth/types-common";

export interface YahooChartMeta {
  regularMarketPrice: number;
  symbol?: string;
  shortName?: string;
  longName?: string;
  currency?: string;
  instrumentType?: string;
}

export interface StockQuoteRequestOptions {
  /** Supply a transport that routes Yahoo requests through a web proxy if needed. */
  fetch?: typeof globalThis.fetch;
  headers?: Record<string, string>;
}

interface YahooChartResponse {
  chart?: {
    result?: { meta?: YahooChartMeta }[] | null;
    error?: { description?: string } | null;
  };
}

/** Fetch Yahoo chart metadata. Caching and platform-specific headers belong to callers. */
export async function chartFetch(
  yahooSymbol: string,
  options: StockQuoteRequestOptions = {},
): Promise<YahooChartMeta> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1d&range=1d`;
  const request = options.fetch ?? globalThis.fetch;
  const res = await request(url, { headers: options.headers });
  const json = await res.json() as YahooChartResponse | null;

  if (!res.ok || !json?.chart?.result?.[0]) {
    throw new Error(
      json?.chart?.error?.description ??
      `No data found for "${yahooSymbol}". Check the symbol and exchange.`,
    );
  }

  const meta = json.chart.result[0].meta;
  if (!meta || typeof meta.regularMarketPrice !== "number" || !Number.isFinite(meta.regularMarketPrice) || !meta.regularMarketPrice) {
    throw new Error(`No price available for "${yahooSymbol}".`);
  }
  return meta;
}

export async function fetchStockQuote(
  symbol: string,
  exchange: string,
  options: StockQuoteRequestOptions = {},
): Promise<StockQuote> {
  const yahooSymbol = buildYahooSymbol(symbol, exchange);
  const meta = await chartFetch(yahooSymbol, options);
  return {
    symbol: meta.symbol ?? yahooSymbol,
    name: meta.shortName ?? meta.longName ?? yahooSymbol,
    price: meta.regularMarketPrice,
    currency: meta.currency ?? "USD",
    instrumentType: meta.instrumentType ?? "",
  };
}

let cachedUsdToInrRate: Promise<number> | undefined;

/**
 * Cache one USD/INR lookup per module instance, including the existing offline
 * fallback. The first caller supplies the transport for the cached lookup.
 */
export function getUsdToInrRate(options: StockQuoteRequestOptions = {}): Promise<number> {
  cachedUsdToInrRate ??= chartFetch("USDINR=X", options)
    .then((meta) => meta.regularMarketPrice)
    .catch(() => 84);
  return cachedUsdToInrRate;
}
