import fs from 'fs';
import {
  createItem,
  getAllBoardItems,
  getAllBoardItemsWithSubitems,
  mondayQuery,
} from '../lib/monday.js';
import {
  buildColumnValues,
  colText,
  copyRegistryToDashboard,
  dueBucket,
  extractWeeklyKpiRows,
  hubColumnMap,
  loadHubRegistry,
  todayDate,
} from '../lib/sync-utils.js';
import { DEFAULT_DEPARTMENT, SOURCE_BOARDS } from '../config/boards.js';

const TODAY = todayDate();
const DEPT = DEFAULT_DEPARTMENT;

async function deleteBoardItems(boardId) {
  const items = await getAllBoardItems(boardId);
  if (!items.length) return 0;
  let deleted = 0;
  for (const item of items) {
    const query = `mutation ($itemId: ID!) { delete_item(item_id: $itemId) { id } }`;
    await mondayQuery(query, { itemId: String(item.id) });
    deleted++;
    if (deleted % 10 === 0) await new Promise((r) => setTimeout(r, 500));
  }
  return deleted;
}

async function writeItems(boardId, colMap, rows, label) {
  let written = 0;
  let failed = 0;
  for (const row of rows) {
    const { itemName, values } = row;
    const columnValues = buildColumnValues(colMap, values);
    try {
      await createItem(boardId, itemName, columnValues);
      written++;
    } catch (err) {
      failed++;
      console.warn(`  ${label} skip: ${itemName.slice(0, 40)} — ${err.message}`);
      await new Promise((r) => setTimeout(r, 2000));
    }
    if (written % 5 === 0 && written > 0) {
      process.stdout.write(`  ${label}: ${written}/${rows.length} (${failed} skipped)\r`);
      await new Promise((r) => setTimeout(r, 300));
    }
  }
  console.log(`  ${label}: wrote ${written} items (${failed} skipped)`);
  return written;
}

function deriveRockStatus(subitemCount, people) {
  if (subitemCount === 0 && !people) return 'Not Started';
  if (subitemCount === 0) return 'Not Started';
  return 'In Progress';
}

async function syncAccountability(registry) {
  const boardKey = 'accountability';
  const hubId = registry.boards[boardKey].id;
  const colMap = hubColumnMap(registry, boardKey);
  const items = await getAllBoardItems(SOURCE_BOARDS.accountability.id);

  const rows = items.map((item) => {
    const chartDoc = colText(item, 'Accountability Charts');
    return {
      itemName: item.name.slice(0, 120),
      values: {
        'Source Item ID': item.id,
        Department: DEPT,
        Name: item.name,
        Position: colText(item, 'Position'),
        Status: colText(item, 'Status') || 'New',
        'Has Chart Doc': chartDoc ? 'Yes' : 'No',
        'Snapshot At': TODAY,
      },
    };
  });

  console.log(`  Pulled ${items.length} accountability charts`);
  await deleteBoardItems(hubId);
  return writeItems(hubId, colMap, rows, boardKey);
}

