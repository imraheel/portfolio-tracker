import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, PieChart, Wallet, Landmark } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { MetricCard } from '@/components/ui/MetricCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useMutualFunds } from '@/hooks/mutualFunds/useMutualFunds';
import type { FundMetrics, MutualFund } from '@/services/mutualFunds/mutualFunds';
import { FundForm } from '@/components/mutualFunds/FundForm';
import { UpdateMarketValueForm } from '@/components/mutualFunds/UpdateMarketValueForm';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function formatPkr(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface FundsTableProps {
  funds: MutualFund[];
  metrics: FundMetrics[];
  loading: boolean;
}

function FundsTable({ funds, metrics, loading }: FundsTableProps) {
  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getMetricsForFund = (fundId: number) => {
    return metrics.find((m) => m.fundId === fundId);
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <div className="h-64 bg-[var(--bg-tertiary)] rounded" />
      </Card>
    );
  }

  return (
    <Card hover={false}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Landmark className="w-4 h-4 text-[var(--accent-gold)]" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-gold)]">
              Holdings
            </span>
          </div>
          <h3 className="font-display text-xl text-[var(--text-primary)]">Funds List</h3>
          <p className="text-sm text-[var(--text-muted)] mt-1">Your mutual fund holdings</p>
        </div>
        <Badge variant="gold">{funds.length} funds</Badge>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border-subtle)]">
              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">Symbol</th>
              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">Name / Description</th>
              <th className="px-4 py-3 text-right text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">Market Value</th>
              <th className="px-4 py-3 text-right text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">Net Investment</th>
              <th className="px-4 py-3 text-right text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">Gain/Loss</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {funds.map((fund) => {
              const fundMetrics = getMetricsForFund(fund.id);
              return (
                <motion.tr
                  key={fund.id}
                  className="hover:bg-[var(--bg-elevated)]/30 transition-colors"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="font-mono font-semibold text-[var(--text-primary)]">{fund.symbol}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="text-sm text-[var(--text-primary)]">{fund.name}</div>
                    <div className="text-xs text-[var(--text-muted)]">{fund.description || '-'}</div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <UpdateMarketValueForm
                      fundId={fund.id}
                      currentValue={fund.current_market_value?.toString() ?? '0'}
                    />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-[var(--text-secondary)] font-mono">
                    {formatCurrency(fundMetrics?.netInvestment || 0)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    {fundMetrics && (
                      <div>
                        <span
                          className={`text-sm font-mono font-medium ${
                            fundMetrics.gainLoss >= 0 ? 'text-[var(--accent-sage)]' : 'text-[var(--accent-coral)]'
                          }`}
                        >
                          {fundMetrics.gainLoss >= 0 ? '+' : ''}
                          {formatCurrency(fundMetrics.gainLoss)}
                        </span>
                        <span
                          className={`ml-2 text-xs ${
                            fundMetrics.gainLossPercent >= 0 ? 'text-[var(--accent-sage)]' : 'text-[var(--accent-coral)]'
                          }`}
                        >
                          ({fundMetrics.gainLossPercent >= 0 ? '+' : ''}
                          {fundMetrics.gainLossPercent.toFixed(2)}%)
                        </span>
                      </div>
                    )}
                  </td>
                </motion.tr>
              );
            })}
            {funds.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-[var(--text-muted)]">
                  No mutual funds defined. Add your first fund above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default function FundsList() {
  const { funds, metrics, loading } = useMutualFunds();

  const totalValue = metrics.reduce((sum, m) => sum + m.currentMarketValue, 0);
  const totalInvested = metrics.reduce((sum, m) => sum + m.netInvestment, 0);
  const totalGainLoss = totalValue - totalInvested;
  const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto space-y-8"
    >
      <PageHeader
        title="Mutual Funds"
        description="Manage your mutual fund investments and track performance."
        breadcrumbs={[{ label: 'Mutual Funds' }]}
      />

      <motion.div variants={itemVariants}>
        <StatsGrid columns={4}>
          <MetricCard
            title="Total Value"
            value={formatPkr(totalValue)}
            trend={{ value: totalGainLossPercent, label: 'vs invested' }}
            icon={<TrendingUp className="w-5 h-5" />}
            variant="gold"
            delay={0}
          />
          <MetricCard
            title="Total Invested"
            value={formatPkr(totalInvested)}
            icon={<DollarSign className="w-5 h-5" />}
            variant="default"
            delay={0.1}
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
            delay={0.2}
          />
          <MetricCard
            title="Total Funds"
            value={funds.length.toString()}
            icon={<Wallet className="w-5 h-5" />}
            variant="default"
            delay={0.3}
          />
        </StatsGrid>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card hover={false}>
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Landmark className="w-4 h-4 text-[var(--accent-gold)]" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-gold)]">
                New Fund
              </span>
            </div>
            <h3 className="font-display text-xl text-[var(--text-primary)]">Add New Fund</h3>
            <p className="text-sm text-[var(--text-muted)] mt-1">Register a new mutual fund to track</p>
          </div>
          <FundForm />
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <FundsTable funds={funds} metrics={metrics} loading={loading} />
      </motion.div>
    </motion.div>
  );
}
