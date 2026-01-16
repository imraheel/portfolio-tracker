# Product Requirement Document (PRD)

## Product Name

Personal Stock Investment Tracker (PSIT)

## Purpose & Vision

The purpose of this application is to provide a **simple, offline-first, personal-use investment tracking system** to manage stock 
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
* **Database**: SQLite (local)
* **ORM (suggested)**: Prisma or Drizzle ORM

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
* `depositDate`
* `note` (optional)
* `createdAt`

#### Calculations

* **Total Deposited** = Sum of all deposits

---

### 2. Stock Master (Optional but Recommended)

A reference table to avoid repeated symbol entry.

#### Fields

* `id`
* `symbol` (e.g., PSO, ENGRO)
* `companyName` (optional)
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
* `stockSymbol`
* `quantity`
* `buyRate` (PKR per share)
* `totalCost` (auto-calculated)
* `buyDate`
* `notes` (optional)
* `createdAt`

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
* `stockSymbol`
* `quantity`
* `sellRate` (PKR per share)
* `totalProceeds` (auto-calculated)
* `sellDate`
* `notes` (optional)
* `createdAt`

#### Calculations

```
Total Proceeds = quantity × sellRate
Realized Gain/Loss = Total Proceeds − Cost of Sold Shares
```

---

Tracks when and how stocks were bought.

#### Features

* Add stock purchase
* View all purchases
* Edit/Delete purchase

#### Fields

* `id`
* `stockSymbol`
* `quantity`
* `buyRate` (PKR per share)
* `totalCost` (auto-calculated)
* `buyDate`
* `notes` (optional)

#### Calculations

```
Total Cost = quantity × buyRate
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
* `stockSymbol`
* `currentPrice` (PKR)
* `updatedAt`

---

### 6. Dividend Tracking

Tracks dividend income per stock.

#### Features

* Add dividend entry
* Stock-wise dividend history
* Included in total portfolio returns

#### Fields

* `id`
* `stockSymbol`
* `dividendAmount` (PKR)
* `dividendDate`
* `notes` (optional)
* `createdAt`

---

Allows manual entry of current stock prices.

#### Features

* Update current price for any stock
* Overwrite previous price

#### Fields

* `id`
* `stockSymbol`
* `currentPrice` (PKR)
* `updatedAt`

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

Shows profit or loss per stock and overall portfolio.

#### Per Stock Calculations

```
Invested Amount = Σ(quantity × buyRate)
Current Value = Σ(quantity × currentPrice)
Capital Gain/Loss = Current Value − Invested Amount
Gain % = (Gain / Invested Amount) × 100
```

#### Features

* Gain/Loss per stock
* Total portfolio gain/loss
* Color indicators (Green = Profit, Red = Loss)

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
* Gain/Loss (PKR & %)

---

Single screen overview of all investments.

#### Widgets

* Total Deposits
* Total Invested Amount
* Current Portfolio Value
* Total Profit / Loss

#### Stock Table Columns

* Stock Symbol
* Quantity
* Avg Buy Price
* Current Price
* Invested Amount
* Current Value
* Gain/Loss (PKR & %)

---

### 7. Reports & History

#### Features

* Transaction history (deposits + purchases)
* Stock-wise breakdown
* Date-wise filtering

---

## Data Export & Import (Backup)

### Features

* Export full data to CSV
* Import CSV to restore data
* Separate CSV per table

### Tables Covered

* Deposits
* Stock Buys
* Stock Sells
* Dividends
* Stock Prices

### Rules

* Import overwrites existing data
* Validation before import

---

## Non-Functional Requirements

### Performance

* Instant load (local SQLite)
* No external APIs

### Security

* Local-only data storage
* No authentication required (Phase 1)

### Backup (Future Scope)

* Export database to JSON/CSV
* Manual backup option

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

### Tables

* `deposits`
* `stocks`
* `stock_purchases`
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

* No stock selling in Phase 1
* No dividend tracking initially
* No live market data

---

## Future Enhancements (Out of Scope for Now)

* Charts & analytics
* Portfolio performance over time
* Cloud backup
* Password protection

---

* Sell transactions
* Dividend income tracking
* Broker fees & taxes
* Charts & visual analytics
* Multi-currency support
* Cloud sync

---

## Open Questions

✔ All core requirements finalized

---

## Success Criteria

* Accurately tracks deposits and investments
* Correct gain/loss calculation
* Simple and fast to use
* No unnecessary complexity

---

**End of PRD**

