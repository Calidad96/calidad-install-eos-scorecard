'use client';

import { BrandLogo } from './BrandLogo';
import {
  MEETINGS_PLACEHOLDER,
  NAV_GROUPS,
  getTab,
  type TabCounts,
  type TabId,
} from '@/lib/navigation';
import {
  AlertTriangle,
  BookOpen,
  CalendarClock,
  CheckSquare,
  Database,
  LayoutDashboard,
  LogOut,
  Mountain,
  RefreshCw,
  Target,
  Users,
} from 'lucide-react';
import type { ReactNode } from 'react';

const TAB_ICONS: Record<TabId, ReactNode> = {
  overview: <LayoutDashboard size={16} />,
  accountability: <Users size={16} />,
  'weekly-kpis': <Target size={16} />,
  rocks: <Mountain size={16} />,
  todos: <CheckSquare size={16} />,
  capa: <AlertTriangle size={16} />,
  sops: <BookOpen size={16} />,
  'sync-log': <Database size={16} />,
};

export function Sidebar({
  active,
  onChange,
  counts,
  onRefresh,
  refreshing,
}: {
  active: TabId;
  onChange: (tab: TabId) => void;
  counts: TabCounts;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  return (
    <aside className="sidebar-premium fixed bottom-0 left-0 top-0 z-20 flex w-[var(--sidebar)] flex-col border-r border-[var(--border)]">
      <div className="border-b border-[var(--border)] px-3 pb-4 pt-5">
        <BrandLogo />
        <div className="mt-4 rounded-xl border border-[var(--border)] bg-gradient-to-br from-[var(--card)] to-[var(--bg-elevated)] p-3.5">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--muted)]">
            Department
          </p>
          <p className="font-display mt-1 text-[15px] font-bold text-[var(--ink)]">Install</p>
          <p className="mt-1 text-[11px] leading-relaxed text-[var(--muted)]">
            Calidad · EOS L10
          </p>
          <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-semibold text-[var(--green)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--green)]" />
            Hub auto-sync
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-3">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="sidebar-nav-group mb-4 last:mb-0">
            <p className="nav-section-label">{group.label}</p>
            <div className="space-y-0.5">
              {group.tabs.map((id) => {
                const tab = getTab(id);
                const isOn = active === id;
                const count = tab.countKey ? counts[tab.countKey] : null;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onChange(id)}
                    className={`relative flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all duration-200 ${
                      isOn
                        ? 'bg-[var(--hover-nav-active)] text-[var(--ink)] shadow-[var(--shadow-card)]'
                        : 'text-[var(--muted)] hover:bg-[var(--hover-nav)] hover:text-[var(--ink)]'
                    }`}
                  >
                    {isOn && (
                      <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r bg-[var(--gold)]" />
                    )}
                    <span className="mt-0.5 w-[18px] shrink-0 opacity-90">{TAB_ICONS[id]}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        {tab.boardCode !== '—' && tab.boardCode !== 'HUB' && (
                          <span className="rounded-md bg-[var(--hover-row)] px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-[var(--gold)]">
                            {tab.boardCode}
                          </span>
                        )}
                        <span className="truncate text-[13px] font-semibold">{tab.shortLabel}</span>
                      </span>
                      {isOn && (
                        <span className="mt-0.5 block truncate text-[10px] font-medium text-[var(--muted)]">
                          {tab.mondayBoard}
                        </span>
                      )}
                    </span>
                    {count != null && count > 0 && (
                      <span
                        className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          isOn
                            ? 'bg-[var(--count-active-bg)] text-[var(--gold)]'
                            : 'bg-[var(--hover-row)] text-[var(--muted)]'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="mt-2 rounded-xl border border-dashed border-[var(--border)] p-3 opacity-60">
          <div className="flex items-center gap-2 text-[var(--muted)]">
            <CalendarClock size={16} />
            <span className="text-[11px] font-semibold">{MEETINGS_PLACEHOLDER.label}</span>
            <span className="rounded bg-[var(--hover-row)] px-1.5 py-0.5 text-[9px] font-bold">
              {MEETINGS_PLACEHOLDER.boardCode}
            </span>
          </div>
          <p className="mt-1.5 text-[10px] leading-relaxed text-[var(--muted)]">
            {MEETINGS_PLACEHOLDER.note}
          </p>
        </div>
      </nav>

      <div className="border-t border-[var(--border)] p-3 space-y-2">
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-[12px] font-semibold text-[var(--muted)] transition hover:border-[var(--border-light)] hover:bg-[var(--hover-row)] hover:text-[var(--ink)] disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing…' : 'Refresh data'}
        </button>
        <button
          type="button"
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/login';
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-[12px] font-semibold text-[var(--muted)] transition hover:border-[var(--border-light)] hover:bg-[var(--hover-row)] hover:text-[var(--ink)]"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
