import { useCrypto } from '@/hooks/useCrypto';
import { WithdrawalForm } from '@/components/crypto/WithdrawalForm';

function WithdrawalsTable() {
  const { withdrawals, loading } = useCrypto();

  if (loading) {
    return (
      <section className="mt-8">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </section>
    );
  }

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  return (
    <section className="mt-8">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-400">Withdrawal History</h2>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Cryptocurrency</th>
                <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {withdrawals.map((withdrawal) => (
                <tr key={withdrawal.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {formatDate(withdrawal.withdrawal_date)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="font-medium text-gray-900">{withdrawal.cryptocurrency?.symbol}</span>
                    <span className="ml-2 text-sm text-gray-500">{withdrawal.cryptocurrency?.name}</span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-gray-900">
                    {formatCurrency(withdrawal.amount_pkr)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{withdrawal.notes || '-'}</td>
                </tr>
              ))}
              {withdrawals.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">
                    No withdrawals recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default function Withdrawals() {
  const { cryptocurrencies } = useCrypto();

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Crypto Withdrawals</h1>
        <p className="mt-1 text-sm text-gray-500">Record and view your cryptocurrency withdrawals.</p>
      </header>

      <div className="mb-10">
        <WithdrawalForm cryptocurrencies={cryptocurrencies} />
      </div>

      <WithdrawalsTable />
    </div>
  );
}
