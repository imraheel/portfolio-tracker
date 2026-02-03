import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowUpCircle, 
  Tag, 
  FileText, 
  Settings 
} from 'lucide-react';

const links = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Wallet', href: '/wallet', icon: Wallet },
  { name: 'Transactions', href: '/transactions', icon: ArrowUpCircle },
  { name: 'Prices', href: '/stocks', icon: Tag },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Import / Export', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <aside className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-64 border-r border-gray-200 bg-white">
      <nav className="flex h-full flex-col space-y-1 p-4">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
          
          return (
            <Link
              key={link.name}
              to={link.href}
              className={clsx(
                'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                {
                  'bg-blue-50 text-blue-700': isActive,
                  'text-gray-600 hover:bg-gray-100 hover:text-gray-900': !isActive,
                },
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
