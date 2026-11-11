/**
 * Unit tests and scholarly/statistical regression guards for /discover/trustworthiness-of-the-bible.
 *
 *   NODE_OPTIONS='--experimental-sqlite' node --test src/utils/trustworthinessBible/*.test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import RAW_DATA from '../../data/trustworthiness-of-the-bible.json' with { type: 'json' };
import * as C from './config.js';
import * as CONTENT from './content.js';
import * as O from './overrides.js';
import { toneHit } from './tone.js';
import { buildModel, fill, resolveLink, renderInlineMd } from './model.js';
import { mapMtToLxx } from '../scripture_mapper.js';
import { loadIslamicCommentaries } from '../islamic_commentaries_loader.js';

const ROOT = path.resolve(import.meta.dirname, '../../..');
const BOOKS_META = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/books_meta.json'), 'utf8'));
const model = buildModel(CONTENT);

test('HTML rendering: bold, nested bold-italic, links, quotes, data-astro-prefetch, and zero raw LaTeX leaks', () => {
  const sample = renderInlineMd('The **movable *nu*** (`ἐστίν`) in [John 1:6](/bible/jn/1#6) reads “John.”', 'test', [], []);
  assert.ok(sample.includes('<strong>movable <em>nu</em></strong>'), `unexpected emphasis output: ${sample}`);
  assert.ok(sample.includes('data-astro-prefetch="false"'), `missing data-astro-prefetch="false" in: ${sample}`);
  assert.ok(!/&amp;quot;|&lt;strong&gt;|\*\*/.test(sample), `double-escaped or raw markdown in: ${sample}`);

  const alephSample = renderInlineMd('Read by **P47**, **ℵ**, and **A**, agreeing with ℵ*.', 'test', [], []);
  assert.ok(alephSample.includes('<strong>ℵ</strong>') && alephSample.includes('ℵ*'), `bold ℵ vs ℵ* failed: ${alephSample}`);
  assert.ok(!/\*\*/.test(alephSample), `raw ** leaked in alephSample: ${alephSample}`);

  const serialized = JSON.stringify(model);
  assert.ok(!/&amp;quot;|&lt;(?:strong|em|a|span)\b/.test(serialized), 'double-escaped HTML found in built view-model');
  assert.ok(!/\$\\|\\chi\b/.test(serialized), 'raw LaTeX math syntax leaked into built view-model');
  assert.ok(!/\*\*|\]\(/.test(serialized), 'raw markdown (** or ]() leaked into built view-model');

  let internalSourceCount = 0;
  for (const grp of model.sources) {
    for (const item of grp.items) {
      if (!item.external) {
        internalSourceCount += 1;
        assert.equal(item.attrs['data-astro-prefetch'], 'false', `missing no-prefetch on ${item.href}`);
      }
    }
  }
  assert.ok(internalSourceCount >= 10, `expected >= 10 internal scripture sources, got ${internalSourceCount}`);
});

test('data contract: all 12 raw JSON themes, 92 locked items, and 4 added primary items (96 total) are placed uniquely', () => {
  assert.equal(model.sectionCount, 4);
  assert.equal((O.ADDED_ITEM_IDS.size ?? O.ADDED_ITEM_IDS.length), 4);
  assert.equal(model.itemCount, 96);
  for (const t of RAW_DATA.themes) {
    assert.ok(model.idsUsed.has(t.id), `missing theme id #${t.id}`);
    for (const ev of t.evidences) {
      assert.ok(model.idsUsed.has(ev.id), `missing locked evidence id #${ev.id}`);
    }
  }
  for (const addId of O.ADDED_ITEM_IDS) {
    assert.ok(model.idsUsed.has(addId), `missing added item id #${addId}`);
  }
  for (const oldId of Object.keys(C.OLD_IDS)) {
    assert.ok(model.idsUsed.has(oldId), `missing legacy alias #${oldId}`);
  }

  const rawBytes = fs.readFileSync(path.join(ROOT, C.DATA_FILE));
  assert.equal(
    crypto.createHash('sha256').update(rawBytes).digest('hex'),
    C.EXPECTED_DATA_SHA256,
  );
  assert.throws(
    () => buildModel(CONTENT, { expectedDataSha256: '0'.repeat(64) }),
    /SHA-256 mismatch/,
  );

  // Onomastics and Patristic table notes/footnotes are pre-rendered through renderInlineMd()
  const onoTheme = model.sections[2].themes.find(t => t.id === 'stage3-onomastics');
  assert.ok(onoTheme.tables.aggregates.every(a => typeof a.noteHtml === 'string' && a.noteHtml.length > 0));
  assert.match(onoTheme.tables.male.footnoteHtml, /<em>JSHJ<\/em>/);
  assert.ok(onoTheme.tables.female.footnoteHtml.length > 0);
  const patTheme = model.sections[3].themes.find(t => t.id === 'stage4-patristic-quotations');
  assert.match(patTheme.patristicTable.footnoteHtml, /<em>A General Introduction to the Bible<\/em>/);
});

