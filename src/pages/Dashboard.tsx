import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, DollarSign, PieChart, Wallet, ArrowUpRight, ArrowDownRight, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { MetricCard } from '@/components/ui/MetricCard';
import { Card } from '@/components/ui/Card';
import { NetInvestmentChart, AssetAllocationChart, RecentActivity, QuickActions } from '@/components/dashboard';
import { getPortfolioMetrics } from '@/services/portfolio';
import { getWalletBalance } from '@/services/stocks/wallet';
import { getAllFundMetrics } from '@/services/mutualFunds/mutualFunds';
import { getAllCryptoMetrics } from '@/services/crypto/crypto';
import { getBuyTransactions, getSellTransactions, getDividends } from '@/services/stocks/transactions';
import { getInvestmentHistory } from '@/services/investmentHistory';
import { queryKeys } from '@/lib/queryKeys';
import type { Transaction } from '@/components/dashboard/RecentActivity';

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

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <AlertCircle className="w-12 h-12 text-[var(--accent-red)] mb-4" />
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">Failed to load dashboard</h3>
      <p className="text-sm text-[var(--text-muted)]">{message}</p>
    </div>
  );
}

function useRecentActivityTransactions(
  buyTransactions: Awaited<ReturnType<typeof getBuyTransactions>>,
  sellTransactions: Awaited<ReturnType<typeof getSellTransactions>>,
  dividends: Awaited<ReturnType<typeof getDividends>>
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

function calculateGainLossPercentage(invested: number, current: number): number {
  if (invested === 0) return 0;
  return ((current - invested) / invested) * 100;
}

export default function Dashboard() {
  const { data: stockMetrics = [], isLoading: stockLoading, error: stockError } = useQuery({
    queryKey: queryKeys.portfolio.metrics(),
    queryFn: getPortfolioMetrics,
    staleTime: 2 * 60 * 1000,
  });

  const { data: balance = 0, isLoading: walletLoading, error: walletError } = useQuery({
    queryKey: queryKeys.wallet.balance(),
    queryFn: getWalletBalance,
    staleTime: 30 * 1000,
  });

  const { data: fundMetrics = [], isLoading: fundsLoading, error: fundsError } = useQuery({
    queryKey: queryKeys.mutualFunds.metrics(),
    queryFn: getAllFundMetrics,
    staleTime: 2 * 60 * 1000,
  });

  const { data: cryptoMetrics = [], isLoading: cryptoLoading, error: cryptoError } = useQuery({
    queryKey: queryKeys.crypto.metrics(),
    queryFn: getAllCryptoMetrics,
    staleTime: 2 * 60 * 1000,
  });

  const { data: buyTransactions = [], isLoading: buysLoading } = useQuery({
    queryKey: queryKeys.transactions.buys(),
    queryFn: getBuyTransactions,
    staleTime: 5 * 60 * 1000,
  });

  const { data: sellTransactions = [], isLoading: sellsLoading } = useQuery({
    queryKey: queryKeys.transactions.sells(),
    queryFn: getSellTransactions,
    staleTime: 5 * 60 * 1000,
  });

  const { data: dividends = [], isLoading: dividendsLoading } = useQuery({
    queryKey: queryKeys.transactions.dividends(),
    queryFn: getDividends,
    staleTime: 5 * 60 * 1000,
  });

  const { data: investmentHistory, isLoading: historyLoading } = useQuery({
    queryKey: queryKeys.investmentHistory(365),
    queryFn: () => getInvestmentHistory(365),
    staleTime: 10 * 60 * 1000,
  });

  const stocksValue = useMemo(() => stockMetrics.reduce((sum, m) => sum + m.currentValue, 0), [stockMetrics]);
  const stocksInvested = useMemo(() => stockMetrics.reduce((sum, m) => sum + m.investedAmount, 0), [stockMetrics]);
  const fundsValue = useMemo(() => fundMetrics.reduce((sum, m) => sum + m.currentMarketValue, 0), [fundMetrics]);
  const fundsInvested = useMemo(() => fundMetrics.reduce((sum, m) => sum + m.netInvestment, 0), [fundMetrics]);
  const cryptoValue = useMemo(() => cryptoMetrics.reduce((sum, m) => sum + m.currentTotalValue, 0), [cryptoMetrics]);
  const cryptoInvested = useMemo(() => cryptoMetrics.reduce((sum, m) => sum + m.netInvestment, 0), [cryptoMetrics]);

  const totalValue = stocksValue + fundsValue + cryptoValue;
  const totalInvested = stocksInvested + fundsInvested + cryptoInvested;
  const totalGainLoss = totalValue - totalInvested;
  const totalGainLossPercentage = calculateGainLossPercentage(totalInvested, totalValue);

  const recentTransactions = useRecentActivityTransactions(buyTransactions, sellTransactions, dividends);

  const loading = stockLoading || walletLoading || fundsLoading || cryptoLoading || buysLoading || sellsLoading || dividendsLoading || historyLoading;
  const error = stockError ?? walletError ?? fundsError ?? cryptoError;

  if (error) {
    return (
      <div>
        <PageHeader title="Dashboard" description="Performance overview of your investments" />
        <ErrorState message={typeof error === 'string' ? error : error.message} />
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Dashboard" description="Performance overview of your investments" />
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Performance overview of your investments" />

      <StatsGrid columns={4}>
        <MetricCard title="Total Portfolio Value" value={formatPkr(totalValue)}
          trend={{ value: totalGainLossPercentage, label: 'vs invested' }}
          icon={<TrendingUp className="w-5 h-5" />} variant="blue" />
        <MetricCard title="Total Invested" value={formatPkr(totalInvested)}
          icon={<DollarSign className="w-5 h-5" />} variant="default" />
        <MetricCard title="Total Gain/Loss" value={formatPkr(Math.abs(totalGainLoss))}
          trend={{ value: totalGainLossPercentage, label: `${totalGainLoss >= 0 ? '+' : ''}${totalGainLossPercentage.toFixed(1)}%` }}
          icon={<PieChart className="w-5 h-5" />} variant={totalGainLoss >= 0 ? 'green' : 'red'} />
        <MetricCard title="Wallet Balance" value={formatPkr(balance)}
          icon={<Wallet className="w-5 h-5" />} variant="default" />
      </StatsGrid>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <NetInvestmentChart data={investmentHistory ?? []} loading={historyLoading} />
        <AssetAllocationChart stocks={stocksValue} mutualFunds={fundsValue} crypto={cryptoValue} loading={loading} />
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">Top Holdings</h3>
            <p className="text-sm text-[var(--text-muted)]">Your largest investments by value</p>
          </div>
          <span className="text-xs font-medium text-[var(--text-secondary)] bg-[var(--bg-tertiary)] px-2 py-1 rounded-md">{stockMetrics.length} holdings</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                <th className="text-left py-2.5 px-4 text-[11px] font-semibold text-[var(--text-secondary)]">Symbol</th>
                <th className="text-right py-2.5 px-4 text-[11px] font-semibold text-[var(--text-secondary)]">Quantity</th>
                <th className="text-right py-2.5 px-4 text-[11px] font-semibold text-[var(--text-secondary)]">Avg. Cost</th>
                <th className="text-right py-2.5 px-4 text-[11px] font-semibold text-[var(--text-secondary)]">Current</th>
                <th className="text-right py-2.5 px-4 text-[11px] font-semibold text-[var(--text-secondary)]">Value</th>
                <th className="text-right py-2.5 px-4 text-[11px] font-semibold text-[var(--text-secondary)]">Gain/Loss</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {stockMetrics.slice(0, 10).map((m) => (
                <tr key={m.symbol} className="hover:bg-[var(--bg-tertiary)]">
                  <td className="py-3 px-4"><span className="font-semibold text-sm text-[var(--text-primary)]">{m.symbol}</span></td>
                  <td className="py-3 px-4 text-right text-sm text-[var(--text-secondary)]">{m.remainingQty.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-sm text-[var(--text-secondary)]">{formatPkr(m.avgBuyPrice)}</td>
                  <td className="py-3 px-4 text-right text-sm text-[var(--text-secondary)]">{formatPkr(m.currentPrice)}</td>
                  <td className="py-3 px-4 text-right text-sm font-medium text-[var(--text-primary)]">{formatPkr(m.currentValue)}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`text-sm font-medium flex items-center justify-end gap-1 ${m.unrealizedGainLoss >= 0 ? 'text-[var(--accent-green)]' : 'text-[var(--accent-red)]'}`}>
                      {m.unrealizedGainLoss >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {formatPkr(Math.abs(m.unrealizedGainLoss))}
                    </span>
                  </td>
                </tr>
              ))}
              {stockMetrics.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-sm text-[var(--text-muted)]">No stock holdings yet</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentActivity transactions={recentTransactions} onViewAll={() => window.location.hash = '#/stocks/transactions'} />
        <QuickActions onDeposit={() => window.location.hash = '#/stocks/wallet'} onBuyAsset={() => window.location.hash = '#/stocks/transactions'} onViewReports={() => window.location.hash = '#/stocks/reports'} onViewWallet={() => window.location.hash = '#/stocks/wallet'} />
      </div>
    </div>
  );
}
