'use client';

import type { ScorecardData } from '@/lib/types';
import { KpiCard } from '../KpiCard';
import { Panel, PanelGrid } from '../Panel';
import { DataTable } from '../DataTable';
import { StatusTag, statusTone } from '../StatusTag';
import { DonutChart, StatusLegend } from '../Charts';

export function RocksTab({ data }: { data: ScorecardData }) {
  const r = data.rocks;
  const statusData = [
    { name: 'Not Started', value: r.notStarted },
    { name: 'In Progress', value: r.inProgress },
  ];

  return (
    <div className="space-y-6">
      <div className="kpi-grid lg:grid-cols-4">
        <KpiCard label="Total Goals" value={r.total} accent="gold" />
        <KpiCard label="Not Started" value={r.notStarted} accent="red" />
        <KpiCard label="In Progress" value={r.inProgress} accent="amber" />
        <KpiCard
          label="Milestone Coverage"
          value={`${r.items.reduce((a, i) => a + i.subitems, 0)}`}
          meta="total sub-milestones"
          accent="royal"
        />
      </div>

      <PanelGrid>
        <Panel title="Rock Status" accent="gold">
          <DonutChart data={statusData} centerValue={r.total} centerLabel="Rocks" />
          <StatusLegend items={statusData} />
        </Panel>
        <Panel title="Quarter Focus" accent="royal">
          <div className="space-y-2">
            {[...new Set(r.items.map((i) => i.quarter).filter(Boolean))].map((q) => (
              <div key={q} className="flex items-center justify-between rounded-lg border border-[var(--border)] px-3 py-2">
                <span className="text-[13px] font-semibold">{q}</span>
                <span className="text-[12px] tabular-nums text-[var(--muted)]">
                  {r.items.filter((i) => i.quarter === q).length} rocks
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </PanelGrid>

      <Panel title="Quarterly Rocks" subtitle="Department goals with milestone counts" accent="gold">
        <DataTable
          maxHeight={520}
          headers={[
            { label: 'Rock' },
            { label: 'Quarter' },
            { label: 'Owner' },
            { label: 'Status' },
            { label: 'Milestones', align: 'right' },
          ]}
          rows={r.items.map((rock) => [
            <span key="n" className="font-semibold">{rock.name}</span>,
            rock.quarter || '—',
            rock.owner || '—',
            <StatusTag key="s" label={rock.status} tone={statusTone(rock.status)} />,
            rock.subitems,
          ])}
        />
      </Panel>
    </div>
  );
}
