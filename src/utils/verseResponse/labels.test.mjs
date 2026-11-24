import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildBookIndex, resolveSupportingLabel, buildVerseResponseView } from './labels.js';

const booksMeta = JSON.parse(readFileSync(new URL('../../data/books_meta.json', import.meta.url), 'utf8'));
const idx = buildBookIndex(booksMeta);

test('resolves NT, numbered books and ranges', () => {
  assert.deepEqual(resolveSupportingLabel('John 14:28', idx), { label: 'John 14:28', id: 'jn_14_28', href: '/bible/jn/14#28' });
  assert.equal(resolveSupportingLabel('1 Corinthians 15:3-8', idx).href, '/bible/1cor/15#3');
  assert.equal(resolveSupportingLabel('1 John 2:28', idx).id, '1jn_2_28');
});

test('resolves OT names with LXX display names and aliases', () => {
  assert.equal(resolveSupportingLabel('2 Samuel 7:14', idx).id, '2sm_7_14');
  assert.equal(resolveSupportingLabel('Joshua 1:1', idx).id, 'jo_1_1');
  assert.equal(resolveSupportingLabel('Psalm 110:1', idx).id, 'ps_110_1');
  assert.equal(resolveSupportingLabel('Song of Songs 1:1', idx).id, 'sg_1_1');
});

test('maps OT MT numbering to the LXX reader URL', () => {
  // Psalm 23 (MT) is Psalm 22 in the LXX reader.
  assert.match(resolveSupportingLabel('Psalm 23:1', idx).href, /^\/bible\/ps\/22#/);
});

test('resolves Quran labels with either prefix', () => {
  assert.deepEqual(resolveSupportingLabel('Surah 4:157', idx, '/base'), { label: 'Surah 4:157', id: '4_157', href: '/base/quran/4#157' });
  assert.equal(resolveSupportingLabel('Quran 53:19-20', idx).href, '/quran/53#19');
  assert.equal(resolveSupportingLabel('Quran 200:1', idx).href, null);
});

test('chapter-only references link to the chapter reader', () => {
  assert.deepEqual(resolveSupportingLabel('John 14', idx), { label: 'John 14', id: null, href: '/bible/jn/14' });
  assert.equal(resolveSupportingLabel('Ezekiel 40-48', idx).href, '/bible/ez/40');
  assert.equal(resolveSupportingLabel('Surah 33', idx).href, '/quran/33');
});

test('hadith citations stay plain (mixed numbering schemes)', () => {
  assert.equal(resolveSupportingLabel('Sahih Bukhari 4:498', idx).href, null);
  assert.equal(resolveSupportingLabel('Sahih Muslim 1935a', idx).href, null);
});

test('unknown books stay as plain labels', () => {
  assert.deepEqual(resolveSupportingLabel('Gospel of Thomas 1:1', idx), { label: 'Gospel of Thomas 1:1', id: null, href: null });
  assert.equal(resolveSupportingLabel('', idx).label, '');
});

test('view model: ready only, paragraphs split, self and duplicates dropped', () => {
  const row = {
    status: 'ready',
    response: 'First paragraph.\n\nSecond paragraph.\n\n',
    supporting_verses: JSON.stringify(['John 14:28', 'John 1:1', 'john 1:1', 'Gospel of Thomas 1:1']),
  };
  const view = buildVerseResponseView(row, { verseId: 'jn_14_28', bookIndex: idx });
  assert.deepEqual(view.paragraphs, ['First paragraph.', 'Second paragraph.']);
  assert.deepEqual(view.supporting.map((s) => s.label), ['John 1:1', 'Gospel of Thomas 1:1']);
  assert.equal(view.copyText, 'First paragraph.\n\nSecond paragraph.');
  assert.equal(buildVerseResponseView({ ...row, status: 'insufficient_coverage' }, { verseId: 'x', bookIndex: idx }), null);
  assert.equal(buildVerseResponseView(null, { verseId: 'x', bookIndex: idx }), null);
  assert.equal(buildVerseResponseView({ ...row, response: '  ' }, { verseId: 'x', bookIndex: idx }), null);
  assert.deepEqual(buildVerseResponseView({ ...row, supporting_verses: 'not json' }, { verseId: 'x', bookIndex: idx }).supporting, []);
});
