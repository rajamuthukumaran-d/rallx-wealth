# Product Requirements Document (PRD): Rallx Wealth

## 1. Project Overview

**Name:** rallx-wealth
**Type:** Mobile Application (iOS & Android)
**Architecture:** Offline-first with backend synchronization
**Primary Goal:** A comprehensive wealth tracking application allowing users to manage income, expenses, investments, assets, and debts with granular analytics.

## 2. Tech Stack

- **Framework:** React Native
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **UI Components:** React Native Paper
- **Local Database:** WatermelonDB (SQLite)
- **Sync Backend:** Express.js & MongoDB (Note: Backend implementation is out of scope for this prompt; focus strictly on React Native + WatermelonDB sync logic).

## 3. App Navigation Structure

Implement a Bottom Tab Navigator with the following screens:

1.  **Home / Dashboard:** High-level summary of net worth, recent transactions, quick-add action buttons, and **a dedicated section displaying all active budgets with their current progress**.
2.  **Transactions:** A searchable, filterable list of all income and expense transactions.
3.  **Net Worth:** Visual breakdown with three main summary cards (Assets, Investments, Debts) showing the combined total of each class. Clicking on any of the three summary cards navigates the user to a dedicated page listing all individual components within that specific class.
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

- Users can log income and expenses.
- **Split Payments:** When adding an expense, users can split the payment across multiple sources (e.g., paying partially with a Digital Wallet and the rest via Bank/UPI). The UI must support dynamically adding multiple payment sources to a single transaction.
- Every transaction must be tied to a customizable Category.
- Categories are user-defined (Settings -> Manage Categories).

### C. Budgeting

- Users can allocate budgets on a Weekly, Bi-weekly, or Monthly basis.
- **Rollover:** Users have a toggle option to enable/disable rolling over unspent budget amounts to the next period.

### D. Assets & Investments

- **Assets:** Track balances of Bank accounts, Digital Wallets, App Credit, and Cash in hand.
- **Investments:** Manually enter investment values. (Architecture should support future integration of live market data).

### E. Debts & EMI (Auto-Deduction)

- Track Credit Cards, Loans, and EMIs.
- **Auto-Debit Logic:** When adding a debt/EMI, the user can toggle "Auto-Debit". If enabled, they must select a linked Asset account. The app should process this deduction automatically on the due date.

### F. Offline-First Sync (WatermelonDB)

- Must use WatermelonDB's `synchronize` function.
- Conflict resolution strategy: **Timestamp-based** (`updated_at` wins).

## 5. WatermelonDB Schema Definition

Generate the React Native WatermelonDB setup using the following schema structure. All tables must include `id`, `user_id`, `is_deleted`, `created_at` and `updated_at` for sync purposes.

- **categories:**
  - `name` (string)
  - `icon` (string)
- **assets:**
  - `name` (string)
  - `type` (string) - 'bank', 'wallet', 'cash', 'FD', etc.
  - `min_balance` (number, optional) - minimum balance to be maintained in the asset
  - `balance` (number)
  - `interest_rate` (number, optional)
  - `include_in_bal` (boolean) - true if the asset should be included in the net worth calculation
  - `maturity_date` (number, optional) - maturity date of the FD
- **investments:**
  - `name` (string)
  - `type` (string) - 'stock', 'mutual_fund', 'gold', 'silver', 'crypto', 'bonds', 'ETF', etc.
  - `symbol` (string, optional)
  - `invested_amount` (number)
  - `current_value` (number) - Manually updated for now
  - `quantity` (number, optional)
  - `platform` (string, optional) - platform where the investment is held
- **debts:**
  - `name` (string)
  - `type` (string) - 'loan', 'credit_card', 'emi', 'pay_later'
  - `total_amount` (number)
  - `remaining_amount` (number)
  - `interest_rate` (number, optional)
  - `emi_amount` (number, optional)
  - `due_date` (number, optional)
  - `auto_debit` (boolean)
  - `asset_id` (string, optional) - Foreign key to `assets`
  - `default_reward_points` (number, optional) - default reward points for making payment using credit card
  - `round_off_amount` (number, optional) - round off amount for making payment using credit card
  - `status` (string, optional) - 'active', 'closed'

* **transactions:**
  - `total_amount` (number)
  - `type` (string) - 'income', 'expense'
  - `date` (number) - timestamp
  - `note` (string, optional)
  - `category_id` (string) - Foreign key to `categories`

* **transaction_amounts:** (New table for handling multiple payment sources)
  - `transaction_id` (string) - Foreign key to `transactions`
  - `asset_id` (string) - Foreign key to `assets`
  - `debt_id` (string, optional) - Used if paying via credit card/pay later
  - `amount` (number) - The specific amount deducted/added to this specific asset

- **budgets:**
  - `amount` (number)
  - `period` (string) - 'weekly', 'bi-weekly', 'monthly'
  - `category_id` (string, optional) - If null, applies to overall spend
  - `rollover_enabled` (boolean)
  - `start_date` (number) - timestamp to anchor the rolling period. Default 1st of the month

## 6. Execution Instructions for AI

1.  Initialize the React Native project with the specified tech stack.
2.  Set up the WatermelonDB schema, models, and Sync wrapper exactly as outlined above.
3.  Implement the React Navigation tab structure.
4.  Build the UI components using NativeWind and React Native Paper, focusing on the Settings tab and the Auto-Debit toggle logic first to establish the data flow.
5.  Include logic for exporting/importing the raw SQLite `.db` file using `react-native-fs` or `expo-file-system`.
