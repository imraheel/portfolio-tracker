'use client';

import { useActionState, useEffect } from 'react';
import { addDeposit } from '@/app/actions/wallet';
import { FormButton } from '@/app/components/FormButton';
import { toast } from 'sonner';

const initialState = {
  message: '',
  errors: {},
};

export function DepositForm() {
  const [state, formAction] = useActionState(addDeposit, initialState);

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
    <form action={formAction} className="rounded-lg bg-white p-6 shadow-md border border-gray-200 shadow-sm">
      <h2 className="mb-4 text-xl font-bold text-gray-900">Add Funds</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="amount" className="block text-xs font-bold uppercase tracking-wider text-gray-500">Amount (PKR)</label>
          <input
            type="number"
            id="amount"
            name="amount"
            required
            step="0.01"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          {state?.errors?.amount && (
            <p className="mt-1 text-xs text-red-600 font-bold">{state.errors.amount[0]}</p>
          )}
        </div>
        <div>
          <label htmlFor="depositDate" className="block text-xs font-bold uppercase tracking-wider text-gray-500">Deposit Date</label>
          <input
            type="date"
            id="depositDate"
            name="depositDate"
            required
            defaultValue={new Date().toISOString().split('T')[0]}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>
      <div className="mt-6">
        <label htmlFor="note" className="block text-xs font-bold uppercase tracking-wider text-gray-500">Note (Optional)</label>
        <textarea
          id="note"
          name="note"
          rows={2}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div className="mt-6">
        <FormButton label="Add Deposit" />
      </div>
    </form>
  );
}