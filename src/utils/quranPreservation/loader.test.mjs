// npm run test:quran-preservation  (node --test src/utils/quranPreservation/loader.test.mjs; any cwd)
// Guards /discover/quran-preservation: the build must fail loudly when config and dataset drift
// apart (no silently dropped content, no item shown twice, no excerpt that is not in its source),
// and reader-facing copy in our own voice must avoid the playbook's banned words.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CONFIG, ITEMS, SECTIONS, INTRO, SUMMARY, LABELS, SEO, CLOSING, SHOWCASE_LABELS, QIRAAT_CATEGORY_LABELS } from './config.js';
import { buildModel, parsePath, resolvePath, coverageUniverse } from './model.js';
import { BODY, HEADLINE } from './tone.js';

// Resolved from this file, not the cwd, so the test runs from any directory.
const DATA = new URL('../../data/discover/islam/scripture/quran_preservation.json', import.meta.url);
const PUBLIC = new URL('../../../public/', import.meta.url);
const load = () => JSON.parse(fs.readFileSync(DATA, 'utf8'));

// ---- small fixture: 2 stages, 3 hadiths ---------------------------------------------------------
const fixture = () => [
  { title: 'Intro', content: 'Intro text', children: [], hadiths: [] },
  {
    title: 'Stage',
    content: 'Stage text',
    hadiths: [],
    children: [
      { title: 'A', content: 'a', hadiths: [{ reference: '[Sahih Muslim 1](https://sunnah.com/muslim:1)', english_text: 'He said: **the first words** were heard.', arabic_text: 'قَالَ الأَوَّلُ' }] },
      { title: 'B', content: 'b', hadiths: [
        { reference: '[Sahih al-Bukhari 2](https://sunnah.com/bukhari:2)', english_text: 'The second report [our note].', arabic_text: 'الثَّانِي' },
        { reference: '[Sahih al-Bukhari 2](https://sunnah.com/bukhari:2)', english_text: 'A second excerpt.', arabic_text: 'الثَّانِي ثَانِيًا' },
      ] },
    ],
  },
];
const fixtureConfig = () => ({
  BASE: '',
  LABELS: { ...LABELS },
  SHOWCASE_LABELS: { ...SHOWCASE_LABELS },
  SOURCE_GROUPS: CONFIG.SOURCE_GROUPS,
  SEO: { title: 'T', description: 'D', keywords: '', breadcrumb: 'B' },
  INTRO: { source: ['[0]'], h1: 'H', text: 'Intro {items}' },
  START_HERE: 'one',
  SECTIONS: [{ id: 'sec', source: ['[1]'], question: 'Q?', dek: { text: 'Dek' }, items: ['two'] }],
  ITEMS: {
    one: {
      source: ['[1].children[0]'], title: 'One', hook: 'Hook?', takeaway: 'Take.',
      showcase: { type: 'facts', items: [{ quote: 'the first words were heard', ref: '[1].children[0].hadiths[0]' }] },
    },
    two: {
      source: ['[1].children[1]'], title: 'Two', hook: 'Hook?', takeaway: 'Take.',
      evidence: ['[1].children[1].hadiths[0]', '[1].children[1].hadiths[1]'],
      quoteFixes: [{ ref: '[1].children[1].hadiths[0]', field: 'english', strip: 'brackets', reason: 'ours' }],
    },
  },
  CLOSING: { source: [], id: 'closing', disclosure: 'x', reflectionTitle: 'r', reflectionBody: 'b' },
  LEGACY_ANCHORS: { 'stage-1': 'sec' },
  INTENTIONALLY_MERGED: { '[1].children[1].hadiths[1]': { into: '[1].children[1].hadiths[0]', mode: 'parts', why: 'two excerpts' } },
  QIRAAT_CATEGORY_LABELS: {},
});
const failsWith = (cfg, data, re) => assert.throws(() => buildModel(data, cfg), err => re.test(err.message), `expected an error matching ${re}`);

test('paths parse and resolve like JS property access', () => {
  assert.deepEqual(parsePath('[5].children[0].hadiths[1]'), [5, 'children', 0, 'hadiths', 1]);
  assert.equal(parsePath('5.children'), null);
  assert.equal(parsePath('[1]children'), null);
  const d = fixture();
  assert.equal(resolvePath(d, '[1].children[0].title'), 'A');
  assert.equal(resolvePath(d, '[1].children[9]'), undefined);
  assert.deepEqual(coverageUniverse(d), ['[0]', '[1]', '[1].children[0]', '[1].children[0].hadiths[0]', '[1].children[1]', '[1].children[1].hadiths[0]', '[1].children[1].hadiths[1]']);
});

