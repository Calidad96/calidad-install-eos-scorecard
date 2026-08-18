import { fetchBoardItems, parseItem } from './monday';
import { CAPA_OPEN_IDS, DEFAULT_DEPARTMENT, DONE_STATUSES, HUB_BOARDS } from './config';
import { computeScore } from './metrics';
import type { ScorecardData, WeeklyKpi } from './types';

function isOpenStatus(status: string) {
  const s = status.toLowerCase();
  return !DONE_STATUSES.some((d) => s.includes(d));
}

function isCapaOpen(idsStatus: string) {
  const s = idsStatus.toLowerCase();
  if (!s || s === 'undefined') return true;
  return CAPA_OPEN_IDS.some((x) => s.includes(x)) || !DONE_STATUSES.some((d) => s.includes(d));
}

function offTrackTone(offTrack: string): 'green' | 'yellow' | 'red' {
  const s = offTrack.toLowerCase();
  if (!s || s.includes('not reported')) return 'yellow';
  if (s.includes('on track') || s.includes('good')) return 'green';
  if (s.includes('off track') || s.includes('bad')) return 'red';
  return 'yellow';
}

function buildWeeklyKpis(
  rows: { fields: ReturnType<typeof parseItem>; itemName: string }[]
): WeeklyKpi[] {
  const byKey = new Map<string, WeeklyKpi>();

  for (const { fields: f } of rows) {
    const sourceId = String(f['Source Item ID'] ?? '');
    const name = String(f['KPI Name'] ?? '');
    if (!sourceId || !name) continue;

    let kpi = byKey.get(sourceId);
    if (!kpi) {
      kpi = {
        key: sourceId,
        name,
        category: String(f.Category ?? ''),
        target: typeof f.Target === 'number' ? f.Target : null,
        goalDirection: String(f['Goal Direction'] ?? ''),
        offTrack: String(f['Off Track'] ?? 'Not Reported'),
        latestWeek: null,
        latestValue: null,
        score: null,
        weeklyValues: [],
      };
      byKey.set(sourceId, kpi);
    }

    const week = String(f.Week ?? '');
    if (week === 'CURRENT') {
      kpi.target = typeof f.Target === 'number' ? f.Target : kpi.target;
      kpi.offTrack = String(f['Off Track'] ?? kpi.offTrack);
      kpi.goalDirection = String(f['Goal Direction'] ?? kpi.goalDirection);
      kpi.category = String(f.Category ?? kpi.category);
      if (typeof f['KPI Score'] === 'number') kpi.score = f['KPI Score'];
      continue;
    }

    const val = typeof f['Actual Value'] === 'number' ? f['Actual Value'] : null;
    if (week && val != null && week !== 'CURRENT') {
      kpi.weeklyValues.push({ week, value: val });
    }
  }

  return [...byKey.values()].map((k) => {
    k.weeklyValues.sort((a, b) => a.week.localeCompare(b.week));
    const latest = k.weeklyValues.at(-1);
    if (latest) {
      k.latestWeek = latest.week;
      k.latestValue = latest.value;
      k.score =
        k.score ??
        computeScore(latest.value, k.target, k.goalDirection);
    }
    return k;
  });
}

function countBy<T>(items: T[], fn: (item: T) => string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const item of items) {
    const key = fn(item) || 'Unknown';
    out[key] = (out[key] ?? 0) + 1;
  }
  return out;
}

function newestSyncLog(rows: ReturnType<typeof parseItem>[]): string | null {
  const finished = rows
    .map((f) => String(f.Finished ?? ''))
    .filter(Boolean)
    .sort()
    .at(-1);
  return finished ?? null;
}

