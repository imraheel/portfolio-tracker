import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { clsx } from 'clsx';
import { TrendingUp, DollarSign, ShoppingCart, ArrowDownCircle } from 'lucide-react';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Modal } from '@/components/Modal';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { MetricCard } from '@/components/ui/MetricCard';
import { useStocks } from '@/hooks/stocks/useStocks';
import { useWallet } from '@/hooks/stocks/useWallet';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useTransactions } from '@/hooks/stocks/useTransactions';
import type { BuyTransaction, SellTransaction, Dividend } from '@/services/stocks/transactions';
import { BuyForm } from '@/components/stocks/BuyForm';
import { SellForm } from '@/components/stocks/SellForm';
import { DividendForm } from '@/components/stocks/DividendForm';

const subNav = [
  { label: 'Holdings', value: '/stocks' },
  { label: 'Wallet', value: '/stocks/wallet' },
  { label: 'Transactions', value: '/stocks/transactions' },
  { label: 'Reports', value: '/stocks/reports' },
];

function formatPkr(amount: number) {
  return `Rs. ${Number(amount).toLocaleString('en-PK', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;
}

function TableHeader({ cols }: { cols: { label: string; align?: 'left' | 'right' }[] }) {
  return (
    <thead>
      <tr className="border-b border-[var(--border-subtle)]">
        {cols.map((col, i) => (
          <th key={i} className={clsx("px-4 py-2 text-[11px] font-semibold text-[var(--text-secondary)]", col.align === 'right' ? "text-right" : "text-left")}>
            {col.label}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export default function Transactions() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentView = searchParams.get('view') === 'sell' ? 'sell' : (searchParams.get('view') === 'dividends' ? 'dividends' : 'buy');
  const [modalType, setModalType] = useState<'buy' | 'sell' | 'dividend' | null>(null);

  const { stocks } = useStocks();
  const { balance } = useWallet();
  const { holdingsMap } = usePortfolio();
  const { buyTransactions, sellTransactions, dividends, loading } = useTransactions();

  const totalInvested = buyTransactions.reduce((sum, tx) => sum + tx.total_cost, 0);
  const totalSold = sellTransactions.reduce((sum, tx) => sum + tx.total_proceeds, 0);
  const totalDividends = dividends.reduce((sum, div) => sum + div.dividend_amount, 0);
  const netInvested = totalInvested - totalSold + totalDividends;

  const modalTitle = modalType === 'buy' ? 'Buy Stocks' : modalType === 'sell' ? 'Sell Stocks' : 'Record Dividend';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <SegmentedControl segments={subNav} value="/stocks/transactions" onChange={(v) => navigate(v)} />
        <div className="flex gap-2">
          <button onClick={() => setModalType('buy')}
            className="h-[28px] px-3 rounded-[6px] bg-[var(--accent-blue)] text-white text-[12px] font-medium hover:bg-[var(--accent-blue-dark)] flex items-center gap-1.5">
            + Buy
          </button>
          <button onClick={() => setModalType('sell')}
            className="h-[28px] px-3 rounded-[6px] border border-[var(--border-default)] text-[var(--text-secondary)] text-[12px] font-medium hover:bg-[var(--bg-tertiary)] flex items-center gap-1.5">
            + Sell
          </button>
          <button onClick={() => setModalType('dividend')}
            className="h-[28px] px-3 rounded-[6px] border border-[var(--border-default)] text-[var(--text-secondary)] text-[12px] font-medium hover:bg-[var(--bg-tertiary)] flex items-center gap-1.5">
            + Dividend
          </button>
        </div>
      </div>

      <StatsGrid columns={4}>
        <MetricCard title="Total Invested" value={formatPkr(totalInvested)} icon={<ShoppingCart className="w-5 h-5" />} variant="default" />
        <MetricCard title="Total Sold" value={formatPkr(totalSold)} icon={<ArrowDownCircle className="w-5 h-5" />} variant="green" />
        <MetricCard title="Total Dividends" value={formatPkr(totalDividends)} icon={<DollarSign className="w-5 h-5" />} variant="blue" />
        <MetricCard title="Net Invested" value={formatPkr(netInvested)} icon={<TrendingUp className="w-5 h-5" />} variant={netInvested >= 0 ? 'green' : 'red'} />
      </StatsGrid>

      <div className="flex gap-1 bg-[var(--bg-tertiary)] p-0.5 rounded-lg w-fit">
        {['buy', 'sell', 'dividends'].map((tab) => (
          <button
            key={tab}
            onClick={() => setSearchParams({ view: tab })}
            className={clsx(
              "px-3.5 py-1.5 rounded-[7px] text-[12px] font-medium transition-none",
              currentView === tab ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )}
          >
            {tab === 'buy' ? 'Buy History' : tab === 'sell' ? 'Sell History' : 'Dividend History'}
          </button>
        ))}
      </div>

      {currentView === 'buy' && (
        <BuyTransactionsTable buyTransactions={buyTransactions} loading={loading} />
      )}
      {currentView === 'sell' && (
        <SellTransactionsTable sellTransactions={sellTransactions} loading={loading} />
      )}
      {currentView === 'dividends' && (
        <DividendsTable dividends={dividends} loading={loading} />
      )}

      <Modal open={modalType === 'buy'} onClose={() => setModalType(null)} title={modalTitle} width="md">
        <BuyForm stocks={stocks} balance={balance} onSuccess={() => setModalType(null)} />
      </Modal>
      <Modal open={modalType === 'sell'} onClose={() => setModalType(null)} title={modalTitle} width="md">
        <SellForm stocks={stocks} holdings={holdingsMap} onSuccess={() => setModalType(null)} />
      </Modal>
      <Modal open={modalType === 'dividend'} onClose={() => setModalType(null)} title={modalTitle} width="md">
        <DividendForm stocks={stocks} onSuccess={() => setModalType(null)} />
      </Modal>
    </div>
  );
}

function BuyTransactionsTable({ buyTransactions, loading }: { buyTransactions: BuyTransaction[]; loading: boolean }) {
  if (loading) return <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-5 animate-pulse"><div className="h-40 bg-[var(--bg-tertiary)] rounded" /></div>;
  return (
    <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden">
      <table className="w-full">
        <TableHeader cols={[{ label: 'Date' }, { label: 'Stock' }, { label: 'Quantity', align: 'right' }, { label: 'Buy Rate', align: 'right' }, { label: 'Total Cost', align: 'right' }]} />
        <tbody className="divide-y divide-[var(--border-subtle)]">
          {buyTransactions.map((tx: BuyTransaction) => (
            <tr key={tx.id} className="hover:bg-[var(--bg-tertiary)]">
              <td className="px-4 py-2.5 text-[12px] text-[var(--text-secondary)]">{new Date(tx.buy_date).toLocaleDateString('en-PK')}</td>
              <td className="px-4 py-2.5 text-[12px] font-semibold text-[var(--text-primary)]">{tx.stock.symbol}</td>
              <td className="px-4 py-2.5 text-right text-[12px] text-[var(--text-secondary)]">{tx.quantity.toLocaleString()}</td>
              <td className="px-4 py-2.5 text-right text-[12px] text-[var(--text-secondary)]">{formatPkr(tx.buy_rate)}</td>
              <td className="px-4 py-2.5 text-right text-[12px] font-medium text-[var(--accent-red)]">{formatPkr(tx.total_cost)}</td>
            </tr>
          ))}
          {buyTransactions.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-[13px] text-[var(--text-muted)]">No buy transactions.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function SellTransactionsTable({ sellTransactions, loading }: { sellTransactions: SellTransaction[]; loading: boolean }) {
  if (loading) return <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-5 animate-pulse"><div className="h-40 bg-[var(--bg-tertiary)] rounded" /></div>;
  return (
    <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden">
      <table className="w-full">
        <TableHeader cols={[{ label: 'Date' }, { label: 'Stock' }, { label: 'Quantity', align: 'right' }, { label: 'Sell Rate', align: 'right' }, { label: 'Proceeds', align: 'right' }, { label: 'Realized P/L', align: 'right' }]} />
        <tbody className="divide-y divide-[var(--border-subtle)]">
          {sellTransactions.map((tx: SellTransaction) => (
            <tr key={tx.id} className="hover:bg-[var(--bg-tertiary)]">
              <td className="px-4 py-2.5 text-[12px] text-[var(--text-secondary)]">{new Date(tx.sell_date).toLocaleDateString('en-PK')}</td>
              <td className="px-4 py-2.5 text-[12px] font-semibold text-[var(--text-primary)]">{tx.stock.symbol}</td>
              <td className="px-4 py-2.5 text-right text-[12px] text-[var(--text-secondary)]">{tx.quantity.toLocaleString()}</td>
              <td className="px-4 py-2.5 text-right text-[12px] text-[var(--text-secondary)]">{formatPkr(tx.sell_rate)}</td>
              <td className="px-4 py-2.5 text-right text-[12px] font-medium text-[var(--accent-green)]">{formatPkr(tx.total_proceeds)}</td>
              <td className={clsx("px-4 py-2.5 text-right text-[12px] font-medium", Number(tx.realized_gain_loss) >= 0 ? "text-[var(--accent-green)]" : "text-[var(--accent-red)]")}>
                {Number(tx.realized_gain_loss) >= 0 ? '+' : ''}{formatPkr(tx.realized_gain_loss)}
              </td>
            </tr>
          ))}
          {sellTransactions.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-[13px] text-[var(--text-muted)]">No sell transactions.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function DividendsTable({ dividends, loading }: { dividends: Dividend[]; loading: boolean }) {
  if (loading) return <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-5 animate-pulse"><div className="h-40 bg-[var(--bg-tertiary)] rounded" /></div>;
  return (
    <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden">
      <table className="w-full">
        <TableHeader cols={[{ label: 'Date' }, { label: 'Stock' }, { label: 'Amount', align: 'right' }]} />
        <tbody className="divide-y divide-[var(--border-subtle)]">
          {dividends.map((div: Dividend) => (
            <tr key={div.id} className="hover:bg-[var(--bg-tertiary)]">
              <td className="px-4 py-2.5 text-[12px] text-[var(--text-secondary)]">{new Date(div.dividend_date).toLocaleDateString('en-PK')}</td>
              <td className="px-4 py-2.5 text-[12px] font-semibold text-[var(--text-primary)]">{div.stock.symbol}</td>
              <td className="px-4 py-2.5 text-right text-[12px] font-medium text-[var(--accent-green)]">+{formatPkr(div.dividend_amount)}</td>
            </tr>
          ))}
          {dividends.length === 0 && <tr><td colSpan={3} className="px-4 py-10 text-center text-[13px] text-[var(--text-muted)]">No dividends recorded.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
