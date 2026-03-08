import { useSearchParams } from 'react-router-dom';
import { clsx } from 'clsx';
import { ShoppingCart, ArrowDownCircle, TrendingUp, DollarSign, ArrowRightLeft } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { MetricCard } from '@/components/ui/MetricCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useMutualFunds } from '@/hooks/mutualFunds/useMutualFunds';
import { PurchaseForm } from '@/components/mutualFunds/PurchaseForm';
import { WithdrawalForm } from '@/components/mutualFunds/WithdrawalForm';

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
      <Card className="bg-[var(--bg-tertiary)]">
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
          <p className="text-sm text-[var(--text-muted)] mt-1">All your mutual fund purchases</p>
        </div>
        <Badge variant="gold">{purchases.length} purchases</Badge>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <TableHeader cols={[
            { label: 'Date' },
            { label: 'Fund' },
            { label: 'Amount', align: 'right' },
            { label: 'Notes' },
          ]} />
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {purchases.map((purchase) => (
              <tr
                key={purchase.id}
                className="hover:bg-[var(--bg-elevated)]/30 transition-colors"
              >
                <td className="whitespace-nowrap px-4 py-3 text-sm text-[var(--text-secondary)]">
                  {formatDate(purchase.purchase_date)}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span className="font-mono font-medium text-[var(--text-primary)]">{purchase.fund?.symbol}</span>
                  <span className="ml-2 text-sm text-[var(--text-muted)]">{purchase.fund?.name}</span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-mono font-medium text-[var(--accent-coral)]">
                  {formatCurrency(purchase.amount)}
                </td>
                <td className="px-4 py-3 text-sm text-[var(--text-muted)]">{purchase.notes || '-'}</td>
              </tr>
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
      <Card className="bg-[var(--bg-tertiary)]">
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
          <p className="text-sm text-[var(--text-muted)] mt-1">All your mutual fund withdrawals</p>
        </div>
        <Badge variant="coral">{withdrawals.length} withdrawals</Badge>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <TableHeader cols={[
            { label: 'Date' },
            { label: 'Fund' },
            { label: 'Amount', align: 'right' },
            { label: 'Notes' },
          ]} />
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {withdrawals.map((withdrawal) => (
              <tr
                key={withdrawal.id}
                className="hover:bg-[var(--bg-elevated)]/30 transition-colors"
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
              </tr>
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

  const { purchases, withdrawals, funds } = useMutualFunds();

  const totalInvested = purchases.reduce((sum, p) => sum + p.amount, 0);
  const totalWithdrawn = withdrawals.reduce((sum, w) => sum + w.amount, 0);

  const handleTabChange = (view: string) => {
    setSearchParams({ view });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader
        title="Mutual Fund Transactions"
        description="Invest and withdraw from your mutual funds."
        breadcrumbs={[{ label: 'Mutual Funds' }, { label: 'Transactions' }]}
      />

      <div>
        <StatsGrid columns={4}>
          <MetricCard
            title="Total Invested"
            value={formatPkr(totalInvested)}
            icon={<ShoppingCart className="w-5 h-5" />}
            variant="default"
           
          />
          <MetricCard
            title="Total Withdrawn"
            value={formatPkr(totalWithdrawn)}
            icon={<ArrowDownCircle className="w-5 h-5" />}
            variant="sage"
           
          />
          <MetricCard
            title="Active Funds"
            value={funds.length.toString()}
            icon={<TrendingUp className="w-5 h-5" />}
            variant="default"
           
          />
          <MetricCard
            title="Available Funds"
            value={funds.length.toString()}
            icon={<DollarSign className="w-5 h-5" />}
            variant="gold"
           
          />
        </StatsGrid>
      </div>

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
          <div>
            <Card hover={false}>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <ShoppingCart className="w-4 h-4 text-[var(--accent-gold)]" />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-gold)]">
                    Buy
                  </span>
                </div>
                <h3 className="font-display text-xl text-[var(--text-primary)]">Invest in Fund</h3>
                <p className="text-sm text-[var(--text-muted)] mt-1">Add a new mutual fund purchase</p>
              </div>
              <PurchaseForm funds={funds} />
            </Card>
          </div>
        )}
        {currentView === 'withdrawals' && (
          <div>
            <Card hover={false}>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <ArrowDownCircle className="w-4 h-4 text-[var(--accent-coral)]" />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-coral)]">
                    Sell
                  </span>
                </div>
                <h3 className="font-display text-xl text-[var(--text-primary)]">Withdraw from Fund</h3>
                <p className="text-sm text-[var(--text-muted)] mt-1">Add a new mutual fund withdrawal</p>
              </div>
              <WithdrawalForm funds={funds} />
            </Card>
          </div>
        )}

        {currentView === 'invest' && (
          <div>
            <PurchasesTable />
          </div>
        )}
        {currentView === 'withdrawals' && (
          <div>
            <WithdrawalsTable />
          </div>
        )}
      </div>
    </div>
  );
}
