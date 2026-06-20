import { useStocks } from '@/hooks/stocks/useStocks';
import { StockForm } from '@/components/stocks/StockForm';
import { UpdatePriceForm } from '@/components/stocks/UpdatePriceForm';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BarChart3, TrendingUp, DollarSign } from 'lucide-react';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { MetricCard } from '@/components/ui/MetricCard';

function formatPkr(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function StocksTable() {
  const { stocks, priceMap, loading } = useStocks();
  
  if (loading) {
    return (
      <Card className="bg-[var(--bg-tertiary)]">
        <div className="h-64 bg-[var(--bg-tertiary)] rounded" />
      </Card>
    );
  }

  return (
    <Card hover={false}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-[var(--accent-gold)]" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-gold)]">
              Watchlist
            </span>
          </div>
          <h3 className="font-display text-xl text-[var(--text-primary)]">Stock Prices</h3>
          <p className="text-sm text-[var(--text-muted)] mt-1">Manage symbols and update latest market prices</p>
        </div>
        <Badge variant="gold">{stocks.length} stocks</Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border-subtle)]">
              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">
                Symbol
              </th>
              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">
                Company / Sector
              </th>
              <th className="px-4 py-3 text-right text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">
                Current Price (PKR)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {stocks.map((stock) => (
              <tr 
                key={stock.symbol}
                className="hover:bg-[var(--bg-elevated)]/30 transition-colors"
              >
                <td className="whitespace-nowrap px-4 py-4">
                  <span className="font-mono font-semibold text-[var(--text-primary)]">{stock.symbol}</span>
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  <div className="text-sm text-[var(--text-primary)]">{stock.company_name || '-'}</div>
                  <div className="text-xs text-[var(--text-muted)]">{stock.sector || '-'}</div>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-right">
                  <UpdatePriceForm 
                    symbol={stock.symbol} 
                    currentPrice={priceMap.get(stock.symbol)?.toString() ?? '0'} 
                  />
                </td>
              </tr>
            ))}
            {stocks.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-sm text-[var(--text-muted)]">
                  No stocks defined in your monitoring list.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default function Stocks() {
  const { stocks, priceMap } = useStocks();
  
  const totalStocks = stocks.length;
  const totalValue = stocks.reduce((sum, stock) => {
    const price = priceMap.get(stock.symbol) || 0;
    return sum + price;
  }, 0);
  const avgPrice = totalStocks > 0 ? totalValue / totalStocks : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader
        title="Stock Prices"
        description="Manage symbols and update latest market prices."
        breadcrumbs={[{ label: 'Stocks' }, { label: 'Prices' }]}
      />

      <div>
        <StatsGrid columns={3}>
          <MetricCard
            title="Total Stocks"
            value={totalStocks.toString()}
            icon={<TrendingUp className="w-5 h-5" />}
            variant="default"
           
          />
          <MetricCard
            title="Average Price"
            value={formatPkr(avgPrice)}
            icon={<DollarSign className="w-5 h-5" />}
            variant="gold"
           
          />
          <MetricCard
            title="Tracked Symbols"
            value={totalStocks.toString()}
            icon={<BarChart3 className="w-5 h-5" />}
            variant="sage"
           
          />
        </StatsGrid>
      </div>

      <div>
        <Card hover={false}>
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-[var(--accent-gold)]" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-gold)]">
                New Stock
              </span>
            </div>
            <h3 className="font-display text-xl text-[var(--text-primary)]">Add New Stock</h3>
            <p className="text-sm text-[var(--text-muted)] mt-1">Register a new stock symbol to track</p>
          </div>
          <StockForm />
        </Card>
      </div>

      <div>
        <StocksTable />
      </div>
    </div>
  );
}
