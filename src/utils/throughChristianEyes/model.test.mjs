// node --test src/utils/throughChristianEyes/model.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildThroughChristianEyes, inlineHtml, loadThroughChristianEyes, ownVoice } from './model.js';
import { ASIDE, CATALOG, CLOSING, HERO, HOME_CARD, LABELS, LINKS, SECTIONS, SEO, SITE_HOST, SLUG } from './content.js';
import { buildSlidesSpec, compilePrintInline, compileSlidesRuns, renderPrintPanels, runsPlainText } from './printModel.js';
import { encodeQrPng } from '../../../handouts/through-christian-eyes/chrome.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

const cloneCopy = () =>
  structuredClone({ SLUG, SITE_HOST, LINKS, SEO, CATALOG, LABELS, HERO, SECTIONS, ASIDE, CLOSING, HOME_CARD });

const stripHtml = (s) =>
  s
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8209;/g, '-')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');

const normProse = (s) =>
  s
    .replace(/[\u00A0\u200A]/g, ' ')
    .replace(/\u2011/g, '-')
    .replace(/\s+/g, ' ')
    .trim();

test('the canonical copy passes every build-time check and exposes homeCard + catalog', () => {
  const m = loadThroughChristianEyes();
  assert.equal(m.sections.length, SECTIONS.length);
  assert.equal(m.homeCard.eyebrow, HOME_CARD.eyebrow);
  assert.match(m.homeCard.bodyHtml, /hrv-tlm/);
  assert.deepEqual(m.catalog, CATALOG);
});

test('discoverCatalog.json entry stays byte-identical to content.js CATALOG', () => {
  const catalog = JSON.parse(fs.readFileSync(path.join(repoRoot, 'src/data/discoverCatalog.json'), 'utf8'));
  const entry = catalog.find((c) => c.slug === SLUG);
  assert.deepEqual(entry, CATALOG);
});

test('quotations get the quotation face, highlights stay inside them', () => {
  const html = inlineHtml('he said “the middle prayer ==and the afternoon prayer==” ([Muslim 629](https://sunnah.com/muslim:629))');
  assert.match(html, /<span class="tce-q">“the middle prayer <mark class="tce-hl">and the afternoon prayer<\/mark>”<\/span>/);
  assert.match(html, /href="https:\/\/sunnah\.com\/muslim:629" target="_blank" rel="noopener noreferrer"/);
});

test('(ﷺ) renders as a single upright .hrv-ar-inline span including parentheses, never nested', () => {
  const html = inlineHtml('Zayd asked, “How will you do something which Allah’s Messenger\u00A0(ﷺ) did not do?”');
  assert.match(html, /<span class="hrv-ar-inline" lang="ar" dir="rtl">\(ﷺ\)<\/span>/);
  assert.doesNotMatch(html, /<span class="hrv-ar-inline"[^>]*><span class="hrv-ar-inline"/);
  assert.match(html, /^Zayd asked, <span class="tce-q">“How[\s\S]*”<\/span>$/);
});

test('site links (including editorial brackets in labels) are internal and keep their #anchor', () => {
  const html = inlineHtml('[2:184 [Ibn ʿAbbās]](/quran/codex/ibn-abbas#codex-2-184-ibn-abbas)');
  assert.match(html, /href="\/quran\/codex\/ibn-abbas#codex-2-184-ibn-abbas"/);
  assert.doesNotMatch(html, /target="_blank"/);
  assert.equal(ownVoice('[actually [gloss]](/x)').includes('actually'), true);
});

test('our voice excludes quotations, so a quoted "really" is allowed and an unquoted one is not', () => {
  assert.doesNotMatch(ownVoice('“he had not really done” ([Bukhārī 5763](/x))'), /really/);
  assert.match(ownVoice('this really happened'), /really/);
});

test('every "Go deeper" points at a known site page', () => {
  const m = loadThroughChristianEyes();
  const deepers = m.sections.flatMap((s) => s.blocks.filter((b) => b.kind === 'deeper'));
  assert.equal(deepers.length, 8);
  for (const d of [...deepers, m.aside.deeper]) assert.ok(Object.values(LINKS).includes(d.path), d.path);
});

// ---------------------------------------------------------------------------------------------
// Negative guardrail unit tests (one per invariant in `buildThroughChristianEyes`)
// ---------------------------------------------------------------------------------------------
test('guardrail: rejects banned body word in our own voice (including printIntro / homeCard)', () => {
  const c1 = cloneCopy();
  c1.HOME_CARD.body = 'This actually answers five questions.';
  assert.throws(() => buildThroughChristianEyes(c1), /HOME_CARD\.body: banned word "actually"/);

  const c2 = cloneCopy();
  c2.HERO.printIntro = 'This leaflet debunks the myth.';
  assert.throws(() => buildThroughChristianEyes(c2), /HERO\.printIntro: banned word "debunks"/);
});

