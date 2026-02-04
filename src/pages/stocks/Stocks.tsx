import { useStocks } from '@/hooks/stocks/useStocks';
import { StockForm } from '@/components/stocks/StockForm';
import { UpdatePriceForm } from '@/components/stocks/UpdatePriceForm';

function StocksTable() {
  const { stocks, priceMap, loading } = useStocks();
  
  if (loading) {
    return (
      <section className="mt-8">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-400">Monitoring List</h2>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Symbol</th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Company / Sector</th>
                <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500 w-64">Current Price (PKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {stocks.map((stock) => (
                <tr key={stock.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="font-bold text-gray-900">{stock.symbol}</span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-900">{stock.company_name || '-'}</div>
                    <div className="text-xs text-gray-500">{stock.sector || '-'}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <UpdatePriceForm 
                      stockId={stock.id} 
                      currentPrice={priceMap.get(stock.id)?.toString() ?? '0'} 
                    />
                  </td>
                </tr>
              ))}
              {stocks.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-sm text-gray-500">
                    No stocks defined in your monitoring list.
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

export default function Stocks() {
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Stock Prices</h1>
        <p className="mt-1 text-sm text-gray-500">Manage symbols and update latest market prices.</p>
      </header>
      
      <div className="mb-10">
        <StockForm />
      </div>
      
      <StocksTable />
    </div>
  );
}
