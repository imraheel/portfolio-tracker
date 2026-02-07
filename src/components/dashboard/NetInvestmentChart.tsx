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
import { motion } from 'framer-motion';
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
    return (
      <div className="bg-[var(--bg-secondary)] p-4 rounded-lg border border-[var(--border-subtle)] shadow-elevated">
        <p className="text-xs text-[var(--text-muted)] mb-2 uppercase tracking-wider">
          {formatDate(label)}
        </p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-[var(--text-secondary)] capitalize">
              {entry.dataKey.replace(/([A-Z])/g, ' $1').trim()}:
            </span>
            <span className="text-sm font-mono font-medium text-[var(--text-primary)]">
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
  stocksInvestment: 'var(--accent-gold)',
  mutualFundsInvestment: 'var(--accent-sage)',
  cryptoInvestment: '#8b5cf6',
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
      <div className="rounded-lg bg-[var(--bg-secondary)] p-6 border border-[var(--border-subtle)]">
        <div className="h-4 w-48 bg-[var(--bg-elevated)] rounded mb-6 animate-pulse" />
        <div className="h-64 bg-[var(--bg-tertiary)] rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-lg bg-[var(--bg-secondary)] p-6 border border-[var(--border-subtle)]"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-[var(--accent-gold)]" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-gold)]">
              Timeline
            </span>
          </div>
          <h3 className="font-display text-xl text-[var(--text-primary)]">Investment History</h3>
          <p className="text-sm text-[var(--text-muted)] mt-1">Track your investments over time</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-1 bg-[var(--bg-tertiary)] p-1 rounded-lg">
          {timeRanges.map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                selectedRange === range
                  ? 'bg-[var(--bg-elevated)] text-[var(--accent-gold)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="var(--border-subtle)" 
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}
              axisLine={false}
              tickLine={false}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: 20 }}
              formatter={(value) => (
                <span className="text-xs text-[var(--text-secondary)] capitalize">
                  {value.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              )}
            />
            <Line
              type="monotone"
              dataKey="stocksInvestment"
              name="Stocks"
              stroke={COLORS.stocksInvestment}
              strokeWidth={2}
              dot={false}
              animationDuration={1500}
            />
            <Line
              type="monotone"
              dataKey="mutualFundsInvestment"
              name="Mutual Funds"
              stroke={COLORS.mutualFundsInvestment}
              strokeWidth={2}
              dot={false}
              animationDuration={1500}
            />
            <Line
              type="monotone"
              dataKey="cryptoInvestment"
              name="Crypto"
              stroke={COLORS.cryptoInvestment}
              strokeWidth={2}
              dot={false}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
