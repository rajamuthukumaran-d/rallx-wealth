import { Q } from "@nozbe/watermelondb";
import { useEffect, useState } from "react";
import { database } from "../index";
import Investment from "../models/Investment";

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
      .observe()
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
