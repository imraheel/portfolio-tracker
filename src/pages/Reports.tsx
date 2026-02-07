import { useSearchParams } from 'react-router-dom';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { FileText, ArrowDownToLine, ArrowUpCircle, DollarSign, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { useWallet } from '@/hooks/stocks/useWallet';
import { useTransactions } from '@/hooks/stocks/useTransactions';

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

function formatPkr(amount: number) {
  return amount.toLocaleString('en-PK', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}

function TableHeader({ cols }: { cols: { label: string; align?: 'left' | 'right' }[] }) {
  return (
    <thead>
      <tr className="border-b border-[var(--border-subtle)]">
        {cols.map((col, i) => (
          <th
            key={i}
            className={clsx(
              "px-4 py-3 text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium",
              col.align === 'right' ? "text-right" : "text-left"
            )}
          >
            {col.label}
          </th>
        ))}
      </tr>
    </thead>
  );
}

function DepositsHistory() {
  const { deposits, loading } = useWallet();

  if (loading) {
    return (
      <div className="animate-pulse h-48 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-subtle)]"></div>
    );
  }

  return (
    <table className="min-w-full">
      <TableHeader cols={[
        { label: 'Date' },
        { label: 'Note' },
        { label: 'Amount', align: 'right' },
      ]} />
      <tbody className="divide-y divide-[var(--border-subtle)]">
        {deposits.map((row, i) => (
          <motion.tr 
            key={row.id}
            custom={i}
            variants={tableRowVariants}
            initial="hidden"
            animate="visible"
            className="hover:bg-[var(--bg-elevated)]/30 transition-colors"
          >
            <td className="whitespace-nowrap px-4 py-4 text-sm text-[var(--text-secondary)]">
              {row.deposit_date ? new Date(row.deposit_date).toLocaleDateString('en-PK') : '-'}
            </td>
            <td className="px-4 py-4 text-sm text-[var(--text-muted)] italic">{row.note || '-'}</td>
            <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-mono font-medium text-[var(--accent-sage)]">
              +Rs. {formatPkr(row.amount)}
            </td>
          </motion.tr>
        ))}
      </tbody>
    </table>
  );
}

function BuyHistory() {
  const { buyTransactions, loading } = useTransactions();

  if (loading) {
    return (
      <div className="animate-pulse h-48 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-subtle)]"></div>
    );
  }

  return (
    <table className="min-w-full">
      <TableHeader cols={[
        { label: 'Date' },
        { label: 'Stock' },
        { label: 'Qty', align: 'right' },
        { label: 'Rate', align: 'right' },
        { label: 'Total', align: 'right' },
      ]} />
      <tbody className="divide-y divide-[var(--border-subtle)]">
        {buyTransactions.map((row, i) => (
          <motion.tr 
            key={row.id}
            custom={i}
            variants={tableRowVariants}
            initial="hidden"
            animate="visible"
            className="hover:bg-[var(--bg-elevated)]/30 transition-colors"
          >
            <td className="whitespace-nowrap px-4 py-4 text-sm text-[var(--text-secondary)]">
              {row.buy_date ? new Date(row.buy_date).toLocaleDateString('en-PK') : '-'}
            </td>
            <td className="whitespace-nowrap px-4 py-4 text-sm font-mono font-medium text-[var(--text-primary)]">{row.stock.symbol}</td>
            <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-[var(--text-secondary)]">{row.quantity}</td>
            <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-[var(--text-secondary)]">Rs. {formatPkr(row.buy_rate)}</td>
            <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-mono font-medium text-[var(--accent-coral)]">Rs. {formatPkr(row.total_cost)}</td>
          </motion.tr>
        ))}
      </tbody>
    </table>
  );
}

function SellHistory() {
  const { sellTransactions, loading } = useTransactions();

  if (loading) {
    return (
      <div className="animate-pulse h-48 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-subtle)]"></div>
    );
  }

  return (
    <table className="min-w-full">
      <TableHeader cols={[
        { label: 'Date' },
        { label: 'Stock' },
        { label: 'Qty', align: 'right' },
        { label: 'Rate', align: 'right' },
        { label: 'Proceeds', align: 'right' },
        { label: 'P/L', align: 'right' },
      ]} />
      <tbody className="divide-y divide-[var(--border-subtle)]">
        {sellTransactions.map((row, i) => (
          <motion.tr 
            key={row.id}
            custom={i}
            variants={tableRowVariants}
            initial="hidden"
            animate="visible"
            className="hover:bg-[var(--bg-elevated)]/30 transition-colors"
          >
            <td className="whitespace-nowrap px-4 py-4 text-sm text-[var(--text-secondary)]">
              {row.sell_date ? new Date(row.sell_date).toLocaleDateString('en-PK') : '-'}
            </td>
            <td className="whitespace-nowrap px-4 py-4 text-sm font-mono font-medium text-[var(--text-primary)]">{row.stock.symbol}</td>
            <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-[var(--text-secondary)]">{row.quantity}</td>
            <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-[var(--text-secondary)]">Rs. {formatPkr(row.sell_rate)}</td>
            <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-mono font-medium text-[var(--accent-sage)]">Rs. {formatPkr(row.total_proceeds)}</td>
            <td className={clsx(
              "whitespace-nowrap px-4 py-4 text-right text-sm font-mono font-medium",
              Number(row.realized_gain_loss) >= 0 ? "text-[var(--accent-sage)]" : "text-[var(--accent-coral)]"
            )}>
              {Number(row.realized_gain_loss) >= 0 ? '+' : ''}Rs. {formatPkr(row.realized_gain_loss)}
            </td>
          </motion.tr>
        ))}
      </tbody>
    </table>
  );
}

function DividendHistory() {
  const { dividends, loading } = useTransactions();

  if (loading) {
    return (
      <div className="animate-pulse h-48 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-subtle)]"></div>
    );
  }

  return (
    <table className="min-w-full">
      <TableHeader cols={[
        { label: 'Date' },
        { label: 'Stock' },
        { label: 'Amount', align: 'right' },
      ]} />
      <tbody className="divide-y divide-[var(--border-subtle)]">
        {dividends.map((row, i) => (
          <motion.tr 
            key={row.id}
            custom={i}
            variants={tableRowVariants}
            initial="hidden"
            animate="visible"
            className="hover:bg-[var(--bg-elevated)]/30 transition-colors"
          >
            <td className="whitespace-nowrap px-4 py-4 text-sm text-[var(--text-secondary)]">
              {row.dividend_date ? new Date(row.dividend_date).toLocaleDateString('en-PK') : '-'}
            </td>
            <td className="whitespace-nowrap px-4 py-4 text-sm font-mono font-medium text-[var(--text-primary)]">{row.stock.symbol}</td>
            <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-mono font-medium text-[var(--accent-gold)]">
              +Rs. {formatPkr(row.dividend_amount)}
            </td>
          </motion.tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Reports() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'deposits';

  const tabs = [
    { id: 'deposits', label: 'Deposits', icon: ArrowDownToLine },
    { id: 'buys', label: 'Buys', icon: TrendingUp },
    { id: 'sells', label: 'Sells', icon: ArrowUpCircle },
    { id: 'dividends', label: 'Dividends', icon: DollarSign },
  ];

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto"
    >
      <PageHeader
        title="Reports & History"
        description="Detailed record of all financial activities."
        breadcrumbs={[{ label: 'Reports' }]}
      />

      <motion.div variants={itemVariants} className="mb-6 border-b border-[var(--border-subtle)]">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={clsx(
                  "flex items-center gap-2 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium tracking-wide transition-colors",
                  currentTab === tab.id
                    ? "border-[var(--accent-gold)] text-[var(--accent-gold)]"
                    : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </motion.button>
            );
          })}
        </nav>
      </motion.div>

      <motion.div
        key={currentTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)]"
      >
        {/* Table Header */}
        <div className="flex items-center gap-2 px-6 py-4 border-b border-[var(--border-subtle)]">
          <FileText className="w-4 h-4 text-[var(--accent-gold)]" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-gold)]">
            {tabs.find(t => t.id === currentTab)?.label} History
          </span>
        </div>

        <div className="overflow-x-auto p-4">
          {currentTab === 'deposits' && <DepositsHistory />}
          {currentTab === 'buys' && <BuyHistory />}
          {currentTab === 'sells' && <SellHistory />}
          {currentTab === 'dividends' && <DividendHistory />}
        </div>
      </motion.div>
    </motion.div>
  );
}
