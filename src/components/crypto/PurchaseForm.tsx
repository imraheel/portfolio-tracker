import { useState } from 'react';
import { toast } from 'sonner';
import { FormButton } from '@/components/FormButton';
import { useCrypto } from '@/hooks/crypto/useCrypto';
import type { Cryptocurrency } from '@/services/crypto/crypto';
import { Wallet } from 'lucide-react';

interface PurchaseFormProps {
  cryptocurrencies: Cryptocurrency[];
}

export function PurchaseForm({ cryptocurrencies }: PurchaseFormProps) {
  const { addPurchase } = useCrypto();
  const [symbol, setSymbol] = useState('');
  const [amountPkr, setAmountPkr] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    const result = await addPurchase({
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
    } else {
      toast.error(result.message);
      if (result.errors) {
        setErrors(result.errors);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="h-5 w-5 text-[var(--accent-gold)]" />
        <h3 className="text-[var(--accent-gold)] text-sm uppercase tracking-wider font-semibold">
          Record Purchase
        </h3>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="symbol" className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">
            Cryptocurrency
          </label>
          <select
            id="symbol"
            name="symbol"
            required
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="block w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text-primary)] focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] sm:text-sm"
          >
            <option value="" className="bg-[var(--bg-secondary)] text-[var(--text-secondary)]">Select a cryptocurrency</option>
            {cryptocurrencies.map((crypto) => (
              <option key={crypto.symbol} value={crypto.symbol} className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">
                {crypto.symbol} - {crypto.name}
              </option>
            ))}
          </select>
          {errors.symbol && <p className="mt-1 text-xs text-red-500">{errors.symbol[0]}</p>}
        </div>
        <div>
          <label htmlFor="amountPkr" className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">
            Amount (PKR)
          </label>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-[var(--text-muted)]">Rs.</span>
            <input
              type="number"
              id="amountPkr"
              name="amountPkr"
              required
              min="0.01"
              step="0.01"
              value={amountPkr}
              onChange={(e) => setAmountPkr(e.target.value)}
              className="block w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text-primary)] focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] sm:text-sm"
            />
          </div>
          {errors.amountPkr && <p className="mt-1 text-xs text-red-500">{errors.amountPkr[0]}</p>}
        </div>
        <div>
          <label htmlFor="purchaseDate" className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">
            Purchase Date
          </label>
          <input
            type="date"
            id="purchaseDate"
            name="purchaseDate"
            required
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="block w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text-primary)] focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="notes" className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">
            Notes
          </label>
          <input
            type="text"
            id="notes"
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="block w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text-primary)] focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] sm:text-sm"
          />
        </div>
      </div>
      <div className="pt-2">
        <FormButton label="Record Purchase" disabled={submitting} />
      </div>
    </form>
  );
}
