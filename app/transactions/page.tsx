import { getStocks } from '@/app/actions/stocks';
import { 
  getBuyTransactions, 
  getSellTransactions,
  getDividends
} from '@/app/actions/transactions';
import { getWalletBalance } from '@/app/actions/wallet';
import { getPortfolioMetrics } from '@/app/actions/portfolio';
import Link from 'next/link';
import { clsx } from 'clsx';
import { BuyForm } from './BuyForm';
import { SellForm } from './SellForm';
import { DividendForm } from './DividendForm';

function formatPkr(amount: number) {
  return Number(amount).toLocaleString('en-PK', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}

function TableHeader({ cols }: { cols: { label: string; align?: 'left' | 'right' }[] }) {
  return (
    <thead className="bg-gray-50">
      <tr>
        {cols.map((col, i) => (
          <th
            key={i}
            className={clsx(
              "px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-500",
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

async function BuyTransactionsTable() {
  const transactions = await getBuyTransactions();
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
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
                    {new Intl.DateTimeFormat('en-PK').format(new Date(tx.buy_date))}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm font-bold text-gray-900">{tx.stock.symbol}</td>
                <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-gray-600">{tx.quantity.toLocaleString()}</td>
                <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-gray-600">{formatPkr(tx.buyRate)}</td>
                <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-bold text-gray-900">{formatPkr(tx.totalCost)}</td>
              </tr>
            ))}
            {transactions.length === 0 && (
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

async function SellTransactionsTable() {
    const transactions = await getSellTransactions();
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
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
                    {new Intl.DateTimeFormat('en-PK').format(new Date(tx.sell_date))}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm font-bold text-gray-900">{tx.stock.symbol}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-gray-600">{tx.quantity.toLocaleString()}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-gray-600">{formatPkr(tx.sellRate)}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-bold text-gray-900">{formatPkr(tx.totalProceeds)}</td>
                  <td className={clsx(
                      "whitespace-nowrap px-4 py-4 text-right text-sm font-bold",
                      Number(tx.realizedGainLoss) >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {Number(tx.realizedGainLoss) > 0 ? "+" : ""}{formatPkr(tx.realizedGainLoss)}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
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

async function DividendsTable() {
    const dividends = await getDividends();
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
                                    {formatPkr(div.dividendAmount)}
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

export const dynamic = 'force-dynamic';

export default async function TransactionsPage({ searchParams }: { searchParams?: Promise<{ view?: string }> }) {
  const params = await searchParams;
  const currentView = params?.view === 'sell' ? 'sell' : (params?.view === 'dividends' ? 'dividends' : 'buy');
  
  const stocks = await getStocks();
  const balance = await getWalletBalance();
  const metrics = await getPortfolioMetrics();
  
  const holdingsMap = new Map<number, number>(
    metrics.map(m => [m.stockId, m.remainingQty])
  );

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Trading Desk</h1>
        <p className="mt-1 text-sm text-gray-500">Record and track your stock market activities.</p>
      </header>

      <div className="mb-8 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <Link 
            href="/transactions?view=buy" 
            className={clsx(
                "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-bold tracking-wide transition-colors", 
                currentView === 'buy' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            )}
          >
            Buy Stocks
          </Link>
          <Link 
            href="/transactions?view=sell" 
            className={clsx(
                "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-bold tracking-wide transition-colors", 
                currentView === 'sell' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            )}
          >
            Sell Stocks
          </Link>
          <Link 
            href="/transactions?view=dividends" 
            className={clsx(
                "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-bold tracking-wide transition-colors", 
                currentView === 'dividends' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            )}
          >
            Dividends
          </Link>
        </nav>
      </div>

      <div className="space-y-4">
        {currentView === 'buy' && (<div><BuyForm stocks={stocks} balance={balance} /><BuyTransactionsTable /></div>)}
        {currentView === 'sell' && (<div><SellForm stocks={stocks} holdings={holdingsMap} /><SellTransactionsTable /></div>)}
        {currentView === 'dividends' && (<div><DividendForm stocks={stocks} /><DividendsTable /></div>)}
      </div>
    </div>
  );
}
