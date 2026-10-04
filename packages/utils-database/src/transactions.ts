import type { TransactionRecord } from "@rallx-wealth/types-database";
import type { TransactionFormData } from "@rallx-wealth/types-common/forms";

/** Prepare scalar transaction fields; persistence adapters handle IDs and dates. */
export function prepareTransactionFields(data: TransactionFormData): Pick<
  TransactionRecord,
  "name" | "type" | "totalAmount" | "date" | "note" | "isRefund" | "categoryId"
> {
  if (!data.categoryId) throw new Error("categoryId is required");
  return {
    name: data.name.trim() || undefined,
    type: data.type,
    totalAmount: data.payments.reduce((sum, payment) => sum + payment.amount, 0),
    date: data.date,
    note: data.note,
    isRefund: data.isRefund,
    categoryId: data.categoryId,
  };
}
