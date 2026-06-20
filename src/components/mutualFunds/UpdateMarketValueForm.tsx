import { useState } from 'react';
import { toast } from 'sonner';
import { FormButton } from '@/components/FormButton';
import { useMutualFunds } from '@/hooks/mutualFunds/useMutualFunds';
import { TrendingUp, X } from 'lucide-react';

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
      <div className="flex items-center justify-end space-x-2">
        <span className="text-sm font-medium text-[var(--text-primary)]">
          {formatCurrency(parseFloat(currentValue) || 0)}
        </span>
        <button
          onClick={() => setIsEditing(true)}
          className="rounded-md bg-[var(--bg-tertiary)] px-2 py-1 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--accent-gold)]"
        >
          Update
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center justify-end space-x-2">
      <div className="mb-2 flex items-center gap-2 text-[var(--accent-gold)]">
        <TrendingUp className="h-4 w-4" />
        <h4 className="text-xs font-medium uppercase tracking-wider">Update Market Value</h4>
      </div>
      <div className="flex items-center space-x-1">
        <span className="text-sm text-[var(--text-secondary)]">Rs.</span>
        <input
          type="number"
          step="0.01"
          min="0"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-32 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-2 py-1 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)]"
          placeholder="0.00"
        />
      </div>
      <FormButton label="Save" loadingLabel="Saving..." disabled={submitting} />
      <button
        type="button"
        onClick={() => {
          setIsEditing(false);
          setValue(currentValue);
        }}
        className="rounded-md bg-[var(--bg-tertiary)] px-2 py-1 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--accent-red)]"
      >
        <X className="h-4 w-4" />
      </button>
    </form>
  );
}
