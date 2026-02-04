import { useSearchParams } from 'react-router-dom';
import { clsx } from 'clsx';
import { useWallet } from '@/hooks/stocks/useWallet';
import { useTransactions } from '@/hooks/stocks/useTransactions';

function formatPkr(amount: number) {
  return amount.toLocaleString('en-PK', {
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

function DepositsHistory() {
  const { deposits, loading } = useWallet();

  if (loading) {
    return (
      <div className="animate-pulse h-48 bg-gray-200 rounded"></div>
    );
  }

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <TableHeader cols={[
        { label: 'Date' },
        { label: 'Note' },
        { label: 'Amount', align: 'right' },
      ]} />
      <tbody className="divide-y divide-gray-200 bg-white">
        {deposits.map((row) => (
          <tr key={row.id}>
            <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
              {row.deposit_date ? new Date(row.deposit_date).toLocaleDateString('en-PK') : '-'}
            </td>
            <td className="px-4 py-4 text-sm text-gray-500 italic">{row.note || '-'}</td>
            <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-bold text-gray-900">
              {formatPkr(row.amount)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function BuyHistory() {
  const { buyTransactions, loading } = useTransactions();

  if (loading) {
    return (
      <div className="animate-pulse h-48 bg-gray-200 rounded"></div>
    );
  }

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <TableHeader cols={[
        { label: 'Date' },
        { label: 'Stock' },
        { label: 'Qty', align: 'right' },
        { label: 'Rate', align: 'right' },
        { label: 'Total', align: 'right' },
      ]} />
      <tbody className="divide-y divide-gray-200 bg-white">
        {buyTransactions.map((row) => (
          <tr key={row.id}>
            <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
              {row.buy_date ? new Date(row.buy_date).toLocaleDateString('en-PK') : '-'}
            </td>
            <td className="whitespace-nowrap px-4 py-4 text-sm font-bold text-gray-900">{row.stock.symbol}</td>
            <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-gray-600">{row.quantity}</td>
            <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-gray-600">{formatPkr(row.buy_rate)}</td>
            <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-bold text-gray-900">{formatPkr(row.total_cost)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SellHistory() {
  const { sellTransactions, loading } = useTransactions();

  if (loading) {
    return (
      <div className="animate-pulse h-48 bg-gray-200 rounded"></div>
    );
  }

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <TableHeader cols={[
        { label: 'Date' },
        { label: 'Stock' },
        { label: 'Qty', align: 'right' },
        { label: 'Rate', align: 'right' },
        { label: 'Proceeds', align: 'right' },
        { label: 'P/L', align: 'right' },
      ]} />
      <tbody className="divide-y divide-gray-200 bg-white">
        {sellTransactions.map((row) => (
          <tr key={row.id}>
            <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
              {row.sell_date ? new Date(row.sell_date).toLocaleDateString('en-PK') : '-'}
            </td>
            <td className="whitespace-nowrap px-4 py-4 text-sm font-bold text-gray-900">{row.stock.symbol}</td>
            <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-gray-600">{row.quantity}</td>
            <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-gray-600">{formatPkr(row.sell_rate)}</td>
            <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-bold text-gray-900">{formatPkr(row.total_proceeds)}</td>
            <td className={clsx(
              "whitespace-nowrap px-4 py-4 text-right text-sm font-bold",
              Number(row.realized_gain_loss) >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {formatPkr(row.realized_gain_loss)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DividendHistory() {
  const { dividends, loading } = useTransactions();

  if (loading) {
    return (
      <div className="animate-pulse h-48 bg-gray-200 rounded"></div>
    );
  }

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <TableHeader cols={[
        { label: 'Date' },
        { label: 'Stock' },
        { label: 'Amount', align: 'right' },
      ]} />
      <tbody className="divide-y divide-gray-200 bg-white">
        {dividends.map((row) => (
          <tr key={row.id}>
            <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
              {row.dividend_date ? new Date(row.dividend_date).toLocaleDateString('en-PK') : '-'}
            </td>
            <td className="whitespace-nowrap px-4 py-4 text-sm font-bold text-gray-900">{row.stock.symbol}</td>
            <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-bold text-green-600">
              {formatPkr(row.dividend_amount)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Reports() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'deposits';

  const tabs = [
    { id: 'deposits', label: 'Deposits' },
    { id: 'buys', label: 'Buys' },
    { id: 'sells', label: 'Sells' },
    { id: 'dividends', label: 'Dividends' },
  ];

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Reports & History</h1>
        <p className="mt-1 text-sm text-gray-500">Detailed record of all financial activities.</p>
      </header>

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={clsx(
                "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-bold tracking-wide transition-colors",
                currentTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          {currentTab === 'deposits' && <DepositsHistory />}
          {currentTab === 'buys' && <BuyHistory />}
          {currentTab === 'sells' && <SellHistory />}
          {currentTab === 'dividends' && <DividendHistory />}
        </div>
      </div>
    </div>
  );
}
