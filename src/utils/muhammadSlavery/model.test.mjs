/**
 * Unit tests for the /discover/muhammad-and-slavery view model
 * (run with `node --experimental-sqlite --test src/utils/muhammadSlavery/*.test.mjs`).
 * The model must THROW on every rule in cuj_ia.md §F.4 / Addendum §3 / ia_r1_response.md; each test
 * breaks one rule on a copy of the real data or config and expects the specific problem.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONFIG, LABELS, QUOTE_FIXES } from './config.js';
import { FC_NON_VERBATIM } from './quoteFixes.js';
import { buildModel, ModelError, renderAnswerMarkdown } from './model.js';
import { containsQuote, cmpNorm, displayText, nestQuotes, parseRef, labelRefs } from './text.js';
import { buildContext } from './context.js';
import { bannedHit, ourVoice } from './tone.js';
import { validateCopy } from './validate.js';
import { loadIslamicCommentaries } from '../islamic_commentaries_loader.js';
import { loadHadithModel } from '../hadithLoader.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
process.chdir(ROOT); // the commentary and hadith loaders read relative to the repo root
const json = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const DATA = json('src/data/discover/islam/prophet/slavery.json');
const CTX = buildContext({ droge: json('src/data/quran/english/droge_translation.json'), meta: json('src/data/quran/arabic/meta.json'), commentaries: loadIslamicCommentaries(), hadithModel: loadHadithModel() });
const clone = o => structuredClone(o);
const withConfig = patch => ({ ...CONFIG, ...patch });
const withCopy = fn => { const copy = clone(CONFIG.COPY); fn(copy); return withConfig({ COPY: copy }); };

function expectProblem(data, config, re) {
  try {
    buildModel(data, config, CTX);
  } catch (e) {
    assert.ok(e instanceof ModelError, `expected ModelError, got ${e}`);
    assert.ok(e.problems.some(p => re.test(p)), `no problem matching ${re}:\n${e.problems.join('\n')}`);
    return;
  }
  assert.fail(`model did not throw (expected ${re})`);
}

const model = buildModel(DATA, CONFIG, CTX);
const TOTAL = model.counts.accounts + model.counts.passages + model.counts.answers;

test('the real data builds: every item of the reading order, 7 hadith and 4 Qurʾān sections', () => {
  assert.equal(model.counts.accounts, CONFIG.HADITH_SECTIONS.flatMap(s => s.items).length);
  assert.equal(model.counts.passages, CONFIG.QURAN_SECTIONS.flatMap(s => s.items).length);
  assert.equal(model.counts.answers, CONFIG.ANSWER_ORDER.length);
  assert.equal(model.warnings.length, 0, model.warnings.join('\n'));
  assert.equal(model.pages.hadith.sections.length, 7);
  assert.equal(model.pages.quran.sections.length, 4);
});

test('hadith page order is final (IA R1 P1-1): ownership → sales → freeing stopped → … ; ghurra leads in-law', () => {
  assert.deepEqual(model.pages.hadith.sections.map(s => s.id), ['owned', 'bought-and-sold', 'freeing-stopped', 'captive-women', 'married-captives', 'captives', 'in-law']);
  assert.equal(model.pages.hadith.sections[6].items[0].id, 'ghurra');
  assert.ok(model.pages.hadith.sections[0].items.some(i => i.id === 'right-hand-touch'));
  assert.equal(model.pages.answers.items[0].id, 'gradual-abolition');
});

test('legacy anchors: #cat-1…7 on their sections, verse ids unchanged, faq-N aliases', () => {
  const legacy = model.pages.hadith.sections.flatMap(s => s.legacy);
  for (let n = 1; n <= 7; n++) assert.ok(legacy.includes(`cat-${n}`), `cat-${n}`);
  assert.ok(model.items.get('verse-4-24') && model.items.get('verse-23-5-6') && model.items.get('verse-70-29-30'));
  for (let n = 1; n <= 9; n++) assert.ok(model.pages.answers.items.some(a => a.legacy.includes(`faq-${n}`)), `faq-${n}`);
});

test('every report the fact-checkers classed non-verbatim has a QUOTE_FIX, and it is what renders', () => {
  for (const key of Object.keys(FC_NON_VERBATIM)) assert.ok(QUOTE_FIXES[key], `missing QUOTE_FIX for ${key}`);
  for (const [key, fix] of Object.entries(QUOTE_FIXES)) {
    const [itemId, ref] = key.split('|');
    const all = [...model.items.values()].flatMap(it => it.reports || []);
    const r = all.find(x => x.refRaw === ref && x.origItem === itemId);
    if (!r) {
      // A combined Sunnah.com second number renders inside its kept report (same text, both numbers shown).
      const num = ref.match(/(\d+)$/)[1];
      const kept = all.find(x => x.also?.includes(num));
      assert.ok(kept, `${key} not rendered`);
      assert.equal(cmpNorm(kept.text), cmpNorm(displayText(fix.text)), `${key}: kept report differs from the fix`);
      continue;
    }
    assert.equal(r.text, displayText(fix.text), `${key} renders something other than the fix`);
  }
});

test('no rendered report keeps editorial bold or in-book Muslim labels', () => {
  for (const it of model.items.values()) for (const r of it.reports || []) {
    assert.ok(!r.text.includes('**'), `${it.id}: ${r.label} has **`);
    assert.ok(!/Muslim \d+:\d+/.test(r.label), `${it.id}: in-book label ${r.label}`);
    assert.match(r.chips[0].href, /^https:\/\/sunnah\.com\/(bukhari|muslim|abudawud|nasai|ibnmajah):\d+[a-z]?$/);
  }
});

test('ITEM_MUTATIONS: 4213 leads safiyya-veil, 5387 moved to safiyya, Muslim 1755 leads captives-exchanged, 1763 related', () => {
  assert.equal(model.items.get('safiyya-veil').reports[0].key, 'bukhari:4213');
  assert.ok(model.items.get('safiyya').reports.some(r => r.key === 'bukhari:5387'));
  const ce = model.items.get('captives-exchanged');
  assert.equal(ce.reports[0].key, 'muslim:1755');
  assert.equal(ce.relatedReports.find(r => r.key === 'muslim:1763')?.group, 'related');
});

test('combined Sunnah.com entries render once with both numbers; chain notes render as chips', () => {
  const hz = model.items.get('hawazin-captives');
  assert.equal(hz.counts.texts, 5);
  assert.ok(hz.reports[0].label.includes('2583') && hz.reports[0].label.includes('2584'));
  assert.ok(model.items.get('juwayriyya').chainReports.some(r => r.key === 'muslim:1730b'));
});

test('range passages: chips go to 23:6 and 70:30, both āyāt shown', () => {
  const v = model.items.get('verse-23-5-6');
  assert.equal(v.ayat.length, 2);
  assert.match(v.chips[0].href, /\/quran\/23\/6\/tafsir\//);
  assert.ok(v.chips.every(c => /\/quran\/23\/[56]\/tafsir\/(tabari|ibn_kathir)$/.test(c.href)));
  assert.match(model.items.get('verse-70-29-30').chips[0].href, /\/quran\/70\/30\/tafsir\//);
});

test('the hub reaches every item exactly once', () => {
  const ids = model.hub.sections.flatMap(s => [...s.rows, ...s.more].map(r => r.id));
  assert.equal(ids.length, TOTAL);
  assert.equal(new Set(ids).size, ids.length);
});

test('hub source counts are computed distinct texts, never 190', () => {
  assert.ok(Number(model.hub.sourceStats[0].count) < 190);
  assert.equal(Number(model.hub.sourceStats[0].count), model.counts.hadithTexts);
});

test('per-collection counts add up for every item; Barīra: 33 = Bukhārī 19 + Muslim 14 (P1-2)', () => {
  for (const it of model.pages.hadith.items) assert.equal(it.counts.bukhari + it.counts.muslim, it.counts.texts, it.id);
  const b = model.items.get('barira');
  assert.deepEqual(b.counts, { texts: 33, bukhari: 19, muslim: 14 });
  assert.match(b.readAllLabel, /33 reports \(Bukhārī 19 · Muslim 14\)/);
});

test('model.hadithSources covers every rendered report and key quote (the verify script checks these)', () => {
  for (const it of model.items.values()) {
    for (const r of it.reports || []) assert.ok(model.hadithSources.has(r.key), `${it.id}: ${r.key}`);
    if (it.keyQuote) assert.ok(model.hadithSources.has(it.keyQuote.src.key), `${it.id} keyQuote`);
  }
  for (const ref of model.keyQuoteRefs) assert.ok(model.hadithSources.get(ref)?.arabic, `${ref}: no Arabic (run gen_arabic.mjs)`);
});

// ---- the build fails when … ---------------------------------------------------------------------

test('fails: stale QUOTE_FIXES key', () => {
  expectProblem(DATA, withConfig({ QUOTE_FIXES: { ...QUOTE_FIXES, 'midam|Sahih al-Bukhari 1': { text: 'x', reason: 'r', sourceUrl: 'u' } } }), /stale QUOTE_FIXES key/);
});

test('fails: stale copy key', () => {
  expectProblem(DATA, withCopy(c => { c.items['no-such-item'] = { title: 'x' }; }), /stale copy key items\.no-such-item/);
});

test('fails: anchor reference found twice', () => {
  const d = clone(DATA);
  d.categories[1].items[0].hadiths.push(clone(d.categories[0].items[0].hadiths[0]));
  expectProblem(d, CONFIG, /anchor reference "Sahih al-Bukhari 4234" found 2 times|contains two anchor references/);
});

test('fails: an item placed twice or in no section', () => {
  const twice = clone(CONFIG.HADITH_SECTIONS); twice[1].items.push('midam');
  expectProblem(DATA, withConfig({ HADITH_SECTIONS: twice }), /"midam" is placed twice/);
  const missing = clone(CONFIG.HADITH_SECTIONS); missing[0].items = missing[0].items.filter(i => i !== 'karkara');
  expectProblem(DATA, withConfig({ HADITH_SECTIONS: missing }), /item "karkara" is in no hadith section/);
});

test('fails: a Muslim reference without a canonical number', () => {
  const refMap = { ...CONFIG.REF_MAP }; delete refMap['Sahih Muslim 17:41'];
  expectProblem(DATA, withConfig({ REF_MAP: refMap }), /"Sahih Muslim 17:41" has no REF_MAP entry/);
});

test('fails: a URL that points at another number', () => {
  const d = clone(DATA); d.categories[0].items[0].hadiths[0].url = 'https://sunnah.com/bukhari:4235';
  expectProblem(d, CONFIG, /points at another number/);
});

test('fails: a showcase quote that is not verbatim', () => {
  expectProblem(DATA, withCopy(c => { c.items.midam.showcase.items[0].text = 'a black slave named Mid\'am'; }), /quote is not verbatim in Bukhārī 6707/);
});

test('fails: a key quote taken from the dataset\'s fabricated text (Bukhārī 5191 "Rabah")', () => {
  expectProblem(DATA, withCopy(c => { c.items.rabah.keyQuote = { text: 'called Rabah was standing at the top of the ladder', ref: 'bukhari:5191' }; }), /quote is not verbatim in Bukhārī 5191/);
});

test('fails: a tafsir excerpt that is not in the repo commentary', () => {
  expectProblem(DATA, withCopy(c => { c.items['verse-30-28'] = { ...c.items['verse-30-28'], tafsirQuotes: [{ who: 'al-Ṭabarī', text: 'He is the sole Sovereign Owner of all', ref: 'tabari:30:28' }] }; }), /not a substring of the repo commentary/);
});

test('fails: a count in a title that differs from the computed count', () => {
  expectProblem(DATA, withCopy(c => { c.pages.hadith.seo.title = 'Did Prophet Muhammad Own Slaves? 35 Accounts in Bukhari and Muslim'; }), /says 35 accounts; the article has 34/);
  expectProblem(DATA, withCopy(c => { c.pages.hub.intro = 'All 190 hadiths.'; }), /raw "190"/);
});

test('fails: a banned word in our voice (quotes are exempt)', () => {
  expectProblem(DATA, withCopy(c => { c.items.midam.hook = 'Here you’ll see the myth of the kind master.'; }), /banned word "myth"/);
  expectProblem(DATA, withCopy(c => { c.pages.quran.sections.women.question = 'Chattel and concubines'; }), /banned word "Chattel"/);
  assert.equal(bannedHit('He said: “Sell her even for a hair rope.”'), null);
});

test('fails: a banned word in a sub-page H1, a made-up quotation in a sub-page intro (P1-1)', () => {
  expectProblem(DATA, withCopy(c => { c.pages.hadith.h1 = 'What Bukhārī and Muslim Really Record of the Prophet and Slaves: 34 Accounts'; }), /pages\.hadith\.h1: banned word "Really"/);
  expectProblem(DATA, withCopy(c => { c.pages.quran.intro = 'Droge renders it “the Prophet freed every slave he ever owned”.'; }), /pages\.quran\.intro: quotation not found/);
});

test('fails: a quotation attributed to the wrong hadith; passes under the right one (P1-5a)', () => {
  const q = '“Whoever frees a Muslim slave, Allah will save all the parts of his body”';
  expectProblem(DATA, withCopy(c => { c.items.midam.takeaway = `Bukhārī 6707 records: ${q}.`; }), /quotation is not in bukhari:6707, the source cited beside it/);
  expectProblem(DATA, withCopy(c => { c.items.midam.takeaway = `The report reads ${q} (Bukhārī 6707).`; }), /quotation is not in bukhari:6707/);
  assert.doesNotThrow(() => buildModel(DATA, withCopy(c => { c.items.midam.takeaway = `Bukhārī 2517 records: ${q}.`; }), CTX));
});

test('fails: scare quotes and short straight quotes do not hide our voice (P1-5b/c)', () => {
  expectProblem(DATA, withCopy(c => { c.items.midam.hook = 'This is the “myth” of the kind master.'; }), /banned word "myth"/);
  expectProblem(DATA, withCopy(c => { c.items.midam.hook = 'This is "only a myth".'; }), /banned word "only"/);
  assert.equal(bannedHit('This is the ‘myth’ of it.'), 'myth');
  assert.equal(ourVoice('He said "sell her even for a hair rope" twice'), 'He said   twice');
  assert.equal(ourVoice('“only a myth”'), 'only a myth');
});

test('fails: a relative or malformed link in copy', () => {
  expectProblem(DATA, withCopy(c => { c.items.midam.takeaway = 'See [the verse](quran/4/24).'; }), /relative or non-https link in copy/);
  expectProblem(DATA, withCopy(c => { c.items.midam.takeaway = 'See [the verse](/quran/4/24"onclick=x).'; }), /malformed internal link|relative or non-https link/);
});

test('fails: a highlight mark outside a showcase, two marks in one card', () => {
  expectProblem(DATA, withCopy(c => { c.items.midam.keyQuote.text = 'No! By Him in Whose Hand my soul is, for the [[sheet]] which he stole'; }), /highlight marks are allowed in showcase excerpts only/);
  expectProblem(DATA, withCopy(c => { c.items.midam.showcase.items[0].text = 'a man called [[Rifa`a bin Zaid]], from the tribe of [[Bani Ad-Dubaib]]'; }), /at most one highlighted span per card/);
});

test('fails: stale REPORT_NOTES, stale reportNotes copy, stale REF_MAP and EXTRA_TEXTS entries', () => {
  expectProblem(DATA, withConfig({ REPORT_NOTES: { ...CONFIG.REPORT_NOTES, 'bukhari:1': { kind: 'chain' } } }), /stale REPORT_NOTES key "bukhari:1"/);
  expectProblem(DATA, withCopy(c => { c.reportNotes['bukhari:1'] = 'A note.'; }), /stale copy key hadith\.reportNotes\.bukhari:1/);
  expectProblem(DATA, withConfig({ REF_MAP: { ...CONFIG.REF_MAP, 'Sahih Muslim 99:99': '9999' } }), /stale REF_MAP key "Sahih Muslim 99:99"/);
  expectProblem(DATA, withConfig({ EXTRA_TEXTS: { ...CONFIG.EXTRA_TEXTS, 'bukhari:1': { text: 'x' } } }), /stale EXTRA_TEXTS key "bukhari:1"/);
});

test('fails: a bad ITEM_MUTATIONS ref, a report added twice to one item, a mismatched per-collection count', () => {
  const bad = clone(CONFIG.ITEM_MUTATIONS); bad[0].ref = 'Sahih al-Bukhari 1';
  expectProblem(DATA, withConfig({ ITEM_MUTATIONS: bad }), /"Sahih al-Bukhari 1" not found in "safiyya"/);
  const twice = [...CONFIG.ITEM_MUTATIONS, { op: 'add', extra: 'bukhari:2141', to: 'mudabbar-sold', reason: 'test' }];
  expectProblem(DATA, withConfig({ ITEM_MUTATIONS: twice }), /mudabbar-sold: bukhari:2141 appears twice/);
  const other = [...CONFIG.ITEM_MUTATIONS, { op: 'add', extra: 'abudawud:3931', to: 'barira', reason: 'test' }];
  expectProblem(DATA, withConfig({ ITEM_MUTATIONS: other }), /barira: per-collection counts \(19 \+ 14\) do not add up to 34/);
});

test('fails: a Sunnah.com combined pair whose texts differ', () => {
  const d = clone(DATA);
  const h = d.categories.flatMap(c => c.items || []).flatMap(i => i.hadiths || []).find(x => x.reference === 'Sahih al-Bukhari 2584');
  h.english_text = 'A different text.';
  const fixes = Object.fromEntries(Object.entries(QUOTE_FIXES).filter(([key]) => !key.endsWith('|Sahih al-Bukhari 2584')));
  expectProblem(d, withConfig({ QUOTE_FIXES: fixes }), /Bukhārī 2584 is filed as combined with 2583 but the texts differ/);
});

test('fails: Start here with fewer than 3 witness cards; a wrong count in the catalog proposal', () => {
  expectProblem(DATA, withCopy(c => { c.startHere.showcase.items = c.startHere.showcase.items.slice(0, 2); }), /at least 3 cards/);
  expectProblem(DATA, withCopy(c => { c.catalog.description = c.catalog.description.replace(/^\d+ accounts/, '35 accounts'); }), /catalog\.description: says 35 accounts; the article has 34/);
});

test('fails: copy shape (unknown key, malformed reference key), unknown label key, non-https classical source', () => {
  const copy = clone(CONFIG.COPY.raw);
  copy.hadith.items.midam.hok = 'x';
  copy.hadith.items.midam.keyQuote.ref = 'Bukhārī 6707';
  delete copy.quran.items['verse-4-24'].takeaway;
  const problems = validateCopy(copy);
  assert.ok(problems.includes('copy/hadith.json.items.midam.hok: unknown key'), problems.join('\n'));
  assert.ok(problems.some(p => p.startsWith('copy/hadith.json.items.midam.keyQuote.ref: not a reference key')), problems.join('\n'));
  assert.ok(problems.includes('copy/quran.json.items.verse-4-24.takeaway: missing'), problems.join('\n'));
  assert.deepEqual(validateCopy(CONFIG.COPY.raw), []);
  expectProblem(DATA, withCopy(c => { c.items.midam.keyQuote.ref = 'Bukhārī 6707'; }), /keyQuote\.ref: not a reference key/);
  expectProblem(DATA, withCopy(c => { c.raw.answers.labels.redHerring = 'x'; }), /labels\.redHerring: unknown label key/);
  expectProblem(DATA, withCopy(c => { c.items['prophets-slave-woman'].classical.sources[0].url = 'http://www.islamweb.net/ar/library/content/53/5224/'; }), /neither an https URL nor a site tafsir route/);
});

test('fails: a stale FAQ link fix, and a wrong in-book FAQ link left unfixed', () => {
  expectProblem(DATA, withConfig({ FAQ_LINK_FIXES: { ...CONFIG.FAQ_LINK_FIXES, 'https://sunnah.com/bukhari:1': { ref: null, reason: 'x' } } }), /stale FAQ_LINK_FIXES key/);
  const fixes = { ...CONFIG.FAQ_LINK_FIXES }; delete fixes['https://sunnah.com/muslim/27/78'];
  expectProblem(DATA, withConfig({ FAQ_LINK_FIXES: fixes }), /in-book link https:\/\/sunnah\.com\/muslim\/27\/78 has no canonical number/);
});

test('answer markdown renders with no relative links and no stray brackets', () => {
  for (const f of DATA.faqs) {
    const html = renderAnswerMarkdown(f.answer_markdown, f.faq_id, CONFIG);
    assert.ok(!/href="(?!https:\/\/|\/|#)/.test(html), `faq ${f.faq_id}: relative link`);
    assert.ok(!/>\[[^<]*<\/a>|\[<a /.test(html), `faq ${f.faq_id}: stray "[" before a link`);
    assert.ok(!/sunnah\.com\/muslim\/\d+[/:]\d+/.test(html), `faq ${f.faq_id}: in-book Muslim URL survives`);
  }
});

test('labels in our voice carry no banned words', () => {
  const walk = (o, where) => { for (const [k, v] of Object.entries(o)) { if (typeof v === 'string') assert.equal(bannedHit(v, { headline: true }), null, `${where}.${k}: ${v}`); else if (v && typeof v === 'object') walk(v, `${where}.${k}`); } };
  walk(LABELS, 'LABELS');
});

test('text helpers', () => {
  assert.ok(containsQuote('Narrated Anas:The Prophet (ﷺ) said, "Go."', 'The Prophet (ﷺ) said, “Go.”'));
  assert.ok(containsQuote('a b c d e f', 'a b … e f'));
  assert.ok(!containsQuote('a b c d e f', 'e f … a b'));
  assert.equal(cmpNorm('x ’y’  z'), "x'y'z");
  assert.equal(displayText('Narrated Ibn `Abbas:For **one** year'), 'Narrated Ibn ʿAbbas: For one year');
  assert.deepEqual(parseRef('muslim:1456a'), { kind: 'hadith', col: 'muslim', num: '1456a', key: 'muslim:1456a' });
  assert.equal(parseRef('quran:23:5-6').ayahEnd, 6);
  assert.deepEqual(parseRef('tabari:4:24#7125'), { kind: 'tafsir', who: 'tb', key: '4:24', narration: '7125' });
  assert.equal(parseRef('abudawud:1690').key, 'abudawud:1690');
  // Keys only: a human label is not a reference (labels are display text).
  assert.equal(parseRef('Muslim 1456a'), null);
  assert.equal(parseRef('Ibn ʿAbbās, recorded by al-Ṭabarī on 4:24 (no. 7125)'), null);
  // Prose references (adjacent-attribution check).
  assert.deepEqual(labelRefs('Bukhārī 4234 and 6707'), ['bukhari:4234', 'bukhari:6707']);
  assert.deepEqual(labelRefs('as in (4:24)'), ['quran:4:24']);
  assert.deepEqual(labelRefs('Ibn Kathīr on 33:50'), ['ibnkathir:33:50']);
  // Render R1: markdown italics, al-Ṭabarī's {verse} braces, OCR line-wrap hyphens (display and comparison agree).
  assert.equal(displayText('a *Mahr*, and witnesses'), 'a Mahr, and witnesses');
  assert.equal(displayText('His saying: {except what your right (hands) own}: I mean'), 'His saying: “except what your right (hands) own”: I mean');
  assert.equal(displayText('There came a slave and pledg- ed allegiance'), 'There came a slave and pledged allegiance');
  assert.ok(containsQuote('There came a slave and pledg- ed allegiance', 'a slave and pledged allegiance'));
  assert.ok(containsQuote('His saying: {except what your right (hands) own}', '“except what your right (hands) own”'));
  assert.ok(containsQuote('a *Mahr*, and witnesses', 'a Mahr, and witnesses'));
});

test('render R1: no raw markup in rendered text; item chips name their target; one caption line per commentator', () => {
  const html = [...model.items.values()].flatMap(it => [it.comparisonHtml, it.takeawayHtml, it.contextHtml, it.hookHtml, ...(it.texts || []).map(t => t.html), ...(it.commentators || []).map(c => c.html)]).join(' ');
  assert.ok(!/`|\*[^*\s]|\{[^}]*\}/.test(html.replace(/<[^>]+>/g, '')), 'raw backtick, asterisk or brace in rendered text');
  assert.ok(model.items.get('prophet-owned-slaves').comparisonHtml.replace(/<[^>]+>/g, '').includes('Midʿam'));
  for (const it of model.pages.answers.items) {
    const cards = [...it.answerTexts, ...it.texts];
    for (const t of cards) for (const ch of t.chips.filter(c => c.toItem)) {
      assert.notEqual(ch.label, LABELS.related, `${it.id}: generic "${ch.label}" chip`);
      assert.ok(ch.attrs['aria-label'].includes(t.item.title), `${it.id}: aria-label must name the target`);
    }
    for (const list of [it.answerTexts, it.texts]) list.forEach((t, i) => {
      if (i && t.item && t.item === list[i - 1].item) assert.ok(!t.chips.some(c => c.toItem), `${it.id}: consecutive cards repeat the chip to #${t.item.id}`);
    });
  }
  for (const v of model.pages.quran.items) for (const c of v.commentators) {
    const both = `${c.nameHtml} ${c.lineHtml}`;
    assert.equal((both.match(/d\. \d+ AH/g) || []).length, 1, `${v.id}: date shown ${both}`);
  }
});

test('fails: a commentator date in the copy that differs from TAFSIR_SOURCES', () => {
  expectProblem(DATA, withCopy(c => {
    const t = Object.values(c.items).flatMap(x => x.tafsirQuotes || []).find(x => /^al-Ṭabarī \(d\. 310 AH\)/.test(x.who));
    t.who = t.who.replace('d. 310 AH', 'd. 311 AH');
  }), /says d\. 311 AH; al-Ṭabarī died 310 AH/);
});

test('render hadith R1: every showcase note in the copy reaches the view model; quoted facts keep their source', () => {
  const copies = [...Object.entries(CONFIG.COPY.items), ...Object.entries(CONFIG.COPY.answers)];
  let notes = 0;
  for (const [id, c] of copies) {
    if (!c.showcase?.note) continue;
    notes++;
    assert.ok(model.items.get(id)?.showcase?.noteHtml, `${id}: showcase.note is not rendered`);
  }
  assert.ok(notes >= 34, `expected every hadith item's note, found ${notes}`);
  for (const it of model.items.values()) {
    if (it.showcase?.type !== 'facts') continue;
    for (const f of it.showcase.items) assert.ok(f.ref || f.anchor, `${it.id}: a fact with neither a source nor a jump link`);
  }
  const md = model.items.get('master-duties').showcase.items;
  assert.equal(md[5].ref.label, 'Bukhārī 5355');
  assert.equal(model.items.get('barira').relatedLabel, LABELS.relatedReports);
  // Restored writer grades keep every grader (split at the first colon only).
  const g = model.items.get('classical-law').texts.find(t => /abudawud:2078/.test(t.chips[0].href)).grade;
  assert.match(g, /Zubair ʿAlī Zaʾī: ḍaʿīf$/);
});

test('nestQuotes: ASCII quotes inside our “…” render as ‘…’; tags, attributes and text outside stay as they are', () => {
  assert.equal(nestQuotes('“took the slave and said, "Who will buy this slave from me?"”'), '“took the slave and said, ‘Who will buy this slave from me?’”');
  assert.equal(nestQuotes('“some of them said: &quot;The Imam only has a choice.&quot;” He then'), '“some of them said: ‘The Imam only has a choice.’” He then');
  assert.equal(nestQuotes('<span class="ms-vq">“he said, <mark>"No"</mark>”</span>'), '<span class="ms-vq">“he said, <mark>‘No’</mark>”</span>');
  assert.equal(nestQuotes('He said "No" (outside our quotes).'), 'He said "No" (outside our quotes).');
  assert.equal(nestQuotes('<a href="/x" title="a">x</a>'), '<a href="/x" title="a">x</a>');
  // the verbatim rule is unaffected: cmpNorm treats ‘’ and " alike
  assert.ok(containsQuote('said, "Who will buy this slave from me?"', 'said, ‘Who will buy this slave from me?’'));
});

test('no ASCII double quote inside our “…” anywhere in the rendered view model (mudabbar-sold 2141, Ibn Kathīr 47:4, …)', () => {
  const bad = [];
  const seen = new WeakSet(); // the view model links items to each other
  const walk = (o, where) => {
    if (o && typeof o === 'object') { if (seen.has(o)) return; seen.add(o); }
    if (typeof o === 'string') {
      const text = o.replace(/<[^>]*>/g, '').replace(/&quot;/g, '"');
      for (const m of text.matchAll(/\u201c[^\u201c\u201d]*"[^\u201c\u201d]*\u201d/g)) bad.push(`${where}: ${m[0].slice(0, 90)}`);
    } else if (Array.isArray(o)) o.forEach((x, i) => walk(x, `${where}[${i}]`));
    else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) walk(v, `${where}.${k}`);
  };
  walk(model.pages, 'pages');
  assert.deepEqual(bad, []);
});
