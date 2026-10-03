import type { InvestmentRecord } from "@rallx-wealth/types-database";
import type { SellInvestmentData } from "@rallx-wealth/types-common/forms";
import { sortByCreatedAt } from "./dates.ts";

export function calculateInvestmentTotals(investments: readonly Pick<InvestmentRecord, "investedAmount" | "currentValue">[]) {
  const totalInvested = investments.reduce((sum, investment) => sum + investment.investedAmount, 0);
  const totalCurrentValue = investments.reduce((sum, investment) => sum + investment.currentValue, 0);
  return { totalInvested, totalCurrentValue, totalGainLoss: totalCurrentValue - totalInvested };
}

type InvestmentLot = Pick<InvestmentRecord<unknown, number | Date>, "createdAt" | "quantity" | "investedAmount" | "currentValue">;

export interface InvestmentSaleUpdate<T> {
  lot: T;
  changes: Partial<Pick<InvestmentRecord, "isDeleted" | "quantity" | "investedAmount" | "currentValue">>;
  unitsReduced?: number;
  amountReduced?: number;
  fullyConsumed: boolean;
}

/**
 * Plan FIFO updates for already-selected active lots. The caller owns database
 * transactions and concurrency control. Preserve existing mobile sale semantics:
 * positive units take priority, absent quantities are skipped in unit sales,
 * and selling more than available consumes the available lots.
 */
export function planInvestmentSale<T extends InvestmentLot>(
  lots: readonly T[],
  sale: Pick<SellInvestmentData, "unitsSold" | "soldAmount">,
): InvestmentSaleUpdate<T>[] {
  const byUnits = sale.unitsSold !== undefined && sale.unitsSold > 0;
  let remaining = byUnits ? sale.unitsSold! : (sale.soldAmount ?? 0);
  if (!(remaining > 0)) return [];
  const updates: InvestmentSaleUpdate<T>[] = [];
  for (const lot of sortByCreatedAt(lots)) {
    if (remaining <= 0) break;
    const available = byUnits ? (lot.quantity ?? 0) : lot.investedAmount;
    if (byUnits && available <= 0) continue;
    const fullyConsumed = available <= remaining;
    const reduced = fullyConsumed ? available : remaining;
    const changes: InvestmentSaleUpdate<T>["changes"] = fullyConsumed
      ? { isDeleted: true }
      : {
          investedAmount: byUnits
            ? lot.investedAmount * (1 - reduced / available)
            : lot.investedAmount - reduced,
          currentValue: lot.currentValue * (1 - reduced / available),
        };
    if (!fullyConsumed && lot.quantity != null) {
      changes.quantity = byUnits ? lot.quantity - reduced : lot.quantity * (1 - reduced / available);
    }
    updates.push({
      lot, changes, fullyConsumed,
      ...(byUnits ? { unitsReduced: reduced } : { amountReduced: reduced }),
    });
    remaining -= reduced;
  }
  return updates;
}

export function effectiveCurrentValue(investment: Pick<InvestmentRecord, "currentValue" | "investedAmount">): number {
  return investment.currentValue > 0 ? investment.currentValue : investment.investedAmount;
}
