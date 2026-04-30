export default function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <header className="border-b border-border bg-paper-soft/30">
      <div className="px-8 py-8 flex items-end justify-between gap-6 flex-wrap">
        <div className="space-y-2 min-w-0">
          {eyebrow && (
            <div className="text-xs font-medium text-ink-muted uppercase tracking-widest">
              {eyebrow}
            </div>
          )}
          <h1 className="display text-3xl sm:text-4xl font-semibold text-ink">{title}</h1>
          {subtitle && (
            <p className="text-sm text-ink-muted max-w-2xl">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
