import { toast } from 'sonner';
import { useWallet } from '@/hooks/stocks/useWallet';

export function DeleteDepositButton({ id }: { id: number }) {
  const { deleteDeposit } = useWallet();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this deposit?')) {
      return;
    }

    const result = await deleteDeposit(id);

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
      className="text-red-600 hover:text-red-900 text-sm font-medium"
    >
      Delete
    </button>
  );
}
