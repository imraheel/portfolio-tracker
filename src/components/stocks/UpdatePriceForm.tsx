import { useState } from 'react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FormButton } from '@/components/FormButton';
import * as stocksService from '@/services/stocks/stocks';
import { queryKeys } from '@/lib/queryKeys';

export function UpdatePriceForm({ symbol, currentPrice }: { symbol: string, currentPrice: string }) {
  const queryClient = useQueryClient();
  const [price, setPrice] = useState(currentPrice);
  const [submitting, setSubmitting] = useState(false);

  const updatePriceMutation = useMutation({
    mutationFn: stocksService.updateStockPrice,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.stocks.prices() });
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const result = await updatePriceMutation.mutateAsync({
      symbol,
      currentPrice: parseFloat(price),
    });

    setSubmitting(false);

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
      <input
        type="number"
        name="currentPrice"
        step="0.01"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
        className="h-[28px] w-28 rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-2 text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-blue)] focus:outline-none focus:ring-[2.5px] focus:ring-[var(--accent-blue)]/20"
      />
      <FormButton label="Update" loadingLabel="..." className="h-[28px] px-2.5 rounded-[6px] text-[12px] bg-[var(--accent-blue)] text-white font-medium hover:bg-[var(--accent-blue-dark)]" disabled={submitting} />
    </form>
  );
}
