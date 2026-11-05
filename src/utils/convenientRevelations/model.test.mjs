// node --test src/utils/convenientRevelations/model.test.mjs
// Guards the dataset ↔ config contract for /discover/convenient-revelations and the article's voice.
import { test } from 'node:test';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import data from '../../data/convenient-revelations.json' with { type: 'json' };
import * as CONFIG from './config.js';
import { buildModel, loadConvenientRevelations, legacySlugify, parseRef, splitRefs, cleanSource, arabicHtml, nestQuotes } from './model.js';
import { OWN_VOICE, HEADLINE } from './tone.js';
import { createRenderer } from '../hadithReliability/render.js';

const model = loadConvenientRevelations();
const themes = data.dataset;
const clone = o => structuredClone(o);
/** A config double with one export replaced. */
const withConfig = patch => ({ ...CONFIG, ...patch });

/** The 48 pre-2026 anchors (cuj_ia.md §B). Frozen: they must keep landing even if dataset titles change. */
const LEGACY_TOPS = [
  'exemption-from-the-four-wife-limit',
  'exemption-from-equal-marital-rotation',
  'the-marriage-to-zaynab-abolishing-adoption',
  'the-divine-loophole-for-oaths-maria-the-copt',
  'permitting-married-female-captives-awtas',
  'dinner-etiquette-dismissing-guests',
  'the-hijab-revelation-validating-umar',
  'the-slander-of-aisha-the-loophole-of-the-4-witness-rule',
  'relaxing-fasting-rules-for-companions',
  'absolute-control-of-war-booty-khums-fay',
  'the-lucrative-trade-of-slavery',
  'silencing-the-wives-demands-for-wealth',
];
const LEGACY_ALL = LEGACY_TOPS.flatMap(s => [s, `${s}-claim`, `${s}-defense`, `${s}-counter`]);

test('config keys and dataset themes match both ways (12 themes)', () => {
  assert.equal(themes.length, 12);
  assert.deepEqual(Object.keys(CONFIG.ITEMS).sort(), themes.map(t => t.theme).sort());
});

test('a stale config key, a missing theme or a duplicate placement fails the build', () => {
  const items = clone(CONFIG.ITEMS);
  items.Theme_99_Stale = { ...items.Theme_01_Marital_Limits, id: 'stale', legacy: 'stale-legacy' };
  assert.throws(() => buildModel(data, withConfig({ ITEMS: items })), /stale key/);
  const missing = clone(CONFIG.ITEMS);
  delete missing.Theme_11_Slavery_and_Wealth;
  assert.throws(() => buildModel(data, withConfig({ ITEMS: missing })), /no config entry/);
  const dup = clone(CONFIG.ITEMS);
  dup.Theme_01_Marital_Limits.order = 1; // collides with Theme_02 in the same part
  assert.throws(() => buildModel(data, withConfig({ ITEMS: dup })), /item orders must be/);
});

test('every theme is placed exactly once, 3 per part, in reading order 1..12', () => {
  assert.equal(model.parts.length, 4);
  for (const p of model.parts) assert.equal(p.items.length, 3, p.slug);
  assert.deepEqual(model.items.map(i => i.number), [...Array(12).keys()].map(i => i + 1));
  assert.equal(new Set(model.items.map(i => i.theme)).size, 12);
});

/** Pre-2026 chapter of each theme (old src/config/themeRoutes.ts): `/<chapter>#<legacy>` links must keep landing. */
const LEGACY_CHAPTER = {
  'sexual-privileges': ['Theme_02_Marital_Rotation', 'Theme_01_Marital_Limits', 'Theme_03_Zaynab_Marriage'],
  'evading-accountability': ['Theme_04_Safe_Harbor_Oaths', 'Theme_08_Aisha_Ifk', 'Theme_09_Fasting_Relaxations'],
  'spoils-and-etiquette': ['Theme_05_Captives_of_War', 'Theme_07_Umar_Hijab', 'Theme_06_Etiquette_Interventions'],
  'wealth-and-power': ['Theme_10_War_Booty_and_Fay', 'Theme_11_Slavery_and_Wealth', 'Theme_12_Wives_Demanding_Wealth'],
};

