import { useNavigate, useSearchParams } from 'react-router-dom';
import { clsx } from 'clsx';
import { SegmentedControl } from '@/components/SegmentedControl';
import { useWallet } from '@/hooks/stocks/useWallet';
import { useTransactions } from '@/hooks/stocks/useTransactions';
import type { Deposit } from '@/services/stocks/wallet';
import type { BuyTransaction, SellTransaction, Dividend } from '@/services/stocks/transactions';

const subNav = [
  { label: 'Holdings', value: '/stocks' },
  { label: 'Wallet', value: '/stocks/wallet' },
  { label: 'Transactions', value: '/stocks/transactions' },
  { label: 'Reports', value: '/stocks/reports' },
];

function formatPkr(amount: number) {
  return amount.toLocaleString('en-PK', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

export default function Reports() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'deposits';

  const tabs = [
    { id: 'deposits', label: 'Deposits' },
    { id: 'buys', label: 'Buys' },
    { id: 'sells', label: 'Sells' },
    { id: 'dividends', label: 'Dividends' },
  ];

  return (
    <div className="space-y-5">
      <SegmentedControl segments={subNav} value="/stocks/reports" onChange={(v) => navigate(v)} />

      <div>
        <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">Reports & History</h2>
        <p className="text-[12px] text-[var(--text-muted)]">Detailed record of all financial activities</p>
      </div>

      <div className="flex gap-1 bg-[var(--bg-tertiary)] p-0.5 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSearchParams({ tab: tab.id })}
            className={clsx(
              "px-3.5 py-1.5 rounded-[7px] text-[12px] font-medium transition-none",
              currentTab === tab.id ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden">
        <div className="px-4 py-2.5 border-b border-[var(--border-subtle)]">
          <span className="text-[13px] font-semibold text-[var(--text-primary)]">{tabs.find(t => t.id === currentTab)?.label} History</span>
        </div>
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

function TableHeader({ cols }: { cols: { label: string; align?: 'left' | 'right' }[] }) {
  return (
    <thead>
      <tr className="border-b border-[var(--border-subtle)]">
        {cols.map((col, i) => (
          <th key={i} className={clsx("px-4 py-2 text-[11px] font-semibold text-[var(--text-secondary)]", col.align === 'right' ? "text-right" : "text-left")}>{col.label}</th>
        ))}
      </tr>
    </thead>
  );
}

function DepositsHistory() {
  const { deposits, loading } = useWallet();
  if (loading) return <div className="p-5 animate-pulse"><div className="h-32 bg-[var(--bg-tertiary)] rounded" /></div>;
  return (
    <table className="w-full">
      <TableHeader cols={[{ label: 'Date' }, { label: 'Note' }, { label: 'Amount', align: 'right' }]} />
      <tbody className="divide-y divide-[var(--border-subtle)]">
        {deposits.map((row: Deposit) => (
          <tr key={row.id} className="hover:bg-[var(--bg-tertiary)]">
            <td className="px-4 py-2.5 text-[12px] text-[var(--text-secondary)]">{row.deposit_date ? new Date(row.deposit_date).toLocaleDateString('en-PK') : '-'}</td>
            <td className="px-4 py-2.5 text-[12px] text-[var(--text-muted)] italic">{row.note || '-'}</td>
            <td className="px-4 py-2.5 text-right text-[12px] font-medium text-[var(--accent-green)]">+Rs. {formatPkr(row.amount)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function BuyHistory() {
  const { buyTransactions, loading } = useTransactions();
  if (loading) return <div className="p-5 animate-pulse"><div className="h-32 bg-[var(--bg-tertiary)] rounded" /></div>;
  return (
    <table className="w-full">
      <TableHeader cols={[{ label: 'Date' }, { label: 'Stock' }, { label: 'Qty', align: 'right' }, { label: 'Rate', align: 'right' }, { label: 'Total', align: 'right' }]} />
      <tbody className="divide-y divide-[var(--border-subtle)]">
        {buyTransactions.map((row: BuyTransaction) => (
          <tr key={row.id} className="hover:bg-[var(--bg-tertiary)]">
            <td className="px-4 py-2.5 text-[12px] text-[var(--text-secondary)]">{new Date(row.buy_date).toLocaleDateString('en-PK')}</td>
            <td className="px-4 py-2.5 text-[12px] font-semibold text-[var(--text-primary)]">{row.stock.symbol}</td>
            <td className="px-4 py-2.5 text-right text-[12px] text-[var(--text-secondary)]">{row.quantity}</td>
            <td className="px-4 py-2.5 text-right text-[12px] text-[var(--text-secondary)]">Rs. {formatPkr(row.buy_rate)}</td>
            <td className="px-4 py-2.5 text-right text-[12px] font-medium text-[var(--accent-red)]">Rs. {formatPkr(row.total_cost)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SellHistory() {
  const { sellTransactions, loading } = useTransactions();
  if (loading) return <div className="p-5 animate-pulse"><div className="h-32 bg-[var(--bg-tertiary)] rounded" /></div>;
  return (
    <table className="w-full">
      <TableHeader cols={[{ label: 'Date' }, { label: 'Stock' }, { label: 'Qty', align: 'right' }, { label: 'Rate', align: 'right' }, { label: 'Proceeds', align: 'right' }, { label: 'P/L', align: 'right' }]} />
      <tbody className="divide-y divide-[var(--border-subtle)]">
        {sellTransactions.map((row: SellTransaction) => (
          <tr key={row.id} className="hover:bg-[var(--bg-tertiary)]">
            <td className="px-4 py-2.5 text-[12px] text-[var(--text-secondary)]">{new Date(row.sell_date).toLocaleDateString('en-PK')}</td>
            <td className="px-4 py-2.5 text-[12px] font-semibold text-[var(--text-primary)]">{row.stock.symbol}</td>
            <td className="px-4 py-2.5 text-right text-[12px] text-[var(--text-secondary)]">{row.quantity}</td>
            <td className="px-4 py-2.5 text-right text-[12px] text-[var(--text-secondary)]">Rs. {formatPkr(row.sell_rate)}</td>
            <td className="px-4 py-2.5 text-right text-[12px] font-medium text-[var(--accent-green)]">Rs. {formatPkr(row.total_proceeds)}</td>
            <td className={clsx("px-4 py-2.5 text-right text-[12px] font-medium", Number(row.realized_gain_loss) >= 0 ? "text-[var(--accent-green)]" : "text-[var(--accent-red)]")}>
              {Number(row.realized_gain_loss) >= 0 ? '+' : ''}Rs. {formatPkr(row.realized_gain_loss)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DividendHistory() {
  const { dividends, loading } = useTransactions();
  if (loading) return <div className="p-5 animate-pulse"><div className="h-32 bg-[var(--bg-tertiary)] rounded" /></div>;
  return (
    <table className="w-full">
      <TableHeader cols={[{ label: 'Date' }, { label: 'Stock' }, { label: 'Amount', align: 'right' }]} />
      <tbody className="divide-y divide-[var(--border-subtle)]">
        {dividends.map((row: Dividend) => (
          <tr key={row.id} className="hover:bg-[var(--bg-tertiary)]">
            <td className="px-4 py-2.5 text-[12px] text-[var(--text-secondary)]">{new Date(row.dividend_date).toLocaleDateString('en-PK')}</td>
            <td className="px-4 py-2.5 text-[12px] font-semibold text-[var(--text-primary)]">{row.stock.symbol}</td>
            <td className="px-4 py-2.5 text-right text-[12px] font-medium text-[var(--accent-green)]">+Rs. {formatPkr(row.dividend_amount)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
