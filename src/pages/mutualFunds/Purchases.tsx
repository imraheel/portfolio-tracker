import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, ShoppingCart, Calendar } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { MetricCard } from '@/components/ui/MetricCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useMutualFunds } from '@/hooks/mutualFunds/useMutualFunds';
import { PurchaseForm } from '@/components/mutualFunds/PurchaseForm';

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
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Fund</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Notes</th>
              </tr>
            </thead>
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

export default function Purchases() {
  const { purchases, funds, loading } = useMutualFunds();

  const totalPurchases = purchases.reduce((sum, p) => sum + p.amount, 0);
  const totalCount = purchases.length;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto space-y-6"
    >
      <PageHeader
        title="Mutual Fund Purchases"
        description="Record and view your mutual fund purchases."
        breadcrumbs={[{ label: 'Mutual Funds' }, { label: 'Purchases' }]}
      />

      <motion.div variants={itemVariants}>
        <StatsGrid columns={4}>
          <MetricCard
            title="Total Purchases"
            value={formatPkr(totalPurchases)}
            icon={<ShoppingCart className="w-5 h-5" />}
            color="green"
            loading={loading}
          />
          <MetricCard
            title="Number of Purchases"
            value={totalCount.toString()}
            icon={<Calendar className="w-5 h-5" />}
            color="blue"
            loading={loading}
          />
          <MetricCard
            title="Funds Invested In"
            value={funds.length.toString()}
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
            <h3 className="text-lg font-semibold text-gray-900">Record Purchase</h3>
            <p className="text-sm text-gray-500">Add a new mutual fund purchase</p>
          </div>
          <PurchaseForm funds={funds} />
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <PurchasesTable />
      </motion.div>
    </motion.div>
  );
}
