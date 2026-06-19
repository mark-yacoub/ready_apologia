import { DatabaseSync } from 'node:sqlite';
import { join } from 'node:path';

const dbPath = join(process.cwd(), 'data.db');
const db = new DatabaseSync(dbPath);

const tables = ['patristics_works', 'patristics_fathers', 'apologetics', 'apologetics_meta'];
tables.forEach(table => {
  const stmt = db.prepare(`PRAGMA table_info(${table})`);
  console.log(`Schema for ${table}:`, stmt.all());
});
