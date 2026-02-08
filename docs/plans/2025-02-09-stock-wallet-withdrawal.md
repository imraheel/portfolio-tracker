# Stock Wallet Withdrawal & Investment History Update Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add withdrawal functionality to stock wallet with database storage, and update Investment History chart to show total deposits minus withdrawals for stock investment value.

**Architecture:** 
- Create new `withdrawals` table in Supabase following existing pattern (similar to `mutual_fund_withdrawals` and `crypto_withdrawals`)
- Extend wallet service with withdrawal CRUD operations
- Update `getWalletBalance` to subtract withdrawals from total
- Create WithdrawalForm and DeleteWithdrawalButton components
- Modify InvestmentHistory service to track deposits/withdrawals instead of buy/sell for stocks
- Update Wallet page to display withdrawals history

**Tech Stack:** React 18 + TypeScript + Vite + Supabase + Tailwind CSS + Zod validation

---

## Task 1: Create Supabase Migration for Withdrawals Table

**Files:**
- Create: `supabase/migrations/20250209000001_create_withdrawals_table.sql`

**Step 1: Write SQL migration**

```sql
-- Create withdrawals table for stock wallet
CREATE TABLE IF NOT EXISTS withdrawals (
  id SERIAL PRIMARY KEY,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  withdrawal_date DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for date-based queries
CREATE INDEX idx_withdrawals_date ON withdrawals(withdrawal_date DESC);

-- Add RLS policies (if RLS is enabled)
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users
CREATE POLICY "Enable all operations for authenticated users" ON withdrawals
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow all operations for anon users (for development)
CREATE POLICY "Enable all operations for anon users" ON withdrawals
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);
```

**Step 2: Run migration manually in Supabase SQL Editor**

Log into Supabase Dashboard > SQL Editor > New Query > Paste SQL > Run

**Step 3: Verify table creation**

Run in Supabase SQL Editor:
```sql
SELECT * FROM withdrawals LIMIT 1;
```

Expected: Empty result (table exists but no data)

---

## Task 2: Extend Wallet Service with Withdrawal Functions

**Files:**
- Modify: `src/services/stocks/wallet.ts`

**Step 1: Add Withdrawal interface and schema**

Add after line 16 (after Deposit interface):

```typescript
export interface Withdrawal {
  id: number;
  amount: number;
  withdrawal_date: string;
  note: string | null;
  created_at: string;
}

const WithdrawalSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  withdrawalDate: z.date(),
  note: z.string().optional(),
});
```

**Step 2: Add withdrawal service functions**

Add after `getDeposits` function (around line 83):

```typescript
export async function addWithdrawal(data: { amount: number; withdrawalDate: Date; note?: string }) {
  const validatedFields = WithdrawalSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to add withdrawal. Please check the fields.',
    };
  }

  const { amount, withdrawalDate, note } = validatedFields.data;

  // Check if sufficient balance exists
  try {
    const currentBalance = await getWalletBalance();
    if (amount > currentBalance) {
      return {
        success: false,
        message: `Insufficient wallet balance. Available: Rs. ${currentBalance.toLocaleString('en-PK')}`,
      };
    }

    const { error } = await supabase
      .from('withdrawals')
      .insert({
        amount,
        withdrawal_date: withdrawalDate.toISOString(),
        note,
      });

    if (error) throw error;

    return { success: true, message: 'Successfully added withdrawal.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to add withdrawal.' };
  }
}

export async function deleteWithdrawal(id: number) {
  try {
    const { error } = await supabase
      .from('withdrawals')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { success: true, message: 'Deleted withdrawal.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to delete withdrawal.' };
  }
}

export async function getWithdrawals(): Promise<Withdrawal[]> {
  try {
    const { data: withdrawals, error } = await supabase
      .from('withdrawals')
      .select('*')
      .order('withdrawal_date', { ascending: false });

    if (error) throw error;

    // Transform decimal amounts to numbers
    return (withdrawals || []).map(w => ({
      ...w,
      amount: Number(w.amount),
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch withdrawals.');
  }
}
```

**Step 3: Update getWalletBalance to include withdrawals**

