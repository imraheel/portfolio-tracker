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
  const baseStyles = 'relative px-5 py-2 rounded-md text-sm font-medium inline-flex justify-center items-center transition-colors';

  const variantStyles = {
    primary: clsx(
      'bg-[var(--accent-blue)] text-white',
      'hover:bg-[var(--accent-blue-dark)]',
      'focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] focus:ring-offset-1',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    ),
    secondary: clsx(
      'bg-[var(--bg-secondary)] text-[var(--text-primary)]',
      'border border-[var(--border-default)]',
      'hover:bg-[var(--bg-tertiary)]',
      'focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] focus:ring-offset-1',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    ),
    danger: clsx(
      'bg-[var(--accent-red)]/10 text-[var(--accent-red)]',
      'border border-[var(--accent-red)]/30',
      'hover:bg-[var(--accent-red)]/20',
      'focus:outline-none focus:ring-2 focus:ring-[var(--accent-red)] focus:ring-offset-1',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    ),
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={clsx(baseStyles, variantStyles[variant], className)}
    >
      {disabled ? loadingLabel : label}
    </button>
  );
}
