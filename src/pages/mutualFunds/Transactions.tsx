import { useSearchParams } from 'react-router-dom';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { ShoppingCart, ArrowDownCircle, TrendingUp, DollarSign } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { MetricCard } from '@/components/ui/MetricCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useMutualFunds } from '@/hooks/mutualFunds/useMutualFunds';
import { PurchaseForm } from '@/components/mutualFunds/PurchaseForm';
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

function TableHeader({ cols }: { cols: { label: string; align?: 'left' | 'right' }[] }) {
  return (
    <thead className="bg-gray-50">
      <tr>
        {cols.map((col, i) => (
          <th
            key={i}
            className={clsx(
              "px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500",
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

function PurchasesTable() {
  const { purchases, loading } = useMutualFunds();

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
          <h3 className="text-lg font-semibold text-gray-900">Purchase History</h3>
          <p className="text-sm text-gray-500">All your mutual fund purchases</p>
        </div>
        <Badge variant="info">{purchases.length} purchases</Badge>
      </div>
      <div className="overflow-hidden rounded-lg border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <TableHeader cols={[
              { label: 'Date' },
              { label: 'Fund' },
              { label: 'Amount', align: 'right' },
              { label: 'Notes' },
            ]} />
            <tbody className="divide-y divide-gray-100 bg-white">
              {purchases.map((purchase) => (
                <motion.tr
                  key={purchase.id}
                  className="hover:bg-gray-50 transition-colors"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                    {formatDate(purchase.purchase_date)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="font-medium text-gray-900">{purchase.fund?.symbol}</span>
                    <span className="ml-2 text-sm text-gray-500">{purchase.fund?.name}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-900">
                    {formatCurrency(purchase.amount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{purchase.notes || '-'}</td>
                </motion.tr>
              ))}
              {purchases.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">
                    No purchases recorded yet.
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
            <TableHeader cols={[
              { label: 'Date' },
              { label: 'Fund' },
              { label: 'Amount', align: 'right' },
              { label: 'Notes' },
            ]} />
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

export default function Transactions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentView = searchParams.get('view') === 'withdrawals' ? 'withdrawals' : 'invest';

  const { purchases, withdrawals, funds, loading } = useMutualFunds();

  const totalInvested = purchases.reduce((sum, p) => sum + p.amount, 0);
  const totalWithdrawn = withdrawals.reduce((sum, w) => sum + w.amount, 0);

  const handleTabChange = (view: string) => {
    setSearchParams({ view });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto space-y-6"
    >
      <PageHeader
        title="Mutual Fund Transactions"
        description="Invest and withdraw from your mutual funds."
        breadcrumbs={[{ label: 'Mutual Funds' }, { label: 'Transactions' }]}
      />

      <motion.div variants={itemVariants}>
        <StatsGrid columns={4}>
          <MetricCard
            title="Total Invested"
            value={formatPkr(totalInvested)}
            icon={<ShoppingCart className="w-5 h-5" />}
            color="green"
            loading={loading}
          />
          <MetricCard
            title="Total Withdrawn"
            value={formatPkr(totalWithdrawn)}
            icon={<ArrowDownCircle className="w-5 h-5" />}
            color="red"
            loading={loading}
          />
          <MetricCard
            title="Active Funds"
            value={funds.length.toString()}
            icon={<TrendingUp className="w-5 h-5" />}
            color="blue"
            loading={loading}
          />
          <MetricCard
            title="Available Funds"
            value={funds.length.toString()}
            icon={<DollarSign className="w-5 h-5" />}
            color="purple"
            loading={loading}
          />
        </StatsGrid>
      </motion.div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange('invest')}
            className={clsx(
              "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-bold tracking-wide transition-colors",
              currentView === 'invest' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            )}
          >
            Invest
          </button>
          <button
            onClick={() => handleTabChange('withdrawals')}
            className={clsx(
              "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-bold tracking-wide transition-colors",
              currentView === 'withdrawals' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            )}
          >
            Withdrawals
          </button>
        </nav>
      </div>

      <div className="space-y-6">
        {currentView === 'invest' && (
          <motion.div variants={itemVariants}>
            <Card hover={false}>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Invest in Fund</h3>
                <p className="text-sm text-gray-500">Add a new mutual fund purchase</p>
              </div>
              <PurchaseForm funds={funds} />
            </Card>
          </motion.div>
        )}
        {currentView === 'withdrawals' && (
          <motion.div variants={itemVariants}>
            <Card hover={false}>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Withdraw from Fund</h3>
                <p className="text-sm text-gray-500">Add a new mutual fund withdrawal</p>
              </div>
              <WithdrawalForm funds={funds} />
            </Card>
          </motion.div>
        )}

        {currentView === 'invest' && (
          <motion.div variants={itemVariants}>
            <PurchasesTable />
          </motion.div>
        )}
        {currentView === 'withdrawals' && (
          <motion.div variants={itemVariants}>
            <WithdrawalsTable />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
