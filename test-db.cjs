const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('./data.db');
const stmt = db.prepare("SELECT verse_id, v11n_type FROM manuscript_per_verse_ot WHERE verse_id IN ('gn_1_2', 'gn_1_26')");
const msRows = stmt.all();
console.log(`Exact match rows:`);
console.log(msRows);
