import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { AlertCircle, ShoppingCart, ArrowDownCircle, TrendingUp } from 'lucide-react';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Modal } from '@/components/Modal';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { MetricCard } from '@/components/ui/MetricCard';
import * as mutualFundsService from '@/services/mutualFunds/mutualFunds';
import { queryKeys } from '@/lib/queryKeys';
import { PurchaseForm } from '@/components/mutualFunds/PurchaseForm';
import { WithdrawalForm } from '@/components/mutualFunds/WithdrawalForm';
import type { MutualFundPurchase, MutualFundWithdrawal } from '@/services/mutualFunds/mutualFunds';

const subNav = [
  { label: 'Holdings', value: '/mutual-funds' },
  { label: 'Transactions', value: '/mutual-funds/transactions' },
  { label: 'Reports', value: '/mutual-funds/reports' },
];

function formatPkr(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function TableHeader({ cols }: { cols: { label: string; align?: 'left' | 'right' }[] }) {
  return (
    <thead>
      <tr className="border-b border-[var(--border-subtle)]">
        {cols.map((col, i) => (
          <th key={i} className={clsx("px-4 py-2 text-[11px] font-semibold text-[var(--text-secondary)]", col.align === 'right' ? "text-right" : "text-left")}>{col.label}</th>
        ))}
      </tr>
    </thead>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <AlertCircle className="w-12 h-12 text-[var(--accent-red)] mb-4" />
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">Failed to load fund transactions</h3>
      <p className="text-sm text-[var(--text-muted)]">{message}</p>
    </div>
  );
}

export default function MfTransactions() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentView = searchParams.get('view') === 'withdrawals' ? 'withdrawals' : 'invest';
  const [modalType, setModalType] = useState<'invest' | 'withdrawal' | null>(null);

  const { data: funds = [], isLoading: listLoading, error: listError } = useQuery({
    queryKey: queryKeys.mutualFunds.list(),
    queryFn: mutualFundsService.getMutualFunds,
    staleTime: 10 * 60 * 1000,
  });

  const { data: purchases = [], isLoading: purchasesLoading, error: purchasesError } = useQuery({
    queryKey: queryKeys.mutualFunds.purchases(),
    queryFn: mutualFundsService.getPurchases,
    staleTime: 5 * 60 * 1000,
  });

  const { data: withdrawals = [], isLoading: withdrawalsLoading, error: withdrawalsError } = useQuery({
    queryKey: queryKeys.mutualFunds.withdrawals(),
    queryFn: mutualFundsService.getWithdrawals,
    staleTime: 5 * 60 * 1000,
  });

  const loading = listLoading || purchasesLoading || withdrawalsLoading;
  const error = listError ?? purchasesError ?? withdrawalsError;

  const totalInvested = purchases.reduce((sum, p) => sum + p.amount, 0);
  const totalWithdrawn = withdrawals.reduce((sum, w) => sum + w.amount, 0);

  if (error) {
    return (
      <div className="space-y-5">
        <SegmentedControl segments={subNav} value="/mutual-funds/transactions" onChange={(v) => navigate(v)} />
        <ErrorState message={typeof error === 'string' ? error : error.message} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <SegmentedControl segments={subNav} value="/mutual-funds/transactions" onChange={(v) => navigate(v)} />

      <StatsGrid columns={3}>
        <MetricCard title="Total Invested" value={formatPkr(totalInvested)} icon={<ShoppingCart className="w-5 h-5" />} variant="default" />
        <MetricCard title="Total Withdrawn" value={formatPkr(totalWithdrawn)} icon={<ArrowDownCircle className="w-5 h-5" />} variant="green" />
        <MetricCard title="Active Funds" value={funds.length.toString()} icon={<TrendingUp className="w-5 h-5" />} variant="blue" />
      </StatsGrid>

      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-[var(--bg-tertiary)] p-0.5 rounded-lg">
          <button onClick={() => setSearchParams({ view: 'invest' })}
            className={clsx("px-3.5 py-1.5 rounded-[7px] text-[12px] font-medium transition-none", currentView === 'invest' ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]')}>Invest</button>
          <button onClick={() => setSearchParams({ view: 'withdrawals' })}
            className={clsx("px-3.5 py-1.5 rounded-[7px] text-[12px] font-medium transition-none", currentView === 'withdrawals' ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]')}>Withdrawals</button>
        </div>
        <div className="flex gap-2">
          {currentView === 'invest' && (
            <button onClick={() => setModalType('invest')}
              className="h-[28px] px-3 rounded-[6px] bg-[var(--accent-blue)] text-white text-[12px] font-medium hover:bg-[var(--accent-blue-dark)] flex items-center gap-1.5">+ Invest</button>
          )}
          {currentView === 'withdrawals' && (
            <button onClick={() => setModalType('withdrawal')}
              className="h-[28px] px-3 rounded-[6px] bg-[var(--accent-blue)] text-white text-[12px] font-medium hover:bg-[var(--accent-blue-dark)] flex items-center gap-1.5">+ Withdraw</button>
          )}
        </div>
      </div>

      {currentView === 'invest' && <PurchasesTable purchases={purchases} loading={loading} />}
      {currentView === 'withdrawals' && <WithdrawalsTable withdrawals={withdrawals} loading={loading} />}

      <Modal open={modalType === 'invest'} onClose={() => setModalType(null)} title="Invest in Fund" width="sm">
        <PurchaseForm funds={funds} onSuccess={() => setModalType(null)} />
      </Modal>
      <Modal open={modalType === 'withdrawal'} onClose={() => setModalType(null)} title="Withdraw from Fund" width="sm">
        <WithdrawalForm funds={funds} onSuccess={() => setModalType(null)} />
      </Modal>
    </div>
  );
}

function PurchasesTable({ purchases, loading }: { purchases: MutualFundPurchase[]; loading: boolean }) {
  if (loading) return <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-5 animate-pulse"><div className="h-40 bg-[var(--bg-tertiary)] rounded" /></div>;
  return (
    <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden">
      <table className="w-full">
        <TableHeader cols={[{ label: 'Date' }, { label: 'Fund' }, { label: 'Amount', align: 'right' }, { label: 'Notes' }]} />
        <tbody className="divide-y divide-[var(--border-subtle)]">
          {purchases.map((purchase: MutualFundPurchase) => (
            <tr key={purchase.id} className="hover:bg-[var(--bg-tertiary)]">
              <td className="px-4 py-2.5 text-[12px] text-[var(--text-secondary)]">{new Date(purchase.purchase_date).toLocaleDateString('en-PK')}</td>
              <td className="px-4 py-2.5">
                <span className="text-[12px] font-semibold text-[var(--text-primary)]">{purchase.fund?.symbol}</span>
                <span className="ml-1.5 text-[12px] text-[var(--text-muted)]">{purchase.fund?.name}</span>
              </td>
              <td className="px-4 py-2.5 text-right text-[12px] font-medium text-[var(--accent-red)]">{formatPkr(purchase.amount)}</td>
              <td className="px-4 py-2.5 text-[12px] text-[var(--text-muted)]">{purchase.notes || '-'}</td>
            </tr>
          ))}
          {purchases.length === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-[13px] text-[var(--text-muted)]">No purchases recorded.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function WithdrawalsTable({ withdrawals, loading }: { withdrawals: MutualFundWithdrawal[]; loading: boolean }) {
  if (loading) return <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-5 animate-pulse"><div className="h-40 bg-[var(--bg-tertiary)] rounded" /></div>;
  return (
    <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden">
      <table className="w-full">
        <TableHeader cols={[{ label: 'Date' }, { label: 'Fund' }, { label: 'Amount', align: 'right' }, { label: 'Notes' }]} />
        <tbody className="divide-y divide-[var(--border-subtle)]">
          {withdrawals.map((w: MutualFundWithdrawal) => (
            <tr key={w.id} className="hover:bg-[var(--bg-tertiary)]">
              <td className="px-4 py-2.5 text-[12px] text-[var(--text-secondary)]">{new Date(w.withdrawal_date).toLocaleDateString('en-PK')}</td>
              <td className="px-4 py-2.5">
                <span className="text-[12px] font-semibold text-[var(--text-primary)]">{w.fund?.symbol}</span>
                <span className="ml-1.5 text-[12px] text-[var(--text-muted)]">{w.fund?.name}</span>
              </td>
              <td className="px-4 py-2.5 text-right text-[12px] font-medium text-[var(--accent-green)]">{formatPkr(w.amount)}</td>
              <td className="px-4 py-2.5 text-[12px] text-[var(--text-muted)]">{w.notes || '-'}</td>
            </tr>
          ))}
          {withdrawals.length === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-[13px] text-[var(--text-muted)]">No withdrawals recorded.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
