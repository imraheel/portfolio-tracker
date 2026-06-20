import { useState } from 'react';
import { toast } from 'sonner';
import { FormButton } from '@/components/FormButton';
import { useMutualFunds } from '@/hooks/mutualFunds/useMutualFunds';
import { X } from 'lucide-react';

interface UpdateMarketValueFormProps {
  symbol: string;
  currentValue: string;
}

export function UpdateMarketValueForm({ symbol, currentValue }: UpdateMarketValueFormProps) {
  const { updateMarketValue } = useMutualFunds();
  const [value, setValue] = useState(currentValue);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const numericValue = parseFloat(value);
    if (isNaN(numericValue) || numericValue < 0) {
      toast.error('Please enter a valid amount');
      setSubmitting(false);
      return;
    }

    const result = await updateMarketValue({
      symbol,
      currentValue: numericValue,
    });

    setSubmitting(false);

    if (result.success) {
      toast.success(result.message);
      setIsEditing(false);
    } else {
      toast.error(result.message);
    }
  };

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (!isEditing) {
    return (
      <div className="flex items-center justify-end gap-1.5">
        <span className="text-[12px] font-medium text-[var(--text-primary)]">
          {formatCurrency(parseFloat(currentValue) || 0)}
        </span>
        <button
          onClick={() => setIsEditing(true)}
          className="h-[26px] px-2 rounded-[5px] text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--accent-blue)] hover:bg-[var(--bg-tertiary)]"
        >
          Update
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center justify-end gap-1.5">
      <input
        type="number"
        step="0.01"
        min="0"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-[26px] w-28 rounded-[5px] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-2 text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-blue)] focus:outline-none focus:ring-[2.5px] focus:ring-[var(--accent-blue)]/20"
        placeholder="0.00"
      />
      <FormButton label="Save" loadingLabel="..." disabled={submitting} className="h-[26px] px-2.5 rounded-[5px] text-[11px] bg-[var(--accent-blue)] text-white font-medium hover:bg-[var(--accent-blue-dark)]" />
      <button
        type="button"
        onClick={() => {
          setIsEditing(false);
          setValue(currentValue);
        }}
        className="h-[26px] px-2 rounded-[5px] text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--accent-red)] hover:bg-[var(--bg-tertiary)]"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </form>
  );
}
