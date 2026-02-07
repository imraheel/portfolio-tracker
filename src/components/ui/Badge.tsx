import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'danger' | 'warning' | 'neutral' | 'info' | 'gold' | 'coral' | 'sage';
  size?: 'sm' | 'md';
}

const variantStyles = {
  success: 'bg-[var(--accent-sage)]/10 text-[var(--accent-sage)] border-[var(--accent-sage)]/20',
  danger: 'bg-[var(--accent-coral)]/10 text-[var(--accent-coral)] border-[var(--accent-coral)]/20',
  warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  neutral: 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-default)]',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  gold: 'bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] border-[var(--accent-gold)]/20',
  coral: 'bg-[var(--accent-coral)]/10 text-[var(--accent-coral)] border-[var(--accent-coral)]/20',
  sage: 'bg-[var(--accent-sage)]/10 text-[var(--accent-sage)] border-[var(--accent-sage)]/20',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
};

export function Badge({
  children,
  variant = 'neutral',
  size = 'sm',
}: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-md font-medium border',
        variantStyles[variant],
        sizeStyles[size]
      )}
    >
      {children}
    </span>
  );
}
