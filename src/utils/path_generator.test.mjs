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

test('verses the LXX lacks keep their evidence page under the MT number', () => {
  const { apSet, ctSet, vdSet, allVerseIds } = getAllEvidenceVerseSets();
  // Prov 22:6 has no LXX equivalent but has apologetics/videos in MT numbering.
  assert.ok(apSet.has('prv_22_6') || vdSet.has('prv_22_6'), 'prv_22_6 page kept');
  // Jonah 1:17 (MT) is LXX 2:1: routed there, not to a jon_1_17 page.
  assert.ok(!allVerseIds.has('jon_1_17'));
  assert.ok(ctSet.has('jon_2_1') || vdSet.has('jon_2_1'));
});
