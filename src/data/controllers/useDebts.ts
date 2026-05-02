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

export interface DebtFormData {
  name: string;
  type: string;
  status: "active" | "closed";
  totalAmount: number;
  remainingAmount: number;
  autoDebit: boolean;
  emiAmount?: number;
  interestRate?: number;
  defaultRewardPoints?: number;
  roundOffAmount?: number;
  dueDate?: number;
}

export interface DebtRecord {
  debt: Debt | null;
  isLoading: boolean;
}

export function useDebt(id: string): DebtRecord {
  const [debt, setDebt] = useState<Debt | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const subscription = database
      .get<Debt>("debts")
      .findAndObserve(id)
      .subscribe({
        next: (record) => {
          setDebt(record);
          setIsLoading(false);
        },
        error: (e) => {
          console.error(e);
          setIsLoading(false);
        },
      });

    return () => subscription.unsubscribe();
  }, [id]);

  return { debt, isLoading };
}

function applyDebtFields(record: Debt, data: DebtFormData) {
  record.name = data.name;
  record.type = data.type;
  record.status = data.status;
  record.totalAmount = data.totalAmount;
  record.remainingAmount = data.remainingAmount;
  record.autoDebit = data.autoDebit;
  record.emiAmount = data.emiAmount;
  record.interestRate = data.interestRate;
  record.defaultRewardPoints = data.defaultRewardPoints;
  record.roundOffAmount = data.roundOffAmount;
  record.dueDate = data.dueDate as any;
}

export async function createDebt(data: DebtFormData): Promise<void> {
  await database.write(async () => {
    await database.get<Debt>("debts").create((record) => {
      applyDebtFields(record, data);
      record.isDeleted = false;
    });
  });
}

export async function updateDebt(
  id: string,
  data: DebtFormData,
): Promise<void> {
  await database.write(async () => {
    const record = await database.get<Debt>("debts").find(id);
    await record.update((r) => applyDebtFields(r, data));
  });
}

export async function deleteDebt(debt: Debt): Promise<void> {
  await database.write(async () => {
    await debt.update((r) => {
      r.isDeleted = true;
    });
  });
}
