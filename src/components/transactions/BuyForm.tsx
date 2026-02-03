import { useState } from 'react';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import { FormButton } from '@/components/FormButton';
import { useTransactions } from '@/hooks/useTransactions';
import { useWallet } from '@/hooks/useWallet';
import type { Stock } from '@/services/stocks';

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
    <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
       <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
         <h2 className="text-xl font-bold text-gray-900">Record Buy Transaction</h2>
         <div className="text-sm font-medium text-gray-500">
           Available Balance: <span className="font-bold text-blue-600">Rs. {balance.toLocaleString('en-PK')}</span>
         </div>
       </div>

       <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
          <label htmlFor="quantity" className="block text-xs font-bold uppercase tracking-wider text-gray-500">Quantity</label>
          <input 
            type="number" 
            id="quantity" 
            name="quantity" 
            required 
            min="1"
            value={qty || ''}
            onChange={(e) => setQty(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" 
          />
          {errors.quantity && (
            <p className="mt-1 text-xs text-red-600">{errors.quantity[0]}</p>
          )}
        </div>
        <div>
          <label htmlFor="buyRate" className="block text-xs font-bold uppercase tracking-wider text-gray-500">Buy Rate (PKR)</label>
          <input 
            type="number" 
            id="buyRate" 
            name="buyRate" 
            required 
            step="0.01" 
            min="0.01"
            value={rate || ''}
            onChange={(e) => setRate(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" 
          />
          {errors.buyRate && (
            <p className="mt-1 text-xs text-red-600">{errors.buyRate[0]}</p>
          )}
        </div>
        <div>
          <label htmlFor="buyDate" className="block text-xs font-bold uppercase tracking-wider text-gray-500">Buy Date</label>
          <input 
            type="date" 
            id="buyDate" 
            name="buyDate" 
            required 
            value={buyDate}
            onChange={(e) => setBuyDate(e.target.value)}
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
        
        <div className="flex items-center space-x-6">
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Cost</p>
            <p className={clsx("text-xl font-black", isInsufficient ? "text-red-600" : "text-gray-900")}>
              Rs. {totalCost.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <FormButton 
            label="Record Buy" 
            disabled={isInsufficient || submitting}
            className={clsx(isInsufficient && "opacity-50 cursor-not-allowed")}
          />
        </div>
      </div>
      
      {isInsufficient && (
        <p className="mt-2 text-right text-xs font-bold text-red-600 italic">
          Error: Total cost exceeds available wallet balance.
        </p>
      )}
    </form>
  );
}
