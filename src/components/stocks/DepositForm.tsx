import { useState } from 'react';
import { toast } from 'sonner';
import { FormButton } from '@/components/FormButton';
import { useWallet } from '@/hooks/stocks/useWallet';

export function DepositForm() {
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
      setAmount('');
      setNote('');
      setDepositDate(new Date().toISOString().split('T')[0]);
    } else {
      toast.error(result.message);
      if (result.errors) {
        setErrors(result.errors);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg bg-[var(--bg-secondary)] p-6 shadow-md border border-[var(--border-subtle)] shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-[var(--accent-gold)]">●</span>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Add Funds</h2>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="amount" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Amount (PKR)</label>
          <input
            type="number"
            id="amount"
            name="amount"
            required
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text-primary)] shadow-sm focus:border-[var(--accent-gold)] focus:ring-[var(--accent-gold)] sm:text-sm"
          />
          {errors.amount && (
            <p className="mt-1 text-xs text-red-400 font-bold">{errors.amount[0]}</p>
          )}
        </div>
        <div>
          <label htmlFor="depositDate" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Deposit Date</label>
          <input
            type="date"
            id="depositDate"
            name="depositDate"
            required
            value={depositDate}
            onChange={(e) => setDepositDate(e.target.value)}
            className="mt-1 block w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text-primary)] shadow-sm focus:border-[var(--accent-gold)] focus:ring-[var(--accent-gold)] sm:text-sm"
          />
        </div>
      </div>
      <div className="mt-6">
        <label htmlFor="note" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Note (Optional)</label>
        <textarea
          id="note"
          name="note"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mt-1 block w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text-primary)] shadow-sm focus:border-[var(--accent-gold)] focus:ring-[var(--accent-gold)] sm:text-sm"
        />
      </div>
      <div className="mt-6">
        <FormButton label="Add Deposit" disabled={submitting} className="btn-primary" />
      </div>
    </form>
  );
}
