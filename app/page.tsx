import { getWalletBalance } from '@/app/actions/wallet';
import { getPortfolioMetrics, HoldingMetric } from '@/app/actions/portfolio';
import { prisma } from '@/lib/prisma';
import { clsx } from 'clsx';
import { Prisma } from '@prisma/client';

// --- HELPER FUNCTIONS & COMPONENTS ---

function formatPkr(amount: Prisma.Decimal | number) {
  return new Prisma.Decimal(amount).toNumber().toLocaleString('en-PK', {
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
    value: Prisma.Decimal | number;
    isCurrency?: boolean;
    showSign?: boolean;
}) {
    const decValue = new Prisma.Decimal(value);
    const isNegative = decValue.isNegative();
    
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</h3>
            <p className={clsx("mt-2 text-2xl font-bold", {
                "text-green-600": showSign && !isNegative && !decValue.isZero(),
                "text-red-600": showSign && isNegative,
                "text-gray-900": !showSign || decValue.isZero(),
            })}>
                {isCurrency && "Rs. "}
                {isCurrency ? formatPkr(decValue.abs()) : decValue.toString()}
                {showSign && isNegative && " (-)"}
            </p>
        </div>
    );
}

// --- MAIN COMPONENTS ---

function DashboardSummary({ metrics, balance, totalDeposited }: { 
    metrics: HoldingMetric[], 
    balance: number,
    totalDeposited: number
}) {
  const portfolioValue = metrics.reduce((sum, m) => sum.add(m.currentValue), new Prisma.Decimal(0));
  const unrealizedPl = metrics.reduce((sum, m) => sum.add(m.unrealizedGainLoss), new Prisma.Decimal(0));
  const realizedPl = metrics.reduce((sum, m) => sum.add(m.realizedGainLoss), new Prisma.Decimal(0));
  const totalDividends = metrics.reduce((sum, m) => sum.add(m.totalDividends), new Prisma.Decimal(0));
  const totalInvested = metrics.reduce((sum, m) => sum.add(m.investedAmount), new Prisma.Decimal(0));

  return (
    <div className="space-y-8">
      {/* Wallet Summary */}
      <section>
        <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-400">Wallet Summary</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <StatCard title="Total Deposits" value={totalDeposited} />
          <StatCard title="Available Balance" value={balance} />
          <StatCard title="Total Invested" value={totalInvested} />
        </div>
      </section>

      {/* Portfolio Summary */}
      <section>
        <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-400">Portfolio Summary</h2>
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

function HoldingsTable({ metrics }: { metrics: HoldingMetric[] }) {
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
                      "text-green-600": !m.unrealizedGainLoss.isNegative(),
                      "text-red-600": m.unrealizedGainLoss.isNegative(),
                  })}>
                      {m.unrealizedGainLoss.isNegative() ? "" : "+"}{formatPkr(m.unrealizedGainLoss)}
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

// The main page component
export default async function Home() {
  const balance = await getWalletBalance();
  const metrics = await getPortfolioMetrics();
  
  const { _sum: { amount: totalDeposited } } = await prisma.deposit.aggregate({
    _sum: { amount: true }
  });

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Performance overview of your investments.</p>
      </header>
      
      <DashboardSummary 
        metrics={metrics} 
        balance={balance} 
        totalDeposited={Number(totalDeposited ?? 0)} 
      />
      <HoldingsTable metrics={metrics} />
    </div>
  );
}