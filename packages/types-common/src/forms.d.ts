/** Shared input contracts, preserving the existing mobile form shapes. */
export interface AssetFormData {
  name: string;
  type: string;
  currency?: string;
  balance: number;
  minBalance: number;
  includeInBal: boolean;
  maturityDate?: number;
  interestRate?: number;
}

export interface CategoryFormData {
  name: string;
  icon: string;
  type: string;
}

export interface DebtFormData {
  name: string;
  type: string;
  currency?: string;
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

export interface SellInvestmentData {
  symbol?: string;
  name: string;
  unitsSold?: number;
  soldAmount?: number;
}

export interface PaymentRow {
  assetId: string;
  amount: number;
}

export interface TransactionFormData {
  name: string;
  type: string;
  date: number;
  categoryId: string;
  note: string;
  isRefund: boolean;
  payments: PaymentRow[];
}
