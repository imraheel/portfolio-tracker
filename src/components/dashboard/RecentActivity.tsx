import { format } from 'date-fns';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  DollarSign,
  CreditCard,
  Wallet,
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
        color: 'text-[var(--accent-sage)]', 
        bg: 'bg-[var(--accent-sage)]/10',
        border: 'border-[var(--accent-sage)]/20'
      };
    case 'sell':
      return { 
        icon: ArrowUpCircle, 
        color: 'text-[var(--accent-coral)]', 
        bg: 'bg-[var(--accent-coral)]/10',
        border: 'border-[var(--accent-coral)]/20'
      };
    case 'dividend':
      return { 
        icon: TrendingUp, 
        color: 'text-[var(--accent-gold)]', 
        bg: 'bg-[var(--accent-gold)]/10',
        border: 'border-[var(--accent-gold)]/20'
      };
    case 'deposit':
      return { 
        icon: DollarSign, 
        color: 'text-[var(--accent-sage)]', 
        bg: 'bg-[var(--accent-sage)]/10',
        border: 'border-[var(--accent-sage)]/20'
      };
    case 'withdrawal':
      return { 
        icon: CreditCard, 
        color: 'text-[var(--accent-coral)]', 
        bg: 'bg-[var(--accent-coral)]/10',
        border: 'border-[var(--accent-coral)]/20'
      };
    default:
      return { 
        icon: Wallet, 
        color: 'text-[var(--text-muted)]', 
        bg: 'bg-[var(--bg-elevated)]',
        border: 'border-[var(--border-subtle)]'
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
    <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden">
      <div className="p-6 border-b border-[var(--border-subtle)]">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-[var(--accent-gold)]" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-gold)]">
                Activity
              </span>
            </div>
            <h3 className="font-display text-xl text-[var(--text-primary)]">Recent Activity</h3>
            <p className="text-sm text-[var(--text-muted)] mt-1">Your latest transactions</p>
          </div>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-xs font-medium text-[var(--accent-gold)] hover:text-[var(--accent-gold-light)] transition-colors"
            >
              View All
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-[var(--border-subtle)]">
        <ul className="max-h-[400px] overflow-y-auto scrollbar-hide">
          {displayTransactions.map((transaction) => {
            const { icon: Icon, color, bg, border } = getTransactionIcon(transaction.type);
            const isPositive = ['buy', 'dividend', 'deposit'].includes(transaction.type);

            return (
              <li
                key={transaction.id}
                className="flex items-center gap-4 p-4 hover:bg-[var(--bg-elevated)]/30 transition-colors cursor-pointer"
              >
                <div className={clsx('p-2 rounded-lg border', bg, border)}>
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
                <div className="text-right">
                  <p className={clsx(
                    'text-sm font-mono font-medium',
                    isPositive ? 'text-[var(--accent-sage)]' : 'text-[var(--accent-coral)]'
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
