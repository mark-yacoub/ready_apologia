import test from 'node:test';
import assert from 'node:assert/strict';
import { hasReaderChapter, getAllEvidenceVerseSets } from './path_generator.js';

test('hasReaderChapter accepts verses in a chapter the reader has', () => {
  assert.equal(hasReaderChapter('jn_1_1'), true);
  assert.equal(hasReaderChapter('gn_50_26'), true);
  assert.equal(hasReaderChapter('jer_32_27'), true);
});

test('hasReaderChapter rejects title/ending placeholders, unknown books and missing chapters', () => {
  for (const id of ['1cor_0_0', '1cor_z_z', '1cor_10_0', 'PrAzar_1_1', 'dn_13_1', 'lv_40_1', '1jn_10_30', 'jn_1', '', null]) {
    assert.equal(hasReaderChapter(id), false, String(id));
  }
});

test('every verse tab route has a chapter reader page', () => {
  const { allVerseIds } = getAllEvidenceVerseSets();
  assert.ok(allVerseIds.size > 1000);
  const bad = [...allVerseIds].filter(id => !hasReaderChapter(id));
  assert.deepEqual(bad, []);
});
