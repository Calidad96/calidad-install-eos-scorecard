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
      setMessage('Last GitHub sync failed — open Actions logs for details.');
    }
  }, [syncing, status, onSyncComplete]);

  const runSync = async () => {
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

  return (
    <Panel title="Auto Sync" subtitle="Same pattern as SOC/STOS — GitHub Actions, no Vercel timeout" accent="green">
      <p className="mb-4 text-[13px] leading-relaxed text-[var(--muted)]">
        Pulls all 6 Install EOS boards from Monday into <strong className="text-[var(--ink)]">[SYNC] Install</strong>{' '}
        hub boards. Scheduled daily; use the button below for an immediate update.
      </p>

      <div className="mb-4 flex flex-wrap gap-2 text-[12px] text-[var(--muted)]">
        <span className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5">
          {status?.schedule ?? 'Daily cron + manual'}
        </span>
        <span className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5">
          GitHub token: {status?.githubTokenConfigured ? 'Configured' : 'Not set on Vercel'}
        </span>
      </div>

      {message && (
        <p
          className={`mb-4 rounded-xl border px-3 py-2.5 text-[13px] ${
            message.includes('failed') || message.includes('Add GITHUB')
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
          {running ? 'Syncing on GitHub…' : 'Update data now'}
        </button>

        {status?.githubActionsUrl && (
          <a
            href={status.githubActionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[var(--royal-light)] hover:underline"
          >
            Open GitHub Actions <ExternalLink size={14} />
          </a>
        )}
      </div>

      {status?.githubRun?.url && (
        <p className="mt-3 text-[11px] text-[var(--muted)]">
          Last run: {status.githubRun.conclusion ?? status.githubRun.status}
          {status.githubRun.startedAt ? ` · ${new Date(status.githubRun.startedAt).toLocaleString()}` : ''}
        </p>
      )}
    </Panel>
  );
}
