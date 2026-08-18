import { NextResponse } from 'next/server';
import {
  GITHUB_ACTIONS_SYNC_URL,
  getLatestGithubSyncRun,
  isGithubSyncRunning,
  triggerGithubSync,
} from '@/lib/github-sync';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [githubRunning, githubRun] = await Promise.all([
      isGithubSyncRunning(),
      getLatestGithubSyncRun(),
    ]);

    return NextResponse.json({
      githubRunning,
      githubRun,
      syncEngine: 'github-actions',
      githubActionsUrl: GITHUB_ACTIONS_SYNC_URL,
      githubTokenConfigured: Boolean(process.env.GITHUB_SYNC_TOKEN),
      schedule: 'Daily ~6:00 AM Pacific (13:00 UTC) + manual',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Status check failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const result = await triggerGithubSync();
    return NextResponse.json({
      ok: result.triggered,
      started: result.triggered,
      message: result.message,
      githubActionsUrl: GITHUB_ACTIONS_SYNC_URL,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sync failed';
    return NextResponse.json({ error: message, githubActionsUrl: GITHUB_ACTIONS_SYNC_URL }, { status: 500 });
  }
}
