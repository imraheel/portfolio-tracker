import { useState } from 'react';
import { toast } from 'sonner';
import { FormButton } from '@/components/FormButton';
import { useStocks } from '@/hooks/stocks/useStocks';

export function UpdatePriceForm({ stockId, currentPrice }: { stockId: number, currentPrice: string }) {
  const { updatePrice } = useStocks();
  const [price, setPrice] = useState(currentPrice);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const result = await updatePrice({
      stockId,
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
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="number"
        name="currentPrice"
        step="0.01"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
        className="w-32 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-1.5 text-[var(--text-primary)] shadow-sm focus:border-[var(--accent-gold)] focus:ring-[var(--accent-gold)] sm:text-sm"
      />
      <FormButton label="Update" loadingLabel="..." className="btn-secondary px-3 py-1.5" disabled={submitting} />
    </form>
  );
}
