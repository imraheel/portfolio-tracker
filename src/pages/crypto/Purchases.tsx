import { motion } from 'framer-motion';
import { TrendingUp, ShoppingCart, Calendar, Coins, Bitcoin } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { MetricCard } from '@/components/ui/MetricCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useCrypto } from '@/hooks/crypto/useCrypto';
import { PurchaseForm } from '@/components/crypto/PurchaseForm';

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
  const { purchases, loading } = useCrypto();

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
            <ShoppingCart className="w-4 h-4 text-[var(--accent-gold)]" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-gold)]">
              History
            </span>
          </div>
          <h3 className="font-display text-xl text-[var(--text-primary)]">Purchase History</h3>
          <p className="text-sm text-[var(--text-muted)] mt-1">All your cryptocurrency purchases</p>
        </div>
        <Badge variant="gold">{purchases.length} purchases</Badge>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border-subtle)]">
              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">Date</th>
              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">Cryptocurrency</th>
              <th className="px-4 py-3 text-right text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">Amount</th>
              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {purchases.map((purchase) => (
              <motion.tr
                key={purchase.id}
                className="hover:bg-[var(--bg-elevated)]/30 transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <td className="whitespace-nowrap px-4 py-3 text-sm text-[var(--text-secondary)]">
                  {formatDate(purchase.purchase_date)}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Bitcoin className="w-4 h-4 text-[var(--accent-gold)]" />
                    <span className="font-mono font-medium text-[var(--text-primary)]">{purchase.cryptocurrency?.symbol}</span>
                    <span className="text-sm text-[var(--text-muted)]">{purchase.cryptocurrency?.name}</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-mono font-medium text-[var(--accent-coral)]">
                  {formatCurrency(purchase.amount_pkr)}
                </td>
                <td className="px-4 py-3 text-sm text-[var(--text-muted)]">{purchase.notes || '-'}</td>
              </motion.tr>
            ))}
            {purchases.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-[var(--text-muted)]">
                  No purchases recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default function Purchases() {
  const { purchases, cryptocurrencies } = useCrypto();

  const totalPurchases = purchases.reduce((sum, p) => sum + p.amount_pkr, 0);
  const totalCount = purchases.length;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto space-y-8"
    >
      <PageHeader
        title="Crypto Purchases"
        description="Record and view your cryptocurrency purchases."
        breadcrumbs={[{ label: 'Crypto' }, { label: 'Purchases' }]}
      />

      <motion.div variants={itemVariants}>
        <StatsGrid columns={4}>
          <MetricCard
            title="Total Purchases"
            value={formatPkr(totalPurchases)}
            icon={<ShoppingCart className="w-5 h-5" />}
            variant="default"
            delay={0}
          />
          <MetricCard
            title="Number of Purchases"
            value={totalCount.toString()}
            icon={<Calendar className="w-5 h-5" />}
            variant="default"
            delay={0.1}
          />
          <MetricCard
            title="Assets Purchased"
            value={new Set(purchases.map((p) => p.crypto_id)).size.toString()}
            icon={<TrendingUp className="w-5 h-5" />}
            variant="sage"
            delay={0.2}
          />
          <MetricCard
            title="Available Assets"
            value={cryptocurrencies.length.toString()}
            icon={<Coins className="w-5 h-5" />}
            variant="gold"
            delay={0.3}
          />
        </StatsGrid>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card hover={false}>
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingCart className="w-4 h-4 text-[var(--accent-gold)]" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-gold)]">
                New Purchase
              </span>
            </div>
            <h3 className="font-display text-xl text-[var(--text-primary)]">Record Purchase</h3>
            <p className="text-sm text-[var(--text-muted)] mt-1">Add a new cryptocurrency purchase</p>
          </div>
          <PurchaseForm cryptocurrencies={cryptocurrencies} />
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <PurchasesTable />
      </motion.div>
    </motion.div>
  );
}
