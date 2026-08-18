'use client';

import type { ScorecardData } from '@/lib/types';
import { Panel, PanelGrid } from '../Panel';
import { DataTable } from '../DataTable';
import { StatusTag } from '../StatusTag';
import { KpiCard } from '../KpiCard';
import { SyncControls } from '../SyncControls';
import registry from '../../../data/hub-registry.json';
const HUB_BOARD_LABELS: Record<string, string> = {
  accountability: 'EOS-1 Accountability Snapshot',
  weeklyKpiHistory: 'EOS-2 Weekly KPI History',
  rocks: 'EOS-3 Rocks Snapshot',
  todos: 'EOS-4 To-Dos Snapshot',
  capa: 'EOS-5 CAPA Snapshot',
  sops: 'EOS-6 SOPs Snapshot',
  syncLog: 'Sync Log',
};

export function SyncLogTab({
  data,
  onSyncComplete,
}: {
  data: ScorecardData;
  onSyncComplete?: () => void;
}) {
  const lastRun = data.syncLog[0];
  const successCount = data.syncLog.filter((r) => r.status === 'Success').length;

  return (
    <div className="space-y-6">
      <div className="kpi-grid lg:grid-cols-3">
        <KpiCard
          label="Last Run Status"
          value={lastRun?.status ?? '—'}
          accent={lastRun?.status === 'Success' ? 'green' : 'amber'}
        />
        <KpiCard label="Items (Last Run)" value={lastRun?.itemsWritten ?? '—'} accent="royal" />
        <KpiCard
          label="Successful Runs"
          value={`${successCount}/${data.syncLog.length}`}
          meta="in recent history"
          accent="gold"
        />
      </div>

      <SyncControls onSyncComplete={onSyncComplete} />

      <PanelGrid>
        <Panel title="Hub Board Registry" subtitle="Monday [SYNC] Install boards — do not edit manually" accent="royal">
          <div className="space-y-2">
            {Object.entries(registry.boards).map(([key, board]) => (
              <div
                key={key}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)]/50 px-3 py-2.5"
              >
                <div>
                  <p className="text-[12px] font-semibold text-[var(--ink)]">
                    {HUB_BOARD_LABELS[key] ?? board.name}
                  </p>
                  <p className="text-[10px] text-[var(--muted)]">{board.name}</p>
                </div>
                <code className="rounded bg-[var(--hover-row)] px-2 py-1 text-[10px] text-[var(--gold)]">
                  {board.id}
                </code>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Sync Architecture" accent="gold">
          <ul className="space-y-2 text-[13px] text-[var(--muted)]">
            <li>Source: 6 Install EOS boards (read-only)</li>
            <li>Hub: workspace 16379553 · [SYNC] Install *</li>
            <li>Schedule: GitHub Actions daily + manual refresh</li>
            <li>Dashboard reads hub only — never source boards</li>
          </ul>
        </Panel>
      </PanelGrid>

      <Panel title="Sync Run History" accent="green">
        <DataTable
          maxHeight={480}
          headers={[
            { label: 'Finished' },
            { label: 'Status' },
            { label: 'Items', align: 'right' },
            { label: 'Boards Pulled' },
            { label: 'Errors' },
          ]}
          rows={data.syncLog.map((run) => [
            run.finished?.slice(0, 10) || run.started?.slice(0, 10) || '—',
            <StatusTag
              key="s"
              label={run.status}
              tone={run.status === 'Success' ? 'good' : run.status === 'Partial' ? 'warn' : 'bad'}
            />,
            run.itemsWritten,
            <span key="b" className="text-[11px] text-[var(--muted)]">{run.boardsPulled || '—'}</span>,
            run.errors ? (
              <span className="text-[11px] text-[var(--red)]">{run.errors.slice(0, 80)}</span>
            ) : (
              '—'
            ),
          ])}
        />
      </Panel>
    </div>
  );
}
