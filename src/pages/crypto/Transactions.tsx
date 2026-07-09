import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { clsx } from 'clsx';
import { AlertCircle, ShoppingCart, ArrowDownCircle, TrendingUp } from 'lucide-react';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Modal } from '@/components/Modal';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { MetricCard } from '@/components/ui/MetricCard';
import { useCrypto } from '@/hooks/crypto/useCrypto';
import { PurchaseForm } from '@/components/crypto/PurchaseForm';
import { WithdrawalForm } from '@/components/crypto/WithdrawalForm';
import type { CryptoPurchase, CryptoWithdrawal } from '@/services/crypto/crypto';

const subNav = [
  { label: 'Holdings', value: '/crypto' },
  { label: 'Transactions', value: '/crypto/transactions' },
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
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">Failed to load crypto transactions</h3>
      <p className="text-sm text-[var(--text-muted)]">{message}</p>
    </div>
  );
}

export default function CryptoTransactions() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentView = searchParams.get('view') === 'withdrawals' ? 'withdrawals' : 'invest';
  const [modalType, setModalType] = useState<'invest' | 'withdrawal' | null>(null);

  const { purchases, withdrawals, cryptocurrencies, loading, error } = useCrypto();
  const totalInvested = purchases.reduce((sum, p) => sum + p.amount_pkr, 0);
  const totalWithdrawn = withdrawals.reduce((sum, w) => sum + w.amount_pkr, 0);

  if (error) {
    return (
      <div className="space-y-5">
        <SegmentedControl segments={subNav} value="/crypto/transactions" onChange={(v) => navigate(v)} />
        <ErrorState message={typeof error === 'string' ? error : error.message} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <SegmentedControl segments={subNav} value="/crypto/transactions" onChange={(v) => navigate(v)} />

      <StatsGrid columns={3}>
        <MetricCard title="Total Invested" value={formatPkr(totalInvested)} icon={<ShoppingCart className="w-5 h-5" />} variant="default" />
        <MetricCard title="Total Withdrawn" value={formatPkr(totalWithdrawn)} icon={<ArrowDownCircle className="w-5 h-5" />} variant="green" />
        <MetricCard title="Active Assets" value={cryptocurrencies.length.toString()} icon={<TrendingUp className="w-5 h-5" />} variant="blue" />
      </StatsGrid>

      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-[var(--bg-tertiary)] p-0.5 rounded-lg">
          <button
            onClick={() => setSearchParams({ view: 'invest' })}
            className={clsx("px-3.5 py-1.5 rounded-[7px] text-[12px] font-medium transition-none", currentView === 'invest' ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]')}
          >Invest
          </button>
          <button
            onClick={() => setSearchParams({ view: 'withdrawals' })}
            className={clsx("px-3.5 py-1.5 rounded-[7px] text-[12px] font-medium transition-none", currentView === 'withdrawals' ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]')}
          >Withdrawals
          </button>
        </div>
        <div className="flex gap-2">
          {currentView === 'invest' && (
            <button onClick={() => setModalType('invest')}
              className="h-[28px] px-3 rounded-[6px] bg-[var(--accent-blue)] text-white text-[12px] font-medium hover:bg-[var(--accent-blue-dark)] flex items-center gap-1.5">+ Buy</button>
          )}
          {currentView === 'withdrawals' && (
            <button onClick={() => setModalType('withdrawal')}
              className="h-[28px] px-3 rounded-[6px] bg-[var(--accent-blue)] text-white text-[12px] font-medium hover:bg-[var(--accent-blue-dark)] flex items-center gap-1.5">+ Sell</button>
          )}
        </div>
      </div>

      {currentView === 'invest' && <PurchasesTable purchases={purchases} loading={loading} />}
      {currentView === 'withdrawals' && <WithdrawalsTable withdrawals={withdrawals} loading={loading} />}

      <Modal open={modalType === 'invest'} onClose={() => setModalType(null)} title="Buy Crypto" width="sm">
        <PurchaseForm cryptocurrencies={cryptocurrencies} onSuccess={() => setModalType(null)} />
      </Modal>
      <Modal open={modalType === 'withdrawal'} onClose={() => setModalType(null)} title="Sell Crypto" width="sm">
        <WithdrawalForm cryptocurrencies={cryptocurrencies} onSuccess={() => setModalType(null)} />
      </Modal>
    </div>
  );
}

function PurchasesTable({ purchases, loading }: { purchases: CryptoPurchase[]; loading: boolean }) {
  if (loading) return <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-5 animate-pulse"><div className="h-40 bg-[var(--bg-tertiary)] rounded" /></div>;
  return (
    <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden">
      <table className="w-full">
        <TableHeader cols={[{ label: 'Date' }, { label: 'Crypto' }, { label: 'Amount', align: 'right' }, { label: 'Notes' }]} />
        <tbody className="divide-y divide-[var(--border-subtle)]">
          {purchases.map((p: CryptoPurchase) => (
            <tr key={p.id} className="hover:bg-[var(--bg-tertiary)]">
              <td className="px-4 py-2.5 text-[12px] text-[var(--text-secondary)]">{new Date(p.purchase_date).toLocaleDateString('en-PK')}</td>
              <td className="px-4 py-2.5">
                <span className="text-[12px] font-semibold text-[var(--text-primary)]">{p.cryptocurrency?.symbol}</span>
                <span className="ml-1.5 text-[12px] text-[var(--text-muted)]">{p.cryptocurrency?.name}</span>
              </td>
              <td className="px-4 py-2.5 text-right text-[12px] font-medium text-[var(--accent-red)]">{formatPkr(p.amount_pkr)}</td>
              <td className="px-4 py-2.5 text-[12px] text-[var(--text-muted)]">{p.notes || '-'}</td>
            </tr>
          ))}
          {purchases.length === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-[13px] text-[var(--text-muted)]">No purchases recorded.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function WithdrawalsTable({ withdrawals, loading }: { withdrawals: CryptoWithdrawal[]; loading: boolean }) {
  if (loading) return <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-5 animate-pulse"><div className="h-40 bg-[var(--bg-tertiary)] rounded" /></div>;
  return (
    <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden">
      <table className="w-full">
        <TableHeader cols={[{ label: 'Date' }, { label: 'Crypto' }, { label: 'Amount', align: 'right' }, { label: 'Notes' }]} />
        <tbody className="divide-y divide-[var(--border-subtle)]">
          {withdrawals.map((w: CryptoWithdrawal) => (
            <tr key={w.id} className="hover:bg-[var(--bg-tertiary)]">
              <td className="px-4 py-2.5 text-[12px] text-[var(--text-secondary)]">{new Date(w.withdrawal_date).toLocaleDateString('en-PK')}</td>
              <td className="px-4 py-2.5">
                <span className="text-[12px] font-semibold text-[var(--text-primary)]">{w.cryptocurrency?.symbol}</span>
                <span className="ml-1.5 text-[12px] text-[var(--text-muted)]">{w.cryptocurrency?.name}</span>
              </td>
              <td className="px-4 py-2.5 text-right text-[12px] font-medium text-[var(--accent-green)]">{formatPkr(w.amount_pkr)}</td>
              <td className="px-4 py-2.5 text-[12px] text-[var(--text-muted)]">{w.notes || '-'}</td>
            </tr>
          ))}
          {withdrawals.length === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-[13px] text-[var(--text-muted)]">No withdrawals recorded.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