Replace the existing `getWalletBalance` function (lines 85-122) with:

```typescript
export async function getWalletBalance(): Promise<number> {
  try {
    // Get total deposits
    const { data: depositsData } = await supabase
      .from('deposits')
      .select('amount');
    
    const totalDeposits = (depositsData || []).reduce((sum, d) => sum + Number(d.amount), 0);

    // Get total withdrawals
    const { data: withdrawalsData } = await supabase
      .from('withdrawals')
      .select('amount');
    
    const totalWithdrawals = (withdrawalsData || []).reduce((sum, w) => sum + Number(w.amount), 0);

    // Get total buy costs
    const { data: buysData } = await supabase
      .from('stock_buy_transactions')
      .select('total_cost');
    
    const totalBuys = (buysData || []).reduce((sum, t) => sum + Number(t.total_cost), 0);

    // Get total sell proceeds
    const { data: sellsData } = await supabase
      .from('stock_sell_transactions')
      .select('total_proceeds');
    
    const totalSells = (sellsData || []).reduce((sum, t) => sum + Number(t.total_proceeds), 0);

    // Get total dividends
    const { data: dividendsData } = await supabase
      .from('dividends')
      .select('dividend_amount');
    
    const totalDividends = (dividendsData || []).reduce((sum, d) => sum + Number(d.dividend_amount), 0);

    // Calculate balance: Deposits - Withdrawals - Buys + Sells + Dividends
    const balance = totalDeposits - totalWithdrawals - totalBuys + totalSells + totalDividends;
    
    return balance;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch wallet balance.');
  }
}
```

**Step 4: Verify no TypeScript errors**

Run: `pnpm lint`

Expected: No errors

---

## Task 3: Create WithdrawalForm Component

**Files:**
- Create: `src/components/stocks/WithdrawalForm.tsx`

**Step 1: Write component**

```typescript
import { useState } from 'react';
import { toast } from 'sonner';
import { FormButton } from '@/components/FormButton';
import { useWallet } from '@/hooks/stocks/useWallet';

export function WithdrawalForm() {
  const { addWithdrawal, balance } = useWallet();
  const [amount, setAmount] = useState('');
  const [withdrawalDate, setWithdrawalDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    const withdrawalAmount = parseFloat(amount);

    // Client-side validation for sufficient balance
    if (withdrawalAmount > balance) {
      toast.error(`Insufficient balance. Available: Rs. ${balance.toLocaleString('en-PK')}`);
      setSubmitting(false);
      return;
    }

    const result = await addWithdrawal({
      amount: withdrawalAmount,
      withdrawalDate: new Date(withdrawalDate),
      note: note || undefined,
    });

    setSubmitting(false);

    if (result.success) {
      toast.success(result.message);
      setAmount('');
      setNote('');
      setWithdrawalDate(new Date().toISOString().split('T')[0]);
    } else {
      toast.error(result.message);
      if (result.errors) {
        setErrors(result.errors);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg bg-[var(--bg-secondary)] p-6 shadow-md border border-[var(--border-subtle)] shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-[var(--accent-coral)]">●</span>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Withdraw Funds</h2>
      </div>
      <div className="mb-4 p-3 bg-[var(--bg-tertiary)] rounded-md">
        <p className="text-xs text-[var(--text-muted)]">
          Available Balance: <span className="font-mono font-medium text-[var(--text-primary)]">Rs. {balance.toLocaleString('en-PK')}</span>
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="withdrawal-amount" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Amount (PKR)</label>
          <input
            type="number"
            id="withdrawal-amount"
            name="amount"
            required
            step="0.01"
            max={balance}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text-primary)] shadow-sm focus:border-[var(--accent-coral)] focus:ring-[var(--accent-coral)] sm:text-sm"
          />
          {errors.amount && (
            <p className="mt-1 text-xs text-red-400 font-bold">{errors.amount[0]}</p>
          )}
        </div>
        <div>
          <label htmlFor="withdrawal-date" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Withdrawal Date</label>
          <input
            type="date"
            id="withdrawal-date"
            name="withdrawalDate"
            required
            value={withdrawalDate}
            onChange={(e) => setWithdrawalDate(e.target.value)}
            className="mt-1 block w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text-primary)] shadow-sm focus:border-[var(--accent-coral)] focus:ring-[var(--accent-coral)] sm:text-sm"
          />
        </div>
      </div>
      <div className="mt-6">
        <label htmlFor="withdrawal-note" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Note (Optional)</label>
        <textarea
          id="withdrawal-note"
          name="note"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mt-1 block w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text-primary)] shadow-sm focus:border-[var(--accent-coral)] focus:ring-[var(--accent-coral)] sm:text-sm"
        />
      </div>
      <div className="mt-6">
        <FormButton label="Withdraw Funds" disabled={submitting || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > balance} className="btn-coral" />
      </div>
    </form>
  );
}
```

