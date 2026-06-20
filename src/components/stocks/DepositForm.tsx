import { useState } from 'react';
import { toast } from 'sonner';
import { useWallet } from '@/hooks/stocks/useWallet';

interface DepositFormProps {
  onSuccess?: () => void;
}

export function DepositForm({ onSuccess }: DepositFormProps) {
  const { addDeposit } = useWallet();
  const [amount, setAmount] = useState('');
  const [depositDate, setDepositDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    const result = await addDeposit({
      amount: parseFloat(amount),
      depositDate: new Date(depositDate),
      note: note || undefined,
    });

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
        <label className="text-[11px] font-medium text-[var(--text-secondary)]">Amount (PKR)</label>
        <input
          type="number"
          required step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1.5 block w-full h-[30px] rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent-blue)]"
        />
        {errors.amount && <p className="mt-1 text-[11px] text-[var(--accent-red)]">{errors.amount[0]}</p>}
      </div>
      <div>
        <label className="text-[11px] font-medium text-[var(--text-secondary)]">Deposit Date</label>
        <input
          type="date"
          required
          value={depositDate}
          onChange={(e) => setDepositDate(e.target.value)}
          className="mt-1.5 block w-full h-[30px] rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-blue)]"
        />
      </div>
      <div>
        <label className="text-[11px] font-medium text-[var(--text-secondary)]">Note (Optional)</label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mt-1.5 block w-full h-[30px] rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent-blue)]"
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="submit" disabled={submitting}
          className="h-[30px] px-4 rounded-[6px] bg-[var(--accent-blue)] text-white text-[12px] font-medium hover:bg-[var(--accent-blue-dark)] disabled:opacity-50">
          {submitting ? 'Processing...' : 'Add Deposit'}
        </button>
      </div>
    </form>
  );
}
