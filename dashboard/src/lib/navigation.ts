export type TabId =
  | 'overview'
  | 'accountability'
  | 'weekly-kpis'
  | 'rocks'
  | 'todos'
  | 'capa'
  | 'sops'
  | 'sync-log';

export type TabMeta = {
  id: TabId;
  label: string;
  shortLabel: string;
  boardCode: string;
  mondayBoard: string;
  accent: 'royal' | 'green' | 'gold' | 'amber' | 'red' | 'purple';
  countKey?: keyof TabCounts;
  group: 'command' | 'boards' | 'system';
  subtitle: string;
};

export type TabCounts = {
  accountability: number;
  kpis: number;
  rocks: number;
  todos: number;
  capa: number;
  sops: number;
};

export const TABS: TabMeta[] = [
  {
    id: 'overview',
    label: 'Command Center',
    shortLabel: 'Overview',
    boardCode: '—',
    mondayBoard: 'All boards',
    accent: 'gold',
    group: 'command',
    subtitle: 'Install department health at a glance',
  },
  {
    id: 'accountability',
    label: 'Accountability Chart',
    shortLabel: 'Accountability',
    boardCode: 'EOS-1',
    mondayBoard: 'Install Accountability Chart',
    accent: 'royal',
    countKey: 'accountability',
    group: 'boards',
    subtitle: 'People, seats, job descriptions, and chart completion',
  },
  {
    id: 'weekly-kpis',
    label: 'Weekly Scorecard',
    shortLabel: 'Weekly KPIs',
    boardCode: 'EOS-2',
    mondayBoard: 'Install Weekly Scorecard',
    accent: 'green',
    countKey: 'kpis',
    group: 'boards',
    subtitle: 'Install KPIs tracked weekly — on track vs off track',
  },
  {
    id: 'rocks',
    label: 'Rocks',
    shortLabel: 'Rocks',
    boardCode: 'EOS-3',
    mondayBoard: 'Install Rocks',
    accent: 'gold',
    countKey: 'rocks',
    group: 'boards',
    subtitle: 'Quarterly department goals and milestone progress',
  },
  {
    id: 'todos',
    label: 'To-Dos',
    shortLabel: 'To-Dos',
    boardCode: 'EOS-4',
    mondayBoard: 'Install To-Dos',
    accent: 'amber',
    countKey: 'todos',
    group: 'boards',
    subtitle: 'Open action items, priorities, and due-date buckets',
  },
  {
    id: 'capa',
    label: 'CAPA / IDS',
    shortLabel: 'CAPA',
    boardCode: 'EOS-5',
    mondayBoard: 'Install CAPA/IDS',
    accent: 'red',
    countKey: 'capa',
    group: 'boards',
    subtitle: 'Problems, issues, and IDS pipeline (Kappa)',
  },
  {
    id: 'sops',
    label: 'SOP Manager',
    shortLabel: 'SOPs',
    boardCode: 'EOS-6',
    mondayBoard: 'Install SOP Manager',
    accent: 'royal',
    countKey: 'sops',
    group: 'boards',
    subtitle: 'Standard operating procedures — status and rollout dates',
  },
  {
    id: 'sync-log',
    label: 'Sync & Data',
    shortLabel: 'Sync Log',
    boardCode: 'HUB',
    mondayBoard: '[SYNC] Install hub boards',
    accent: 'royal',
    group: 'system',
    subtitle: 'Auto-sync history and hub board registry',
  },
];

export function getTab(id: TabId): TabMeta {
  return TABS.find((t) => t.id === id) ?? TABS[0];
}

export const NAV_GROUPS = [
  { label: 'Command', tabs: ['overview'] as TabId[] },
  {
    label: 'EOS Boards (Synced)',
    tabs: ['accountability', 'weekly-kpis', 'rocks', 'todos', 'capa', 'sops'] as TabId[],
  },
  { label: 'System', tabs: ['sync-log'] as TabId[] },
];
