import { useState } from 'react';
import { toast } from 'sonner';
import { FormButton } from '@/components/FormButton';
import { useStocks } from '@/hooks/useStocks';

export function StockForm() {
  const { addStock } = useStocks();
  const [symbol, setSymbol] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [sector, setSector] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    const result = await addStock({
      symbol,
      companyName: companyName || undefined,
      sector: sector || undefined,
    });

    setSubmitting(false);

    if (result.success) {
      toast.success(result.message);
      setSymbol('');
      setCompanyName('');
      setSector('');
    } else {
      toast.error(result.message);
      if (result.errors) {
        setErrors(result.errors);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-semibold">Add New Stock</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="symbol" className="block text-sm font-medium text-gray-700">Symbol</label>
          <input 
            type="text" 
            id="symbol" 
            name="symbol" 
            required 
            maxLength={10}
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
          />
          {errors.symbol && (
            <p className="mt-1 text-xs text-red-600">{errors.symbol[0]}</p>
          )}
        </div>
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name</label>
          <input 
            type="text" 
            id="companyName" 
            name="companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
          />
        </div>
        <div>
          <label htmlFor="sector" className="block text-sm font-medium text-gray-700">Sector</label>
          <input 
            type="text" 
            id="sector" 
            name="sector"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
          />
        </div>
      </div>
      <div className="mt-4">
        <FormButton label="Add Stock" disabled={submitting} />
      </div>
    </form>
  );
}
