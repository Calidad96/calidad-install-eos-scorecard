'use client';

import type { ScorecardData } from '@/lib/types';
import { KpiCard } from '../KpiCard';
import { Panel, PanelGrid } from '../Panel';
import { DataTable } from '../DataTable';
import { StatusTag, statusTone } from '../StatusTag';
import { DonutChart, StatusLegend } from '../Charts';

export function SopsTab({ data }: { data: ScorecardData }) {
  const s = data.sops;
  const statusData = Object.entries(s.byStatus).map(([name, value]) => ({ name, value }));
  const withTarget = s.items.filter((i) => i.targetDate).length;
  const overdue = s.items.filter((i) => {
    if (!i.targetDate) return false;
    return new Date(i.targetDate) < new Date();
  }).length;

  return (
    <div className="space-y-6">
      <div className="kpi-grid lg:grid-cols-4">
        <KpiCard label="SOPs Identified" value={s.total} accent="royal" />
        <KpiCard label="With Target Date" value={withTarget} accent="amber" />
        <KpiCard label="Past Target" value={overdue} accent={overdue ? 'red' : 'green'} />
        <KpiCard label="Status Types" value={Object.keys(s.byStatus).length} accent="gold" />
      </div>

      <PanelGrid>
        <Panel title="By Status" accent="royal">
          <DonutChart data={statusData} centerValue={s.total} centerLabel="SOPs" />
          <StatusLegend items={statusData} />
        </Panel>
        <Panel title="Rollout Focus" accent="gold">
          <div className="max-h-[200px] space-y-2 overflow-y-auto">
            {s.items
              .filter((i) => i.targetDate)
              .sort((a, b) => (a.targetDate || '').localeCompare(b.targetDate || ''))
              .slice(0, 8)
              .map((i) => (
                <div
                  key={i.name}
                  className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border)] px-3 py-2"
                >
                  <span className="truncate text-[12px] font-semibold">{i.name}</span>
                  <span className="shrink-0 text-[11px] tabular-nums text-[var(--muted)]">
                    {i.targetDate?.slice(0, 10)}
                  </span>
                </div>
              ))}
          </div>
        </Panel>
      </PanelGrid>

      <Panel title="All SOPs" subtitle="Status, priority, owner, rollout target" accent="royal">
        <DataTable
          maxHeight={560}
          headers={[
            { label: 'SOP' },
            { label: 'Status' },
            { label: 'Priority' },
            { label: 'Owner' },
            { label: 'Rollout Target' },
          ]}
          rows={s.items.map((sop) => [
            <span key="n" className="font-semibold">{sop.name}</span>,
            <StatusTag key="s" label={sop.status} tone={statusTone(sop.status)} />,
            sop.priority || '—',
            sop.owner || '—',
            sop.targetDate?.slice(0, 10) || '—',
          ])}
        />
      </Panel>
    </div>
  );
}
