import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  ArrowUpCircle,
  Settings,
  PieChart,
  Bitcoin,
  ChevronDown,
  ChevronLeft,
  Menu,
  X,
  BarChart3,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: number;
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

const navItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

function NavSection({ section, pathname, isCollapsed }: { section: NavSection; pathname: string; isCollapsed: boolean }) {
  const [isOpen, setIsOpen] = useState(() => {
    return section.items.some((item) => pathname === item.href || pathname.startsWith(item.href));
  });

  const Icon = section.icon;
  const isActive = section.items.some(
    (item) => pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
  );

  return (
    <div className="space-y-1">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          {
            'bg-blue-50 text-blue-700': isActive,
            'text-gray-300 hover:bg-white/10 hover:text-white': !isActive,
          }
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center space-x-3">
          <Icon className="h-5 w-5" />
          {!isCollapsed && <span>{section.name}</span>}
        </div>
        {!isCollapsed && (
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && !isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="ml-4 space-y-1 border-l-2 border-white/20 pl-4"
          >
            {section.items.map((item) => {
              const ItemIcon = item.icon;
              const itemIsActive = pathname === item.href;

              return (
                <motion.div
                  key={item.name}
                  variants={navItemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  <Link
                    to={item.href}
                    className={clsx(
                      'group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      {
                        'bg-blue-50 text-blue-700': itemIsActive,
                        'text-gray-400 hover:bg-white/10 hover:text-white': !itemIsActive,
                      }
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <ItemIcon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && item.badge > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500 px-1.5 text-xs font-medium text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
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
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <button
        onClick={onClose}
        className="fixed left-4 top-20 z-50 rounded-lg bg-slate-800 p-2 text-white lg:hidden"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={clsx(
          'fixed left-0 top-0 z-40 flex h-screen flex-col bg-gradient-to-b from-slate-800 to-slate-900 text-white transition-all duration-300',
          isCollapsed ? 'w-20' : 'w-64',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col"
              >
                <span className="text-sm font-bold">Investment Tracker</span>
                <span className="text-xs text-gray-400">Portfolio Manager</span>
              </motion.div>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white lg:block"
          >
            <ChevronLeft className={clsx('h-5 w-5 transition-transform', isCollapsed && 'rotate-180')} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {standaloneLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <motion.div key={link.name} variants={navItemVariants} initial="hidden" animate="visible">
                  <Link
                    to={link.href}
                    onClick={() => window.innerWidth < 1024 && onClose()}
                    className={clsx(
                      'flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                      {
                        'bg-blue-600 text-white shadow-lg shadow-blue-600/30': isActive,
                        'text-gray-300 hover:bg-white/10 hover:text-white': !isActive,
                      }
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={clsx('h-5 w-5', isActive ? 'text-white' : 'text-gray-400')} />
                      {!isCollapsed && <span>{link.name}</span>}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {!isCollapsed && <div className="my-4 border-t border-white/10" />}

          {!isCollapsed && (
            <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Investments
            </div>
          )}

          {sections.map((section) => (
            <NavSection key={section.name} section={section} pathname={pathname} isCollapsed={isCollapsed} />
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <Link
            to="/settings"
            onClick={() => window.innerWidth < 1024 && onClose()}
            className={clsx(
              'flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              pathname === '/settings'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-gray-300 hover:bg-white/10 hover:text-white'
            )}
          >
            <Settings className={clsx('h-5 w-5', pathname === '/settings' ? 'text-white' : 'text-gray-400')} />
            {!isCollapsed && <span>Settings</span>}
          </Link>
        </div>
      </motion.aside>
    </>
  );
}
