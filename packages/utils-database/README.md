# @rallx-wealth/utils-database

Pure functions extracted from the mobile database controllers. They operate on plain record fields and can be used with WatermelonDB models, MongoDB documents, or web data. The package has no database-driver, React, or native runtime dependencies.

```ts
import {
  normalizeCurrency,
  prepareTransactionFields,
  calculateAssetBalance,
  calculateDebtTotals,
  calculateInvestmentTotals,
  calculateNetWorth,
  sortByCreatedAt,
  planInvestmentSale,
  effectiveCurrentValue,
} from "@rallx-wealth/utils-database";
```

## Source organization

`index.ts` exports the public API. Implementations are grouped into `currency.ts`, `transactions.ts`, `assets.ts`, `debts.ts`, `investments.ts`, `net-worth.ts`, and `dates.ts`. Modules import their internal dependencies directly. Explicit `.ts` source paths support React Native, while the TypeScript build rewrites them to `.js` for Node ESM. Root typechecking builds dependency declarations before checking consumers.

## Preparing writes

`normalizeCurrency` trims asset/debt currency inputs and applies the existing INR fallback (or an explicit fallback). `prepareTransactionFields` enforces the existing category requirement, normalizes the optional transaction name, and sums payment amounts. Its output retains string reference IDs and numeric dates; the persistence adapter handles storage-specific conversions and optional fields.

`planInvestmentSale` sorts the supplied active investment lots by creation date and returns FIFO patches with preview details. Each result contains the original `lot`, its `changes`, `fullyConsumed`, and either `unitsReduced` or `amountReduced`. It does not mutate lots or the input array. IDs are unconstrained, so MongoDB documents retain their typed `_id`. Creation dates may be numbers or `Date` objects.

```ts
// Backend example after selecting active lots within the appropriate transaction:
const updates = planInvestmentSale(lots, { unitsSold: 5 });
for (const { lot, changes } of updates) {
  await investments.updateOne(
    { _id: lot._id },
    { $set: changes },
    { session },
  );
}
```

The helper preserves the mobile behavior: positive units take priority over an amount; unit sales skip missing/non-positive quantities; amount sales use invested cost; full lots are soft-deleted; partial lots retain proportional invested/current values. A request exceeding available holdings consumes the available lots. Authentication, input validation, selection of active/matching lots, concurrency control, timestamp updates, and database transactions belong to the application. This package does not implement CRUD, MongoDB connections, or WatermelonDB queries.

## Summaries

Asset, debt, and investment totals operate on the supplied records without filtering or currency conversion. Callers select the correct active records and normalize currencies as needed.

`calculateNetWorth` retains the mobile formula and returns the five latest updates. It expects plain string IDs and converts update dates to Unix milliseconds. Map backend `_id` values to string `id` fields before using this helper. `sortByCreatedAt` accepts numeric or `Date` timestamps and returns a new array. `effectiveCurrentValue` preserves the existing fallback to invested amount when current value is not positive.

## Build and development

Node and web consumers use compiled ESM in `dist/`. TypeScript consumes compiled declarations, and React Native consumes source through the `react-native` export condition. Root `pnpm build` builds this package before dependent apps. Root `pnpm dev` builds dependencies first and starts a TypeScript watcher for this package.

For a standalone API/web session, build the package before starting the app; use its dev command to rebuild shared utilities while editing:

```sh
pnpm --filter @rallx-wealth/utils-database build
pnpm --filter @rallx-wealth/utils-database dev
pnpm --filter @rallx-wealth/utils-database test
pnpm --filter @rallx-wealth/utils-database lint
pnpm --filter @rallx-wealth/utils-database typecheck
```
