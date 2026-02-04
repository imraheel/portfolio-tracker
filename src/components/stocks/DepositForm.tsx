import { useState } from 'react';
import { toast } from 'sonner';
import { FormButton } from '@/components/FormButton';
import { useWallet } from '@/hooks/stocks/useWallet';

export function DepositForm() {
  const { addDeposit } = useWallet();
  const [amount, setAmount] = useState('');
  const [depositDate, setDepositDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    const result = await addDeposit({
      amount: parseFloat(amount),
      depositDate: new Date(depositDate),
      note: note || undefined,
    });

    setSubmitting(false);

    if (result.success) {
      toast.success(result.message);
      setAmount('');
      setNote('');
      setDepositDate(new Date().toISOString().split('T')[0]);
    } else {
      toast.error(result.message);
      if (result.errors) {
        setErrors(result.errors);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow-md border border-gray-200 shadow-sm">
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
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          {errors.amount && (
            <p className="mt-1 text-xs text-red-600 font-bold">{errors.amount[0]}</p>
          )}
        </div>
        <div>
          <label htmlFor="depositDate" className="block text-xs font-bold uppercase tracking-wider text-gray-500">Deposit Date</label>
          <input
            type="date"
            id="depositDate"
            name="depositDate"
            required
            value={depositDate}
            onChange={(e) => setDepositDate(e.target.value)}
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
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div className="mt-6">
        <FormButton label="Add Deposit" disabled={submitting} />
      </div>
    </form>
  );
}
