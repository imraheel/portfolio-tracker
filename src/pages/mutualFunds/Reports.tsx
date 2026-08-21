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
} from 'recharts';
import { AlertCircle, BarChart3, TrendingUp } from 'lucide-react';
import { SegmentedControl } from '@/components/SegmentedControl';
import * as mutualFundsService from '@/services/mutualFunds/mutualFunds';
import { queryKeys } from '@/lib/queryKeys';

const subNav = [
  { label: 'Holdings', value: '/mutual-funds' },
  { label: 'Transactions', value: '/mutual-funds/transactions' },
  { label: 'Reports', value: '/mutual-funds/reports' },
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

function BarTooltip({ active, payload }: { active?: boolean; payload?: { payload: { name: string; netInvestment: number } }[] }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border-subtle)] shadow-card">
        <p className="text-xs font-semibold text-[var(--text-primary)] mb-1">{data.name}</p>
        <p className="text-xs text-[var(--text-muted)]">
          Net Investment: <span className="font-medium text-[var(--text-primary)]">Rs. {formatPkr(data.netInvestment)}</span>
        </p>
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
        {[1, 2].map((i) => (
          <div key={i} className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-5">
            <div className="h-4 w-36 bg-[var(--bg-tertiary)] rounded mb-4 animate-pulse" />
            <div className="h-64 bg-[var(--bg-tertiary)] rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MfReports() {
  const navigate = useNavigate();

  const { data: metrics = [], isLoading: metricsLoading, error: metricsError } = useQuery({
    queryKey: queryKeys.mutualFunds.metrics(),
    queryFn: mutualFundsService.getAllFundMetrics,
    staleTime: 5 * 60 * 1000,
  });

  const { data: purchases = [], isLoading: purchasesLoading, error: purchasesError } = useQuery({
    queryKey: queryKeys.mutualFunds.purchases(),
    queryFn: mutualFundsService.getPurchases,
    staleTime: 5 * 60 * 1000,
  });

  const loading = metricsLoading || purchasesLoading;
  const error = metricsError ?? purchasesError;

  const holdingsData = useMemo(() => {
    return metrics
      .map((m) => ({ name: m.name, symbol: m.symbol, netInvestment: m.netInvestment }))
      .filter((d) => d.netInvestment > 0)
      .sort((a, b) => b.netInvestment - a.netInvestment);
  }, [metrics]);

  const monthlyData = useMemo(() => {
    const monthMap = new Map<string, number>();
    for (const p of purchases) {
      const date = new Date(p.purchase_date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(key, (monthMap.get(key) || 0) + p.amount);
    }
    return Array.from(monthMap.entries())
      .map(([month, invested]) => ({ month, invested }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [purchases]);

  if (error) {
    return (
      <div className="space-y-5">
        <SegmentedControl segments={subNav} value="/mutual-funds/reports" onChange={(v) => navigate(v)} />
        <ErrorState message={typeof error === 'string' ? error : error.message} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <SegmentedControl segments={subNav} value="/mutual-funds/reports" onChange={(v) => navigate(v)} />
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <SegmentedControl segments={subNav} value="/mutual-funds/reports" onChange={(v) => navigate(v)} />

      <div>
        <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">Reports & Analytics</h2>
        <p className="text-[12px] text-[var(--text-muted)]">Visual breakdown of your mutual fund portfolio</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard
          title="Holdings per Fund"
          subtitle="Net investment amount per fund"
          icon={<BarChart3 className="w-4 h-4 text-[var(--accent-blue)]" />}
        >
          {holdingsData.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-[13px] text-[var(--text-muted)]">
              No investment data available.
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={holdingsData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                  <XAxis
                    dataKey="name"
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
                  <Tooltip content={<BarTooltip />} cursor={{ fill: 'var(--bg-tertiary)' }} />
                  <Bar dataKey="netInvestment" radius={[4, 4, 0, 0]}>
                    {holdingsData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Monthly Trend"
          subtitle="Total invested per month"
          icon={<TrendingUp className="w-4 h-4 text-[var(--accent-green)]" />}
        >
          {monthlyData.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-[13px] text-[var(--text-muted)]">
              No purchase data available.
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
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#34C759' }} />
                              <span className="text-xs text-[var(--text-secondary)]">Invested:</span>
                              <span className="text-sm font-semibold text-[var(--text-primary)]">
                                Rs. {formatPkr(payload[0].value)}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line type="monotone" dataKey="invested" stroke="#34C759" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
