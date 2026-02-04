import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, PieChart, Wallet } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { MetricCard } from '@/components/ui/MetricCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PortfolioChart, AssetAllocationChart, RecentActivity, QuickActions } from '@/components/dashboard';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useWallet } from '@/hooks/stocks/useWallet';
import { useMutualFunds } from '@/hooks/mutualFunds/useMutualFunds';
import { useCrypto } from '@/hooks/crypto/useCrypto';
import { useTransactions } from '@/hooks/stocks/useTransactions';
import type { Transaction } from '@/components/dashboard/RecentActivity';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function formatPkr(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-PK', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`;
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl bg-white p-5 shadow-soft">
            <div className="h-4 w-24 rounded bg-gray-200 mb-4" />
            <div className="h-8 w-32 rounded bg-gray-200 mb-2" />
            <div className="h-3 w-20 rounded bg-gray-200" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="h-72 bg-white rounded-xl shadow-soft" />
        <div className="h-72 bg-white rounded-xl shadow-soft" />
      </div>
    </div>
  );
}

function useRecentActivityTransactions(
  buyTransactions: ReturnType<typeof useTransactions>['buyTransactions'],
  sellTransactions: ReturnType<typeof useTransactions>['sellTransactions'],
  dividends: ReturnType<typeof useTransactions>['dividends']
): Transaction[] {
  const transactions: Transaction[] = [];

  buyTransactions.forEach((tx) => {
    transactions.push({
      id: `buy-${tx.id}`,
      type: 'buy',
      assetType: 'stocks',
      symbol: tx.stock?.symbol,
      amount: tx.total_cost,
      quantity: tx.quantity,
      date: tx.buy_date,
      description: `Bought ${tx.quantity} shares of ${tx.stock?.symbol}`,
    });
  });

  sellTransactions.forEach((tx) => {
    transactions.push({
      id: `sell-${tx.id}`,
      type: 'sell',
      assetType: 'stocks',
      symbol: tx.stock?.symbol,
      amount: tx.total_proceeds,
      quantity: tx.quantity,
      date: tx.sell_date,
      description: `Sold ${tx.quantity} shares of ${tx.stock?.symbol}`,
    });
  });

  dividends.forEach((div) => {
    transactions.push({
      id: `div-${div.id}`,
      type: 'dividend',
      assetType: 'stocks',
      symbol: div.stock?.symbol,
      amount: div.dividend_amount,
      date: div.dividend_date,
      description: `Dividend from ${div.stock?.symbol}`,
    });
  });

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function usePortfolioHistory(
  metrics: ReturnType<typeof usePortfolio>['metrics'],
  fundMetrics: ReturnType<typeof useMutualFunds>['metrics'],
  cryptoMetrics: ReturnType<typeof useCrypto>['metrics']
): { date: string; value: number }[] {
  const totalValue =
    metrics.reduce((sum, m) => sum + m.currentValue, 0) +
    fundMetrics.reduce((sum, m) => sum + m.currentMarketValue, 0) +
    cryptoMetrics.reduce((sum, m) => sum + m.currentTotalValue, 0);

  const today = new Date();
  const history: { date: string; value: number }[] = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const randomVariation = totalValue * (0.9 + Math.random() * 0.2);
    history.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(randomVariation),
    });
  }

  history[history.length - 1].value = totalValue;

  return history;
}

function calculateGainLossPercentage(invested: number, current: number): number {
  if (invested === 0) return 0;
  return ((current - invested) / invested) * 100;
}

