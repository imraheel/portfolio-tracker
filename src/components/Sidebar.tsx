import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  PieChart,
  Bitcoin,
  Settings,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Stocks', href: '/stocks', icon: TrendingUp },
  { name: 'Mutual Funds', href: '/mutual-funds', icon: PieChart },
  { name: 'Crypto', href: '/crypto', icon: Bitcoin },

];

export default function Sidebar() {
  const location = useLocation();
  const pathname = location.hash ? location.hash.replace('#', '') : location.pathname;

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-48 shrink-0 bg-[var(--sidebar-bg)] border-r border-[var(--border-default)] flex flex-col overflow-y-auto">
      <nav className="flex-1 px-2.5 py-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-2.5 px-2.5 py-[6px] rounded-md text-[13px] no-underline ${
                active
                  ? 'bg-[var(--accent-blue)] text-white font-medium'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-2.5 pb-3 pt-2 border-t border-[var(--border-subtle)]">
        <Link
          to="/settings"
          className={`flex items-center gap-2.5 px-2.5 py-[6px] rounded-md text-[13px] no-underline ${
            pathname === '/settings'
              ? 'bg-[var(--accent-blue)] text-white font-medium'
              : 'text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
