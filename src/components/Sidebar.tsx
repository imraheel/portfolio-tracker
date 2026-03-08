import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  TrendingUp,
  PieChart,
  Bitcoin,
  ChevronDown,
  ChevronLeft,
  Wallet,
  ArrowUpCircle,
  BarChart3,
  Settings,
  X,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
}

interface NavSection {
  name: string;
  icon: typeof TrendingUp;
  items: NavItem[];
}

const sections: NavSection[] = [
  {
    name: 'Stocks',
    icon: TrendingUp,
    items: [
      { name: 'Holdings', href: '/stocks', icon: Wallet },
      { name: 'Wallet', href: '/stocks/wallet', icon: Wallet },
      { name: 'Transactions', href: '/stocks/transactions', icon: ArrowUpCircle },
      { name: 'Reports', href: '/stocks/reports', icon: BarChart3 },
    ],
  },
  {
    name: 'Mutual Funds',
    icon: PieChart,
    items: [
      { name: 'Holdings', href: '/mutual-funds', icon: Wallet },
      { name: 'Transactions', href: '/mutual-funds/transactions', icon: ArrowUpCircle },
    ],
  },
  {
    name: 'Crypto',
    icon: Bitcoin,
    items: [
      { name: 'Holdings', href: '/crypto', icon: Wallet },
      { name: 'Transactions', href: '/crypto/transactions', icon: ArrowUpCircle },
    ],
  },
];

const standaloneLinks: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
];

function NavSection({ 
  section, 
  pathname, 
  isCollapsed 
}: { 
  section: NavSection; 
  pathname: string; 
  isCollapsed: boolean;
}) {
  const [isOpen, setIsOpen] = useState(() => {
    return section.items.some((item) => pathname === item.href || pathname.startsWith(item.href));
  });

  const Icon = section.icon;
  const isActive = section.items.some(
    (item) => pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
  );

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm transition-all duration-200',
          {
            'text-[var(--accent-gold)] bg-[var(--accent-gold)]/5': isActive,
            'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]': !isActive,
          }
        )}
      >
        <div className="flex items-center gap-3">
          <Icon className="h-4 w-4" />
          {!isCollapsed && <span className="font-medium">{section.name}</span>}
        </div>
        {!isCollapsed && (
          <div className={clsx('transition-transform duration-200', isOpen && 'rotate-180')}>
            <ChevronDown className="h-3.5 w-3.5 opacity-50" />
          </div>
        )}
      </button>

      {isOpen && !isCollapsed && (
        <div className="ml-4 space-y-0.5 border-l border-[var(--border-subtle)] pl-3">
          {section.items.map((item) => {
            const ItemIcon = item.icon;
            const itemIsActive = pathname === item.href;

            return (
              <div key={item.name}>
                <Link
                  to={item.href}
                  className={clsx(
                    'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200',
                    {
                      'text-[var(--accent-gold)]': itemIsActive,
                      'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]/50': !itemIsActive,
                    }
                  )}
                >
                  <ItemIcon className="h-3.5 w-3.5" />
                  <span>{item.name}</span>
                  {itemIsActive && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--accent-gold)]" />
                  )}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const pathname = location.hash ? `#${location.hash}` : location.pathname;
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={clsx(
          'fixed left-0 top-0 z-50 flex h-screen flex-col',
          'bg-[var(--bg-secondary)]',
          'border-r border-[var(--border-subtle)]',
          'transition-all duration-300 ease-out',
          isCollapsed ? 'w-20' : 'w-64',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--accent-gold)] to-transparent opacity-50" />

        <div className="flex h-20 items-center justify-between px-5 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[var(--accent-gold)] to-[var(--accent-gold-dark)] opacity-20" />
              <div className="relative w-8 h-8 rounded-md bg-gradient-to-br from-[var(--accent-gold)] to-[var(--accent-gold-dark)] flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-[var(--bg-primary)]" />
              </div>
            </div>
            
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-display text-lg leading-tight text-[var(--text-primary)]">
                  Portfolio
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  Tracker
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <ChevronLeft className={clsx('h-4 w-4 transition-transform duration-300', isCollapsed && 'rotate-180')} />
          </button>

          <button
            onClick={onClose}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-6 scrollbar-hide">
          <div className="space-y-1 mb-6">
            {standaloneLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <div key={link.name}>
                  <Link
                    to={link.href}
                    onClick={() => window.innerWidth < 1024 && onClose()}
                    className={clsx(
                      'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all duration-200',
                      {
                        'nav-active': isActive,
                        'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]': !isActive,
                      }
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {!isCollapsed && <span className="font-medium">{link.name}</span>}
                  </Link>
                </div>
              );
            })}
          </div>

          {!isCollapsed && (
            <div className="mb-3 px-3">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
                Investments
              </span>
            </div>
          )}

          <div className="space-y-1">
            {sections.map((section) => (
              <NavSection 
                key={section.name} 
                section={section} 
                pathname={pathname} 
                isCollapsed={isCollapsed}
              />
            ))}
          </div>
        </nav>

        <div className="border-t border-[var(--border-subtle)] p-3">
          <Link
            to="/settings"
            onClick={() => window.innerWidth < 1024 && onClose()}
            className={clsx(
              'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all duration-200',
              pathname === '/settings'
                ? 'nav-active'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
            )}
          >
            <Settings className="h-4 w-4" />
            {!isCollapsed && <span className="font-medium">Settings</span>}
          </Link>

          {!isCollapsed && (
            <div className="mt-4 px-3 pt-4 border-t border-[var(--border-subtle)]">
              <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                <span>v1.0.0</span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-sage)]" />
                  Online
                </span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
