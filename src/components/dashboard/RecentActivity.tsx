import { format } from 'date-fns';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  DollarSign,
  CreditCard,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { clsx } from 'clsx';

export interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'dividend' | 'deposit' | 'withdrawal';
  assetType: 'stocks' | 'mutualFunds' | 'crypto' | 'wallet';
  symbol?: string;
  amount: number;
  quantity?: number;
  date: string;
  description?: string;
}

export interface RecentActivityProps {
  transactions: Transaction[];
  onViewAll?: () => void;
}

const formatPKR = (value: number): string => {
  return `Rs. ${value.toLocaleString('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const getTransactionIcon = (type: Transaction['type']) => {
  switch (type) {
    case 'buy':
      return {
        icon: ArrowDownCircle,
        bg: 'bg-[var(--accent-green)]/10',
        color: 'text-[var(--accent-green)]',
      };
    case 'sell':
      return {
        icon: ArrowUpCircle,
        bg: 'bg-[var(--accent-red)]/10',
        color: 'text-[var(--accent-red)]',
      };
    case 'dividend':
      return {
        icon: TrendingUp,
        bg: 'bg-[var(--accent-blue)]/10',
        color: 'text-[var(--accent-blue)]',
      };
    case 'deposit':
      return {
        icon: DollarSign,
        bg: 'bg-[var(--accent-green)]/10',
        color: 'text-[var(--accent-green)]',
      };
    case 'withdrawal':
      return {
        icon: CreditCard,
        bg: 'bg-[var(--accent-red)]/10',
        color: 'text-[var(--accent-red)]',
      };
    default:
      return {
        icon: Activity,
        bg: 'bg-[var(--bg-tertiary)]',
        color: 'text-[var(--text-muted)]',
      };
  }
};

const getTransactionLabel = (transaction: Transaction): string => {
  switch (transaction.type) {
    case 'buy':
      return `Bought ${transaction.quantity} ${transaction.symbol || transaction.assetType}`;
    case 'sell':
      return `Sold ${transaction.quantity} ${transaction.symbol || transaction.assetType}`;
    case 'dividend':
      return `Dividend from ${transaction.symbol || transaction.assetType}`;
    case 'deposit':
      return 'Wallet Deposit';
    case 'withdrawal':
      return 'Wallet Withdrawal';
    default:
      return 'Transaction';
  }
};

export function RecentActivity({ transactions, onViewAll }: RecentActivityProps) {
  const displayTransactions = transactions.slice(0, 10);

  return (
    <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] shadow-soft overflow-hidden">
      <div className="p-5 border-b border-[var(--border-subtle)]">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[var(--accent-blue)]" />
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Recent Activity</h3>
              <p className="text-xs text-[var(--text-muted)]">Your latest transactions</p>
            </div>
          </div>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-xs font-medium text-[var(--accent-blue)] hover:text-[var(--accent-blue-dark)]"
            >
              View All
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-[var(--border-subtle)]">
        <ul className="max-h-[380px] overflow-y-auto">
          {displayTransactions.map((transaction) => {
            const { icon: Icon, color, bg } = getTransactionIcon(transaction.type);
            const isPositive = ['buy', 'dividend', 'deposit'].includes(transaction.type);

            return (
              <li
                key={transaction.id}
                className="flex items-center gap-3 p-3.5 hover:bg-[var(--bg-tertiary)]"
              >
                <div className={clsx('p-2 rounded-lg', bg)}>
                  <Icon className={clsx('w-4 h-4', color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {getTransactionLabel(transaction)}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {format(new Date(transaction.date), 'MMM d, yyyy • h:mm a')}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className={clsx(
                    'text-sm font-semibold',
                    isPositive ? 'text-[var(--accent-green)]' : 'text-[var(--accent-red)]'
                  )}>
                    {isPositive ? '+' : '-'}{formatPKR(transaction.amount)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>

        {transactions.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-sm text-[var(--text-muted)]">No recent transactions</p>
          </div>
        )}
      </div>
    </div>
  );
}
