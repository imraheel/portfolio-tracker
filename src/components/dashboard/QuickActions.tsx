import { motion } from 'framer-motion';
import {
  ShoppingCart,
  FileText,
  ArrowDownToLine,
  Wallet,
} from 'lucide-react';
import { clsx } from 'clsx';

export interface QuickActionsProps {
  onDeposit?: () => void;
  onBuyAsset?: () => void;
  onViewReports?: () => void;
}

const actions = [
  {
    id: 'deposit',
    label: 'Add Deposit',
    icon: ArrowDownToLine,
    description: 'Add funds to wallet',
    color: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
  },
  {
    id: 'buy',
    label: 'Buy Asset',
    icon: ShoppingCart,
    description: 'Purchase investments',
    color: 'bg-green-50 text-green-600 hover:bg-green-100',
  },
  {
    id: 'reports',
    label: 'View Reports',
    icon: FileText,
    description: 'View performance',
    color: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
  },
  {
    id: 'wallet',
    label: 'Wallet',
    icon: Wallet,
    description: 'Manage balance',
    color: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function QuickActions({ onDeposit, onBuyAsset, onViewReports }: QuickActionsProps) {
  const handleAction = (actionId: string) => {
    switch (actionId) {
      case 'deposit':
        onDeposit?.();
        break;
      case 'buy':
        onBuyAsset?.();
        break;
      case 'reports':
        onViewReports?.();
        break;
      default:
        break;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white rounded-xl shadow-soft p-6"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        <p className="text-sm text-gray-500 mt-1">Frequently used actions</p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        {actions.map((action) => (
          <motion.button
            key={action.id}
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleAction(action.id)}
            className={clsx(
              'flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200',
              action.color,
              'shadow-sm hover:shadow-md'
            )}
          >
            <motion.div
              whileHover={{ rotate: 10 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <action.icon className="w-6 h-6 mb-2" />
            </motion.div>
            <span className="text-sm font-semibold text-gray-900">{action.label}</span>
            <span className="text-xs text-gray-500 mt-1">{action.description}</span>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
}
