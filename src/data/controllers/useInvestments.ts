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
