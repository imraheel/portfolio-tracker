import { useSearchParams } from 'react-router-dom';
import { clsx } from 'clsx';
import { TrendingUp, DollarSign, ShoppingCart, ArrowDownCircle } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { MetricCard } from '@/components/ui/MetricCard';
import { Card } from '@/components/ui/Card';
import { useStocks } from '@/hooks/stocks/useStocks';
import { useWallet } from '@/hooks/stocks/useWallet';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useTransactions } from '@/hooks/stocks/useTransactions';
import { BuyForm } from '@/components/stocks/BuyForm';
import { SellForm } from '@/components/stocks/SellForm';
import { DividendForm } from '@/components/stocks/DividendForm';

function formatPkr(amount: number) {
  return `Rs. ${Number(amount).toLocaleString('en-PK', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`;
}

function TableHeader({ cols }: { cols: { label: string; align?: 'left' | 'right' }[] }) {
  return (
    <thead>
      <tr className="border-b border-[var(--border-subtle)]">
        {cols.map((col, i) => (
          <th
            key={i}
            className={clsx(
              "px-4 py-3 text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium",
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
      <Card className="bg-[var(--bg-tertiary)]">
        <div className="h-64 bg-[var(--bg-tertiary)] rounded" />
      </Card>
    );
  }

  return (
    <Card hover={false}>
      <div className="flex items-center gap-2 mb-4">
        <ShoppingCart className="w-4 h-4 text-[var(--accent-gold)]" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-gold)]">
          Buy History
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <TableHeader cols={[
              { label: 'Date' },
              { label: 'Stock' },
              { label: 'Quantity', align: 'right' },
              { label: 'Buy Rate', align: 'right' },
              { label: 'Total Cost', align: 'right' },
          ]} />
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {buyTransactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-[var(--bg-elevated)]/30 transition-colors">
                <td className="whitespace-nowrap px-4 py-4 text-sm text-[var(--text-secondary)]">
                    {new Intl.DateTimeFormat('en-PK').format(new Date(tx.buy_date))}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm font-mono font-medium text-[var(--text-primary)]">{tx.stock.symbol}</td>
                <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-[var(--text-secondary)]">{tx.quantity.toLocaleString()}</td>
                <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-[var(--text-secondary)]">{formatPkr(tx.buy_rate)}</td>
                <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-mono font-medium text-[var(--accent-coral)]">{formatPkr(tx.total_cost)}</td>
              </tr>
            ))}
            {buyTransactions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-[var(--text-muted)]">No buy transactions recorded.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function SellTransactionsTable() {
    const { sellTransactions, loading } = useTransactions();

    if (loading) {
      return (
        <Card className="bg-[var(--bg-tertiary)]">
          <div className="h-64 bg-[var(--bg-tertiary)] rounded" />
        </Card>
      );
    }

    return (
      <Card hover={false}>
        <div className="flex items-center gap-2 mb-4">
          <ArrowDownCircle className="w-4 h-4 text-[var(--accent-sage)]" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-sage)]">
            Sell History
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <TableHeader cols={[
                { label: 'Date' },
                { label: 'Stock' },
                { label: 'Quantity', align: 'right' },
                { label: 'Sell Rate', align: 'right' },
                { label: 'Proceeds', align: 'right' },
                { label: 'Realized P/L', align: 'right' },
            ]} />
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {sellTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[var(--bg-elevated)]/30 transition-colors">
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-[var(--text-secondary)]">
                    {new Intl.DateTimeFormat('en-PK').format(new Date(tx.sell_date))}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm font-mono font-medium text-[var(--text-primary)]">{tx.stock.symbol}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-[var(--text-secondary)]">{tx.quantity.toLocaleString()}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-[var(--text-secondary)]">{formatPkr(tx.sell_rate)}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-mono font-medium text-[var(--accent-sage)]">{formatPkr(tx.total_proceeds)}</td>
                  <td className={clsx(
                      "whitespace-nowrap px-4 py-4 text-right text-sm font-mono font-medium",
                      Number(tx.realized_gain_loss) >= 0 ? "text-[var(--accent-sage)]" : "text-[var(--accent-coral)]"
                  )}>
                    {Number(tx.realized_gain_loss) > 0 ? "+" : ""}{formatPkr(tx.realized_gain_loss)}
                  </td>
                </tr>
              ))}
              {sellTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-[var(--text-muted)]">No sell transactions recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    );
}