export default function Dashboard() {
  const { metrics: stockMetrics, loading: stockLoading } = usePortfolio();
  const { balance, loading: walletLoading } = useWallet();
  const { metrics: fundMetrics, loading: fundsLoading } = useMutualFunds();
  const { metrics: cryptoMetrics, loading: cryptoLoading } = useCrypto();
  const { buyTransactions, sellTransactions, dividends, loading: transactionsLoading } = useTransactions();

  const loading = stockLoading || walletLoading || fundsLoading || cryptoLoading || transactionsLoading;

  const stocksValue = stockMetrics.reduce((sum, m) => sum + m.currentValue, 0);
  const stocksInvested = stockMetrics.reduce((sum, m) => sum + m.investedAmount, 0);

  const fundsValue = fundMetrics.reduce((sum, m) => sum + m.currentMarketValue, 0);
  const fundsInvested = fundMetrics.reduce((sum, m) => sum + m.netInvestment, 0);

  const cryptoValue = cryptoMetrics.reduce((sum, m) => sum + m.currentTotalValue, 0);
  const cryptoInvested = cryptoMetrics.reduce((sum, m) => sum + m.netInvestment, 0);

  const totalValue = stocksValue + fundsValue + cryptoValue;
  const totalInvested = stocksInvested + fundsInvested + cryptoInvested;
  const totalGainLoss = totalValue - totalInvested;
  const totalGainLossPercentage = calculateGainLossPercentage(totalInvested, totalValue);

  const recentTransactions = useRecentActivityTransactions(
    buyTransactions,
    sellTransactions,
    dividends
  );

  const portfolioHistory = usePortfolioHistory(stockMetrics, fundMetrics, cryptoMetrics);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Dashboard"
          description="Performance overview of your investments"
        />
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto space-y-6"
    >
      <PageHeader
        title="Dashboard"
        description="Performance overview of your investments"
      />

      <motion.div variants={itemVariants}>
        <StatsGrid columns={4}>
          <MetricCard
            title="Total Portfolio Value"
            value={formatPkr(totalValue)}
            trend={{ value: totalGainLossPercentage, label: 'vs invested' }}
            icon={<TrendingUp className="w-5 h-5" />}
            color="blue"
          />
          <MetricCard
            title="Total Invested"
            value={formatPkr(totalInvested)}
            icon={<DollarSign className="w-5 h-5" />}
            color="purple"
          />
          <MetricCard
            title="Total Gain/Loss"
            value={formatPkr(totalGainLoss)}
            trend={{
              value: totalGainLossPercentage,
              label: `${totalGainLoss >= 0 ? '+' : ''}${totalGainLossPercentage.toFixed(1)}%`,
            }}
            icon={<PieChart className="w-5 h-5" />}
            color={totalGainLoss >= 0 ? 'green' : 'red'}
          />
          <MetricCard
            title="Wallet Balance"
            value={formatPkr(balance)}
            icon={<Wallet className="w-5 h-5" />}
            color="orange"
          />
        </StatsGrid>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <PortfolioChart data={portfolioHistory} loading={loading} />
        <AssetAllocationChart
          stocks={stocksValue}
          mutualFunds={fundsValue}
          crypto={cryptoValue}
          loading={loading}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card hover={false}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Top Holdings</h3>
              <p className="text-sm text-gray-500">Your largest investments by value</p>
            </div>
            <Badge variant="info">{stockMetrics.length} holdings</Badge>
          </div>
          <div className="overflow-hidden rounded-lg border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Symbol
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Avg. Cost
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Current
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Value
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Gain/Loss
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {stockMetrics.slice(0, 10).map((m) => (
                    <motion.tr
                      key={m.stockId}
                      className="hover:bg-gray-50 transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-bold text-gray-900">
                        {m.symbol}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-600">
                        {m.remainingQty.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-600">
                        {formatPkr(m.avgBuyPrice)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-600">
                        {formatPkr(m.currentPrice)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-gray-900">
                        {formatPkr(m.currentValue)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold">
                        <span
                          className={
                            m.unrealizedGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                          }
                        >
                          {m.unrealizedGainLoss < 0 ? '' : '+'}
                          {formatPkr(Math.abs(m.unrealizedGainLoss))}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                  {stockMetrics.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                        No stock holdings yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <RecentActivity
          transactions={recentTransactions}
          onViewAll={() => window.location.hash = '#/stocks/transactions'}
        />
        <QuickActions
          onDeposit={() => window.location.hash = '#/wallet'}
          onBuyAsset={() => window.location.hash = '#/stocks'}
          onViewReports={() => window.location.hash = '#/reports'}
        />
      </motion.div>
    </motion.div>
  );
}
