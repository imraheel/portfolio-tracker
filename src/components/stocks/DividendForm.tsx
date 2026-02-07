import { useState } from 'react';
import { toast } from 'sonner';
import { FormButton } from '@/components/FormButton';
import { useTransactions } from '@/hooks/stocks/useTransactions';
import type { Stock } from '@/services/stocks/stocks';

export function DividendForm({ stocks }: { stocks: Stock[] }) {
  const { addDividend } = useTransactions();
  const [stockId, setStockId] = useState('');
  const [dividendAmount, setDividendAmount] = useState('');
  const [dividendDate, setDividendDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    const result = await addDividend({
      stockId: parseInt(stockId),
      dividendAmount: parseFloat(dividendAmount),
      dividendDate: new Date(dividendDate),
      notes: notes || undefined,
    });

    setSubmitting(false);

    if (result.success) {
      toast.success(result.message);
      setStockId('');
      setDividendAmount('');
      setNotes('');
    } else {
      toast.error(result.message);
      if (result.errors) {
        setErrors(result.errors);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6 shadow-sm">
       <div className="mb-6 border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-2">
            <span className="text-[var(--accent-gold)]">●</span>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Record Dividend</h2>
          </div>
          <p className="text-xs text-[var(--text-secondary)] italic mt-1">Dividend income will be automatically added to your available wallet balance.</p>
       </div>

       <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div>
          <label htmlFor="stockId" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Stock Symbol</label>
          <select 
            id="stockId" 
            name="stockId" 
            required 
            value={stockId}
            onChange={(e) => setStockId(e.target.value)}
            className="mt-1 block w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text-primary)] shadow-sm focus:border-[var(--accent-gold)] focus:ring-[var(--accent-gold)] sm:text-sm"
          >
              <option value="" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">Select a stock</option>
              {stocks.map((stock) => (<option key={stock.id} value={stock.id} className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">{stock.symbol}</option>))}
          </select>
        </div>
        <div>
          <label htmlFor="dividendAmount" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Amount (PKR)</label>
          <input 
            type="number" 
            id="dividendAmount" 
            name="dividendAmount" 
            required 
            step="0.01" 
            min="0.01"
            value={dividendAmount}
            onChange={(e) => setDividendAmount(e.target.value)}
            className="mt-1 block w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text-primary)] shadow-sm focus:border-[var(--accent-gold)] focus:ring-[var(--accent-gold)] sm:text-sm" 
          />
          {errors.dividendAmount && (
            <p className="mt-1 text-xs text-red-400">{errors.dividendAmount[0]}</p>
          )}
        </div>
        <div>
          <label htmlFor="dividendDate" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Date Received</label>
          <input 
            type="date" 
            id="dividendDate" 
            name="dividendDate" 
            required 
            value={dividendDate}
            onChange={(e) => setDividendDate(e.target.value)}
            className="mt-1 block w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text-primary)] shadow-sm focus:border-[var(--accent-gold)] focus:ring-[var(--accent-gold)] sm:text-sm" 
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col space-y-4 sm:flex-row sm:items-end sm:justify-between sm:space-y-0">
        <div className="flex-1 max-w-md">
          <label htmlFor="notes" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Notes (Optional)</label>
          <textarea 
            id="notes" 
            name="notes" 
            rows={1}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 block w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text-primary)] shadow-sm focus:border-[var(--accent-gold)] focus:ring-[var(--accent-gold)] sm:text-sm" 
          />
        </div>
        <FormButton label="Record Dividend" disabled={submitting} className="btn-primary" />
      </div>
    </form>
  );
}
