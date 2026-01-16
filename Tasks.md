# Project Tasks: Personal Stock Investment Tracker (PSIT)

## Phase 1: Project Initialization & Database Setup
- [x] **Initialize Next.js Project**
    - [x] Create new Next.js app (App Router, TypeScript).
    - [x] Install dependencies (Tailwind CSS, clsx, tailwind-merge, lucide-react).
    - [x] Set up directory structure (`/components`, `/lib`, `/actions`, `/types`).
- [x] **Database Configuration (Prisma & SQLite)**
    - [x] Install Prisma and initialize with SQLite.
    - [x] Define `schema.prisma`:
        - [x] `Deposit` model.
        - [x] `Stock` model.
        - [x] `StockTransaction` model (Type: BUY/SELL) or separate `BuyTransaction` / `SellTransaction` models.
        - [x] `Dividend` model.
        - [x] `StockPrice` model.
    - [x] Run initial migration (`npx prisma migrate dev`).
    - [x] Create a seed script (optional) for testing.

## Phase 2: Core Business Logic (Server Actions)
- [ ] **Wallet Service**
    - [x] `addDeposit`, `getDeposits`.
    - [x] `deleteDeposit`.
    - [x] `getWalletBalance`: Calculate (Total Deposits - Total Buys + Total Sells + Total Dividends).
- [x] **Stock Management**
    - [x] `addStock`: Add stock details.
    - [x] `updateStockPrice`: Manually update current price.
- [x] **Transaction Processing (The "Brain")**
    - [x] **Buy Logic**:
        - [x] Validate sufficient wallet balance.
        - [x] Record transaction.
    - [x] **Sell Logic (FIFO)**:
        - [x] Validate stock quantity availability.
        - [x] Implement FIFO algorithm to calculate Cost Basis from previous Buy records.
        - [x] Calculate Realized P/L.
        - [x] Record transaction.
    - [x] **Dividend Logic**:
        - [x] Record dividend payment.
- [x] **Portfolio Metrics**
    - [x] `getPortfolioSummary`: Aggregate total invested, current value, total P/L.
    - [x] `getStockPerformance`: Per-stock breakdown of holdings, avg price, unrealized P/L.

## Phase 3: Frontend - Core Components & Pages
- [x] **Layout & Navigation**
    - [x] Sidebar/Navbar with links: Dashboard, Wallet, Stocks, Transactions, Settings.
- [x] **Wallet Page**
    - [x] Display Current Balance & Total Deposited.
    - [x] Table of Deposits.
    - [x] "Add Funds" Modal/Form.
- [x] **Stock Master & Prices Page**
    - [x] List of monitored stocks.
    - [x] Quick edit for "Current Price".
    - [x] "Add Stock" Form.
- [x] **Transactions Page**
    - [x] Tabs for Buys, Sells, Dividends.
    - [x] **Buy Stock Form**: Dropdown for stock, inputs for Qty, Rate, Date.
    - [x] **Sell Stock Form**: Dropdown, inputs, show "Available Qty".
- [x] **Dashboard (Home)**
    - [x] **KPI Cards**: Balance, Invested, Current Value, P/L.
    - [x] **Holdings Table**: Detailed rows per stock with Green/Red P/L indicators.

- [x] **UI/UX Design Implementation**
    - [x] Refactor layout to Sidebar/Header structure.
    - [x] Implement two-section Dashboard (Wallet vs Portfolio).
    - [x] Add tabbed Reports page for transaction history.
    - [x] Align all numeric table data to the right.
    - [x] Enhance forms with context (balance, qty) and auto-calculations.
    - [x] Apply semantic coloring (Green/Red) consistently.

## Phase 4: Data Management & Polish
- [x] **Master Data Management**
    - [x] Implement Single Master Export (JSON-based text file).
    - [x] Implement Single Master Import (with full DB reset and ID re-mapping).
- [x] **UI Refinements**
    - [x] Empty states for tables.
    - [x] Loading states for server actions.
    - [x] Toast notifications for success/error.
    - [x] Form validation messages.

## Phase 5: Verification
- [x] **Manual Testing & Logic Verification**
    - [x] Verify Wallet Balance math (fixed string concatenation bug).
    - [x] Verify FIFO sell logic (sell partial lots, check remaining cost basis).
    - [x] Check CSV round-trip (Verified logic in actions).