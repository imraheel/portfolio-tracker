import { toast } from 'sonner';
import { useWallet } from '@/hooks/stocks/useWallet';

export function DeleteWithdrawalButton({ id }: { id: string }) {
  const { deleteWithdrawal } = useWallet();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this withdrawal?')) {
      return;
    }

    const result = await deleteWithdrawal(id);

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