test('the fixture config builds', () => {
  const m = buildModel(fixture(), fixtureConfig());
  assert.equal(m.items.length, 2);
  assert.equal(m.items[0].isStart, true);
  assert.equal(m.items[1].evidence.length, 2);
  assert.match(m.items[1].evidence[0].labelHtml, /excerpt 1 of 2/);
  assert.doesNotMatch(m.items[1].evidence[0].quote.englishHtml, /our note/, 'strip brackets quote fix applied');
  assert.deepEqual(m.sections[0].legacy, ['stage-1']);
});

test('the real dataset and config build, with the counts the copy relies on', () => {
  const m = buildModel(load(), CONFIG);
  assert.equal(m.counts.items, 18);
  assert.equal(m.counts.qiraatPairs, 20);
  assert.equal(m.counts.sanaaRows, 3);
  // 22 hadith quoted from the dataset, plus every hadith our prose links to: "Check the sources" lists them all.
  const proseSunnah = new Set(JSON.stringify(CONFIG.ITEMS).match(/https:\/\/sunnah\.com\/[a-z]+[:/][\w./-]+/g) || []);
  assert.ok(m.counts.sunnahRefs >= 22 && m.counts.sunnahRefs >= proseSunnah.size, `sunnahRefs ${m.counts.sunnahRefs}`);
  const kinds = m.sourceGroups.map(g => g.kind);
  assert.ok(kinds.includes('classical'), 'IslamWeb commentaries cited in prose are listed');
  assert.ok(m.sourceGroups.find(g => g.kind === 'quran').items.some(s => /15\/9\//.test(s.href)), '15:9 from the intro is listed');
  assert.ok(m.startHere && m.startHere.id === 'aisha-suckling-verse');
});

// ---- boundary shape checks (review P1-3 / P1-4) -------------------------------------------------
test('fails when a rendered hadith has no Sunnah.com URL or no English', () => {
  let d = fixture();
  d[1].children[0].hadiths[0].reference = 'Sahih Muslim 1 (no link)';
  failsWith(fixtureConfig(), d, /\[1\]\.children\[0\]\.hadiths\[0\] has no Sunnah\.com URL/);
  d = fixture();
  d[1].children[1].hadiths[1].english_text = '  ';
  failsWith(fixtureConfig(), d, /\[1\]\.children\[1\]\.hadiths\[1\] has no English text/);
});
test('fails on an unknown {placeholder}, including source counts used before they exist', () => {
  let cfg = fixtureConfig();
  cfg.ITEMS.one.title = 'One of {nope}';
  failsWith(cfg, fixture(), /unknown placeholder \{nope\}/);
  cfg = fixtureConfig();
  cfg.ITEMS.two.hook = 'All {sunnahRefs} reports?';
  failsWith(cfg, fixture(), /unknown placeholder \{sunnahRefs\}/);
});
test('quote fixes are well formed: Arabic needs a value or hide: true; href must be Sunnah.com', () => {
  let cfg = fixtureConfig();
  cfg.ITEMS.two.quoteFixes = [{ ref: '[1].children[1].hadiths[0]', field: 'arabic', value: null, reason: 'r' }];
  failsWith(cfg, fixture(), /an Arabic fix needs a non-empty `value`, or `hide: true`/);
  cfg = fixtureConfig();
  cfg.ITEMS.two.quoteFixes = [{ ref: '[1].children[1].hadiths[0]', field: 'href', value: 'https://example.com/x', reason: 'r' }];
  failsWith(cfg, fixture(), /href fix "https:\/\/example\.com\/x" is not a https:\/\/sunnah\.com/);
  cfg = fixtureConfig();
  cfg.ITEMS.two.quoteFixes = [{ ref: '[1].children[1].hadiths[0]', field: 'arabic', hide: true, reason: 'r' }];
  const m = buildModel(fixture(), cfg);
  assert.ok(m.items[1].evidence[0].quote.rawHtml, 'hide: true renders the card without Arabic');
});
test('a label quote fix applies only to the item\u2019s own evidence', () => {
  const cfg = fixtureConfig();
  cfg.ITEMS.one.quoteFixes = [{ ref: 'Bukhārī 2', field: 'english', value: 'x', reason: 'r' }];
  failsWith(cfg, fixture(), /reference "Bukhārī 2" matches no hadith in this item's evidence/);
});
test('every image needs alt, credit and intrinsic width/height', () => {
  const img = { src: '/images/x.jpg', alt: 'A', caption: 'C', credit: 'Photo: P', width: 10, height: 10 };
  let cfg = fixtureConfig();
  cfg.ITEMS.one.images = [{ ...img, credit: '' }];
  failsWith(cfg, fixture(), /images\[0\]: every image needs a credit/);
  cfg = fixtureConfig();
  cfg.ITEMS.one.images = [{ ...img, width: undefined }];
  failsWith(cfg, fixture(), /images\[0\]: give the image's intrinsic width and height/);
});
test('Qurʾān links in the intro and closing reach "Check the sources"', () => {
  const cfg = fixtureConfig();
  cfg.INTRO = { ...cfg.INTRO, text: 'Intro {items} [quran/2/106]' };
  cfg.CLOSING = { ...cfg.CLOSING, reflectionBody: 'See [quran/4/82].' };
  const m = buildModel(fixture(), cfg);
  const quran = m.sourceGroups.find(g => g.kind === 'quran');
  assert.deepEqual(quran?.items.map(s => s.label), ['Qurʾān 2:106', 'Qurʾān 4:82']);
  assert.equal(m.counts.quranRefs, 2);
});

/** Intrinsic size of a baseline/progressive JPEG or a PNG, read from the file header. */
function imageSize(buf) {
  if (buf.readUInt32BE(0) === 0x89504e47) return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  let i = 2;
  while (i < buf.length) {
    const marker = buf[i + 1];
    const len = buf.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    i += 2 + len;
  }
  return null;
}
test('every configured image exists in public/ with the configured width and height', () => {
  for (const [id, it] of Object.entries(ITEMS)) {
    for (const [i, im] of (it.images || []).entries()) {
      const file = new URL(im.src.replace(/^\//, ''), PUBLIC);
      assert.ok(fs.existsSync(file), `${id}.images[${i}]: ${im.src} is missing from public/`);
      assert.deepEqual(imageSize(fs.readFileSync(file)), { width: im.width, height: im.height }, `${id}.images[${i}]: width/height must match ${im.src}`);
    }
  }
});

// ---- failure mode 1: a config key or path matches no data node ---------------------------------
test('fails when a source path matches no data node', () => {
  const cfg = fixtureConfig();
  cfg.ITEMS.one.source = ['[1].children[7]'];
  failsWith(cfg, fixture(), /source\[0\]: path \[1\]\.children\[7\] matches no dataset node/);
});
test('fails when a showcase ref, evidence path or quote-fix ref matches no data node', () => {
  let cfg = fixtureConfig();
  cfg.ITEMS.one.showcase.items[0].ref = '[1].children[0].hadiths[4]';
  failsWith(cfg, fixture(), /matches no dataset node/);
  cfg = fixtureConfig();
  cfg.ITEMS.two.evidence = ['[1].children[1].hadiths[0]', '[1].children[1].hadiths[1]', '[1].children[1].hadiths[2]'];
  failsWith(cfg, fixture(), /evidence\[2\]: path .* matches no dataset node/);
  cfg = fixtureConfig();
  cfg.ITEMS.two.quoteFixes = [{ ref: 'Bukhārī 999', field: 'english', value: 'x', reason: 'y' }];
  failsWith(cfg, fixture(), /reference "Bukhārī 999" matches no hadith/);
});
test('fails when a section names an item that ITEMS does not define, or a legacy anchor points nowhere', () => {
  let cfg = fixtureConfig();
  cfg.SECTIONS[0].items.push('ghost');
  failsWith(cfg, fixture(), /item "ghost" is not defined in ITEMS/);
  cfg = fixtureConfig();
  cfg.LEGACY_ANCHORS = { 'stage-9': 'nowhere' };
  failsWith(cfg, fixture(), /LEGACY_ANCHORS\["stage-9"\]: target "nowhere"/);
});
test('fails when a showcase excerpt is not verbatim in its source', () => {
  const cfg = fixtureConfig();
  cfg.ITEMS.one.showcase.items[0].quote = 'the first word was heard';
  failsWith(cfg, fixture(), /quote not found verbatim/);
  const cfg2 = fixtureConfig();
  cfg2.ITEMS.one.showcase.items[0] = { arabic: 'قَالَ الآخِرُ', ref: '[1].children[0].hadiths[0]' };
  failsWith(cfg2, fixture(), /Arabic excerpt not found verbatim/);
});

// ---- failure mode 2: an item placed zero or two times ------------------------------------------
test('fails when an item appears in no section', () => {
  const cfg = fixtureConfig();
  cfg.SECTIONS[0].items = [];
  failsWith(cfg, fixture(), /item "two" appears in no section/);
});
test('fails when an item appears twice (two sections, or START_HERE and a section)', () => {
  let cfg = fixtureConfig();
  cfg.SECTIONS.push({ id: 'sec2', source: [], question: 'Q2?', items: ['two'] });
  failsWith(cfg, fixture(), /item "two" appears 2 times/);
  cfg = fixtureConfig();
  cfg.SECTIONS[0].items.push('one');
  failsWith(cfg, fixture(), /item "one" appears 2 times: START_HERE, SECTIONS\["sec"\]/);
});

// ---- failure mode 3: dataset content not reachable --------------------------------------------
test('fails when a dataset child or hadith is reachable from no item', () => {
  const d = fixture();
  d[1].children.push({ title: 'New child', content: 'c', hadiths: [{ reference: '[Sahih Muslim 3](https://sunnah.com/muslim:3)', english_text: 'e', arabic_text: 'ع' }] });
  failsWith(fixtureConfig(), d, /dataset node \[1\]\.children\[2\] \("New child"\) is not reachable/);
  failsWith(fixtureConfig(), d, /\[1\]\.children\[2\]\.hadiths\[0\] .* is not reachable/);
});
test('fails when a new top-level stage is not claimed', () => {
  const d = fixture();
  d.push({ title: 'Stage 3', content: 'x', children: [], hadiths: [] });
  failsWith(fixtureConfig(), d, /dataset node \[2\] \("Stage 3"\) is not reachable/);
});
test('the same Sunnah.com page twice in one item needs an INTENTIONALLY_MERGED parts entry', () => {
  const cfg = fixtureConfig();
  cfg.INTENTIONALLY_MERGED = {};
  failsWith(cfg, fixture(), /Bukhārī 2 is already shown in this item/);
});
test('a node listed as dropped may not be rendered, and the kept copy must be rendered', () => {
  let cfg = fixtureConfig();
  cfg.INTENTIONALLY_MERGED = { '[1].children[1].hadiths[1]': { into: '[1].children[1].hadiths[0]', mode: 'drop', why: 'dup' } };
  failsWith(cfg, fixture(), /listed in INTENTIONALLY_MERGED as dropped but is rendered/);
  cfg = fixtureConfig();
  cfg.ITEMS.two.evidence = ['[1].children[1].hadiths[1]'];
  cfg.INTENTIONALLY_MERGED = { '[1].children[1].hadiths[0]': { into: '[1].children[0].hadiths[0]', mode: 'drop', why: 'dup' } };
  cfg.ITEMS.one.evidence = [];
  failsWith(cfg, fixture(), /kept copy \[1\]\.children\[0\]\.hadiths\[0\] is not rendered anywhere/);
});

// ---- voice: banned words in our own copy (playbook §2 rule 3) ---------------------------------
// BODY / HEADLINE come from ./tone.js (shared with scripts/test_quran_preservation.mjs).

/** Every string in a showcase spec that is our voice (not `quote` / `arabic` excerpts). */
function ourShowcaseText(sc, where) {
  const out = [];
  const walk = (v, path) => {
    if (v == null) return;
    if (typeof v === 'string') { out.push([path, v]); return; }
    if (Array.isArray(v)) { v.forEach((x, i) => walk(x, `${path}[${i}]`)); return; }
    if (typeof v === 'object') {
      for (const [k, x] of Object.entries(v)) {
        if (['quote', 'arabic', 'mark', 'ref', 'from', 'type', 'builder', 'value', 'evidence'].includes(k)) continue;
        walk(x, `${path}.${k}`);
      }
    }
  };
  walk(sc, where);
  return out;
}

function readerStrings() {
  const body = [];
  const head = [];
  const text = v => (v && typeof v === 'object' && 'text' in v ? v.text : v);
  head.push(['SEO.title', SEO.title], ['SEO.description', SEO.description], ['SEO.keywords', SEO.keywords], ['INTRO.h1', INTRO.h1]);
  body.push(['INTRO.text', INTRO.text]);
  if (SUMMARY) { head.push(['SUMMARY.title', text(SUMMARY.title)]); body.push(['SUMMARY.text', text(SUMMARY.text)]); }
  for (const [k, v] of Object.entries(LABELS)) head.push([`LABELS.${k}`, v]);
  for (const [k, v] of Object.entries(SHOWCASE_LABELS)) head.push([`SHOWCASE_LABELS.${k}`, v]);
  for (const [k, v] of Object.entries(QIRAAT_CATEGORY_LABELS)) head.push([`QIRAAT_CATEGORY_LABELS["${k}"]`, v]);
  for (const s of SECTIONS) {
    head.push([`SECTIONS["${s.id}"].question`, text(s.question)]);
    if (s.dek && !s.dek.quote) body.push([`SECTIONS["${s.id}"].dek`, text(s.dek)]);
  }
  for (const [id, it] of Object.entries(ITEMS)) {
    head.push([`ITEMS["${id}"].title`, text(it.title)]);
    for (const k of ['hook', 'takeaway', 'classical', 'comparison']) if (text(it[k])) body.push([`ITEMS["${id}"].${k}`, text(it[k])]);
    if (it.showcase) body.push(...ourShowcaseText(it.showcase, `ITEMS["${id}"].showcase`));
    for (const [ti, t] of (it.tables || []).entries()) {
      if (t.title) head.push([`ITEMS["${id}"].tables[${ti}].title`, t.title]);
      body.push(...ourShowcaseText(t.overrides || {}, `ITEMS["${id}"].tables[${ti}].overrides`));
    }
    for (const [ii, im] of (it.images || []).entries()) body.push([`ITEMS["${id}"].images[${ii}].caption`, im.caption], [`ITEMS["${id}"].images[${ii}].alt`, im.alt]);
    if (it.primer) { head.push([`ITEMS["${id}"].primer.title`, text(it.primer.title)]); body.push([`ITEMS["${id}"].primer.text`, text(it.primer.text)]); }
    for (const [li, l] of (it.appLinks || []).entries()) { head.push([`ITEMS["${id}"].appLinks[${li}].label`, text(l.label)]); if (l.note) body.push([`ITEMS["${id}"].appLinks[${li}].note`, text(l.note)]); }
  }
  body.push(['CLOSING.disclosure', CLOSING.disclosure], ['CLOSING.reflectionBody', CLOSING.reflectionBody], ['CLOSING.crossPointer.text', CLOSING.crossPointer?.text]);
  head.push(['CLOSING.reflectionTitle', CLOSING.reflectionTitle]);
  return { body: body.filter(([, v]) => v), head: head.filter(([, v]) => v) };
}

test('our copy avoids the playbook\u2019s banned words (body list everywhere, headline list in titles, headings, labels and SEO)', () => {
  const { body, head } = readerStrings();
  const hits = [];
  for (const [where, s] of [...body, ...head]) { const m = String(s).match(BODY); if (m) hits.push(`${where}: "${m[0]}"`); }
  for (const [where, s] of head) { const m = String(s).match(HEADLINE); if (m) hits.push(`${where}: "${m[0]}"`); }
  assert.deepEqual(hits, []);
});

test('hooks are declarative (researcher\'s voice), with at most one closing question; takeaways are statements', () => {
  const text = v => (v && typeof v === 'object' && 'text' in v ? v.text : v);
  const GUIDING = /\b(here you(?:\u2019|')ll|below you(?:\u2019|')ll|let(?:\u2019|')s look|you may wonder|this item shows)\b/i;
  for (const [id, it] of Object.entries(ITEMS)) {
    const hook = String(text(it.hook)).trim();
    const q = (hook.match(/\?/g) || []).length;
    assert.ok(q <= 1, `${id}: at most one question in a hook`);
    if (q) assert.ok(hook.endsWith('?'), `${id}: an optional question closes the hook`);
    assert.doesNotMatch(hook, GUIDING, `${id}: no guiding phrases in hooks (playbook §2 rule 1)`);
    assert.doesNotMatch(hook, /\bwhy\b/i, `${id}: no why-questions in hooks`);
    assert.doesNotMatch(String(text(it.takeaway)), /\?/, `${id}: the takeaway is a statement`);
  }
});
