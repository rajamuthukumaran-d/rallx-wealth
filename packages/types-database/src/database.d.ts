/** Plain records use camelCase fields and IDs instead of ORM relation objects. */

export interface BaseRecord<TId = string, TDate = number> {
  id: TId;
  createdAt: TDate;
  updatedAt: TDate;
  isDeleted: boolean;
}

export interface AssetRecord<TId = string, TDate = number> extends BaseRecord<TId, TDate> {
  name: string;
  type: string;
  currency?: string;
  minBalance?: number;
  balance: number;
  interestRate?: number;
  includeInBal: boolean;
  maturityDate?: TDate;
}

export interface CategoryRecord<TId = string, TDate = number> extends BaseRecord<TId, TDate> {
  name: string;
  icon: string;
  type: string;
}

export interface InvestmentRecord<TId = string, TDate = number> extends BaseRecord<TId, TDate> {
  name: string;
  type: string;
  symbol?: string;
  investedAmount: number;
  currentValue: number;
  quantity?: number;
  platform?: string;
  exchange?: string;
  currency?: string;
}

export interface DebtRecord<TId = string, TDate = number> extends BaseRecord<TId, TDate> {
  name: string;
  type: string;
  currency?: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate?: number;
  emiAmount?: number;
  dueDate?: TDate;
  autoDebit: boolean;
  defaultRewardPoints?: number;
  roundOffAmount?: number;
  status: string;
  assetId?: TId;
}

export interface BudgetRecord<TId = string, TDate = number> extends BaseRecord<TId, TDate> {
  amount: number;
  period: string;
  startDate: TDate;
  rolloverEnabled: boolean;
  categoryId?: TId;
}

export interface TransactionRecord<TId = string, TDate = number> extends BaseRecord<TId, TDate> {
  name?: string;
  totalAmount: number;
  type: string;
  isRefund: boolean;
  date: TDate;
  note?: string;
  categoryId: TId;
  linkedTransactionId?: TId;
}

export interface TransactionAmountRecord<TId = string, TDate = number> extends BaseRecord<TId, TDate> {
  amount: number;
  transactionId: TId;
  assetId?: TId;
  debtId?: TId;
}

export interface DatabaseRecords<TId = string, TDate = number> {
  assets: AssetRecord<TId, TDate>;
  categories: CategoryRecord<TId, TDate>;
  investments: InvestmentRecord<TId, TDate>;
  debts: DebtRecord<TId, TDate>;
  transactions: TransactionRecord<TId, TDate>;
  transaction_amounts: TransactionAmountRecord<TId, TDate>;
  budgets: BudgetRecord<TId, TDate>;
}

export type DatabaseTable = keyof DatabaseRecords;
