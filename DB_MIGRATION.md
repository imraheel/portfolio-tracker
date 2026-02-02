# Database Migration Plan: SQLite → Supabase PostgreSQL

## Overview

This document outlines the migration from local SQLite (via Prisma) to Supabase PostgreSQL for the Personal Stock Investment Tracker application.

**Current State:**
- Database: SQLite via Prisma ORM
- Location: `prisma/dev.db` (local file)
- Schema: 6 tables (deposits, stocks, stock_buy_transactions, stock_sell_transactions, dividends, stock_prices)

**Target State:**
- Database: PostgreSQL hosted on Supabase
- Connection: Direct Supabase client (no ORM)
- Location: Cloud-hosted with real-time capabilities
- Approach: **Supabase Client-Only** (no Prisma)

---

## Pre-Migration Checklist

- [x] Supabase account created
- [x] Project created in Supabase
- [x] Environment variables added to `.env`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
  - `SUPABASE_SERVICE_ROLE_KEY` (for admin operations during import)
- [x] Database backup exported (existing `exportDataAsJson()` functionality)

---

## Migration Steps

### Phase 1: Setup & Dependencies

#### 1.1 Install Required Dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr
```

**Packages:**
- `@supabase/supabase-js`: Core Supabase client for database operations
- `@supabase/ssr`: Server-side rendering utilities for Next.js App Router

#### 1.2 Create Supabase Client Configuration

Create `lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

Create `lib/supabase/server.ts`:
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  )
}
```

Create `lib/supabase/middleware.ts`:
```typescript
import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

#### 1.3 Update Environment Variables

Update `.env` file:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Legacy SQLite (keep for rollback if needed)
DATABASE_URL="file:./dev.db"
```

---

### Phase 2: Database Schema Migration

#### 2.1 Create SQL Migration for Supabase

Execute this SQL in Supabase SQL Editor:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables matching Prisma schema
CREATE TABLE deposits (
  id SERIAL PRIMARY KEY,
  amount DECIMAL(15, 4) NOT NULL,
  deposit_date TIMESTAMP WITH TIME ZONE NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stocks (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(10) UNIQUE NOT NULL,
  company_name TEXT,
  sector TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stock_buy_transactions (
  id SERIAL PRIMARY KEY,
  stock_id INTEGER NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  buy_rate DECIMAL(15, 4) NOT NULL,
  total_cost DECIMAL(15, 4) NOT NULL,
  buy_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stock_sell_transactions (
  id SERIAL PRIMARY KEY,
  stock_id INTEGER NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  sell_rate DECIMAL(15, 4) NOT NULL,
  total_proceeds DECIMAL(15, 4) NOT NULL,
  realized_gain_loss DECIMAL(15, 4) NOT NULL,
  sell_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dividends (
  id SERIAL PRIMARY KEY,
  stock_id INTEGER NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
  dividend_amount DECIMAL(15, 4) NOT NULL,
  dividend_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stock_prices (
  id SERIAL PRIMARY KEY,
  stock_id INTEGER UNIQUE NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
  current_price DECIMAL(15, 4) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_deposits_date ON deposits(deposit_date);
CREATE INDEX idx_buy_transactions_stock ON stock_buy_transactions(stock_id);
CREATE INDEX idx_buy_transactions_date ON stock_buy_transactions(buy_date);
CREATE INDEX idx_sell_transactions_stock ON stock_sell_transactions(stock_id);
CREATE INDEX idx_sell_transactions_date ON stock_sell_transactions(sell_date);
CREATE INDEX idx_dividends_stock ON dividends(stock_id);
CREATE INDEX idx_dividends_date ON dividends(dividend_date);

-- Enable Row Level Security (RLS)
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_buy_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_sell_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dividends ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_prices ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all operations for authenticated users)
CREATE POLICY "Allow all operations on deposits" ON deposits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on stocks" ON stocks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on buy transactions" ON stock_buy_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on sell transactions" ON stock_sell_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on dividends" ON dividends FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on stock prices" ON stock_prices FOR ALL USING (true) WITH CHECK (true);
```

---

### Phase 3: Update Server Actions

All server actions will be updated to use Supabase client directly instead of Prisma.

**Files to modify:**
1. `app/actions/data.ts` - Export/Import functions
2. `app/actions/stocks.ts` - Stock CRUD operations
3. `app/actions/transactions.ts` - Buy/Sell/Dividend operations
4. `app/actions/wallet.ts` - Deposit operations
5. `app/actions/portfolio.ts` - Portfolio metrics

**Migration Pattern:**
Replace Prisma calls with Supabase queries:

```typescript
// Before (Prisma)
const stocks = await prisma.stock.findMany({
  orderBy: { symbol: 'asc' }
});

// After (Supabase)
const supabase = await createClient();
const { data: stocks, error } = await supabase
  .from('stocks')
  .select('*')
  .order('symbol', { ascending: true });

if (error) throw error;
```