test('the 48 legacy aliases are present and unique, and every theme stays in its pre-2026 chapter', () => {
  const aliases = model.items.flatMap(i => Object.values(i.legacy));
  assert.equal(aliases.length, 48);
  assert.deepEqual([...aliases].sort(), [...LEGACY_ALL].sort());
  for (const [chapter, list] of Object.entries(LEGACY_CHAPTER)) for (const theme of list) assert.equal(model.items.find(i => i.theme === theme).part, chapter, theme);
  // The frozen list was derived with the old slugify (kept for the record; independent of today's titles).
  assert.equal(legacySlugify('Exemption from the Four-Wife Limit'), LEGACY_TOPS[0]);
  const ids = [...aliases, ...model.items.map(i => i.id)];
  assert.equal(new Set(ids).size, ids.length);
});

test('every showcase excerpt is a verbatim substring of its source (and a bad one fails the build)', () => {
  const lines = [];
  const walk = (o, theme) => {
    if (Array.isArray(o)) return o.forEach(v => walk(v, theme));
    if (!o || typeof o !== 'object') return;
    if (typeof o.excerpt === 'string') lines.push({ theme: o.theme || theme, ...o });
    for (const v of Object.values(o)) if (typeof v === 'object') walk(v, theme);
  };
  for (const [theme, cfg] of Object.entries(CONFIG.ITEMS)) walk(cfg.copy.showcase, theme);
  assert.ok(lines.length > 40, `found ${lines.length} excerpts`);
  const cardText = (theme, i, field) => {
    const it = model.items.find(x => x.theme === theme);
    const c = [...it.sources.open, ...it.sources.drawer].flatMap(x => [x, ...x.nested]).find(x => x.index === i);
    return c[field];
  };
  for (const l of lines) {
    if (l.quran) { assert.ok(CONFIG.COPY.QURAN_TEXT[l.quran].includes(l.excerpt), `Droge ${l.quran}: "${l.excerpt.slice(0, 50)}…"`); continue; }
    const src = l.src ?? l.parentSrc;
    if (!Number.isInteger(src)) continue; // strip lines inherit their strip's src (checked by the model)
    assert.ok(cardText(l.theme, src, l.field || 'english').includes(l.excerpt), `${l.theme}[${src}]: "${l.excerpt.slice(0, 50)}…"`);
  }
  const bad = clone(CONFIG.ITEMS);
  bad.Theme_01_Marital_Limits.copy.showcase.sides[0].lines[0].excerpt = 'marry what seems good to you: up to four';
  assert.throws(() => buildModel(data, withConfig({ ITEMS: bad })), /not a verbatim substring/);
});

test('Droge text in copy.js matches the repo translation the /quran pages use', () => {
  const droge = JSON.parse(fs.readFileSync('src/data/quran/english/droge_translation.json', 'utf8'));
  for (const [k, v] of Object.entries(CONFIG.COPY.QURAN_TEXT)) assert.equal(v, droge[k]?.text, k);
});

test('every flow_stage has a stage label, and labels for unknown stages fail', () => {
  for (const t of themes) {
    for (const s of t.orthodox_sources) assert.ok(CONFIG.ITEMS[t.theme].copy.stageLabels[s.flow_stage], `${t.theme}: "${s.flow_stage}"`);
  }
  const bad = clone(CONFIG.ITEMS);
  bad.Theme_09_Fasting_Relaxations.copy.stageLabels['9. Not a stage'] = 'x';
  assert.throws(() => buildModel(data, withConfig({ ITEMS: bad })), /unknown flow_stage/);
});

