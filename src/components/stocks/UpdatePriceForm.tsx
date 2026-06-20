import { useState } from 'react';
import { toast } from 'sonner';
import { FormButton } from '@/components/FormButton';
import { useStocks } from '@/hooks/stocks/useStocks';

export function UpdatePriceForm({ symbol, currentPrice }: { symbol: string, currentPrice: string }) {
  const { updatePrice } = useStocks();
  const [price, setPrice] = useState(currentPrice);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const result = await updatePrice({
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
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="number"
        name="currentPrice"
        step="0.01"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
        className="mt-1 block w-32 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)]"
      />
      <FormButton label="Update" loadingLabel="..." className="btn-secondary px-3 py-1.5" disabled={submitting} />
    </form>
  );
}
