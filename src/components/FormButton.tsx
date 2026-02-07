import { clsx } from 'clsx';

interface FormButtonProps {
  label: string;
  loadingLabel?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  type?: 'submit' | 'button' | 'reset';
  onClick?: () => void;
}

export function FormButton({
  label,
  loadingLabel = 'Processing...',
  className,
  variant = 'primary',
  disabled = false,
  type = 'submit',
  onClick,
}: FormButtonProps) {
  const baseStyles = 'relative px-6 py-3 rounded-md font-medium transition-all duration-300 inline-flex justify-center items-center';
  
  const variantStyles = {
    primary: clsx(
      'bg-gradient-to-br from-[var(--accent-gold)] to-[var(--accent-gold-dark)]',
      'text-[var(--bg-primary)] border-none',
      'hover:translate-y-[-1px] hover:shadow-[var(--shadow-gold)]',
      'focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none'
    ),
    secondary: clsx(
      'bg-[var(--bg-elevated)]',
      'text-[var(--text-primary)]',
      'border border-[var(--border-default)]',
      'hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)]',
      'focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    ),
    danger: clsx(
      'bg-[var(--accent-coral)]/10',
      'text-[var(--accent-coral)]',
      'border border-[var(--accent-coral)]/30',
      'hover:bg-[var(--accent-coral)]/20 hover:border-[var(--accent-coral)]',
      'focus:outline-none focus:ring-2 focus:ring-[var(--accent-coral)] focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    ),
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        baseStyles,
        variantStyles[variant],
        className
      )}
    >
      {disabled ? loadingLabel : label}
    </button>
  );
}
