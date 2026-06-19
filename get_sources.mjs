import { DatabaseSync } from 'node:sqlite';
import { join } from 'node:path';

const dbPath = join(process.cwd(), 'data.db');
const db = new DatabaseSync(dbPath);

console.log("Apologetics sources:", db.prepare("SELECT DISTINCT src FROM apologetics").all());
console.log("Contradictions sources:", db.prepare("SELECT DISTINCT src FROM contradictions").all());
console.log("Apologetics meta IDs:", db.prepare("SELECT id, name FROM apologetics_meta").all());
