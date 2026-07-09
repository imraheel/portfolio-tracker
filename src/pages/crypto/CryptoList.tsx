import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, TrendingUp, DollarSign, Bitcoin } from 'lucide-react';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Modal } from '@/components/Modal';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { MetricCard } from '@/components/ui/MetricCard';
import { useCrypto } from '@/hooks/crypto/useCrypto';
import type { CryptoMetrics, Cryptocurrency } from '@/services/crypto/crypto';
import { CryptoForm } from '@/components/crypto/CryptoForm';
import { UpdateTotalValueForm } from '@/components/crypto/UpdateTotalValueForm';

const subNav = [
  { label: 'Holdings', value: '/crypto' },
  { label: 'Transactions', value: '/crypto/transactions' },
];

function formatPkr(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <AlertCircle className="w-12 h-12 text-[var(--accent-red)] mb-4" />
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">Failed to load crypto assets</h3>
      <p className="text-sm text-[var(--text-muted)]">{message}</p>
    </div>
  );
}

export default function CryptoList() {
  const navigate = useNavigate();
  const { cryptocurrencies, metrics, loading, error } = useCrypto();
  const [showModal, setShowModal] = useState(false);

  const totalValue = metrics.reduce((sum: number, m: CryptoMetrics) => sum + m.currentTotalValue, 0);
  const totalInvested = metrics.reduce((sum: number, m: CryptoMetrics) => sum + m.netInvestment, 0);
  const totalGainLoss = totalValue - totalInvested;
  const totalAssets = cryptocurrencies.length;

  if (error) {
    return (
      <div className="space-y-5">
        <SegmentedControl segments={subNav} value="/crypto" onChange={(v) => navigate(v)} />
        <ErrorState message={typeof error === 'string' ? error : error.message} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <SegmentedControl segments={subNav} value="/crypto" onChange={(v) => navigate(v)} />
        <button onClick={() => setShowModal(true)}
          className="h-[28px] px-3 rounded-[6px] bg-[var(--accent-blue)] text-white text-[12px] font-medium hover:bg-[var(--accent-blue-dark)] flex items-center gap-1.5">
          + Add Crypto
        </button>
      </div>

      <StatsGrid columns={3}>
        <MetricCard title="Total Assets" value={totalAssets.toString()} icon={<Bitcoin className="w-5 h-5" />} variant="blue" />
        <MetricCard title="Market Value" value={formatPkr(totalValue)} icon={<DollarSign className="w-5 h-5" />} variant="default" />
        <MetricCard title="Gain/Loss" value={formatPkr(Math.abs(totalGainLoss))}
          trend={{ value: totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0, label: 'vs invested' }}
          icon={<TrendingUp className="w-5 h-5" />} variant={totalGainLoss >= 0 ? 'green' : 'red'} />
      </StatsGrid>

      <div>
        <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-0.5">Holdings</h2>
        <p className="text-[12px] text-[var(--text-muted)] mb-3">Manage crypto assets and update values</p>
      </div>

      {loading ? (
        <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-5 animate-pulse"><div className="h-40 bg-[var(--bg-tertiary)] rounded" /></div>
      ) : (
        <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-[var(--text-secondary)]">Name</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-[var(--text-secondary)]">Symbol</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-[var(--text-secondary)]">Total Value</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-[var(--text-secondary)]">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {cryptocurrencies.map((crypto: Cryptocurrency) => (
                <tr key={crypto.name} className="hover:bg-[var(--bg-tertiary)]">
                  <td className="px-4 py-3"><span className="text-[13px] font-semibold text-[var(--text-primary)]">{crypto.name}</span></td>
                  <td className="px-4 py-3 text-[12px] text-[var(--text-secondary)]">{crypto.symbol || '-'}</td>
                  <td className="px-4 py-3 text-right text-[12px] font-medium text-[var(--text-primary)]">{formatPkr(crypto.current_total_value)}</td>
                  <td className="px-4 py-3 text-right"><UpdateTotalValueForm symbol={crypto.symbol || ''} currentValue={crypto.current_total_value.toString()} /></td>
                </tr>
              ))}
              {cryptocurrencies.length === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-[13px] text-[var(--text-muted)]">No crypto assets defined.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add New Crypto" width="sm">
        <CryptoForm onSuccess={() => setShowModal(false)} />
      </Modal>
    </div>
  );
}
