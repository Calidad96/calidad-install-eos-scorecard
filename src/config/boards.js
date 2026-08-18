/** Default department label — reusable when board set is copied per department */
export const DEFAULT_DEPARTMENT = 'Install';

/** Source boards — READ ONLY. Never write to these. */
export const SOURCE_BOARDS = {
  accountability: {
    id: '18425615142',
    name: '(EOS-1) Install Accountability Chart',
    domain: 'accountability',
  },
  weeklyScorecard: {
    id: '18425615152',
    name: '(EOS-2) Install Weekly Scorecard',
    domain: 'weekly_kpis',
  },
  rocks: {
    id: '18425632638',
    name: '(EOS-3) Install Rocks',
    domain: 'rocks',
  },
  todos: {
    id: '18415782228',
    name: '(EOS-4) Install To-Dos',
    domain: 'todos',
  },
  capa: {
    id: '18425615173',
    name: '(EOS-5) Install CAPA/IDS',
    domain: 'capa',
  },
  sops: {
    id: '18425640592',
    name: '(EOS-6) Install SOP Manager',
    domain: 'sops',
  },
};

/** Hub board names — created in Monday datahub workspace */
export const HUB_BOARD_NAMES = {
  accountability: '[SYNC] Install Accountability Snapshot',
  weeklyKpiHistory: '[SYNC] Install Weekly KPI History',
  rocks: '[SYNC] Install Rocks Snapshot',
  todos: '[SYNC] Install To-Dos Snapshot',
  capa: '[SYNC] Install CAPA Snapshot',
  sops: '[SYNC] Install SOPs Snapshot',
  syncLog: '[SYNC] Install Sync Log',
};

/** Weekly columns W1–W13 on source scorecard board */
export const WEEK_COLUMNS = Array.from({ length: 13 }, (_, i) => `W${i + 1}`);