**Step 2: Verify lint passes**

Run: `pnpm lint`

Expected: No errors

---

## Task 4: Create DeleteWithdrawalButton Component

**Files:**
- Create: `src/components/stocks/DeleteWithdrawalButton.tsx`

**Step 1: Write component**

```typescript
import { toast } from 'sonner';
import { useWallet } from '@/hooks/stocks/useWallet';

export function DeleteWithdrawalButton({ id }: { id: number }) {
  const { deleteWithdrawal } = useWallet();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this withdrawal?')) {
      return;
    }

    const result = await deleteWithdrawal(id);

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <button 
      type="button" 
      onClick={handleDelete}
      className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
    >
      Delete
    </button>
  );
}
```

**Step 2: Verify lint passes**

Run: `pnpm lint`

Expected: No errors

---

## Task 5: Update useWallet Hook

**Files:**
- Modify: `src/hooks/stocks/useWallet.ts`

**Step 1: Import Withdrawal type**

Replace line 3:
```typescript
import type { Deposit, Withdrawal } from '@/services/stocks/wallet';
```

**Step 2: Add withdrawals state and functions**

Replace the entire file content with:

```typescript
import { useState, useEffect, useCallback } from 'react';
import * as walletService from '@/services/stocks/wallet';
import type { Deposit, Withdrawal } from '@/services/stocks/wallet';

export function useWallet() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeposits = useCallback(async () => {
    try {
      setLoading(true);
      const data = await walletService.getDeposits();
      setDeposits(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch deposits');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWithdrawals = useCallback(async () => {
    try {
      const data = await walletService.getWithdrawals();
      setWithdrawals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch withdrawals');
    }
  }, []);

  const fetchBalance = useCallback(async () => {
    try {
      const bal = await walletService.getWalletBalance();
      setBalance(bal);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balance');
    }
  }, []);

  const addDeposit = useCallback(async (data: { amount: number; depositDate: Date; note?: string }) => {
    const result = await walletService.addDeposit(data);
    if (result.success) {
      await fetchDeposits();
      await fetchBalance();
    }
    return result;
  }, [fetchDeposits, fetchBalance]);

  const deleteDeposit = useCallback(async (id: number) => {
    const result = await walletService.deleteDeposit(id);
    if (result.success) {
      await fetchDeposits();
      await fetchBalance();
    }
    return result;
  }, [fetchDeposits, fetchBalance]);

  const addWithdrawal = useCallback(async (data: { amount: number; withdrawalDate: Date; note?: string }) => {
    const result = await walletService.addWithdrawal(data);
    if (result.success) {
      await fetchWithdrawals();
      await fetchBalance();
    }
    return result;
  }, [fetchWithdrawals, fetchBalance]);

  const deleteWithdrawal = useCallback(async (id: number) => {
    const result = await walletService.deleteWithdrawal(id);
    if (result.success) {
      await fetchWithdrawals();
      await fetchBalance();
    }
    return result;
  }, [fetchWithdrawals, fetchBalance]);

  useEffect(() => {
    fetchDeposits();
    fetchWithdrawals();
    fetchBalance();
  }, [fetchDeposits, fetchWithdrawals, fetchBalance]);

  const totalDeposited = deposits.reduce((sum, d) => sum + d.amount, 0);
  const totalWithdrawn = withdrawals.reduce((sum, w) => sum + w.amount, 0);

  return {
    deposits,
    withdrawals,
    balance,
    totalDeposited,
    totalWithdrawn,
    netDeposits: totalDeposited - totalWithdrawn,
    loading,
    error,
    refresh: async () => {
      await fetchDeposits();
      await fetchWithdrawals();
      await fetchBalance();
    },
    addDeposit,
    deleteDeposit,
    addWithdrawal,
    deleteWithdrawal,
  };
}
```