function DividendsTable() {
    const { dividends, loading } = useTransactions();

    if (loading) {
      return (
        <Card className="bg-[var(--bg-tertiary)]">
          <div className="h-64 bg-[var(--bg-tertiary)] rounded" />
        </Card>
      );
    }

    return (
        <Card hover={false}>
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-4 h-4 text-[var(--accent-gold)]" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-gold)]">
                Dividend History
              </span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <TableHeader cols={[
                        { label: 'Date' },
                        { label: 'Stock' },
                        { label: 'Amount', align: 'right' },
                    ]} />
                    <tbody className="divide-y divide-[var(--border-subtle)]">
                        {dividends.map((div) => (
                            <tr key={div.id} className="hover:bg-[var(--bg-elevated)]/30 transition-colors">
                                <td className="whitespace-nowrap px-4 py-4 text-sm text-[var(--text-secondary)]">
                                    {new Intl.DateTimeFormat('en-PK').format(new Date(div.dividend_date))}
                                </td>
                                <td className="whitespace-nowrap px-4 py-4 text-sm font-mono font-medium text-[var(--text-primary)]">{div.stock.symbol}</td>
                                <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-mono font-medium text-[var(--accent-gold)]">
                                    +{formatPkr(div.dividend_amount)}
                                </td>
                            </tr>
                        ))}
                        {dividends.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-6 py-12 text-center text-sm text-[var(--text-muted)]">No dividends recorded yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}

export default function Transactions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentView = searchParams.get('view') === 'sell' ? 'sell' : (searchParams.get('view') === 'dividends' ? 'dividends' : 'buy');
  
  const { stocks } = useStocks();
  const { balance } = useWallet();
  const { holdingsMap } = usePortfolio();
  const { buyTransactions, sellTransactions, dividends } = useTransactions();

  const totalInvested = buyTransactions.reduce((sum, tx) => sum + tx.total_cost, 0);
  const totalSold = sellTransactions.reduce((sum, tx) => sum + tx.total_proceeds, 0);
  const totalDividends = dividends.reduce((sum, div) => sum + div.dividend_amount, 0);
  const netInvested = totalInvested - totalSold + totalDividends;

  const handleTabChange = (view: string) => {
    setSearchParams({ view });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader
        title="Trading Desk"
        description="Record and track your stock market activities."
        breadcrumbs={[{ label: 'Stocks' }, { label: 'Transactions' }]}
      />

      <div>
        <StatsGrid columns={4}>
          <MetricCard
            title="Total Invested"
            value={formatPkr(totalInvested)}
            icon={<ShoppingCart className="w-5 h-5" />}
            variant="default"
           
          />
          <MetricCard
            title="Total Sold"
            value={formatPkr(totalSold)}
            icon={<ArrowDownCircle className="w-5 h-5" />}
            variant="sage"
           
          />
          <MetricCard
            title="Total Dividends"
            value={formatPkr(totalDividends)}
            icon={<DollarSign className="w-5 h-5" />}
            variant="gold"
           
          />
          <MetricCard
            title="Net Invested"
            value={formatPkr(netInvested)}
            icon={<TrendingUp className="w-5 h-5" />}
            variant={netInvested >= 0 ? 'sage' : 'coral'}
           
          />
        </StatsGrid>
      </div>

      <div className="border-b border-[var(--border-subtle)]">
        <nav className="-mb-px flex space-x-8">
          <button 
            onClick={() => handleTabChange('buy')}
            className={clsx(
                "flex items-center gap-2 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium tracking-wide transition-colors", 
                currentView === 'buy' 
                  ? 'border-[var(--accent-gold)] text-[var(--accent-gold)]' 
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            )}
          >
            <ShoppingCart className="w-4 h-4" />
            Buy Stocks
          </button>
          <button 
            onClick={() => handleTabChange('sell')}
            className={clsx(
                "flex items-center gap-2 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium tracking-wide transition-colors", 
                currentView === 'sell' 
                  ? 'border-[var(--accent-sage)] text-[var(--accent-sage)]' 
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            )}
          >
            <ArrowDownCircle className="w-4 h-4" />
            Sell Stocks
          </button>
          <button 
            onClick={() => handleTabChange('dividends')}
            className={clsx(
                "flex items-center gap-2 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium tracking-wide transition-colors", 
                currentView === 'dividends' 
                  ? 'border-[var(--accent-gold)] text-[var(--accent-gold)]' 
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            )}
          >
            <DollarSign className="w-4 h-4" />
            Dividends
          </button>
        </nav>
      </div>

      <div className="space-y-6">
        {currentView === 'buy' && (
          <div>
            <Card hover={false}>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <ShoppingCart className="w-4 h-4 text-[var(--accent-gold)]" />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-gold)]">
                    Buy
                  </span>
                </div>
                <h3 className="font-display text-xl text-[var(--text-primary)]">Buy Stocks</h3>
                <p className="text-sm text-[var(--text-muted)] mt-1">Purchase stocks using your available balance</p>
              </div>
              <BuyForm stocks={stocks} balance={balance} />
            </Card>
            <div className="mt-6">
              <BuyTransactionsTable />
            </div>
          </div>
        )}
        {currentView === 'sell' && (
          <div>
            <Card hover={false}>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <ArrowDownCircle className="w-4 h-4 text-[var(--accent-sage)]" />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-sage)]">
                    Sell
                  </span>
                </div>
                <h3 className="font-display text-xl text-[var(--text-primary)]">Sell Stocks</h3>
                <p className="text-sm text-[var(--text-muted)] mt-1">Sell your stock holdings</p>
              </div>
              <SellForm stocks={stocks} holdings={holdingsMap} />
            </Card>
            <div className="mt-6">
              <SellTransactionsTable />
            </div>
          </div>
        )}
        {currentView === 'dividends' && (
          <div>
            <Card hover={false}>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-[var(--accent-gold)]" />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-gold)]">
                    Dividends
                  </span>
                </div>
                <h3 className="font-display text-xl text-[var(--text-primary)]">Record Dividends</h3>
                <p className="text-sm text-[var(--text-muted)] mt-1">Record dividend payments from your stocks</p>
              </div>
              <DividendForm stocks={stocks} />
            </Card>
            <div className="mt-6">
              <DividendsTable />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
