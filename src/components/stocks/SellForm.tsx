import { useState } from 'react';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import { FormButton } from '@/components/FormButton';
import { useTransactions } from '@/hooks/stocks/useTransactions';
import type { Stock } from '@/services/stocks/stocks';

export function SellForm({ stocks, holdings }: { stocks: Stock[], holdings: Map<number, number> }) {
  const { addSellTransaction } = useTransactions();
  const [stockId, setStockId] = useState('');
  const [qty, setQty] = useState<number>(0);
  const [rate, setRate] = useState<number>(0);
  const [sellDate, setSellDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  const availableQty = stockId ? (holdings.get(parseInt(stockId)) || 0) : 0;
  const isExceeded = qty > availableQty;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isExceeded) {
      toast.error('Sell quantity exceeds available shares');
      return;
    }

    setSubmitting(true);
    setErrors({});

    const result = await addSellTransaction({
      stockId: parseInt(stockId),
      quantity: qty,
      sellRate: rate,
      sellDate: new Date(sellDate),
      notes: notes || undefined,
    });

    setSubmitting(false);

    if (result.success) {
      toast.success(result.message);
      setStockId('');
      setQty(0);
      setRate(0);
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
       <div className="mb-6 flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-2">
            <span className="text-[var(--accent-gold)]">●</span>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Record Sell Transaction</h2>
          </div>
          <div className="text-sm font-medium text-[var(--text-secondary)]">
              Available Shares: <span className="font-bold text-[var(--accent-gold)]">{availableQty.toLocaleString()}</span>
          </div>
       </div>

       <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
          <label htmlFor="quantity" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Sell Quantity</label>
          <input 
              type="number" 
              id="quantity" 
              name="quantity" 
              required 
              min="1"
              value={qty || ''}
              onChange={(e) => setQty(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text-primary)] shadow-sm focus:border-[var(--accent-gold)] focus:ring-[var(--accent-gold)] sm:text-sm" 
          />
          {errors.quantity && (
            <p className="mt-1 text-xs text-red-400">{errors.quantity[0]}</p>
          )}
        </div>
        <div>
          <label htmlFor="sellRate" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Sell Rate (PKR)</label>
          <input 
              type="number" 
              id="sellRate" 
              name="sellRate" 
              required 
              step="0.01" 
              min="0.01"
              value={rate || ''}
              onChange={(e) => setRate(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text-primary)] shadow-sm focus:border-[var(--accent-gold)] focus:ring-[var(--accent-gold)] sm:text-sm" 
          />
          {errors.sellRate && (
            <p className="mt-1 text-xs text-red-400">{errors.sellRate[0]}</p>
          )}
        </div>
        <div>
          <label htmlFor="sellDate" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Sell Date</label>
          <input 
            type="date" 
            id="sellDate" 
            name="sellDate" 
            required 
            value={sellDate}
            onChange={(e) => setSellDate(e.target.value)}
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
        
        <div className="flex items-center space-x-6">
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Total Proceeds</p>
            <p className="text-xl font-black text-[var(--text-primary)]">
              Rs. {(qty * rate).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <FormButton 
              label="Record Sell" 
              disabled={isExceeded || submitting}
              className={clsx("btn-primary", isExceeded && "opacity-50 cursor-not-allowed")}
          />
        </div>
      </div>

      {isExceeded && (
        <p className="mt-2 text-right text-xs font-bold text-red-400 italic">
          Error: Sell quantity exceeds available shares.
        </p>
      )}
    </form>
  );
}
