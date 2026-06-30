const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('./data.db');
const lxxPrefix = 'gn_1_%';
const stmt = db.prepare("SELECT verse_id, v11n_type FROM manuscript_per_verse_ot WHERE verse_id LIKE ?");
const rows = stmt.all(lxxPrefix);
console.log(rows);
