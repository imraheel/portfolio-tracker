import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';

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
  stocks: '#3b82f6',
  mutualFunds: '#0d9488',
  crypto: '#7c3aed',
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
      fill="white"
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
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
        <p className="text-sm text-gray-500 mb-1">{data.name}</p>
        <p className="text-lg font-semibold text-gray-900">{formatPKR(data.value)}</p>
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
      <div className="bg-white rounded-xl p-6 shadow-soft">
        <div className="h-4 w-40 bg-gray-100 rounded mb-6 animate-pulse" />
        <div className="h-64 bg-gray-50 rounded-lg animate-pulse" />
      </div>
    );
  }

  const formatLegend = (_value: string, entry: LegendPayload) => {
    const item = entry.payload;
    if (!item || item.value === undefined) return null;
    const percent = total > 0 ? (item.value / total) * 100 : 0;
    return (
      <span className="text-sm text-gray-600">
        {item.name} <span className="text-gray-400 ml-1">({percent.toFixed(0)}%)</span>
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white rounded-xl p-6 shadow-soft"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Asset Allocation</h3>
        <p className="text-sm text-gray-500 mt-1">Portfolio breakdown by asset type</p>
      </div>

      <div className="relative">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                innerRadius={50}
                dataKey="value"
                animationDuration={1500}
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="none"
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                      transition: 'all 0.3s ease',
                    }}
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

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center -mt-8">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Total Value</p>
            <p className="text-lg font-bold text-gray-900">{formatPKR(total)}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
