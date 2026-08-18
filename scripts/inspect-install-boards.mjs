import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../dashboard/.env.local') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

const BOARDS = {
  accountability: { id: '18425615142', label: 'EOS-1 Accountability Chart' },
  weeklyScorecard: { id: '18425615152', label: 'EOS-2 Weekly Scorecard' },
  rocks: { id: '18425632638', label: 'EOS-3 Rocks' },
  todos: { id: '18415782228', label: 'EOS-4 To-Dos' },
  capa: { id: '18425615173', label: 'EOS-5 CAPA/IDS' },
  sops: { id: '18425640592', label: 'EOS-6 SOP Manager' },
};

const token = process.env.MONDAY_API_TOKEN;
if (!token) {
  console.error('MONDAY_API_TOKEN not set');
  process.exit(1);
}

async function mondayQuery(query, variables = {}) {
  const res = await fetch('https://api.monday.com/v2', {
    method: 'POST',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
      'API-Version': '2024-10',
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join('; '));
  return json.data;
}

async function inspectBoard(key, meta) {
  const data = await mondayQuery(
    `query ($boardId: [ID!], $limit: Int!) {
      boards(ids: $boardId) {
        id name
        columns { id title type }
        items_page(limit: $limit) {
          items {
            id name
            column_values { text column { title type } }
          }
        }
      }
    }`,
    { boardId: [meta.id], limit: 5 }
  );
  const board = data.boards?.[0];
  return { key, ...meta, board };
}

const results = {};
for (const [key, meta] of Object.entries(BOARDS)) {
  console.log(`Inspecting ${meta.label}...`);
  try {
    results[key] = await inspectBoard(key, meta);
    console.log(`  OK: ${results[key].board?.name}`);
  } catch (err) {
    console.log(`  FAIL: ${err.message}`);
    results[key] = { ...meta, error: err.message };
  }
}

const outDir = path.join(__dirname, '../data/inspection');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'install-boards.json'), JSON.stringify(results, null, 2));
console.log('\nSaved data/inspection/install-boards.json');
