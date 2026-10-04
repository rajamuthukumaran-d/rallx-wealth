/** Preserve the currency fallback used by asset and debt writes. */
export function normalizeCurrency(currency?: string | null, fallback = "INR"): string {
  return currency?.trim() || fallback;
}
