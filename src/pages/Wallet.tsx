import { useWallet } from '@/hooks/useWallet';
import { DepositForm } from '@/components/wallet/DepositForm';
import { DeleteDepositButton } from '@/components/wallet/DeleteDepositButton';

function formatPkr(amount: number) {
  return amount.toLocaleString('en-PK', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}

function DepositsTable() {
  const { deposits, loading } = useWallet();

  if (loading) {
    return (
      <section className="mt-10">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-10">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-400">Transaction Log</h2>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Note</th>
                <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Amount</th>
                <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {deposits.map((deposit) => (
                <tr key={deposit.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {deposit.deposit_date ? new Intl.DateTimeFormat('en-PK').format(new Date(deposit.deposit_date)) : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 italic">{deposit.note || '-'}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-bold text-gray-900">
                    {formatPkr(deposit.amount)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <DeleteDepositButton id={deposit.id} />
                  </td>
                </tr>
              ))}
              {deposits.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">No deposit records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default function Wallet() {
  const { balance, totalDeposited, loading } = useWallet();

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Deposits & Wallet</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your investment capital and available funds.</p>
      </header>

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Available Balance</h3>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {loading ? '...' : `Rs. ${formatPkr(balance)}`}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Capital</h3>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {loading ? '...' : `Rs. ${formatPkr(totalDeposited)}`}
          </p>
        </div>
      </div>

      <div className="mb-8">
        <DepositForm />
      </div>

      <DepositsTable />
    </div>
  );
}
