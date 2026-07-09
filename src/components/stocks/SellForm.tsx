import { useState } from 'react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as transactionsService from '@/services/stocks/transactions';
import { queryKeys } from '@/lib/queryKeys';
import type { Stock } from '@/services/stocks/stocks';

interface SellFormProps {
  stocks: Stock[];
  holdings: Map<string, number>;
  onSuccess?: () => void;
}

export function SellForm({ stocks, holdings, onSuccess }: SellFormProps) {
  const queryClient = useQueryClient();
  const [symbol, setSymbol] = useState('');
  const [qty, setQty] = useState<number>(0);
  const [rate, setRate] = useState<number>(0);
  const [sellDate, setSellDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  const availableQty = symbol ? (holdings.get(symbol) || 0) : 0;
  const isExceeded = qty > availableQty;

  const addSellTransactionMutation = useMutation({
    mutationFn: transactionsService.addSellTransaction,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.transactions.sells() });
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isExceeded) { toast.error('Sell quantity exceeds available shares'); return; }
    setSubmitting(true);
    setErrors({});
    const result = await addSellTransactionMutation.mutateAsync({
      symbol, quantity: qty, sellRate: rate, sellDate: new Date(sellDate), notes: notes || undefined,
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
      <div className="text-[12px] text-[var(--text-secondary)]">
        Available Shares: <span className="font-semibold text-[var(--accent-green)]">{availableQty.toLocaleString()}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-medium text-[var(--text-secondary)]">Stock Symbol</label>
          <select value={symbol} onChange={(e) => setSymbol(e.target.value)} required
            className="mt-1.5 block w-full h-[30px] rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-blue)]">
            <option value="">Select</option>
            {stocks.map((s) => <option key={s.symbol} value={s.symbol}>{s.symbol}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[11px] font-medium text-[var(--text-secondary)]">Sell Quantity</label>
          <input type="number" required min="1" value={qty || ''} onChange={(e) => setQty(Number(e.target.value))}
            className="mt-1.5 block w-full h-[30px] rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-blue)]" />
          {errors.quantity && <p className="mt-1 text-[11px] text-[var(--accent-red)]">{errors.quantity[0]}</p>}
        </div>
        <div>
          <label className="text-[11px] font-medium text-[var(--text-secondary)]">Sell Rate (PKR)</label>
          <input type="number" required step="0.01" min="0.01" value={rate || ''} onChange={(e) => setRate(Number(e.target.value))}
            className="mt-1.5 block w-full h-[30px] rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-blue)]" />
          {errors.sellRate && <p className="mt-1 text-[11px] text-[var(--accent-red)]">{errors.sellRate[0]}</p>}
        </div>
        <div>
          <label className="text-[11px] font-medium text-[var(--text-secondary)]">Sell Date</label>
          <input type="date" required value={sellDate} onChange={(e) => setSellDate(e.target.value)}
            className="mt-1.5 block w-full h-[30px] rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-blue)]" />
        </div>
      </div>
      <div>
        <label className="text-[11px] font-medium text-[var(--text-secondary)]">Notes (Optional)</label>
        <input value={notes} onChange={(e) => setNotes(e.target.value)}
          className="mt-1.5 block w-full h-[30px] rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-blue)]" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <div className="text-[12px] text-[var(--text-muted)]">
          Total Proceeds: <span className="font-semibold text-[var(--text-primary)]">
            Rs. {(qty * rate).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={isExceeded || submitting}
            className="h-[30px] px-4 rounded-[6px] bg-[var(--accent-blue)] text-white text-[12px] font-medium hover:bg-[var(--accent-blue-dark)] disabled:opacity-50">
            {submitting ? 'Processing...' : 'Record Sell'}
          </button>
        </div>
      </div>
    </form>
  );
}
