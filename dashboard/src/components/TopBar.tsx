'use client';

import { Circle, Loader2, Moon, Sun } from 'lucide-react';
import { getTab, type TabId } from '@/lib/navigation';
import { weekFilterAppliesToTab } from '@/lib/week-range';
import { useTheme } from './ThemeProvider';
import { WeekRangePicker } from './WeekRangePicker';

function formatTime(iso: string | null) {
  if (!iso) return '—';
  try {
    const d = new Date(iso.includes('T') ? iso : `${iso}T12:00:00`);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function TopBar({
  tab,
  loading,
  lastSync,
  loadedAt,
  healthScore,
  availableWeeks,
  weekFilter,
  onWeekFilterChange,
}: {
  tab: TabId;
  loading: boolean;
  lastSync: string | null;
  loadedAt: string;
  healthScore: number | null;
  availableWeeks: string[];
  weekFilter: string;
  onWeekFilterChange: (w: string) => void;
}) {
  const { theme, toggleTheme } = useTheme();
  const meta = getTab(tab);
  const showWeekPicker = weekFilterAppliesToTab(tab);

  return (
    <header className="app-header install-header sticky top-0 z-30">
      <div className="app-header-main px-6 py-5 lg:px-8">
        <div className="flex items-center justify-between gap-6">
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              {meta.boardCode !== '—' && meta.boardCode !== 'HUB' && (
                <span className="install-board-badge">{meta.boardCode}</span>
              )}
              {meta.boardCode === 'HUB' && (
                <span className="install-board-badge install-board-badge-hub">HUB</span>
              )}
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                {meta.mondayBoard}
              </span>
            </div>
            <h1 className="app-header-title font-display">{meta.label}</h1>
            <p className="app-header-subtitle">{meta.subtitle}</p>
          </div>

          <div className="app-header-status">
            <span className="status-pill status-pill-live">
              <Circle size={7} className="fill-[var(--green)] text-[var(--green)]" strokeWidth={0} />
              <span>Live</span>
            </span>
            {healthScore != null && tab === 'overview' && (
              <>
                <span className="header-status-divider" aria-hidden />
                <span className="status-pill">
                  <span className="status-pill-label">Health</span>
                  <span
                    className="status-pill-value font-display font-bold tabular-nums"
                    style={{
                      color:
                        healthScore >= 4
                          ? 'var(--green)'
                          : healthScore >= 2.5
                            ? 'var(--amber)'
                            : 'var(--red)',
                    }}
                  >
                    {healthScore.toFixed(1)}/5
                  </span>
                </span>
              </>
            )}
            <span className="header-status-divider" aria-hidden />
            <span className="status-pill status-pill-time">
              {loading && <Loader2 size={12} className="animate-spin text-[var(--muted)]" />}
              <span className="status-pill-label">Loaded</span>
              <span className="status-pill-value tabular-nums">{formatTime(loadedAt)}</span>
            </span>
            {lastSync && (
              <>
                <span className="header-status-divider hidden md:block" aria-hidden />
                <span className="status-pill hidden md:inline-flex">
                  <span className="status-pill-label">Hub sync</span>
                  <span className="status-pill-value tabular-nums">{formatTime(lastSync)}</span>
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="app-header-toolbar px-6 pb-4 lg:px-8">
        <div className="header-toolbar-panel">
          {showWeekPicker ? (
            <WeekRangePicker
              weeks={availableWeeks}
              value={weekFilter}
              onChange={onWeekFilterChange}
              disabled={loading}
            />
          ) : (
            <p className="text-[12px] text-[var(--muted)]">
              <strong className="font-semibold text-[var(--ink)]">Current snapshot</strong>
              {' · '}
              EOS-1, 3–6 boards refresh on each hub sync (no date range needed)
            </p>
          )}
          <div className="header-toolbar-spacer" />
          <button
            type="button"
            onClick={toggleTheme}
            className="header-icon-btn"
            aria-label={theme === 'dark' ? 'Day mode' : 'Night mode'}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>
    </header>
  );
}