test('guardrail: rejects banned headline word in titles, SEO, and catalog', () => {
  const c = cloneCopy();
  c.CATALOG.description = 'Five problematic claims examined from primary sources.';
  assert.throws(() => buildThroughChristianEyes(c), /CATALOG\.description: banned word "problematic"/);
});

test('guardrail: rejects bare /quran/S/A links and insecure http:// links', () => {
  const c = cloneCopy();
  c.SECTIONS[0].claim = '“Quote” ([15:9](/quran/15/9)) and [src](http://example.com)';
  assert.throws(
    () => buildThroughChristianEyes(c),
    (err) => /Qurʾān link "\/quran\/15\/9" has no tab/.test(err.message) && /must be https:\/\/ or a site path/.test(err.message),
  );
});

test('guardrail: rejects quotation containing an <a> link or unbalanced curly quotes with exact field path', () => {
  const c1 = cloneCopy();
  c1.SECTIONS[3].blocks[0].text = 'He read “[the Word](/bible/jn/1#1) was God”.';
  assert.throws(() => buildThroughChristianEyes(c1), /model\.sections\[3\]\.blocks\[0\]\.html: 1 quotation\(s\) “…” not set in the quotation face/);

  const c2 = cloneCopy();
  c2.ASIDE.text = 'Unclosed “quotation here.';
  assert.throws(() => buildThroughChristianEyes(c2), /model\.aside\.html: unbalanced curly quotes/);
});

test('guardrail: rejects duplicate/unsafe section id, unknown block kind, and unknown deeper link', () => {
  const c = cloneCopy();
  c.SECTIONS[1].id = 'Bad ID!';
  c.SECTIONS[2].id = c.SECTIONS[0].id;
  c.SECTIONS[0].blocks.push({ kind: 'mystery', text: 'x' });
  c.SECTIONS[0].blocks.push({ kind: 'deeper', link: 'nonexistent', label: 'Explore' });
  assert.throws(
    () => buildThroughChristianEyes(c),
    (err) =>
      /not a URL-safe anchor/.test(err.message) &&
      /duplicate section id/.test(err.message) &&
      /unknown kind "mystery"/.test(err.message) &&
      /unknown link "nonexistent"/.test(err.message),
  );
});

// ---------------------------------------------------------------------------------------------
// Single-source compilation & parity across Web, Print HTML, and Google Slides runs
// ---------------------------------------------------------------------------------------------
test('Print HTML and Slides runs compile cleanly from content.js with 100% section & QR parity', () => {
  const { panel1, panel2, panel3, panel4 } = renderPrintPanels();
  const slides = buildSlidesSpec();

  for (const p of [panel1, panel2, panel3, panel4]) {
    for (const leak of ['**', '==', '](', '`']) assert.ok(!p.includes(leak), `Print leak: ${leak}`);
  }

  // All 9 QR codes appear in both Print HTML and Slides AST
  const allPrint = panel1 + panel2 + panel3 + panel4;
  const slidesQrs = Object.values(slides.panels)
    .flatMap((p) => p.blocks)
    .map((b) => b.qr?.id)
    .filter(Boolean);
  assert.equal(slidesQrs.length, 9);
  for (const [key, rel] of Object.entries(LINKS)) {
    assert.ok(allPrint.includes(`https://${SITE_HOST}${rel}`), `Print missing QR for ${key}`);
    assert.ok(slidesQrs.includes(key), `Slides missing QR for ${key}`);
  }

  // Every section's answer prose matches byte-for-byte (modulo whitespace) across Web, Print, and Slides
  const webModel = loadThroughChristianEyes();
  SECTIONS.forEach((sec, idx) => {
    const ansBlock = sec.blocks.find((b) => b.kind === 'answer');
    const webAns = normProse(webModel.sections[idx].blocks.find((b) => b.kind === 'answer').paras.map(stripHtml).join(' '));
    const printAns = normProse(
      ansBlock.text
        .split(/\n\n+/)
        .map((p) => stripHtml(compilePrintInline(p)))
        .join(' '),
    );
    const slidesAns = normProse(
      ansBlock.text
        .split(/\n\n+/)
        .map((p) => runsPlainText(compileSlidesRuns(p)))
        .join(' '),
    );
    assert.equal(printAns, webAns, `Print != Web answer in ${sec.id}`);
    assert.equal(slidesAns, webAns, `Slides != Web answer in ${sec.id}`);
  });
});

test('pure-Node QR PNG encoder emits a valid lossless indexed PNG without spawning Chrome', () => {
  const png = encodeQrPng('https://readyapologia.com/discover/quran-preservation');
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]); // PNG magic bytes
  assert.equal(png.subarray(12, 16).toString('ascii'), 'IHDR');
  assert.equal(png.readUInt32BE(16), 400);
  assert.equal(png.readUInt32BE(20), 400);
  assert.ok(png.includes(Buffer.from('PLTE', 'ascii')));
  assert.ok(png.includes(Buffer.from('IDAT', 'ascii')));
  assert.ok(png.includes(Buffer.from('IEND', 'ascii')));
});
