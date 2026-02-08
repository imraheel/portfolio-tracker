import { useState } from 'react';
import { toast } from 'sonner';
import { FormButton } from '@/components/FormButton';
import { useWallet } from '@/hooks/stocks/useWallet';

export function WithdrawalForm() {
  const { addWithdrawal, balance } = useWallet();
  const [amount, setAmount] = useState('');
  const [withdrawalDate, setWithdrawalDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    const withdrawalAmount = parseFloat(amount);

    // Client-side validation for sufficient balance
    if (withdrawalAmount > balance) {
      toast.error(`Insufficient balance. Available: Rs. ${balance.toLocaleString('en-PK')}`);
      setSubmitting(false);
      return;
    }

    const result = await addWithdrawal({
      amount: withdrawalAmount,
      withdrawalDate: new Date(withdrawalDate),
      note: note || undefined,
    });

    setSubmitting(false);

    if (result.success) {
      toast.success(result.message);
      setAmount('');
      setNote('');
      setWithdrawalDate(new Date().toISOString().split('T')[0]);
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
        <span className="text-[var(--accent-coral)]">●</span>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Withdraw Funds</h2>
      </div>
      <div className="mb-4 p-3 bg-[var(--bg-tertiary)] rounded-md">
        <p className="text-xs text-[var(--text-muted)]">
          Available Balance: <span className="font-mono font-medium text-[var(--text-primary)]">Rs. {balance.toLocaleString('en-PK')}</span>
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="withdrawal-amount" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Amount (PKR)</label>
          <input
            type="number"
            id="withdrawal-amount"
            name="amount"
            required
            step="0.01"
            max={balance}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text-primary)] shadow-sm focus:border-[var(--accent-coral)] focus:ring-[var(--accent-coral)] sm:text-sm"
          />
          {errors.amount && (
            <p className="mt-1 text-xs text-red-400 font-bold">{errors.amount[0]}</p>
          )}
        </div>
        <div>
          <label htmlFor="withdrawal-date" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Withdrawal Date</label>
          <input
            type="date"
            id="withdrawal-date"
            name="withdrawalDate"
            required
            value={withdrawalDate}
            onChange={(e) => setWithdrawalDate(e.target.value)}
            className="mt-1 block w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text-primary)] shadow-sm focus:border-[var(--accent-coral)] focus:ring-[var(--accent-coral)] sm:text-sm"
          />
        </div>
      </div>
      <div className="mt-6">
        <label htmlFor="withdrawal-note" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Note (Optional)</label>
        <textarea
          id="withdrawal-note"
          name="note"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mt-1 block w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text-primary)] shadow-sm focus:border-[var(--accent-coral)] focus:ring-[var(--accent-coral)] sm:text-sm"
        />
      </div>
      <div className="mt-6">
        <FormButton label="Withdraw Funds" disabled={submitting || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > balance} className="btn-coral" />
      </div>
    </form>
  );
}
