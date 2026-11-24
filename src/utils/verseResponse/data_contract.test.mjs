// Data contract between the data_collection pipeline and the UI: every `ready`
// verse_video_responses row in data.db must render a card, and the supporting-verse
// labels must stay in a format the resolver understands (so pills keep linking).
// Run with: NODE_OPTIONS='--experimental-sqlite' node --test src/utils/verseResponse/data_contract.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { buildRefIndex, buildVerseResponseView, resolveSupportingLabel } from './labels.js';

const dbUrl = new URL('../../../data.db', import.meta.url);
const readJson = (rel) => JSON.parse(readFileSync(new URL(rel, import.meta.url), 'utf8'));
const MIN_LINKED_SHARE = 0.95;

test('every ready row renders and supporting labels resolve', { skip: !existsSync(dbUrl) && 'data.db not present' }, () => {
  const db = new DatabaseSync(dbUrl.pathname, { readOnly: true });
  try {
    const hasTable = db.prepare(
      "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'verse_video_responses'"
    ).get();
    assert.ok(hasTable, 'verse_video_responses table is missing from data.db');

    const refIndex = buildRefIndex(readJson('../../data/books_meta.json'), readJson('../../data/quran/arabic/meta.json'));
    const rows = db.prepare(
      "SELECT verse_id, response, supporting_verses, status FROM verse_video_responses WHERE status = 'ready'"
    ).all();
    assert.ok(rows.length > 0, 'no ready rows');

    const notRendered = rows.filter((r) => !buildVerseResponseView(r, { verseId: r.verse_id, refIndex }));
    assert.deepEqual(notRendered.map((r) => r.verse_id), [], 'ready rows that would not render a card');

    let total = 0;
    let linked = 0;
    for (const r of rows) {
      for (const label of JSON.parse(r.supporting_verses || '[]')) {
        total += 1;
        if (resolveSupportingLabel(label, refIndex).href) linked += 1;
      }
    }
    const share = total ? linked / total : 1;
    assert.ok(share >= MIN_LINKED_SHARE, `only ${(share * 100).toFixed(1)}% of ${total} supporting labels resolve (min ${MIN_LINKED_SHARE * 100}%)`);
  } finally {
    db.close();
  }
});
