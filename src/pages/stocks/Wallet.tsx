import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Wallet as WalletIcon, PiggyBank, ArrowUpFromLine } from 'lucide-react';
import * as walletService from '@/services/stocks/wallet';
import { queryKeys } from '@/lib/queryKeys';
import { DepositForm } from '@/components/stocks/DepositForm';
import { WithdrawalForm } from '@/components/stocks/WithdrawalForm';
import { DeleteDepositButton } from '@/components/stocks/DeleteDepositButton';
import { DeleteWithdrawalButton } from '@/components/stocks/DeleteWithdrawalButton';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Modal } from '@/components/Modal';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { MetricCard } from '@/components/ui/MetricCard';
import type { Deposit, Withdrawal } from '@/services/stocks/wallet';

const subNav = [
  { label: 'Holdings', value: '/stocks' },
  { label: 'Wallet', value: '/stocks/wallet' },
  { label: 'Transactions', value: '/stocks/transactions' },
  { label: 'Reports', value: '/stocks/reports' },
];

function formatPkr(amount: number) {
  return amount.toLocaleString('en-PK', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <AlertCircle className="w-12 h-12 text-[var(--accent-red)] mb-4" />
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">Failed to load wallet</h3>
      <p className="text-sm text-[var(--text-muted)]">{message}</p>
    </div>
  );
}

