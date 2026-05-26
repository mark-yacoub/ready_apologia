import { DatabaseSync } from 'node:sqlite';
import { join } from 'node:path';

const dbPath = join(process.cwd(), 'data.db');
let db = null;

try {
  db = new DatabaseSync(dbPath);
} catch (e) {
  console.warn("⚠️ Database not initialized yet. Please run setup script or place data.db in root.");
}

export function query(sql, params = {}) {
  if (!db) return [];
  const stmt = db.prepare(sql);
  // node:sqlite prepare supports named parameters if passed as object
  return stmt.all(params);
}

export function queryRow(sql, params = {}) {
  if (!db) return null;
  const stmt = db.prepare(sql);
  return stmt.get(params);
}

export function getTables() {
  if (!db) return [];
  const stmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
  return stmt.all().map(row => row.name);
}
