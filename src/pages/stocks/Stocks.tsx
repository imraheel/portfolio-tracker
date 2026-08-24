import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertCircle, TrendingUp, DollarSign, BarChart3, RefreshCw, ArrowDownToLine } from 'lucide-react';
import * as stocksService from '@/services/stocks/stocks';
import { fetchLivePrices, type LivePrice } from '@/services/stocks/psxPrice';
import { queryKeys } from '@/lib/queryKeys';
import { StockForm } from '@/components/stocks/StockForm';
import { UpdatePriceForm } from '@/components/stocks/UpdatePriceForm';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Modal } from '@/components/Modal';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { MetricCard } from '@/components/ui/MetricCard';

const subNav = [
  { label: 'Holdings', value: '/stocks' },
  { label: 'Wallet', value: '/stocks/wallet' },
  { label: 'Transactions', value: '/stocks/transactions' },
  { label: 'Reports', value: '/stocks/reports' },
];

function formatPkr(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <AlertCircle className="w-12 h-12 text-[var(--accent-red)] mb-4" />
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">Failed to load stocks</h3>
      <p className="text-sm text-[var(--text-muted)]">{message}</p>
    </div>
  );
}

export default function Stocks() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  const { data: stocks = [], isLoading: stocksLoading, error: stocksError } = useQuery({
    queryKey: queryKeys.stocks.list(),
    queryFn: stocksService.getStocks,
    staleTime: 10 * 60 * 1000,
  });

  const { data: prices = [], isLoading: pricesLoading, error: pricesError } = useQuery({
    queryKey: queryKeys.stocks.prices(),
    queryFn: stocksService.getStockPrices,
    staleTime: 2 * 60 * 1000,
  });

  const loading = stocksLoading || pricesLoading;
  const error = stocksError ?? pricesError;

  const priceMap = useMemo(() => new Map(prices.map(p => [p.symbol, p.current_price])), [prices]);

  const [livePriceMap, setLivePriceMap] = useState<Map<string, LivePrice>>(new Map());
  const [liveLoading, setLiveLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchAllLivePrices = async () => {
    if (stocks.length === 0) return;
    setLiveLoading(true);
    try {
      const symbols = stocks.map(s => s.symbol);
      const map = await fetchLivePrices(symbols);
      setLivePriceMap(map);
      setLastFetched(new Date());
    } catch (error) {
      console.error('Failed to fetch live prices:', error);
    } finally {
      setLiveLoading(false);
    }
  };

  const [syncing, setSyncing] = useState(false);

  const handleSyncPrices = async () => {
    if (stocks.length === 0) return;

    setSyncing(true);
    try {
      const symbols = stocks.map(s => s.symbol);
      const liveMap = await fetchLivePrices(symbols);

      if (liveMap.size === 0) {
        toast.error('No live prices could be fetched. Are you running in Electron?');
        return;
      }

      let updated = 0;
      let failed = 0;

      for (const stock of stocks) {
        const live = liveMap.get(stock.symbol);
        if (!live) {
          failed++;
          continue;
        }

        const result = await stocksService.updateStockPrice({
          symbol: stock.symbol,
          currentPrice: live.price,
        });

        if (result.success) {
          updated++;
        } else {
          failed++;
        }
      }

      queryClient.invalidateQueries({ queryKey: queryKeys.stocks.prices() });
      setLivePriceMap(liveMap);
      setLastFetched(new Date());

      if (failed === 0) {
        toast.success(`Synced ${updated} stock price${updated !== 1 ? 's' : ''} from PSX`);
      } else {
        toast.warning(`Synced ${updated}, failed ${failed} stock price${failed !== 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error('Failed to sync prices');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (stocks.length > 0) {
      fetchAllLivePrices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stocks.length]);

  const totalStocks = stocks.length;
  const totalValue = stocks.reduce((sum, s) => sum + (priceMap.get(s.symbol) || 0), 0);
  const avgPrice = totalStocks > 0 ? totalValue / totalStocks : 0;

  if (error) {
    return (
      <div className="space-y-5">
        <SegmentedControl segments={subNav} value="/stocks" onChange={(v) => navigate(v)} />
        <ErrorState message={typeof error === 'string' ? error : error.message} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <SegmentedControl segments={subNav} value="/stocks" onChange={(v) => navigate(v)} />
      </div>

      <StatsGrid columns={3}>
        <MetricCard title="Total Stocks" value={totalStocks.toString()} icon={<TrendingUp className="w-5 h-5" />} variant="default" />
        <MetricCard title="Average Price" value={formatPkr(avgPrice)} icon={<DollarSign className="w-5 h-5" />} variant="blue" />
        <MetricCard title="Tracked Symbols" value={totalStocks.toString()} icon={<BarChart3 className="w-5 h-5" />} variant="green" />
      </StatsGrid>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">Holdings</h2>
          <p className="text-[12px] text-[var(--text-muted)]">
            Manage symbols and update market prices
            {lastFetched && ` · Live prices fetched ${lastFetched.toLocaleTimeString()}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncPrices}
            disabled={syncing || stocks.length === 0}
            className="h-[28px] px-3 rounded-[6px] bg-[var(--accent-green)] text-white text-[12px] font-medium hover:bg-[var(--accent-green-dark)] disabled:opacity-50 flex items-center gap-1.5"
          >
            <ArrowDownToLine className={`w-3 h-3 ${syncing ? 'animate-bounce' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Price'}
          </button>
          <button onClick={() => setShowModal(true)}
            className="h-[28px] px-3 rounded-[6px] bg-[var(--accent-blue)] text-white text-[12px] font-medium hover:bg-[var(--accent-blue-dark)] flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Add Stock
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-5 animate-pulse">
          <div className="h-40 bg-[var(--bg-tertiary)] rounded" />
        </div>
      ) : (
        <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-[var(--text-secondary)]">Symbol</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-[var(--text-secondary)]">Company / Sector</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-[var(--text-secondary)]">
                  <div className="flex items-center justify-end gap-1.5">
                    Live Price (PSX)
                    <button
                      onClick={fetchAllLivePrices}
                      disabled={liveLoading}
                      className="p-0.5 rounded hover:bg-[var(--bg-tertiary)] disabled:opacity-50"
                      title="Refresh live prices"
                    >
                      <RefreshCw className={`w-3 h-3 ${liveLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </th>
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-[var(--text-secondary)]">Stored Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {stocks.map((stock) => {
                const livePrice = livePriceMap.get(stock.symbol);
                const storedPrice = priceMap.get(stock.symbol);

                return (
                  <tr key={stock.symbol} className="hover:bg-[var(--bg-tertiary)]">
                    <td className="px-4 py-3"><span className="text-[13px] font-semibold text-[var(--text-primary)]">{stock.symbol}</span></td>
                    <td className="px-4 py-3">
                      <div className="text-[13px] text-[var(--text-primary)]">{stock.company_name || livePrice?.name || '-'}</div>
                      <div className="text-[11px] text-[var(--text-muted)]">{stock.sector || '-'}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {livePrice ? (
                        <span className="text-[13px] font-semibold text-[var(--text-primary)]">
                          {formatPkr(livePrice.price)}
                        </span>
                      ) : liveLoading ? (
                        <span className="text-[12px] text-[var(--text-muted)] animate-pulse">Loading...</span>
                      ) : (
                        <span className="text-[12px] text-[var(--text-muted)]">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <UpdatePriceForm symbol={stock.symbol} currentPrice={storedPrice?.toString() ?? '0'} />
                    </td>
                  </tr>
                );
              })}
              {stocks.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-[13px] text-[var(--text-muted)]">No stocks defined yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add New Stock" width="sm">
        <StockForm onSuccess={() => setShowModal(false)} />
      </Modal>
    </div>
  );
}
