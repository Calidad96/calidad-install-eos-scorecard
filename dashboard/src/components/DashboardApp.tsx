'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import type { ScorecardData } from '@/lib/types';
import type { TabCounts, TabId } from '@/lib/navigation';
import {
  applyWeekFilter,
  availableWeeks,
  defaultWeekFilter,
} from '@/lib/week-range';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { TabTransition } from './TabTransition';
import { OverviewTab } from './tabs/OverviewTab';
import { AccountabilityTab } from './tabs/AccountabilityTab';
import { WeeklyKpisTab } from './tabs/WeeklyKpisTab';
import { RocksTab } from './tabs/RocksTab';
import { TodosTab } from './tabs/TodosTab';
import { CapaTab } from './tabs/CapaTab';
import { SopsTab } from './tabs/SopsTab';
import { SyncLogTab } from './tabs/SyncLogTab';
import { parseFetchError } from '@/lib/client-api-error';

export function DashboardApp() {
  const [tab, setTab] = useState<TabId>('overview');
  const [data, setData] = useState<ScorecardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorAction, setErrorAction] = useState<'retry' | 'login'>('retry');
  const [loading, setLoading] = useState(true);
  const [weekFilter, setWeekFilter] = useState('current');
  const [weekInitialized, setWeekInitialized] = useState(false);

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/scorecard', { cache: 'no-store' });
      if (!res.ok) {
        const parsed = await parseFetchError(res);
        if (parsed.redirectToLogin) {
          window.location.href = '/login';
          return;
        }
        setErrorAction('retry');
        throw new Error(parsed.message);
      }
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the scorecard. Please try again.');
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible') load(true);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [load]);

  const weeks = useMemo(() => (data ? availableWeeks(data.weeklyKpis) : []), [data]);

  useEffect(() => {
    if (data && !weekInitialized) {
      setWeekFilter(defaultWeekFilter(weeks));
      setWeekInitialized(true);
    }
  }, [data, weeks, weekInitialized]);

  const viewData = useMemo((): ScorecardData | null => {
    if (!data) return null;
    const filteredKpis = applyWeekFilter(data.weeklyKpis, weekFilter);
    return { ...data, weeklyKpis: filteredKpis };
  }, [data, weekFilter]);

  const counts = useMemo<TabCounts>(
    () => ({
      accountability: data?.summary.accountabilityTotal ?? 0,
      kpis: data?.summary.kpiTotal ?? 0,
      rocks: data?.summary.rocksTotal ?? 0,
      todos: data?.summary.todosOpen ?? 0,
      capa: data?.summary.capaOpen ?? 0,
      sops: data?.summary.sopsTotal ?? 0,
    }),
    [data]
  );

  if (error && !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] p-8">
        <div className="card-surface max-w-md p-8 text-center">
          <h2 className="font-display text-lg font-bold text-[var(--ink)]">Unable to load dashboard</h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{error}</p>
          {errorAction === 'login' ? (
            <a
              href="/login"
              className="mt-5 inline-flex rounded-xl bg-[var(--royal)] px-4 py-2.5 text-sm font-semibold text-white"
            >
              Sign in
            </a>
          ) : (
            <button
              type="button"
              onClick={() => load()}
              className="mt-5 rounded-xl bg-[var(--royal)] px-4 py-2.5 text-sm font-semibold text-white"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!data || !viewData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] gap-4">
        <Image
          src="/calidad-logo.png"
          alt="Calidad"
          width={180}
          height={45}
          className="brand-logo-img opacity-90"
          priority
        />
        <div className="install-loader h-10 w-10 rounded-full border-2 border-[var(--border)] border-t-[var(--gold)]" />
        <p className="text-[13px] text-[var(--muted)]">Loading Install EOS scorecard…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Sidebar
        active={tab}
        onChange={setTab}
        counts={counts}
        onRefresh={() => load()}
        refreshing={loading}
      />

      <div className="ml-[var(--sidebar)] min-h-screen">
        <TopBar
          tab={tab}
          loading={loading}
          lastSync={data.lastSync}
          loadedAt={data.generatedAt}
          healthScore={data.healthScore}
          availableWeeks={weeks}
          weekFilter={weekFilter}
          onWeekFilterChange={setWeekFilter}
        />

        <main className="px-6 py-6 lg:px-8 lg:py-8">
          <TabTransition tabKey={`${tab}-${weekFilter}`}>
            {tab === 'overview' && (
              <OverviewTab data={viewData} onNavigate={setTab} weekFilter={weekFilter} />
            )}
            {tab === 'accountability' && <AccountabilityTab data={viewData} />}
            {tab === 'weekly-kpis' && (
              <WeeklyKpisTab data={viewData} weekFilter={weekFilter} />
            )}
            {tab === 'rocks' && <RocksTab data={viewData} />}
            {tab === 'todos' && <TodosTab data={viewData} />}
            {tab === 'capa' && <CapaTab data={viewData} />}
            {tab === 'sops' && <SopsTab data={viewData} />}
            {tab === 'sync-log' && (
              <SyncLogTab data={viewData} onSyncComplete={() => load(true)} />
            )}
          </TabTransition>
        </main>
      </div>
    </div>
  );
}