export default function Wallet() {
  const navigate = useNavigate();
  const [modalType, setModalType] = useState<'deposit' | 'withdrawal' | null>(null);

  const { data: deposits = [], isLoading: depositsLoading, error: depositsError } = useQuery({
    queryKey: queryKeys.wallet.deposits(),
    queryFn: walletService.getDeposits,
    staleTime: 5 * 60 * 1000,
  });

  const { data: withdrawals = [], isLoading: withdrawalsLoading, error: withdrawalsError } = useQuery({
    queryKey: queryKeys.wallet.withdrawals(),
    queryFn: walletService.getWithdrawals,
    staleTime: 5 * 60 * 1000,
  });

  const { data: balance = 0, isLoading: balanceLoading, error: balanceError } = useQuery({
    queryKey: queryKeys.wallet.balance(),
    queryFn: walletService.getWalletBalance,
    staleTime: 30 * 1000,
  });

  const loading = depositsLoading || withdrawalsLoading || balanceLoading;
  const error = depositsError ?? withdrawalsError ?? balanceError;

  const totalDeposited = useMemo(() => deposits.reduce((sum, d) => sum + d.amount, 0), [deposits]);
  const totalWithdrawn = useMemo(() => withdrawals.reduce((sum, w) => sum + w.amount, 0), [withdrawals]);

  if (error) {
    return (
      <div className="space-y-5">
        <SegmentedControl segments={subNav} value="/stocks/wallet" onChange={(v) => navigate(v)} />
        <ErrorState message={typeof error === 'string' ? error : error.message} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <SegmentedControl segments={subNav} value="/stocks/wallet" onChange={(v) => navigate(v)} />
        <div className="flex gap-2">
          <button onClick={() => setModalType('deposit')}
            className="h-[28px] px-3 rounded-[6px] bg-[var(--accent-blue)] text-white text-[12px] font-medium hover:bg-[var(--accent-blue-dark)] flex items-center gap-1.5">
            + Deposit
          </button>
          <button onClick={() => setModalType('withdrawal')}
            className="h-[28px] px-3 rounded-[6px] border border-[var(--border-default)] text-[var(--text-secondary)] text-[12px] font-medium hover:bg-[var(--bg-tertiary)] flex items-center gap-1.5">
            + Withdraw
          </button>
        </div>
      </div>

      <StatsGrid columns={3}>
        <MetricCard title="Available Balance" value={loading ? '...' : `Rs. ${formatPkr(balance)}`} icon={<WalletIcon className="w-5 h-5" />} variant="blue" />
        <MetricCard title="Total Deposited" value={loading ? '...' : `Rs. ${formatPkr(totalDeposited)}`} icon={<PiggyBank className="w-5 h-5" />} variant="green" />
        <MetricCard title="Total Withdrawn" value={loading ? '...' : `Rs. ${formatPkr(totalWithdrawn)}`} icon={<ArrowUpFromLine className="w-5 h-5" />} variant="red" />
      </StatsGrid>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DepositsTable deposits={deposits} loading={loading} />
        <WithdrawalsTable withdrawals={withdrawals} loading={loading} />
      </div>

      <Modal open={modalType === 'deposit'} onClose={() => setModalType(null)} title="Make a Deposit" width="sm">
        <DepositForm onSuccess={() => setModalType(null)} />
      </Modal>
      <Modal open={modalType === 'withdrawal'} onClose={() => setModalType(null)} title="Make a Withdrawal" width="sm">
        <WithdrawalForm balance={balance} onSuccess={() => setModalType(null)} />
      </Modal>
    </div>
  );
}

function DepositsTable({ deposits, loading }: { deposits: Deposit[]; loading: boolean }) {
  if (loading) return <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-5 animate-pulse"><div className="h-40 bg-[var(--bg-tertiary)] rounded" /></div>;
  return (
    <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden">
      <div className="px-4 py-2.5 border-b border-[var(--border-subtle)] flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-[var(--text-primary)]">Deposits</h3>
        <span className="text-[11px] text-[var(--text-muted)]">{deposits.length} entries</span>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--border-subtle)]">
            <th className="px-4 py-2 text-left text-[11px] font-semibold text-[var(--text-secondary)]">Date</th>
            <th className="px-4 py-2 text-left text-[11px] font-semibold text-[var(--text-secondary)]">Note</th>
            <th className="px-4 py-2 text-right text-[11px] font-semibold text-[var(--text-secondary)]">Amount</th>
            <th className="px-4 py-2 text-right text-[11px] font-semibold text-[var(--text-secondary)]"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-subtle)]">
          {deposits.map((d) => (
            <tr key={d.id} className="hover:bg-[var(--bg-tertiary)]">
              <td className="px-4 py-2.5 text-[12px] text-[var(--text-secondary)]">{d.deposit_date ? new Date(d.deposit_date).toLocaleDateString('en-PK') : '-'}</td>
              <td className="px-4 py-2.5 text-[12px] text-[var(--text-muted)] italic">{d.note || '-'}</td>
              <td className="px-4 py-2.5 text-right text-[12px] font-medium text-[var(--accent-green)]">+Rs. {formatPkr(d.amount)}</td>
              <td className="px-4 py-2.5 text-right"><DeleteDepositButton id={d.id} /></td>
            </tr>
          ))}
          {deposits.length === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-[13px] text-[var(--text-muted)]">No deposits yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function WithdrawalsTable({ withdrawals, loading }: { withdrawals: Withdrawal[]; loading: boolean }) {
  if (loading) return <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-5 animate-pulse"><div className="h-40 bg-[var(--bg-tertiary)] rounded" /></div>;
  return (
    <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden">
      <div className="px-4 py-2.5 border-b border-[var(--border-subtle)] flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-[var(--text-primary)]">Withdrawals</h3>
        <span className="text-[11px] text-[var(--text-muted)]">{withdrawals.length} entries</span>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--border-subtle)]">
            <th className="px-4 py-2 text-left text-[11px] font-semibold text-[var(--text-secondary)]">Date</th>
            <th className="px-4 py-2 text-left text-[11px] font-semibold text-[var(--text-secondary)]">Note</th>
            <th className="px-4 py-2 text-right text-[11px] font-semibold text-[var(--text-secondary)]">Amount</th>
            <th className="px-4 py-2 text-right text-[11px] font-semibold text-[var(--text-secondary)]"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-subtle)]">
          {withdrawals.map((w) => (
            <tr key={w.id} className="hover:bg-[var(--bg-tertiary)]">
              <td className="px-4 py-2.5 text-[12px] text-[var(--text-secondary)]">{w.withdrawal_date ? new Date(w.withdrawal_date).toLocaleDateString('en-PK') : '-'}</td>
              <td className="px-4 py-2.5 text-[12px] text-[var(--text-muted)] italic">{w.note || '-'}</td>
              <td className="px-4 py-2.5 text-right text-[12px] font-medium text-[var(--accent-red)]">-Rs. {formatPkr(w.amount)}</td>
              <td className="px-4 py-2.5 text-right"><DeleteWithdrawalButton id={w.id} /></td>
            </tr>
          ))}
          {withdrawals.length === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-[13px] text-[var(--text-muted)]">No withdrawals yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
