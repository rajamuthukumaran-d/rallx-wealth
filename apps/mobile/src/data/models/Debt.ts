import type { DebtRecord } from "@rallx-wealth/types-database";
import { Model } from "@nozbe/watermelondb";
import {
  date,
  field,
  readonly,
  relation,
  text,
} from "@nozbe/watermelondb/decorators";
import Asset from "./Asset";

export default class Debt extends Model implements Omit<DebtRecord, "assetId"> {
  static table = "debts";

  @text("name") name!: string;
  @text("type") type!: string;
  @text("currency") currency?: string;
  @field("total_amount") totalAmount!: number;
  @field("remaining_amount") remainingAmount!: number;
  @field("interest_rate") interestRate?: number;
  @field("emi_amount") emiAmount?: number;
  @date("due_date") dueDate?: number;
  @field("auto_debit") autoDebit!: boolean;
  @relation("assets", "asset_id") asset?: Asset;
  @field("default_reward_points") defaultRewardPoints?: number;
  @field("round_off_amount") roundOffAmount?: number;
  @text("status") status!: string;

  @readonly @date("created_at") createdAt!: number;
  @readonly @date("updated_at") updatedAt!: number;
  @field("is_deleted") isDeleted!: boolean;
}
