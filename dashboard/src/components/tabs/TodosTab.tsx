'use client';

import { useMemo, useState } from 'react';
import type { ScorecardData } from '@/lib/types';
import { KpiCard } from '../KpiCard';
import { Panel, PanelGrid } from '../Panel';
import { DataTable } from '../DataTable';
import { StatusTag, priorityTone, statusTone } from '../StatusTag';
import { BarChartSimple, DonutChart, StatusLegend } from '../Charts';

export function TodosTab({ data }: { data: ScorecardData }) {
  const [filter, setFilter] = useState<'open' | 'all'>('open');
  const s = data.summary;

  const bucketData = Object.entries(data.todos.byBucket).map(([name, value]) => ({ name, value }));
  const statusData = Object.entries(data.todos.byStatus).map(([name, value]) => ({ name, value }));

  const rows = useMemo(() => {
    const list = filter === 'open' ? data.todos.openItems : data.todos.allItems;
    return list;
  }, [filter, data.todos]);

  return (
    <div className="space-y-6">
      <div className="kpi-grid lg:grid-cols-4">
        <KpiCard label="Open" value={s.todosOpen} accent="amber" />
        <KpiCard label="Overdue" value={s.todosOverdue} accent="red" />
        <KpiCard label="Done" value={s.todosDone} accent="green" />
        <KpiCard label="Total Items" value={s.todosTotal} accent="royal" />
      </div>

      <PanelGrid>
        <Panel title="Due Buckets (Open)" subtitle="Overdue → Due Today → This Week → Later" accent="amber">
          <BarChartSimple
            data={bucketData}
            color={s.todosOverdue > 0 ? 'var(--red)' : 'var(--amber)'}
          />
        </Panel>
        <Panel title="Status Mix" accent="royal">
          <DonutChart data={statusData} centerValue={s.todosTotal} centerLabel="Total" />
          <StatusLegend items={statusData} />
        </Panel>
      </PanelGrid>

      <Panel title="Action Items" accent="amber">
        <div className="mb-4 flex gap-2">
          {(['open', 'all'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold transition ${
                filter === f
                  ? 'bg-[var(--gold)] text-[var(--gold-text)]'
                  : 'bg-[var(--hover-row)] text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              {f === 'open' ? `Open (${s.todosOpen})` : `All (${s.todosTotal})`}
            </button>
          ))}
        </div>
        <DataTable
          maxHeight={560}
          headers={[
            { label: 'Task' },
            { label: 'Accountable' },
            { label: 'Priority' },
            { label: 'Status' },
            { label: 'Due Bucket' },
            { label: 'Due Date' },
          ]}
          rows={rows.map((t) => [
            <span key="n" className="font-semibold">{t.name}</span>,
            t.accountable || '—',
            <StatusTag key="p" label={t.priority} tone={priorityTone(t.priority)} />,
            <StatusTag key="s" label={t.status} tone={statusTone(t.status)} />,
            <StatusTag
              key="b"
              label={t.bucket}
              tone={t.bucket === 'Overdue' ? 'bad' : t.bucket.includes('Due') ? 'warn' : 'neutral'}
            />,
            t.due?.slice(0, 10) || '—',
          ])}
        />
      </Panel>
    </div>
  );
}
