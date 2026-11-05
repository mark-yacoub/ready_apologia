/**
 * Guards for /discover/islamic-dilemma copy and data wiring.
 *   node --test src/utils/islamicDilemma/*.test.mjs
 *
 * - override keys ↔ md rows/objections (both directions)
 * - every quotation in content.js is verbatim (md, repo tafsir JSON, NASB data or the Droge
 *   translation); `…` marks an omission, so each part must appear, in order
 * - banned words (playbook §2.3) in our own voice: labels, headings, nav, hook, SEO, overrides
 * - structure: nav labels fit, glance targets exist, the H1's verse count matches §1
 * - the pre-610 whitelist has a date range for every entry
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import * as C from './config.js';
import * as T from './content.js';
import { TABLE_ROWS, ANSWERS } from './overrides.js';
import { BANNED, HEADLINE_BANNED, unquote } from './tone.js';
import { refKey, quotesIn, leadIn, mdBlockquotes, normaliseQuote, countManuscripts, checkOverrides, collectContentQuotes, highlight, readMd, resolveTarget, nestQuotes } from './model.js';

const md = readMd();
const mdNorm = normaliseQuote(md);
const readJson = p => JSON.parse(fs.readFileSync(path.join(process.cwd(), p), 'utf8'));

// Banned vocabulary (BANNED, HEADLINE_BANNED) is shared with the built-HTML audit via tone.js.
/** All our-voice strings in content.js (quotation objects excluded), with their paths. */
function ourVoice(obj, at, out = []) {
  if (typeof obj === 'string') { out.push({ path: at, text: obj }); return out; }
  if (!obj || typeof obj !== 'object') return out;
  if (typeof obj.text === 'string' && (obj.fromMd || obj.source)) return out; // a quotation
  for (const [k, v] of Object.entries(obj)) {
    if (['q', 'target', 'passage', 'kind', 'year', 'refKey', 'mss', 'key', 'url'].includes(k)) continue;
    ourVoice(v, `${at}.${k}`, out);
  }
  return out;
}

const HEADLINE_PATHS = [
  ['HEADER.h1', T.HEADER.h1],
  ['HEADER.eyebrow (without the search-name prefix)', T.HEADER.eyebrow.replace(/^The Islamic Dilemma · /, '')],
  ['SEO.title', C.SEO.title],
  ['SEO.description', C.SEO.description],
  ...Object.entries(T.SECTION_COPY).flatMap(([id, s]) => [[`SECTION_COPY.${id}.nav`, s.nav], [`SECTION_COPY.${id}.heading`, s.heading]]),
  ...T.GLANCE.map((g, i) => [`GLANCE[${i}].title`, g.title]),
  ...Object.entries(T.LABELS).filter(([, v]) => typeof v === 'string').map(([k, v]) => [`LABELS.${k}`, v]),
  ...Object.entries(TABLE_ROWS.affirm).map(([k, v]) => [`TABLE_ROWS.affirm.${k}.label`, v.label]),
  ...Object.entries(TABLE_ROWS.reference).map(([k, v]) => [`TABLE_ROWS.reference.${k}.category`, v.category]),
  ...Object.entries(ANSWERS).map(([k, v]) => [`ANSWERS.${k}.heading`, v.heading]),
];

test('override keys match md rows and every our-voice md field is overridden', () => {
  assert.deepEqual(checkOverrides(), []);
});

test('refKey / quotesIn / leadIn normalise md table cells', () => {
  assert.equal(refKey('**[Surah 5:47](quran/5/47)**'), '5:47');
  assert.equal(refKey('**[Surah 6:115](quran/6/115)** / **[Surah 18:27](quran/18/27)**'), '6:115/18:27');
  assert.equal(refKey('[Sunan Abi Dawud 4449](https://sunnah.com/abudawud:4449)'), 'abudawud:4449');
  assert.equal(refKey('Codex Sinaiticus (c. 350 AD)'), 'codex-sinaiticus');
  assert.deepEqual(quotesIn('*"a b"* ([x](tafseer/1/1)) / *"c **d**"*'), ['a b', 'c d']);
  assert.equal(leadIn('Muhammad honors it: *"q"*'), 'Muhammad honors it');
  assert.equal(leadIn('*"q"* (x)'), '');
});

test('md blockquotes resolve by verse', () => {
  const bq = mdBlockquotes(md);
  for (const q of ['5:47', '5:68', '5:43', '10:94', '6:34', '6:115', '18:27', '4:157', '4:158', '5:72', '9:30']) assert.ok(bq[q], `no blockquote for ${q}`);
});

/** True when every part of `text` between "…" omission marks appears in `hay`, in order. */
function containsVerbatim(hay, text) {
  const parts = normaliseQuote(text).split(/\s*…\s*/).filter(Boolean);
  if (!parts.length) return false;
  let at = 0;
  for (const p of parts) {
    const i = hay.indexOf(p, at);
    if (i < 0) return false;
    at = i + p.length;
  }
  return true;
}

