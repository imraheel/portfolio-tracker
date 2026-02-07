import { clsx } from 'clsx';
import { motion } from 'framer-motion';

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
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
    </motion.div>
  );
}
