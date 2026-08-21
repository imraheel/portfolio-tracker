import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import { AlertCircle, BarChart3, PieChartIcon, DollarSign, TrendingUp } from 'lucide-react';
import { SegmentedControl } from '@/components/SegmentedControl';
import * as transactionsService from '@/services/stocks/transactions';
import * as walletService from '@/services/stocks/wallet';
import * as stocksService from '@/services/stocks/stocks';
import { queryKeys } from '@/lib/queryKeys';

const subNav = [
  { label: 'Holdings', value: '/stocks' },
  { label: 'Wallet', value: '/stocks/wallet' },
  { label: 'Transactions', value: '/stocks/transactions' },
  { label: 'Reports', value: '/stocks/reports' },
];

function formatPkr(amount: number) {
  return amount.toLocaleString('en-PK', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <AlertCircle className="w-12 h-12 text-[var(--accent-red)] mb-4" />
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">Failed to load reports</h3>
      <p className="text-sm text-[var(--text-muted)]">{message}</p>
    </div>
  );
}

function ChartCard({ title, subtitle, icon, children }: { title: string; subtitle: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-5">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
          <p className="text-xs text-[var(--text-muted)]">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

const formatYAxis = (value: number): string => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return `${value}`;
};

const PIE_COLORS = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE', '#5AC8FA', '#FF2D55', '#FFCC00', '#30B0C7', '#AC8E68'];

interface BarTooltipProps {
  active?: boolean;
  payload?: { payload: { symbol: string; totalInvested: number; totalShares?: number; totalDividends?: number } }[];
}

function InvestmentTooltip({ active, payload }: BarTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border-subtle)] shadow-card">
        <p className="text-xs font-semibold text-[var(--text-primary)] mb-1">{data.symbol}</p>
        <p className="text-xs text-[var(--text-muted)]">
          Invested: <span className="font-medium text-[var(--text-primary)]">Rs. {formatPkr(data.totalInvested)}</span>
        </p>
        {data.totalShares !== undefined && (
          <p className="text-xs text-[var(--text-muted)]">
            Shares: <span className="font-medium text-[var(--text-primary)]">{data.totalShares}</span>
          </p>
        )}
      </div>
    );
  }
  return null;
}

function DividendTooltip({ active, payload }: BarTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border-subtle)] shadow-card">
        <p className="text-xs font-semibold text-[var(--text-primary)] mb-1">{data.symbol}</p>
        <p className="text-xs text-[var(--text-muted)]">
          Dividends: <span className="font-medium text-[var(--accent-green)]">Rs. {formatPkr(data.totalDividends ?? 0)}</span>
        </p>
      </div>
    );
  }
  return null;
}

