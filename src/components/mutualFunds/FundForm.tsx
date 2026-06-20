import { useState } from 'react';
import { toast } from 'sonner';
import { useMutualFunds } from '@/hooks/mutualFunds/useMutualFunds';

interface FundFormProps {
  onSuccess?: () => void;
}

export function FundForm({ onSuccess }: FundFormProps) {
  const { addFund } = useMutualFunds();
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    const result = await addFund({ symbol, name, description: description || undefined });
    setSubmitting(false);
    if (result.success) {
      toast.success(result.message);
      onSuccess?.();
    } else {
      toast.error(result.message);
      if (result.errors) setErrors(result.errors);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-[11px] font-medium text-[var(--text-secondary)]">Symbol</label>
        <input type="text" required maxLength={10} value={symbol} onChange={(e) => setSymbol(e.target.value)}
          className="mt-1.5 block w-full h-[30px] rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-blue)]" />
        {errors.symbol && <p className="mt-1 text-[11px] text-[var(--accent-red)]">{errors.symbol[0]}</p>}
      </div>
      <div>
        <label className="text-[11px] font-medium text-[var(--text-secondary)]">Fund Name</label>
        <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
          className="mt-1.5 block w-full h-[30px] rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-blue)]" />
        {errors.name && <p className="mt-1 text-[11px] text-[var(--accent-red)]">{errors.name[0]}</p>}
      </div>
      <div>
        <label className="text-[11px] font-medium text-[var(--text-secondary)]">Description (Optional)</label>
        <input value={description} onChange={(e) => setDescription(e.target.value)}
          className="mt-1.5 block w-full h-[30px] rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-blue)]" />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="submit" disabled={submitting}
          className="h-[30px] px-4 rounded-[6px] bg-[var(--accent-blue)] text-white text-[12px] font-medium hover:bg-[var(--accent-blue-dark)] disabled:opacity-50">
          {submitting ? 'Processing...' : 'Add Fund'}
        </button>
      </div>
    </form>
  );
}
