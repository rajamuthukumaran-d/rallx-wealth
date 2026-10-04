# Frontend utilities

`@rallx-wealth/utils-frontend` contains platform-neutral helpers extracted from
the mobile app. Mobile and web both declare it as a workspace dependency.
Its only dependency is the shared domain types package; it has no runtime dependencies and does not import React, React Native, Expo,
or WatermelonDB.

```ts
import {
  formatCurrency,
  formatIndian,
  parseIndian,
  groupByType,
  buildYahooSymbol,
} from "@rallx-wealth/utils-frontend";

formatCurrency(125000); // "₹125.0k"
formatIndian("1234567.50"); // "12,34,567.50"
parseIndian("12,34,567.50"); // 1234567.5
groupByType([{ id: "a", type: "bank" }]);
buildYahooSymbol("reliance", "NSE"); // "RELIANCE.NS"
```

| Helpers | Purpose |
| --- | --- |
| `getCurrencySymbol`, `formatCurrency`, `formatFullCurrency` | Currency display with existing mobile defaults |
| `formatIndian`, `parseIndian` | Editable Indian number grouping and parsing |
| `formatRelativeDate`, `formatDueDate` | Relative timestamps and short due dates |
| `capitalise`, `getUniqueTypes`, `getInitials` | Display labels and avatar text |
| `formatUnits` | Investment quantity display |
| `groupByType`, `groupBySymbol` | Group plain records or mobile models without mutating inputs |
| `EXCHANGES`, `buildYahooSymbol`, `mapInstrumentType` | Exchange options and stock quote metadata helpers |
| `chartFetch`, `fetchStockQuote` | Yahoo metadata and normalized quotes with configurable fetch and headers |
| `getUsdToInrRate` | Cached USD/INR lookup with the existing offline fallback of 84 |
| `convertToInr` | Existing INR/USD conversion; other currencies pass through |

Grouping retains JavaScript object key ordering and each group's input order.
Symbol grouping ignores case and keeps each symbol-less record in its own
`__solo__<id>` group. Inputs must have unique record IDs.

Date formatting uses the runtime's local timezone. Relative dates retain the
mobile app's elapsed 24-hour calculation. Number parsing retains its zero
fallback for empty or invalid input.

Yahoo HTTP requests and quote normalization are shared. By default these helpers
use the runtime's standard `fetch` without custom headers. Browser callers may
need a proxy because cross-origin requests depend on Yahoo's CORS policy. Supply
`{ fetch: proxyFetch }` as the third argument to `fetchStockQuote` (or second to
`chartFetch`); the transport must return the Yahoo chart JSON shape.

`getUsdToInrRate(options?)` shares the same request options and caches its first
lookup per module instance, including concurrent calls. A failed lookup caches
the existing fallback of 84. The first caller's transport and headers apply;
subsequent calls reuse the cached rate. In a browser or mobile app this lasts
for the module's session; on a server it lasts for the module's process lifetime.

Mobile's `src/utils/stockPrice.ts` is a thin adapter that supplies its native
User-Agent header. The lookup, normalization, cache, and fallback are shared.
Database calculations and FIFO planning stay in `utils-database`;
navigation callbacks, native animations, and device backup APIs stay mobile-local.

The package follows `utils-database`'s exports: Metro uses TypeScript source via
the `react-native` condition; web and Node use compiled ESM and declarations in
`dist/`. Turbo builds dependencies before web development, builds, and typechecks.

```bash
pnpm --filter @rallx-wealth/utils-frontend build
pnpm --filter @rallx-wealth/utils-frontend test
```