export async function aggregateScorecard(): Promise<ScorecardData> {
  const [accountRaw, kpiRaw, rocksRaw, todosRaw, capaRaw, sopsRaw, syncRaw] =
    await Promise.all([
      fetchBoardItems(HUB_BOARDS.accountability),
      fetchBoardItems(HUB_BOARDS.weeklyKpiHistory),
      fetchBoardItems(HUB_BOARDS.rocks),
      fetchBoardItems(HUB_BOARDS.todos),
      fetchBoardItems(HUB_BOARDS.capa),
      fetchBoardItems(HUB_BOARDS.sops),
      fetchBoardItems(HUB_BOARDS.syncLog),
    ]);

  const accountability = accountRaw.map((i) => parseItem(i));
  const accItems = accountability.map((f) => ({
    name: String(f.Name ?? f._name ?? ''),
    position: String(f.Position ?? ''),
    status: String(f.Status ?? 'New'),
    hasChart: String(f['Has Chart Doc'] ?? 'No'),
  }));
  const accByStatus = countBy(accItems, (i) => i.status);
  const accDone = accItems.filter((i) =>
    /done|finalized|reviewed|provided/i.test(i.status)
  ).length;

  const weeklyKpis = buildWeeklyKpis(kpiRaw.map((i) => ({ fields: parseItem(i), itemName: i.name })));
  let kpiGreen = 0;
  let kpiYellow = 0;
  let kpiRed = 0;
  for (const k of weeklyKpis) {
    const tone = offTrackTone(k.offTrack);
    if (tone === 'green') kpiGreen++;
    else if (tone === 'red') kpiRed++;
    else kpiYellow++;
  }

  const rocksFields = rocksRaw.map((i) => parseItem(i));
  const rockItems = rocksFields.map((f) => ({
    name: String(f['Rock Name'] ?? f._name ?? ''),
    quarter: String(f.Quarter ?? ''),
    owner: String(f.Owner ?? ''),
    status: String(f['Rock Status'] ?? ''),
    subitems: typeof f['Subitem Count'] === 'number' ? f['Subitem Count'] : 0,
  }));
  const rocksNotStarted = rockItems.filter((r) => r.status === 'Not Started').length;
  const rocksInProgress = rockItems.filter((r) => r.status === 'In Progress').length;

  const todosFields = todosRaw.map((i) => parseItem(i));
  const mapTodo = (f: ReturnType<typeof parseItem>) => ({
    name: String(f._name ?? ''),
    accountable: String(f.Accountable ?? ''),
    status: String(f.Status ?? ''),
    priority: String(f.Priority ?? ''),
    bucket: String(f['Due Bucket'] ?? ''),
    due: String(f['Due Date'] ?? ''),
  });
  const allTodoRows = todosFields.map(mapTodo);
  const openTodos = todosFields.filter((f) => isOpenStatus(String(f.Status ?? '')));
  const todoOpenRows = openTodos.map(mapTodo);
  const todosByStatus = countBy(todosFields, (f) => String(f.Status ?? ''));
  const todosByBucket = countBy(openTodos, (f) => String(f['Due Bucket'] ?? 'Later / No Date'));
  const todosOverdue = openTodos.filter((f) => String(f['Due Bucket'] ?? '') === 'Overdue').length;
  const todosDone = todosFields.filter((f) => !isOpenStatus(String(f.Status ?? ''))).length;

  const capaFields = capaRaw.map((i) => parseItem(i));
  const openCapa = capaFields.filter((f) => isCapaOpen(String(f['IDS Status'] ?? '')));
  const capaItems = openCapa.map((f) => ({
    name: String(f._name ?? ''),
    owner: String(f.Owner ?? ''),
    issueType: String(f['Issue Type'] ?? ''),
    priority: String(f.Priority ?? ''),
    idsStatus: String(f['IDS Status'] ?? ''),
  }));
  const capaByIds = countBy(capaFields, (f) => String(f['IDS Status'] ?? 'Undefined'));

  const sopsFields = sopsRaw.map((i) => parseItem(i));
  const sopItems = sopsFields.map((f) => ({
    name: String(f['SOP Name'] ?? f._name ?? ''),
    status: String(f.Status ?? ''),
    priority: String(f.Priority ?? ''),
    owner: String(f.Owner ?? ''),
    targetDate: String(f['Rollout Target Date'] ?? ''),
  }));
  const sopsByStatus = countBy(sopItems, (i) => i.status);

  const syncFields = syncRaw.map((i) => parseItem(i));
  const syncLog = syncRaw
    .map((item) => {
      const f = parseItem(item);
      return {
        runId: String(f['Run ID'] ?? ''),
        started: String(f.Started ?? ''),
        finished: String(f.Finished ?? ''),
        status: String(f.Status ?? ''),
        boardsPulled: String(f['Boards Pulled'] ?? ''),
        itemsWritten: typeof f['Items Written'] === 'number' ? f['Items Written'] : 0,
        errors: String(f.Errors ?? ''),
      };
    })
    .sort((a, b) => (b.finished || b.started).localeCompare(a.finished || a.started))
    .slice(0, 20);

  const accPct = accItems.length ? accDone / accItems.length : 1;
  const kpiPct = weeklyKpis.length ? kpiGreen / weeklyKpis.length : 1;
  const rocksPct = rockItems.length ? rocksInProgress / rockItems.length : 0;
  const todoPct = openTodos.length ? 1 - todosOverdue / openTodos.length : 1;
  const capaPct = capaFields.length ? 1 - openCapa.length / capaFields.length : 1;
  const healthScore =
    Math.round(((accPct + kpiPct + rocksPct + todoPct + capaPct) / 5) * 100) / 20;

  const alerts: ScorecardData['alerts'] = [];
  if (todosOverdue > 0) alerts.push({ tone: 'bad', message: `${todosOverdue} to-do(s) overdue` });
  if (kpiRed > 0) alerts.push({ tone: 'bad', message: `${kpiRed} KPI(s) off track` });
  if (rocksNotStarted > 0) alerts.push({ tone: 'warn', message: `${rocksNotStarted} rock(s) not started` });
  if (kpiYellow > 0) alerts.push({ tone: 'warn', message: `${kpiYellow} KPI(s) not reported / pending` });
  if (accDone < accItems.length) {
    alerts.push({ tone: 'warn', message: `${accItems.length - accDone} accountability chart(s) not finalized` });
  }
  if (alerts.length === 0) alerts.push({ tone: 'good', message: 'All synced boards look healthy' });

  return {
    department: DEFAULT_DEPARTMENT,
    generatedAt: new Date().toISOString(),
    lastSync: newestSyncLog(syncFields),
    healthScore,
    alerts,
    syncLog,
    summary: {
      accountabilityTotal: accItems.length,
      accountabilityDone: accDone,
      kpiGreen,
      kpiYellow,
      kpiRed,
      kpiTotal: weeklyKpis.length,
      rocksTotal: rockItems.length,
      rocksNotStarted,
      rocksInProgress,
      todosTotal: todosFields.length,
      todosOpen: openTodos.length,
      todosOverdue,
      todosDone,
      capaOpen: openCapa.length,
      sopsTotal: sopItems.length,
      sopsByStatus,
    },
    accountability: { byStatus: accByStatus, items: accItems },
    weeklyKpis,
    rocks: {
      total: rockItems.length,
      notStarted: rocksNotStarted,
      inProgress: rocksInProgress,
      items: rockItems,
    },
    todos: {
      byStatus: todosByStatus,
      byBucket: todosByBucket,
      openItems: todoOpenRows,
      allItems: allTodoRows,
    },
    capa: {
      open: openCapa.length,
      byIdsStatus: capaByIds,
      items: capaItems,
    },
    sops: {
      total: sopItems.length,
      byStatus: sopsByStatus,
      items: sopItems,
    },
  };
}

export { offTrackTone };
