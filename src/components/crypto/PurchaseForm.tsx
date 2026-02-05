import { useState } from 'react';
import { toast } from 'sonner';
import { FormButton } from '@/components/FormButton';
import { useCrypto } from '@/hooks/crypto/useCrypto';
import type { Cryptocurrency } from '@/services/crypto/crypto';

interface PurchaseFormProps {
  cryptocurrencies: Cryptocurrency[];
}

export function PurchaseForm({ cryptocurrencies }: PurchaseFormProps) {
  const { addPurchase } = useCrypto();
  const [cryptoId, setCryptoId] = useState('');
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
      cryptoId: parseInt(cryptoId),
      amountPkr: parseFloat(amountPkr),
      purchaseDate: new Date(purchaseDate),
      notes: notes || undefined,
    });

    setSubmitting(false);

    if (result.success) {
      toast.success(result.message);
      setCryptoId('');
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
    <form onSubmit={handleSubmit} >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cryptoId" className="block text-sm font-medium text-gray-700">
            Cryptocurrency
          </label>
          <select
            id="cryptoId"
            name="cryptoId"
            required
            value={cryptoId}
            onChange={(e) => setCryptoId(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select a cryptocurrency</option>
            {cryptocurrencies.map((crypto) => (
              <option key={crypto.id} value={crypto.id}>
                {crypto.symbol} - {crypto.name}
              </option>
            ))}
          </select>
          {errors.cryptoId && <p className="mt-1 text-xs text-red-600">{errors.cryptoId[0]}</p>}
        </div>
        <div>
          <label htmlFor="amountPkr" className="block text-sm font-medium text-gray-700">
            Amount (PKR)
          </label>
          <div className="mt-1 flex items-center space-x-2">
            <span className="text-sm text-gray-500">Rs.</span>
            <input
              type="number"
              id="amountPkr"
              name="amountPkr"
              required
              min="0.01"
              step="0.01"
              value={amountPkr}
              onChange={(e) => setAmountPkr(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          {errors.amountPkr && <p className="mt-1 text-xs text-red-600">{errors.amountPkr[0]}</p>}
        </div>
        <div>
          <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700">
            Purchase Date
          </label>
          <input
            type="date"
            id="purchaseDate"
            name="purchaseDate"
            required
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <input
            type="text"
            id="notes"
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>
      <div className="mt-4">
        <FormButton label="Record Purchase" disabled={submitting} />
      </div>
    </form>
  );
}
