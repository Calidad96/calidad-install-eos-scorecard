'use client';

import type { ScorecardData } from '@/lib/types';
import { KpiCard } from '../KpiCard';
import { Panel, PanelGrid } from '../Panel';
import { DataTable } from '../DataTable';
import { StatusTag, offTrackTone } from '../StatusTag';
import { DonutChart, StatusLegend } from '../Charts';
import { ScoreGauge } from '../ScoreGauge';

import { formatWeekLabel } from '@/lib/week-range';

export function WeeklyKpisTab({
  data,
  weekFilter = 'current',
}: {
  data: ScorecardData;
  weekFilter?: string;
}) {
  const s = data.summary;
  const trackData = [
    { name: 'On Track', value: s.kpiGreen },
    { name: 'Not Reported', value: s.kpiYellow },
    { name: 'Off Track', value: s.kpiRed },
  ];

  const byCategory: Record<string, number> = {};
  for (const k of data.weeklyKpis) {
    const cat = k.category || 'Other';
    byCategory[cat] = (byCategory[cat] ?? 0) + 1;
  }

  return (
    <div className="space-y-6">
      <div className="kpi-grid lg:grid-cols-4">
        <KpiCard label="Total KPIs" value={s.kpiTotal} accent="green" />
        <KpiCard label="On Track" value={s.kpiGreen} accent="green" />
        <KpiCard label="Off Track" value={s.kpiRed} accent="red" />
        <KpiCard label="Not Reported" value={s.kpiYellow} accent="amber" />
      </div>

      <PanelGrid>
        <Panel title="Track Status" subtitle="Green / yellow / red from Off Track column" accent="green">
          <DonutChart data={trackData} centerValue={s.kpiTotal} centerLabel="KPIs" />
          <StatusLegend items={trackData} />
        </Panel>

        <Panel title="By Category" accent="royal">
          <div className="flex flex-wrap gap-2">
            {Object.entries(byCategory).map(([cat, n]) => (
              <span
                key={cat}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[12px]"
              >
                <span className="font-bold text-[var(--ink)]">{n}</span>
                <span className="ml-1.5 text-[var(--muted)]">{cat}</span>
              </span>
            ))}
          </div>
        </Panel>
      </PanelGrid>

      <Panel
        title="Weekly Scorecard"
        subtitle={`Period: ${formatWeekLabel(weekFilter)} · W1–W13 from Monday hub history`}
        accent="green"
      >
        <DataTable
          maxHeight={560}
          headers={[
            { label: 'KPI' },
            { label: 'Category' },
            { label: 'Target', align: 'right' },
            { label: 'Direction' },
            { label: 'Latest Week' },
            { label: 'Latest Value', align: 'right' },
            { label: 'Score', align: 'right' },
            { label: 'Off Track?' },
          ]}
          rows={data.weeklyKpis.map((k) => [
            <span key="n" className="font-semibold">{k.name}</span>,
            k.category || '—',
            k.target ?? '—',
            k.goalDirection || '—',
            k.latestWeek ?? '—',
            k.latestValue ?? '—',
            k.score != null ? (
              <div key="g" className="flex items-center justify-end gap-2">
                <ScoreGauge value={k.score} size={48} />
                <span className="font-bold tabular-nums">{k.score.toFixed(1)}</span>
              </div>
            ) : (
              '—'
            ),
            <StatusTag key="o" label={k.offTrack} tone={offTrackTone(k.offTrack)} />,
          ])}
        />
      </Panel>
    </div>
  );
}
