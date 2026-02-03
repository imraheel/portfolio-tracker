# Requirements Document - Investment Tracker Expansion
**Date:** 4 February 2026  
**Scope:** Add Mutual Funds and Crypto investment tracking capabilities

---

## 1. Overview

Expand the existing Personal Stock Investment Tracker to support three investment types:
1. **Stock PSX** (Pakistan Stock Exchange) - *Existing*
2. **Mutual Funds** - *New*
3. **Crypto** - *New*

---

## 2. Sidebar Restructuring

### Current Structure
```
- Dashboard
- Wallet
- Transactions
- Prices
- Reports
- Import / Export
```

### New Structure
```
- Dashboard
- Stocks (expandable section)
  -- Wallet
  -- Transactions
  -- Prices
  -- Reports
- Mutual Funds (expandable section)
  -- Funds List
  -- Purchases
  -- Withdrawals
- Crypto (expandable section)
  -- Crypto List
  -- Purchases
  -- Withdrawals
- Settings
  -- Import / Export
```

### Technical Requirements
- [ ] Update `src/components/Sidebar.tsx` with collapsible sections
- [ ] Use Lucide React icons for each section
- [ ] Implement accordion/collapsible behavior for sections
- [ ] Highlight active route within subsections
- [ ] Maintain current styling patterns (Tailwind CSS)

---

## 3. Database Schema Changes

### 3.1 Mutual Funds Tables