**Step 3: Verify lint passes**

Run: `pnpm lint`

Expected: No errors

---

## Task 6: Update Wallet Page

**Files:**
- Modify: `src/pages/stocks/Wallet.tsx`

**Step 1: Import new components**

Replace imports with:
```typescript
import { motion } from 'framer-motion';
import { useWallet } from '@/hooks/stocks/useWallet';
import { DepositForm } from '@/components/stocks/DepositForm';
import { WithdrawalForm } from '@/components/stocks/WithdrawalForm';
import { DeleteDepositButton } from '@/components/stocks/DeleteDepositButton';
import { DeleteWithdrawalButton } from '@/components/stocks/DeleteWithdrawalButton';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Wallet as WalletIcon, PiggyBank, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
```

**Step 2: Add WithdrawalsTable component**

Add after the DepositsTable function (before the Wallet export):

```typescript
function WithdrawalsTable() {
  const { withdrawals, loading } = useWallet();

  if (loading) {
    return (
      <section className="mt-10">
        <div className="animate-pulse">
          <div className="h-64 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-subtle)]"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-10">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)]"
      >
        {/* Table Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <ArrowUpFromLine className="w-4 h-4 text-[var(--accent-coral)]" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-coral)]">
              Withdrawals
            </span>
          </div>
          <span className="text-xs text-[var(--text-muted)]">
            {withdrawals.length} transactions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                <th className="px-6 py-3 text-left text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">
                  Note
                </th>
                <th className="px-6 py-3 text-right text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {withdrawals.map((withdrawal, i) => (
                <motion.tr 
                  key={withdrawal.id}
                  custom={i}
                  variants={tableRowVariants}
                  initial="hidden"
                  animate="visible"
                  className="hover:bg-[var(--bg-elevated)]/30 transition-colors"
                >
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-[var(--text-secondary)]">
                    {withdrawal.withdrawal_date ? new Intl.DateTimeFormat('en-PK').format(new Date(withdrawal.withdrawal_date)) : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-muted)] italic">{withdrawal.note || '-'}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-mono font-medium text-[var(--accent-coral)]">
                    -Rs. {formatPkr(withdrawal.amount)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <DeleteWithdrawalButton id={withdrawal.id} />
                  </td>
                </motion.tr>
              ))}
              {withdrawals.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-[var(--text-muted)]">
                    No withdrawal records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </section>
  );
}
```

**Step 3: Update Wallet component to use new hook data**

Replace the Wallet component (lines 128-197) with:

