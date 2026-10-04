import type { DebtRecord } from "@rallx-wealth/types-database";

export function calculateDebtTotals(debts: readonly Pick<DebtRecord, "totalAmount" | "remainingAmount" | "emiAmount">[]) {
  return {
    totalAmount: debts.reduce((sum, debt) => sum + debt.totalAmount, 0),
    totalRemaining: debts.reduce((sum, debt) => sum + debt.remainingAmount, 0),
    totalEmi: debts.reduce((sum, debt) => sum + (debt.emiAmount ?? 0), 0),
  };
}
