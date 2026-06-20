import { TrendingUp, DollarSign, PieChart, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { MetricCard } from '@/components/ui/MetricCard';
import { Card } from '@/components/ui/Card';
import { NetInvestmentChart, AssetAllocationChart, RecentActivity, QuickActions } from '@/components/dashboard';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useWallet } from '@/hooks/stocks/useWallet';
import { useMutualFunds } from '@/hooks/mutualFunds/useMutualFunds';
import { useCrypto } from '@/hooks/crypto/useCrypto';
import { useTransactions } from '@/hooks/stocks/useTransactions';
import { getInvestmentHistory } from '@/services/investmentHistory';
import type { Transaction } from '@/components/dashboard/RecentActivity';
import { useState, useEffect, useCallback } from 'react';

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
          <div key={i} className="rounded-lg bg-[var(--bg-secondary)] p-5 border border-[var(--border-subtle)] shadow-soft animate-pulse">
            <div className="h-9 w-9 rounded-lg bg-[var(--bg-tertiary)] mb-4" />
            <div className="space-y-2">
              <div className="h-3 w-20 rounded bg-[var(--bg-tertiary)]" />
              <div className="h-7 w-28 rounded bg-[var(--bg-tertiary)]" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-72 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-subtle)] shadow-soft animate-pulse" />
        <div className="h-72 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-subtle)] shadow-soft animate-pulse" />
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

function useInvestmentHistory(refreshTrigger?: number) {
  const [history, setHistory] = useState<{
    date: string;
    stocksInvestment: number;
    mutualFundsInvestment: number;
    cryptoInvestment: number;
  }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getInvestmentHistory(365);
      setHistory(data);
    } catch (error) {
      console.error('Failed to fetch investment history:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory, refreshTrigger]);

  return { history, loading, refresh: fetchHistory };
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

  const { history: investmentHistory, loading: historyLoading } = useInvestmentHistory(balance);

  const chartLoading = loading || historyLoading;

  if (chartLoading) {
    return (
      <div>
        <PageHeader
          title="Dashboard"
          description="Performance overview of your investments"
        />
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Performance overview of your investments"
      />

      <StatsGrid columns={4}>
        <MetricCard
          title="Total Portfolio Value"
          value={formatPkr(totalValue)}
          trend={{ value: totalGainLossPercentage, label: 'vs invested' }}
          icon={<TrendingUp className="w-5 h-5" />}
          variant="blue"
        />
        <MetricCard
          title="Total Invested"
          value={formatPkr(totalInvested)}
          icon={<DollarSign className="w-5 h-5" />}
          variant="default"
        />
        <MetricCard
          title="Total Gain/Loss"
          value={formatPkr(Math.abs(totalGainLoss))}
          trend={{
            value: totalGainLossPercentage,
            label: `${totalGainLoss >= 0 ? '+' : ''}${totalGainLossPercentage.toFixed(1)}%`,
          }}
          icon={<PieChart className="w-5 h-5" />}
          variant={totalGainLoss >= 0 ? 'green' : 'red'}
        />
        <MetricCard
          title="Wallet Balance"
          value={formatPkr(balance)}
          icon={<Wallet className="w-5 h-5" />}
          variant="default"
        />
      </StatsGrid>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <NetInvestmentChart data={investmentHistory} loading={historyLoading} />
        <AssetAllocationChart
          stocks={stocksValue}
          mutualFunds={fundsValue}
          crypto={cryptoValue}
          loading={loading}
        />
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">Top Holdings</h3>
            <p className="text-sm text-[var(--text-muted)]">Your largest investments by value</p>
          </div>
          <span className="text-xs font-medium text-[var(--text-secondary)] bg-[var(--bg-tertiary)] px-2 py-1 rounded-md">
            {stockMetrics.length} holdings
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                <th className="text-left py-2.5 px-4 text-[11px] font-semibold text-[var(--text-secondary)]">
                  Symbol
                </th>
                <th className="text-right py-2.5 px-4 text-[11px] font-semibold text-[var(--text-secondary)]">
                  Quantity
                </th>
                <th className="text-right py-2.5 px-4 text-[11px] font-semibold text-[var(--text-secondary)]">
                  Avg. Cost
                </th>
                <th className="text-right py-2.5 px-4 text-[11px] font-semibold text-[var(--text-secondary)]">
                  Current
                </th>
                <th className="text-right py-2.5 px-4 text-[11px] font-semibold text-[var(--text-secondary)]">
                  Value
                </th>
                <th className="text-right py-2.5 px-4 text-[11px] font-semibold text-[var(--text-secondary)]">
                  Gain/Loss
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {stockMetrics.slice(0, 10).map((m) => (
                <tr key={m.symbol} className="hover:bg-[var(--bg-tertiary)]">
                  <td className="py-3 px-4">
                    <span className="font-semibold text-sm text-[var(--text-primary)]">
                      {m.symbol}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-[var(--text-secondary)]">
                    {m.remainingQty.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-[var(--text-secondary)]">
                    {formatPkr(m.avgBuyPrice)}
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-[var(--text-secondary)]">
                    {formatPkr(m.currentPrice)}
                  </td>
                  <td className="py-3 px-4 text-right text-sm font-medium text-[var(--text-primary)]">
                    {formatPkr(m.currentValue)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`text-sm font-medium flex items-center justify-end gap-1 ${
                        m.unrealizedGainLoss >= 0 ? 'text-[var(--accent-green)]' : 'text-[var(--accent-red)]'
                      }`}
                    >
                      {m.unrealizedGainLoss >= 0 ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      )}
                      {formatPkr(Math.abs(m.unrealizedGainLoss))}
                    </span>
                  </td>
                </tr>
              ))}
              {stockMetrics.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-[var(--text-muted)]">
                    No stock holdings yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
      </div>
    </div>
  );
}
