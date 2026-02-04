import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, PieChart, Wallet, Coins } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { MetricCard } from '@/components/ui/MetricCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useCrypto } from '@/hooks/crypto/useCrypto';
import type { CryptoMetrics, Cryptocurrency } from '@/services/crypto/crypto';
import { CryptoForm } from '@/components/crypto/CryptoForm';
import { UpdateTotalValueForm } from '@/components/crypto/UpdateTotalValueForm';

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

interface CryptoTableProps {
  cryptocurrencies: Cryptocurrency[];
  metrics: CryptoMetrics[];
  loading: boolean;
}

function CryptoTable({ cryptocurrencies, metrics, loading }: CryptoTableProps) {
  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getMetricsForCrypto = (cryptoId: number) => {
    return metrics.find((m) => m.cryptoId === cryptoId);
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
          <h3 className="text-lg font-semibold text-gray-900">Cryptocurrencies List</h3>
          <p className="text-sm text-gray-500">Your cryptocurrency holdings</p>
        </div>
        <Badge variant="warning">{cryptocurrencies.length} assets</Badge>
      </div>
      <div className="overflow-hidden rounded-lg border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Symbol</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Name</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Total Value</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Net Investment</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Gain/Loss</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {cryptocurrencies.map((crypto) => {
                const cryptoMetrics = getMetricsForCrypto(crypto.id);
                return (
                  <motion.tr
                    key={crypto.id}
                    className="hover:bg-gray-50 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-amber-500" />
                        <span className="font-bold text-gray-900">{crypto.symbol}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">{crypto.name}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <UpdateTotalValueForm
                        cryptoId={crypto.id}
                        currentValue={crypto.current_total_value?.toString() ?? '0'}
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">
                      {formatCurrency(cryptoMetrics?.netInvestment || 0)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {cryptoMetrics && (
                        <div>
                          <span
                            className={`text-sm font-medium ${
                              cryptoMetrics.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {cryptoMetrics.gainLoss >= 0 ? '+' : ''}
                            {formatCurrency(cryptoMetrics.gainLoss)}
                          </span>
                          <span
                            className={`ml-2 text-xs ${
                              cryptoMetrics.gainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            ({cryptoMetrics.gainLossPercent >= 0 ? '+' : ''}
                            {cryptoMetrics.gainLossPercent.toFixed(2)}%)
                          </span>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
              {cryptocurrencies.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                    No cryptocurrencies defined. Add your first cryptocurrency above.
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

export default function CryptoList() {
  const { cryptocurrencies, metrics, loading } = useCrypto();

  const totalValue = metrics.reduce((sum, m) => sum + m.currentTotalValue, 0);
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
        title="Cryptocurrencies"
        description="Manage your cryptocurrency investments and track performance."
        breadcrumbs={[{ label: 'Crypto' }]}
      />

      <motion.div variants={itemVariants}>
        <StatsGrid columns={4}>
          <MetricCard
            title="Total Value"
            value={formatPkr(totalValue)}
            trend={{ value: totalGainLossPercent, label: 'vs invested' }}
            icon={<TrendingUp className="w-5 h-5" />}
            color="orange"
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
            title="Total Assets"
            value={cryptocurrencies.length.toString()}
            icon={<Wallet className="w-5 h-5" />}
            color="purple"
            loading={loading}
          />
        </StatsGrid>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card hover={false}>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Add New Cryptocurrency</h3>
            <p className="text-sm text-gray-500">Register a new cryptocurrency to track</p>
          </div>
          <CryptoForm />
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <CryptoTable cryptocurrencies={cryptocurrencies} metrics={metrics} loading={loading} />
      </motion.div>
    </motion.div>
  );
}
