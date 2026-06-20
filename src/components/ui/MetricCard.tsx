import { clsx } from 'clsx';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    label: string;
  };
  icon?: React.ReactNode;
  variant?: 'default' | 'blue' | 'green' | 'red' | 'gold' | 'sage' | 'coral';
  loading?: boolean;
}

const variantStyles: Record<string, { iconBg: string; iconColor: string }> = {
  default: {
    iconBg: 'bg-[var(--bg-tertiary)]',
    iconColor: 'text-[var(--text-secondary)]',
  },
  blue: {
    iconBg: 'bg-[var(--accent-blue)]/10',
    iconColor: 'text-[var(--accent-blue)]',
  },
  green: {
    iconBg: 'bg-[var(--accent-green)]/10',
    iconColor: 'text-[var(--accent-green)]',
  },
  red: {
    iconBg: 'bg-[var(--accent-red)]/10',
    iconColor: 'text-[var(--accent-red)]',
  },
  gold: {
    iconBg: 'bg-[var(--accent-blue)]/10',
    iconColor: 'text-[var(--accent-blue)]',
  },
  sage: {
    iconBg: 'bg-[var(--accent-green)]/10',
    iconColor: 'text-[var(--accent-green)]',
  },
  coral: {
    iconBg: 'bg-[var(--accent-red)]/10',
    iconColor: 'text-[var(--accent-red)]',
  },
};

export function MetricCard({
  title,
  value,
  trend,
  icon,
  variant = 'default',
  loading = false,
}: MetricCardProps) {
  const styles = variantStyles[variant];

  if (loading) {
    return (
      <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-5 shadow-soft">
        <div className="animate-pulse space-y-4">
          <div className="h-9 w-9 rounded-lg bg-[var(--bg-tertiary)]" />
          <div className="space-y-2">
            <div className="h-3 w-20 rounded bg-[var(--bg-tertiary)]" />
            <div className="h-7 w-28 rounded bg-[var(--bg-tertiary)]" />
          </div>
        </div>
      </div>
    );
  }

  const isPositive = trend ? trend.value >= 0 : true;

  return (
    <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-5 shadow-soft">
      <div className="flex items-start justify-between mb-3">
        <div className={clsx('rounded-lg p-2', styles.iconBg)}>
          <span className={clsx('block', styles.iconColor)}>{icon}</span>
        </div>
        {trend && (
          <div
            className={clsx(
              'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
              isPositive
                ? 'text-[var(--accent-green)] bg-[var(--accent-green)]/10'
                : 'text-[var(--accent-red)] bg-[var(--accent-red)]/10'
            )}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{Math.abs(trend.value).toFixed(1)}%</span>
          </div>
        )}
      </div>

      <div className="space-y-0.5">
        <p className="text-xs text-[var(--text-muted)]">{title}</p>
        <p
          className={clsx(
            'text-2xl font-semibold tracking-tight',
            trend && !isPositive ? 'text-[var(--accent-red)]' : 'text-[var(--text-primary)]'
          )}
        >
          {value}
        </p>
        {trend && <p className="text-xs text-[var(--text-muted)]">{trend.label}</p>}
      </div>
    </div>
  );
}
