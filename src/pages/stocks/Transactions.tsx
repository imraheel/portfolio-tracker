import { useSearchParams } from 'react-router-dom';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, ShoppingCart, ArrowDownCircle } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { MetricCard } from '@/components/ui/MetricCard';
import { useStocks } from '@/hooks/stocks/useStocks';
import { useWallet } from '@/hooks/stocks/useWallet';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useTransactions } from '@/hooks/stocks/useTransactions';
import { BuyForm } from '@/components/stocks//BuyForm';
import { SellForm } from '@/components/stocks//SellForm';
import { DividendForm } from '@/components/stocks//DividendForm';

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

function formatPkr(amount: number) {
  return `Rs. ${Number(amount).toLocaleString('en-PK', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`;
}

function TableHeader({ cols }: { cols: { label: string; align?: 'left' | 'right' }[] }) {
  return (
    <thead className="bg-gray-50">
      <tr>
        {cols.map((col, i) => (
          <th
            key={i}
            className={clsx(
              "px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500",
              col.align === 'right' ? "text-right" : "text-left"
            )}
          >
            {col.label}
          </th>
        ))}
      </tr>
    </thead>
  );
}

function BuyTransactionsTable() {
  const { buyTransactions, loading } = useTransactions();

  if (loading) {
    return (
      <div className="mt-8 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="animate-pulse h-48 bg-gray-200"></div>
      </div>
    );
  }

  return (
    <div className="mt-8 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <TableHeader cols={[
              { label: 'Date' },
              { label: 'Stock' },
              { label: 'Quantity', align: 'right' },
              { label: 'Buy Rate', align: 'right' },
              { label: 'Total Cost', align: 'right' },
          ]} />
          <tbody className="divide-y divide-gray-200 bg-white">
            {buyTransactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
                    {new Intl.DateTimeFormat('en-PK').format(new Date(tx.buy_date))}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm font-bold text-gray-900">{tx.stock.symbol}</td>
                <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-gray-600">{tx.quantity.toLocaleString()}</td>
                <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-gray-600">{formatPkr(tx.buy_rate)}</td>
                <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-bold text-gray-900">{formatPkr(tx.total_cost)}</td>
              </tr>
            ))}
            {buyTransactions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">No buy transactions recorded.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SellTransactionsTable() {
    const { sellTransactions, loading } = useTransactions();

    if (loading) {
      return (
        <div className="mt-8 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="animate-pulse h-48 bg-gray-200"></div>
        </div>
      );
    }

    return (
      <div className="mt-8 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <TableHeader cols={[
                { label: 'Date' },
                { label: 'Stock' },
                { label: 'Quantity', align: 'right' },
                { label: 'Sell Rate', align: 'right' },
                { label: 'Proceeds', align: 'right' },
                { label: 'Realized P/L', align: 'right' },
            ]} />
            <tbody className="divide-y divide-gray-200 bg-white">
              {sellTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
                    {new Intl.DateTimeFormat('en-PK').format(new Date(tx.sell_date))}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm font-bold text-gray-900">{tx.stock.symbol}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-gray-600">{tx.quantity.toLocaleString()}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-gray-600">{formatPkr(tx.sell_rate)}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-bold text-gray-900">{formatPkr(tx.total_proceeds)}</td>
                  <td className={clsx(
                      "whitespace-nowrap px-4 py-4 text-right text-sm font-bold",
                      Number(tx.realized_gain_loss) >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {Number(tx.realized_gain_loss) > 0 ? "+" : ""}{formatPkr(tx.realized_gain_loss)}
                  </td>
                </tr>
              ))}
              {sellTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">No sell transactions recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
}

function DividendsTable() {
    const { dividends, loading } = useTransactions();

    if (loading) {
      return (
        <div className="mt-8 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="animate-pulse h-48 bg-gray-200"></div>
        </div>
      );
    }

    return (
        <div className="mt-8 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <TableHeader cols={[
                        { label: 'Date' },
                        { label: 'Stock' },
                        { label: 'Amount', align: 'right' },
                    ]} />
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {dividends.map((div) => (
                            <tr key={div.id} className="hover:bg-gray-50">
                                <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
                                    {new Intl.DateTimeFormat('en-PK').format(new Date(div.dividend_date))}
                                </td>
                                <td className="whitespace-nowrap px-4 py-4 text-sm font-bold text-gray-900">{div.stock.symbol}</td>
                                <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-bold text-green-600">
                                    {formatPkr(div.dividend_amount)}
                                </td>
                            </tr>
                        ))}
                        {dividends.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-6 py-10 text-center text-sm text-gray-500">No dividends recorded yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function Transactions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentView = searchParams.get('view') === 'sell' ? 'sell' : (searchParams.get('view') === 'dividends' ? 'dividends' : 'buy');
  
  const { stocks } = useStocks();
  const { balance } = useWallet();
  const { holdingsMap } = usePortfolio();
  const { buyTransactions, sellTransactions, dividends, loading } = useTransactions();

  const totalInvested = buyTransactions.reduce((sum, tx) => sum + tx.total_cost, 0);
  const totalSold = sellTransactions.reduce((sum, tx) => sum + tx.total_proceeds, 0);
  const totalDividends = dividends.reduce((sum, div) => sum + div.dividend_amount, 0);
  const netInvested = totalInvested - totalSold + totalDividends;

  const handleTabChange = (view: string) => {
    setSearchParams({ view });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto space-y-6"
    >
      <PageHeader
        title="Trading Desk"
        description="Record and track your stock market activities."
        breadcrumbs={[{ label: 'Stocks' }, { label: 'Transactions' }]}
      />

      <motion.div variants={itemVariants}>
        <StatsGrid columns={4}>
          <MetricCard
            title="Total Invested"
            value={formatPkr(totalInvested)}
            icon={<ShoppingCart className="w-5 h-5" />}
            color="blue"
            loading={loading}
          />
          <MetricCard
            title="Total Sold"
            value={formatPkr(totalSold)}
            icon={<ArrowDownCircle className="w-5 h-5" />}
            color="green"
            loading={loading}
          />
          <MetricCard
            title="Total Dividends"
            value={formatPkr(totalDividends)}
            icon={<DollarSign className="w-5 h-5" />}
            color="purple"
            loading={loading}
          />
          <MetricCard
            title="Net Invested"
            value={formatPkr(netInvested)}
            icon={<TrendingUp className="w-5 h-5" />}
            color={netInvested >= 0 ? 'green' : 'red'}
            loading={loading}
          />
        </StatsGrid>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button 
              onClick={() => handleTabChange('buy')}
              className={clsx(
                  "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-bold tracking-wide transition-colors", 
                  currentView === 'buy' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              )}
            >
              Buy Stocks
            </button>
            <button 
              onClick={() => handleTabChange('sell')}
              className={clsx(
                  "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-bold tracking-wide transition-colors", 
                  currentView === 'sell' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              )}
            >
              Sell Stocks
            </button>
            <button 
              onClick={() => handleTabChange('dividends')}
              className={clsx(
                  "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-bold tracking-wide transition-colors", 
                  currentView === 'dividends' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              )}
            >
              Dividends
            </button>
          </nav>
        </div>
      </motion.div>

      <div className="space-y-6">
        {currentView === 'buy' && (<div><BuyForm stocks={stocks} balance={balance} /><BuyTransactionsTable /></div>)}
        {currentView === 'sell' && (<div><SellForm stocks={stocks} holdings={holdingsMap} /><SellTransactionsTable /></div>)}
        {currentView === 'dividends' && (<div><DividendForm stocks={stocks} /><DividendsTable /></div>)}
      </div>
    </motion.div>
  );
}
