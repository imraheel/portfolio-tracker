import { useState } from 'react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as transactionsService from '@/services/stocks/transactions';
import { queryKeys } from '@/lib/queryKeys';
import type { Stock } from '@/services/stocks/stocks';

interface DividendFormProps {
  stocks: Stock[];
  onSuccess?: () => void;
}

export function DividendForm({ stocks, onSuccess }: DividendFormProps) {
  const queryClient = useQueryClient();
  const [symbol, setSymbol] = useState('');
  const [dividendAmount, setDividendAmount] = useState('');
  const [dividendDate, setDividendDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  const addDividendMutation = useMutation({
    mutationFn: transactionsService.addDividend,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.transactions.dividends() });
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    const result = await addDividendMutation.mutateAsync({
      symbol, dividendAmount: parseFloat(dividendAmount), dividendDate: new Date(dividendDate), notes: notes || undefined,
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
      <p className="text-[12px] text-[var(--text-secondary)]">Dividend income will be added to your wallet balance.</p>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-[11px] font-medium text-[var(--text-secondary)]">Stock</label>
          <select value={symbol} onChange={(e) => setSymbol(e.target.value)} required
            className="mt-1.5 block w-full h-[30px] rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-blue)]">
            <option value="">Select</option>
            {stocks.map((s) => <option key={s.symbol} value={s.symbol}>{s.symbol}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[11px] font-medium text-[var(--text-secondary)]">Amount (PKR)</label>
          <input type="number" required step="0.01" min="0.01" value={dividendAmount} onChange={(e) => setDividendAmount(e.target.value)}
            className="mt-1.5 block w-full h-[30px] rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-blue)]" />
          {errors.dividendAmount && <p className="mt-1 text-[11px] text-[var(--accent-red)]">{errors.dividendAmount[0]}</p>}
        </div>
        <div>
          <label className="text-[11px] font-medium text-[var(--text-secondary)]">Date</label>
          <input type="date" required value={dividendDate} onChange={(e) => setDividendDate(e.target.value)}
            className="mt-1.5 block w-full h-[30px] rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-blue)]" />
        </div>
      </div>
      <div>
        <label className="text-[11px] font-medium text-[var(--text-secondary)]">Notes (Optional)</label>
        <input value={notes} onChange={(e) => setNotes(e.target.value)}
          className="mt-1.5 block w-full h-[30px] rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-blue)]" />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="submit" disabled={submitting}
          className="h-[30px] px-4 rounded-[6px] bg-[var(--accent-blue)] text-white text-[12px] font-medium hover:bg-[var(--accent-blue-dark)] disabled:opacity-50">
          {submitting ? 'Processing...' : 'Record Dividend'}
        </button>
      </div>
    </form>
  );
}
