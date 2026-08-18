import type { WeeklyKpi } from './types';

/** Collect sorted unique week keys from hub KPI history (excludes CURRENT). */
export function availableWeeks(kpis: WeeklyKpi[]): string[] {
  const set = new Set<string>();
  for (const k of kpis) {
    for (const w of k.weeklyValues) set.add(w.week);
  }
  return [...set].sort();
}

export function formatWeekLabel(week: string): string {
  if (week === 'latest') return 'Latest week with data';
  if (week === 'current') return 'Current snapshot';
  const m = week.match(/^(\d{4})-W(\d{2})$/);
  if (m) return `Week ${parseInt(m[2], 10)} · ${m[1]}`;
  return week;
}

export function applyWeekFilter(kpis: WeeklyKpi[], weekFilter: string): WeeklyKpi[] {
  if (weekFilter === 'current') return kpis;

  return kpis.map((k) => {
    if (weekFilter === 'latest') {
      const latest = k.weeklyValues.at(-1);
      if (!latest) return k;
      return {
        ...k,
        latestWeek: latest.week,
        latestValue: latest.value,
      };
    }

    const hit = k.weeklyValues.find((w) => w.week === weekFilter);
    if (!hit) {
      return { ...k, latestWeek: weekFilter, latestValue: null };
    }
    return {
      ...k,
      latestWeek: hit.week,
      latestValue: hit.value,
    };
  });
}

export function defaultWeekFilter(weeks: string[]): string {
  if (weeks.length) return 'latest';
  return 'current';
}

export function weekFilterAppliesToTab(tab: string): boolean {
  return tab === 'overview' || tab === 'weekly-kpis';
}
