import { motion } from 'framer-motion';
import { useWallet } from '@/hooks/stocks/useWallet';
import { DepositForm } from '@/components/stocks/DepositForm';
import { WithdrawalForm } from '@/components/stocks/WithdrawalForm';
import { DeleteDepositButton } from '@/components/stocks/DeleteDepositButton';
import { DeleteWithdrawalButton } from '@/components/stocks/DeleteWithdrawalButton';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Wallet as WalletIcon, PiggyBank, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

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
              Deposits
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

function WithdrawalsTable() {
  const { withdrawals, loading } = useWallet();

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
            <ArrowUpFromLine className="w-4 h-4 text-[var(--accent-coral)]" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-coral)]">
              Withdrawals
            </span>
          </div>
          <span className="text-xs text-[var(--text-muted)]">
            {withdrawals.length} transactions
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
              {withdrawals.map((withdrawal, i) => (
                <motion.tr 
                  key={withdrawal.id}
                  custom={i}
                  variants={tableRowVariants}
                  initial="hidden"
                  animate="visible"
                  className="hover:bg-[var(--bg-elevated)]/30 transition-colors"
                >
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-[var(--text-secondary)]">
                    {withdrawal.withdrawal_date ? new Intl.DateTimeFormat('en-PK').format(new Date(withdrawal.withdrawal_date)) : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-muted)] italic">{withdrawal.note || '-'}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-mono font-medium text-[var(--accent-coral)]">
                    -Rs. {formatPkr(withdrawal.amount)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <DeleteWithdrawalButton id={withdrawal.id} />
                  </td>
                </motion.tr>
              ))}
              {withdrawals.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-[var(--text-muted)]">
                    No withdrawal records found.
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
  const { balance, totalDeposited, totalWithdrawn, loading } = useWallet();

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
        className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3"
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
                  Total In
                </span>
              </div>
              <h3 className="text-xs text-[var(--text-muted)] mb-1">Total Deposited</h3>
              <p className="text-2xl font-mono font-semibold text-[var(--text-primary)]">
                {loading ? '...' : `Rs. ${formatPkr(totalDeposited)}`}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-sage)]/10 flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-[var(--accent-sage)]" />
            </div>
          </div>
        </Card>

        <Card hover variant="default">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpFromLine className="w-4 h-4 text-[var(--accent-coral)]" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-coral)]">
                  Total Out
                </span>
              </div>
              <h3 className="text-xs text-[var(--text-muted)] mb-1">Total Withdrawn</h3>
              <p className="text-2xl font-mono font-semibold text-[var(--text-primary)]">
                {loading ? '...' : `Rs. ${formatPkr(totalWithdrawn)}`}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-coral)]/10 flex items-center justify-center">
              <ArrowUpFromLine className="w-5 h-5 text-[var(--accent-coral)]" />
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div variants={itemVariants}>
          <DepositForm />
        </motion.div>

        <motion.div variants={itemVariants}>
          <WithdrawalForm />
        </motion.div>
      </div>

      <DepositsTable />
      <WithdrawalsTable />
    </motion.div>
  );
}
