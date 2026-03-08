import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'gradient' | 'outline' | 'elevated';
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
  hover = true,
  padding = 'md',
}: CardProps) {
  const baseStyles = 'relative overflow-hidden rounded-lg border border-[var(--border-subtle)]';
  
  const variantStyles = {
    default: 'bg-[var(--bg-secondary)]',
    gradient: 'bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-tertiary)]',
    outline: 'bg-transparent',
    elevated: 'bg-[var(--bg-elevated)]',
  };

  return (
    <div
      className={clsx(
        baseStyles,
        variantStyles[variant],
        paddingStyles[padding],
        hover && 'card-hover',
        className
      )}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-gold)]/20 to-transparent" />
      
      <div className="relative z-10">{children}</div>
    </div>
  );
}
