/**
 * Guards for /discover/origins-of-revelation copy and data wiring.
 *   node --test src/utils/originsOfRevelation/*.test.mjs     (or: corepack yarn test:orv)
 *
 * Most guards run inside buildModel, so `astro build` enforces them; these tests prove each guard
 * fires on bad input, and add the checks that need repo files (verbatim against sourceFile) or a
 * whole-content walk (tone).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import DATA from '../../data/discover/islam/scripture/demonic_revelation.json' with { type: 'json' };
import * as C from './config.js';
import * as T from './content.js';
import { QUOTE_FIXES } from './quoteFixes.js';
import { DATA_LOCK } from './dataLock.js';
import { toneHit } from './tone.js';
import { buildModel, resolveData, quoteHtml, fill } from './model.js';
import { makeLock, lockProblems, dataPositions } from './fixes.js';
import { verbatimProblem } from './verbatim.js';
import { sourceText } from './sourceText.js';
import { refFromHref, isHadithLabel, bibleLabel } from './refs.js';
import { mdInline } from './markdown.js';

const model = buildModel(T);
const clone = () => structuredClone({ ...T });
const firstCard = c => c.SECTIONS[0].groups[0].cards;
const withCard = card => { const c = clone(); firstCard(c).push(card); return c; };

const checkVerbatim = (where, text, sourceFile, sourceKey, edits = []) => {
  let src;
  try { src = sourceText(sourceFile, sourceKey); } catch (e) { return `${where}: ${e.message}`; }
  const miss = verbatimProblem(text, src, edits);
  return miss ? `${where}: not verbatim in ${sourceFile}${sourceKey ? ` @ ${sourceKey}` : ''}: “${miss.slice(0, 90)}”` : null;
};

// ---- data lock + fixes ----------------------------------------------------------------------------
test('the data lock matches the data (re-lock only after re-reading the copy)', () => {
  assert.deepEqual(lockProblems(dataPositions(DATA).positions, DATA_LOCK), []);
  assert.deepEqual(makeLock(DATA), DATA_LOCK);
});

test('any data drift fails the build: reorder, text edit, new or removed quote', () => {
  const swap = structuredClone(DATA);
  const isl = swap.items[0].comparatives[0].islamic_quotes;
  [isl[0], isl[1]] = [isl[1], isl[0]];
  assert.throws(() => buildModel(T, { data: swap }), /data changed[\s\S]*reference was/);
  const edit = structuredClone(DATA);
  edit.items[0].comparatives[0].biblical_expectations[2].quote += ' (edited)';
  assert.throws(() => buildModel(T, { data: edit }), /quote text changed/);
  const added = structuredClone(DATA);
  added.items[0].comparatives[0].biblical_parallels.push({ reference: 'bible/mk/1/1', quote: 'x' });
  assert.throws(() => buildModel(T, { data: added }), /new data quote/);
  const removed = structuredClone(DATA);
  removed.items[0].comparatives[0].biblical_parallels.pop();
  assert.throws(() => buildModel(T, { data: removed }), /data quote removed/);
});

test('quote fixes are current, one per position, and never no-ops', () => {
  assert.doesNotThrow(() => resolveData(DATA, QUOTE_FIXES, DATA_LOCK));
  const keys = QUOTE_FIXES.map(f => `${f.itemId}/${f.group}/${f.index}`);
  assert.equal(new Set(keys).size, keys.length);
  const f = QUOTE_FIXES.find(x => x.newQuote !== x.oldQuote);
  assert.throws(() => resolveData(DATA, [{ ...f, oldQuote: `${f.oldQuote} (changed)` }]), /stale quote fix/);
  assert.throws(() => resolveData(DATA, [{ ...f, oldReference: 'https://sunnah.com/bukhari:1' }]), /stale quote fix/);
  assert.throws(() => resolveData(DATA, [{ ...f, index: 999 }]), /does not exist/);
  assert.throws(() => resolveData(DATA, [f, f]), /two quote fixes/);
  assert.throws(() => resolveData(DATA, [{ ...f, newQuote: f.oldQuote, newReference: f.oldReference, displayLabel: null }]), /changes nothing/);
  assert.throws(() => resolveData(DATA, [{ ...f, quote: 'alias' }]), /unknown field "quote"/);
  // Already applied upstream: the data now holds the new text.
  const applied = structuredClone(DATA);
  const item = applied.items.find(it => it.id === f.itemId);
  item.comparatives[0][f.group][f.index] = { ...item.comparatives[0][f.group][f.index], reference: f.newReference, quote: f.newQuote };
  assert.throws(() => resolveData(applied, [f]), /already applied/);
  // A scripture fix must link where its verified source is.
  const sf = QUOTE_FIXES.find(x => /src\/data\/scripture\//.test(x.sourceFile || ''));
  if (sf) assert.throws(() => resolveData(DATA, [{ ...sf, sourceKey: '1:1' }]), /disagrees with its source/);
});

test('every fixed quote is verbatim in its repo source (external ones are on the reviewed list)', () => {
  const problems = [];
  for (const f of QUOTE_FIXES.filter(x => x.newQuote !== x.oldQuote)) {
    const k = `fix:${f.itemId}/${f.group}/${f.index}`;
    if (!f.sourceFile || f.sourceFile === 'external') { if (!C.EXTERNAL_VERIFIED[k]) problems.push(`${k}: external text not in config.EXTERNAL_VERIFIED`); continue; }
    const p = checkVerbatim(k, f.newQuote, f.sourceFile, f.sourceKey, f.edits);
    if (p) problems.push(p);
  }
  assert.deepEqual(problems, []);
});

test('EXTRA_QUOTES texts are verbatim in their repo sources (external ones are on the reviewed list)', () => {
  const problems = [];
  for (const [k, x] of Object.entries(T.EXTRA_QUOTES || {})) {
    if (x.sourceFile === 'external') { if (!C.EXTERNAL_VERIFIED[`extra:${k}`]) problems.push(`extra:${k}: external text not in config.EXTERNAL_VERIFIED`); continue; }
    const p = checkVerbatim(`EXTRA_QUOTES.${k}`, x.text, x.sourceFile, x.sourceKey, x.edits || []);
    if (p) problems.push(p);
    if (x.arabic && x.arabicSourceFile) {
      const a = checkVerbatim(`EXTRA_QUOTES.${k}.arabic`, x.arabic, x.arabicSourceFile, x.arabicSourceKey);
      if (a) problems.push(a);
    }
  }
  const listed = Object.keys(C.EXTERNAL_VERIFIED);
  const live = [...QUOTE_FIXES.filter(f => f.sourceFile === 'external').map(f => `fix:${f.itemId}/${f.group}/${f.index}`), ...Object.entries(T.EXTRA_QUOTES).filter(([, x]) => x.sourceFile === 'external').map(([k]) => `extra:${k}`)];
  for (const k of listed) if (!live.includes(k)) problems.push(`config.EXTERNAL_VERIFIED lists ${k}, which is no longer used`);
  assert.deepEqual(problems, []);
});

// ---- placements and wiring -----------------------------------------------------------------------
test('every data quote is placed exactly once (or as listed in REPEATS)', () => {
  const dataCards = model.sections.flatMap(s => s.groups.flatMap(g => [...g.cards, ...g.collapsed])).filter(e => /-(isl|par|exp)-\d+$/.test(e.anchor));
  const extraRepeats = (T.REPEATS || []).reduce((n, r) => n + r.sections.length - 1, 0);
  assert.equal(model.positions.size, dataPositions(DATA).positions.size);
  assert.equal(dataCards.length, model.positions.size + extraRepeats);
});

test('wiring errors fail the build', () => {
  const d0 = firstCard(T)[0].data;
  assert.throws(() => buildModel(withCard({ data: { ...d0, index: 99 } })), /does not exist/);
  assert.throws(() => buildModel(withCard({ extra: 'no-such-key' })), /unknown EXTRA_QUOTES key/);
  assert.throws(() => buildModel(withCard({ data: d0 })), /placed 2 times/);
  assert.throws(() => buildModel(withCard({ data: d0, extra: Object.keys(T.EXTRA_QUOTES)[0] })), /exactly one source/);
  const dropped = clone(); firstCard(dropped).shift();
  assert.throws(() => buildModel(dropped), /not placed on the page/);
  const badAlias = clone(); badAlias.SECTIONS[0].aliases = ['suicidal-despair'];
  assert.throws(() => buildModel(badAlias), /alias/);
  const noAlias = clone(); noAlias.SECTIONS[0].aliases = [];
  assert.throws(() => buildModel(noAlias), /has no alias anchor/);
  const badItem = clone(); badItem.SECTIONS[0].dataItemId = 'suicidal-despair';
  assert.throws(() => buildModel(badItem), /dataItemId/);
  const order = clone(); [order.SECTIONS[0], order.SECTIONS[1]] = [order.SECTIONS[1], order.SECTIONS[0]];
  assert.throws(() => buildModel(order), /SECTIONS ids must be/);
  if (T.REPEATS?.length) {
    const rp = clone(); rp.REPEATS = [{ ...rp.REPEATS[0], sections: [rp.REPEATS[0].sections[0], 'hira'] }];
    assert.throws(() => buildModel(rp), /listed in REPEATS/);
    const dupRp = clone(); dupRp.REPEATS = [dupRp.REPEATS[0], dupRp.REPEATS[0]];
    assert.throws(() => buildModel(dupRp), /twice/);
  }
});

test('the copy contract is closed and labels are required', () => {
  const typo = clone(); typo.SECTIONS[0].evaluationMD = typo.SECTIONS[0].evaluationMd; delete typo.SECTIONS[0].evaluationMd;
  assert.throws(() => buildModel(typo), /unknown field "evaluationMD"/);
  const cardTypo = clone(); firstCard(cardTypo)[0] = { ...firstCard(cardTypo)[0], lable: 'x' };
  assert.throws(() => buildModel(cardTypo), /unknown field "lable"/);
  for (const k of ['repeatNote', 'copyLink', 'moreParallels', 'coldContext', 'verifyAria']) {
    const c = clone(); delete c.LABELS[k];
    assert.throws(() => buildModel(c), new RegExp(`LABELS\\.${k} is required`));
  }
  const g = clone(); delete g.LABELS.sourcesGroups.bible;
  assert.throws(() => buildModel(g), /LABELS\.sourcesGroups\.bible is required/);
  assert.throws(() => fill('x {nope}', { n: 1 }), /unknown placeholder/);
  assert.throws(() => fill(undefined, {}), /missing/);
  const exp = clone(); exp.SEO.extra = 'x';
  assert.throws(() => buildModel(exp), /unknown field "extra"/);
});

test('link policy: protocol-relative, non-https, unknown hosts, hadith labels and in-page anchors', () => {
  const md = (text) => { const c = clone(); c.SECTIONS[0].classicalMd = text; return () => buildModel(c); };
  assert.throws(md('See [x](//evil.example/x).'), /protocol-relative/);
  assert.throws(md('See [x](http://sunnah.com/bukhari:3).'), /must be https/);
  assert.throws(md('See [x](https://blog.example.com/a).'), /not in config\.HOSTS/);
  assert.throws(md('See [Sahih al-Bukhari 3](https://islamweb.net/x).'), /must link to Sunnah\.com/);
  assert.throws(md('See [above](#no-such-anchor).'), /missing anchors/);
  assert.throws(md('See [Rev 1:17](/bible/rev/1#17).'), /unknown Bible book id "rev"/);
  assert.doesNotThrow(md('See [Bukhārī 3](https://sunnah.com/bukhari:3) and [section 2](#what-they-saw).'));
  assert.ok(isHadithLabel('Sahih al-Bukhari 3') && isHadithLabel('Ṣaḥīḥ Muslim 160a') && isHadithLabel('Bukhari 3') && !isHadithLabel('al-Nawawī on Muslim 2114'));
  assert.throws(() => refFromHref('https://example.com/muslim', 'Sahih Muslim 2334'), /not in config\.HOSTS|Sunnah\.com/);
  // External links in copy get the one link policy (new tab, noopener).
  assert.match(mdInline('[x](https://sunnah.com/bukhari:3)'), /target="_blank" rel="noopener noreferrer"/);
  assert.doesNotMatch(mdInline('[x](/quran/22/52/tafsir/tabari)'), /target=/);
});

test('scripture EXTRA_QUOTES: label, href and source key agree', () => {
  const k = Object.keys(T.EXTRA_QUOTES).find(x => /src\/data\/scripture\//.test(T.EXTRA_QUOTES[x].sourceFile));
  const badHref = clone(); badHref.EXTRA_QUOTES[k].href = badHref.EXTRA_QUOTES[k].href.replace(/\/(\d+)#/, (_, c) => `/${+c + 1}#`);
  assert.throws(() => buildModel(badHref), /disagrees with its source/);
  const badLabel = clone(); badLabel.EXTRA_QUOTES[k].label = 'Genesis 1:1';
  assert.throws(() => buildModel(badLabel), /disagrees with its source/);
});

test('showcase and witness excerpts must be verbatim in the quotation they cite (enforced by the build)', () => {
  const c = clone();
  const it = c.SECTIONS.flatMap(s => s.showcase?.left?.items || []).find(x => x.ref?.data);
  it.textMd = '“words that are not in the source at all”';
  assert.throws(() => buildModel(c), /not verbatim/);
  const arWit = model.sections.flatMap(s => s.witnesses?.items || []).filter(w => /[\u0600-\u06FF]/.test(w.quoteHtml));
  assert.ok(arWit.length >= 2);
  for (const w of arWit) assert.match(w.glossHtml, /English rendering of the Arabic/, `${w.name}: Arabic witness has English glossHtml`);
});

test('every EXTRA_QUOTES entry is used (enforced by the build)', () => {
  const c = clone();
  c.EXTRA_QUOTES.unused = { text: 'x', href: '/bible/jn/1#1', sourceFile: 'src/data/scripture/nasb/jn.json', sourceKey: '1:1', label: 'John 1:1' };
  assert.throws(() => buildModel(c), /not used on the page: unused/);
});

// ---- rendering -----------------------------------------------------------------------------------
test('quotation display: ASCII ʿayn → ʿ, other backticks literal, no links from data, \\\' unescaped', () => {
  assert.equal(quoteHtml('Narrated Ibn `Abbas: The Prophet'), 'Narrated Ibn <span class="hrv-tlm">ʿ</span>Abbas: The Prophet');
  assert.match(quoteHtml('Mu`awiya said'), /Mu<span class="hrv-tlm">ʿ<\/span>awiya/);
  assert.equal(quoteHtml('a ` b'), 'a ` b');
  assert.ok(!/hrv-chain/.test(quoteHtml('`x` and `y`')));
  assert.ok(!/<a\b/.test(quoteHtml('see [this](https://sunnah.com/bukhari:3) and [that](/bible/jn/1#1)')), 'data quotes never become links');
  assert.equal(quoteHtml("said, \"\\'HE WILL\\'\""), "said, &quot;'HE WILL'&quot;");
  assert.ok(DATA.items.some(it => JSON.stringify(it).includes('Ibn `Abbas')), 'the stored data keeps the ASCII form');
  assert.equal(verbatimProblem('Ibn ʿAbbas said', 'Ibn `Abbas said'), null);
});

test('verbatim matching is on word boundaries', () => {
  assert.notEqual(verbatimProblem('he', 'the cat'), null);
  assert.notEqual(verbatimProblem('ah sent down', 'Allah sent down'), null);
  assert.equal(verbatimProblem('Allah sent … the cat', 'Allah sent down; and the cat'), null);
  assert.equal(verbatimProblem('the is here', 'the latter replied the is here', ['the is -> he is']), 'the is here');
});

test('card numbers count open cards only (no gaps behind closed disclosures)', () => {
  for (const s of model.sections) {
    const open = s.groups.flatMap(g => g.cards.map(e => e.n));
    assert.deepEqual(open, open.map((_, i) => i + 1), `${s.id}: open cards numbered 1..n`);
    for (const g of s.groups) for (const e of g.collapsed) assert.equal(e.n, null, `${s.id}: collapsed cards are not numbered`);
  }
});

test('optional classical / evaluation deeper text renders as a collapsed disclosure with its own label', () => {
  const c = clone();
  c.SECTIONS[1].classicalDeeperMd = 'More classical text.';
  c.SECTIONS[1].evaluationDeeperMd = 'More comparison.';
  const m = buildModel(c);
  assert.match(m.sections[1].classical.deeper.html, /More classical text/);
  assert.equal(m.sections[1].classical.deeper.summary, T.LABELS.classicalDeeper || T.LABELS.deeper);
  assert.match(m.sections[1].evaluation.deeper.html, /More comparison/);
});

test('Bible labels: LXX numbering with the MT number first, ranges across MT chapters keep both', () => {
  assert.equal(bibleLabel('ps', 90, 11, 12), 'Psalm 91:11–12 (LXX 90:11–12)');
  assert.equal(bibleLabel('mk', 9, 17, 18), 'Mark 9:17–18');
  assert.equal(bibleLabel('1kgs', 19, 4, 7), '1 Kings 19:4–7');
});

// ---- tone (generic walk of the copy; quotations and references excluded) ---------------------------
const SKIP = new Set(['textMd', 'quoteMd', 'ref', 'data', 'extra', 'href', 'url', 'id', 'aliases', 'dataItemId', 'key', 'sourceFile', 'sourceKey', 'text', 'arabic', 'lang', 'note', 'edits', 'arabicSourceFile', 'arabicSourceKey', 'keywords', 'number', 'itemId', 'group', 'index', 'sections']);
const HEADLINE = new Set(['nav', 'h2', 'title', 'label', 'caption', 'collapsedSummary', 'summary', 'whosWhoSummary', 'heading', 'eyebrow', 'h1', 'name', 'position', 'ogAlt', 'description', 'chips']);
function walk(v, path, out, headline = false) {
  if (typeof v === 'string') { out.push([path, v, headline]); return; }
  if (Array.isArray(v)) { v.forEach((x, i) => walk(x, `${path}[${i}]`, out, headline)); return; }
  if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) if (!SKIP.has(k)) walk(x, `${path}.${k}`, out, headline || HEADLINE.has(k) || path === 'LABELS');
}
const voice = [];
for (const k of ['SEO', 'CATALOG', 'HEADER', 'LABELS', 'SECTIONS', 'CLOSING', 'EXTRA_QUOTES']) walk(T[k], k, voice, ['SEO', 'CATALOG'].includes(k));

test('banned words are absent from our voice (body list everywhere; headline list in titles, labels, headings)', () => {
  const hits = voice.map(([p, v, h]) => [p, toneHit(v, { headline: h })]).filter(([, h]) => h).map(([p, h]) => `${p}: "${h}"`);
  assert.deepEqual(hits, []);
});

test('"Satanic verses" appears only in SEO keywords, never in our voice', () => {
  assert.deepEqual(voice.filter(([, v]) => /satanic verses/i.test(v.replace(/“[^”]*”/g, ''))).map(([p]) => p), []);
});

// ---- structure -----------------------------------------------------------------------------------
const WORD_NUM = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7 };
test('the H1 count = numbered accounts = glance rows; the method section is not numbered', () => {
  const m = T.HEADER.h1.match(/\b(\d+|one|two|three|four|five|six|seven)\b/i);
  assert.ok(m, 'H1 states a count');
  const n = /\d/.test(m[1]) ? Number(m[1]) : WORD_NUM[m[1].toLowerCase()];
  const accounts = T.SECTIONS.filter(s => s.dataItemId).length;
  assert.equal(n, accounts);
  assert.equal(model.itemCount, accounts);
  assert.equal(model.glance.length, accounts);
  assert.equal(model.sections.find(s => s.id === 'testing-spirits').n, null);
});

test('no `rev` Bible ids; every Bible link uses a real book id', () => {
  assert.ok(!/\/bible\/rev\//.test(JSON.stringify(T)));
  const hrefs = [...model.sources.flatMap(g => g.items.map(i => i.href)), ...model.sections.flatMap(s => s.groups.flatMap(g => [...g.cards, ...g.collapsed].flatMap(e => e.chips.map(c => c.href))))];
  assert.ok(!hrefs.some(h => /\/bible\/rev\//.test(h)));
  assert.ok(hrefs.filter(h => /\/bible\//.test(h)).length > 10);
});

test('aliases cover all six old ids, each on its own new section', () => {
  assert.deepEqual(Object.fromEntries(T.SECTIONS.flatMap(s => (s.aliases || []).map(a => [a, s.id]))), C.OLD_IDS);
  assert.deepEqual(T.SECTIONS.map(s => s.id), C.SECTION_ORDER);
});

test('nav labels are short; chip labels are readable (no raw codes or URLs)', () => {
  for (const s of T.SECTIONS) assert.ok([...s.nav].length <= 18, `nav label too long: ${s.nav}`);
  const labels = model.sections.flatMap(s => s.groups.flatMap(g => [...g.cards, ...g.collapsed].flatMap(e => e.chips.map(c => c.label))));
  for (const l of labels) {
    assert.ok(!/^[A-Z0-9]{2,6} \d/.test(l), `raw book code: ${l}`);
    assert.ok(!/https?:|\/\//.test(l), `URL as label: ${l}`);
  }
});
