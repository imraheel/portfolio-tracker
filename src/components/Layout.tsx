import { Outlet, Link, useLocation } from 'react-router-dom';
import { Search, Plus, TrendingUp } from 'lucide-react';
import Sidebar from './Sidebar';

const sectionNames: Record<string, string> = {
  '/': 'Dashboard',
  '/stocks': 'Stocks',
  '/stocks/wallet': 'Stocks',
  '/stocks/transactions': 'Stocks',
  '/stocks/reports': 'Reports',
  '/mutual-funds': 'Mutual Funds',
  '/mutual-funds/transactions': 'Mutual Funds',
  '/crypto': 'Crypto',
  '/crypto/transactions': 'Crypto',
  '/settings': 'Settings',
};

export default function Layout() {
  const location = useLocation();
  const pathname = location.hash ? location.hash.replace('#', '') : location.pathname;
  const section = sectionNames[pathname] || 'Portfolio Tracker';

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">
      <div className="h-[47px] shrink-0 flex items-center px-4 bg-[var(--toolbar-bg)] border-b border-[var(--border-default)] select-none">
        <Link to="/" className="flex items-center gap-2 text-[13px] font-semibold text-[var(--text-secondary)] no-underline">
          <div className="w-[18px] h-[18px] rounded bg-[var(--accent-blue)] flex items-center justify-center">
            <TrendingUp className="w-3 h-3 text-white" />
          </div>
          Portfolio Tracker
        </Link>

        <div className="ml-3 text-[13px] text-[var(--text-muted)] font-medium">/</div>
        <div className="ml-3 text-[13px] font-medium text-[var(--text-primary)]">{section}</div>

        <div className="flex-1" />

        <div className="relative">
          <Search className="absolute left-[9px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search"
            className="w-[180px] h-[26px] rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-secondary)] pl-[28px] pr-[8px] text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent-blue)]"
          />
        </div>

        <button className="ml-2 h-[26px] px-[10px] rounded-[6px] bg-[var(--accent-blue)] text-white text-[12px] font-medium flex items-center gap-1.5 hover:bg-[var(--accent-blue-dark)]">
          <Plus className="w-3.5 h-3.5" />
          Add
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-[var(--bg-primary)]">
          <div className="p-5 xl:p-6 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
