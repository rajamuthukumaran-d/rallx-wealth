# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**rallx-wealth** is an offline-first React Native (Expo) mobile app for tracking personal wealth: income, expenses, investments, assets, and debts. It runs on iOS and Android.

**Stack:** Expo (SDK 54) + Expo Router, React Native 0.81, WatermelonDB (SQLite), NativeWind v4, React Native Paper (MD3), TypeScript, pnpm.

## Commands

```bash
pnpm start           # Start Expo dev server
pnpm ios             # Run on iOS simulator
pnpm android         # Run on Android emulator
pnpm lint            # ESLint via expo lint
```

> No test runner is configured yet. The `src/data/models/__tests__/` directory exists but is empty.

## Architecture

### Routing (Expo Router file-based)
```
src/app/
  _layout.tsx              # Root layout — theme providers (Paper + Navigation)
  index.tsx                # Redirects to /(tabs)
  (tabs)/
    _layout.tsx            # MaterialBottomTabs, 4 tabs
    index.tsx              # Home (stub)
    transactions.tsx       # Transactions list (stub)
    net-worth.tsx          # Net Worth breakdown (stub)
    settings.tsx           # Settings (implemented)
  (models)/
    (backup-restore)/index.tsx   # DB export/import UI
    (category)/
      index.tsx            # Category list + CRUD
      [id].tsx             # Add/edit category form
```

Modal screens live under `(models)/` as full-screen routes, not overlaid modals. Navigate with `router.push('/(models)/(category)')` and dismiss with `router.back()`.

### Data Layer (`src/data/`)

- **`index.ts`** — Creates `Database` instance with `SQLiteAdapter`. All 7 model classes registered here. JSI mode is commented out but available.
- **`schema.ts`** — WatermelonDB schema v1. Every table includes `created_at` (number), `updated_at` (number), `is_deleted` (boolean) for sync.
- **`seed.ts`** — Seeds 8 default categories on first launch (guarded by count check).
- **`backupService.ts`** — Export zips DB files (.db, .db-shm, .db-wal) into a `.rallxdb` archive via `react-native-zip-archive`; import extracts and overwrites live files, then requires app restart.
- **`models/`** — One class per table using WatermelonDB decorators (`@text`, `@field`, `@date`, `@relation`, `@children`).

### WatermelonDB Model Patterns

Models use legacy decorator syntax. Always import decorators from `@nozbe/watermelondb/decorators`:

```ts
import { Model } from '@nozbe/watermelondb'
import { text, field, date, readonly, relation, children } from '@nozbe/watermelondb/decorators'

export default class Category extends Model {
  static table = 'categories'
  @text('name') name!: string
  @readonly @date('created_at') createdAt!: Date
}
```

One-to-many relationships (e.g. Transaction → TransactionAmounts) use `@children`:
```ts
@children('transaction_amounts') amounts!: Query<TransactionAmount>
```

Foreign keys use `@relation`:
```ts
@relation('categories', 'category_id') category!: Relation<Category>
```

### Theming

- `src/app/_layout.tsx` sets up Material Design 3 dynamic theming via `@pchmn/expo-material3-theme`.
- Access theme colors in components with `useTheme()` from `react-native-paper`.
- Use NativeWind `className` for layout/spacing, Paper components for interactive UI.
- Tailwind content paths: `src/app/**` and `src/components/**`.

### Path Alias

`@/` maps to `src/` (configured in `tsconfig.json` and `babel.config.js`). Use `@/data/...`, `@/components/...`, etc.

### Decorator Support

`babel.config.js` includes `@babel/plugin-proposal-decorators` with `{ legacy: true }`. `tsconfig.json` has `experimentalDecorators: true`. Both required for WatermelonDB models to work.

## Database Schema (7 tables)

| Table | Key fields |
|---|---|
| `categories` | `name`, `icon`, `type` (income/expense/transfer) |
| `assets` | `name`, `type`, `balance`, `min_balance`, `include_in_bal`, `maturity_date`, `interest_rate` |
| `investments` | `name`, `type`, `invested_amount`, `current_value`, `quantity`, `symbol`, `platform` |
| `debts` | `name`, `type`, `total_amount`, `remaining_amount`, `emi_amount`, `due_date`, `auto_debit`, `asset_id`, `status` |
| `transactions` | `total_amount`, `type` (income/expense/transfer), `date`, `category_id`, `note`, `is_refund`, `linked_transaction_id` |
| `transaction_amounts` | `transaction_id`, `asset_id`, `debt_id`, `amount` — handles split payments |
| `budgets` | `amount`, `period` (weekly/bi-weekly/monthly), `start_date`, `category_id`, `rollover_enabled` |

## Implementation Status

**Complete:** Schema, all models, WatermelonDB init, category CRUD, settings screen, backup/restore (export/import), default seed data, theming, navigation structure.

**Not yet built:** Home screen, transactions list, transaction creation (incl. split payment UI), net worth screen, asset/investment/debt management, budget management, auto-deduction logic, analytics/stats, authentication, theme toggle UI.
