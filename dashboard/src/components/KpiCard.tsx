import { ScoreGauge, scoreGaugeColor } from './ScoreGauge';

type Accent = 'royal' | 'gold' | 'green' | 'red' | 'amber';

const accents: Record<Accent, string> = {
  royal: 'kpi-accent-royal kpi-glow-royal',
  gold: 'kpi-accent-gold kpi-glow-gold',
  green: 'kpi-accent-green kpi-glow-green',
  red: 'kpi-accent-red kpi-glow-red',
  amber: 'kpi-accent-amber kpi-glow-amber',
};

export function KpiCard({
  label,
  value,
  meta,
  accent = 'royal',
  gauge,
}: {
  label: string;
  value: string | number;
  meta?: string;
  accent?: Accent;
  gauge?: number | null;
}) {
  const showGauge = gauge !== undefined;
  const gaugeColor = showGauge ? scoreGaugeColor(gauge ?? null) : undefined;
  const gaugeDisplay = gauge != null && Number.isFinite(gauge) ? gauge.toFixed(1) : '—';

  return (
    <div
      className={`card-surface card-surface-premium group relative p-5 before:absolute before:bottom-0 before:left-0 before:top-0 before:z-[1] before:w-[3px] before:content-[''] ${accents[accent]}`}
    >
      <div className="relative z-[2]">
        <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--muted)]">
          {label}
        </div>
        {showGauge ? (
          <div className="mt-3 flex items-center gap-3">
            <ScoreGauge value={gauge ?? null} size={76} />
            <div>
              <span
                className="font-display text-[34px] font-extrabold leading-none tabular-nums"
                style={{ color: gaugeColor }}
              >
                {gaugeDisplay}
              </span>
              <span className="text-[14px] font-semibold text-[var(--muted)]"> / 5</span>
              {meta && <div className="mt-1.5 text-[12px] text-[var(--muted)]">{meta}</div>}
            </div>
          </div>
        ) : (
          <>
            <div className="font-display mt-3 text-[32px] font-extrabold leading-none tabular-nums text-[var(--ink)]">
              {value}
            </div>
            {meta && <div className="mt-2 text-[12px] text-[var(--muted)]">{meta}</div>}
          </>
        )}
      </div>
    </div>
  );
}
