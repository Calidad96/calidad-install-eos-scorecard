export interface HubItem {
  id: string;
  name: string;
  column_values?: { column?: { title?: string }; text?: string }[];
}

export interface WeeklyKpi {
  key: string;
  name: string;
  category: string;
  target: number | null;
  goalDirection: string;
  offTrack: string;
  latestWeek: string | null;
  latestValue: number | null;
  score: number | null;
  weeklyValues: { week: string; value: number }[];
}

export interface SyncLogEntry {
  runId: string;
  started: string;
  finished: string;
  status: string;
  boardsPulled: string;
  itemsWritten: number;
  errors: string;
}

export interface ScorecardData {
  department: string;
  generatedAt: string;
  lastSync: string | null;
  healthScore: number | null;
  alerts: { tone: 'good' | 'warn' | 'bad'; message: string }[];
  syncLog: SyncLogEntry[];
  summary: {
    accountabilityTotal: number;
    accountabilityDone: number;
    kpiGreen: number;
    kpiYellow: number;
    kpiRed: number;
    kpiTotal: number;
    rocksTotal: number;
    rocksNotStarted: number;
    rocksInProgress: number;
    todosTotal: number;
    todosOpen: number;
    todosOverdue: number;
    todosDone: number;
    capaOpen: number;
    sopsTotal: number;
    sopsByStatus: Record<string, number>;
  };
  accountability: {
    byStatus: Record<string, number>;
    items: { name: string; position: string; status: string; hasChart: string }[];
  };
  weeklyKpis: WeeklyKpi[];
  rocks: {
    total: number;
    notStarted: number;
    inProgress: number;
    items: { name: string; quarter: string; owner: string; status: string; subitems: number }[];
  };
  todos: {
    byStatus: Record<string, number>;
    byBucket: Record<string, number>;
    openItems: { name: string; accountable: string; status: string; priority: string; bucket: string; due: string }[];
    allItems: { name: string; accountable: string; status: string; priority: string; bucket: string; due: string }[];
  };
  capa: {
    open: number;
    byIdsStatus: Record<string, number>;
    items: { name: string; owner: string; issueType: string; priority: string; idsStatus: string }[];
  };
  sops: {
    total: number;
    byStatus: Record<string, number>;
    items: { name: string; status: string; priority: string; owner: string; targetDate: string }[];
  };
}