test('verbatim check: omission marks split a quotation into ordered parts', () => {
  assert.ok(containsVerbatim('a b c d e', 'a b … d e'));
  assert.ok(!containsVerbatim('a b c d e', 'd e … a b'), 'parts must keep their order');
  assert.ok(!containsVerbatim('a b c d e', 'a b … x'), 'every part must be present');
  assert.ok(!containsVerbatim('a b c', '…'), 'an empty quotation is not verbatim');
});

test('every quotation in content.js is verbatim from its declared source', () => {
  const ik = readJson('src/data/quran/commentary/tafsir_ibn_kathir_catena.json');
  const tb = readJson('src/data/quran/commentary/tafsir_tabari_english.json');
  const droge = readJson('src/data/quran/english/droge_translation.json');
  const nasb = {};
  const quotes = collectContentQuotes();
  assert.ok(quotes.length > 20, 'expected the content quotations to be collected');
  for (const q of quotes) {
    if (q.fromMd) { assert.ok(containsVerbatim(mdNorm, q.text), `${q.path}: not verbatim in islamic_dilemma.md: "${q.text}"`); continue; }
    const s = q.source;
    if (s.tafsir) {
      const src = (s.tafsir === 'tabari' ? tb : ik)[s.key];
      assert.ok(src, `${q.path}: no ${s.tafsir} entry for ${s.key}`);
      const hay = normaliseQuote(String(src.commentary).replace(/^>\s?/gm, ''));
      assert.ok(containsVerbatim(hay, q.text), `${q.path}: not verbatim in ${s.tafsir} ${s.key}: "${q.text}"`);
    } else if (s.nasb) {
      nasb[s.nasb] ??= readJson(`src/data/scripture/nasb/${s.nasb}.json`);
      const chapter = Object.assign({}, ...(nasb[s.nasb][String(s.ch)] || []));
      const verses = [].concat(s.v).map(v => chapter[String(v)]);
      assert.ok(verses.every(Boolean), `${q.path}: no NASB ${s.nasb} ${s.ch}:${[].concat(s.v).join(',')}`);
      const hay = normaliseQuote(verses.join(' '));
      assert.ok(containsVerbatim(hay, q.text), `${q.path}: not verbatim in NASB ${s.nasb} ${s.ch}:${[].concat(s.v).join(',')}: "${q.text}" vs "${hay}"`);
    } else if (s.droge) {
      const keys = [].concat(s.droge);
      const texts = keys.map(k => droge[k]?.text);
      assert.ok(texts.every(Boolean), `${q.path}: no Droge entry for ${keys.join(', ')}`);
      assert.ok(containsVerbatim(normaliseQuote(texts.join(' ')), q.text), `${q.path}: not verbatim in Droge ${keys.join(', ')}: "${q.text}"`);
    } else {
      assert.fail(`${q.path}: unknown quotation source`);
    }
  }
});

test('no banned words in our own voice (content.js and overrides.js)', () => {
  const strings = [...ourVoice(T, 'content'), ...ourVoice(TABLE_ROWS, 'TABLE_ROWS'), ...ourVoice(ANSWERS, 'ANSWERS')];
  const hits = strings.map(s => ({ ...s, hit: unquote(s.text).match(BANNED)?.[0] })).filter(s => s.hit);
  assert.deepEqual(hits.map(h => `${h.path}: "${h.hit}"`), []);
});

test('no headline-banned words in titles, headings, labels, nav or SEO', () => {
  const hits = HEADLINE_PATHS.map(([p, v]) => [p, unquote(v).match(HEADLINE_BANNED)?.[0] || unquote(v).match(BANNED)?.[0]]).filter(([, h]) => h);
  assert.deepEqual(hits.map(([p, h]) => `${p}: "${h}"`), []);
});

test('hook: no why-question; at most one question, and it comes last (playbook: optional)', () => {
  const hook = unquote(T.HEADER.hookMd);
  assert.ok(!/\bwhy\b/i.test(hook), 'hook must not ask "why"');
  const n = (hook.match(/\?/g) || []).length;
  assert.ok(n <= 1, 'hook has at most one good-faith question');
  if (n) assert.ok(hook.trim().endsWith('?'), 'the question comes last');
});

