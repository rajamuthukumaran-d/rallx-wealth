import type { AssetRecord, DebtRecord, InvestmentRecord } from "@rallx-wealth/types-database";
import type { NetWorthTotals, RecentUpdate, RecentUpdateType } from "@rallx-wealth/types-common";
import { calculateAssetBalance } from "./assets.ts";
import { timestamp } from "./dates.ts";

type RecentRecord = Pick<AssetRecord<string, number | Date>, "id" | "name" | "type" | "updatedAt">;

export function calculateNetWorth(
  assets: readonly (RecentRecord & Pick<AssetRecord, "balance">)[],
  investments: readonly (RecentRecord & Pick<InvestmentRecord, "currentValue">)[],
  debts: readonly (RecentRecord & Pick<DebtRecord, "remainingAmount">)[],
): NetWorthTotals {
  const totalAssets = calculateAssetBalance(assets);
  const totalInvestments = investments.reduce((sum, investment) => sum + investment.currentValue, 0);
  const totalDebts = debts.reduce((sum, debt) => sum + debt.remainingAmount, 0);
  const updates = (records: readonly RecentRecord[], type: RecentUpdateType): RecentUpdate[] =>
    records.map(record => ({
      id: record.id, name: record.name, type, itemType: record.type, updatedAt: timestamp(record.updatedAt),
    }));
  return {
    totalAssets, totalInvestments, totalDebts,
    netWorth: totalAssets + totalInvestments - totalDebts,
    recentUpdates: [...updates(assets, "asset"), ...updates(investments, "investment"), ...updates(debts, "debt")]
      .sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 5),
  };
}
