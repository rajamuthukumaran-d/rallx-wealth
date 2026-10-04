import { calculateNetWorth } from "@rallx-wealth/utils-database";
import type { NetWorthTotals } from "@rallx-wealth/types-common";
import { useAssets } from "./useAssets";
import { useDebts } from "./useDebts";
import { useInvestments } from "./useInvestments";

export type { RecentUpdate, RecentUpdateType } from "@rallx-wealth/types-common";

export interface NetWorthSummary extends NetWorthTotals {
  isLoading: boolean;
}

export function useNetWorth(): NetWorthSummary {
  const { assets, isLoading: assetsLoading } = useAssets();
  const { investments, isLoading: investLoading } = useInvestments();
  const { debts, isLoading: debtsLoading } = useDebts();

  return {
    ...calculateNetWorth(assets, investments, debts),
    isLoading: assetsLoading || investLoading || debtsLoading,
  };
}
