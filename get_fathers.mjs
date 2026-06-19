import { DatabaseSync } from 'node:sqlite';
import { join } from 'node:path';

const dbPath = join(process.cwd(), 'data.db');
const db = new DatabaseSync(dbPath);

console.log("Fathers:", db.prepare("SELECT * FROM patristics_fathers").all());