```typescript
export default function Wallet() {
  const { balance, totalDeposited, totalWithdrawn, netDeposits, loading } = useWallet();

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto"
    >
      <PageHeader
        title="Deposits & Wallet"
        description="Manage your investment capital and available funds."
        breadcrumbs={[{ label: 'Stocks' }, { label: 'Wallet' }]}
      />

      {/* Balance Cards */}
      <motion.div 
        variants={itemVariants}
        className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <Card hover variant="default">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <WalletIcon className="w-4 h-4 text-[var(--accent-gold)]" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-gold)]">
                  Available
                </span>
              </div>
              <h3 className="text-xs text-[var(--text-muted)] mb-1">Available Balance</h3>
              <p className="text-2xl font-mono font-semibold text-[var(--text-primary)]">
                {loading ? '...' : `Rs. ${formatPkr(balance)}`}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-gold)]/10 flex items-center justify-center">
              <WalletIcon className="w-5 h-5 text-[var(--accent-gold)]" />
            </div>
          </div>
        </Card>

        <Card hover variant="default">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <PiggyBank className="w-4 h-4 text-[var(--accent-sage)]" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-sage)]">
                  Total In
                </span>
              </div>
              <h3 className="text-xs text-[var(--text-muted)] mb-1">Total Deposited</h3>
              <p className="text-2xl font-mono font-semibold text-[var(--text-primary)]">
                {loading ? '...' : `Rs. ${formatPkr(totalDeposited)}`}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-sage)]/10 flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-[var(--accent-sage)]" />
            </div>
          </div>
        </Card>

        <Card hover variant="default">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpFromLine className="w-4 h-4 text-[var(--accent-coral)]" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-coral)]">
                  Total Out
                </span>
              </div>
              <h3 className="text-xs text-[var(--text-muted)] mb-1">Total Withdrawn</h3>
              <p className="text-2xl font-mono font-semibold text-[var(--text-primary)]">
                {loading ? '...' : `Rs. ${formatPkr(totalWithdrawn)}`}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-coral)]/10 flex items-center justify-center">
              <ArrowUpFromLine className="w-5 h-5 text-[var(--accent-coral)]" />
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div variants={itemVariants}>
          <DepositForm />
        </motion.div>

        <motion.div variants={itemVariants}>
          <WithdrawalForm />
        </motion.div>
      </div>

      <DepositsTable />
      <WithdrawalsTable />
    </motion.div>
  );
}
```

**Step 4: Verify lint passes**

Run: `pnpm lint`

Expected: No errors

---

## Task 7: Update Investment History Service

**Files:**
- Modify: `src/services/investmentHistory.ts`

**Step 1: Update InvestmentHistoryPoint interface**

The user wants stock investment to show deposits minus withdrawals instead of buy/sell transactions. Update the interface and logic.

Replace the entire file content:

