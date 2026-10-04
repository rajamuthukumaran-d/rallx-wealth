import type { AssetRecord } from "@rallx-wealth/types-database";
import { Model } from "@nozbe/watermelondb";
import { date, field, readonly, text } from "@nozbe/watermelondb/decorators";

export default class Asset extends Model implements AssetRecord {
  static table = "assets";

  @text("name") name!: string;
  @text("type") type!: string;
  @text("currency") currency?: string;
  @field("min_balance") minBalance?: number;
  @field("balance") balance!: number;
  @field("interest_rate") interestRate?: number;
  @field("include_in_bal") includeInBal!: boolean;
  @date("maturity_date") maturityDate?: number;

  @readonly @date("created_at") createdAt!: number;
  @readonly @date("updated_at") updatedAt!: number;
  @field("is_deleted") isDeleted!: boolean;
}
