import Database from 'better-sqlite3';
const db = new Database('./src/data/evidence.db');
const row = db.prepare('SELECT count(*) as c FROM manuscripts WHERE verse = ?').get('gn_1_2');
console.log('gn_1_2 count:', row.c);
