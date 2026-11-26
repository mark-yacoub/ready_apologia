import test from 'node:test';
import assert from 'node:assert/strict';
import { getBibleUrl, getQuranUrl } from './urlFactory.js';

test('getBibleUrl maps MT OT references accurately and degrades unmapped verses to chapter', () => {
  assert.equal(getBibleUrl({ book: 'jon', chapter: 1, verse: 17, isMt: true, base: '' }), '/bible/jon/2#1');
  assert.equal(getBibleUrl({ book: 'jon', chapter: 2, verse: 10, tab: 'videos', isMt: true, base: '' }), '/bible/jon/2/11/videos');
  assert.equal(getBibleUrl({ book: 'ps', chapter: 23, verse: 1, isMt: true, base: '' }), '/bible/ps/22#1');
  assert.equal(getBibleUrl({ book: 'jer', chapter: 27, isMt: true, base: '' }), '/bible/jer/34');
  // Genuine LXX omissions fall back to the mapped LXX chapter rather than a dead verse/tab link
  assert.equal(getBibleUrl({ book: 'prv', chapter: 22, verse: 6, isMt: true, base: '' }), '/bible/prv/22');
  assert.equal(getBibleUrl({ book: 'jer', chapter: 10, verse: 10, tab: 'apologetics', isMt: true, base: '' }), '/bible/jer/10');
});

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
