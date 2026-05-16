import { Q } from "@nozbe/watermelondb";
import { useEffect, useState } from "react";
import { database } from "../index";
import Investment from "../models/Investment";
import { fetchStockQuote } from "@/utils/stockPrice";

export interface InvestmentsData {
  investments: Investment[];
  totalInvested: number;
  totalCurrentValue: number;
  totalGainLoss: number;
  isLoading: boolean;
}

export function useInvestments(): InvestmentsData {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const subscription = database
      .get<Investment>("investments")
      .query(Q.where("is_deleted", false))
      .observeWithColumns([
        "name", "type", "symbol", "invested_amount", "current_value",
        "quantity", "platform", "exchange", "currency", "updated_at",
      ])
      .subscribe((data) => {
        setInvestments(data);
        setIsLoading(false);
      });

    return () => subscription.unsubscribe();
  }, []);

  const totalInvested = investments.reduce((sum, i) => sum + i.investedAmount, 0);
  const totalCurrentValue = investments.reduce((sum, i) => sum + i.currentValue, 0);
  const totalGainLoss = totalCurrentValue - totalInvested;

  return { investments, totalInvested, totalCurrentValue, totalGainLoss, isLoading };
}

export interface InvestmentRecord {
  investment: Investment | null;
  isLoading: boolean;
}

export function useInvestment(id: string): InvestmentRecord {
  const [investment, setInvestment] = useState<Investment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const subscription = database
      .get<Investment>("investments")
      .findAndObserve(id)
      .subscribe({
        next: (record) => {
          setInvestment(record);
          setIsLoading(false);
        },
        error: (e) => {
          console.error(e);
          setIsLoading(false);
        },
      });

    return () => subscription.unsubscribe();
  }, [id]);

  return { investment, isLoading };
}

export interface InvestmentFormData {
  name: string;
  type: string;
  symbol?: string;
  platform?: string;
  exchange?: string;
  currency?: string;
  investedAmount: number;
  currentValue: number;
  quantity?: number;
}

function applyInvestmentFields(record: Investment, data: InvestmentFormData) {
  record.name = data.name;
  record.type = data.type;
  record.symbol = data.symbol as any;
  record.platform = data.platform as any;
  record.exchange = data.exchange as any;
  record.currency = data.currency as any;
  record.investedAmount = data.investedAmount;
  record.currentValue = data.currentValue;
  record.quantity = data.quantity as any;
}

export async function createInvestment(data: InvestmentFormData): Promise<void> {
  await database.write(async () => {
    await database.get<Investment>("investments").create((record) => {
      applyInvestmentFields(record, data);
      record.isDeleted = false;
    });
  });
}

export async function updateInvestment(id: string, data: InvestmentFormData): Promise<void> {
  await database.write(async () => {
    const record = await database.get<Investment>("investments").find(id);
    await record.update((r) => applyInvestmentFields(r, data));
  });
}

export async function deleteInvestment(investment: Investment): Promise<void> {
  await database.write(async () => {
    await investment.update((r) => {
      r.isDeleted = true;
    });
  });
}

export function useInvestmentGroup(symbol?: string, name?: string) {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!symbol && !name) {
      setIsLoading(false);
      return;
    }

    const collection = database.get<Investment>("investments");
    const query = symbol
      ? collection.query(Q.where("is_deleted", false), Q.where("symbol", symbol))
      : collection.query(Q.where("is_deleted", false), Q.where("name", name!));

    const subscription = query
      .observeWithColumns(["invested_amount", "current_value", "quantity", "is_deleted", "created_at"])
      .subscribe((data) => {
        const sorted = [...data].sort(
          (a, b) => new Date(a.createdAt as any).getTime() - new Date(b.createdAt as any).getTime(),
        );
        setInvestments(sorted);
        setIsLoading(false);
      });

    return () => subscription.unsubscribe();
  }, [symbol, name]);

  return { investments, isLoading };
}

export interface SellInvestmentData {
  symbol?: string;
  name: string;
  unitsSold?: number;
  soldAmount?: number;
}

export async function sellInvestment(data: SellInvestmentData): Promise<void> {
  const { symbol, name, unitsSold, soldAmount } = data;

  const collection = database.get<Investment>("investments");
  const lots = await (symbol
    ? collection.query(Q.where("is_deleted", false), Q.where("symbol", symbol))
    : collection.query(Q.where("is_deleted", false), Q.where("name", name))
  ).fetch();

  lots.sort(
    (a, b) => new Date(a.createdAt as any).getTime() - new Date(b.createdAt as any).getTime(),
  );

  if (lots.length === 0) return;

  await database.write(async () => {
    if (unitsSold !== undefined && unitsSold > 0) {
      let remaining = unitsSold;
      for (const lot of lots) {
        if (remaining <= 0) break;
        const qty = lot.quantity ?? 0;
        if (qty <= 0) continue;

        if (qty <= remaining) {
          remaining -= qty;
          await lot.update((r) => { r.isDeleted = true; });
        } else {
          const proportion = remaining / qty;
          const newQty = qty - remaining;
          remaining = 0;
          await lot.update((r) => {
            r.quantity = newQty as any;
            r.investedAmount = lot.investedAmount * (1 - proportion);
            r.currentValue = lot.currentValue * (1 - proportion);
          });
        }
      }
    } else if (soldAmount !== undefined && soldAmount > 0) {
      let remaining = soldAmount;
      for (const lot of lots) {
        if (remaining <= 0) break;

        if (lot.investedAmount <= remaining) {
          remaining -= lot.investedAmount;
          await lot.update((r) => { r.isDeleted = true; });
        } else {
          const proportion = remaining / lot.investedAmount;
          const newInvestedAmount = lot.investedAmount - remaining;
          remaining = 0;
          await lot.update((r) => {
            r.investedAmount = newInvestedAmount;
            r.currentValue = lot.currentValue * (1 - proportion);
            if (lot.quantity != null) r.quantity = (lot.quantity * (1 - proportion)) as any;
          });
        }
      }
    }
  });
}

// Fetches live prices for all investments that have a symbol + exchange and updates currentValue.
// Runs all fetches concurrently; silently skips any that fail (e.g. bad symbol, offline).
export async function refreshInvestmentPrices(investments: Investment[]): Promise<void> {
  const eligible = investments.filter((i) => i.symbol && i.exchange);
  await Promise.allSettled(
    eligible.map(async (inv) => {
      try {
        const quote = await fetchStockQuote(inv.symbol!, inv.exchange!);
        const newValue = inv.quantity ? quote.price * inv.quantity : quote.price;
        await database.write(async () => {
          const record = await database.get<Investment>("investments").find(inv.id);
          await record.update((r) => {
            r.currentValue = newValue;
            r.currency = quote.currency as any;
          });
        });
      } catch {
        // skip silently — bad symbol, network error, etc.
      }
    }),
  );
}
