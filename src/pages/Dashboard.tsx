import { clsx } from 'clsx';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useWallet } from '@/hooks/stocks/useWallet';
import { useMutualFunds } from '@/hooks/mutualFunds/useMutualFunds';
import { useCrypto } from '@/hooks/crypto/useCrypto';

function formatPkr(amount: number) {
  return amount.toLocaleString('en-PK', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}

function StatCard({ 
    title, 
    value, 
    isCurrency = true, 
    showSign = false 
}: { 
    title: string; 
    value: number;
    isCurrency?: boolean;
    showSign?: boolean;
}) {
    const isNegative = value < 0;
    const absValue = Math.abs(value);
    
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</h3>
            <p className={clsx("mt-2 text-2xl font-bold", {
                "text-green-600": showSign && !isNegative && value !== 0,
                "text-red-600": showSign && isNegative,
                "text-gray-900": !showSign || value === 0,
            })}>
                {isCurrency && "Rs. "}
                {isCurrency ? formatPkr(absValue) : value.toString()}
                {showSign && isNegative && " (-)"}
            </p>
        </div>
    );
}

function PortfolioOverview({ 
  stockMetrics, 
  fundMetrics, 
  cryptoMetrics 
}: { 
  stockMetrics: ReturnType<typeof usePortfolio>['metrics'],
  fundMetrics: ReturnType<typeof useMutualFunds>['metrics'],
  cryptoMetrics: ReturnType<typeof useCrypto>['metrics']
}) {
  // Stocks calculations
  const stocksValue = stockMetrics.reduce((sum, m) => sum + m.currentValue, 0);
  const stocksInvested = stockMetrics.reduce((sum, m) => sum + m.investedAmount, 0);
  const stocksGainLoss = stocksValue - stocksInvested;
  
  // Mutual Funds calculations
  const fundsValue = fundMetrics.reduce((sum, m) => sum + m.currentMarketValue, 0);
  const fundsInvested = fundMetrics.reduce((sum, m) => sum + m.netInvestment, 0);
  const fundsGainLoss = fundsValue - fundsInvested;
  
  // Crypto calculations
  const cryptoValue = cryptoMetrics.reduce((sum, m) => sum + m.currentTotalValue, 0);
  const cryptoInvested = cryptoMetrics.reduce((sum, m) => sum + m.netInvestment, 0);
  const cryptoGainLoss = cryptoValue - cryptoInvested;
  
  // Totals
  const totalValue = stocksValue + fundsValue + cryptoValue;
  const totalInvested = stocksInvested + fundsInvested + cryptoInvested;
  const totalGainLoss = totalValue - totalInvested;

  return (
    <div className="space-y-8">
      {/* Overall Portfolio Summary */}
      <section>
        <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-400">Portfolio Overview</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <StatCard title="Total Portfolio Value" value={totalValue} />
          <StatCard title="Total Invested" value={totalInvested} />
          <StatCard title="Overall Gain/Loss" value={totalGainLoss} showSign={true} />
        </div>
      </section>

      {/* Asset Breakdown */}
      <section>
        <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-400">Asset Breakdown</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {/* Stocks Card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Stocks</h3>
            <p className="mt-2 text-2xl font-bold text-gray-900">Rs. {formatPkr(stocksValue)}</p>
            <p className={clsx("mt-1 text-sm", {
              "text-green-600": stocksGainLoss >= 0,
              "text-red-600": stocksGainLoss < 0,
            })}>
              {stocksGainLoss >= 0 ? "+" : ""}Rs. {formatPkr(Math.abs(stocksGainLoss))}
            </p>
          </div>
          
          {/* Mutual Funds Card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Mutual Funds</h3>
            <p className="mt-2 text-2xl font-bold text-gray-900">Rs. {formatPkr(fundsValue)}</p>
            <p className={clsx("mt-1 text-sm", {
              "text-green-600": fundsGainLoss >= 0,
              "text-red-600": fundsGainLoss < 0,
            })}>
              {fundsGainLoss >= 0 ? "+" : ""}Rs. {formatPkr(Math.abs(fundsGainLoss))}
            </p>
          </div>
          
          {/* Crypto Card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Crypto</h3>
            <p className="mt-2 text-2xl font-bold text-gray-900">Rs. {formatPkr(cryptoValue)}</p>
            <p className={clsx("mt-1 text-sm", {
              "text-green-600": cryptoGainLoss >= 0,
              "text-red-600": cryptoGainLoss < 0,
            })}>
              {cryptoGainLoss >= 0 ? "+" : ""}Rs. {formatPkr(Math.abs(cryptoGainLoss))}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function DashboardSummary({ metrics, balance, totalDeposited }: { 
    metrics: ReturnType<typeof usePortfolio>['metrics'], 
    balance: number,
    totalDeposited: number
}) {
  const portfolioValue = metrics.reduce((sum, m) => sum + m.currentValue, 0);
  const unrealizedPl = metrics.reduce((sum, m) => sum + m.unrealizedGainLoss, 0);
  const realizedPl = metrics.reduce((sum, m) => sum + m.realizedGainLoss, 0);
  const totalDividends = metrics.reduce((sum, m) => sum + m.totalDividends, 0);
  const totalInvested = metrics.reduce((sum, m) => sum + m.investedAmount, 0);

  return (
    <div className="space-y-8">
      {/* Wallet Summary */}
      <section>
        <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-400">Wallet Summary</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <StatCard title="Total Deposits" value={totalDeposited} />
          <StatCard title="Available Balance" value={balance} />
          <StatCard title="Total Invested (Stocks)" value={totalInvested} />
        </div>
      </section>

      {/* Stocks Summary */}
      <section>
        <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-400">Stocks Summary</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Current Value" value={portfolioValue} />
          <StatCard title="Unrealized P/L" value={unrealizedPl} showSign={true} />
          <StatCard title="Realized P/L" value={realizedPl} showSign={true} />
          <StatCard title="Total Dividends" value={totalDividends} />
        </div>
      </section>
    </div>
  );
}