test('negative wiring guards: dropped raw items, bad links, unknown hosts, and missing labels fail buildModel', () => {
  const tamperedData = structuredClone(RAW_DATA);
  tamperedData.themes[0].evidences.push({ id: 'unhandled-new-item', work: 'Test' });
  assert.throws(() => buildModel(CONTENT, { data: tamperedData }), /expected 92 locked evidence items/);

  const badOrder = structuredClone({ ...CONTENT });
  [badOrder.SECTIONS[0], badOrder.SECTIONS[1]] = [badOrder.SECTIONS[1], badOrder.SECTIONS[0]];
  assert.throws(() => buildModel(badOrder), /SECTIONS ids must be/);

  const missingLabel = structuredClone({ ...CONTENT });
  delete missingLabel.LABELS.copyLink;
  assert.throws(() => buildModel(missingLabel), /LABELS\.copyLink is required/);

  const missingScanOpen = structuredClone({ ...CONTENT });
  delete missingScanOpen.LABELS.scanOpenFull;
  assert.throws(() => buildModel(missingScanOpen), /LABELS\.scanOpenFull is required/);

  assert.throws(() => fill('hello {unknown}', { title: 'x' }), /unknown placeholder/);
  assert.throws(() => resolveLink('//evil.example/a', 'test'), /protocol-relative/);
  assert.throws(() => resolveLink('http://www.csntm.org/x', 'test'), /must use https/);
  assert.throws(() => resolveLink('https://unknown-blog.example.com/post', 'test'), /not registered in config\.HOSTS/);
  assert.throws(() => resolveLink('https://quran.com/5/47', 'test'), /internal tafsir routes/);
  assert.throws(() => resolveLink('/bible/rev/13#18', 'test'), /invalid Bible book code "rev"/);
});

test('all 14 manuscript folio scans match data.db exactly, display R2 sizes, and contain zero unencoded spaces/parens', () => {
  const db = new DatabaseSync(path.join(ROOT, 'data.db'), { open: true, readOnly: true });
  try {
    const scans = Object.entries(O.MANUSCRIPT_ITEMS).filter(([, m]) => m.scan !== null);
    assert.equal(scans.length, 14, 'expected 14 manuscripts with local R2 folio scans');

    for (const [id, m] of scans) {
      const { corpus, msId, dbVerseId, folio, size } = m.scan;
      assert.ok(/^\d+(?:\.\d+)?\s*(?:KB|MB)$/.test(size), `${id}: invalid scan size label "${size}"`);
      const url = C.r2ScanUrl(corpus, msId, folio);
      assert.ok(!/[\s()]/.test(url), `${id}: R2 URL contains unencoded space or parenthesis: ${url}`);

      if (corpus === 'nt') {
        const row = db.prepare('SELECT 1 FROM manuscript_per_verse WHERE ms_id = ? AND verse_id = ? AND image_name = ?').get(msId, dbVerseId, folio);
        assert.ok(row, `${id}: NT data.db missing (${msId}, ${dbVerseId}, ${folio})`);
      } else {
        const row = db.prepare('SELECT 1 FROM manuscript_per_verse_ot WHERE ms_id = ? AND verse_id = ? AND image_name = ?').get(msId, dbVerseId, folio);
        assert.ok(row, `${id}: OT data.db missing (${msId}, ${dbVerseId}, ${folio})`);
      }
    }
  } finally {
    db.close();
  }
});

