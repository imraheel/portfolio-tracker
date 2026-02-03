import { useCrypto } from '@/hooks/useCrypto';
import type { CryptoMetrics, Cryptocurrency } from '@/services/crypto';
import { CryptoForm } from '@/components/crypto/CryptoForm';
import { UpdateTotalValueForm } from '@/components/crypto/UpdateTotalValueForm';

interface CryptoTableProps {
  cryptocurrencies: Cryptocurrency[];
  metrics: CryptoMetrics[];
  loading: boolean;
}

function CryptoTable({ cryptocurrencies, metrics, loading }: CryptoTableProps) {
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

  const getMetricsForCrypto = (cryptoId: number) => {
    return metrics.find((m) => m.cryptoId === cryptoId);
  };

  return (
    <section className="mt-8">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-400">Cryptocurrencies List</h2>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Symbol</th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Name</th>
                <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Total Value</th>
                <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Net Investment</th>
                <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Gain/Loss</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {cryptocurrencies.map((crypto) => {
                const cryptoMetrics = getMetricsForCrypto(crypto.id);
                return (
                  <tr key={crypto.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="font-bold text-gray-900">{crypto.symbol}</span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-900">{crypto.name}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <UpdateTotalValueForm
                        cryptoId={crypto.id}
                        currentValue={crypto.current_total_value?.toString() ?? '0'}
                      />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <span className="text-sm text-gray-900">
                        {formatCurrency(cryptoMetrics?.netInvestment || 0)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      {cryptoMetrics && (
                        <div>
                          <span
                            className={`text-sm font-medium ${
                              cryptoMetrics.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {cryptoMetrics.gainLoss >= 0 ? '+' : ''}
                            {formatCurrency(cryptoMetrics.gainLoss)}
                          </span>
                          <span
                            className={`ml-2 text-xs ${
                              cryptoMetrics.gainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            ({cryptoMetrics.gainLossPercent >= 0 ? '+' : ''}
                            {cryptoMetrics.gainLossPercent.toFixed(2)}%)
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {cryptocurrencies.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                    No cryptocurrencies defined. Add your first cryptocurrency above.
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

export default function CryptoList() {
  const { cryptocurrencies, metrics, loading } = useCrypto();

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Cryptocurrencies</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your cryptocurrency investments and track performance.</p>
      </header>

      <div className="mb-10">
        <CryptoForm />
      </div>

      <CryptoTable cryptocurrencies={cryptocurrencies} metrics={metrics} loading={loading} />
    </div>
  );
}
