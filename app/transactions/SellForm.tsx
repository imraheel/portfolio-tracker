'use client';

import { useActionState, useEffect, useState } from 'react';
import { addSellTransaction } from '@/app/actions/transactions';
import { FormButton } from '@/app/components/FormButton';
import { toast } from 'sonner';
import { clsx } from 'clsx';

const initialState = {
  message: '',
  errors: {},
};

export function SellForm({ stocks, holdings }: { stocks: any[], holdings: Map<number, number> }) {
    const [state, formAction] = useActionState(addSellTransaction, initialState);
    const [selectedStockId, setSelectedStockId] = useState<number | null>(null);
    const [qty, setQty] = useState<number>(0);
    const [rate, setRate] = useState<number>(0);

    const availableQty = selectedStockId ? (holdings.get(selectedStockId) || 0) : 0;
    const isExceeded = qty > availableQty;

    useEffect(() => {
      if (state?.message) {
        if (state.message.includes('Successfully')) {
          toast.success(state.message);
          setQty(0);
          setRate(0);
        } else {
          toast.error(state.message);
        }
      }
    }, [state]);

    return (
      <form action={formAction} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
         <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-gray-900">Record Sell Transaction</h2>
            <div className="text-sm font-medium text-gray-500">
                Available Shares: <span className="font-bold text-orange-600">{availableQty.toLocaleString()}</span>
            </div>
         </div>

         <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="stockId" className="block text-xs font-bold uppercase tracking-wider text-gray-500">Stock Symbol</label>
            <select 
                id="stockId" 
                name="stockId" 
                required 
                onChange={(e) => setSelectedStockId(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
                <option value="">Select a stock</option>
                {stocks.map((stock) => (<option key={stock.id} value={stock.id}>{stock.symbol}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="quantity" className="block text-xs font-bold uppercase tracking-wider text-gray-500">Sell Quantity</label>
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
          </div>
          <div>
            <label htmlFor="sellRate" className="block text-xs font-bold uppercase tracking-wider text-gray-500">Sell Rate (PKR)</label>
            <input 
                type="number" 
                id="sellRate" 
                name="sellRate" 
                required 
                step="0.01" 
                min="0.01"
                value={rate || ''}
                onChange={(e) => setRate(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" 
            />
          </div>
          <div>
            <label htmlFor="sellDate" className="block text-xs font-bold uppercase tracking-wider text-gray-500">Sell Date</label>
            <input type="date" id="sellDate" name="sellDate" required defaultValue={new Date().toISOString().split('T')[0]} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
          </div>
        </div>

        <div className="mt-6 flex flex-col space-y-4 sm:flex-row sm:items-end sm:justify-between sm:space-y-0">
          <div className="flex-1 max-w-md">
            <label htmlFor="notes" className="block text-xs font-bold uppercase tracking-wider text-gray-500">Notes (Optional)</label>
            <textarea id="notes" name="notes" rows={1} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Proceeds</p>
              <p className="text-xl font-black text-gray-900">
                Rs. {(qty * rate).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <FormButton 
                label="Record Sell" 
                className={clsx(isExceeded && "opacity-50 cursor-not-allowed")}
            />
          </div>
        </div>

        {isExceeded && (
          <p className="mt-2 text-right text-xs font-bold text-red-600 italic">
            Error: Sell quantity exceeds available shares.
          </p>
        )}
      </form>
    );
}