async function syncWeeklyKpis(registry) {
  const boardKey = 'weeklyKpiHistory';
  const hubId = registry.boards[boardKey].id;
  const colMap = hubColumnMap(registry, boardKey);
  const items = await getAllBoardItems(SOURCE_BOARDS.weeklyScorecard.id);

  const existing = await getAllBoardItems(hubId);
  const existingKeys = new Set(existing.map((e) => colText(e, 'KPI Key')));

  const currentRows = existing.filter((e) => colText(e, 'Week') === 'CURRENT');
  for (const row of currentRows) {
    const query = `mutation ($itemId: ID!) { delete_item(item_id: $itemId) { id } }`;
    await mondayQuery(query, { itemId: String(row.id) });
    existingKeys.delete(colText(row, 'KPI Key'));
  }

  const rows = [];
  const year = new Date().getFullYear();
  for (const item of items) {
    const snapshotKey = `${item.id}_${colText(item, 'Year') || year}_CURRENT`;
    if (!existingKeys.has(snapshotKey)) {
      rows.push({
        itemName: `${item.name} — current`.slice(0, 120),
        values: {
          'KPI Key': snapshotKey,
          'KPI Name': item.name,
          Department: DEPT,
          Category: colText(item, 'Category'),
          Week: 'CURRENT',
          Target: parseFloat(colText(item, 'Target')) || undefined,
          'Goal Direction': colText(item, 'Goal Direction'),
          'Off Track': colText(item, 'Off Track?'),
          Year: colText(item, 'Year') || String(year),
          'Source Item ID': item.id,
          'Synced At': TODAY,
        },
      });
    }

    const weekly = extractWeeklyKpiRows(item, DEPT, year);
    for (const w of weekly) {
      if (existingKeys.has(w.kpiKey)) continue;
      rows.push({
        itemName: `${w.kpiName} — ${w.weekLabel}`.slice(0, 120),
        values: {
          'KPI Key': w.kpiKey,
          'KPI Name': w.kpiName,
          Department: w.department,
          Category: w.category,
          Week: w.week,
          'Actual Value': w.actual,
          Target: w.target ?? undefined,
          'KPI Score': w.boardScore ?? undefined,
          'Goal Direction': w.goalDirection,
          'Off Track': w.offTrack,
          Year: w.year,
          'Source Item ID': w.sourceItemId,
          'Synced At': TODAY,
        },
      });
    }
  }

  console.log(`  Pulled ${items.length} KPIs, ${rows.length} new weekly rows to append`);
  return writeItems(hubId, colMap, rows, boardKey);
}

async function syncRocks(registry) {
  const boardKey = 'rocks';
  const hubId = registry.boards[boardKey].id;
  const colMap = hubColumnMap(registry, boardKey);
  const items = await getAllBoardItemsWithSubitems(SOURCE_BOARDS.rocks.id);

  const rows = items.map((item) => {
    const subCount = item.subitems?.length ?? 0;
    const people = colText(item, 'People');
    return {
      itemName: item.name.slice(0, 120),
      values: {
        'Source Item ID': item.id,
        Department: DEPT,
        'Rock Name': item.name,
        Quarter: colText(item, 'Quarter/Year'),
        Owner: people,
        Measurable: colText(item, 'Measurable'),
        Group: item.group?.title ?? '',
        'Subitem Count': subCount,
        'Rock Status': deriveRockStatus(subCount, people),
        'Snapshot At': TODAY,
      },
    };
  });

  console.log(`  Pulled ${items.length} rocks`);
  await deleteBoardItems(hubId);
  return writeItems(hubId, colMap, rows, boardKey);
}

async function syncTodos(registry) {
  const boardKey = 'todos';
  const hubId = registry.boards[boardKey].id;
  const colMap = hubColumnMap(registry, boardKey);
  const items = await getAllBoardItems(SOURCE_BOARDS.todos.id);

  const rows = items.map((item) => {
    const due = colText(item, 'Due Date');
    return {
      itemName: item.name.slice(0, 120),
      values: {
        'Source Item ID': item.id,
        Department: DEPT,
        Accountable: colText(item, 'Accountable'),
        Priority: colText(item, 'Priority'),
        Status: colText(item, 'Status'),
        'Due Date': due?.slice(0, 10) || undefined,
        'Next Action Date': colText(item, 'Next Action Date')?.slice(0, 10) || undefined,
        'Due Bucket': dueBucket(due),
        'Task Description': colText(item, 'Task Description'),
        'Snapshot At': TODAY,
      },
    };
  });

  console.log(`  Pulled ${items.length} to-dos`);
  await deleteBoardItems(hubId);
  return writeItems(hubId, colMap, rows, boardKey);
}

