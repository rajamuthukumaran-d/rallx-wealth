// src/utils/investment.ts
import Investment from '@/data/models/Investment';

export function effectiveCurrentValue(inv: Investment): number {
  return inv.currentValue > 0 ? inv.currentValue : inv.investedAmount;
}
