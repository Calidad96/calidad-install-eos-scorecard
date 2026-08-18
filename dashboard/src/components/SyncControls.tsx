'use client';

import { useCallback, useEffect, useState } from 'react';
import { ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { Panel } from './Panel';

type SyncStatus = {
  githubRunning: boolean;
  githubRun: {
    status: string;
    conclusion: string | null;
    url: string | null;
    startedAt: string | null;
  } | null;
  githubActionsUrl: string;
  githubTokenConfigured: boolean;
  schedule?: string;
};

export function SyncControls({ onSyncComplete }: { onSyncComplete?: () => void }) {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const fetchStatus = useCallback(async () => {
    const res = await fetch('/api/sync', { cache: 'no-store' });
    const json = await res.json();
    if (res.ok) setStatus(json);
  }, []);

  useEffect(() => {
    fetchStatus();
    const id = setInterval(fetchStatus, syncing ? 5000 : 20000);
    return () => clearInterval(id);
  }, [fetchStatus, syncing]);

  useEffect(() => {
    if (!syncing || status?.githubRunning) return;
    if (status?.githubRun?.conclusion === 'success') {
      setSyncing(false);
      setMessage('Sync completed successfully. Refreshing dashboard…');
      onSyncComplete?.();
    } else if (status?.githubRun?.conclusion === 'failure') {
      setSyncing(false);
      setMessage('Last sync failed. Open GitHub Actions for details.');
    }
  }, [syncing, status, onSyncComplete]);

  const runSync = async () => {
    if (!status?.githubTokenConfigured) {
      if (status?.githubActionsUrl) {
        window.open(status.githubActionsUrl, '_blank', 'noopener,noreferrer');
        setMessage('GitHub Actions opened — click Run workflow to start a manual sync.');
      }
      return;
    }

    setMessage(null);
    setSyncing(true);
    try {
      const res = await fetch('/api/sync', { method: 'POST' });
      const json = await res.json();
      if (!res.ok || !json.started) {
        throw new Error(String(json.message ?? json.error ?? 'Could not start sync'));
      }
      setMessage(json.message);
      await fetchStatus();
    } catch (e) {
      setSyncing(false);
      setMessage(e instanceof Error ? e.message : 'Sync failed');
    }
  };

  const running = syncing || status?.githubRunning;
  const canTriggerFromDashboard = Boolean(status?.githubTokenConfigured);

  return (
    <Panel title="Manual Sync" subtitle="Pull latest data from Monday source boards into hub boards" accent="green">
      <p className="mb-4 text-[13px] leading-relaxed text-[var(--muted)]">
        Full sync runs on GitHub Actions (all 6 Install EOS boards →{' '}
        <strong className="text-[var(--ink)]">[SYNC] Install</strong> hub). Scheduled daily; use the
        button below for an immediate update.
      </p>

      <div className="mb-4 flex flex-wrap gap-2 text-[12px] text-[var(--muted)]">
        <span className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5">
          {status?.schedule ?? 'Daily ~6:00 AM Pacific + manual'}
        </span>
      </div>

      {message && (
        <p
          className={`mb-4 rounded-xl border px-3 py-2.5 text-[13px] ${
            message.includes('failed')
              ? 'border-[rgba(255,107,107,0.3)] bg-[var(--status-bad-bg)] text-[var(--red)]'
              : 'border-[var(--live-border)] bg-[var(--live-bg)] text-[var(--green)]'
          }`}
        >
          {message}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={runSync}
          disabled={running}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--royal)] px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:brightness-105 disabled:opacity-50"
        >
          {running ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          {running
            ? 'Syncing on GitHub…'
            : canTriggerFromDashboard
              ? 'Sync now'
              : 'Run manual sync'}
        </button>

        {status?.githubActionsUrl && (
          <a
            href={status.githubActionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-[12px] font-semibold text-[var(--muted)] transition hover:border-[var(--border-light)] hover:text-[var(--ink)]"
          >
            Open GitHub Actions <ExternalLink size={14} />
          </a>
        )}
      </div>

      {!canTriggerFromDashboard && (
        <p className="mt-3 text-[11px] leading-relaxed text-[var(--muted)]">
          Click <strong className="text-[var(--ink)]">Run manual sync</strong> to open GitHub Actions,
          then choose <strong className="text-[var(--ink)]">Run workflow</strong>.
        </p>
      )}

      {status?.githubRun?.url && (
        <p className="mt-3 text-[11px] text-[var(--muted)]">
          Last run: {status.githubRun.conclusion ?? status.githubRun.status}
          {status.githubRun.startedAt ? ` · ${new Date(status.githubRun.startedAt).toLocaleString()}` : ''}
        </p>
      )}
    </Panel>
  );
}
