import type { TransactionAmountRecord } from "@rallx-wealth/types-database";
import { Model } from "@nozbe/watermelondb";
import {
    date,
    field,
    readonly,
    relation,
} from "@nozbe/watermelondb/decorators";
import Asset from "./Asset";
import Debt from "./Debt";
import Transaction from "./Transaction";

export default class TransactionAmount extends Model
  implements Omit<TransactionAmountRecord, "transactionId" | "assetId" | "debtId">
{
  static table = "transaction_amounts";

  @relation("transactions", "transaction_id") transaction!: Transaction;
  @relation("assets", "asset_id") asset?: Asset;
  @relation("debts", "debt_id") debt?: Debt;
  @field("amount") amount!: number;

  @readonly @date("created_at") createdAt!: number;
  @readonly @date("updated_at") updatedAt!: number;
  @field("is_deleted") isDeleted!: boolean;
}
