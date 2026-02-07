import { motion } from 'framer-motion';
import {
  ShoppingCart,
  FileText,
  ArrowDownToLine,
  Wallet,
  Zap,
} from 'lucide-react';
import { clsx } from 'clsx';

export interface QuickActionsProps {
  onDeposit?: () => void;
  onBuyAsset?: () => void;
  onViewReports?: () => void;
  onViewWallet?: () => void;
}

const actions = [
  {
    id: 'deposit',
    label: 'Add Deposit',
    icon: ArrowDownToLine,
    description: 'Add funds to wallet',
    variant: 'sage' as const,
  },
  {
    id: 'buy',
    label: 'Buy Asset',
    icon: ShoppingCart,
    description: 'Purchase investments',
    variant: 'gold' as const,
  },
  {
    id: 'reports',
    label: 'View Reports',
    icon: FileText,
    description: 'View performance',
    variant: 'default' as const,
  },
  {
    id: 'wallet',
    label: 'Wallet',
    icon: Wallet,
    description: 'Manage balance',
    variant: 'default' as const,
  },
];

const variantStyles = {
  sage: {
    bg: 'bg-[var(--accent-sage)]/10 hover:bg-[var(--accent-sage)]/20',
    border: 'border-[var(--accent-sage)]/20 hover:border-[var(--accent-sage)]/40',
    icon: 'text-[var(--accent-sage)]',
  },
  gold: {
    bg: 'bg-[var(--accent-gold)]/10 hover:bg-[var(--accent-gold)]/20',
    border: 'border-[var(--accent-gold)]/20 hover:border-[var(--accent-gold)]/40',
    icon: 'text-[var(--accent-gold)]',
  },
  default: {
    bg: 'bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)]/80',
    border: 'border-[var(--border-subtle)] hover:border-[var(--border-default)]',
    icon: 'text-[var(--text-secondary)]',
  },
};

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

export function QuickActions({ onDeposit, onBuyAsset, onViewReports, onViewWallet }: QuickActionsProps) {
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
      case 'wallet':
        onViewWallet?.();
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
      className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-6"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-4 h-4 text-[var(--accent-gold)]" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-gold)]">
            Actions
          </span>
        </div>
        <h3 className="font-display text-xl text-[var(--text-primary)]">Quick Actions</h3>
        <p className="text-sm text-[var(--text-muted)] mt-1">Frequently used actions</p>
      </div>

      {/* Actions Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-3"
      >
        {actions.map((action) => {
          const styles = variantStyles[action.variant];
          return (
            <motion.button
              key={action.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAction(action.id)}
              className={clsx(
                'flex flex-col items-start p-4 rounded-lg border transition-all duration-200',
                styles.bg,
                styles.border
              )}
            >
              <action.icon className={clsx('w-5 h-5 mb-3', styles.icon)} />
              <span className="text-sm font-medium text-[var(--text-primary)]">{action.label}</span>
              <span className="text-xs text-[var(--text-muted)] mt-1">{action.description}</span>
            </motion.button>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