function PieTooltip({ active, payload }: { active?: boolean; payload?: { payload: { name: string; value: number } }[] }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border-subtle)] shadow-card">
        <p className="text-xs text-[var(--text-muted)] mb-1">{data.name}</p>
        <p className="text-sm font-semibold text-[var(--text-primary)]">Rs. {formatPkr(data.value)}</p>
      </div>
    );
  }
  return null;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-10 w-48 bg-[var(--bg-tertiary)] rounded animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-5">
            <div className="h-4 w-36 bg-[var(--bg-tertiary)] rounded mb-4 animate-pulse" />
            <div className="h-64 bg-[var(--bg-tertiary)] rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Reports() {
  const navigate = useNavigate();

  const { data: buyTransactions = [], isLoading: buysLoading, error: buysError } = useQuery({
    queryKey: queryKeys.transactions.buys(),
    queryFn: transactionsService.getBuyTransactions,
    staleTime: 5 * 60 * 1000,
  });

  const { data: dividends = [], isLoading: divLoading, error: divError } = useQuery({
    queryKey: queryKeys.transactions.dividends(),
    queryFn: transactionsService.getDividends,
    staleTime: 5 * 60 * 1000,
  });

  const { data: deposits = [], isLoading: depLoading, error: depError } = useQuery({
    queryKey: queryKeys.wallet.deposits(),
    queryFn: walletService.getDeposits,
    staleTime: 5 * 60 * 1000,
  });

  const { data: stocks = [], isLoading: stocksLoading, error: stocksError } = useQuery({
    queryKey: queryKeys.stocks.list(),
    queryFn: stocksService.getStocks,
    staleTime: 10 * 60 * 1000,
  });

  const loading = buysLoading || divLoading || depLoading || stocksLoading;
  const error = buysError ?? divError ?? depError ?? stocksError;

  const investmentData = useMemo(() => {
    const map = new Map<string, { totalInvested: number; totalShares: number }>();
    for (const tx of buyTransactions) {
      const existing = map.get(tx.symbol) || { totalInvested: 0, totalShares: 0 };
      map.set(tx.symbol, {
        totalInvested: existing.totalInvested + tx.total_cost,
        totalShares: existing.totalShares + tx.quantity,
      });
    }
    return Array.from(map.entries())
      .map(([symbol, data]) => ({ symbol, ...data }))
      .sort((a, b) => b.totalInvested - a.totalInvested);
  }, [buyTransactions]);

  const dividendData = useMemo(() => {
    const map = new Map<string, number>();
    for (const div of dividends) {
      map.set(div.symbol, (map.get(div.symbol) || 0) + div.dividend_amount);
    }
    return Array.from(map.entries())
      .map(([symbol, totalDividends]) => ({ symbol, totalDividends }))
      .sort((a, b) => b.totalDividends - a.totalDividends);
  }, [dividends]);

  const allocationData = useMemo(() => {
    return investmentData.map((d) => ({ name: d.symbol, value: d.totalInvested }));
  }, [investmentData]);

  const totalInvestment = useMemo(() => investmentData.reduce((sum, d) => sum + d.totalInvested, 0), [investmentData]);

  const sectorData = useMemo(() => {
    const sectorMap = new Map<string, number>();
    const symbolToSector = new Map(stocks.map(s => [s.symbol, s.sector || 'Unknown']));
    for (const item of investmentData) {
      const sector = symbolToSector.get(item.symbol) || 'Unknown';
      sectorMap.set(sector, (sectorMap.get(sector) || 0) + item.totalInvested);
    }
    return Array.from(sectorMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [investmentData, stocks]);

  const monthlyData = useMemo(() => {
    const monthMap = new Map<string, { deposits: number; invested: number }>();
    for (const dep of deposits) {
      const date = new Date(dep.deposit_date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const existing = monthMap.get(key) || { deposits: 0, invested: 0 };
      monthMap.set(key, { ...existing, deposits: existing.deposits + dep.amount });
    }
    for (const tx of buyTransactions) {
      const date = new Date(tx.buy_date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const existing = monthMap.get(key) || { deposits: 0, invested: 0 };
      monthMap.set(key, { ...existing, invested: existing.invested + tx.total_cost });
    }
    return Array.from(monthMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [deposits, buyTransactions]);

  if (error) {
    return (
      <div className="space-y-5">
        <SegmentedControl segments={subNav} value="/stocks/reports" onChange={(v) => navigate(v)} />
        <ErrorState message={typeof error === 'string' ? error : error.message} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <SegmentedControl segments={subNav} value="/stocks/reports" onChange={(v) => navigate(v)} />
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <SegmentedControl segments={subNav} value="/stocks/reports" onChange={(v) => navigate(v)} />

      <div>
        <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">Reports & Analytics</h2>
        <p className="text-[12px] text-[var(--text-muted)]">Visual breakdown of your stock portfolio</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard
          title="Investment per Stock"
          subtitle="Total amount invested and shares held"
          icon={<BarChart3 className="w-4 h-4 text-[var(--accent-blue)]" />}
        >
          {investmentData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-[13px] text-[var(--text-muted)]">
              No buy transactions recorded yet.
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={investmentData} margin={{ top: 25, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                  <XAxis
                    dataKey="symbol"
                    tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={formatYAxis}
                    tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<InvestmentTooltip />} cursor={{ fill: 'var(--bg-tertiary)' }} />
                  <Bar
                    dataKey="totalInvested"
                    radius={[4, 4, 0, 0]}
                  >
                    {investmentData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Dividend per Stock"
          subtitle="Total dividends received per stock"
          icon={<DollarSign className="w-4 h-4 text-[var(--accent-green)]" />}
        >
          {dividendData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-[13px] text-[var(--text-muted)]">
              No dividends recorded yet.
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dividendData} margin={{ top: 25, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                  <XAxis
                    dataKey="symbol"
                    tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={formatYAxis}
                    tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<DividendTooltip />} cursor={{ fill: 'var(--bg-tertiary)' }} />
                  <Bar
                    dataKey="totalDividends"
                    radius={[4, 4, 0, 0]}
                  >
                    {dividendData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Portfolio Allocation"
          subtitle="Investment distribution across stocks"
          icon={<PieChartIcon className="w-4 h-4 text-[var(--accent-orange)]" />}
        >
          {allocationData.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-[13px] text-[var(--text-muted)]">
              No investment data available.
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {allocationData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="var(--bg-secondary)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    height={36}
                    formatter={(value: string, entry: { payload?: { value?: number } }) => {
                      const item = entry.payload;
                      const percent = totalInvestment > 0 && item?.value ? ((item.value / totalInvestment) * 100).toFixed(0) : '0';
                      return (
                        <span className="text-xs text-[var(--text-secondary)]">
                          {value} <span className="text-[var(--text-muted)] ml-1">({percent}%)</span>
                        </span>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Sector Allocation"
          subtitle="Investment distribution by sector"
          icon={<PieChartIcon className="w-4 h-4 text-[var(--accent-green)]" />}
        >
          {sectorData.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-[13px] text-[var(--text-muted)]">
              No investment data available.
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectorData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {sectorData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="var(--bg-secondary)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    height={36}
                    formatter={(value: string, entry: { payload?: { value?: number } }) => {
                      const item = entry.payload;
                      const percent = totalInvestment > 0 && item?.value ? ((item.value / totalInvestment) * 100).toFixed(0) : '0';
                      return (
                        <span className="text-xs text-[var(--text-secondary)]">
                          {value} <span className="text-[var(--text-muted)] ml-1">({percent}%)</span>
                        </span>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Monthly Trend"
          subtitle="Deposits vs Investments over time"
          icon={<TrendingUp className="w-4 h-4 text-[var(--accent-blue)]" />}
        >
          {monthlyData.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-[13px] text-[var(--text-muted)]">
              No deposit or buy data available.
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                  <XAxis
                    dataKey="month"
                    tickFormatter={(val: string) => {
                      const [y, m] = val.split('-');
                      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                      return `${monthNames[parseInt(m, 10) - 1]} ${y.slice(2)}`;
                    }}
                    tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={formatYAxis}
                    tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    content={({ active, payload, label }: any) => {
                      if (active && payload && payload.length && label) {
                        const [y, m] = String(label).split('-');
                        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        const monthLabel = `${monthNames[parseInt(m, 10) - 1]} ${y}`;
                        return (
                          <div className="bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border-subtle)] shadow-card">
                            <p className="text-xs text-[var(--text-muted)] mb-2">{monthLabel}</p>
                            {payload.map((entry: { dataKey: string; color: string; value: number }, idx: number) => (
                              <div key={idx} className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-xs text-[var(--text-secondary)]">
                                  {entry.dataKey === 'deposits' ? 'Deposited' : 'Invested'}:
                                </span>
                                <span className="text-sm font-semibold text-[var(--text-primary)]">
                                  Rs. {formatPkr(entry.value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: 16 }}
                    formatter={(value: string) => (
                      <span className="text-xs text-[var(--text-secondary)]">
                        {value === 'deposits' ? 'Deposited' : 'Invested'}
                      </span>
                    )}
                  />
                  <Line type="monotone" dataKey="deposits" stroke="#34C759" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="invested" stroke="#007AFF" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Investment Summary"
          subtitle="Key metrics across your portfolio"
          icon={<BarChart3 className="w-4 h-4 text-[var(--accent-blue)]" />}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-[var(--bg-tertiary)] p-4">
              <p className="text-xs text-[var(--text-muted)] mb-1">Total Deposited</p>
              <p className="text-lg font-semibold text-[var(--accent-blue)]">
                Rs. {formatPkr(deposits.reduce((sum, d) => sum + d.amount, 0))}
              </p>
            </div>
            <div className="rounded-lg bg-[var(--bg-tertiary)] p-4">
              <p className="text-xs text-[var(--text-muted)] mb-1">Total Invested</p>
              <p className="text-lg font-semibold text-[var(--text-primary)]">Rs. {formatPkr(totalInvestment)}</p>
            </div>
            <div className="rounded-lg bg-[var(--bg-tertiary)] p-4">
              <p className="text-xs text-[var(--text-muted)] mb-1">Total Dividends</p>
              <p className="text-lg font-semibold text-[var(--accent-green)]">
                Rs. {formatPkr(dividendData.reduce((sum, d) => sum + d.totalDividends, 0))}
              </p>
            </div>
            <div className="rounded-lg bg-[var(--bg-tertiary)] p-4">
              <p className="text-xs text-[var(--text-muted)] mb-1">Total Shares</p>
              <p className="text-lg font-semibold text-[var(--text-primary)]">
                {investmentData.reduce((sum, d) => sum + d.totalShares, 0)}
              </p>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