test('reader-facing copy uses no banned words in our voice (quotations excluded)', () => {
  /** Our voice only: drop quoted material (curly and straight quotes) and link targets. */
  const ours = s => String(s ?? '').replace(/“[^”]*”/g, '“…”').replace(/"[^"]*"/g, '"…"').replace(/\]\([^)]*\)/g, ']');
  const head = [CONFIG.HUB.h1, CONFIG.HUB.seo.title, CONFIG.HUB.methodSummary, CONFIG.ARTICLE_NAME];
  const body = [CONFIG.HUB.intro, CONFIG.HUB.method, CONFIG.HUB.seo.description, CONFIG.HUB.footerNote];
  for (const p of CONFIG.PARTS) { head.push(p.label, p.question, p.h1, p.seo.title); body.push(p.dek, p.seo.description); }
  for (const it of model.items) {
    head.push(it.copy.title.text, ...Object.values(it.stages), it.showcase.caption, it.provenance.occasionLabel, it.provenance.extraLabel);
    body.push(it.copy.hook.text, it.copy.takeaway.text, it.copy.about.text, it.copy.classical.text, it.copy.comparing.text);
    body.push(it.provenance.lead, ...it.provenance.occasion, it.provenance.extra);
  }
  for (const [, c] of Object.entries(CONFIG.ITEMS)) {
    const sc = c.copy.showcase;
    for (const x of [...(sc.sides || []), ...(sc.points || []), ...(sc.tabs || []), ...(sc.values || []), ...(sc.findings || [])]) head.push(x.label || '');
    for (const l of c.copy.crossLinks || []) head.push(l.label);
    for (const n of [].concat(sc.note || [])) if (typeof n === 'string') body.push(n);
    for (const v of Object.values(c.copy.summaries || {})) head.push(v);
  }
  head.push(...Object.values(CONFIG.LABELS), ...Object.values(CONFIG.SHOWCASE_LABELS), ...Object.values(CONFIG.STAT_LABELS));
  for (const s of head) {
    const hit = ours(s).match(HEADLINE) || ours(s).match(OWN_VOICE);
    assert.ok(!hit, `heading/label "${s}" uses "${hit?.[0]}"`);
  }
  for (const s of body) {
    const hit = ours(s).match(OWN_VOICE) || ours(s).match(/\b(convenient|loophole|devastating|unfiltered|apolog(?:y|etic\w*))\b/i);
    assert.ok(!hit, `copy "${String(s).slice(0, 60)}…" uses "${hit?.[0]}"`);
  }
});

