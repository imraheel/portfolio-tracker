import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

export interface NetInvestmentChartProps {
  data: {
    date: string;
    stocksInvestment: number;
    mutualFundsInvestment: number;
    cryptoInvestment: number;
  }[];
  loading?: boolean;
}

const timeRanges = ['1W', '1M', '3M', '6M', '1Y', 'ALL'] as const;
type TimeRange = (typeof timeRanges)[number];

const formatPKR = (value: number): string => {
  return `Rs. ${value.toLocaleString('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-PK', {
    day: '2-digit',
    month: 'short',
  });
};

const formatYAxis = (value: number): string => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return `${value}`;
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number; dataKey: string; color: string }[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length && label) {
    const labelMap: Record<string, string> = {
      stocksInvestment: 'Stock Wallet',
      mutualFundsInvestment: 'Mutual Funds',
      cryptoInvestment: 'Crypto',
    };

    return (
      <div className="bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border-subtle)] shadow-card">
        <p className="text-xs text-[var(--text-muted)] mb-2">{formatDate(label)}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-[var(--text-secondary)]">
              {labelMap[entry.dataKey] || entry.dataKey.replace(/([A-Z])/g, ' $1').trim()}:
            </span>
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              {formatPKR(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const getDaysForRange = (range: TimeRange): number => {
  switch (range) {
    case '1W': return 7;
    case '1M': return 30;
    case '3M': return 90;
    case '6M': return 180;
    case '1Y': return 365;
    case 'ALL': return 3650;
    default: return 30;
  }
};

const COLORS = {
  stocksInvestment: '#007AFF',
  mutualFundsInvestment: '#34C759',
  cryptoInvestment: '#FF9500',
};

export function NetInvestmentChart({ data, loading }: NetInvestmentChartProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1M');

  const filteredData = (() => {
    const days = getDaysForRange(selectedRange);
    if (days >= 3650) return data;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return data.filter(d => new Date(d.date) >= cutoffDate);
  })();

  if (loading) {
    return (
      <div className="rounded-lg bg-[var(--bg-secondary)] p-5 border border-[var(--border-subtle)] shadow-soft">
        <div className="h-4 w-44 bg-[var(--bg-tertiary)] rounded mb-4 animate-pulse" />
        <div className="h-64 bg-[var(--bg-tertiary)] rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-[var(--bg-secondary)] p-5 border border-[var(--border-subtle)] shadow-soft">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[var(--accent-blue)]" />
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Investment History</h3>
            <p className="text-xs text-[var(--text-muted)]">
              Stock wallet shows deposits minus withdrawals.
            </p>
          </div>
        </div>

        <div className="flex gap-0.5 bg-[var(--bg-tertiary)] p-0.5 rounded-lg">
          {timeRanges.map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md ${
                selectedRange === range
                  ? 'bg-[var(--bg-secondary)] text-[var(--accent-blue)] shadow-soft'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border-subtle)"
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              axisLine={false}
              tickLine={false}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: 16 }}
              formatter={(value) => {
                const labelMap: Record<string, string> = {
                  stocksInvestment: 'Stock Wallet',
                  mutualFundsInvestment: 'Mutual Funds',
                  cryptoInvestment: 'Crypto',
                };
                return (
                  <span className="text-xs text-[var(--text-secondary)]">
                    {labelMap[value] || value.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="stocksInvestment"
              name="Stocks"
              stroke={COLORS.stocksInvestment}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="mutualFundsInvestment"
              name="Mutual Funds"
              stroke={COLORS.mutualFundsInvestment}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="cryptoInvestment"
              name="Crypto"
              stroke={COLORS.cryptoInvestment}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
