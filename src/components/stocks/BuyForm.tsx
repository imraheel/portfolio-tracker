import { useState } from 'react';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import { FormButton } from '@/components/FormButton';
import { useTransactions } from '@/hooks/stocks/useTransactions';
import { useWallet } from '@/hooks/stocks/useWallet';
import type { Stock } from '@/services/stocks/stocks';

export function BuyForm({ stocks, balance }: { stocks: Stock[], balance: number }) {
  const { addBuyTransaction } = useTransactions();
  const { refresh: refreshWallet } = useWallet();
  const [stockId, setStockId] = useState('');
  const [qty, setQty] = useState<number>(0);
  const [rate, setRate] = useState<number>(0);
  const [buyDate, setBuyDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  const totalCost = qty * rate;
  const isInsufficient = totalCost > balance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isInsufficient) {
      toast.error('Insufficient wallet balance');
      return;
    }

    setSubmitting(true);
    setErrors({});

    const result = await addBuyTransaction({
      stockId: parseInt(stockId),
      quantity: qty,
      buyRate: rate,
      buyDate: new Date(buyDate),
      notes: notes || undefined,
    });

    setSubmitting(false);

    if (result.success) {
      toast.success(result.message);
      setStockId('');
      setQty(0);
      setRate(0);
      setNotes('');
      refreshWallet();
    } else {
      toast.error(result.message);
      if (result.errors) {
        setErrors(result.errors);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
       <div className="mb-6 flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
         <div className="flex items-center gap-2"></div>
         <div className="text-sm font-medium text-[var(--text-secondary)]">
           Available Balance: <span className="font-mono font-bold text-[var(--accent-gold)]">Rs. {balance.toLocaleString('en-PK')}</span>
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
            className="mt-1 block w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)]"
          >
            <option value="" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">Select a stock</option>
            {stocks.map((stock) => (<option key={stock.id} value={stock.id} className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">{stock.symbol}</option>))}
          </select>
        </div>
        <div>
          <label htmlFor="quantity" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Quantity</label>
          <input 
            type="number" 
            id="quantity" 
            name="quantity" 
            required 
            min="1"
            value={qty || ''}
            onChange={(e) => setQty(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)]" 
          />
          {errors.quantity && (
            <p className="mt-1 text-xs text-red-400">{errors.quantity[0]}</p>
          )}
        </div>
        <div>
          <label htmlFor="buyRate" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Buy Rate (PKR)</label>
          <input 
            type="number" 
            id="buyRate" 
            name="buyRate" 
            required 
            step="0.01" 
            min="0.01"
            value={rate || ''}
            onChange={(e) => setRate(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)]" 
          />
          {errors.buyRate && (
            <p className="mt-1 text-xs text-red-400">{errors.buyRate[0]}</p>
          )}
        </div>
        <div>
          <label htmlFor="buyDate" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Buy Date</label>
          <input 
            type="date" 
            id="buyDate" 
            name="buyDate" 
            required 
            value={buyDate}
            onChange={(e) => setBuyDate(e.target.value)}
            className="mt-1 block w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)]" 
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
            className="mt-1 block w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)]" 
          />
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Total Cost</p>
            <p className={clsx("text-xl font-black", isInsufficient ? "text-red-400" : "text-[var(--text-primary)]")}>
              Rs. {totalCost.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <FormButton 
            label="Record Buy" 
            disabled={isInsufficient || submitting}
            className={clsx("btn-primary", isInsufficient && "opacity-50 cursor-not-allowed")}
          />
        </div>
      </div>
      
      {isInsufficient && (
        <p className="mt-2 text-right text-xs font-bold text-red-400 italic">
          Error: Total cost exceeds available wallet balance.
        </p>
      )}
    </form>
  );
}
