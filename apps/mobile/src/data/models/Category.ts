import type { CategoryRecord } from "@rallx-wealth/types-database";
import { Model } from "@nozbe/watermelondb";
import { date, field, readonly, text } from "@nozbe/watermelondb/decorators";

export default class Category extends Model implements CategoryRecord {
  static table = "categories";

  @text("name") name!: string;
  @text("icon") icon!: string;
  @text("type") type!: string;

  @readonly @date("created_at") createdAt!: number;
  @readonly @date("updated_at") updatedAt!: number;
  @field("is_deleted") isDeleted!: boolean;
}
