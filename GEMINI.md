# Personal Stock Investment Tracker (PSIT) - GEMINI Context

This document serves as the primary instructional context for Gemini when working on the Personal Stock Investment Tracker (PSIT) project.

## Project Overview

**PSIT** is a simple, cloud-based, personal-use investment tracking system specifically designed for managing stock investments in **Pakistani Rupees (PKR)**.

- **Target User:** Single user, tracking personal investments manually.
- **Philosophy:** Prioritizes simplicity, accuracy, and full manual control over real-time market integration.
- **Scope:** Phase 1 covers deposits, buy/sell transactions, dividend tracking, manual price updates, and JSON-based backup/restore.

### Core Technologies
- **Framework:** Next.js 16+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4+
- **Database:** Supabase (PostgreSQL)
- **State/Data:** React Server Actions
- **Validation:** Zod
- **CSV/JSON Parsing:** PapaParse

## Building and Running

### Prerequisites
- Node.js (Latest LTS recommended)
- pnpm (recommended)
- Supabase account with project created

### Setup & Development
1. **Install Dependencies:** `pnpm install`
2. **Environment Setup:** Create `.env` file with Supabase credentials
3. **Database Setup:** Run SQL migration from `supabase_migration.sql` in Supabase SQL Editor
4. **Run Development Server:** `pnpm run dev`

## Business Rules & Calculations

### 1. Wallet Balance
```
Wallet Balance = Total Deposits - Total Buy Costs + Total Sell Proceeds + Total Dividends
```
- **Validation:** "Buy" transactions must fail if the wallet balance is insufficient.

### 2. FIFO Cost Basis (Mandatory)
- Sell transactions must follow the **First-In-First-Out** logic.
- Oldest buy transactions (lots) are consumed first.
- Realized Gain/Loss is calculated as: `Sell Proceeds - FIFO Cost of Sold Shares`.

### 3. Portfolio Metrics
- **Unrealized Gain/Loss:** `Remaining Quantity * (Current Price - Average Buy Price)`
- **Total Returns:** `Realized P/L + Unrealized P/L + Dividends`
- **Decimal Precision:** All currency calculations use JavaScript `number` type.

## Development Conventions

- **Currency:** Primary currency is PKR (`Rs.`). Format for display using `toLocaleString('en-PK', { maximumFractionDigits: 2 })`.
- **Localization:** Date format is `DD-MM-YYYY`.
- **Database:** Supabase PostgreSQL with snake_case column names.
- **Data Mutations:**
  - Use Server Actions with Zod validation.
  - Revalidate relevant paths (e.g., `/`, `/transactions`, `/wallet`) after successful mutations.
- **Error Handling:**
  - Prevent negative values and invalid dates.
  - Validate available stock quantity before allowing a "Sell" transaction.
- **Data Management:**
  - **JSON Import:** Replaces ALL existing data in the database. Perform validation before committing.
- **UI/UX:**
  - Minimalist design with Tailwind CSS.
  - Visual indicators for P/L: Green for profit (`text-green-600`), Red for loss (`text-red-600`).

## Project Structure

- `app/actions/`: Server Actions containing business logic (Brain of the app).
  - `portfolio.ts`: Portfolio aggregation and FIFO calculations.
  - `transactions.ts`: Buy/Sell/Dividend recording.
  - `wallet.ts`: Deposit and balance management.
  - `data.ts`: Export/Import functionality.
  - `stocks.ts`: Stock CRUD operations.
- `lib/supabase/`: Supabase client configurations.
  - `client.ts`: Browser client for client-side operations.
  - `server.ts`: Server client for Server Actions.
  - `middleware.ts`: Session middleware.
- `types/supabase.ts`: TypeScript type definitions for database tables.
- `supabase_migration.sql`: SQL script to create database tables.

## Important Documentation
- `PRD.md`: Product vision and core requirements.
- `DB_MIGRATION.md`: Database migration guide (SQLite → Supabase).
- `README.md`: Setup and usage instructions.
