import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../dashboard/.env.local') });

const token = process.env.MONDAY_API_TOKEN;
const query = `
  query {
    boards(ids: [18425632638]) {
      groups { id title }
      items_page(limit: 20) {
        items {
          id name
          group { title }
        }
      }
    }
  }
`;

const res = await fetch('https://api.monday.com/v2', {
  method: 'POST',
  headers: {
    Authorization: token,
    'Content-Type': 'application/json',
    'API-Version': '2024-10',
  },
  body: JSON.stringify({ query }),
});
const json = await res.json();
console.log(JSON.stringify(json.data, null, 2));
