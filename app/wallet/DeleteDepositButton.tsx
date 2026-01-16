'use client';

import { useActionState, useEffect } from 'react';
import { deleteDeposit } from '@/app/actions/wallet';
import { toast } from 'sonner';

const initialState = {
  message: '',
};

export function DeleteDepositButton({ id }: { id: number }) {
  const [state, formAction] = useActionState(deleteDeposit, initialState);

  useEffect(() => {
    if (state?.message) {
      if (state.message.includes('Deleted')) {
        toast.success(state.message);
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <button 
        type="submit" 
        className="text-red-600 hover:text-red-900 text-sm font-medium"
        onClick={(e) => {
          if (!confirm('Are you sure you want to delete this deposit?')) {
            e.preventDefault();
          }
        }}
      >
        Delete
      </button>
    </form>
  );
}
