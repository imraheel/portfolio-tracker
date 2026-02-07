import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, PieChart, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { MetricCard } from '@/components/ui/MetricCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { NetInvestmentChart, AssetAllocationChart, RecentActivity, QuickActions } from '@/components/dashboard';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useWallet } from '@/hooks/stocks/useWallet';
import { useMutualFunds } from '@/hooks/mutualFunds/useMutualFunds';
import { useCrypto } from '@/hooks/crypto/useCrypto';
import { useTransactions } from '@/hooks/stocks/useTransactions';
import { getInvestmentHistory } from '@/services/investmentHistory';
import type { Transaction } from '@/components/dashboard/RecentActivity';
import { useState, useEffect } from 'react';
import { clsx } from 'clsx';

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
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg bg-[var(--bg-secondary)] p-5 border border-[var(--border-subtle)]">
            <div className="animate-pulse space-y-4">
              <div className="h-10 w-10 rounded-lg bg-[var(--bg-elevated)]" />
              <div className="space-y-2">
                <div className="h-3 w-24 rounded bg-[var(--bg-elevated)]" />
                <div className="h-8 w-32 rounded bg-[var(--bg-elevated)]" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-72 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-subtle)]" />
        <div className="h-72 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-subtle)]" />
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

function useInvestmentHistory() {
  const [history, setHistory] = useState<{
    date: string;
    stocksInvestment: number;
    mutualFundsInvestment: number;
    cryptoInvestment: number;
  }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getInvestmentHistory(365);
        setHistory(data);
      } catch (error) {
        console.error('Failed to fetch investment history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return { history, loading };
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

  const { history: investmentHistory, loading: historyLoading } = useInvestmentHistory();

  const chartLoading = loading || historyLoading;

  if (chartLoading) {
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
      className="max-w-7xl mx-auto space-y-8"
    >
      <PageHeader
        title="Dashboard"
        description="Performance overview of your investments"
      />

      {/* Metrics Grid */}
      <motion.div variants={itemVariants}>
        <StatsGrid columns={4}>
          <MetricCard
            title="Total Portfolio Value"
            value={formatPkr(totalValue)}
            trend={{ value: totalGainLossPercentage, label: 'vs invested' }}
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
            title="Total Gain/Loss"
            value={formatPkr(Math.abs(totalGainLoss))}
            trend={{
              value: totalGainLossPercentage,
              label: `${totalGainLoss >= 0 ? '+' : ''}${totalGainLossPercentage.toFixed(1)}%`,
            }}
            icon={<PieChart className="w-5 h-5" />}
            variant={totalGainLoss >= 0 ? 'sage' : 'coral'}
            delay={0.2}
          />
          <MetricCard
            title="Wallet Balance"
            value={formatPkr(balance)}
            icon={<Wallet className="w-5 h-5" />}
            variant="default"
            delay={0.3}
          />
        </StatsGrid>
      </motion.div>

      {/* Charts */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <NetInvestmentChart data={investmentHistory} loading={historyLoading} />
        <AssetAllocationChart
          stocks={stocksValue}
          mutualFunds={fundsValue}
          crypto={cryptoValue}
          loading={loading}
        />
      </motion.div>

      {/* Top Holdings Table */}
      <motion.div variants={itemVariants}>
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-px w-6 bg-[var(--accent-gold)]" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-gold)]">
                  Holdings
                </span>
              </div>
              <h3 className="font-display text-xl text-[var(--text-primary)]">Top Holdings</h3>
              <p className="text-sm text-[var(--text-muted)] mt-1">Your largest investments by value</p>
            </div>
            <Badge variant="gold">{stockMetrics.length} holdings</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="text-left py-3 px-4 text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">
                    Symbol
                  </th>
                  <th className="text-right py-3 px-4 text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">
                    Quantity
                  </th>
                  <th className="text-right py-3 px-4 text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">
                    Avg. Cost
                  </th>
                  <th className="text-right py-3 px-4 text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">
                    Current
                  </th>
                  <th className="text-right py-3 px-4 text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">
                    Value
                  </th>
                  <th className="text-right py-3 px-4 text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">
                    Gain/Loss
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {stockMetrics.slice(0, 10).map((m, index) => (
                  <motion.tr
                    key={m.stockId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-[var(--bg-elevated)]/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <span className="font-mono font-semibold text-[var(--text-primary)]">
                        {m.symbol}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-[var(--text-secondary)]">
                      {m.remainingQty.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-[var(--text-secondary)]">
                      {formatPkr(m.avgBuyPrice)}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-[var(--text-secondary)]">
                      {formatPkr(m.currentPrice)}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-medium text-[var(--text-primary)]">
                      {formatPkr(m.currentValue)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className={clsx(
                        'font-mono font-medium flex items-center justify-end gap-1',
                        m.unrealizedGainLoss >= 0 ? 'text-[var(--accent-sage)]' : 'text-[var(--accent-coral)]'
                      )}>
                        {m.unrealizedGainLoss >= 0 ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                        {formatPkr(Math.abs(m.unrealizedGainLoss))}
                      </span>
                    </td>
                  </motion.tr>
                ))}
                {stockMetrics.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sm text-[var(--text-muted)]">
                      No stock holdings yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* Recent Activity & Quick Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentActivity
          transactions={recentTransactions}
          onViewAll={() => window.location.hash = '#/stocks/transactions'}
        />
        <QuickActions
          onDeposit={() => window.location.hash = '#/stocks/wallet'}
          onBuyAsset={() => window.location.hash = '#/stocks/transactions'}
          onViewReports={() => window.location.hash = '#/stocks/reports'}
          onViewWallet={() => window.location.hash = '#/stocks/wallet'}
        />
      </motion.div>
    </motion.div>
  );
}
