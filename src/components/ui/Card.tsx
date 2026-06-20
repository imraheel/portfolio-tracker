import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

export function Card({
  children,
  className,
  variant = 'default',
  hover: _hover,
  padding = 'md',
}: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-lg',
        variant === 'default' && 'bg-[var(--bg-secondary)] shadow-soft border border-[var(--border-subtle)]',
        variant === 'outline' && 'bg-transparent border border-[var(--border-subtle)]',
        paddingStyles[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
