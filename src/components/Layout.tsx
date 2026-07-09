import { Outlet, Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { TrendingUp, Settings } from 'lucide-react';

function NavLink({ href, current, children }: { href: string; current: string; children: React.ReactNode }) {
  const isActive = current.startsWith(href);
  return (
    <Link
      to={href}
      className={clsx(
        "px-3 py-1.5 rounded-[7px] text-[12px] font-medium no-underline transition-none",
        isActive
          ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
      )}
    >
      {children}
    </Link>
  );
}

export default function Layout() {
  const location = useLocation();
  const pathname = location.hash ? location.hash.replace('#', '') : location.pathname;

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">
      <div className="h-[47px] shrink-0 flex items-center pl-[80px] pr-4 bg-[var(--toolbar-bg)] border-b border-[var(--border-default)] select-none [-webkit-app-region:drag]">
        <Link to="/" className="flex items-center gap-2 text-[13px] font-semibold text-[var(--text-secondary)] no-underline shrink-0 [-webkit-app-region:no-drag]">
          <div className="w-[18px] h-[18px] rounded bg-[var(--accent-blue)] flex items-center justify-center">
            <TrendingUp className="w-3 h-3 text-white" />
          </div>
          Portfolio Tracker
        </Link>

        <div className="flex-1" />

        <nav className="flex items-center gap-0.5 [-webkit-app-region:no-drag]">
          <NavLink href="/stocks" current={pathname}>Stocks</NavLink>
          <NavLink href="/mutual-funds" current={pathname}>Mutual Funds</NavLink>
          <NavLink href="/crypto" current={pathname}>Crypto</NavLink>
          <Link
            to="/settings"
            className={clsx(
              "w-[30px] h-[30px] flex items-center justify-center rounded-[7px] transition-none ml-1",
              pathname === '/settings'
                ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )}
          >
            <Settings className="w-4 h-4" />
          </Link>
        </nav>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-[var(--bg-primary)]">
          <div className="p-5 xl:p-6 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
