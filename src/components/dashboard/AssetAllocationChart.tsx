import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChartIcon } from 'lucide-react';

export interface AssetAllocationChartProps {
  stocks: number;
  mutualFunds: number;
  crypto: number;
  loading?: boolean;
}

const formatPKR = (value: number): string => {
  return `Rs. ${value.toLocaleString('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const COLORS = {
  stocks: '#007AFF',
  mutualFunds: '#34C759',
  crypto: '#FF9500',
};

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = (props: { cx: number; cy: number; midAngle?: number; innerRadius: number; outerRadius: number; percent?: number }) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
  const safeMidAngle = midAngle ?? 0;
  const safePercent = percent ?? 0;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-safeMidAngle * RADIAN);
  const y = cy + radius * Math.sin(-safeMidAngle * RADIAN);

  if (safePercent < 0.05) return null;

  return (
    <text
      x={x}
      y={y}
      fill="#FFFFFF"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={600}
    >
      {`${(safePercent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: { name: string; value: number } }[] }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border-subtle)] shadow-card">
        <p className="text-xs text-[var(--text-muted)] mb-1">{data.name}</p>
        <p className="text-sm font-semibold text-[var(--text-primary)]">
          {formatPKR(data.value)}
        </p>
      </div>
    );
  }
  return null;
};

type LegendPayload = { value?: string; payload?: { color?: string; name?: string; value?: number } };

export function AssetAllocationChart({ stocks, mutualFunds, crypto, loading }: AssetAllocationChartProps) {
  const total = stocks + mutualFunds + crypto;

  const data = [
    { name: 'Stocks', value: stocks, color: COLORS.stocks },
    { name: 'Mutual Funds', value: mutualFunds, color: COLORS.mutualFunds },
    { name: 'Crypto', value: crypto, color: COLORS.crypto },
  ];

  if (loading) {
    return (
      <div className="rounded-lg bg-[var(--bg-secondary)] p-5 border border-[var(--border-subtle)] shadow-soft">
        <div className="h-4 w-36 bg-[var(--bg-tertiary)] rounded mb-4 animate-pulse" />
        <div className="h-64 bg-[var(--bg-tertiary)] rounded-lg animate-pulse" />
      </div>
    );
  }

  const formatLegend = (_value: string, entry: LegendPayload) => {
    const item = entry.payload;
    if (!item || item.value === undefined) return null;
    const percent = total > 0 ? (item.value / total) * 100 : 0;
    return (
      <span className="text-xs text-[var(--text-secondary)]">
        {item.name} <span className="text-[var(--text-muted)] ml-1">({percent.toFixed(0)}%)</span>
      </span>
    );
  };

  return (
    <div className="rounded-lg bg-[var(--bg-secondary)] p-5 border border-[var(--border-subtle)] shadow-soft">
      <div className="flex items-center gap-2 mb-4">
        <PieChartIcon className="w-4 h-4 text-[var(--accent-blue)]" />
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Asset Allocation</h3>
          <p className="text-xs text-[var(--text-muted)]">Portfolio breakdown by asset type</p>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={100}
              innerRadius={50}
              dataKey="value"
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="var(--bg-secondary)"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={formatLegend}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
