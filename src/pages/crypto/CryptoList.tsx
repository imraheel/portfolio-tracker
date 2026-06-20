import { TrendingUp, DollarSign, PieChart, Wallet, Coins, Bitcoin } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { MetricCard } from '@/components/ui/MetricCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useCrypto } from '@/hooks/crypto/useCrypto';
import type { CryptoMetrics, Cryptocurrency } from '@/services/crypto/crypto';
import { CryptoForm } from '@/components/crypto/CryptoForm';
import { UpdateTotalValueForm } from '@/components/crypto/UpdateTotalValueForm';

function formatPkr(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface CryptoTableProps {
  cryptocurrencies: Cryptocurrency[];
  metrics: CryptoMetrics[];
  loading: boolean;
}

function CryptoTable({ cryptocurrencies, metrics, loading }: CryptoTableProps) {
  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getMetricsForCrypto = (symbol: string) => {
    return metrics.find((m) => m.symbol === symbol);
  };

  if (loading) {
    return (
      <Card className="bg-[var(--bg-tertiary)]">
        <div className="h-64 bg-[var(--bg-tertiary)] rounded" />
      </Card>
    );
  }

  return (
    <Card hover={false}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Coins className="w-4 h-4 text-[var(--accent-gold)]" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-gold)]">
              Assets
            </span>
          </div>
          <h3 className="font-display text-xl text-[var(--text-primary)]">Cryptocurrencies List</h3>
          <p className="text-sm text-[var(--text-muted)] mt-1">Your cryptocurrency holdings</p>
        </div>
        <Badge variant="gold">{cryptocurrencies.length} assets</Badge>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border-subtle)]">
              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">Symbol</th>
              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">Name</th>
              <th className="px-4 py-3 text-right text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">Total Value</th>
              <th className="px-4 py-3 text-right text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">Net Investment</th>
              <th className="px-4 py-3 text-right text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">Gain/Loss</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {cryptocurrencies.map((crypto) => {
              const cryptoMetrics = getMetricsForCrypto(crypto.symbol);
              return (
                <tr
                  key={crypto.symbol}
                  className="hover:bg-[var(--bg-elevated)]/30 transition-colors"
                >
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Bitcoin className="w-4 h-4 text-[var(--accent-gold)]" />
                      <span className="font-mono font-semibold text-[var(--text-primary)]">{crypto.symbol}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-[var(--text-primary)]">{crypto.name}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <UpdateTotalValueForm
                      symbol={crypto.symbol}
                      currentValue={crypto.current_total_value?.toString() ?? '0'}
                    />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-[var(--text-secondary)] font-mono">
                    {formatCurrency(cryptoMetrics?.netInvestment || 0)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    {cryptoMetrics && (
                      <div>
                        <span
                          className={`text-sm font-mono font-medium ${
                            cryptoMetrics.gainLoss >= 0 ? 'text-[var(--accent-sage)]' : 'text-[var(--accent-coral)]'
                          }`}
                        >
                          {cryptoMetrics.gainLoss >= 0 ? '+' : ''}
                          {formatCurrency(cryptoMetrics.gainLoss)}
                        </span>
                        <span
                          className={`ml-2 text-xs ${
                            cryptoMetrics.gainLossPercent >= 0 ? 'text-[var(--accent-sage)]' : 'text-[var(--accent-coral)]'
                          }`}
                        >
                          ({cryptoMetrics.gainLossPercent >= 0 ? '+' : ''}
                          {cryptoMetrics.gainLossPercent.toFixed(2)}%)
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {cryptocurrencies.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-[var(--text-muted)]">
                  No cryptocurrencies defined. Add your first cryptocurrency above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default function CryptoList() {
  const { cryptocurrencies, metrics, loading } = useCrypto();

  const totalValue = metrics.reduce((sum, m) => sum + m.currentTotalValue, 0);
  const totalInvested = metrics.reduce((sum, m) => sum + m.netInvestment, 0);
  const totalGainLoss = totalValue - totalInvested;
  const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader
        title="Cryptocurrencies"
        description="Manage your cryptocurrency investments and track performance."
        breadcrumbs={[{ label: 'Crypto' }]}
      />

      <div>
        <StatsGrid columns={4}>
          <MetricCard
            title="Total Value"
            value={formatPkr(totalValue)}
            trend={{ value: totalGainLossPercent, label: 'vs invested' }}
            icon={<TrendingUp className="w-5 h-5" />}
            variant="gold"
           
          />
          <MetricCard
            title="Total Invested"
            value={formatPkr(totalInvested)}
            icon={<DollarSign className="w-5 h-5" />}
            variant="default"
           
          />
          <MetricCard
            title="Gain/Loss"
            value={formatPkr(totalGainLoss)}
            trend={{
              value: totalGainLossPercent,
              label: `${totalGainLoss >= 0 ? '+' : ''}${totalGainLossPercent.toFixed(1)}%`,
            }}
            icon={<PieChart className="w-5 h-5" />}
            variant={totalGainLoss >= 0 ? 'sage' : 'coral'}
           
          />
          <MetricCard
            title="Total Assets"
            value={cryptocurrencies.length.toString()}
            icon={<Wallet className="w-5 h-5" />}
            variant="default"
           
          />
        </StatsGrid>
      </div>

      <div>
        <Card hover={false}>
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Coins className="w-4 h-4 text-[var(--accent-gold)]" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-gold)]">
                New Asset
              </span>
            </div>
            <h3 className="font-display text-xl text-[var(--text-primary)]">Add New Cryptocurrency</h3>
            <p className="text-sm text-[var(--text-muted)] mt-1">Register a new cryptocurrency to track</p>
          </div>
          <CryptoForm />
        </Card>
      </div>

      <div>
        <CryptoTable cryptocurrencies={cryptocurrencies} metrics={metrics} loading={loading} />
      </div>
    </div>
  );
}
