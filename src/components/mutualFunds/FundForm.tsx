import { useState } from 'react';
import { toast } from 'sonner';
import { FormButton } from '@/components/FormButton';
import { useMutualFunds } from '@/hooks/mutualFunds/useMutualFunds';
import { Plus } from 'lucide-react';

export function FundForm() {
  const { addFund } = useMutualFunds();
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    const result = await addFund({
      symbol,
      name,
      description: description || undefined,
    });

    setSubmitting(false);

    if (result.success) {
      toast.success(result.message);
      setSymbol('');
      setName('');
      setDescription('');
    } else {
      toast.error(result.message);
      if (result.errors) {
        setErrors(result.errors);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4 flex items-center gap-2 text-[var(--accent-gold)]">
        <Plus className="h-4 w-4" />
        <h4 className="text-sm font-medium uppercase tracking-wider">Add New Fund</h4>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label
            htmlFor="symbol"
            className="block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]"
          >
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
            className="mt-1 block w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)]"
          />
          {errors.symbol && (
            <p className="mt-1 text-xs text-[var(--accent-red)]">{errors.symbol[0]}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="name"
            className="block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]"
          >
            Fund Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            maxLength={255}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)]"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-[var(--accent-red)]">{errors.name[0]}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="description"
            className="block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]"
          >
            Description
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)]"
          />
        </div>
      </div>
      <div className="mt-4">
        <FormButton label="Add Fund" disabled={submitting} />
      </div>
    </form>
  );
}
