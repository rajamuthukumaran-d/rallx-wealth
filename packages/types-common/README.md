# @rallx-wealth/types-common

Shared form inputs and common domain contracts for mobile, web, and the API. This is a type-only package with no runtime dependencies or build step. Use `import type` or `export type`.

```ts
import type { NetWorthTotals, StockQuote } from "@rallx-wealth/types-common";
import type { AssetFormData, TransactionFormData } from "@rallx-wealth/types-common/forms";
```

All form types are also exported from the package root.

Form inputs retain their existing mobile shapes, including numeric dates and string reference IDs. They describe inputs rather than persisted database records or MongoDB insert documents. Mobile controllers re-export the extracted types to preserve existing app imports.

`NetWorthTotals` contains reusable calculated data; the mobile `NetWorthSummary` adds local `isLoading` state. `RecentUpdate` and `StockQuote` describe domain data. Hook results containing WatermelonDB instances stay mobile-local.

Database record contracts live in `@rallx-wealth/types-database`. MongoDB persistence types stay within the API.

```sh
pnpm --filter @rallx-wealth/types-common typecheck
pnpm --filter @rallx-wealth/types-common lint
```
