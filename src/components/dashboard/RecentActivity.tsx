import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  DollarSign,
  CreditCard,
  Wallet,
  TrendingUp,
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
      return { icon: ArrowDownCircle, color: 'text-green-500', bg: 'bg-green-50' };
    case 'sell':
      return { icon: ArrowUpCircle, color: 'text-red-500', bg: 'bg-red-50' };
    case 'dividend':
      return { icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50' };
    case 'deposit':
      return { icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-50' };
    case 'withdrawal':
      return { icon: CreditCard, color: 'text-orange-500', bg: 'bg-orange-50' };
    default:
      return { icon: Wallet, color: 'text-gray-500', bg: 'bg-gray-50' };
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export function RecentActivity({ transactions, onViewAll }: RecentActivityProps) {
  const displayTransactions = transactions.slice(0, 10);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-xl shadow-soft overflow-hidden"
    >
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <p className="text-sm text-gray-500 mt-1">Your latest transactions</p>
          </div>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              View All
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-50">
        <motion.ul
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {displayTransactions.map((transaction) => {
            const { icon: Icon, color, bg } = getTransactionIcon(transaction.type);
            const isPositive = ['buy', 'dividend', 'deposit'].includes(transaction.type);

            return (
              <motion.li
                key={transaction.id}
                variants={itemVariants}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className={clsx('p-2 rounded-full', bg)}>
                  <Icon className={clsx('w-5 h-5', color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {getTransactionLabel(transaction)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(transaction.date), 'MMM d, yyyy • h:mm a')}
                  </p>
                </div>
                <div className="text-right">
                  <p className={clsx(
                    'text-sm font-semibold',
                    isPositive ? 'text-green-600' : 'text-red-600'
                  )}>
                    {isPositive ? '+' : '-'}{formatPKR(transaction.amount)}
                  </p>
                </div>
              </motion.li>
            );
          })}
        </motion.ul>

        {transactions.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-400">No recent transactions</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
