import { useState } from 'react';
import { toast } from 'sonner';
import { FormButton } from '@/components/FormButton';
import { useCrypto } from '@/hooks/crypto/useCrypto';
import { Edit3 } from 'lucide-react';

interface UpdateTotalValueFormProps {
  symbol: string;
  currentValue: string;
}

export function UpdateTotalValueForm({ symbol, currentValue }: UpdateTotalValueFormProps) {
  const { updateTotalValue } = useCrypto();
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

    const result = await updateTotalValue({
      symbol,
      totalValue: numericValue,
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
          className="btn-secondary text-xs py-1 px-2 flex items-center gap-1"
        >
          <Edit3 className="h-3 w-3" />
          Update
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center justify-end space-x-2">
      <div className="flex items-center space-x-1">
        <span className="text-sm text-[var(--text-muted)]">Rs.</span>
        <input
          type="number"
          step="0.01"
          min="0"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-32 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-2 py-1 text-sm text-[var(--text-primary)] focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)]"
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
        className="btn-secondary text-xs py-1 px-2"
      >
        Cancel
      </button>
    </form>
  );
}
