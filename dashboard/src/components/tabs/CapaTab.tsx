'use client';

import type { ScorecardData } from '@/lib/types';
import { KpiCard } from '../KpiCard';
import { Panel, PanelGrid } from '../Panel';
import { DataTable } from '../DataTable';
import { StatusTag, priorityTone, statusTone } from '../StatusTag';
import { DonutChart, StatusLegend } from '../Charts';

export function CapaTab({ data }: { data: ScorecardData }) {
  const c = data.capa;
  const idsData = Object.entries(c.byIdsStatus).map(([name, value]) => ({ name, value }));
  const highPri = c.items.filter((i) => /critical|high/i.test(i.priority)).length;

  return (
    <div className="space-y-6">
      <div className="kpi-grid lg:grid-cols-3">
        <KpiCard label="Open Issues" value={c.open} accent="red" />
        <KpiCard label="High Priority" value={highPri} accent="amber" />
        <KpiCard label="IDS Statuses" value={Object.keys(c.byIdsStatus).length} meta="unique states" accent="royal" />
      </div>

      <PanelGrid>
        <Panel title="IDS Pipeline" subtitle="Identify → Discuss → Solve" accent="red">
          <DonutChart data={idsData} centerValue={c.open} centerLabel="Open" />
          <StatusLegend items={idsData} />
        </Panel>
        <Panel title="What is Kappa?" accent="gold">
          <p className="text-[13px] leading-relaxed text-[var(--muted)]">
            CAPA/IDS captures problems and issues from L10 meetings. Open items need Identify, Discuss,
            or Solve — same pattern as your SOC/STOS CAPA tab, scoped to Install.
          </p>
        </Panel>
      </PanelGrid>

      <Panel title="Open CAPA / IDS Items" accent="red">
        <DataTable
          maxHeight={520}
          headers={[
            { label: 'Issue' },
            { label: 'Owner' },
            { label: 'Type' },
            { label: 'Priority' },
            { label: 'IDS Status' },
          ]}
          rows={c.items.map((item) => [
            <span key="n" className="font-semibold">{item.name}</span>,
            item.owner || '—',
            item.issueType || '—',
            <StatusTag key="p" label={item.priority} tone={priorityTone(item.priority)} />,
            <StatusTag key="s" label={item.idsStatus} tone={statusTone(item.idsStatus)} />,
          ])}
        />
      </Panel>
    </div>
  );
}
