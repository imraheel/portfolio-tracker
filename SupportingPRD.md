# Supporting Product Requirement Documents (PRDs)

This document complements the main PRD and defines **detailed specifications, rules, and structures** required to build the 
application correctly without ambiguity.

---

## 1. Database Design PRD

### 1.1 Entity Relationship Overview

**Entities**

* Deposits
* Stocks
* Stock Buy Transactions
* Stock Sell Transactions
* Dividends
* Stock Prices

**Relationships**

* One Stock → Many Buy Transactions
* One Stock → Many Sell Transactions
* One Stock → Many Dividends
* One Stock → One Current Price

---

### 1.2 Table Definitions

#### Deposits

Tracks wallet funding.

Fields:

* id (PK)
* amount (PKR, decimal)
* depositDate (date)
* note (text, nullable)
* createdAt (timestamp)

---

#### Stocks

Master reference table.

Fields:

* id (PK)
* symbol (unique)
* companyName (nullable)
* sector (nullable)
* createdAt

---

#### Stock Buy Transactions

Tracks all buy-side trades.

Fields:

* id (PK)
* stockId (FK)
* quantity (integer)
* buyRate (decimal)
* totalCost (decimal)
* buyDate (date)
* notes (nullable)
* createdAt

---

#### Stock Sell Transactions

Tracks all sell-side trades.

Fields:

* id (PK)
* stockId (FK)
* quantity (integer)
* sellRate (decimal)
* totalProceeds (decimal)
* sellDate (date)
* notes (nullable)
* createdAt

---

#### Dividends

Tracks dividend income.

Fields:

* id (PK)
* stockId (FK)
* dividendAmount (decimal)
* dividendDate (date)
* notes (nullable)
* createdAt

---

#### Stock Prices

Stores latest manual price per stock.

Fields:

* id (PK)
* stockId (FK, unique)
* currentPrice (decimal)
* updatedAt

---

## 2. Business Rules & Calculation PRD

### 2.1 Wallet Balance Rules

```
Wallet Balance = Total Deposits
                 − Total Buy Costs
                 + Total Sell Proceeds
                 + Total Dividends
```

Rules:

* Buy transaction **must fail** if wallet balance is insufficient
* Sell and dividend entries **increase wallet balance automatically**

---

### 2.2 FIFO Cost Basis (Mandatory)

Sell transactions must follow **First-In-First-Out** logic.

Rules:

* Oldest buy transactions are consumed first
* Partial consumption allowed
* Remaining quantity per buy lot must be tracked implicitly

---

### 2.3 Gain / Loss Definitions

#### Unrealized Gain/Loss

```
Remaining Quantity × (Current Price − Avg Buy Price)
```

#### Realized Gain/Loss

```
Sell Proceeds − FIFO Cost of Sold Shares
```

#### Total Returns

```
Realized P/L + Unrealized P/L + Dividends
```

---

## 3. Portfolio & Dashboard PRD

### 3.1 Dashboard Sections

#### Wallet Summary

* Total Deposits
* Available Balance
* Total Invested (Historical)

#### Portfolio Summary

* Current Portfolio Value
* Unrealized P/L
* Realized P/L
* Total Dividends Earned

---

### 3.2 Stock-Level Metrics

For each stock:

* Total Bought Quantity
* Total Sold Quantity
* Remaining Quantity
* Average Buy Price
* Current Price
* Invested Amount
* Current Value
* Unrealized Gain/Loss
* Realized Gain/Loss
* Dividends Received

---

## 4. User Flow PRD

### 4.1 Deposit Flow

1. Enter deposit amount
2. Select date
3. Save
4. Wallet balance updates

---

### 4.2 Buy Stock Flow

1. Select or add stock symbol
2. Enter quantity & buy rate
3. Validate wallet balance
4. Save transaction
5. Wallet balance decreases

---

### 4.3 Sell Stock Flow

1. Select stock
2. Enter sell quantity & rate
3. Validate available quantity
4. Apply FIFO logic
5. Save transaction
6. Wallet balance increases

---

### 4.4 Dividend Entry Flow

1. Select stock
2. Enter dividend amount
3. Save
4. Wallet balance increases

---

### 4.5 Price Update Flow

1. Select stock
2. Enter current price
3. Save
4. Unrealized P/L recalculated

---

## 5. CSV Import / Export PRD

### 5.1 Export Rules

* One CSV per table
* UTF-8 encoding
* Header row mandatory

---

### 5.2 Import Rules

* Import replaces all existing data
* Validation before commit
* Transaction rollback on error

---

### 5.3 Required CSV Columns

Each CSV must match database fields exactly.

Example (Stock Buy CSV):

* stockSymbol
* quantity
* buyRate
* buyDate
* notes

---

## 6. Error Handling PRD

### Validation Errors

* Insufficient wallet balance
* Selling more than available quantity
* Negative values not allowed
* Invalid dates

---

## 7. Non-Functional PRD

* Offline-first
* Single-user only
* No authentication
* Local SQLite only
* Fast load (<100ms typical)

---

## 8. Phase Scope Definition

### Phase 1 (Current)

* Full portfolio tracking
* Buy / Sell / Dividend
* CSV backup

### Phase 2 (Optional)

* Charts
* Performance timeline
* Visual analytics

---

**End of Supporting PRDs**