**Key Changes:**
- Import `createClient` from `@/lib/supabase/server`
- Use `supabase.from('table_name')` for queries
- Handle errors explicitly
- Use snake_case for column names (PostgreSQL convention)
- Handle Decimal types as strings then convert to numbers

---

### Phase 4: Data Migration (Import)

#### 4.1 Import Existing Data

The `importDataFromJson()` function will be updated to work with Supabase:

1. Clear existing data using Supabase `delete()` with service role key
2. Insert stocks first to get new IDs
3. Map old symbols to new IDs
4. Insert related data with correct foreign keys
5. Use batch inserts for efficiency

**Key Changes:**
- Use service role key for admin operations (bypasses RLS)
- Handle foreign key relationships manually
- Batch inserts using `supabase.from('table').insert([...])`
- Convert Decimal values to strings for PostgreSQL

---

### Phase 5: Testing & Validation

#### 5.1 Test Checklist

- [ ] All stocks CRUD operations work
- [ ] Buy transactions with wallet validation
- [ ] Sell transactions with FIFO calculation
- [ ] Dividend recording
- [ ] Deposit management
- [ ] Portfolio metrics calculation
- [ ] Export data functionality
- [ ] Import data functionality (critical for migration)
- [ ] Real-time updates (if implemented)

#### 5.2 Validation Queries

Run these to verify data integrity:
```sql
-- Check stock count
SELECT COUNT(*) FROM stocks;

-- Check transaction totals
SELECT 
  (SELECT COUNT(*) FROM stock_buy_transactions) as buys,
  (SELECT COUNT(*) FROM stock_sell_transactions) as sells,
  (SELECT COUNT(*) FROM dividends) as dividends,
  (SELECT COUNT(*) FROM deposits) as deposits;

-- Verify referential integrity
SELECT * FROM stock_buy_transactions 
WHERE stock_id NOT IN (SELECT id FROM stocks);
```

---

## Implementation Files Checklist

### New Files to Create:
- [ ] `lib/supabase/client.ts` - Browser client
- [ ] `lib/supabase/server.ts` - Server client
- [ ] `lib/supabase/middleware.ts` - Session middleware
- [ ] `types/supabase.ts` - TypeScript types for database tables

### Files to Modify:
- [ ] `.env` - Add Supabase credentials
- [ ] `package.json` - Add Supabase dependencies
- [ ] `app/actions/data.ts` - Update import/export for Supabase
- [ ] `app/actions/stocks.ts` - Update CRUD operations
- [ ] `app/actions/transactions.ts` - Update transaction operations
- [ ] `app/actions/wallet.ts` - Update wallet operations
- [ ] `app/actions/portfolio.ts` - Update portfolio calculations

### Files to Remove (Optional):
- [ ] `lib/prisma.ts` - Prisma client (keep for rollback)
- [ ] `prisma/schema.prisma` - Prisma schema (keep for rollback)
- [ ] `prisma/dev.db` - SQLite database (backup first)

---

## Rollback Plan

If issues occur:

1. **Immediate:** Switch back to Prisma/SQLite by reverting server actions
2. **Data:** Re-import from backup using existing SQLite database
3. **Code:** Revert to Prisma-only implementation

---

## Post-Migration Benefits

1. **Cloud Access:** Access data from any device
2. **Real-time:** Potential for real-time updates
3. **Scalability:** No local storage limitations
4. **Backup:** Automatic Supabase backups
5. **Security:** Row Level Security policies
6. **Collaboration:** Multi-user support potential
7. **Simpler Code:** No ORM abstraction layer

---

## Questions for User

1. **Authentication:** Do you want to add user authentication later? (Currently using open RLS policies)
2. **Real-time:** Do you want real-time updates when data changes?
3. **Multi-user:** Will multiple users access this data?
4. **Offline mode:** Do you need offline functionality with sync?
5. **Service Role Key:** Do you have the `SUPABASE_SERVICE_ROLE_KEY` for admin operations?

---

## Migration Commands Summary

```bash
# 1. Install dependencies
npm install @supabase/supabase-js @supabase/ssr

# 2. Run SQL migration in Supabase dashboard
# (Copy SQL from Phase 2.1 into SQL Editor)

# 3. Update environment variables
# (Add Supabase keys to .env)

# 4. Test the application
npm run dev

# 5. Import existing data
# Use the Import feature in Settings page
```

---

## Estimated Timeline

- **Phase 1 (Setup):** 30 minutes
- **Phase 2 (Schema):** 30 minutes
- **Phase 3 (Server Actions):** 2-3 hours
- **Phase 4 (Testing):** 1 hour
- **Total:** ~4-5 hours

---

**Last Updated:** 2026-02-02
**Migration Lead:** AI Assistant
**Status:** Planning Complete - Ready for Implementation
**Approach:** Supabase Client-Only (No Prisma)
