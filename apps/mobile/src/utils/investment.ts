// src/utils/investment.ts
import Investment from '@/data/models/Investment';

export function effectiveCurrentValue(inv: Investment): number {
  return inv.currentValue > 0 ? inv.currentValue : inv.investedAmount;
}

export function formatUnits(qty: number): string {
  return qty % 1 === 0 ? qty.toFixed(0) : qty.toFixed(4);
}
