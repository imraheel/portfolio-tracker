import { motion } from 'framer-motion';
import { useWallet } from '@/hooks/stocks/useWallet';
import { DepositForm } from '@/components/stocks/DepositForm';
import { WithdrawalForm } from '@/components/stocks/WithdrawalForm';
import { DeleteDepositButton } from '@/components/stocks/DeleteDepositButton';
import { DeleteWithdrawalButton } from '@/components/stocks/DeleteWithdrawalButton';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Wallet as WalletIcon, PiggyBank, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { MetricCard } from '@/components/ui/MetricCard';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
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
      <Card className="animate-pulse">
        <div className="h-64 bg-[var(--bg-tertiary)] rounded" />
      </Card>
    );
  }

  return (
    <Card hover={false}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ArrowDownToLine className="w-4 h-4 text-[var(--accent-gold)]" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-gold)]">
              Deposits
            </span>
          </div>
          <h3 className="font-display text-xl text-[var(--text-primary)]">Deposit History</h3>
          <p className="text-sm text-[var(--text-muted)] mt-1">All your wallet deposits</p>
        </div>
        <Badge variant="gold">{deposits.length} transactions</Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border-subtle)]">
              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">
                Date
              </th>
              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">
                Note
              </th>
              <th className="px-4 py-3 text-right text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">
                Amount
              </th>
              <th className="px-4 py-3 text-right text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">
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
                <td className="whitespace-nowrap px-4 py-4 text-sm text-[var(--text-secondary)]">
                  {deposit.deposit_date ? new Intl.DateTimeFormat('en-PK').format(new Date(deposit.deposit_date)) : '-'}
                </td>
                <td className="px-4 py-4 text-sm text-[var(--text-muted)] italic">{deposit.note || '-'}</td>
                <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-mono font-medium text-[var(--accent-sage)]">
                  +Rs. {formatPkr(deposit.amount)}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-right">
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
    </Card>
  );
}

function WithdrawalsTable() {
  const { withdrawals, loading } = useWallet();

  if (loading) {
    return (
      <Card className="animate-pulse">
        <div className="h-64 bg-[var(--bg-tertiary)] rounded" />
      </Card>
    );
  }

  return (
    <Card hover={false}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ArrowUpFromLine className="w-4 h-4 text-[var(--accent-coral)]" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-coral)]">
              Withdrawals
            </span>
          </div>
          <h3 className="font-display text-xl text-[var(--text-primary)]">Withdrawal History</h3>
          <p className="text-sm text-[var(--text-muted)] mt-1">All your wallet withdrawals</p>
        </div>
        <Badge variant="coral">{withdrawals.length} transactions</Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border-subtle)]">
              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">
                Date
              </th>
              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">
                Note
              </th>
              <th className="px-4 py-3 text-right text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">
                Amount
              </th>
              <th className="px-4 py-3 text-right text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">
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
                <td className="whitespace-nowrap px-4 py-4 text-sm text-[var(--text-secondary)]">
                  {withdrawal.withdrawal_date ? new Intl.DateTimeFormat('en-PK').format(new Date(withdrawal.withdrawal_date)) : '-'}
                </td>
                <td className="px-4 py-4 text-sm text-[var(--text-muted)] italic">{withdrawal.note || '-'}</td>
                <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-mono font-medium text-[var(--accent-coral)]">
                  -Rs. {formatPkr(withdrawal.amount)}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-right">
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
    </Card>
  );
}

export default function Wallet() {
  const { balance, totalDeposited, totalWithdrawn, loading } = useWallet();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto space-y-8"
    >
      <PageHeader
        title="Deposits & Wallet"
        description="Manage your investment capital and available funds."
        breadcrumbs={[{ label: 'Stocks' }, { label: 'Wallet' }]}
      />

      <motion.div variants={itemVariants}>
        <StatsGrid columns={3}>
          <MetricCard
            title="Available Balance"
            value={loading ? '...' : `Rs. ${formatPkr(balance)}`}
            icon={<WalletIcon className="w-5 h-5" />}
            variant="gold"
            delay={0}
          />
          <MetricCard
            title="Total Deposited"
            value={loading ? '...' : `Rs. ${formatPkr(totalDeposited)}`}
            icon={<PiggyBank className="w-5 h-5" />}
            variant="sage"
            delay={0.1}
          />
          <MetricCard
            title="Total Withdrawn"
            value={loading ? '...' : `Rs. ${formatPkr(totalWithdrawn)}`}
            icon={<ArrowUpFromLine className="w-5 h-5" />}
            variant="coral"
            delay={0.2}
          />
        </StatsGrid>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card hover={false}>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <ArrowDownToLine className="w-4 h-4 text-[var(--accent-gold)]" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-gold)]">
                  Add Funds
                </span>
              </div>
              <h3 className="font-display text-xl text-[var(--text-primary)]">Make a Deposit</h3>
              <p className="text-sm text-[var(--text-muted)] mt-1">Add money to your investment wallet</p>
            </div>
            <DepositForm />
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card hover={false}>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <ArrowUpFromLine className="w-4 h-4 text-[var(--accent-coral)]" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-coral)]">
                  Withdraw
                </span>
              </div>
              <h3 className="font-display text-xl text-[var(--text-primary)]">Make a Withdrawal</h3>
              <p className="text-sm text-[var(--text-muted)] mt-1">Withdraw money from your investment wallet</p>
            </div>
            <WithdrawalForm />
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <DepositsTable />
      </motion.div>

      <motion.div variants={itemVariants}>
        <WithdrawalsTable />
      </motion.div>
    </motion.div>
  );
}
