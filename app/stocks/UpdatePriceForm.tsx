'use client';

import { useActionState, useEffect } from 'react';
import { updateStockPrice } from '@/app/actions/stocks';
import { FormButton } from '@/app/components/FormButton';
import { toast } from 'sonner';

const initialState = {
  message: '',
};

export function UpdatePriceForm({ stockId, currentPrice }: { stockId: number, currentPrice: string }) {
  const [state, formAction] = useActionState(updateStockPrice, initialState);

  useEffect(() => {
    if (state?.message) {
      if (state.message.includes('updated')) {
        toast.success(state.message);
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="stockId" value={stockId} />
      <input
        type="number"
        name="currentPrice"
        step="0.01"
        defaultValue={currentPrice}
        required
        className="w-32 rounded-md border border-gray-300 px-3 py-1.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      />
      <FormButton label="Update" loadingLabel="..." className="px-3 py-1.5" />
    </form>
  );
}
