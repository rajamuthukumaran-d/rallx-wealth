import { Model, Query } from "@nozbe/watermelondb";
import {
  children,
  date,
  field,
  readonly,
  relation,
  text,
} from "@nozbe/watermelondb/decorators";
import Category from "./Category";
import TransactionAmount from "./TransactionAmount";

export default class Transaction extends Model {
  static table = "transactions";

  @text('name') name?: string;
  @field("total_amount") totalAmount!: number;
  @text("type") type!: string;
  @field("is_refund") isRefund!: boolean;
  @relation("transactions", "linked_transaction_id")
  linkedTransaction?: Transaction;
  @date("date") date!: number;
  @text("note") note?: string;
  @relation("categories", "category_id") category!: Category;

  @children("transaction_amounts")
  transactionAmounts!: Query<TransactionAmount>;

  @readonly @date("created_at") createdAt!: number;
  @readonly @date("updated_at") updatedAt!: number;
  @field("is_deleted") isDeleted!: boolean;
}
