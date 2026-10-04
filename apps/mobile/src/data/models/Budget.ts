import type { BudgetRecord } from "@rallx-wealth/types-database";
import { Model } from "@nozbe/watermelondb";
import {
    date,
    field,
    readonly,
    relation,
    text,
} from "@nozbe/watermelondb/decorators";
import Category from "./Category";

export default class Budget extends Model implements Omit<BudgetRecord, "categoryId"> {
  static table = "budgets";

  @field("amount") amount!: number;
  @text("period") period!: string;
  @date("start_date") startDate!: number;
  @relation("categories", "category_id") category?: Category;
  @field("rollover_enabled") rolloverEnabled!: boolean;

  @readonly @date("created_at") createdAt!: number;
  @readonly @date("updated_at") updatedAt!: number;
  @field("is_deleted") isDeleted!: boolean;
}
