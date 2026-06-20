import { useState } from 'react';
import { toast } from 'sonner';
import { FormButton } from '@/components/FormButton';
import { useMutualFunds } from '@/hooks/mutualFunds/useMutualFunds';
import type { MutualFund } from '@/services/mutualFunds/mutualFunds';
import { ArrowLeft } from 'lucide-react';

interface WithdrawalFormProps {
  funds: MutualFund[];
}

export function WithdrawalForm({ funds }: WithdrawalFormProps) {
  const { addWithdrawal } = useMutualFunds();
  const [symbol, setSymbol] = useState('');
  const [amount, setAmount] = useState('');
  const [withdrawalDate, setWithdrawalDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    const result = await addWithdrawal({
      symbol,
      amount: parseFloat(amount),
      withdrawalDate: new Date(withdrawalDate),
      notes: notes || undefined,
    });

    setSubmitting(false);

    if (result.success) {
      toast.success(result.message);
      setSymbol('');
      setAmount('');
      setWithdrawalDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    } else {
      toast.error(result.message);
      if (result.errors) {
        setErrors(result.errors);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4 flex items-center gap-2 text-[var(--accent-gold)]">
        <ArrowLeft className="h-4 w-4" />
        <h4 className="text-sm font-medium uppercase tracking-wider">Record Withdrawal</h4>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="symbol"
            className="block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]"
          >
            Fund
          </label>
          <select
            id="symbol"
            name="symbol"
            required
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="mt-1 block w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text-primary)] focus:border-[var(--accent-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)]"
          >
            <option value="" className="bg-[var(--bg-secondary)] text-[var(--text-muted)]">
              Select a fund
            </option>
            {funds.map((fund) => (
              <option key={fund.symbol} value={fund.symbol} className="bg-[var(--bg-secondary)]">
                {fund.symbol} - {fund.name}
              </option>
            ))}
          </select>
          {errors.symbol && (
            <p className="mt-1 text-xs text-[var(--accent-red)]">{errors.symbol[0]}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="amount"
            className="block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]"
          >
            Amount (PKR)
          </label>
          <div className="mt-1 flex items-center space-x-2">
            <span className="text-sm text-[var(--text-secondary)]">Rs.</span>
            <input
              type="number"
              id="amount"
              name="amount"
              required
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="block w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)]"
            />
          </div>
          {errors.amount && (
            <p className="mt-1 text-xs text-[var(--accent-red)]">{errors.amount[0]}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="withdrawalDate"
            className="block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]"
          >
            Withdrawal Date
          </label>
          <input
            type="date"
            id="withdrawalDate"
            name="withdrawalDate"
            required
            value={withdrawalDate}
            onChange={(e) => setWithdrawalDate(e.target.value)}
            className="mt-1 block w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text-primary)] focus:border-[var(--accent-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)]"
          />
        </div>
        <div>
          <label
            htmlFor="notes"
            className="block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]"
          >
            Notes
          </label>
          <input
            type="text"
            id="notes"
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 block w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)]"
          />
        </div>
      </div>
      <div className="mt-4">
        <FormButton label="Record Withdrawal" disabled={submitting} />
      </div>
    </form>
  );
}
