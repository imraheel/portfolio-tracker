'use client';

import { useActionState, useEffect } from 'react';
import { addDividend } from '@/app/actions/transactions';
import { FormButton } from '@/app/components/FormButton';
import { toast } from 'sonner';

const initialState = {
  message: '',
  errors: {},
};

export function DividendForm({ stocks }: { stocks: any[] }) {
    const [state, formAction] = useActionState(addDividend, initialState);

    useEffect(() => {
      if (state?.message) {
        if (state.message.includes('Successfully')) {
          toast.success(state.message);
        } else {
          toast.error(state.message);
        }
      }
    }, [state]);

    return (
      <form action={formAction} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
         <div className="mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-gray-900">Record Dividend</h2>
            <p className="text-xs text-gray-500 italic mt-1">Dividend income will be automatically added to your available wallet balance.</p>
         </div>

         <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <label htmlFor="stockId" className="block text-xs font-bold uppercase tracking-wider text-gray-500">Stock Symbol</label>
            <select id="stockId" name="stockId" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                <option value="">Select a stock</option>
                {stocks.map((stock) => (<option key={stock.id} value={stock.id}>{stock.symbol}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="dividendAmount" className="block text-xs font-bold uppercase tracking-wider text-gray-500">Amount (PKR)</label>
            <input type="number" id="dividendAmount" name="dividendAmount" required step="0.01" min="0.01" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
          </div>
          <div>
            <label htmlFor="dividendDate" className="block text-xs font-bold uppercase tracking-wider text-gray-500">Date Received</label>
            <input type="date" id="dividendDate" name="dividendDate" required defaultValue={new Date().toISOString().split('T')[0]} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
          </div>
        </div>

        <div className="mt-6 flex flex-col space-y-4 sm:flex-row sm:items-end sm:justify-between sm:space-y-0">
          <div className="flex-1 max-w-md">
            <label htmlFor="notes" className="block text-xs font-bold uppercase tracking-wider text-gray-500">Notes (Optional)</label>
            <textarea id="notes" name="notes" rows={1} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
          </div>
          <FormButton label="Record Dividend" />
        </div>
      </form>
    );
}