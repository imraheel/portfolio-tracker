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
        <div className="h-64 bg-gray-200 rounded" />
      </Card>
    );
  }

  return (
    <Card hover={false}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Withdrawal History</h3>
          <p className="text-sm text-gray-500">All your mutual fund withdrawals</p>
        </div>
        <Badge variant="info">{withdrawals.length} withdrawals</Badge>
      </div>
      <div className="overflow-hidden rounded-lg border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Fund</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {withdrawals.map((withdrawal) => (
                <motion.tr
                  key={withdrawal.id}
                  className="hover:bg-gray-50 transition-colors"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                    {formatDate(withdrawal.withdrawal_date)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="font-medium text-gray-900">{withdrawal.fund?.symbol}</span>
                    <span className="ml-2 text-sm text-gray-500">{withdrawal.fund?.name}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-900">
                    {formatCurrency(withdrawal.amount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{withdrawal.notes || '-'}</td>
                </motion.tr>
              ))}
              {withdrawals.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">
                    No withdrawals recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}

export default function Withdrawals() {
  const { withdrawals, funds, loading } = useMutualFunds();

  const totalWithdrawals = withdrawals.reduce((sum, w) => sum + w.amount, 0);
  const totalCount = withdrawals.length;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto space-y-6"
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
            color="green"
            loading={loading}
          />
          <MetricCard
            title="Number of Withdrawals"
            value={totalCount.toString()}
            icon={<Calendar className="w-5 h-5" />}
            color="blue"
            loading={loading}
          />
          <MetricCard
            title="Funds Withdrawn From"
            value={new Set(withdrawals.map((w) => w.fund_id)).size.toString()}
            icon={<TrendingUp className="w-5 h-5" />}
            color="purple"
            loading={loading}
          />
          <MetricCard
            title="Available Funds"
            value={funds.length.toString()}
            icon={<DollarSign className="w-5 h-5" />}
            color="orange"
            loading={loading}
          />
        </StatsGrid>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card hover={false}>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Record Withdrawal</h3>
            <p className="text-sm text-gray-500">Add a new mutual fund withdrawal</p>
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