```typescript
import { supabase } from '@/lib/supabase/client';

export interface InvestmentHistoryPoint {
  date: string;
  stocksInvestment: number;
  mutualFundsInvestment: number;
  cryptoInvestment: number;
}

interface Deposit {
  amount: number | string;
  deposit_date: string;
}

interface Withdrawal {
  amount: number | string;
  withdrawal_date: string;
}

interface MutualFundPurchase {
  amount: number | string;
  purchase_date: string;
}

interface MutualFundWithdrawal {
  amount: number | string;
  withdrawal_date: string;
}

interface CryptoPurchase {
  amount_pkr: number | string;
  purchase_date: string;
}

interface CryptoWithdrawal {
  amount_pkr: number | string;
  withdrawal_date: string;
}

async function fetchAllData() {
  const [
    { data: deposits, error: depositsError },
    { data: withdrawals, error: withdrawalsError },
    { data: fundPurchases, error: fundPurchasesError },
    { data: fundWithdrawals, error: fundWithdrawalsError },
    { data: cryptoPurchases, error: cryptoPurchasesError },
    { data: cryptoWithdrawals, error: cryptoWithdrawalsError },
  ] = await Promise.all([
    supabase.from('deposits').select('amount, deposit_date').order('deposit_date'),
    supabase.from('withdrawals').select('amount, withdrawal_date').order('withdrawal_date'),
    supabase.from('mutual_fund_purchases').select('amount, purchase_date').order('purchase_date'),
    supabase.from('mutual_fund_withdrawals').select('amount, withdrawal_date').order('withdrawal_date'),
    supabase.from('crypto_purchases').select('amount_pkr, purchase_date').order('purchase_date'),
    supabase.from('crypto_withdrawals').select('amount_pkr, withdrawal_date').order('withdrawal_date'),
  ]);

  if (depositsError || withdrawalsError || fundPurchasesError || fundWithdrawalsError ||
      cryptoPurchasesError || cryptoWithdrawalsError) {
    throw new Error('Failed to fetch investment history data');
  }

  return {
    deposits: deposits || [],
    withdrawals: withdrawals || [],
    fundPurchases: fundPurchases || [],
    fundWithdrawals: fundWithdrawals || [],
    cryptoPurchases: cryptoPurchases || [],
    cryptoWithdrawals: cryptoWithdrawals || [],
  };
}

function getDateKey(dateStr: string): string {
  return new Date(dateStr).toISOString().split('T')[0];
}

export async function getInvestmentHistory(days: number = 365): Promise<InvestmentHistoryPoint[]> {
  const data = await fetchAllData();

  const events: {
    date: string;
    stocks: number;
    mutualFunds: number;
    crypto: number;
  }[] = [];

  // Stocks: Deposits increase investment
  data.deposits.forEach((d: Deposit) => {
    events.push({
      date: getDateKey(d.deposit_date),
      stocks: Number(d.amount),
      mutualFunds: 0,
      crypto: 0,
    });
  });

  // Stocks: Withdrawals decrease investment
  data.withdrawals.forEach((w: Withdrawal) => {
    events.push({
      date: getDateKey(w.withdrawal_date),
      stocks: -Number(w.amount),
      mutualFunds: 0,
      crypto: 0,
    });
  });

  data.fundPurchases.forEach((p: MutualFundPurchase) => {
    events.push({
      date: getDateKey(p.purchase_date),
      stocks: 0,
      mutualFunds: Number(p.amount),
      crypto: 0,
    });
  });

  data.fundWithdrawals.forEach((w: MutualFundWithdrawal) => {
    events.push({
      date: getDateKey(w.withdrawal_date),
      stocks: 0,
      mutualFunds: -Number(w.amount),
      crypto: 0,
    });
  });

  data.cryptoPurchases.forEach((p: CryptoPurchase) => {
    events.push({
      date: getDateKey(p.purchase_date),
      stocks: 0,
      mutualFunds: 0,
      crypto: Number(p.amount_pkr),
    });
  });

  data.cryptoWithdrawals.forEach((w: CryptoWithdrawal) => {
    events.push({
      date: getDateKey(w.withdrawal_date),
      stocks: 0,
      mutualFunds: 0,
      crypto: -Number(w.amount_pkr),
    });
  });

  const sortedEvents = events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const dateMap = new Map<string, {
    stocks: number;
    mutualFunds: number;
    crypto: number;
  }>();

  let cumulativeStocks = 0;
  let cumulativeMutualFunds = 0;
  let cumulativeCrypto = 0;

  for (const event of sortedEvents) {
    cumulativeStocks += event.stocks;
    cumulativeMutualFunds += event.mutualFunds;
    cumulativeCrypto += event.crypto;

    const existing = dateMap.get(event.date);
    if (existing) {
      existing.stocks = cumulativeStocks;
      existing.mutualFunds = cumulativeMutualFunds;
      existing.crypto = cumulativeCrypto;
    } else {
      dateMap.set(event.date, {
        stocks: cumulativeStocks,
        mutualFunds: cumulativeMutualFunds,
        crypto: cumulativeCrypto,
      });
    }
  }

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - days);

  const history: InvestmentHistoryPoint[] = [];
  const currentDate = new Date(startDate);
  let lastStocks = 0;
  let lastMutualFunds = 0;
  let lastCrypto = 0;

  while (currentDate <= today) {
    const dateKey = currentDate.toISOString().split('T')[0];
    const dayData = dateMap.get(dateKey);

    if (dayData) {
      lastStocks = dayData.stocks;
      lastMutualFunds = dayData.mutualFunds;
      lastCrypto = dayData.crypto;
      history.push({
        date: dateKey,
        stocksInvestment: lastStocks,
        mutualFundsInvestment: lastMutualFunds,
        cryptoInvestment: lastCrypto,
      });
    } else {
      history.push({
        date: dateKey,
        stocksInvestment: lastStocks,
        mutualFundsInvestment: lastMutualFunds,
        cryptoInvestment: lastCrypto,
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return history;
}
```

**Step 2: Verify lint passes**

Run: `pnpm lint`

Expected: No errors

---

## Task 8: Update NetInvestmentChart Legend Label

**Files:**
- Modify: `src/components/dashboard/NetInvestmentChart.tsx`

**Step 1: Update the legend formatter to be clearer**

