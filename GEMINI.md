# Product Requirements Document (PRD): Rallx Wealth

**File Context:** To be used as the primary context for AI code generation (Antigravity).

## 1. Project Overview

**Name:** rallx-wealth
**Type:** Mobile Application (iOS & Android)
**Architecture:** Offline-first with backend synchronization
**Primary Goal:** A comprehensive wealth tracking application allowing users to manage income, expenses, investments, assets, and debts with granular analytics and split-payment capabilities.

## 2. Tech Stack

- **Framework:** React Native
- **Styling:** NativeWind
- **UI Components:** React Native Paper
- **Local Database:** WatermelonDB (SQLite)
- **Sync Backend:** Express.js & MongoDB (Focus strictly on React Native + WatermelonDB sync architecture for this phase).

## 3. App Navigation Structure (Bottom Tab Navigator)

1.  **Home / Dashboard:** High-level summary of net worth, recent transactions, quick-add action buttons, and a dedicated section displaying all active budgets with their current progress.
2.  **Transactions:** A searchable, filterable list of all income, expense, and transfer transactions.
3.  **Net Worth:** Visual breakdown with three main summary cards (Assets, Investments, Debts) showing the combined total of each class. Clicking a summary card navigates to a dedicated page listing all individual components within that specific class.
4.  **Settings:** \* Change Theme (Dark/Light mode).
    - Export/Import raw SQLite Database.
    - Manage Categories.
    - Manage Budgets.
    - Get Stats (spending habits via categories and time period).
    - Manage Auto Deductions.

## 4. Core Features & Business Logic

### A. Authentication

- Implement a multi-user authentication flow on the frontend (Login/Register screens, JWT token storage in secure storage).

### B. Transactions, Categories & Split Payments

- Log income, expenses, and transfers.
- **Split Payments:** When adding a transaction, users can split the payment across multiple sources (e.g., partial payment from a Wallet, partial from a Credit Card). The UI must support dynamically adding multiple payment sources.
- **Transfers:** Support moving money between assets or paying off a debt (credit card) from an asset (bank).
- Categories are user-defined and filtered by type.

### C. Budgeting

- Allocate budgets on a Weekly, Bi-weekly, or Monthly basis.
- **Rollover:** Toggle option to enable/disable rolling over unspent budget amounts to the next period.

### D. Assets & Investments

- **Assets:** Track balances of Banks, Wallets, Cash, FDs, etc. Includes settings for minimum balances and maturity dates.
- **Investments:** Manually enter and track investment values (Stocks, MFs, Gold, Crypto, etc.). Architecture must support future live-data API integration.

### E. Debts & EMI (Auto-Deduction)

- Track Loans, Credit Cards, EMIs, and Pay Later accounts.
- **Auto-Debit Logic:** When adding a debt/EMI, toggle "Auto-Debit" and link to a specific `asset_id`. The app automatically processes this deduction on the due date.

### F. Offline-First Sync (WatermelonDB)

- Use WatermelonDB's `synchronize` function.
- Conflict resolution strategy: **Timestamp-based** (`updated_at` wins).
- Implement soft deletes.

## 5. WatermelonDB Schema Definition

Generate the React Native WatermelonDB schema using the exact structure below.
**Crucial AI Instruction:** Every table must implicitly or explicitly include `created_at` (number), `updated_at` (number), and `is_deleted` (boolean) to support WatermelonDB's sync protocol.

- **categories:**
  - `name` (string)
  - `icon` (string)
  - `type` (string) - 'income', 'expense', 'transfer'
- **assets:**
  - `name` (string)
  - `type` (string) - 'bank', 'wallet', 'cash', 'FD', etc.
  - `min_balance` (number, optional)
  - `balance` (number)
  - `interest_rate` (number, optional)
  - `include_in_bal` (boolean)
  - `maturity_date` (number, optional)
- **investments:**
  - `name` (string)
  - `type` (string) - 'stock', 'mutual_fund', 'gold', 'silver', 'crypto', 'bonds', 'ETF', etc.
  - `symbol` (string, optional)
  - `invested_amount` (number)
  - `current_value` (number)
  - `quantity` (number, optional)
  - `platform` (string, optional)
- **debts:**
  - `name` (string)
  - `type` (string) - 'loan', 'credit_card', 'emi', 'pay_later'
  - `total_amount` (number)
  - `remaining_amount` (number)
  - `interest_rate` (number, optional)
  - `emi_amount` (number, optional)
  - `due_date` (number, optional)
  - `auto_debit` (boolean)
  - `asset_id` (string, optional) - Foreign key to `assets` (for auto-debit)
  - `default_reward_points` (number, optional)
  - `round_off_amount` (number, optional)
  - `status` (string) - 'active', 'closed'
- **transactions:**
  - `total_amount` (number)
  - `type` (string) - 'income', 'expense', 'transfer'
  - `is_refund` (boolean) - Default false.
  - `linked_transaction_id` (string, optional) - Self-referencing foreign key pointing to the original transaction being refunded.
  - `date` (number) - timestamp of when the transaction (or refund) occurred.
  - `note` (string, optional)
  - `category_id` (string) - Foreign key to `categories`
- **transaction_amounts:** (Handles split payments and refund destinations)
  - `transaction_id` (string) - Foreign key to `transactions`.
  - `asset_id` (string, optional) - Foreign key to `assets`. Used if paid/refunded via bank/wallet/cash.
  - `debt_id` (string, optional) - Foreign key to `debts`. Used if paid/refunded via credit card/pay later.
  - `amount` (number)
- **budgets:**
  - `amount` (number)
  - `period` (string) - 'weekly', 'bi-weekly', 'monthly'
  - `start_date` (number) - timestamp to anchor the rolling period
  - `category_id` (string, optional) - If null, applies to overall spend
  - `rollover_enabled` (boolean)

## 6. Execution Instructions for AI

1. Initialize the React Native project with the specified tech stack.
2. Set up the WatermelonDB `schema.js`, ensuring all columns map correctly to standard types (`string`, `number`, `boolean`).
3. Create the WatermelonDB Model classes. Pay special attention to the one-to-many relationship between `Transaction` and `TransactionAmount` using WatermelonDB decorators (`@children`, `@relation`).
4. Implement the React Navigation tab structure.
5. Build the UI components using NativeWind and React Native Paper. Start with the Dashboard and the Split Payment UI logic within the Transaction creation screen.
6. Implement raw SQLite `.db` file export/import functionality using a suitable file system library.