test('root-relative markdown links render as internal links (and the hrv default is unchanged)', () => {
  const md = 'See [33:51](/quran/33/51/tafsir/tabari).';
  assert.match(createRenderer().inline(md), /\[33:51\]\(\/quran/);
  assert.match(createRenderer({ rootLinks: true }).inline(md), /<a class="hrv-link hrv-link--quran" href="\/quran\/33\/51\/tafsir\/tabari"/);
  const html = model.items.map(i => i.copy.classical.html + i.copy.comparing.html + i.copy.about.html + i.showcase.noteHtml).join(' ');
  assert.ok(!/\]\(\//.test(html), 'a root-relative markdown link was left unrendered');
});

test('the dataset’s own prose is never part of the model', () => {
  const json = JSON.stringify(model);
  for (const t of themes) {
    for (const f of ['the_claim', 'standard_apologetic_defense', 'the_devastating_counter']) {
      assert.ok(!json.includes(t[f].slice(0, 60)), `${t.theme}.${f} leaked into the model`);
    }
  }
});

test('all hrefs are https:// or site-relative (/ or #)', () => {
  const hrefs = [];
  const walk = o => {
    if (!o || typeof o !== 'object') return;
    if (typeof o.href === 'string') hrefs.push(o.href);
    for (const v of Object.values(o)) walk(v);
  };
  walk(model);
  assert.ok(hrefs.length > 100);
  for (const h of hrefs) assert.match(h, /^(https:\/\/|\/|#)/, h);
  assert.ok(!hrefs.some(h => /islamqa\.info/.test(h)), 'never link IslamQA for the Muṣannaf athar');
  assert.ok(!hrefs.some(h => /sunnah\.com\/nasai:3169/.test(h)), 'Nasāʾī 3169 is not the cited report');
});

test('counts match the data: 87 source cards, 89 citations once compound refs are split', () => {
  const sources = themes.reduce((n, t) => n + t.orthodox_sources.length, 0);
  assert.equal(model.counts.sources, sources);
  assert.equal(sources, 87);
  assert.equal(model.counts.citations, 89);
  const nonEmptyArabic = themes.flatMap(t => t.orthodox_sources).filter(s => cleanSource(s).arabic).length;
  assert.equal(model.counts.arabic, nonEmptyArabic);
});

test('link policy: Qurʾān/al-Ṭabarī → site tafsir, Ibn Kathīr → ibn_kathir, ḥadīth → Sunnah.com, ranges kept', () => {
  assert.equal(parseRef('Quran 4:3', { base: '' }).href, '/quran/4/3/tafsir/tabari');
  assert.equal(parseRef('Quran (33:50)', { base: '' }).href, '/quran/33/50/tafsir/tabari');
  assert.equal(parseRef('Quran 59:6-7', { base: '' }).label, 'Qurʾān 59:6–7');
  assert.equal(parseRef('Tafsir al-Tabari (Qatadah) (Surah 66:1)', { base: '' }).href, '/quran/66/1/tafsir/tabari');
  assert.equal(parseRef('Tafsir Ibn Kathir - Quran 33:53 (The Finger Incident)', { base: '' }).href, '/quran/33/53/tafsir/ibn_kathir');
  assert.equal(parseRef('Sahih Bukhari 6691').href, 'https://sunnah.com/bukhari:6691');
  assert.equal(parseRef('Sahih Muslim 1463a').href, 'https://sunnah.com/muslim:1463a');
  assert.equal(parseRef('Sunan Abi Dawud 4474').href, 'https://sunnah.com/abudawud:4474');
  assert.deepEqual(splitRefs('Sahih al-Bukhari 4747 / Quran 24:6-9'), ['Sahih al-Bukhari 4747', 'Quran 24:6-9']);
  assert.deepEqual(splitRefs('Sahih al-Bukhari 5191 and Sahih Muslim 1479a'), ['Sahih al-Bukhari 5191', 'Sahih Muslim 1479a']);
  assert.throws(() => parseRef('Some Unknown Book 12'), /unknown reference format/);
});

test('reference fixes apply, and a stale one fails the build', () => {
  const t02 = model.items.find(i => i.theme === 'Theme_02_Marital_Rotation');
  const card = [...t02.sources.open, ...t02.sources.drawer].find(c => c.index === 4);
  const hrefs = card.chips.map(c => c.href);
  assert.ok(hrefs.includes('https://sunnah.com/bukhari:4788') && hrefs.includes('https://sunnah.com/muslim:1464a'));
  assert.ok(card.chips.find(c => c.href.endsWith('bukhari:5113')).secondary);
  const stale = { ...CONFIG.REF_FIXES, 'Theme_01_Marital_Limits:4': { from: 'Sahih al-Bukhari 999', label: 'x', reason: 'test' } };
  assert.throws(() => buildModel(data, withConfig({ REF_FIXES: stale })), /stale fix/);
});

test('quote fixes remove interpolations exactly once (and a non-matching one fails)', () => {
  const card = (theme, i) => { const it = model.items.find(x => x.theme === theme); return [...it.sources.open, ...it.sources.drawer].flatMap(c => [c, ...c.nested]).find(c => c.index === i); };
  assert.ok(!card('Theme_03_Zaynab_Marriage', 1).english.includes('passion was lit'));
  assert.ok(!card('Theme_05_Captives_of_War', 7).english.includes('Note:'));
  const bad = { ...CONFIG.QUOTE_FIXES, 'Theme_01_Marital_Limits:0': [{ field: 'english', find: 'not in the text', replace: '', reason: 'test' }] };
  assert.throws(() => buildModel(data, withConfig({ QUOTE_FIXES: bad })), /must be exactly once/);
});

test('data quirks are cleaned mechanically (markdown residue, None, embedded Arabic Reference)', () => {
  const t05 = themes.find(t => t.theme === 'Theme_05_Captives_of_War');
  for (const s of t05.orthodox_sources) {
    const c = cleanSource(s);
    assert.ok(!/\*\*|(^|\s)>(\s|$)|Arabic Reference/.test(c.english), c.english.slice(0, 60));
    assert.notEqual(c.arabic, 'None');
  }
  assert.equal(cleanSource(t05.orthodox_sources[1]).arabic, 'فكان المسلمون يتأثمون من غشيانهن , فأنزل الله');
  // angle-bracket quotation marks in Theme_10 are text, not residue
  assert.ok(cleanSource(themes.find(t => t.theme === 'Theme_10_War_Booty_and_Fay').orthodox_sources[0]).english.includes('<They ask you about the spoils.'));
});

test('source layout places every card exactly once; summaries are flagged', () => {
  for (const it of model.items) {
    const all = [...it.sources.open, ...it.sources.drawer].flatMap(c => [c, ...c.nested]).map(c => c.index).sort((a, b) => a - b);
    assert.deepEqual(all, [...Array(it.sources.count).keys()], it.theme);
    const deck = CONFIG.ITEMS[it.theme].copy;
    if (deck.sources?.open) assert.deepEqual(it.sources.open.map(c => c.index), deck.sources.open, it.theme);
    const flagged = [...it.sources.open, ...it.sources.drawer].flatMap(c => [c, ...c.nested]).filter(c => c.summary).length;
    assert.equal(flagged, Object.keys(deck.summaries || {}).length, `${it.theme} summaries`);
  }
});

test('a number fan with a repeated value+label pair fails the build', () => {
  const bad = clone(CONFIG.ITEMS);
  const v = bad.Theme_10_War_Booty_and_Fay.copy.showcase.values;
  v[2] = { ...v[2], value: v[0].value, label: v[0].label };
  assert.throws(() => buildModel(data, withConfig({ ITEMS: bad })), /value\+label pairs must be distinct/);
});

test('a missing copy field fails the build (no placeholders ship)', () => {
  const bad = clone(CONFIG.ITEMS);
  delete bad.Theme_09_Fasting_Relaxations.copy.hook;
  assert.throws(() => buildModel(data, withConfig({ ITEMS: bad })), /Theme_09_Fasting_Relaxations\.hook: missing copy/);
});

test('verbatim text is escaped, never parsed as HTML', () => {
  const d = clone(data);
  const t = d.dataset.find(x => x.theme === 'Theme_01_Marital_Limits');
  t.orthodox_sources[0].english = `<script>alert(1)</script> ${t.orthodox_sources[0].english}`;
  const items = clone(CONFIG.ITEMS);
  items.Theme_01_Marital_Limits.copy.showcase.sides[0].lines[0].excerpt = '<script>alert(1)</script>';
  const m = buildModel(d, withConfig({ ITEMS: items }));
  const it = m.items.find(x => x.theme === 'Theme_01_Marital_Limits');
  const html = JSON.stringify(it.showcase.sc);
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;') && !html.includes('<script>'));
  assert.equal(arabicHtml('مَن ۖ وَ<b>'), 'مَن <span class="crv-waqf">ۖ</span> وَ&lt;b&gt;');
});

test('nested source quotes inside a showcase <q> render as ‘…’ (display only; the excerpt stays verbatim)', () => {
  assert.equal(nestQuotes('she would say, "Have you eaten Maghafir?"'), 'she would say, ‘Have you eaten Maghafir?’');
  assert.equal(nestQuotes('"No, but I have drunk honey." Then the verse'), '‘No, but I have drunk honey.’ Then the verse');
  assert.equal(nestQuotes('no quotes here'), 'no quotes here');
  // Every rendered showcase quote in the real model is free of ASCII double quotes.
  const m = loadConvenientRevelations();
  const html = JSON.stringify(m.items.map(it => it.showcase));
  const qs = [...html.matchAll(/<q class=\\"crv-q\\"[^>]*>(.*?)<\/q>/g)].map(x => x[1]);
  assert.ok(qs.length > 0, 'expected showcase quotes');
  for (const q of qs) assert.ok(!q.includes('\\"') && !q.includes('&quot;'), `ASCII double quote left inside <q>: ${q.slice(0, 80)}`);
});

test('a restoring quote fix already applied upstream fails the build (no doubled sentence)', () => {
  const key = Object.keys(CONFIG.QUOTE_FIXES).find(k => CONFIG.QUOTE_FIXES[k].some(f => f.replace && f.replace.includes(f.find)));
  assert.ok(key, 'expected at least one restoring quote fix');
  const [theme, src] = key.split(':');
  const fx = CONFIG.QUOTE_FIXES[key].find(f => f.replace && f.replace.includes(f.find));
  const d = clone(data);
  const s = d.dataset.find(x => x.theme === theme).orthodox_sources[Number(src)];
  s[fx.field || 'english'] = s[fx.field || 'english'].split(fx.find).join(fx.replace);
  assert.throws(() => buildModel(d, CONFIG), /already applied upstream/);
});

test('a ref fix whose target the dataset now cites fails the build', () => {
  const d = clone(data);
  d.dataset.find(x => x.theme === 'Theme_03_Zaynab_Marriage').orthodox_sources[3].reference = 'Sahih Muslim 1428b';
  assert.throws(() => buildModel(d, CONFIG), /REF_FIXES\.Theme_03_Zaynab_Marriage:3: already applied upstream/);
});

test('chip links must be https:// or site-relative, and forbidden links are rejected', () => {
  const evil = { ...CONFIG.REF_FIXES, 'Theme_09_Fasting_Relaxations:1': { ...CONFIG.REF_FIXES['Theme_09_Fasting_Relaxations:1'], chips: [{ label: 'x', href: 'javascript:alert(1)' }] } };
  assert.throws(() => buildModel(data, withConfig({ REF_FIXES: evil })), /https:\/\/ or site-relative/);
  const qa = { ...CONFIG.REF_FIXES, 'Theme_09_Fasting_Relaxations:1': { ...CONFIG.REF_FIXES['Theme_09_Fasting_Relaxations:1'], chips: [{ label: 'x', href: 'https://islamqa.info/en/answers/8489' }] } };
  assert.throws(() => buildModel(data, withConfig({ REF_FIXES: qa })), /forbidden link/);
});

test('facts rows link to their source card; internal /quran links are never prefetched', () => {
  const t11 = model.items.find(i => i.theme === 'Theme_11_Slavery_and_Wealth');
  for (const f of t11.showcase.sc.items) assert.match(f.href, /^#captives-and-slaves-33-50-s\d+$/);
  const chips = model.items.flatMap(i => [...i.sources.open, ...i.sources.drawer].flatMap(c => [c, ...c.nested]).flatMap(c => c.chips));
  for (const c of chips.filter(x => !x.external && /\/quran\//.test(x.href))) assert.equal(c.attrs['data-astro-prefetch'], 'false', c.href);
  const prose = model.items.map(i => i.copy.classical.html + i.copy.comparing.html).join(' ');
  for (const a of prose.match(/<a [^>]*href="\/quran\/[^"]*"[^>]*>/g) || []) assert.match(a, /data-astro-prefetch="false"/);
});


test('researcher’s voice: hooks, deks, takeaways, intro and SEO descriptions never guide the reader (owner, Oct 2026)', async () => {
  const { GLOBAL, ITEMS } = await import('./copy.js');
  const GUIDE = /\b(here you['’]ll|here you will|below you['’]ll|you['’]ll (?:see|find)|let['’]s|you may wonder|this item (?:shows|sets)|this page (?:sets|gathers|shows))\b/i;
  const strings = [
    ['hub.intro', GLOBAL.hub.intro], ['hub.seo.description', GLOBAL.hub.seo.description], ['catalog.description', GLOBAL.catalog.description],
    ...Object.entries(GLOBAL.parts).flatMap(([s, p]) => [[`${s}.dek`, p.dek], [`${s}.seo.description`, p.seo.description]]),
    ...Object.entries(ITEMS).flatMap(([t, it]) => [[`${t}.hook`, it.hook], [`${t}.takeaway`, it.takeaway], [`${t}.about`, it.about]]),
  ];
  for (const [k, s] of strings) assert.ok(!GUIDE.test(s), `${k} guides the reader: ${s.slice(0, 80)}`);
  const introSentences = GLOBAL.hub.intro.split(/(?<=[.?!”])\s+(?=[A-ZʿĀ])/).filter(Boolean);
  assert.ok(introSentences.length <= 3, `hub intro has ${introSentences.length} sentences (max 3)`);
});
