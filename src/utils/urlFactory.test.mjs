import test from 'node:test';
import assert from 'node:assert/strict';
import { getQuranUrl } from './urlFactory.js';

test('getQuranUrl reader anchors are verse numbers only', () => {
  assert.equal(getQuranUrl({ surah: 41, ayah: 9, base: '' }), '/quran/41#9');
  assert.equal(getQuranUrl({ surah: 41, ayah: '9-12', base: '' }), '/quran/41#9');
  assert.equal(getQuranUrl({ surah: 53, ayah: '36–37', base: '' }), '/quran/53#36');
  assert.equal(getQuranUrl({ surah: 13, ayah: '0', base: '' }), '/quran/13');
  assert.equal(getQuranUrl({ surah: 76, ayah: 'intro', base: '' }), '/quran/76');
});

test('getQuranUrl tab URLs are unchanged', () => {
  assert.equal(getQuranUrl({ surah: 5, ayah: 47, tab: 'christian-footnotes', base: '' }), '/quran/5/47/christian-footnotes');
  assert.equal(getQuranUrl({ surah: 13, ayah: '0', tab: 'christian-footnotes', base: '' }), '/quran/13/0/christian-footnotes');
});