test('structure: sections, nav labels, glance targets, passages', () => {
  const ids = C.SECTIONS.map(s => s.id);
  assert.equal(ids.length, 6);
  assert.deepEqual(C.SECTIONS.map(s => s.alias).sort(), ['stage-2', 'stage-3', 'stage-4', 'stage-5', 'stage-6', 'stage-7']);
  for (const id of ids) {
    assert.ok(T.SECTION_COPY[id]?.heading, `SECTION_COPY.${id}.heading missing`);
    assert.ok(T.SECTION_COPY[id].nav.length <= 14, `nav label too long: ${T.SECTION_COPY[id].nav}`);
  }
  for (const g of T.GLANCE) assert.ok(ids.includes(g.target), `glance target ${g.target} is not a section`);
  assert.equal(T.GLANCE.length, 4);
  for (const p of C.PASSAGES) assert.ok(T.PASSAGES_COPY[p.id]?.quote?.text, `PASSAGES_COPY.${p.id} missing`);
  // Blind title test (phase2_copy §1.1): the H1's leading count equals the verses the page leads
  // with: the Qurʾān side of the core showcase and the full evidence cards of §1. The compact
  // cards are introduced separately as "three more verses".
  const count = Number(T.HEADER.h1.match(/^(\d+)/)?.[1]);
  assert.equal(count, T.CORE.left.items.length, 'H1 verse count ≠ Qurʾān verses in the core showcase');
  assert.equal(count, T.QURAN.cards.length, 'H1 verse count ≠ full evidence cards in §1');
  assert.deepEqual(T.CORE.left.items.map(i => i.q), T.QURAN.cards.map(c => c.q), 'core showcase and §1 cards show the same verses');
});

test('highlights exist in their verse', () => {
  const rows = new Map();
  for (const line of md.split('\n')) {
    const m = line.match(/^\|\s*\*\*\[Surah (\d+:\d+)\]/);
    if (m && !rows.has(m[1])) rows.set(m[1], quotesIn(line)[0]);
  }
  for (const c of T.QURAN.cards) assert.ok(highlight(rows.get(c.q) || '', c.highlight).found, `highlight "${c.highlight}" not in ${c.q}`);
});

test('pre-610 whitelist has a date range for every manuscript, and counting ignores stored dates', () => {
  for (const [id, range] of Object.entries(C.PRE_610_MSS)) assert.ok(typeof range === 'string' && /\d/.test(range), `${id}: missing range`);
  const rows = [
    { ms_id: 'P66', earliest_date: 100 }, { ms_id: 'P66', earliest_date: 100 },
    { ms_id: '01', earliest_date: 330 }, { ms_id: '0211', earliest_date: 600 }, { ms_id: '019', earliest_date: 700 },
  ];
  const { distinct, pre, unverified } = countManuscripts(rows);
  assert.equal(distinct.length, 4);
  assert.deepEqual(pre.map(r => r.ms_id), ['P66', '01']);
  assert.deepEqual(unverified.map(r => r.ms_id), ['0211']);
});

test('link targets resolve with the shared policy (BASE-aware, Qurʾān internal)', () => {
  assert.equal(resolveTarget('quran/5/47').href, C.tafsirHref(5, 47, 'tabari'));
  assert.equal(resolveTarget('tafseer/5/68').href, C.tafsirHref(5, 68, 'ibn_kathir'));
  assert.equal(resolveTarget('ibnkathir://3/78').href, C.tafsirHref(3, 78, 'ibn_kathir'));
  assert.equal(resolveTarget('/discover').href, `${C.BASE}/discover`);
  const ext = resolveTarget('https://sunnah.com/abudawud:4449');
  assert.equal(ext.attrs.target, '_blank');
  assert.match(ext.attrs.rel, /noopener/);
});

test('view model builds with real manuscript data (skipped without node:sqlite)', async t => {
  let getManuscripts;
  try { ({ getFormattedManuscriptsByVerseId: getManuscripts } = await import('../evidence_repository.js')); } catch (e) { t.skip(`no SQLite: ${e.message}`); return; }
  const { loadIslamicDilemma, resetIslamicDilemma } = await import('./model.js');
  resetIslamicDilemma();
  const m = loadIslamicDilemma({ getManuscripts });
  // Only the known data note (0211 stored as 600 but labelled 7th–9th c.) is allowed.
  assert.deepEqual(m.warnings.filter(w => !/not counted as pre-610.*\b0211\b/.test(w)), []);
  assert.equal(m.gospel.passages.length, 4);
  for (const p of m.gospel.passages) assert.ok(p.pre610 > 0 && p.pre610 <= p.total, `${p.id}: ${p.pre610}/${p.total}`);
  assert.equal(m.quran.cards.length + m.quran.compact.length, 6);
  assert.equal(m.answers.items.length, 3);
  assert.ok(m.sources.groups.some(g => g.kind === 'sunnah'));
});

test('inner straight quotes render as single curly quotes inside our outer quotes', () => {
  assert.equal(nestQuotes('he said, "Truly this man was the Son of God!"'), 'he said, ‘Truly this man was the Son of God!’');
  assert.equal(nestQuotes('no quotes here'), 'no quotes here');
});
