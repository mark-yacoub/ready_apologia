// Run from the repo root: node --experimental-sqlite --test src/utils/ogImageResolver.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { query } from '../db.js';
import {
  OG_PREVIEW,
  OG_PREVIEW_PATH_PREFIX,
  R2_BASE_URL,
  SCAN_DIRS,
  scanOgImage,
  scanPath,
  scanUrl,
} from './cdn_config.js';
import { getBibleOgImage, getQuranOgImage, likePrefix } from './ogImageResolver.js';

const previewPrefix = `${R2_BASE_URL}${OG_PREVIEW_PATH_PREFIX}`;

test('scanPath encodes every segment, including spaces and parentheses', () => {
  assert.equal(
    scanPath('ot_images', '(Great Isaiah Scroll)', '(Great Isaiah Scroll)_col44.jpg'),
    'ot_images/%28Great%20Isaiah%20Scroll%29/%28Great%20Isaiah%20Scroll%29_col44.jpg'
  );
  assert.equal(scanUrl('images', 'P66', 'p66_bodmer_1.jpg'), `${R2_BASE_URL}/images/P66/p66_bodmer_1.jpg`);
});

test('preview preset is a bounded, padded JPEG with a redirect fallback', () => {
  const opts = Object.fromEntries(OG_PREVIEW.options.split(',').map((kv) => kv.split('=')));
  assert.equal(Number(opts.width), OG_PREVIEW.width);
  assert.equal(Number(opts.height), OG_PREVIEW.height);
  assert.equal(opts.fit, 'pad', 'never crop a manuscript');
  assert.equal(opts.format, 'jpeg');
  assert.equal(OG_PREVIEW.type, 'image/jpeg');
  assert.equal(opts.onerror, 'redirect', 'fall back to the original when a transformation fails');
  assert.doesNotMatch(OG_PREVIEW.options, /[%/\s]/, 'options must be one literal path segment');
});

test('scanOgImage returns the shape Layout.astro accepts', () => {
  assert.deepEqual(scanOgImage(SCAN_DIRS.nt, 'P66', 'p66_bodmer_1.jpg'), {
    url: `${previewPrefix}images/P66/p66_bodmer_1.jpg`,
    width: 1200,
    height: 630,
    type: 'image/jpeg',
  });
});

test('likePrefix makes LIKE wildcards in ids literal', () => {
  assert.equal(likePrefix('jn_1_'), 'jn\\_1\\_%');
  assert.equal(likePrefix('2:'), '2:%');
});

test('John 1:1 verse and chapter pages preview P66', () => {
  const expected = `${previewPrefix}images/P66/p66_bodmer_1.jpg`;
  assert.equal(getBibleOgImage('jn', '1', '1', true)?.url, expected);
  assert.equal(getBibleOgImage('jn', 1, null, true)?.url, expected, 'chapter page uses verse 1; numeric chapter accepted');
});

test('OT and Qurʾān pages resolve a preview', () => {
  for (const og of [getBibleOgImage('is', '53', '5', false), getBibleOgImage('gn', '1', null, false), getQuranOgImage(1, 1), getQuranOgImage('19')]) {
    assert.ok(og?.url.startsWith(previewPrefix), JSON.stringify(og));
  }
});

test('a .png source still declares image/jpeg (the preset re-encodes)', () => {
  const [row] = query("SELECT verse_id FROM manuscript_per_verse WHERE lower(image_name) LIKE '%.png' LIMIT 1");
  assert.ok(row, 'fixture: the NT table has at least one .png scan');
  const [book, chapter, verse] = row.verse_id.split('_');
  const og = getBibleOgImage(book, chapter, verse, true);
  assert.equal(og?.type, 'image/jpeg');
});

test('chapter fallback never leaves the chapter (LIKE `_` is not a wildcard)', () => {
  // NT chapters that have scans, but none for verse 1.
  const rows = query('SELECT DISTINCT verse_id FROM manuscript_per_verse').map((r) => r.verse_id);
  const byChapter = new Map();
  for (const id of rows) {
    const [b, c, v] = id.split('_');
    const k = `${b}_${c}`;
    if (!byChapter.has(k)) byChapter.set(k, new Set());
    byChapter.get(k).add(v);
  }
  let checked = 0;
  for (const [k, verses] of byChapter) {
    if (verses.has('1')) continue;
    const [b, c] = k.split('_');
    const og = getBibleOgImage(b, c, null, true);
    const images = new Set(
      query("SELECT ms_id, image_name FROM manuscript_per_verse WHERE verse_id LIKE :p ESCAPE '\\'", { p: likePrefix(`${k}_`) })
        .map((r) => `${previewPrefix}${scanPath(SCAN_DIRS.nt, r.ms_id, r.image_name)}`)
    );
    assert.ok(images.has(og?.url), `${k}: ${og?.url} is not a scan of this chapter`);
    checked++;
  }
  assert.ok(checked > 0, 'fixture: at least one NT chapter lacks a verse-1 scan');
});

test('pages without a scan return undefined and repeated lookups are memoised', () => {
  assert.equal(getBibleOgImage('jn', '999', '1', true), undefined);
  assert.equal(getBibleOgImage('', '1', '1', true), undefined);
  assert.equal(getQuranOgImage(null, 1), undefined);
  assert.equal(getBibleOgImage('jn', '1', '1', true), getBibleOgImage('jn', '1', '1', true));
});
