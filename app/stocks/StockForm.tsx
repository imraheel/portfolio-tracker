'use client';

import { useActionState, useEffect } from 'react';
import { addStock } from '@/app/actions/stocks';
import { FormButton } from '@/app/components/FormButton';
import { toast } from 'sonner';

const initialState = {
  message: '',
  errors: {},
};

export function StockForm() {
  const [state, formAction] = useActionState(addStock, initialState);

  useEffect(() => {
    if (state?.message) {
      if (state.message.includes('Added')) {
        toast.success(state.message);
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  return (
    <form action={formAction} className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-semibold">Add New Stock</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="symbol" className="block text-sm font-medium text-gray-700">Symbol</label>
          <input 
            type="text" 
            id="symbol" 
            name="symbol" 
            required 
            maxLength={10} 
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
          />
          {state?.errors?.symbol && (
            <p className="mt-1 text-xs text-red-600">{state.errors.symbol[0]}</p>
          )}
        </div>
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name</label>
          <input type="text" id="companyName" name="companyName" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="sector" className="block text-sm font-medium text-gray-700">Sector</label>
          <input type="text" id="sector" name="sector" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
        </div>
      </div>
      <div className="mt-4">
        <FormButton label="Add Stock" />
      </div>
    </form>
  );
}
