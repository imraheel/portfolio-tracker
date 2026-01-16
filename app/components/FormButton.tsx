'use client';

import { useFormStatus } from 'react-dom';
import { clsx } from 'clsx';

interface FormButtonProps {
  label: string;
  loadingLabel?: string;
  className?: string;
  variant?: 'primary' | 'danger';
}

export function FormButton({ 
  label, 
  loadingLabel = 'Processing...', 
  className,
  variant = 'primary' 
}: FormButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={clsx(
        "inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50",
        {
          "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500": variant === 'primary',
          "bg-red-600 hover:bg-red-700 focus:ring-red-500": variant === 'danger',
        },
        className
      )}
    >
      {pending ? loadingLabel : label}
    </button>
  );
}
