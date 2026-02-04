import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'gradient' | 'outline';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
};

const variantStyles = {
  default: 'bg-white shadow-soft',
  gradient: 'bg-white relative overflow-hidden',
  outline: 'bg-white border border-gray-200',
};

export function Card({
  children,
  className,
  variant = 'default',
  hover = false,
  padding = 'md',
}: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={clsx(
        'rounded-xl',
        variantStyles[variant],
        paddingStyles[padding],
        hover && 'hover:shadow-hover hover:-translate-y-1 transition-all duration-300 cursor-pointer',
        className
      )}
    >
      {variant === 'gradient' && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-50" />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
