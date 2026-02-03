import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  Wallet,
  ArrowUpCircle,
  Tag,
  FileText,
  Settings,
  TrendingUp,
  PieChart,
  Bitcoin,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface NavSection {
  name: string;
  icon: React.ElementType;
  items: NavItem[];
}

const sections: NavSection[] = [
  {
    name: 'Stocks',
    icon: TrendingUp,
    items: [
      { name: 'Wallet', href: '/wallet', icon: Wallet },
      { name: 'Transactions', href: '/transactions', icon: ArrowUpCircle },
      { name: 'Prices', href: '/stocks', icon: Tag },
      { name: 'Reports', href: '/reports', icon: FileText },
    ],
  },
  {
    name: 'Mutual Funds',
    icon: PieChart,
    items: [
      { name: 'Funds List', href: '/mutual-funds', icon: PieChart },
      { name: 'Purchases', href: '/mutual-funds/purchases', icon: ArrowUpCircle },
      { name: 'Withdrawals', href: '/mutual-funds/withdrawals', icon: ArrowUpCircle },
    ],
  },
  {
    name: 'Crypto',
    icon: Bitcoin,
    items: [
      { name: 'Crypto List', href: '/crypto', icon: Bitcoin },
      { name: 'Purchases', href: '/crypto/purchases', icon: ArrowUpCircle },
      { name: 'Withdrawals', href: '/crypto/withdrawals', icon: ArrowUpCircle },
    ],
  },
];

const standaloneLinks: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Settings', href: '/settings', icon: Settings },
];

function NavSection({ section, pathname }: { section: NavSection; pathname: string }) {
  const [isOpen, setIsOpen] = useState(() => {
    // Check if any item in this section is active
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
          'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          {
            'bg-blue-50 text-blue-700': isActive,
            'text-gray-600 hover:bg-gray-100 hover:text-gray-900': !isActive,
          }
        )}
      >
        <div className="flex items-center space-x-3">
          <Icon className="h-5 w-5" />
          <span>{section.name}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>

      {isOpen && (
        <div className="ml-4 space-y-1 border-l-2 border-gray-200 pl-4">
          {section.items.map((item) => {
            const ItemIcon = item.icon;
            const itemIsActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                to={item.href}
                className={clsx(
                  'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  {
                    'bg-blue-50 text-blue-700': itemIsActive,
                    'text-gray-600 hover:bg-gray-100 hover:text-gray-900': !itemIsActive,
                  }
                )}
              >
                <ItemIcon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <aside className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-64 overflow-y-auto border-r border-gray-200 bg-white">
      <nav className="flex h-full flex-col space-y-1 p-4">
        {/* Standalone links */}
        {standaloneLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.name}
              to={link.href}
              className={clsx(
                'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                {
                  'bg-blue-50 text-blue-700': isActive,
                  'text-gray-600 hover:bg-gray-100 hover:text-gray-900': !isActive,
                }
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{link.name}</span>
            </Link>
          );
        })}

        {/* Divider */}
        <div className="my-2 border-t border-gray-200" />

        {/* Collapsible sections */}
        {sections.map((section) => (
          <NavSection key={section.name} section={section} pathname={pathname} />
        ))}
      </nav>
    </aside>
  );
}
