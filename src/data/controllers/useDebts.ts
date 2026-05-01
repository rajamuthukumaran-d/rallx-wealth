import { Q } from "@nozbe/watermelondb";
import { useEffect, useState } from "react";
import { database } from "../index";
import Debt from "../models/Debt";

export interface DebtsData {
  debts: Debt[];
  totalAmount: number;
  totalRemaining: number;
  totalEmi: number;
  isLoading: boolean;
}

export function useDebts(statusFilter: "active" | "all" = "active"): DebtsData {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const clauses = [Q.where("is_deleted", false)];
    if (statusFilter !== "all") clauses.push(Q.where("status", statusFilter));

    const subscription = database
      .get<Debt>("debts")
      .query(...clauses)
      .observe()
      .subscribe((data) => {
        setDebts(data);
        setIsLoading(false);
      });

    return () => subscription.unsubscribe();
  }, [statusFilter]);

  const totalAmount = debts.reduce((sum, d) => sum + d.totalAmount, 0);
  const totalRemaining = debts.reduce((sum, d) => sum + d.remainingAmount, 0);
  const totalEmi = debts.reduce((sum, d) => sum + (d.emiAmount ?? 0), 0);

  return { debts, totalAmount, totalRemaining, totalEmi, isLoading };
}
