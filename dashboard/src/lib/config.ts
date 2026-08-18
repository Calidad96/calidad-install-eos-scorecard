import registry from '../../data/hub-registry.json';

export const DEFAULT_DEPARTMENT = 'Install';

export const HUB_BOARDS = {
  accountability: registry.boards.accountability.id,
  weeklyKpiHistory: registry.boards.weeklyKpiHistory.id,
  rocks: registry.boards.rocks.id,
  todos: registry.boards.todos.id,
  capa: registry.boards.capa.id,
  sops: registry.boards.sops.id,
  syncLog: registry.boards.syncLog.id,
};

export const DONE_STATUSES = ['done', 'complete', 'completed', 'closed', 'resolved', 'finalized'];
export const CAPA_OPEN_IDS = ['identify', 'discuss', 'solve', 'undefined', 'open', 'in progress', 'working'];
