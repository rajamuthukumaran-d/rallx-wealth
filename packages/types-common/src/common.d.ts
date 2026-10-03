export type RecentUpdateType = "asset" | "investment" | "debt";

export interface RecentUpdate {
  id: string;
  name: string;
  type: RecentUpdateType;
  itemType: string;
  updatedAt: number;
}

export interface NetWorthTotals {
  totalAssets: number;
  totalInvestments: number;
  totalDebts: number;
  netWorth: number;
  recentUpdates: RecentUpdate[];
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  currency: string;
  instrumentType: string;
}
