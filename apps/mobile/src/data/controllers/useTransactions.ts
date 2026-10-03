import { prepareTransactionFields } from "@rallx-wealth/utils-database";
import type { TransactionFormData } from "@rallx-wealth/types-common/forms";
import { Q } from "@nozbe/watermelondb";
import { useEffect, useState } from "react";
import { database } from "../index";
import Transaction from "../models/Transaction";
import TransactionAmount from "../models/TransactionAmount";

export type { PaymentRow, TransactionFormData } from "@rallx-wealth/types-common/forms";

export async function createTransaction(data: TransactionFormData): Promise<void> {
  const fields = prepareTransactionFields(data);

  await database.write(async () => {
    const transaction = await database
      .get<Transaction>("transactions")
      .create((record) => {
        record.name = (fields.name ?? null) as any;
        record.type = fields.type;
        record.totalAmount = fields.totalAmount;
        record.date = fields.date as any;
        record.note = fields.note;
        record.isRefund = fields.isRefund;
        record.isDeleted = false;
        (record as any)._raw.category_id = fields.categoryId;
      });

    for (const payment of data.payments) {
      await database
        .get<TransactionAmount>("transaction_amounts")
        .create((record) => {
          (record as any)._raw.transaction_id = transaction.id;
          (record as any)._raw.asset_id = payment.assetId;
          record.amount = payment.amount;
          record.isDeleted = false;
        });
    }
  });
}

export interface TransactionsData {
  transactions: Transaction[];
  isLoading: boolean;
}

export function useTransactions(): TransactionsData {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const subscription = database
      .get<Transaction>("transactions")
      .query(
        Q.where("is_deleted", false),
        Q.sortBy("date", Q.desc),
      )
      .observeWithColumns([
        "name",
        "total_amount",
        "type",
        "date",
        "note",
        "is_refund",
        "category_id",
        "updated_at",
      ])
      .subscribe((data) => {
        setTransactions(data);
        setIsLoading(false);
      });

    return () => subscription.unsubscribe();
  }, []);

  return { transactions, isLoading };
}
