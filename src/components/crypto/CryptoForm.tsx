import { useState } from 'react';
import { toast } from 'sonner';
import { FormButton } from '@/components/FormButton';
import { useCrypto } from '@/hooks/crypto/useCrypto';
import { PlusCircle } from 'lucide-react';

export function CryptoForm() {
  const { addCryptocurrency } = useCrypto();
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    const result = await addCryptocurrency({
      symbol,
      name,
    });

    setSubmitting(false);

    if (result.success) {
      toast.success(result.message);
      setSymbol('');
      setName('');
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
        <PlusCircle className="h-5 w-5 text-[var(--accent-gold)]" />
        <h3 className="text-[var(--accent-gold)] text-sm uppercase tracking-wider font-semibold">
          Add New Cryptocurrency
        </h3>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="symbol" className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">
            Symbol
          </label>
          <input
            type="text"
            id="symbol"
            name="symbol"
            required
            maxLength={20}
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="block w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text-primary)] focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] sm:text-sm"
          />
          {errors.symbol && <p className="mt-1 text-xs text-red-500">{errors.symbol[0]}</p>}
        </div>
        <div>
          <label htmlFor="name" className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            maxLength={255}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text-primary)] focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] sm:text-sm"
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name[0]}</p>}
        </div>
      </div>
      <div className="pt-2">
        <FormButton label="Add Cryptocurrency" disabled={submitting} />
      </div>
    </form>
  );
}
