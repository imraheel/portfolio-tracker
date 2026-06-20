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
    color: 'green',
  },
  {
    id: 'buy',
    label: 'Buy Asset',
    icon: ShoppingCart,
    description: 'Purchase investments',
    color: 'blue',
  },
  {
    id: 'reports',
    label: 'View Reports',
    icon: FileText,
    description: 'View performance',
    color: 'default',
  },
  {
    id: 'wallet',
    label: 'Wallet',
    icon: Wallet,
    description: 'Manage balance',
    color: 'default',
  },
];

const colorStyles = {
  blue: {
    bg: 'bg-[var(--accent-blue)]/10 hover:bg-[var(--accent-blue)]/20',
    border: 'border-[var(--accent-blue)]/20',
    icon: 'text-[var(--accent-blue)]',
  },
  green: {
    bg: 'bg-[var(--accent-green)]/10 hover:bg-[var(--accent-green)]/20',
    border: 'border-[var(--accent-green)]/20',
    icon: 'text-[var(--accent-green)]',
  },
  default: {
    bg: 'bg-[var(--bg-tertiary)] hover:bg-[var(--border-subtle)]',
    border: 'border-[var(--border-subtle)]',
    icon: 'text-[var(--text-secondary)]',
  },
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
    }
  };

  return (
    <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] shadow-soft p-5">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-4 h-4 text-[var(--accent-blue)]" />
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Quick Actions</h3>
          <p className="text-xs text-[var(--text-muted)]">Frequently used actions</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {actions.map((action) => {
          const styles = colorStyles[action.color as keyof typeof colorStyles];
          return (
            <button
              key={action.id}
              onClick={() => handleAction(action.id)}
              className={clsx(
                'flex flex-col items-start p-3.5 rounded-lg border',
                styles.bg,
                styles.border
              )}
            >
              <action.icon className={clsx('w-5 h-5 mb-2', styles.icon)} />
              <span className="text-sm font-medium text-[var(--text-primary)]">{action.label}</span>
              <span className="text-xs text-[var(--text-muted)] mt-0.5">{action.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