async function syncCapa(registry) {
  const boardKey = 'capa';
  const hubId = registry.boards[boardKey].id;
  const colMap = hubColumnMap(registry, boardKey);
  const items = await getAllBoardItems(SOURCE_BOARDS.capa.id);

  const rows = items.map((item) => ({
    itemName: item.name.slice(0, 120),
    values: {
      'Source Item ID': item.id,
      Department: DEPT,
      Owner: colText(item, 'Owner'),
      'Issue Type': colText(item, 'Issue Type'),
      Priority: colText(item, 'Priority'),
      'IDS Status': colText(item, 'IDS Status'),
      'Repeat Issue': colText(item, 'Repeat Issue?'),
      'Exit Route': colText(item, 'Exit Route'),
      'Issue Description': colText(item, 'Issue Description (I)'),
      'Snapshot At': TODAY,
    },
  }));

  console.log(`  Pulled ${items.length} CAPA/IDS items`);
  await deleteBoardItems(hubId);
  return writeItems(hubId, colMap, rows, boardKey);
}

async function syncSops(registry) {
  const boardKey = 'sops';
  const hubId = registry.boards[boardKey].id;
  const colMap = hubColumnMap(registry, boardKey);
  const items = await getAllBoardItems(SOURCE_BOARDS.sops.id);

  const rows = items.map((item) => ({
    itemName: item.name.slice(0, 120),
    values: {
      'Source Item ID': item.id,
      Department: DEPT,
      'SOP Name': item.name,
      Priority: colText(item, 'Priority'),
      Status: colText(item, 'Status'),
      Owner: colText(item, 'Owner') || colText(item, 'Approvers'),
      'Rollout Target Date': colText(item, 'Rollout Target Date')?.slice(0, 10) || undefined,
      'Snapshot At': TODAY,
    },
  }));

  console.log(`  Pulled ${items.length} SOPs`);
  await deleteBoardItems(hubId);
  return writeItems(hubId, colMap, rows, boardKey);
}

async function logSync(registry, runId, started, status, boardsPulled, itemsWritten, errors) {
  const boardKey = 'syncLog';
  const hubId = registry.boards[boardKey].id;
  const colMap = hubColumnMap(registry, boardKey);
  await createItem(
    hubId,
    `Sync ${runId}`.slice(0, 120),
    buildColumnValues(colMap, {
      'Run ID': runId,
      Started: started,
      Finished: TODAY,
      Status: status,
      'Boards Pulled': boardsPulled.join(', '),
      'Items Written': itemsWritten,
      Errors: errors || '',
    })
  );
}

async function main() {
  const registry = loadHubRegistry();
  const runId = new Date().toISOString();
  const started = TODAY;
  let totalWritten = 0;
  const boardsPulled = [];
  const errors = [];

  const syncFns = [
    ['accountability', syncAccountability],
    ['weeklyKpis', syncWeeklyKpis],
    ['rocks', syncRocks],
    ['todos', syncTodos],
    ['capa', syncCapa],
    ['sops', syncSops],
  ];

  for (const [label, fn] of syncFns) {
    try {
      console.log(`\nSyncing ${label}...`);
      const n = await fn(registry);
      totalWritten += n;
      boardsPulled.push(label);
    } catch (err) {
      console.error(`  ERROR ${label}: ${err.message}`);
      errors.push(`${label}: ${err.message}`);
    }
  }

  try {
    await logSync(
      registry,
      runId,
      started,
      errors.length ? 'Partial' : 'Success',
      boardsPulled,
      totalWritten,
      errors.join('; ')
    );
  } catch (err) {
    console.error('Sync log write failed:', err.message);
  }

  copyRegistryToDashboard();
  console.log(`\nDone. ${totalWritten} items written. Status: ${errors.length ? 'Partial' : 'Success'}`);
  if (errors.length) process.exit(1);
}

main().catch((err) => {
  console.error('Sync failed:', err.message);
  process.exit(1);
});
