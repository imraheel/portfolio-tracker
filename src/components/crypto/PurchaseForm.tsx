import { useState } from 'react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FormButton } from '@/components/FormButton';
import * as cryptoService from '@/services/crypto/crypto';
import { queryKeys } from '@/lib/queryKeys';
import type { Cryptocurrency } from '@/services/crypto/crypto';

interface PurchaseFormProps {
  cryptocurrencies: Cryptocurrency[];
  onSuccess?: () => void;
}

export function PurchaseForm({ cryptocurrencies, onSuccess }: PurchaseFormProps) {
  const queryClient = useQueryClient();
  const [symbol, setSymbol] = useState('');
  const [amountPkr, setAmountPkr] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  const addPurchaseMutation = useMutation({
    mutationFn: cryptoService.addPurchase,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.crypto.purchases() });
        queryClient.invalidateQueries({ queryKey: queryKeys.crypto.metrics() });
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    const result = await addPurchaseMutation.mutateAsync({
      symbol,
      amountPkr: parseFloat(amountPkr),
      purchaseDate: new Date(purchaseDate),
      notes: notes || undefined,
    });

    setSubmitting(false);

    if (result.success) {
      toast.success(result.message);
      setSymbol('');
      setAmountPkr('');
      setPurchaseDate(new Date().toISOString().split('T')[0]);
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
          <label htmlFor="purchaseDate" className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Purchase Date</label>
          <input
            type="date" id="purchaseDate" name="purchaseDate" required
            value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)}
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
        <FormButton label="Record Purchase" disabled={submitting} />
      </div>
    </form>
  );
}
