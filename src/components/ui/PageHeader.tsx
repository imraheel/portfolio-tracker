interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
}

const HomeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
}: PageHeaderProps) {
  return (
    <div className="mb-8">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-4 flex items-center gap-2 text-xs">
          <HomeIcon className="h-3.5 w-3.5 text-[var(--text-muted)]" />
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              <ChevronRightIcon className="h-3 w-3 text-[var(--border-default)]" />
              {crumb.href ? (
                <a
                  href={crumb.href}
                  className="text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors"
                >
                  {crumb.label}
                </a>
              ) : (
                <span className="text-[var(--text-secondary)]">{crumb.label}</span>
              )}
            </div>
          ))}
        </nav>
      )}

      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="h-px w-8 bg-gradient-to-r from-[var(--accent-gold)] to-transparent" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-[var(--accent-gold)]">
              Portfolio Overview
            </span>
          </div>

          <h1 className="font-display text-3xl md:text-4xl text-[var(--text-primary)] tracking-tight">
            {title}
          </h1>

          {description && (
            <p className="mt-3 text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>

      <div className="mt-6 h-px bg-gradient-to-r from-[var(--border-default)] via-[var(--border-subtle)] to-transparent" />
    </div>
  );
}
