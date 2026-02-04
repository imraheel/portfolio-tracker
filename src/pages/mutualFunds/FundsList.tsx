import { useMutualFunds } from '@/hooks/mutualFunds/useMutualFunds';
import type { FundMetrics, MutualFund } from '@/services/mutualFunds/mutualFunds';
import { FundForm } from '@/components/mutualFunds/FundForm';
import { UpdateMarketValueForm } from '@/components/mutualFunds/UpdateMarketValueForm';

interface FundsTableProps {
  funds: MutualFund[];
  metrics: FundMetrics[];
  loading: boolean;
}

function FundsTable({ funds, metrics, loading }: FundsTableProps) {
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

  const getMetricsForFund = (fundId: number) => {
    return metrics.find((m) => m.fundId === fundId);
  };

  return (
    <section className="mt-8">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-400">Funds List</h2>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Symbol</th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Name / Description</th>
                <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Market Value</th>
                <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Net Investment</th>
                <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Gain/Loss</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {funds.map((fund) => {
                const fundMetrics = getMetricsForFund(fund.id);
                return (
                  <tr key={fund.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="font-bold text-gray-900">{fund.symbol}</span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-900">{fund.name}</div>
                      <div className="text-xs text-gray-500">{fund.description || '-'}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <UpdateMarketValueForm
                        fundId={fund.id}
                        currentValue={fund.current_market_value?.toString() ?? '0'}
                      />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <span className="text-sm text-gray-900">
                        {formatCurrency(fundMetrics?.netInvestment || 0)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      {fundMetrics && (
                        <div>
                          <span
                            className={`text-sm font-medium ${
                              fundMetrics.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {fundMetrics.gainLoss >= 0 ? '+' : ''}
                            {formatCurrency(fundMetrics.gainLoss)}
                          </span>
                          <span
                            className={`ml-2 text-xs ${
                              fundMetrics.gainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            ({fundMetrics.gainLossPercent >= 0 ? '+' : ''}
                            {fundMetrics.gainLossPercent.toFixed(2)}%)
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {funds.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                    No mutual funds defined. Add your first fund above.
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

export default function FundsList() {
  const { funds, metrics, loading } = useMutualFunds();

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Mutual Funds</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your mutual fund investments and track performance.</p>
      </header>

      <div className="mb-10">
        <FundForm />
      </div>

      <FundsTable funds={funds} metrics={metrics} loading={loading} />
    </div>
  );
}
