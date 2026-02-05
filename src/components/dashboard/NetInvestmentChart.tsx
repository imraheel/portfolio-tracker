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
  if (value >= 1000000) return `Rs. ${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `Rs. ${(value / 1000).toFixed(0)}K`;
  return `Rs. ${value}`;
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number; dataKey: string; color: string }[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length && label) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
        <p className="text-sm text-gray-500 mb-2">{formatDate(label)}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600 capitalize">
              {entry.dataKey.replace(/([A-Z])/g, ' $1').trim()}:
            </span>
            <span className="text-sm font-semibold text-gray-900">
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
  stocksInvestment: '#0d9488',
  mutualFundsInvestment: '#7c3aed',
  cryptoInvestment: '#f59e0b',
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
      <div className="bg-white rounded-xl p-6 shadow-soft">
        <div className="h-4 w-48 bg-gray-100 rounded mb-6 animate-pulse" />
        <div className="h-64 bg-gray-50 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl p-6 shadow-soft"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Investment History</h3>
          <p className="text-sm text-gray-500 mt-1">Track your investments over time</p>
        </div>
        <div className="flex gap-1 bg-gray-50 p-1 rounded-lg">
          {timeRanges.map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                selectedRange === range
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: 10 }}
              formatter={(value) => (
                <span className="text-sm text-gray-600 capitalize">
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
