import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    label: string;
  };
  icon?: React.ReactNode;
  variant?: 'default' | 'gold' | 'sage' | 'coral';
  loading?: boolean;
  delay?: number;
}

const variantStyles = {
  default: {
    iconBg: 'bg-[var(--bg-elevated)]',
    iconColor: 'text-[var(--text-secondary)]',
  },
  gold: {
    iconBg: 'bg-[var(--accent-gold)]/10',
    iconColor: 'text-[var(--accent-gold)]',
  },
  sage: {
    iconBg: 'bg-[var(--accent-sage)]/10',
    iconColor: 'text-[var(--accent-sage)]',
  },
  coral: {
    iconBg: 'bg-[var(--accent-coral)]/10',
    iconColor: 'text-[var(--accent-coral)]',
  },
};

export function MetricCard({
  title,
  value,
  trend,
  icon,
  variant = 'default',
  loading = false,
  delay = 0,
}: MetricCardProps) {
  const styles = variantStyles[variant];

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        className="relative overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5"
      >
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-10 rounded-lg bg-[var(--bg-elevated)]" />
          <div className="space-y-2">
            <div className="h-3 w-20 rounded bg-[var(--bg-elevated)]" />
            <div className="h-8 w-32 rounded bg-[var(--bg-elevated)]" />
          </div>
        </div>
      </motion.div>
    );
  }

  const isPositive = trend ? trend.value >= 0 : true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -2 }}
      className="group relative overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5 card-hover"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-gold)]/20 to-transparent" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={clsx('rounded-lg p-2.5 transition-colors', styles.iconBg)}>
            <span className={styles.iconColor}>{icon}</span>
          </div>
          
          {trend && (
            <div className={clsx(
              'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
              isPositive 
                ? 'text-[var(--accent-sage)] bg-[var(--accent-sage)]/10' 
                : 'text-[var(--accent-coral)] bg-[var(--accent-coral)]/10'
            )}>
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{Math.abs(trend.value).toFixed(2)}%</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
            {title}
          </p>
          <p className={clsx(
            'font-mono text-2xl font-semibold tracking-tight',
            trend && !isPositive ? 'text-[var(--accent-coral)]' : 'text-[var(--text-primary)]'
          )}>
            {value}
          </p>
          {trend && (
            <p className="text-xs text-[var(--text-muted)]">
              {trend.label}
            </p>
          )}
        </div>
      </div>

      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-gold)]/5 to-transparent" />
      </div>
    </motion.div>
  );
}
