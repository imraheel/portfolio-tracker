import { motion } from 'framer-motion';
import { TrendingUp, ArrowDownCircle, Calendar, Coins } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { MetricCard } from '@/components/ui/MetricCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useCrypto } from '@/hooks/crypto/useCrypto';
import { WithdrawalForm } from '@/components/crypto/WithdrawalForm';

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
  const { withdrawals, loading } = useCrypto();

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
          <p className="text-sm text-gray-500">All your cryptocurrency withdrawals</p>
        </div>
        <Badge variant="warning">{withdrawals.length} withdrawals</Badge>
      </div>
      <div className="overflow-hidden rounded-lg border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Cryptocurrency</th>
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
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-amber-500" />
                      <span className="font-medium text-gray-900">{withdrawal.cryptocurrency?.symbol}</span>
                      <span className="text-sm text-gray-500">{withdrawal.cryptocurrency?.name}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-900">
                    {formatCurrency(withdrawal.amount_pkr)}
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
  const { withdrawals, cryptocurrencies, loading } = useCrypto();

  const totalWithdrawals = withdrawals.reduce((sum, w) => sum + w.amount_pkr, 0);
  const totalCount = withdrawals.length;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto space-y-6"
    >
      <PageHeader
        title="Crypto Withdrawals"
        description="Record and view your cryptocurrency withdrawals."
        breadcrumbs={[{ label: 'Crypto' }, { label: 'Withdrawals' }]}
      />

      <motion.div variants={itemVariants}>
        <StatsGrid columns={4}>
          <MetricCard
            title="Total Withdrawals"
            value={formatPkr(totalWithdrawals)}
            icon={<ArrowDownCircle className="w-5 h-5" />}
            color="orange"
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
            title="Assets Withdrawn"
            value={new Set(withdrawals.map((w) => w.crypto_id)).size.toString()}
            icon={<TrendingUp className="w-5 h-5" />}
            color="green"
            loading={loading}
          />
          <MetricCard
            title="Available Assets"
            value={cryptocurrencies.length.toString()}
            icon={<Coins className="w-5 h-5" />}
            color="purple"
            loading={loading}
          />
        </StatsGrid>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card hover={false}>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Record Withdrawal</h3>
            <p className="text-sm text-gray-500">Add a new cryptocurrency withdrawal</p>
          </div>
          <WithdrawalForm cryptocurrencies={cryptocurrencies} />
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <WithdrawalsTable />
      </motion.div>
    </motion.div>
  );
}
