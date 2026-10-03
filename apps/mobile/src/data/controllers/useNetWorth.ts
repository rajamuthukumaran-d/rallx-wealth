import { useAssets } from "./useAssets";
import { useDebts } from "./useDebts";
import { useInvestments } from "./useInvestments";

export type RecentUpdateType = "asset" | "investment" | "debt";

export interface RecentUpdate {
  id: string;
  name: string;
  type: RecentUpdateType;
  itemType: string;
  updatedAt: number;
}

export interface NetWorthSummary {
  totalAssets: number;
  totalInvestments: number;
  totalDebts: number;
  netWorth: number;
  recentUpdates: RecentUpdate[];
  isLoading: boolean;
}

export function useNetWorth(): NetWorthSummary {
  const { assets, totalBalance: totalAssets, isLoading: assetsLoading } = useAssets();
  const { investments, totalCurrentValue: totalInvestments, isLoading: investLoading } = useInvestments();
  const { debts, totalRemaining: totalDebts, isLoading: debtsLoading } = useDebts();

  const netWorth = totalAssets + totalInvestments - totalDebts;

  const recentUpdates: RecentUpdate[] = [
    ...assets.map((a) => ({
      id: a.id,
      name: a.name,
      type: "asset" as const,
      itemType: a.type,
      updatedAt: a.updatedAt,
    })),
    ...investments.map((i) => ({
      id: i.id,
      name: i.name,
      type: "investment" as const,
      itemType: i.type,
      updatedAt: i.updatedAt,
    })),
    ...debts.map((d) => ({
      id: d.id,
      name: d.name,
      type: "debt" as const,
      itemType: d.type,
      updatedAt: d.updatedAt,
    })),
  ]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 5);

  return {
    totalAssets,
    totalInvestments,
    totalDebts,
    netWorth,
    recentUpdates,
    isLoading: assetsLoading || investLoading || debtsLoading,
  };
}
