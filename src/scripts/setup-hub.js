import fs from 'fs';
import path from 'path';
import { HUB_BOARD_NAMES } from '../config/boards.js';
import {
  createBoard,
  createColumn,
  getWorkspaceBoards,
} from '../lib/monday.js';
import { copyRegistryToDashboard } from '../lib/sync-utils.js';

const WORKSPACE_ID = process.env.MONDAY_HUB_WORKSPACE_ID;
const REGISTRY_PATH = 'data/hub-registry.json';

const HUB_DESCRIPTION =
  '⚠️ SYSTEM BOARD — Auto-synced by Install EOS Scorecard. Do not edit manually.';

/** @type {Record<string, { columns: { title: string, type: string, defaults?: object }[] }>} */
const BOARD_SCHEMAS = {
  accountability: {
    columns: [
      { title: 'Source Item ID', type: 'text' },
      { title: 'Department', type: 'text' },
      { title: 'Name', type: 'text' },
      { title: 'Position', type: 'text' },
      { title: 'Status', type: 'text' },
      { title: 'Has Chart Doc', type: 'text' },
      { title: 'Snapshot At', type: 'date' },
    ],
  },
  weeklyKpiHistory: {
    columns: [
      { title: 'KPI Key', type: 'text' },
      { title: 'KPI Name', type: 'text' },
      { title: 'Department', type: 'text' },
      { title: 'Category', type: 'text' },
      { title: 'Week', type: 'text' },
      { title: 'Actual Value', type: 'numbers' },
      { title: 'Target', type: 'numbers' },
      { title: 'KPI Score', type: 'numbers' },
      { title: 'Goal Direction', type: 'text' },
      { title: 'Off Track', type: 'text' },
      { title: 'Year', type: 'text' },
      { title: 'Source Item ID', type: 'text' },
      { title: 'Synced At', type: 'date' },
    ],
  },
  rocks: {
    columns: [
      { title: 'Source Item ID', type: 'text' },
      { title: 'Department', type: 'text' },
      { title: 'Rock Name', type: 'text' },
      { title: 'Quarter', type: 'text' },
      { title: 'Owner', type: 'text' },
      { title: 'Measurable', type: 'long_text' },
      { title: 'Group', type: 'text' },
      { title: 'Subitem Count', type: 'numbers' },
      { title: 'Rock Status', type: 'text' },
      { title: 'Snapshot At', type: 'date' },
    ],
  },
  todos: {
    columns: [
      { title: 'Source Item ID', type: 'text' },
      { title: 'Department', type: 'text' },
      { title: 'Accountable', type: 'text' },
      { title: 'Priority', type: 'text' },
      { title: 'Status', type: 'text' },
      { title: 'Due Date', type: 'date' },
      { title: 'Next Action Date', type: 'date' },
      { title: 'Due Bucket', type: 'text' },
      { title: 'Task Description', type: 'long_text' },
      { title: 'Snapshot At', type: 'date' },
    ],
  },
  capa: {
    columns: [
      { title: 'Source Item ID', type: 'text' },
      { title: 'Department', type: 'text' },
      { title: 'Owner', type: 'text' },
      { title: 'Issue Type', type: 'text' },
      { title: 'Priority', type: 'text' },
      { title: 'IDS Status', type: 'text' },
      { title: 'Repeat Issue', type: 'text' },
      { title: 'Exit Route', type: 'text' },
      { title: 'Issue Description', type: 'long_text' },
      { title: 'Snapshot At', type: 'date' },
    ],
  },
  sops: {
    columns: [
      { title: 'Source Item ID', type: 'text' },
      { title: 'Department', type: 'text' },
      { title: 'SOP Name', type: 'text' },
      { title: 'Priority', type: 'text' },
      { title: 'Status', type: 'text' },
      { title: 'Owner', type: 'text' },
      { title: 'Rollout Target Date', type: 'date' },
      { title: 'Snapshot At', type: 'date' },
    ],
  },
  syncLog: {
    columns: [
      { title: 'Run ID', type: 'text' },
      { title: 'Started', type: 'date' },
      { title: 'Finished', type: 'date' },
      { title: 'Status', type: 'text' },
      { title: 'Boards Pulled', type: 'long_text' },
      { title: 'Items Written', type: 'numbers' },
      { title: 'Errors', type: 'long_text' },
    ],
  },
};

function loadRegistry() {
  if (!fs.existsSync(REGISTRY_PATH)) return { boards: {}, columnIds: {} };
  return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
}

function saveRegistry(registry) {
  fs.mkdirSync(path.dirname(REGISTRY_PATH), { recursive: true });
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));
  copyRegistryToDashboard();
}

async function setup() {
  if (!WORKSPACE_ID) throw new Error('MONDAY_HUB_WORKSPACE_ID missing');

  const registry = loadRegistry();
  const existing = await getWorkspaceBoards(WORKSPACE_ID);
  const existingByName = Object.fromEntries(existing.map((b) => [b.name, b]));

  for (const [key, boardName] of Object.entries(HUB_BOARD_NAMES)) {
    let board = existingByName[boardName] ?? registry.boards[key];

    if (!board?.id) {
      console.log(`Creating board: ${boardName}`);
      const created = await createBoard(boardName, WORKSPACE_ID, HUB_DESCRIPTION);
      board = { id: created.id, name: created.name };
      await new Promise((r) => setTimeout(r, 1500));
    } else {
      console.log(`Board exists: ${boardName} (${board.id})`);
    }

    registry.boards[key] = { id: board.id, name: board.name };
    registry.columnIds[key] = registry.columnIds[key] ?? {};

    const schema = BOARD_SCHEMAS[key];
    if (!schema) continue;

    for (const col of schema.columns) {
      if (registry.columnIds[key][col.title]) continue;
      console.log(`  + column: ${col.title}`);
      const created = await createColumn(board.id, col.title, col.type, col.defaults ?? {});
      registry.columnIds[key][col.title] = created.id;
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  saveRegistry(registry);
  console.log(`\nHub setup complete. Registry saved to ${REGISTRY_PATH}`);
  console.log(JSON.stringify(registry.boards, null, 2));
}

setup().catch((err) => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});
