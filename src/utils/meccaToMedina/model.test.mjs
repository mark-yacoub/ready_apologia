/**
 * Unit tests for the From Mecca to Medina view model (node --test).
 * The real dataset + repo corpora must build; every guard in model.js must fail the build when broken.
 * Run from the repo root (providers read src/data relative to the working directory).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CONFIG, LEGACY_ANCHORS, ITEMS, SECTIONS } from './config.js';
import { buildModel, applyQuoteFixes, leafPaths, parsePath, resolvePath } from './model.js';
import { repoProviders } from './providers.js';
import { pageSchema } from './schema.js';
import { BODY, HEADLINE, ourVoice } from './tone.js';

const DATASET = JSON.parse(fs.readFileSync('src/data/discover/islam/scripture/from_mecca_to_medina.json', 'utf8'));
const providers = repoProviders();
const build = (cfg = CONFIG, data = DATASET, prov = providers) => buildModel(data, cfg, prov);
const clone = v => structuredClone(v);
/** A config copy whose ITEMS / SECTIONS / CLOSING can be edited without touching the module. */
const cfgCopy = () => ({ ...CONFIG, ITEMS: clone(ITEMS), SECTIONS: clone(SECTIONS), CLOSING: clone(CONFIG.CLOSING), INTRO: clone(CONFIG.INTRO), EXTRA_HADITH: clone(CONFIG.EXTRA_HADITH), QUOTE_FIXES: clone(CONFIG.QUOTE_FIXES) });
const fails = (fn, re) => assert.throws(fn, err => { assert.match(err.message, re); return true; });

test('the real dataset and config build', () => {
  const m = build();
  assert.equal(m.items.length, 15);
  assert.equal(m.counts.items, 15);
  assert.equal(m.counts.meccanSuras, 86);
  assert.equal(m.counts.medinanSuras, 28);
  assert.equal(m.startHere.id, CONFIG.START_HERE);
  assert.equal(new Set(m.items.map(i => i.id)).size, 15);
  assert.ok(m.counts.sunnahRefs >= 30, 'every dataset hadith is cited');
  assert.ok(!/\{\w+\}/.test(m.seo.title + m.intro.h1 + m.items.map(i => i.title).join('')), 'placeholders are filled');
});

test('paths: parse, resolve, leaves', () => {
  assert.deepEqual(parsePath('sections[1].stages[0].name'), ['sections', 1, 'stages', 0, 'name']);
  assert.equal(parsePath('quran:4:77'), null);
  assert.equal(resolvePath(DATASET, 'sections[1].stages[0].hadithEvidence.url'), 'https://sunnah.com/nasai:3086');
  assert.ok(leafPaths(DATASET).includes('abstract.summary'));
});

test('quote fixes are applied and logged', () => {
  const { data, log, errors } = applyQuoteFixes(DATASET, CONFIG.QUOTE_FIXES);
  assert.deepEqual(errors, []);
  assert.equal(log.length, CONFIG.QUOTE_FIXES.length);
  assert.match(resolvePath(data, 'sections[1].stages[0].hadithEvidence.text'), /^It was narrated from Ibn Abbas that/);
  const muslim = ['hadiths[2]', 'hadiths[3]'].flatMap(h => [1, 2].map(k => resolvePath(data, `sections[2].subsections[2].campaigns[3].keyEvents[${k}].${h}.url`)));
  assert.deepEqual(muslim.sort(), ['https://sunnah.com/muslim:1365c', 'https://sunnah.com/muslim:1365d', 'https://sunnah.com/muslim:1365e', 'https://sunnah.com/muslim:1365f']);
  assert.ok(!/\(1[34]\) =/.test(resolvePath(data, 'sections[1].stages[3].tafsirExcerpts[0].text')));
});

test('legacy anchors all land somewhere', () => {
  const m = build();
  const placed = [m.intro, ...m.items, ...m.sections, m.closing.readToday, m.closing.textsShow, m.closing.reflection].flatMap(x => x.legacy);
  assert.deepEqual(placed.sort(), Object.keys(LEGACY_ANCHORS).sort());
});

