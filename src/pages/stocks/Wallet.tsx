import { motion } from 'framer-motion';
import { useWallet } from '@/hooks/stocks/useWallet';
import { DepositForm } from '@/components/stocks/DepositForm';
import { DeleteDepositButton } from '@/components/stocks/DeleteDepositButton';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Wallet as WalletIcon, PiggyBank, ArrowDownToLine } from 'lucide-react';

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

function DepositsTable() {
  const { deposits, loading } = useWallet();

  if (loading) {
    return (
      <section className="mt-10">
        <div className="animate-pulse">
          <div className="h-64 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-subtle)]"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-10">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)]"
      >
        {/* Table Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <ArrowDownToLine className="w-4 h-4 text-[var(--accent-gold)]" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-gold)]">
              History
            </span>
          </div>
          <span className="text-xs text-[var(--text-muted)]">
            {deposits.length} transactions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                <th className="px-6 py-3 text-left text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">
                  Note
                </th>
                <th className="px-6 py-3 text-right text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {deposits.map((deposit, i) => (
                <motion.tr 
                  key={deposit.id}
                  custom={i}
                  variants={tableRowVariants}
                  initial="hidden"
                  animate="visible"
                  className="hover:bg-[var(--bg-elevated)]/30 transition-colors"
                >
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-[var(--text-secondary)]">
                    {deposit.deposit_date ? new Intl.DateTimeFormat('en-PK').format(new Date(deposit.deposit_date)) : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-muted)] italic">{deposit.note || '-'}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-mono font-medium text-[var(--accent-sage)]">
                    +Rs. {formatPkr(deposit.amount)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <DeleteDepositButton id={deposit.id} />
                  </td>
                </motion.tr>
              ))}
              {deposits.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-[var(--text-muted)]">
                    No deposit records found.
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

export default function Wallet() {
  const { balance, totalDeposited, loading } = useWallet();

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto"
    >
      <PageHeader
        title="Deposits & Wallet"
        description="Manage your investment capital and available funds."
        breadcrumbs={[{ label: 'Stocks' }, { label: 'Wallet' }]}
      />

      {/* Balance Cards */}
      <motion.div 
        variants={itemVariants}
        className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <Card hover variant="default">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <WalletIcon className="w-4 h-4 text-[var(--accent-gold)]" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-gold)]">
                  Available
                </span>
              </div>
              <h3 className="text-xs text-[var(--text-muted)] mb-1">Available Balance</h3>
              <p className="text-2xl font-mono font-semibold text-[var(--text-primary)]">
                {loading ? '...' : `Rs. ${formatPkr(balance)}`}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-gold)]/10 flex items-center justify-center">
              <WalletIcon className="w-5 h-5 text-[var(--accent-gold)]" />
            </div>
          </div>
        </Card>

        <Card hover variant="default">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <PiggyBank className="w-4 h-4 text-[var(--accent-sage)]" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-sage)]">
                  Total
                </span>
              </div>
              <h3 className="text-xs text-[var(--text-muted)] mb-1">Total Capital</h3>
              <p className="text-2xl font-mono font-semibold text-[var(--text-primary)]">
                {loading ? '...' : `Rs. ${formatPkr(totalDeposited)}`}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-sage)]/10 flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-[var(--accent-sage)]" />
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="mb-8">
        <DepositForm />
      </motion.div>

      <DepositsTable />
    </motion.div>
  );
}
