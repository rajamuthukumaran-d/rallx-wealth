// src/utils/investment.ts
export { effectiveCurrentValue } from "@rallx-wealth/utils-database";

export function formatUnits(qty: number): string {
  return qty % 1 === 0 ? qty.toFixed(0) : qty.toFixed(4);
}