#### Table: `mutual_funds`
```sql
CREATE TABLE mutual_funds (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  current_market_value DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Table: `mutual_fund_purchases`
```sql
CREATE TABLE mutual_fund_purchases (
  id SERIAL PRIMARY KEY,
  fund_id INTEGER REFERENCES mutual_funds(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL, -- Amount in PKR
  purchase_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Table: `mutual_fund_withdrawals`
```sql
CREATE TABLE mutual_fund_withdrawals (
  id SERIAL PRIMARY KEY,
  fund_id INTEGER REFERENCES mutual_funds(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL, -- Amount in PKR
  withdrawal_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.2 Crypto Tables

#### Table: `cryptocurrencies`
```sql
CREATE TABLE cryptocurrencies (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(20) NOT NULL UNIQUE, -- e.g., BTC, ETH
  name VARCHAR(255) NOT NULL, -- e.g., Bitcoin, Ethereum
  current_total_value DECIMAL(15, 2) DEFAULT 0, -- Total value in PKR (manually updated)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Table: `crypto_purchases`
```sql
CREATE TABLE crypto_purchases (
  id SERIAL PRIMARY KEY,
  crypto_id INTEGER REFERENCES cryptocurrencies(id) ON DELETE CASCADE,
  amount_pkr DECIMAL(15, 2) NOT NULL, -- Purchase amount in PKR
  purchase_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Table: `crypto_withdrawals`
```sql
CREATE TABLE crypto_withdrawals (
  id SERIAL PRIMARY KEY,
  crypto_id INTEGER REFERENCES cryptocurrencies(id) ON DELETE CASCADE,
  amount_pkr DECIMAL(15, 2) NOT NULL, -- Withdrawal amount in PKR
  withdrawal_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tasks
- [ ] Create migration scripts for new tables
- [ ] Add foreign key constraints
- [ ] Set up indexes on frequently queried columns (fund_id, crypto_id, dates)
- [ ] Update `src/types/supabase.ts` with new TypeScript interfaces

---

## 4. Mutual Funds Module

### 4.1 Data Models (src/types/supabase.ts)

```typescript
export interface MutualFund {
  id: number;
  symbol: string;
  name: string;
  description: string | null;
  current_market_value: number;
  created_at: string;
}

export interface MutualFundPurchase {
  id: number;
  fund_id: number;
  amount: number;
  purchase_date: string;
  notes: string | null;
  created_at: string;
  fund?: { symbol: string; name: string };
}

export interface MutualFundWithdrawal {
  id: number;
  fund_id: number;
  amount: number;
  withdrawal_date: string;
  notes: string | null;
  created_at: string;
  fund?: { symbol: string; name: string };
}
```

### 4.2 Services (src/services/mutualFunds.ts)

#### Functions Required:
- [ ] `addMutualFund(data)` - Add new fund with symbol, name, description
- [ ] `getMutualFunds()` - List all funds with current market value
- [ ] `updateMarketValue(fundId, value)` - Update current market value manually
- [ ] `addPurchase(data)` - Record purchase transaction
- [ ] `getPurchases()` - Get all purchases with fund details
- [ ] `addWithdrawal(data)` - Record withdrawal transaction
- [ ] `getWithdrawals()` - Get all withdrawals with fund details
- [ ] `getFundMetrics(fundId)` - Calculate total invested, total withdrawn, net investment

#### Validation Schemas (Zod):
```typescript
const MutualFundSchema = z.object({
  symbol: z.string().min(1).max(20),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
});

const MarketValueSchema = z.object({
  fundId: z.number().int().positive(),
  currentValue: z.number().nonnegative(),
});

const PurchaseSchema = z.object({
  fundId: z.number().int().positive(),
  amount: z.number().positive(),
  purchaseDate: z.date(),
  notes: z.string().optional(),
});

const WithdrawalSchema = z.object({
  fundId: z.number().int().positive(),
  amount: z.number().positive(),
  withdrawalDate: z.date(),
  notes: z.string().optional(),
});
```

### 4.3 Custom Hook (src/hooks/useMutualFunds.ts)

```typescript
export function useMutualFunds() {
  // State: funds, purchases, withdrawals, loading, error
  // Functions: refresh, addFund, updateMarketValue, addPurchase, addWithdrawal
  // Derived: fundMetrics (total invested, withdrawn, current value, gain/loss)
}
```

### 4.4 Pages & Components

#### Page: Funds List (`src/pages/mutualFunds/FundsList.tsx`)
- [ ] Display table of all mutual funds
- [ ] Columns: Symbol, Name, Description, Current Market Value (editable)
- [ ] Form to add new fund
- [ ] Inline edit for market value

#### Components:
- [ ] `src/components/mutualFunds/FundForm.tsx` - Add new fund
- [ ] `src/components/mutualFunds/UpdateMarketValueForm.tsx` - Update current value
- [ ] `src/components/mutualFunds/PurchaseForm.tsx` - Record purchase
- [ ] `src/components/mutualFunds/WithdrawalForm.tsx` - Record withdrawal
- [ ] `src/components/mutualFunds/FundMetrics.tsx` - Display fund performance

#### Page: Purchases (`src/pages/mutualFunds/Purchases.tsx`)
- [ ] List all purchases with fund names
- [ ] Form to add new purchase
- [ ] Date filtering

#### Page: Withdrawals (`src/pages/mutualFunds/Withdrawals.tsx`)
- [ ] List all withdrawals with fund names
- [ ] Form to add new withdrawal
- [ ] Date filtering

---

## 5. Crypto Module

### 5.1 Data Models (src/types/supabase.ts)

```typescript
export interface Cryptocurrency {
  id: number;
  symbol: string;
  name: string;
  current_total_value: number; // Total portfolio value in PKR
  created_at: string;
}

export interface CryptoPurchase {
  id: number;
  crypto_id: number;
  amount_pkr: number; // Purchase amount in PKR
  purchase_date: string;
  notes: string | null;
  created_at: string;
  cryptocurrency?: { symbol: string; name: string };
}

export interface CryptoWithdrawal {
  id: number;
  crypto_id: number;
  amount_pkr: number; // Withdrawal amount in PKR
  withdrawal_date: string;
  notes: string | null;
  created_at: string;
  cryptocurrency?: { symbol: string; name: string };
}
```

### 5.2 Services (src/services/crypto.ts)

#### Functions Required:
- [ ] `addCryptocurrency(data)` - Add new crypto (BTC, ETH, etc.)
- [ ] `getCryptocurrencies()` - List all cryptos with current total value
- [ ] `updateTotalValue(cryptoId, value)` - Update total portfolio value manually
- [ ] `addPurchase(data)` - Record purchase (amount in PKR)
- [ ] `getPurchases()` - Get all purchases
- [ ] `addWithdrawal(data)` - Record withdrawal (amount in PKR)
- [ ] `getWithdrawals()` - Get all withdrawals
- [ ] `getCryptoMetrics(cryptoId)` - Calculate total invested, withdrawn, current value, gain/loss

#### Validation Schemas (Zod):
```typescript
const CryptocurrencySchema = z.object({
  symbol: z.string().min(1).max(20),
  name: z.string().min(1).max(255),
});

const TotalValueSchema = z.object({
  cryptoId: z.number().int().positive(),
  totalValue: z.number().nonnegative(),
});

const CryptoPurchaseSchema = z.object({
  cryptoId: z.number().int().positive(),
  amountPkr: z.number().positive(),
  purchaseDate: z.date(),
  notes: z.string().optional(),
});

const CryptoWithdrawalSchema = z.object({
  cryptoId: z.number().int().positive(),
  amountPkr: z.number().positive(),
  withdrawalDate: z.date(),
  notes: z.string().optional(),
});
```

### 5.3 Custom Hook (src/hooks/useCrypto.ts)

```typescript
export function useCrypto() {
  // State: cryptocurrencies, purchases, withdrawals, loading, error
  // Functions: refresh, addCryptocurrency, updateTotalValue, addPurchase, addWithdrawal
  // Derived: cryptoMetrics (total invested, withdrawn, current value, unrealized gain/loss)
}
```

### 5.4 Pages & Components

#### Page: Crypto List (`src/pages/crypto/CryptoList.tsx`)
- [ ] Display table of all cryptocurrencies
- [ ] Columns: Symbol, Name, Current Total Value (editable), Actions
- [ ] Form to add new cryptocurrency
- [ ] Inline edit for total value

#### Components:
- [ ] `src/components/crypto/CryptoForm.tsx` - Add new cryptocurrency
- [ ] `src/components/crypto/UpdateTotalValueForm.tsx` - Update total portfolio value
- [ ] `src/components/crypto/PurchaseForm.tsx` - Record PKR purchase
- [ ] `src/components/crypto/WithdrawalForm.tsx` - Record PKR withdrawal
- [ ] `src/components/crypto/CryptoMetrics.tsx` - Display crypto performance

#### Page: Purchases (`src/pages/crypto/Purchases.tsx`)
- [ ] List all crypto purchases
- [ ] Columns: Crypto, Amount (PKR), Date, Notes
- [ ] Form to add new purchase

#### Page: Withdrawals (`src/pages/crypto/Withdrawals.tsx`)
- [ ] List all crypto withdrawals
- [ ] Columns: Crypto, Amount (PKR), Date, Notes
- [ ] Form to add new withdrawal

---

## 6. Routing Updates

### 6.1 Update App.tsx

```typescript
// New routes to add:
<Route path="mutual-funds" element={<MutualFundsLayout />}>
  <Route index element={<FundsList />} />
  <Route path="purchases" element={<MutualFundPurchases />} />
  <Route path="withdrawals" element={<MutualFundWithdrawals />} />
</Route>

<Route path="crypto" element={<CryptoLayout />}>
  <Route index element={<CryptoList />} />
  <Route path="purchases" element={<CryptoPurchases />} />
  <Route path="withdrawals" element={<CryptoWithdrawals />} />
</Route>
```

### 6.2 Create Layout Components
- [ ] `src/components/mutualFunds/MutualFundsLayout.tsx` - Sub-navigation for mutual funds
- [ ] `src/components/crypto/CryptoLayout.tsx` - Sub-navigation for crypto

---

## 7. Dashboard Enhancements

### 7.1 Portfolio Overview Widget
- [ ] Total portfolio value across all three investment types
- [ ] Breakdown: Stocks | Mutual Funds | Crypto
- [ ] Asset allocation pie chart or percentage bars

### 7.2 Recent Activity Widget
- [ ] Recent transactions across all types
- [ ] Filter by investment type

### 7.3 Performance Summary
- [ ] Total invested vs current value
- [ ] Unrealized gains/losses by category

---

## 8. Data Export/Import Updates

### 8.1 Export Functionality
Update `src/services/data.ts`:
- [ ] Export mutual funds data
- [ ] Export mutual fund transactions (purchases/withdrawals)
- [ ] Export crypto data
- [ ] Export crypto transactions (purchases/withdrawals)
- [ ] Combined JSON/CSV export with all investment types

### 8.2 Import Functionality
- [ ] Import mutual funds from JSON/CSV
- [ ] Import crypto from JSON/CSV
- [ ] Validate imported data structure

---

## 9. Implementation Tasks (Priority Order)

### Phase 1: Foundation (Week 1)
1. [ ] Database migrations - Create all new tables
2. [ ] Update TypeScript interfaces in `src/types/supabase.ts`
3. [ ] Restructure Sidebar with collapsible sections
4. [ ] Update routing in App.tsx

### Phase 2: Mutual Funds (Week 2)
5. [ ] Create `src/services/mutualFunds.ts` with all CRUD operations
6. [ ] Create `src/hooks/useMutualFunds.ts`
7. [ ] Create Funds List page and components
8. [ ] Create Purchases page and components
9. [ ] Create Withdrawals page and components
10. [ ] Create Mutual Funds Layout with sub-navigation

### Phase 3: Crypto (Week 3)
11. [ ] Create `src/services/crypto.ts` with all CRUD operations
12. [ ] Create `src/hooks/useCrypto.ts`
13. [ ] Create Crypto List page and components
14. [ ] Create Purchases page and components
15. [ ] Create Withdrawals page and components
16. [ ] Create Crypto Layout with sub-navigation

### Phase 4: Integration (Week 4)
17. [ ] Update Dashboard with portfolio overview
18. [ ] Update Data Export/Import functionality
19. [ ] Add portfolio-wide reports
20. [ ] Testing and bug fixes
21. [ ] Run linting: `pnpm lint`
22. [ ] Build verification: `pnpm build`

---

## 10. UI/UX Guidelines

### 10.1 Consistency Requirements
- Follow existing Tailwind CSS patterns
- Use `clsx` for conditional classes
- Use existing `FormButton` component
- Maintain PKR currency formatting: `Rs. X,XXX.XX`
- Date format: DD-MM-YYYY

### 10.2 Color Coding
- Positive values (gains): Green
- Negative values (losses): Red
- Neutral: Gray

### 10.3 Icons (Lucide React)
- Dashboard: `LayoutDashboard`
- Stocks: `TrendingUp`
- Mutual Funds: `PieChart`
- Crypto: `Bitcoin` (or `Coins`)
- Wallet: `Wallet`
- Transactions: `ArrowUpCircle`
- Reports: `FileText`
- Settings: `Settings`
- Chevron for collapsible: `ChevronDown` / `ChevronRight`

---

## 11. Business Rules

### 11.1 Mutual Funds
- Manual market value updates only (no API integration)
- Purchases increase invested amount
- Withdrawals decrease invested amount
- Gain/Loss = Current Market Value - (Total Purchases - Total Withdrawals)

### 11.2 Crypto
- Manual total value updates only (no price APIs)
- All amounts stored in PKR
- Purchases recorded in PKR spent
- Withdrawals recorded in PKR received
- Gain/Loss = Current Total Value - (Total Purchases - Total Withdrawals)

### 11.3 Wallet Integration
- Mutual Fund purchases deduct from wallet balance
- Crypto purchases deduct from wallet balance
- Mutual Fund withdrawals add to wallet balance
- Crypto withdrawals add to wallet balance

---

## 12. Testing Checklist

### 12.1 Mutual Funds
- [ ] Add new fund with validation
- [ ] Update market value
- [ ] Record purchase transaction
- [ ] Record withdrawal transaction
- [ ] View purchase history
- [ ] View withdrawal history
- [ ] Calculate metrics correctly
- [ ] Wallet balance updates on transactions

### 12.2 Crypto
- [ ] Add new cryptocurrency
- [ ] Update total portfolio value
- [ ] Record purchase in PKR
- [ ] Record withdrawal in PKR
- [ ] View transaction history
- [ ] Calculate metrics correctly
- [ ] Wallet balance updates on transactions

### 12.3 Navigation
- [ ] Sidebar sections expand/collapse
- [ ] Active route highlighting works
- [ ] All routes accessible
- [ ] Mobile responsive (if applicable)

---

## 13. Future Enhancements (Out of Scope)

- Automatic price fetching for stocks via API
- Automatic NAV fetching for mutual funds
- Real-time crypto price tracking
- Charts and visualizations
- Historical performance graphs
- Dividend tracking for mutual funds
- Cost basis tracking for crypto (FIFO/LIFO)

---

## Appendix: File Structure

```
src/
├── components/
│   ├── Sidebar.tsx (updated)
│   ├── mutualFunds/
│   │   ├── FundForm.tsx
│   │   ├── UpdateMarketValueForm.tsx
│   │   ├── PurchaseForm.tsx
│   │   ├── WithdrawalForm.tsx
│   │   ├── FundMetrics.tsx
│   │   └── MutualFundsLayout.tsx
│   └── crypto/
│       ├── CryptoForm.tsx
│       ├── UpdateTotalValueForm.tsx
│       ├── PurchaseForm.tsx
│       ├── WithdrawalForm.tsx
│       ├── CryptoMetrics.tsx
│       └── CryptoLayout.tsx
├── hooks/
│   ├── useMutualFunds.ts
│   └── useCrypto.ts
├── pages/
│   ├── mutualFunds/
│   │   ├── FundsList.tsx
│   │   ├── Purchases.tsx
│   │   └── Withdrawals.tsx
│   └── crypto/
│       ├── CryptoList.tsx
│       ├── Purchases.tsx
│       └── Withdrawals.tsx
├── services/
│   ├── mutualFunds.ts
│   └── crypto.ts
└── types/
    └── supabase.ts (updated)
```

---

**End of Requirements Document**
