'use client';

import type { ScorecardData } from '@/lib/types';
import { KpiCard } from '../KpiCard';
import { Panel, PanelGrid } from '../Panel';
import { DataTable } from '../DataTable';
import { StatusTag, statusTone } from '../StatusTag';
import { DonutChart, StatusLegend } from '../Charts';

export function AccountabilityTab({ data }: { data: ScorecardData }) {
  const s = data.summary;
  const chartData = Object.entries(data.accountability.byStatus).map(([name, value]) => ({
    name,
    value,
  }));
  const withDoc = data.accountability.items.filter((i) => i.hasChart === 'Yes').length;

  return (
    <div className="space-y-6">
      <div className="kpi-grid lg:grid-cols-4">
        <KpiCard label="Total Charts" value={s.accountabilityTotal} accent="royal" />
        <KpiCard label="Finalized / Reviewed" value={s.accountabilityDone} accent="green" />
        <KpiCard label="With Chart Doc" value={withDoc} meta="doc attached" accent="amber" />
        <KpiCard
          label="Completion"
          value={`${s.accountabilityTotal ? Math.round((s.accountabilityDone / s.accountabilityTotal) * 100) : 0}%`}
          accent="gold"
        />
      </div>

      <PanelGrid>
        <Panel title="Status Breakdown" accent="royal">
          <DonutChart
            data={chartData}
            centerValue={s.accountabilityTotal}
            centerLabel="Charts"
          />
          <StatusLegend items={chartData} />
        </Panel>

        <Panel title="Status Pipeline" subtitle="New → In progress → Done / provided / reviewed / finalized" accent="gold">
          <div className="space-y-2">
            {['New', 'In progress', 'Done', 'Provided to resource', 'Reviewed', 'Finalized'].map((step) => {
              const count = data.accountability.byStatus[step] ?? 0;
              const total = s.accountabilityTotal || 1;
              return (
                <div key={step}>
                  <div className="mb-1 flex justify-between text-[12px]">
                    <StatusTag label={step} tone={statusTone(step)} />
                    <span className="font-bold tabular-nums">{count}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[var(--hover-row)]">
                    <div
                      className="h-full rounded-full bg-[var(--royal)] transition-all"
                      style={{ width: `${(count / total) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </PanelGrid>

      <Panel title="All Accountability Seats" subtitle="People, positions, and chart status" accent="royal">
        <DataTable
          maxHeight={520}
          headers={[
            { label: 'Seat / Person' },
            { label: 'Position' },
            { label: 'Status' },
            { label: 'Chart Doc' },
          ]}
          rows={data.accountability.items.map((i) => [
            <span key="n" className="font-semibold">{i.name}</span>,
            i.position || '—',
            <StatusTag key="s" label={i.status} tone={statusTone(i.status)} />,
            <StatusTag
              key="d"
              label={i.hasChart}
              tone={i.hasChart === 'Yes' ? 'good' : 'neutral'}
            />,
          ])}
        />
      </Panel>
    </div>
  );
}
