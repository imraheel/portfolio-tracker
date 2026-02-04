import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, PieChart, Wallet } from 'lucide-react';
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
        <div className="h-64 bg-gray-200 rounded" />
      </Card>
    );
  }

  return (
    <Card hover={false}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Funds List</h3>
          <p className="text-sm text-gray-500">Your mutual fund holdings</p>
        </div>
        <Badge variant="info">{funds.length} funds</Badge>
      </div>
      <div className="overflow-hidden rounded-lg border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Symbol</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Name / Description</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Market Value</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Net Investment</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Gain/Loss</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {funds.map((fund) => {
                const fundMetrics = getMetricsForFund(fund.id);
                return (
                  <motion.tr
                    key={fund.id}
                    className="hover:bg-gray-50 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="font-bold text-gray-900">{fund.symbol}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="text-sm text-gray-900">{fund.name}</div>
                      <div className="text-xs text-gray-500">{fund.description || '-'}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <UpdateMarketValueForm
                        fundId={fund.id}
                        currentValue={fund.current_market_value?.toString() ?? '0'}
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">
                      {formatCurrency(fundMetrics?.netInvestment || 0)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {fundMetrics && (
                        <div>
                          <span
                            className={`text-sm font-medium ${
                              fundMetrics.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {fundMetrics.gainLoss >= 0 ? '+' : ''}
                            {formatCurrency(fundMetrics.gainLoss)}
                          </span>
                          <span
                            className={`ml-2 text-xs ${
                              fundMetrics.gainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'
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
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                    No mutual funds defined. Add your first fund above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
      className="max-w-7xl mx-auto space-y-6"
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
            color="green"
            loading={loading}
          />
          <MetricCard
            title="Total Invested"
            value={formatPkr(totalInvested)}
            icon={<DollarSign className="w-5 h-5" />}
            color="blue"
            loading={loading}
          />
          <MetricCard
            title="Gain/Loss"
            value={formatPkr(totalGainLoss)}
            trend={{
              value: totalGainLossPercent,
              label: `${totalGainLoss >= 0 ? '+' : ''}${totalGainLossPercent.toFixed(1)}%`,
            }}
            icon={<PieChart className="w-5 h-5" />}
            color={totalGainLoss >= 0 ? 'green' : 'red'}
            loading={loading}
          />
          <MetricCard
            title="Total Funds"
            value={funds.length.toString()}
            icon={<Wallet className="w-5 h-5" />}
            color="purple"
            loading={loading}
          />
        </StatsGrid>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card hover={false}>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Add New Fund</h3>
            <p className="text-sm text-gray-500">Register a new mutual fund to track</p>
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
