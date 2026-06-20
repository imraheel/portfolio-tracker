import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'blue' | 'green' | 'red' | 'orange' | 'gold' | 'sage' | 'coral';
  size?: 'sm' | 'md';
}

const variantStyles: Record<string, string> = {
  default: 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]',
  blue: 'bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]',
  green: 'bg-[var(--accent-green)]/10 text-[var(--accent-green)]',
  red: 'bg-[var(--accent-red)]/10 text-[var(--accent-red)]',
  orange: 'bg-[var(--accent-orange)]/10 text-[var(--accent-orange)]',
  gold: 'bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]',
  sage: 'bg-[var(--accent-green)]/10 text-[var(--accent-green)]',
  coral: 'bg-[var(--accent-red)]/10 text-[var(--accent-red)]',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-xs',
};

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
}: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-md font-medium',
        variantStyles[variant],
        sizeStyles[size]
      )}
    >
      {children}
    </span>
  );
}
