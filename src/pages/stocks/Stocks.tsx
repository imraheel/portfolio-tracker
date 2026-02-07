import { motion } from 'framer-motion';
import { useStocks } from '@/hooks/stocks/useStocks';
import { StockForm } from '@/components/stocks/StockForm';
import { UpdatePriceForm } from '@/components/stocks/UpdatePriceForm';
import { PageHeader } from '@/components/ui/PageHeader';
import { BarChart3 } from 'lucide-react';

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const tableRowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, duration: 0.3 }
  })
};

function StocksTable() {
  const { stocks, priceMap, loading } = useStocks();
  
  if (loading) {
    return (
      <section className="mt-8">
        <div className="animate-pulse">
          <div className="h-64 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-subtle)]"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)]"
      >
        {/* Table Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[var(--accent-gold)]" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-gold)]">
              Watchlist
            </span>
          </div>
          <span className="text-xs text-[var(--text-muted)]">
            {stocks.length} stocks
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                <th className="px-6 py-3 text-left text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">
                  Symbol
                </th>
                <th className="px-6 py-3 text-left text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">
                  Company / Sector
                </th>
                <th className="px-6 py-3 text-right text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium w-64">
                  Current Price (PKR)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {stocks.map((stock, i) => (
                <motion.tr 
                  key={stock.id}
                  custom={i}
                  variants={tableRowVariants}
                  initial="hidden"
                  animate="visible"
                  className="hover:bg-[var(--bg-elevated)]/30 transition-colors"
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="font-mono font-semibold text-[var(--text-primary)]">{stock.symbol}</span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-[var(--text-primary)]">{stock.company_name || '-'}</div>
                    <div className="text-xs text-[var(--text-muted)]">{stock.sector || '-'}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <UpdatePriceForm 
                      stockId={stock.id} 
                      currentPrice={priceMap.get(stock.id)?.toString() ?? '0'} 
                    />
                  </td>
                </motion.tr>
              ))}
              {stocks.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-sm text-[var(--text-muted)]">
                    No stocks defined in your monitoring list.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </section>
  );
}

export default function Stocks() {
  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto"
    >
      <PageHeader
        title="Stock Prices"
        description="Manage symbols and update latest market prices."
        breadcrumbs={[{ label: 'Stocks' }, { label: 'Prices' }]}
      />
      
      <motion.div variants={itemVariants} className="mb-10">
        <StockForm />
      </motion.div>
      
      <StocksTable />
    </motion.div>
  );
}
