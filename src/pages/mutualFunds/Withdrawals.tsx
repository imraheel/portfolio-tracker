import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, ArrowDownCircle, Calendar } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { MetricCard } from '@/components/ui/MetricCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useMutualFunds } from '@/hooks/mutualFunds/useMutualFunds';
import { WithdrawalForm } from '@/components/mutualFunds/WithdrawalForm';

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

function formatPkr(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function WithdrawalsTable() {
  const { withdrawals, loading } = useMutualFunds();

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

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
            <ArrowDownCircle className="w-4 h-4 text-[var(--accent-gold)]" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-gold)]">
              History
            </span>
          </div>
          <h3 className="font-display text-xl text-[var(--text-primary)]">Withdrawal History</h3>
          <p className="text-sm text-[var(--text-muted)] mt-1">All your mutual fund withdrawals</p>
        </div>
        <Badge variant="coral">{withdrawals.length} withdrawals</Badge>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border-subtle)]">
              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">Date</th>
              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">Fund</th>
              <th className="px-4 py-3 text-right text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">Amount</th>
              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {withdrawals.map((withdrawal) => (
              <motion.tr
                key={withdrawal.id}
                className="hover:bg-[var(--bg-elevated)]/30 transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <td className="whitespace-nowrap px-4 py-3 text-sm text-[var(--text-secondary)]">
                  {formatDate(withdrawal.withdrawal_date)}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span className="font-mono font-medium text-[var(--text-primary)]">{withdrawal.fund?.symbol}</span>
                  <span className="ml-2 text-sm text-[var(--text-muted)]">{withdrawal.fund?.name}</span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-mono font-medium text-[var(--accent-sage)]">
                  {formatCurrency(withdrawal.amount)}
                </td>
                <td className="px-4 py-3 text-sm text-[var(--text-muted)]">{withdrawal.notes || '-'}</td>
              </motion.tr>
            ))}
            {withdrawals.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-[var(--text-muted)]">
                  No withdrawals recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default function Withdrawals() {
  const { withdrawals, funds } = useMutualFunds();

  const totalWithdrawals = withdrawals.reduce((sum, w) => sum + w.amount, 0);
  const totalCount = withdrawals.length;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto space-y-8"
    >
      <PageHeader
        title="Mutual Fund Withdrawals"
        description="Record and view your mutual fund withdrawals."
        breadcrumbs={[{ label: 'Mutual Funds' }, { label: 'Withdrawals' }]}
      />

      <motion.div variants={itemVariants}>
        <StatsGrid columns={4}>
          <MetricCard
            title="Total Withdrawals"
            value={formatPkr(totalWithdrawals)}
            icon={<ArrowDownCircle className="w-5 h-5" />}
            variant="sage"
            delay={0}
          />
          <MetricCard
            title="Number of Withdrawals"
            value={totalCount.toString()}
            icon={<Calendar className="w-5 h-5" />}
            variant="default"
            delay={0.1}
          />
          <MetricCard
            title="Funds Withdrawn From"
            value={new Set(withdrawals.map((w) => w.fund_id)).size.toString()}
            icon={<TrendingUp className="w-5 h-5" />}
            variant="sage"
            delay={0.2}
          />
          <MetricCard
            title="Available Funds"
            value={funds.length.toString()}
            icon={<DollarSign className="w-5 h-5" />}
            variant="gold"
            delay={0.3}
          />
        </StatsGrid>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card hover={false}>
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <ArrowDownCircle className="w-4 h-4 text-[var(--accent-coral)]" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-coral)]">
                New Withdrawal
              </span>
            </div>
            <h3 className="font-display text-xl text-[var(--text-primary)]">Record Withdrawal</h3>
            <p className="text-sm text-[var(--text-muted)] mt-1">Add a new mutual fund withdrawal</p>
          </div>
          <WithdrawalForm funds={funds} />
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <WithdrawalsTable />
      </motion.div>
    </motion.div>
  );
}
