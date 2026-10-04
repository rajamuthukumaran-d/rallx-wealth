import type { ObjectId } from "mongodb";
import type { BaseRecord, DatabaseRecords } from "@rallx-wealth/types-database";

/** Replace a plain record's `id` with MongoDB's `_id`, keeping reference IDs. */
export type MongoDocument<TRecord extends BaseRecord<unknown, unknown>> =
  Omit<TRecord, "id"> & { _id: TRecord["id"] };

/** Backend persistence contracts; BSON IDs and dates stay within the API. */
export type MongoDatabaseDocuments<TId = ObjectId, TDate = Date> = {
  [TTable in keyof DatabaseRecords]: MongoDocument<DatabaseRecords<TId, TDate>[TTable]>;
};
