import { useState } from 'react';
import { toast } from 'sonner';
import { FormButton } from '@/components/FormButton';
import { useMutualFunds } from '@/hooks/mutualFunds/useMutualFunds';
import type { MutualFund } from '@/services/mutualFunds/mutualFunds';

interface WithdrawalFormProps {
  funds: MutualFund[];
}

export function WithdrawalForm({ funds }: WithdrawalFormProps) {
  const { addWithdrawal } = useMutualFunds();
  const [fundId, setFundId] = useState('');
  const [amount, setAmount] = useState('');
  const [withdrawalDate, setWithdrawalDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    const result = await addWithdrawal({
      fundId: parseInt(fundId),
      amount: parseFloat(amount),
      withdrawalDate: new Date(withdrawalDate),
      notes: notes || undefined,
    });

    setSubmitting(false);

    if (result.success) {
      toast.success(result.message);
      setFundId('');
      setAmount('');
      setWithdrawalDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    } else {
      toast.error(result.message);
      if (result.errors) {
        setErrors(result.errors);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-semibold">Record Withdrawal</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="fundId" className="block text-sm font-medium text-gray-700">
            Fund
          </label>
          <select
            id="fundId"
            name="fundId"
            required
            value={fundId}
            onChange={(e) => setFundId(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select a fund</option>
            {funds.map((fund) => (
              <option key={fund.id} value={fund.id}>
                {fund.symbol} - {fund.name}
              </option>
            ))}
          </select>
          {errors.fundId && <p className="mt-1 text-xs text-red-600">{errors.fundId[0]}</p>}
        </div>
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount (PKR)
          </label>
          <div className="mt-1 flex items-center space-x-2">
            <span className="text-sm text-gray-500">Rs.</span>
            <input
              type="number"
              id="amount"
              name="amount"
              required
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount[0]}</p>}
        </div>
        <div>
          <label htmlFor="withdrawalDate" className="block text-sm font-medium text-gray-700">
            Withdrawal Date
          </label>
          <input
            type="date"
            id="withdrawalDate"
            name="withdrawalDate"
            required
            value={withdrawalDate}
            onChange={(e) => setWithdrawalDate(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <input
            type="text"
            id="notes"
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>
      <div className="mt-4">
        <FormButton label="Record Withdrawal" disabled={submitting} />
      </div>
    </form>
  );
}
