import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as walletService from '@/services/stocks/wallet';
import { queryKeys } from '@/lib/queryKeys';

export function DeleteWithdrawalButton({ id }: { id: string }) {
  const queryClient = useQueryClient();

  const deleteWithdrawalMutation = useMutation({
    mutationFn: walletService.deleteWithdrawal,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.wallet.withdrawals() });
        queryClient.invalidateQueries({ queryKey: queryKeys.wallet.balance() });
      }
    },
  });

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this withdrawal?')) {
      return;
    }

    const result = await deleteWithdrawalMutation.mutateAsync(id);

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <button 
      type="button" 
      onClick={handleDelete}
      className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
    >
      Delete
    </button>
  );
}
