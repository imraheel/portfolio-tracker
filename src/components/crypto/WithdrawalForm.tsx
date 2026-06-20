import { useState } from 'react';
import { toast } from 'sonner';
import { FormButton } from '@/components/FormButton';
import { useCrypto } from '@/hooks/crypto/useCrypto';
import type { Cryptocurrency } from '@/services/crypto/crypto';

interface WithdrawalFormProps {
  cryptocurrencies: Cryptocurrency[];
  onSuccess?: () => void;
}

export function WithdrawalForm({ cryptocurrencies, onSuccess }: WithdrawalFormProps) {
  const { addWithdrawal } = useCrypto();
  const [symbol, setSymbol] = useState('');
  const [amountPkr, setAmountPkr] = useState('');
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
      amountPkr: parseFloat(amountPkr),
      withdrawalDate: new Date(withdrawalDate),
      notes: notes || undefined,
    });

    setSubmitting(false);

    if (result.success) {
      toast.success(result.message);
      setSymbol('');
      setAmountPkr('');
      setWithdrawalDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      onSuccess?.();
    } else {
      toast.error(result.message);
      if (result.errors) {
        setErrors(result.errors);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="symbol" className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Cryptocurrency</label>
        <select
          id="symbol" name="symbol" required value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="h-[30px] w-full rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-2.5 text-[13px] text-[var(--text-primary)] focus:border-[var(--accent-blue)] focus:outline-none focus:ring-[2.5px] focus:ring-[var(--accent-blue)]/20"
        >
          <option value="" className="bg-[var(--bg-secondary)] text-[var(--text-muted)]">Select a cryptocurrency</option>
          {cryptocurrencies.map((crypto) => (
            <option key={crypto.symbol} value={crypto.symbol} className="bg-[var(--bg-secondary)]">{crypto.symbol} - {crypto.name}</option>
          ))}
        </select>
        {errors.symbol && <p className="mt-1 text-[11px] text-[var(--accent-red)]">{errors.symbol[0]}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="amountPkr" className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Amount (PKR)</label>
          <input
            type="number" id="amountPkr" name="amountPkr" required min="0.01" step="0.01"
            value={amountPkr} onChange={(e) => setAmountPkr(e.target.value)}
            className="h-[30px] w-full rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-2.5 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-blue)] focus:outline-none focus:ring-[2.5px] focus:ring-[var(--accent-blue)]/20"
          />
          {errors.amountPkr && <p className="mt-1 text-[11px] text-[var(--accent-red)]">{errors.amountPkr[0]}</p>}
        </div>
        <div>
          <label htmlFor="withdrawalDate" className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Withdrawal Date</label>
          <input
            type="date" id="withdrawalDate" name="withdrawalDate" required
            value={withdrawalDate} onChange={(e) => setWithdrawalDate(e.target.value)}
            className="h-[30px] w-full rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-2.5 text-[13px] text-[var(--text-primary)] focus:border-[var(--accent-blue)] focus:outline-none focus:ring-[2.5px] focus:ring-[var(--accent-blue)]/20"
          />
        </div>
      </div>
      <div>
        <label htmlFor="notes" className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Notes</label>
        <input
          type="text" id="notes" name="notes"
          value={notes} onChange={(e) => setNotes(e.target.value)}
          className="h-[30px] w-full rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-2.5 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-blue)] focus:outline-none focus:ring-[2.5px] focus:ring-[var(--accent-blue)]/20"
        />
      </div>
      <div className="flex justify-end pt-1">
        <FormButton label="Record Withdrawal" disabled={submitting} />
      </div>
    </form>
  );
}