test('every internal /bible and /quran link resolves to an actual verse, manuscript set, or tafsir entry', () => {
  const db = new DatabaseSync(path.join(ROOT, 'data.db'), { open: true, readOnly: true });
  const ntSet = new Set(BOOKS_META.nt.map(b => b.id));
  const ntMs = new Set(db.prepare('SELECT DISTINCT verse_id FROM manuscript_per_verse').all().map(r => r.verse_id));
  const otMs = new Set(
    db.prepare('SELECT DISTINCT verse_id, v11n_type FROM manuscript_per_verse_ot').all().map(r => {
      if (r.v11n_type === 'MT') {
        const [b, c, v] = r.verse_id.split('_');
        const m = mapMtToLxx(b, c, v);
        return `${m.book}_${m.chapter}_${m.verse}`;
      }
      return r.verse_id;
    }),
  );
  db.close();

  const tafsir = loadIslamicCommentaries();
  const problems = [];

  for (const grp of model.sources) {
    for (const item of grp.items) {
      if (item.external) continue;
      const rel = item.href.slice(C.BASE.length);
      let m;
      if ((m = rel.match(/^\/bible\/([a-z0-9]+)\/(\d+)\/(\d+)\/manuscripts$/))) {
        const vid = `${m[1]}_${m[2]}_${m[3]}`;
        if (!ntMs.has(vid) && !otMs.has(vid)) problems.push(`no manuscripts in data.db for ${rel} (${vid})`);
      } else if ((m = rel.match(/^\/bible\/([a-z0-9]+)\/(\d+)(?:#(\d+))?$/))) {
        const [, book, ch, vs] = m;
        const folder = ntSet.has(book) ? 'nasb' : 'lxx2012';
        const p = path.join(ROOT, 'src/data/scripture', folder, `${book}.json`);
        const json = JSON.parse(fs.readFileSync(p, 'utf8'));
        const chArr = json[ch];
        if (!Array.isArray(chArr)) problems.push(`missing chapter ${rel} in ${folder}/${book}.json`);
        else if (vs && !chArr.some(o => Object.prototype.hasOwnProperty.call(o, vs))) {
          problems.push(`missing verse ${rel} in ${folder}/${book}.json`);
        }
      } else if ((m = rel.match(/^\/quran\/(\d+)\/(\d+)\/tafsir\/(tabari|ibn_kathir)$/))) {
        const key = `${m[1]}:${m[2]}`;
        if (!(tafsir[key] || []).some(c => c.id === m[3])) {
          problems.push(`missing ${m[3]} tafsir for ${key} (${rel})`);
        }
      }
    }
  }
  assert.deepEqual(problems, []);
});

test('philological & statistical accuracy guards (RECON_AUDIT.md + Pass 3 R2 + Pass 4 R1 fixes)', () => {
  // 1. P75 breaks off at John 15:8 (no John 20:28 claim) & cites Porter (1962), Martini (1966), and Fee (1974)
  const p75 = O.MANUSCRIPT_ITEMS['p75-bodmer-papyrus-xiv-xv'];
  assert.ok(!/20:28/.test(p75.noteMd), 'P75 must not claim to preserve John 20:28');
  assert.ok(/Porter/.test(p75.noteMd) && /Martini/.test(p75.noteMd) && /Fee/.test(p75.noteMd) && !/99%/.test(p75.noteMd));
  assert.ok(p75.chips.some(c => c.href === 'https://digi.vatlib.it/view/MSS_Pap.Hanna.1%28Mater.Verbi%29'));

  // 2. 1QIsaᵃ vs proto-Masoretic 1QIsaᵇ distinction (B-5 + P2)
  const isa = O.MANUSCRIPT_ITEMS['great-isaiah-scroll-1qisaa'];
  assert.ok(/1QIsaᵇ/.test(isa.noteMd) && /Brownlee/.test(isa.noteMd) && /Column XLIV of 1QIsaᵃ/.test(isa.noteMd));

  // 3. Vaticanus uses visually verified Exodus 3:14 leaf ot_images/B/B_49_00053.jpg (P1-5) and links to digi.vatlib.it
  const vat = O.MANUSCRIPT_ITEMS['codex-vaticanus-b'];
  assert.equal(vat.scan.corpus, 'ot');
  assert.equal(vat.scan.dbVerseId, 'ex_3_14');
  assert.equal(vat.scan.folio, 'B_49_00053.jpg');
  assert.ok(!/\bR2\b/.test(vat.readingNote), 'Vaticanus readingNote must not leak R2 infrastructure jargon');
  assert.ok(vat.chips.some(c => c.href === 'https://digi.vatlib.it/view/MSS_Vat.gr.1209'));

  // 4. Classical antiquity rows: 18 rows (incl. Josephus's Jewish Antiquities), zero accuracyPercentage
  assert.equal(O.CLASSICAL_ROWS.length, 18);
  assert.ok(O.CLASSICAL_ROWS.some(r => r.id === 'josephus-antiquities'));
  for (const r of O.CLASSICAL_ROWS) {
    assert.equal('accuracyPercentage' in r, false);
    assert.ok(!/9[0-9]\.\d%/.test(`${r.earliestFragment} ${r.substantialCodex} ${r.witnessCount}`));
  }

  // 5. All 3 famous disputed passages openly presented; Romans 5:1 ἔχωμεν translated "let us have peace" (P1-2)
  const varIds = O.VARIANT_ITEMS.map(v => v.id);
  assert.ok(varIds.includes('bracketed-longer-ending-mark'));
  assert.ok(varIds.includes('bracketed-pericope-adulterae'));
  assert.ok(varIds.includes('bracketed-comma-johanneum'));
  assert.ok(!O.VARIANT_ITEMS[0].quote && Boolean(O.VARIANT_ITEMS[0].exampleMd));
  assert.ok(!O.VARIANT_ITEMS[1].quote && Boolean(O.VARIANT_ITEMS[1].exampleMd));
  const romVar = O.VARIANT_ITEMS.find(v => v.id === 'variant-cat4-meaningful-and-viable');
  assert.ok(/let us have peace with God/.test(romVar.noteMd));

  // 6. R2-M1 guard: "84" Acts tally explicitly attributed to Geisler & Turek (2004), not claimed as Hemer's own count
  const stage2Eval = CONTENT.SECTIONS[1].assessments[0].evaluationMd;
  assert.ok(/Hemer/.test(stage2Eval) && /Geisler & Frank Turek/.test(stage2Eval));
  assert.ok(!/Hemer[^.]*cataloged\s+84\b/i.test(stage2Eval));

  // 7. P0-1 guard: Muratorian Fragment links to ANF V 0510.htm (never Commodianus 0502.htm)
  const mur = O.CANON_ITEMS.find(c => c.id === 'canon-muratorian-fragment');
  assert.ok(!mur.chips.some(c => /0502\.htm/.test(c.href)), 'Muratorian Fragment must not link to Commodianus (0502.htm)');
  assert.ok(mur.chips.some(c => c.href === 'https://www.newadvent.org/fathers/0510.htm'));

  // 8. P1-8 guard: Undesigned Coincidences split into 4 primary + 4 contested items
  const undTheme = model.sections[2].themes.find(t => t.id === 'stage3-undesigned-coincidences');
  assert.equal(undTheme.primaryCards.length, 4);
  assert.equal(undTheme.contestedCards.length, 4);

  // 9. Gender-matched N = 2,625 male-base onomastics + exact row-sum consistency (P1-1 + B-2)
  const aggs = O.ONOMASTICS_TABLES.aggregates;
  assert.equal(aggs.length, 4);
  assert.ok(aggs[0].palestine.startsWith('17.6%') && aggs[0].gospelsActs.startsWith('18.2%'));
  assert.ok(aggs[1].palestine.startsWith('46.7%') && aggs[1].gospelsActs.startsWith('40.3%'));
  assert.ok(aggs[2].palestine.startsWith('28.6%') && aggs[2].gospelsActs.startsWith('38.9%'));
  assert.ok(aggs[3].palestine.startsWith('49.7%') && aggs[3].gospelsActs.startsWith('61.1%'));

  const maleRows = O.ONOMASTICS_TABLES.male.rows;
  assert.equal(maleRows.length, 9);
  const palTop2Count = maleRows[0].count + maleRows[1].count;
  const palTop9Count = maleRows.reduce((s, r) => s + r.count, 0);
  assert.equal(palTop2Count, 461);
  assert.equal(palTop9Count, 1227);
  assert.equal((palTop2Count / 2625 * 100).toFixed(1), '17.6');
  assert.equal((palTop9Count / 2625 * 100).toFixed(1), '46.7');
  for (const r of maleRows) {
    assert.equal(r.palPct, `${(r.count / 2625 * 100).toFixed(1)}%`, `male row ${r.name} palPct mismatch`);
  }
  assert.equal(maleRows.reduce((s, r) => s + parseFloat(r.palPct), 0).toFixed(1), '46.7');

  const ntCounts = maleRows.map(r => Number(r.ntPct.match(/\((\d+)\)/)[1]));
  assert.equal(ntCounts[0] + ntCounts[1], 14);
  assert.equal(ntCounts.reduce((s, n) => s + n, 0), 31);
  assert.equal(((ntCounts[0] + ntCounts[1]) / 77 * 100).toFixed(1), '18.2');
  assert.equal((ntCounts.reduce((s, n) => s + n, 0) / 77 * 100).toFixed(1), '40.3');

  const femRows = O.ONOMASTICS_TABLES.female.rows;
  const fPal12 = parseFloat(femRows[0].palPct);
  const fPal39 = parseFloat(femRows[1].palPct);
  const fPalTot = parseFloat(femRows[2].palPct);
  assert.equal((fPal12 + fPal39).toFixed(1), fPalTot.toFixed(1));
  assert.equal(fPalTot.toFixed(1), '49.7');
  const fNt12 = Number(femRows[0].ntPct.match(/\((\d+)\)/)[1]);
  const fNt39 = Number(femRows[1].ntPct.match(/\((\d+)\)/)[1]);
  const fNtTot = Number(femRows[2].ntPct.match(/\((\d+)\)/)[1]);
  assert.equal(fNt12 + fNt39, fNtTot);
  assert.equal(fNt12, 7);
  assert.equal(fNtTot, 11);

  // 10. Transposed Geisler & Nix (1986, p. 431) 7-writer patristic table: every writer row & division column sums to 36,289 (R2-M2 + B-1)
  const pt = O.PATRISTIC_TABLE;
  assert.equal('apostolicFathersCount' in pt, false);
  assert.equal('subtotalFive' in pt, false);
  assert.equal(pt.writers.length, 7);
  assert.equal(pt.divisions.length, 5);
  const num = s => Number(String(s).replace(/,/g, ''));

  let grandByWriters = 0;
  for (const w of pt.writers) {
    const wSum = pt.divisions.reduce((acc, d) => acc + num(w[d.key]), 0);
    assert.equal(wSum, num(w.total), `patristic writer ${w.writer} sum ${wSum} != ${w.total}`);
    grandByWriters += wSum;
  }
  assert.equal(grandByWriters, 36289);
  assert.equal(num(pt.grandTotal), 36289);

  let grandByDivisions = 0;
  for (const d of pt.divisions) {
    const dSum = pt.writers.reduce((acc, w) => acc + num(w[d.key]), 0);
    assert.equal(dSum, num(d.total), `patristic division ${d.id} sum ${dSum} != ${d.total}`);
    grandByDivisions += dSum;
  }
  assert.equal(grandByDivisions, 36289);
  assert.ok(/Metzger/.test(O.PATRISTIC_ITEMS[0].noteMd) && /memory/.test(O.PATRISTIC_ITEMS[0].noteMd));

  // 11. Zero English straight-quote code pills (`"..."`) in authored data files (m-22)
  for (const relFile of ['content.js', 'stage1Data.js', 'stage2Data.js', 'stage34Data.js']) {
    const raw = fs.readFileSync(path.join(import.meta.dirname, relFile), 'utf8');
    assert.ok(!/`"[^`"]+"`/.test(raw), `${relFile} still wraps an English quote inside backticks (\`"..."\`)`);
  }

  // 12. Pass 6 visual folio & epigraphic/museum registration guards
  assert.equal(p75.scan.dbVerseId, 'jn_14_9');
  assert.equal(p75.scan.folio, 'p75_3A_3r.jpg');
  assert.equal(O.MANUSCRIPT_ITEMS['p72-bodmer-vii-ix'].scan.dbVerseId, 'jude_1_5');
  assert.equal(O.MANUSCRIPT_ITEMS['p72-bodmer-vii-ix'].scan.folio, 'GA_P72_0038.jpg');
  assert.equal(O.MANUSCRIPT_ITEMS['codex-alexandrinus-02'].scan.folio, '02_90r.jpg');
  assert.equal(O.MANUSCRIPT_ITEMS['p47-chester-beatty-iii'].scan.folio, 'p47_folio_4r.jpg');
  const kurkh = O.ARCHAEOLOGY_OT_ITEMS.find(x => x.id === 'kurkh-monolith-ahab');
  assert.ok(/1863,0619\.2/.test(kurkh.meta));
  assert.ok(kurkh.chips.some(c => c.href === 'https://archive.org/details/ancient-records-of-assyria-and-babylonia-volume-1'));
  const nab = O.ARCHAEOLOGY_OT_ITEMS.find(x => x.id === 'nabonidus-chronicle-belshazzar');
  assert.ok(/iptaqissu šarrūtam/.test(nab.noteMd));
  assert.ok(/Sp-II\.964/.test(nab.meta));
  assert.ok(nab.chips.some(c => c.href === 'https://archive.org/details/cuneiformparalle00rogeuoft'));
  const den = O.ARCHAEOLOGY_NT_ITEMS.find(x => x.id === 'coinage-tribute-penny-tiberius');
  assert.ok(!/R\.6353|C_R-6353/.test(JSON.stringify(den)), 'must not cite Republican RRC 29/3 specimen R.6353 for Tiberius denarius');
  const telDan = O.ARCHAEOLOGY_OT_ITEMS.find(x => x.id === 'tel-dan-stele-david');
  assert.ok(/ואקתל מל\[כן שב\]ען/.test(telDan.quote) && /אית/.test(telDan.quote));
  const lucian = O.HISTORIANS_ITEMS.find(x => x.id === 'lucian-of-samosata-peregrinus');
  assert.ok(/προσκυνῶσιν/.test(lucian.noteMd));
  const mara = O.HISTORIANS_ITEMS.find(x => x.id === 'mara-bar-serapion-letter');
  assert.ok(/181v–185r/.test(mara.quoteCite));
});

test('strict academic tone gate: zero banned words, unnamed strawmen, or first/second-person pronouns in our voice', () => {
  const hits = [];
  const check = (where, val, headline = false) => {
    if (typeof val !== 'string' || !val.trim()) return;
    const h = toneHit(val, { headline });
    if (h) hits.push(`${where}: banned "${h}" in -> ${val.slice(0, 140)}`);
  };

  check('SEO.title', CONTENT.SEO.title, true);
  check('SEO.description', CONTENT.SEO.description, true);
  check('HEADER.eyebrow', CONTENT.HEADER.eyebrow, true);
  check('HEADER.h1', CONTENT.HEADER.h1, true);
  check('HEADER.hookMd', CONTENT.HEADER.hookMd);
  check('HEADER.contextMd', CONTENT.HEADER.contextMd);
  check('HEADER.whosWhoSummary', CONTENT.HEADER.whosWhoSummary, true);
  check('HEADER.whosWhoMd', CONTENT.HEADER.whosWhoMd);
  (CONTENT.HEADER.whosWhoGlossary || []).forEach((g, gi) => {
    check(`HEADER.whosWhoGlossary[${gi}].group`, g.group, true);
    (g.entries || []).forEach((e, ei) => {
      check(`HEADER.whosWhoGlossary[${gi}].entries[${ei}].term`, e.term, true);
      check(`HEADER.whosWhoGlossary[${gi}].entries[${ei}].defMd`, e.defMd);
    });
  });
  check('CLOSING.heading', CONTENT.CLOSING.heading, true);
  check('CLOSING.bodyMd', CONTENT.CLOSING.bodyMd);

  for (const [k, v] of Object.entries(CONTENT.LABELS)) {
    if (typeof v === 'string') check(`LABELS.${k}`, v, true);
    else if (v && typeof v === 'object') {
      for (const [gk, gv] of Object.entries(v)) check(`LABELS.${k}.${gk}`, gv, true);
    }
  }

  CONTENT.GLANCE.forEach((g, i) => {
    check(`GLANCE[${i}].title`, g.title, true);
    check(`GLANCE[${i}].takeaway`, g.takeaway);
    g.chips.forEach((c, ci) => check(`GLANCE[${i}].chips[${ci}]`, c, true));
  });

  CONTENT.SECTIONS.forEach((s, si) => {
    check(`SECTIONS[${si}].navLabel`, s.navLabel, true);
    check(`SECTIONS[${si}].title`, s.title, true);
    check(`SECTIONS[${si}].introMd`, s.introMd);
    s.themes.forEach((t, ti) => {
      check(`SECTIONS[${si}].themes[${ti}].eyebrow`, t.eyebrow, true);
      check(`SECTIONS[${si}].themes[${ti}].title`, t.title, true);
      check(`SECTIONS[${si}].themes[${ti}].leadMd`, t.leadMd);
      if (t.takeawayMd) check(`SECTIONS[${si}].themes[${ti}].takeawayMd`, t.takeawayMd);
      if (t.contestedSummary) check(`SECTIONS[${si}].themes[${ti}].contestedSummary`, t.contestedSummary, true);
      if (t.contestedIntroMd) check(`SECTIONS[${si}].themes[${ti}].contestedIntroMd`, t.contestedIntroMd);
    });
    s.assessments.forEach((a, ai) => {
      check(`SECTIONS[${si}].assessments[${ai}].classicalLabel`, a.classicalLabel, true);
      check(`SECTIONS[${si}].assessments[${ai}].classicalMd`, a.classicalMd);
      check(`SECTIONS[${si}].assessments[${ai}].evaluationLabel`, a.evaluationLabel, true);
      check(`SECTIONS[${si}].assessments[${ai}].evaluationMd`, a.evaluationMd);
    });
  });

  O.MANUSCRIPT_GROUPS.forEach((g, i) => check(`MANUSCRIPT_GROUPS[${i}].label`, g.label, true));
  for (const [id, m] of Object.entries(O.MANUSCRIPT_ITEMS)) {
    check(`MANUSCRIPT_ITEMS[${id}].title`, m.title, true);
    check(`MANUSCRIPT_ITEMS[${id}].siglum`, m.siglum, true);
    check(`MANUSCRIPT_ITEMS[${id}].date`, m.date);
    check(`MANUSCRIPT_ITEMS[${id}].repository`, m.repository);
    check(`MANUSCRIPT_ITEMS[${id}].provenance`, m.provenance);
    check(`MANUSCRIPT_ITEMS[${id}].noteMd`, m.noteMd);
    check(`MANUSCRIPT_ITEMS[${id}].quoteCite`, m.quoteCite);
    check(`MANUSCRIPT_ITEMS[${id}].readingNote`, m.readingNote);
    if (m.scan) check(`MANUSCRIPT_ITEMS[${id}].scan.caption`, m.scan.caption);
    m.chips.forEach((c, ci) => check(`MANUSCRIPT_ITEMS[${id}].chips[${ci}]`, c.label, true));
  }

  const cardLists = [
    ['VARIANT_ITEMS', O.VARIANT_ITEMS],
    ['ARCHAEOLOGY_NT_ITEMS', O.ARCHAEOLOGY_NT_ITEMS],
    ['ARCHAEOLOGY_OT_ITEMS', O.ARCHAEOLOGY_OT_ITEMS],
    ['HISTORIANS_ITEMS', O.HISTORIANS_ITEMS],
    ['EMBARRASSMENT_ITEMS', O.EMBARRASSMENT_ITEMS],
    ['UNDESIGNED_ITEMS', O.UNDESIGNED_ITEMS],
    ['ONOMASTICS_ITEMS', O.ONOMASTICS_ITEMS],
    ['CANON_ITEMS', O.CANON_ITEMS],
    ['PATRISTIC_ITEMS', O.PATRISTIC_ITEMS],
    ['SYNTHESIS_ITEMS', O.SYNTHESIS_ITEMS],
  ];
  for (const [listName, list] of cardLists) {
    list.forEach(it => {
      check(`${listName}[${it.id}].badge`, it.badge || it.tier, true);
      check(`${listName}[${it.id}].title`, it.title, true);
      check(`${listName}[${it.id}].meta`, it.meta);
      check(`${listName}[${it.id}].noteMd`, it.noteMd);
      check(`${listName}[${it.id}].exampleMd`, it.exampleMd);
      check(`${listName}[${it.id}].quoteCite`, it.quoteCite);
      it.chips.forEach((c, ci) => check(`${listName}[${it.id}].chips[${ci}]`, c.label, true));
    });
  }

  O.CLASSICAL_ROWS.forEach(r => {
    check(`CLASSICAL_ROWS[${r.id}].work`, r.work, true);
    check(`CLASSICAL_ROWS[${r.id}].composed`, r.composed);
    check(`CLASSICAL_ROWS[${r.id}].earliestFragment`, r.earliestFragment);
    check(`CLASSICAL_ROWS[${r.id}].substantialCodex`, r.substantialCodex);
    check(`CLASSICAL_ROWS[${r.id}].witnessCount`, r.witnessCount);
  });

  O.ONOMASTICS_TABLES.aggregates.forEach((r, i) => {
    check(`ONOMASTICS.aggregates[${i}].metric`, r.metric);
    check(`ONOMASTICS.aggregates[${i}].note`, r.note);
  });
  for (const tbl of [O.ONOMASTICS_TABLES.male, O.ONOMASTICS_TABLES.female]) {
    check(`ONOMASTICS.${tbl.id}.caption`, tbl.caption, true);
    check(`ONOMASTICS.${tbl.id}.footnote`, tbl.footnote);
    tbl.rows.forEach(r => check(`ONOMASTICS.${tbl.id}[${r.name || r.rankLabel}].qualifiers`, r.qualifiers));
  }

  check('PATRISTIC_TABLE.caption', O.PATRISTIC_TABLE.caption, true);
  check('PATRISTIC_TABLE.takeaway', O.PATRISTIC_TABLE.takeaway);
  check('PATRISTIC_TABLE.footnote', O.PATRISTIC_TABLE.footnote);
  O.PATRISTIC_TABLE.divisions.forEach(d => check(`PATRISTIC_TABLE.divisions[${d.id}].label`, d.label, true));
  O.PATRISTIC_TABLE.writers.forEach(w => check(`PATRISTIC_TABLE.writers[${w.key}].writer`, w.writer, true));

  assert.deepEqual(hits, []);
});
