import { useSearchParams } from 'react-router-dom';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { ShoppingCart, ArrowDownCircle, TrendingUp, Coins, Bitcoin, ArrowRightLeft } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { MetricCard } from '@/components/ui/MetricCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useCrypto } from '@/hooks/crypto/useCrypto';
import { PurchaseForm } from '@/components/crypto/PurchaseForm';
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

function PurchasesTable() {
  const { purchases, loading } = useCrypto();

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
              Buy History
            </span>
          </div>
          <h3 className="font-display text-xl text-[var(--text-primary)]">Purchase History</h3>
          <p className="text-sm text-[var(--text-muted)] mt-1">All your cryptocurrency purchases</p>
        </div>
        <Badge variant="gold">{purchases.length} purchases</Badge>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <TableHeader cols={[
            { label: 'Date' },
            { label: 'Cryptocurrency' },
            { label: 'Amount', align: 'right' },
            { label: 'Notes' },
          ]} />
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
                  {formatPkr(purchase.amount_pkr)}
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

function WithdrawalsTable() {
  const { withdrawals, loading } = useCrypto();

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
              Sell History
            </span>
          </div>
          <h3 className="font-display text-xl text-[var(--text-primary)]">Withdrawal History</h3>
          <p className="text-sm text-[var(--text-muted)] mt-1">All your cryptocurrency withdrawals</p>
        </div>
        <Badge variant="coral">{withdrawals.length} withdrawals</Badge>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <TableHeader cols={[
            { label: 'Date' },
            { label: 'Cryptocurrency' },
            { label: 'Amount', align: 'right' },
            { label: 'Notes' },
          ]} />
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
                  <div className="flex items-center gap-2">
                    <Bitcoin className="w-4 h-4 text-[var(--accent-gold)]" />
                    <span className="font-mono font-medium text-[var(--text-primary)]">{withdrawal.cryptocurrency?.symbol}</span>
                    <span className="text-sm text-[var(--text-muted)]">{withdrawal.cryptocurrency?.name}</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-mono font-medium text-[var(--accent-sage)]">
                  {formatPkr(withdrawal.amount_pkr)}
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

export default function Transactions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentView = searchParams.get('view') === 'withdrawals' ? 'withdrawals' : 'invest';

  const { purchases, withdrawals, cryptocurrencies } = useCrypto();

  const totalInvested = purchases.reduce((sum, p) => sum + p.amount_pkr, 0);
  const totalWithdrawn = withdrawals.reduce((sum, w) => sum + w.amount_pkr, 0);

  const handleTabChange = (view: string) => {
    setSearchParams({ view });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto space-y-8"
    >
      <PageHeader
        title="Crypto Transactions"
        description="Invest and withdraw from your cryptocurrency holdings."
        breadcrumbs={[{ label: 'Crypto' }, { label: 'Transactions' }]}
      />

      <motion.div variants={itemVariants}>
        <StatsGrid columns={4}>
          <MetricCard
            title="Total Invested"
            value={formatPkr(totalInvested)}
            icon={<ShoppingCart className="w-5 h-5" />}
            variant="default"
            delay={0}
          />
          <MetricCard
            title="Total Withdrawn"
            value={formatPkr(totalWithdrawn)}
            icon={<ArrowDownCircle className="w-5 h-5" />}
            variant="sage"
            delay={0.1}
          />
          <MetricCard
            title="Active Assets"
            value={cryptocurrencies.length.toString()}
            icon={<TrendingUp className="w-5 h-5" />}
            variant="default"
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

      <div className="border-b border-[var(--border-subtle)]">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange('invest')}
            className={clsx(
              "flex items-center gap-2 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium tracking-wide transition-colors",
              currentView === 'invest' 
                ? 'border-[var(--accent-gold)] text-[var(--accent-gold)]' 
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            )}
          >
            <ArrowRightLeft className="w-4 h-4" />
            Invest
          </button>
          <button
            onClick={() => handleTabChange('withdrawals')}
            className={clsx(
              "flex items-center gap-2 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium tracking-wide transition-colors",
              currentView === 'withdrawals' 
                ? 'border-[var(--accent-coral)] text-[var(--accent-coral)]' 
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            )}
          >
            <ArrowDownCircle className="w-4 h-4" />
            Withdrawals
          </button>
        </nav>
      </div>

      <div className="space-y-6">
        {currentView === 'invest' && (
          <motion.div variants={itemVariants}>
            <Card hover={false}>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <ShoppingCart className="w-4 h-4 text-[var(--accent-gold)]" />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-gold)]">
                    Buy
                  </span>
                </div>
                <h3 className="font-display text-xl text-[var(--text-primary)]">Buy Crypto</h3>
                <p className="text-sm text-[var(--text-muted)] mt-1">Add a new cryptocurrency purchase</p>
              </div>
              <PurchaseForm cryptocurrencies={cryptocurrencies} />
            </Card>
          </motion.div>
        )}
        {currentView === 'withdrawals' && (
          <motion.div variants={itemVariants}>
            <Card hover={false}>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <ArrowDownCircle className="w-4 h-4 text-[var(--accent-coral)]" />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-coral)]">
                    Sell
                  </span>
                </div>
                <h3 className="font-display text-xl text-[var(--text-primary)]">Sell Crypto</h3>
                <p className="text-sm text-[var(--text-muted)] mt-1">Add a new cryptocurrency withdrawal</p>
              </div>
              <WithdrawalForm cryptocurrencies={cryptocurrencies} />
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
