import {
  fetchStockQuote as fetchSharedStockQuote,
  getUsdToInrRate as getSharedUsdToInrRate,
} from "@rallx-wealth/utils-frontend";
import type { StockQuote } from "@rallx-wealth/types-common";

export type { StockQuote } from "@rallx-wealth/types-common";

// Preserve the native request header without requiring it in browser callers.
const requestOptions = { headers: { "User-Agent": "Mozilla/5.0" } };

export function fetchStockQuote(symbol: string, exchange: string): Promise<StockQuote> {
  return fetchSharedStockQuote(symbol, exchange, requestOptions);
}

export function getUsdToInrRate(): Promise<number> {
  return getSharedUsdToInrRate(requestOptions);
}