function HoldingsTable({ metrics }: { metrics: ReturnType<typeof usePortfolio>['metrics'] }) {
  return (
    <section className="mt-10">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-400">Stock Holdings</h2>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Symbol</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Qty</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Avg Buy</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Current</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Invested</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Value</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Gain/Loss</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {metrics.map((m) => (
                <tr key={m.stockId} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-4 text-sm font-bold text-gray-900">{m.symbol}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-gray-600">{m.remainingQty.toLocaleString()}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-gray-600">{formatPkr(m.avgBuyPrice)}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-gray-600">{formatPkr(m.currentPrice)}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-medium text-gray-900">{formatPkr(m.investedAmount)}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-bold text-gray-900">{formatPkr(m.currentValue)}</td>
                  <td className={clsx("whitespace-nowrap px-4 py-4 text-right text-sm font-bold", {
                      "text-green-600": m.unrealizedGainLoss >= 0,
                      "text-red-600": m.unrealizedGainLoss < 0,
                  })}>
                      {m.unrealizedGainLoss < 0 ? "" : "+"}{formatPkr(m.unrealizedGainLoss)}
                  </td>
                </tr>
              ))}
              {metrics.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">Your portfolio is currently empty.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default function Dashboard() {
  const { metrics, loading: portfolioLoading } = usePortfolio();
  const { balance, totalDeposited, loading: walletLoading } = useWallet();
  const { metrics: fundMetrics, loading: fundsLoading } = useMutualFunds();
  const { metrics: cryptoMetrics, loading: cryptoLoading } = useCrypto();

  const loading = portfolioLoading || walletLoading || fundsLoading || cryptoLoading;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Performance overview of your investments.</p>
      </header>
      
      <PortfolioOverview 
        stockMetrics={metrics}
        fundMetrics={fundMetrics}
        cryptoMetrics={cryptoMetrics}
      />
      
      <div className="mt-10">
        <DashboardSummary 
          metrics={metrics} 
          balance={balance} 
          totalDeposited={totalDeposited} 
        />
      </div>
      
      <HoldingsTable metrics={metrics} />
    </div>
  );
}