test('JSON-LD: Article + BreadcrumbList + ItemList, no FAQPage while EMIT_FAQ is false', () => {
  const m = build();
  const s = pageSchema({ site: 'https://readyapologia.com', model: m, image: null });
  const types = s['@graph'].map(g => g['@type']);
  assert.deepEqual(types.sort(), ['Article', 'BreadcrumbList', 'ItemList']);
  assert.equal(CONFIG.EMIT_FAQ, false);
  const list = s['@graph'].find(g => g['@type'] === 'ItemList');
  assert.equal(list.numberOfItems, 15);
  assert.ok(list.itemListElement.every(e => /#[a-z0-9-]+$/.test(e.url)));
});

// ---- guards ----------------------------------------------------------------------------------

test('fails: an own path that matches nothing', () => {
  const c = cfgCopy();
  c.ITEMS['pardon-2-109'].own.push('sections[4].caseStudy.nope');
  fails(() => build(c), /matches no dataset node/);
});

test('fails: a dataset leaf left unplaced', () => {
  const c = cfgCopy();
  c.ITEMS['pardon-2-109'].own = [];
  fails(() => build(c), /dataset leaf sections\[4\]\.caseStudy\.title .* is not placed/);
});

test('fails: a dataset leaf placed twice', () => {
  const c = cfgCopy();
  c.ITEMS['who-9-29-names'].own.push('sections[4].caseStudy.title');
  fails(() => build(c), /sections\[4\]\.caseStudy\.title is placed 2 times/);
});

test('fails: an item placed twice or not at all', () => {
  const c = cfgCopy();
  c.SECTIONS[0].items.push('four-stages');
  fails(() => build(c), /item "four-stages" appears 2 times/);
  const d = cfgCopy();
  d.SECTIONS[1].items = d.SECTIONS[1].items.filter(i => i !== 'four-stages');
  fails(() => build(d), /item "four-stages" appears in no section/);
});

test('fails: an excerpt that is not verbatim', () => {
  const c = cfgCopy();
  c.ITEMS['khaybar-terms'].evidence[2].excerpt = 'The Prophet had all their warriors killed.';
  fails(() => build(c), /quote not found verbatim in Bukhārī 4200/);
});

test('fails: a showcase quote or Arabic excerpt that is not verbatim', () => {
  const c = cfgCopy();
  c.ITEMS['qurayza-judgment'].showcase.items[0].arabic = 'لَقَدْ حَكَمْتَ فِيهِمْ بِحُكْمِ اللَّهِ';
  fails(() => build(c), /Arabic excerpt not found verbatim in Bukhārī 3043/);
});

test('fails: a quote fix whose target does not match', () => {
  const c = cfgCopy();
  c.QUOTE_FIXES = [...c.QUOTE_FIXES, { ref: 'sections[1].stages[0].hadithEvidence', field: 'text', replace: [['not in the text', 'x']], reason: 'r', sourceUrl: 'https://sunnah.com/nasai:3086' }];
  fails(() => build(c), /replace target "not in the text" not found/);
  const d = cfgCopy();
  d.QUOTE_FIXES = [{ ref: 'sections[1].stages[0].nope', field: 'text', value: 'x', reason: 'r', sourceUrl: 'https://x.org' }];
  fails(() => build(d), /matches no dataset object/);
  const e = cfgCopy();
  e.QUOTE_FIXES = [{ ref: 'sections[1].stages[0].hadithEvidence', field: 'reference', value: 'Book 25, Hadith 2' }];
  fails(() => build(e), /needs a reason/);
});

test('fails: a hadith without a Sunnah.com URL, or whose label disagrees with its URL', () => {
  const data = clone(DATASET);
  data.sections[1].stages[3].hadithEvidence[0].url = 'https://example.com/bukhari/25';
  fails(() => build(CONFIG, data), /has no Sunnah\.com URL/);
  const c = cfgCopy();
  c.QUOTE_FIXES = c.QUOTE_FIXES.filter(f => !(f.field === 'collection' && /1365c/.test(f.value)));
  fails(() => build(c), /labelled "Sahih Muslim 3497" but links to https:\/\/sunnah\.com\/muslim:1365c/);
});

test('fails: a Qurʾān reference without a Meccan/Medinan label', () => {
  fails(() => build(CONFIG, DATASET, { ...providers, suraType: s => (Number(s) === 4 ? undefined : providers.suraType(s)) }), /Qurʾān 4 has no Meccan\/Medinan label/);
});

test('fails: an extra hadith that disagrees with the repo corpus', () => {
  const c = cfgCopy();
  c.EXTRA_HADITH['bukhari:3804'].text += ' (edited)';
  fails(() => build(c), /text differs from the repo corpus/);
});

test('fails: an unknown placeholder and a dangling legacy anchor', () => {
  const c = cfgCopy();
  c.ITEMS['pardon-2-109'].hook = 'Here you\u2019ll see {nothing}.';
  fails(() => build(c), /unknown placeholder \{nothing\}/);
  fails(() => build({ ...cfgCopy(), LEGACY_ANCHORS: { old: 'no-such-id' } }), /LEGACY_ANCHORS\["old"\]: target "no-such-id"/);
});

// ---- tone (playbook §2.3) ----------------------------------------------------------------------

test('our copy avoids the banned words (headings, labels and SEO also avoid the headline list)', () => {
  const heads = [];
  const body = [];
  const textParts = v => (Array.isArray(v) ? v : v ? [v] : []).flatMap(p => (typeof p === 'string' ? [p] : p?.text ? [p.text] : []));
  heads.push(CONFIG.SEO.title, CONFIG.SEO.description, CONFIG.CATALOG.title, CONFIG.CATALOG.description, CONFIG.INTRO.h1);
  heads.push(...Object.values(CONFIG.LABELS), ...Object.values(CONFIG.SHOWCASE_LABELS));
  body.push(CONFIG.INTRO.text);
  for (const s of SECTIONS) { heads.push(s.question); body.push(s.dek); }
  for (const it of Object.values(ITEMS)) {
    heads.push(it.title);
    body.push(it.hook, it.takeaway, ...textParts(it.classical), ...textParts(it.comparison));
    const sc = it.showcase || {};
    body.push(...textParts(sc.note), ...textParts(sc.unit));
    for (const p of sc.points || []) body.push(p.text || '', ...textParts(p.parts));
    for (const side of [sc.left, sc.right]) if (side) { heads.push(...textParts(side.title)); body.push(...side.items.flatMap(i => textParts(i))); }
    for (const c of it.collapsed || []) { heads.push(c.heading); body.push(c.body || ''); }
    for (const e of it.evidence || []) { if (e.heading) heads.push(e.heading); body.push(...textParts(e.note), ...textParts(e.lead)); }
  }
  const R = CONFIG.CLOSING;
  heads.push(R.readToday.title, R.textsShow.title, R.reflection.title, ...R.readToday.cards.map(c => c.who));
  body.push(R.readToday.outro, R.textsShow.intro, R.reflection.disclosure, R.reflection.note, ...R.readToday.cards.map(c => c.text));
  for (const s of [...heads, ...body]) {
    const t = ourVoice(s);
    assert.ok(!BODY.test(t), `banned word "${t.match(BODY)?.[0]}" in: ${t.slice(0, 100)}`);
  }
  for (const s of heads) {
    const t = ourVoice(s);
    assert.ok(!HEADLINE.test(t), `headline word "${t.match(HEADLINE)?.[0]}" in: ${t.slice(0, 100)}`);
  }
});

// ---- stale overrides, ids, links, shapes (code review P1-1 / P2) --------------------------------

test('fails: overrides that reach nothing (stale EXTRA_HADITH, quote fix, NOT_RENDERED, Arabic switch)', () => {
  const a = cfgCopy();
  a.EXTRA_HADITH['bukhari:1'] = { url: 'https://sunnah.com/bukhari:1', text: 'x', reason: 'r', mirror: 'https://example.org' };
  fails(() => build(a), /EXTRA_HADITH\["bukhari:1"\] is referenced by no hadith:bukhari:1 ref/);
  const b = cfgCopy();
  b.QUOTE_FIXES.push({ ref: 'meta', field: 'title', value: 'changed', reason: 'r', sourceUrl: 'https://example.org' });
  fails(() => build(b), /meta\.title is never shown on the page/);
  fails(() => build({ ...cfgCopy(), NOT_RENDERED: [...CONFIG.NOT_RENDERED, /^nope$/] }), /matches no dataset leaf \(stale\)/);
  fails(() => build({ ...cfgCopy(), NOT_RENDERED: [...CONFIG.NOT_RENDERED, /caseStudy/] }), /anchor the pattern/);
  const c = cfgCopy();
  c.ITEMS['pardon-2-109'].own.push('meta.title');
  fails(() => build(c), /meta\.title is in NOT_RENDERED but placed/);
  fails(() => build({ ...cfgCopy(), HIDE_HADITH_ARABIC: { 'muslim:1765': { corrupt: 'x', reason: 'r' } } }), /HIDE_HADITH_ARABIC\["muslim:1765"\]: no rendered evidence card/);
  fails(() => build({ ...cfgCopy(), HIDE_HADITH_ARABIC: { 'muslim:1766a': { corrupt: 'لا يوجد', reason: 'r' } } }), /no longer contains/);
});

test('fails: quote-fix replace targets must be non-empty and unique; one fix per field', () => {
  const ref = 'sections[1].stages[0].hadithEvidence';
  const a = cfgCopy();
  a.QUOTE_FIXES = a.QUOTE_FIXES.filter(f => !(f.ref === ref && f.field === 'reference'));
  a.QUOTE_FIXES.push({ ref, field: 'reference', replace: [['', '~']], reason: 'r', sourceUrl: 'https://example.org' });
  fails(() => build(a), /replace target must be a non-empty string/);
  const b = cfgCopy();
  b.QUOTE_FIXES.push({ ...clone(b.QUOTE_FIXES[0]) });
  fails(() => build(b), /already has a fix/);
  const { errors } = applyQuoteFixes({ x: { t: 'a b a' } }, [{ ref: 'x', field: 't', replace: [['a', 'c']], reason: 'r', sourceUrl: 'https://example.org' }]);
  assert.match(errors.join('\n'), /occurs 2 times/);
});

test('fails: duplicate page ids, dangling #links, //host links, unknown config keys', () => {
  const id = Object.keys(ITEMS)[0];
  fails(() => build({ ...cfgCopy(), LEGACY_ANCHORS: { ...LEGACY_ANCHORS, [`${id}-ev-1`]: id } }), /collides with a live id \(evidence card\)/);
  const a = cfgCopy();
  a.ITEMS['pardon-2-109'].hook += ' [x](#no-such-id)';
  fails(() => build(a), /link "#no-such-id" points to no id/);
  const b = cfgCopy();
  b.ITEMS['pardon-2-109'].hook += ' [x](//evil.example/p)';
  fails(() => build(b), /no \/\/host/);
  const c = cfgCopy();
  c.SECTIONS[0].deck = 'typo';
  fails(() => build(c), /SECTIONS\[0\]: unknown key "deck"/);
  const d = cfgCopy();
  const ev = Object.values(d.ITEMS).flatMap(it => it.evidence || []).find(e => e.excerpt);
  ev.exerpt = ev.excerpt;
  fails(() => build(d), /unknown key "exerpt"/);
});

// ---- rendering contracts (code review P1-3 / P1-4 / adversary) ------------------------------------

test('Check the sources keeps a verse and the commentary on it as two rows', () => {
  const m = build();
  const rows = m.sourceGroups.flatMap(g => g.items.map(s => `${g.kind}|${s.label}`));
  assert.ok(rows.includes('tafsir|al-Ṭabarī on 9:29') && rows.some(r => r.startsWith('quran|Qurʾān 9:29 ')), 'al-Ṭabarī on 9:29 and Qurʾān 9:29 both listed');
  const tafsirRefs = new Set(JSON.stringify({ ...CONFIG.ITEMS, ...CONFIG.CLOSING }).match(/tafsir:(tabari|ibn_kathir):\d+:\d+/g));
  for (const r of tafsirRefs) {
    const [, id, s, a] = r.split(':');
    assert.ok(rows.includes(`tafsir|${id === 'tabari' ? 'al-Ṭabarī' : 'Ibn Kathīr'} on ${s}:${a}`), `${r} has a row`);
  }
  assert.equal(m.citations.filter(c => c.kind === 'tafsir').length, m.counts.tafsirRefs);
});

test('source texts: markdown headings become bold lines, backtick ʿayn is shown as ʿ, quotes nest', () => {
  const m = build();
  const html = JSON.stringify(m.items);
  assert.ok(!/###/.test(html), 'no raw ### in rendered texts');
  assert.ok(/mm-quote__sub/.test(html), 'tafsīr headings render as sub lines');
  assert.ok(!html.includes('`'), 'no ASCII backtick in rendered item HTML');
  const q = m.items.find(i => i.id === 'qurayza-judgment').showcase.items.find(i => /4121/.test(i.labelHtml)).wordingHtml;
  assert.match(q, /^\u201cYou have judged according to Allah's Judgment,\u201d or said, \u201caccording to the King's judgment\u201d$/);
  // A source quote inside our quote (straight or curly) becomes ‘…’, never a doubled “ “.
  const strip = h => h.replace(/<[^>]+>/g, '');
  const texts = JSON.stringify(m.items).replace(/\\"/g, '"');
  assert.ok(!/\u201c[^\u201d]*\u201c/.test(strip(texts)), 'no doubled opening quote');
});

test('HIDE_HADITH_ARABIC hides the corpus Arabic of its card and nothing else', () => {
  const m = build();
  const cards = [...m.items.flatMap(i => [...i.evidence, ...i.collapsed.flatMap(c => c.evidence)])].filter(e => e.type === 'card');
  const muslim1766 = cards.filter(e => /Muslim 1766a/.test(e.labelHtml));
  assert.ok(muslim1766.length > 0 && muslim1766.every(e => e.hadithArabic === null));
  assert.ok(cards.some(e => e.hadithArabic), 'other cards keep their Arabic');
});

test('data proposals: every override string appears byte-identical (JSON literal)', async () => {
  // Strings are written as JSON literals (alone or inside an object/array literal), so JSON.stringify(s) must occur.
  const { generateProposals, overrideStrings } = await import('../../../scripts/gen_mecca_to_medina_data_proposals.mjs');
  const md = generateProposals();
  for (const s of overrideStrings()) assert.ok(md.includes(JSON.stringify(s)), `missing override verbatim: ${s.slice(0, 80)}`);
  for (const f of build().quoteFixLog) assert.ok(md.includes(JSON.stringify(f.after)), `missing quote fix ${f.ref}.${f.field}`);
});

test('config: no duplicate keys in the override maps (a later key would silently replace an earlier one)', () => {
  const src = fs.readFileSync('src/utils/meccaToMedina/config.js', 'utf8');
  for (const name of ['ITEMS', 'EXTRA_HADITH', 'LEGACY_ANCHORS', 'HIDE_HADITH_ARABIC']) {
    const block = (src.match(new RegExp(`^export const ${name} = \\{[\\s\\S]*?^\\};`, 'm')) || [''])[0];
    assert.ok(block, `${name} block found`);
    const keys = [...block.matchAll(/^ {2}['"]?([\w:.-]+)['"]?:/gm)].map(m => m[1]);
    const dup = keys.filter((k, i) => keys.indexOf(k) !== i);
    assert.deepEqual(dup, [], `${name} has duplicate keys`);
  }
});
