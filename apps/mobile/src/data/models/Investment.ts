import type { InvestmentRecord } from "@rallx-wealth/types-database";
import { Model } from "@nozbe/watermelondb";
import { date, field, readonly, text } from "@nozbe/watermelondb/decorators";

export default class Investment extends Model implements InvestmentRecord {
  static table = "investments";

  @text("name") name!: string;
  @text("type") type!: string;
  @text("symbol") symbol?: string;
  @field("invested_amount") investedAmount!: number;
  @field("current_value") currentValue!: number;
  @field("quantity") quantity?: number;
  @text("platform") platform?: string;
  @text("exchange") exchange?: string;
  @text("currency") currency?: string;

  @readonly @date("created_at") createdAt!: number;
  @readonly @date("updated_at") updatedAt!: number;
  @field("is_deleted") isDeleted!: boolean;
}
