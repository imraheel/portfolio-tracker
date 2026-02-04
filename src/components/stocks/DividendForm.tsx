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
    <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
       <div className="mb-6 border-b border-gray-100 pb-4">
          <h2 className="text-xl font-bold text-gray-900">Record Dividend</h2>
          <p className="text-xs text-gray-500 italic mt-1">Dividend income will be automatically added to your available wallet balance.</p>
       </div>

       <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div>
          <label htmlFor="stockId" className="block text-xs font-bold uppercase tracking-wider text-gray-500">Stock Symbol</label>
          <select 
            id="stockId" 
            name="stockId" 
            required 
            value={stockId}
            onChange={(e) => setStockId(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
              <option value="">Select a stock</option>
              {stocks.map((stock) => (<option key={stock.id} value={stock.id}>{stock.symbol}</option>))}
          </select>
        </div>
        <div>
          <label htmlFor="dividendAmount" className="block text-xs font-bold uppercase tracking-wider text-gray-500">Amount (PKR)</label>
          <input 
            type="number" 
            id="dividendAmount" 
            name="dividendAmount" 
            required 
            step="0.01" 
            min="0.01"
            value={dividendAmount}
            onChange={(e) => setDividendAmount(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" 
          />
          {errors.dividendAmount && (
            <p className="mt-1 text-xs text-red-600">{errors.dividendAmount[0]}</p>
          )}
        </div>
        <div>
          <label htmlFor="dividendDate" className="block text-xs font-bold uppercase tracking-wider text-gray-500">Date Received</label>
          <input 
            type="date" 
            id="dividendDate" 
            name="dividendDate" 
            required 
            value={dividendDate}
            onChange={(e) => setDividendDate(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" 
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col space-y-4 sm:flex-row sm:items-end sm:justify-between sm:space-y-0">
        <div className="flex-1 max-w-md">
          <label htmlFor="notes" className="block text-xs font-bold uppercase tracking-wider text-gray-500">Notes (Optional)</label>
          <textarea 
            id="notes" 
            name="notes" 
            rows={1}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" 
          />
        </div>
        <FormButton label="Record Dividend" disabled={submitting} />
      </div>
    </form>
  );
}