The chart currently shows "Stocks" but it's now showing deposits minus withdrawals, not actual stock holdings. Let's update the label to be clearer.

Replace lines 183-190 with:

```typescript
<Legend
  wrapperStyle={{ paddingTop: 20 }}
  formatter={(value) => {
    const labelMap: Record<string, string> = {
      stocksInvestment: 'Stock Wallet (Deposits - Withdrawals)',
      mutualFundsInvestment: 'Mutual Funds',
      cryptoInvestment: 'Crypto',
    };
    return (
      <span className="text-xs text-[var(--text-secondary)]">
        {labelMap[value] || value.replace(/([A-Z])/g, ' $1').trim()}
      </span>
    );
  }}
/>
```

**Step 2: Update chart title/description**

Replace lines 127-137 with:

```typescript
<div>
  <div className="flex items-center gap-2 mb-1">
    <TrendingUp className="w-4 h-4 text-[var(--accent-gold)]" />
    <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-gold)]">
      Timeline
    </span>
  </div>
  <h3 className="font-display text-xl text-[var(--text-primary)]">Investment History</h3>
  <p className="text-sm text-[var(--text-muted)] mt-1">
    Stock wallet shows deposits minus withdrawals. Mutual funds and crypto show net investments.
  </p>
</div>
```

**Step 3: Verify lint passes**

Run: `pnpm lint`

Expected: No errors

---

## Task 9: Final Testing

**Step 1: Run build to verify everything compiles**

Run: `pnpm build`

Expected: Build completes successfully with no errors

**Step 2: Start dev server and test manually**

Run: `pnpm dev`

Test scenarios:
1. Navigate to Stocks > Wallet
2. Verify three balance cards show (Available, Total Deposited, Total Withdrawn)
3. Add a deposit
4. Verify Available Balance updates
5. Add a withdrawal (must be less than or equal to available balance)
6. Verify error shows if withdrawal exceeds balance
7. Verify Total Withdrawn card updates
8. Navigate to Dashboard
9. Verify Investment History chart shows correct stock wallet value (deposits - withdrawals)
10. Delete a withdrawal and verify balance updates

**Step 3: Commit all changes**

```bash
git add -A
git commit -m "feat: add withdrawal functionality to stock wallet and update investment history chart

- Create withdrawals table in Supabase with proper indexes and RLS policies
- Add withdrawal CRUD operations to wallet service
- Update wallet balance calculation to include withdrawals
- Create WithdrawalForm and DeleteWithdrawalButton components
- Update useWallet hook to manage withdrawals
- Update Wallet page to show withdrawal history and forms side-by-side
- Modify InvestmentHistory service to track deposits/withdrawals for stocks
- Update chart labels to clarify stock wallet represents deposits minus withdrawals

Closes #[issue-number]"
```

---

## Summary

**Database Changes:**
- New `withdrawals` table with columns: id, amount, withdrawal_date, note, created_at
- Index on withdrawal_date for efficient queries
- RLS policies for authenticated and anon users

**Service Changes:**
- Extended `src/services/stocks/wallet.ts` with withdrawal functions
- Updated `getWalletBalance()` to subtract withdrawals
- Modified `src/services/investmentHistory.ts` to use deposits/withdrawals for stock investment tracking

**UI Changes:**
- New `WithdrawalForm` component (similar to DepositForm)
- New `DeleteWithdrawalButton` component
- Updated `useWallet` hook with withdrawal state and functions
- Updated `Wallet` page with:
  - Three balance cards (Available, Total Deposited, Total Withdrawn)
  - Side-by-side deposit and withdrawal forms
  - Separate tables for deposits and withdrawals
- Updated `NetInvestmentChart` with clearer labels

**Business Logic:**
- Wallet Balance = Deposits - Withdrawals - Buys + Sells + Dividends
- Investment History: Stock value = Deposits - Withdrawals (not buy/sell based)
- Withdrawal validation prevents exceeding available balance

**Testing Checklist:**
- [ ] SQL migration runs successfully
- [ ] TypeScript compilation passes
- [ ] Lint passes with no errors
- [ ] Build completes successfully
- [ ] Manual testing confirms all features work
