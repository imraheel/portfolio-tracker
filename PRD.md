# Product Requirement Document (PRD)

## Product Name

Personal Stock Investment Tracker (PSIT)

## Purpose & Vision

The purpose of this application is to provide a **simple, cloud-based, personal-use investment tracking system** to manage stock 
investments in **Pakistani Rupees (PKR)**. The application will allow manual tracking of deposits, stock purchases, and current 
stock prices to calculate capital gains or losses.

This app is **not** intended for real-time market integration or multi-user usage. It prioritizes **simplicity, accuracy, 
transparency, and full manual control**.

---

## Target User

* Single user (you)
* Investor tracking personal stock investments
* Comfortable with manual data entry

---

## Tech Stack

* **Frontend**: Next.js (App Router)
* **Language**: TypeScript
* **Styling**: Tailwind CSS
* **Database**: Supabase (PostgreSQL)
* **Database Client**: Supabase Client (@supabase/supabase-js)

---

## Currency & Localization

* **Primary Currency**: Pakistani Rupees (PKR)
* Currency Symbol: `Rs.`
* Decimal Precision: 2
* Date Format: `DD-MM-YYYY`

---

## Core Modules & Features

> **Note:** Buy, Sell, Dividend, and Wallet balance logic are all included in Phase 1 based on confirmed requirements.

### 1. Account / Wallet Management

Tracks how much money you deposit into your investment account.

#### Features

* Add deposit entry
* View total deposited amount
* View available balance (optional future enhancement)

#### Fields

* `id`
* `amount` (PKR)
* `deposit_date`
* `note` (optional)
* `created_at`

#### Calculations

* **Total Deposited** = Sum of all deposits

---

### 2. Stock Master (Optional but Recommended)

A reference table to avoid repeated symbol entry.

#### Fields

* `id`
* `symbol` (e.g., PSO, ENGRO)
* `company_name` (optional)
* `sector` (optional)

---

### 3. Stock Buy Transactions

Tracks when and how stocks are bought and updates wallet balance.

#### Features

* Add stock buy transaction
* Edit/Delete buy transaction
* Automatically reduce wallet balance
* Included in investment history

#### Fields

* `id`
* `stock_id` (references stocks)
* `quantity`
* `buy_rate` (PKR per share)
* `total_cost` (auto-calculated)
* `buy_date`
* `notes` (optional)
* `created_at`

#### Calculations

```
Total Cost = quantity × buyRate
```

---

### 4. Stock Sell Transactions

Tracks selling of stocks and updates wallet balance.

#### Features

* Add stock sell transaction
* Validate available quantity before selling
* Automatically increase wallet balance
* Track realized profit/loss

#### Fields

* `id`
* `stock_id` (references stocks)
* `quantity`
* `sell_rate` (PKR per share)
* `total_proceeds` (auto-calculated)
* `realized_gain_loss` (auto-calculated via FIFO)
* `sell_date`
* `notes` (optional)
* `created_at`

#### Calculations

```
Total Proceeds = quantity × sellRate
Realized Gain/Loss = Total Proceeds − Cost of Sold Shares (FIFO)
```

---

### 5. Current Price Tracking (Manual)

Allows manual entry of current stock prices for unrealized P/L calculation.

#### Features

* Update current price for any stock
* Overwrite previous price
* Used only for unrealized gain/loss

#### Fields

* `id`
* `stock_id` (references stocks)
* `current_price` (PKR)
* `updated_at`

---

### 6. Dividend Tracking

Tracks dividend income per stock.

#### Features

* Add dividend entry
* Stock-wise dividend history
* Included in total portfolio returns

#### Fields

* `id`
* `stock_id` (references stocks)
* `dividend_amount` (PKR)
* `dividend_date`
* `notes` (optional)
* `created_at`

---

### 7. Capital Gain / Loss Calculation

#### Unrealized (Open Holdings)

```
Invested Amount = Σ(quantity × buyRate) − Σ(quantity × sellRate cost basis)
Current Value = Remaining Quantity × Current Price
Unrealized Gain/Loss = Current Value − Invested Amount
```

#### Realized (Sold Holdings)

```
Realized Gain/Loss = Σ(Sell Proceeds) − Σ(Cost of Sold Shares)
```

#### Dividend Impact

```
Total Returns = Realized P/L + Unrealized P/L + Dividends
```

---

### 8. Portfolio Dashboard

Single screen overview of all investments.

#### Wallet Summary

* Total Deposits
* Available Balance
* Total Invested (Historical)

#### Portfolio Summary

* Current Portfolio Value
* Unrealized Profit / Loss
* Realized Profit / Loss
* Total Dividends Earned

#### Stock Table Columns

* Stock Symbol
* Total Bought Qty
* Total Sold Qty
* Remaining Qty
* Avg Buy Price
* Current Price
* Invested Amount
* Current Value
* Gain/Loss (PKR)

---

### 9. Reports & History

#### Features

* Transaction history (deposits + purchases + sells + dividends)
* Stock-wise breakdown
* Date-wise filtering

---

## Data Export & Import (Backup)

### Features

* Export full data to JSON
* Import JSON to restore data
* All tables covered (Stocks, Deposits, Buys, Sells, Dividends, Prices)

### Rules

* Import overwrites existing data
* Validation before import
* Symbol-based mapping for portability

---

## Non-Functional Requirements

### Performance

* Fast load times (cloud-based PostgreSQL)
* No external market APIs

### Security

* Cloud data storage via Supabase
* Row Level Security (RLS) policies
* Service Role Key for admin operations

### Backup

* JSON export/import functionality
* Automatic Supabase backups

---

## Database Schema (High Level)

### Tables

* `deposits`
* `stocks`
* `stock_buy_transactions`
* `stock_sell_transactions`
* `dividends`
* `stock_prices`

---

## UI/UX Guidelines

* Minimal design
* Clean tables
* Clear profit/loss indicators
* Mobile responsive

---

## Assumptions

* FIFO method for sell cost calculation
* No broker commission
* Single user
* PKR only

---

## Future Enhancements (Out of Scope for Now)

* Charts & analytics
* Portfolio performance over time
* Multi-device sync (already supported via Supabase)
* Password protection
* Multi-currency support
* Real-time market data integration

---

## Open Questions

✔ All core requirements finalized

---

## Success Criteria

* Accurately tracks deposits and investments
* Correct gain/loss calculation
* Simple and fast to use
* No unnecessary complexity
* Data accessible from any device

---

**End of PRD**
