import { query } from './src/db.js';
console.log(query("SELECT verse_id, v11n_type FROM manuscript_per_verse_ot WHERE verse_id LIKE 'gn_1_%'"));
