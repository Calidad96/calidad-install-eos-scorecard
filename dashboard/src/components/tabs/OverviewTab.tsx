'use client';

import type { ScorecardData } from '@/lib/types';
import { getTab, type TabId } from '@/lib/navigation';
import { KpiCard } from '../KpiCard';
import { Panel, PanelGrid } from '../Panel';
import { StatusTag, statusTone } from '../StatusTag';
import { ScoreGauge } from '../ScoreGauge';
import { formatWeekLabel } from '@/lib/week-range';
import { AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';

const BOARD_TABS: { tab: TabId; metric: (d: ScorecardData) => { value: string | number; meta: string; accent: 'royal' | 'green' | 'gold' | 'amber' | 'red' } }[] = [
  {
    tab: 'accountability',
    metric: (d) => ({
      value: d.summary.accountabilityTotal,
      meta: `${d.summary.accountabilityDone} done / reviewed`,
      accent: 'royal',
    }),
  },
  {
    tab: 'weekly-kpis',
    metric: (d) => ({
      value: d.summary.kpiTotal,
      meta: `${d.summary.kpiGreen} on track · ${d.summary.kpiRed} off`,
      accent: 'green',
    }),
  },
  {
    tab: 'rocks',
    metric: (d) => ({
      value: d.summary.rocksTotal,
      meta: `${d.summary.rocksInProgress} in progress`,
      accent: 'gold',
    }),
  },
  {
    tab: 'todos',
    metric: (d) => ({
      value: d.summary.todosOpen,
      meta: `${d.summary.todosOverdue} overdue`,
      accent: d.summary.todosOverdue > 0 ? 'red' : 'amber',
    }),
  },
  {
    tab: 'capa',
    metric: (d) => ({
      value: d.summary.capaOpen,
      meta: 'open IDS items',
      accent: 'red',
    }),
  },
  {
    tab: 'sops',
    metric: (d) => ({
      value: d.summary.sopsTotal,
      meta: 'SOPs tracked',
      accent: 'royal',
    }),
  },
];

export function OverviewTab({
  data,
  onNavigate,
  weekFilter = 'current',
}: {
  data: ScorecardData;
  onNavigate: (tab: TabId) => void;
  weekFilter?: string;
}) {
  const s = data.summary;

  return (
    <div className="space-y-6">
      {weekFilter !== 'current' && (
        <p className="install-context-banner">
          Weekly KPI cards reflect <strong>{formatWeekLabel(weekFilter)}</strong>. Other boards show
          the latest hub snapshot.
        </p>
      )}
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <Panel title="Department Health" subtitle="Composite score across all synced EOS boards" accent="gold">
          <div className="flex flex-wrap items-center gap-8">
            <ScoreGauge value={data.healthScore} size={120} />
            <div className="min-w-0 flex-1 space-y-3">
              {data.alerts.map((a, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-[13px] ${
                    a.tone === 'good'
                      ? 'border-[var(--live-border)] bg-[var(--live-bg)] text-[var(--green)]'
                      : a.tone === 'bad'
                        ? 'border-[rgba(255,107,107,0.25)] bg-[var(--status-bad-bg)] text-[var(--red)]'
                        : 'border-[rgba(243,177,78,0.25)] bg-[var(--status-warn-bg)] text-[var(--amber)]'
                  }`}
                >
                  {a.tone === 'good' ? (
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                  ) : (
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  )}
                  <span>{a.message}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <KpiCard
          label="Health Score"
          value=""
          gauge={data.healthScore}
          meta="Install EOS readiness"
          accent="gold"
        />
      </div>

      <SectionBoardCards data={data} onNavigate={onNavigate} />

      <PanelGrid>
        <Panel title="Quick Stats" accent="royal">
          <div className="grid grid-cols-2 gap-3">
            <KpiCard label="Open To-Dos" value={s.todosOpen} meta={`${s.todosOverdue} overdue`} accent={s.todosOverdue ? 'red' : 'amber'} />
            <KpiCard label="KPIs On Track" value={s.kpiGreen} meta={`of ${s.kpiTotal} total`} accent="green" />
            <KpiCard label="Rocks Active" value={s.rocksInProgress} meta={`${s.rocksNotStarted} not started`} accent="gold" />
            <KpiCard label="Open CAPA" value={s.capaOpen} accent="red" />
          </div>
        </Panel>

        <Panel title="Accountability Pipeline" accent="royal">
          <div className="flex flex-wrap gap-2">
            {Object.entries(data.accountability.byStatus).map(([status, count]) => (
              <StatusTag key={status} label={`${status}: ${count}`} tone={statusTone(status)} />
            ))}
          </div>
          <button
            type="button"
            onClick={() => onNavigate('accountability')}
            className="mt-4 flex items-center gap-1 text-[12px] font-semibold text-[var(--royal-light)] hover:underline"
          >
            View all charts <ChevronRight size={14} />
          </button>
        </Panel>
      </PanelGrid>
    </div>
  );
}

function SectionBoardCards({
  data,
  onNavigate,
}: {
  data: ScorecardData;
  onNavigate: (tab: TabId) => void;
}) {
  return (
    <div>
      <h3 className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--muted)]">
        Synced EOS Boards
      </h3>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {BOARD_TABS.map(({ tab, metric }) => {
          const meta = getTab(tab);
          const m = metric(data);
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onNavigate(tab)}
              className="board-nav-card group text-left"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-md bg-[var(--hover-row)] px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-[var(--gold)]">
                  {meta.boardCode}
                </span>
                <ChevronRight
                  size={16}
                  className="text-[var(--muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--gold)]"
                />
              </div>
              <p className="font-display mt-2 text-[15px] font-bold text-[var(--ink)]">{meta.shortLabel}</p>
              <p className="mt-0.5 line-clamp-1 text-[11px] text-[var(--muted)]">{meta.mondayBoard}</p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-[26px] font-extrabold tabular-nums text-[var(--ink)]">
                  {m.value}
                </span>
                <span className="text-[11px] text-[var(--muted)]">{m.meta}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
