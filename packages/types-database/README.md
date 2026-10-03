# @rallx-wealth/types-database

Platform-neutral database record contracts shared by mobile, web, and the API. This is a type-only package with no runtime dependencies or build step. Use `import type` or `export type`.

```ts
import type { AssetRecord, TransactionRecord, DatabaseRecords } from "@rallx-wealth/types-database";
```

The seven record interfaces mirror the existing mobile entities: assets, categories, investments, debts, transactions, transaction amounts, and budgets. `DatabaseRecords` maps table names to record types. Relations are IDs (`assetId`, `categoryId`, etc.), rather than WatermelonDB objects or queries. Transaction amounts are separate records connected through `transactionId`.

Records default to string IDs and numeric dates (Unix milliseconds). Both are configurable through generics, such as `AssetRecord<ObjectId, Date>` in the backend. Text fields preserve the existing model's string contracts.

These are plain application records. SQLite raw rows, snake_case columns, `_status`, and `_changed` stay mobile-local. Optional fields use omitted/undefined values; normalize nullable storage values before producing plain records. WatermelonDB's `@date` accessors return `Date` at runtime despite the existing models' numeric annotations, so convert dates explicitly when producing numeric records.

## MongoDB in the API

MongoDB-specific persistence types live in `apps/api/src/data/mongodbTypes.ts`, where `MongoDatabaseDocuments` defaults to MongoDB `ObjectId` IDs and `Date` fields. It replaces `id` with `_id` and uses the same ID type for reference fields. The shared package does not expose MongoDB-specific types or depend on the driver.

```ts
// Inside apps/api/src:
import type { Collection, Db } from "mongodb";
import type { MongoDatabaseDocuments } from "./data/mongodbTypes.js";

type Documents = MongoDatabaseDocuments;

function assetsCollection(db: Db): Collection<Documents["assets"]> {
  return db.collection<Documents["assets"]>("assets");
}
```

The API must map `_id` and reference IDs to strings and dates to the chosen JSON format before returning plain records to clients. Types do not perform serialization or runtime validation.

`HealthResponse` lives in `src/utils.d.ts` and describes the health endpoint response, including database connectivity status. Import it from `@rallx-wealth/types-database` or `@rallx-wealth/types-database/utils`.

Forms and common domain contracts live in `@rallx-wealth/types-common`.

```sh
pnpm --filter @rallx-wealth/types-database typecheck
pnpm --filter @rallx-wealth/types-database lint
```
