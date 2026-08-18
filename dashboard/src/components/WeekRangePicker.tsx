'use client';

import { Calendar, ChevronDown } from 'lucide-react';
import { formatWeekLabel } from '@/lib/week-range';

export function WeekRangePicker({
  weeks,
  value,
  onChange,
  disabled,
}: {
  weeks: string[];
  value: string;
  onChange: (week: string) => void;
  disabled?: boolean;
}) {
  const hasHistory = weeks.length > 0;

  return (
    <div className="week-range-picker flex flex-wrap items-center gap-2">
      <span className="flex h-9 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-2.5 text-[11px] font-semibold text-[var(--muted)]">
        <Calendar size={14} className="text-[var(--royal)]" />
        Weekly KPI period
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="h-9 min-w-[200px] cursor-pointer appearance-none rounded-lg border border-[var(--border)] bg-[var(--card)] py-0 pl-3 pr-9 text-[12px] font-semibold text-[var(--ink)] shadow-sm outline-none transition hover:border-[var(--border-light)] focus:border-[var(--royal)] disabled:opacity-50"
          aria-label="Select weekly KPI period"
        >
          <option value="current">{formatWeekLabel('current')}</option>
          {hasHistory && <option value="latest">{formatWeekLabel('latest')}</option>}
          {weeks.map((w) => (
            <option key={w} value={w}>
              {formatWeekLabel(w)}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)]"
        />
      </div>
      {!hasHistory && (
        <span className="text-[11px] text-[var(--muted)]">
          No W1–W13 history yet — showing live Off Track status
        </span>
      )}
    </div>
  );
}
