import fs from 'fs';
import path from 'path';
import { WEEK_COLUMNS } from '../config/boards.js';

export function loadHubRegistry() {
  const registryPath = 'data/hub-registry.json';
  if (!fs.existsSync(registryPath)) {
    throw new Error('Hub registry not found. Run: npm run setup-hub');
  }
  return JSON.parse(fs.readFileSync(registryPath, 'utf8'));
}

export function colText(item, title) {
  const cv = item.column_values?.find((c) => c.column?.title === title);
  return cv?.text?.trim() || '';
}

export function hubColumnMap(registry, boardKey) {
  const ids = registry.columnIds?.[boardKey] ?? {};
  return { ...ids };
}

export function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function dueBucket(dueStr) {
  if (!dueStr) return 'Later / No Date';
  const due = new Date(dueStr.slice(0, 10));
  if (Number.isNaN(due.getTime())) return 'Later / No Date';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diff = Math.round((due - today) / 86400000);
  if (diff < 0) return 'Overdue';
  if (diff === 0) return 'Due Today';
  if (diff <= 7) return 'Due This Week';
  if (diff <= 14) return 'Due Next Week';
  return 'Later / No Date';
}

const NUMERIC_HUB = new Set([
  'Actual Value',
  'Target',
  'KPI Score',
  'Subitem Count',
  'Items Written',
]);

export function buildColumnValues(colMap, values) {
  const out = {};
  for (const [title, value] of Object.entries(values)) {
    const colId = colMap[title];
    if (!colId || value === undefined || value === null || value === '') continue;
    if (
      title.includes('Date') ||
      title === 'Snapshot At' ||
      title === 'Synced At' ||
      title === 'Started' ||
      title === 'Finished'
    ) {
      out[colId] = { date: String(value).slice(0, 10) };
    } else if (NUMERIC_HUB.has(title)) {
      const n = Number(value);
      if (!Number.isNaN(n)) out[colId] = String(n);
    } else {
      out[colId] = String(value);
    }
  }
  return out;
}

/** Extract weekly KPI rows from Install weekly scorecard item (W1–W13). */
export function extractWeeklyKpiRows(item, department, year) {
  const rows = [];
  const name = item.name;
  const category = colText(item, 'Category');
  const target = parseFloat(colText(item, 'Target')) || null;
  const goalDirection = colText(item, 'Goal Direction');
  const scoreText = colText(item, 'KPI Score (Out of 5)');
  const boardScore = parseFloat(scoreText) || null;
  const offTrack = colText(item, 'Off Track?');
  const sourceId = item.id;
  const yearStr = colText(item, 'Year') || String(year);

  for (const weekCol of WEEK_COLUMNS) {
    const valText = colText(item, weekCol);
    if (!valText) continue;
    const actual = parseFloat(valText);
    if (Number.isNaN(actual)) continue;
    const weekNum = weekCol.replace('W', '').padStart(2, '0');
    const weekKey = `${yearStr}-W${weekNum}`;
    rows.push({
      kpiKey: `${sourceId}_${weekKey}`,
      kpiName: name,
      department,
      category,
      week: weekKey,
      weekLabel: weekCol,
      actual,
      target,
      boardScore,
      goalDirection,
      offTrack,
      year: yearStr,
      sourceItemId: sourceId,
    });
  }

  return rows;
}

export function copyRegistryToDashboard() {
  const src = 'data/hub-registry.json';
  const dest = 'dashboard/data/hub-registry.json';
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}
