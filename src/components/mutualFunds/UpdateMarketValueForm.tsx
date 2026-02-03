import { useState } from 'react';
import { toast } from 'sonner';
import { FormButton } from '@/components/FormButton';
import { useMutualFunds } from '@/hooks/useMutualFunds';

interface UpdateMarketValueFormProps {
  fundId: number;
  currentValue: string;
}

export function UpdateMarketValueForm({ fundId, currentValue }: UpdateMarketValueFormProps) {
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
      fundId,
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
        <span className="text-sm font-medium text-gray-900">
          {formatCurrency(parseFloat(currentValue) || 0)}
        </span>
        <button
          onClick={() => setIsEditing(true)}
          className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200"
        >
          Update
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center justify-end space-x-2">
      <div className="flex items-center space-x-1">
        <span className="text-sm text-gray-500">Rs.</span>
        <input
          type="number"
          step="0.01"
          min="0"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-32 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-indigo-500 focus:ring-indigo-500"
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
        className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200"
      >
        Cancel
      </button>
    </form>
  );
}
