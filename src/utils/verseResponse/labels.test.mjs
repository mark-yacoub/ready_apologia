import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildRefIndex, resolveSupportingLabel, buildVerseResponseView } from './labels.js';

const readJson = (rel) => JSON.parse(readFileSync(new URL(rel, import.meta.url), 'utf8'));
const idx = buildRefIndex(readJson('../../data/books_meta.json'), readJson('../../data/quran/arabic/meta.json'));
const href = (label, base) => resolveSupportingLabel(label, idx, base).href;

test('resolves NT, numbered books and ranges', () => {
  assert.deepEqual(resolveSupportingLabel('John 14:28', idx), { label: 'John 14:28', id: 'jn_14_28', href: '/bible/jn/14#28' });
  assert.equal(href('1 Corinthians 15:3-8'), '/bible/1cor/15#3');
  assert.equal(resolveSupportingLabel('1 John 2:28', idx).id, '1jn_2_28');
  assert.equal(href('Isaiah 52:13-53:12'), '/bible/is/52#13');
  assert.equal(href('John 7:53-8:11'), '/bible/jn/7#53');
});

test('resolves OT names with LXX display names and aliases', () => {
  assert.equal(resolveSupportingLabel('2 Samuel 7:14', idx).id, '2sm_7_14');
  assert.equal(resolveSupportingLabel('Joshua 1:1', idx).id, 'jo_1_1');
  assert.equal(resolveSupportingLabel('Psalm 110:1', idx).id, 'ps_110_1');
  assert.equal(resolveSupportingLabel('Song of Songs 1:1', idx).id, 'sg_1_1');
});

test('maps OT MT numbering to the LXX reader URL, id stays MT', () => {
  const ref = resolveSupportingLabel('Psalm 23:1', idx);
  assert.equal(ref.id, 'ps_23_1');
  assert.match(ref.href, /^\/bible\/ps\/22#/);
});

test('resolves Quran labels with either prefix and honours base', () => {
  assert.deepEqual(resolveSupportingLabel('Surah 4:157', idx, '/base'), { label: 'Surah 4:157', id: '4_157', href: '/base/quran/4#157' });
  assert.equal(href('Quran 53:19-20'), '/quran/53#19');
  assert.equal(href("Qur'an 112:1"), '/quran/112#1');
});

test('chapter-only references link to the chapter reader', () => {
  assert.deepEqual(resolveSupportingLabel('John 14', idx), { label: 'John 14', id: null, href: '/bible/jn/14' });
  assert.equal(href('Ezekiel 40-48'), '/bible/ez/40');
  assert.equal(href('Surah 33'), '/quran/33');
});

test('out-of-range numbers stay plain instead of producing dead links', () => {
  assert.equal(href('Quran 200:1'), null);
  assert.equal(href('Surah 2:999'), null);
  assert.equal(href('Surah 1:0'), null);
  assert.equal(href('Surah 115'), null);
  assert.equal(href('John 22:1'), null);
  assert.equal(href('John 30'), null);
  assert.equal(href('Jude 0:1'), null);
});

test('hadith citations, unknown books and empty labels stay plain', () => {
  assert.equal(href('Sahih Bukhari 4:498'), null);
  assert.equal(href('Sahih Muslim 1935a'), null);
  assert.deepEqual(resolveSupportingLabel('Gospel of Thomas 1:1', idx), { label: 'Gospel of Thomas 1:1', id: null, href: null });
  assert.equal(resolveSupportingLabel('', idx).label, '');
  assert.equal(resolveSupportingLabel(null, idx).label, '');
});

test('view model: ready only, paragraphs split, self and duplicates dropped', () => {
  const row = {
    status: 'ready',
    response: 'First paragraph.\n\nSecond paragraph.\n\n',
    supporting_verses: JSON.stringify(['John 14:28', 'John 1:1', 'john 1:1', 'Gospel of Thomas 1:1', 42]),
  };
  const opts = { verseId: 'jn_14_28', refIndex: idx };
  const view = buildVerseResponseView(row, opts);
  assert.deepEqual(view.paragraphs, ['First paragraph.', 'Second paragraph.']);
  assert.deepEqual(view.supporting.map((s) => s.label), ['John 1:1', 'Gospel of Thomas 1:1']);
  assert.equal(buildVerseResponseView({ ...row, status: 'insufficient_coverage' }, opts), null);
  assert.equal(buildVerseResponseView(null, opts), null);
  assert.equal(buildVerseResponseView(undefined, opts), null);
  assert.equal(buildVerseResponseView({ ...row, response: '  ' }, opts), null);
  assert.deepEqual(buildVerseResponseView({ ...row, supporting_verses: 'not json' }, opts).supporting, []);
  assert.deepEqual(buildVerseResponseView({ ...row, supporting_verses: '{"a":1}' }, opts).supporting, []);
});
