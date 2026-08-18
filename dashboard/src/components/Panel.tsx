type Accent = 'gold' | 'royal' | 'red' | 'green' | 'amber' | 'none';

const accentVar: Record<Accent, string> = {
  gold: 'var(--gold)',
  royal: 'var(--royal)',
  red: 'var(--red)',
  green: 'var(--green)',
  amber: 'var(--amber)',
  none: 'transparent',
};

export function Panel({
  title,
  subtitle,
  accent = 'gold',
  children,
}: {
  title: string;
  subtitle?: string;
  accent?: Accent;
  children: React.ReactNode;
}) {
  return (
    <section
      className="card-surface card-surface-premium panel-accent-top relative overflow-hidden p-5"
      style={{ '--panel-accent': accentVar[accent] } as React.CSSProperties}
    >
      <header className="relative mb-5 border-b border-[var(--border)]/50 pb-4">
        <h3 className="font-display text-[14px] font-bold tracking-tight text-[var(--ink)]">{title}</h3>
        {subtitle && (
          <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--muted)]">{subtitle}</p>
        )}
      </header>
      {children}
    </section>
  );
}

export function PanelGrid({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`grid gap-4 lg:grid-cols-2 ${className}`}>{children}</div>;
}
