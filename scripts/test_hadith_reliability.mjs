#!/usr/bin/env node
/**
 * Static output audit for "How Reliable Are the Hadith?" (run after `astro build`).
 *
 *   node scripts/test_hadith_reliability.mjs [--dist dist] [--allow-sliced]
 *
 * Checks the built HTML, not the source, so it catches what readers actually get. Each concern is a
 * named check group below; a failure prints `page: [group] message`.
 *
 * `--allow-sliced` permits a partial BUILD_BOOKS / BUILD_SURAHS for local development builds. Without
 * it the audit fails, so a sliced config cannot be committed by accident (workspace rule).
 */
import fs from 'node:fs';
import path from 'node:path';
import { loadHadithReliability } from '../src/utils/hadithReliability/loader.js';
import { BASE, BASE_PATH } from '../src/utils/hadithReliability/config.js';
import { loadIslamicCommentaries } from '../src/utils/islamic_commentaries_loader.js';
import { BUILD_BOOKS, BUILD_SURAHS } from '../src/utils/build_config.js';

const arg = name => { const i = process.argv.indexOf(name); return i > -1 ? (process.argv[i + 1] ?? true) : null; };
const DIST = path.resolve(arg('--dist') || 'dist');
const ALLOW_SLICED = process.argv.includes('--allow-sliced');
const DATA_DIR = path.join(process.cwd(), 'src/data/discover/islam/scripture/hadith_reliability');

const model = loadHadithReliability();
const tafsir = loadIslamicCommentaries();

// ---- tiny harness -------------------------------------------------------------------------------
let failures = 0;
let checks = 0;
function group(name, page) {
  return (cond, msg) => { checks++; if (!cond) { failures++; console.error(`  ✗ ${page}: [${name}] ${msg}`); } };
}

// ---- helpers ------------------------------------------------------------------------------------
const decode = s => s.replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&amp;/g, '&');
const textOf = html => html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ');
const htmlFor = route => {
  const rel = route.slice(BASE.length).replace(/^\//, ''); // dist/ does not contain the base prefix
  const p = path.join(DIST, rel, 'index.html');
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
};
const articleHtml = html => { const i = html.indexOf('class="hrv'); return i > -1 ? html.slice(i) : html; };

let verdicts = new Map();
try {
  const r = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'verification_report.json'), 'utf8'));
  verdicts = new Map(Object.entries(r.verdicts || {}).map(([u, v]) => [u, v.verdict]));
} catch { /* report not imported yet */ }

/** Gotcha / debunking vocabulary that must never appear in our own voice. Attributed classical
 *  verdicts ("narrator error", Ibn Khirāsh's "fabricates hadith" for yaḍaʿu al-ḥadīth) are quotes.
 *  "conflicting"/"contradiction" are deliberately NOT here: translations of the Qurʾān (4:82) and of
 *  classical scholars use them legitimately, so they are reviewed by a reader, not a regex. */
const TONE = /\b(really|actually|admit(?:s|ted|ting)?|blunder\w*|debunk\w*|exposed|edited out|blanked out|waived|leap of faith|supposedly|polemic\w*)\b/i;
/** Headline/label vocabulary that must not appear in titles, headers or the catalog card. */
const HEADLINE_TONE = /\b(conflicting|contradictions?|debunk\w*|exposed|myth)\b/i;

// ---- pages --------------------------------------------------------------------------------------
const pages = [
  { route: BASE_PATH, seo: model.meta.seo.hub, kind: 'hub' },
  { route: `${BASE_PATH}/${model.meta.seo.glance.slug}`, seo: model.meta.seo.glance, kind: 'glance' },
  ...model.cases.map(c => ({ route: c.href, seo: c.seo, kind: 'case', c })),
];
const articleRoutes = new Set(pages.map(p => p.route));

console.log(`Auditing ${pages.length} pages in ${DIST}${verdicts.size ? ` (verification report: ${verdicts.size} URLs)` : ' (no verification report imported)'}`);

const PAGE_CHECKS = {
  meta(p, { html }, ok) {
    ok(decode(html).includes(`<title>${p.seo.title} | Ready Apologia</title>`), `title should be "${p.seo.title} | Ready Apologia"`);
    ok(decode(html).includes(`<meta name="description" content="${p.seo.description}"`), 'meta description does not match the SEO spec');
    ok(!/name="keywords"[^>]*content="[^"]*hadith/i.test(html), 'meta keywords should not be emitted for this article');
  },

  leaks(p, { text }, ok) {
    for (const [re, what] of [
      [/\]\(https?:/, 'raw markdown link'], [/\]\([^)\s]+\)/, 'unrendered markdown link'], [/\*\*/, 'raw ** emphasis'],
      [/&lt;br/i, 'escaped <br>'], [/\u0000/, 'renderer placeholder'],
      [/cuj_score|cuj_tier|rubric_breakdown|ranking_rationale|dropped_items_log|directionToLlm/, 'internal ranking field'],
    ]) ok(!re.test(text), `leak: ${what}`);
  },

  links(p, { body }, ok) {
    for (const [, attrs] of body.matchAll(/<a\b([^>]*)>/g)) {
      const href = decode((attrs.match(/href="([^"]*)"/) || [])[1] || '');
      if (!href) continue;
      if (/^https?:/.test(href)) {
        ok(!/reddit\.com/.test(href), `reddit link: ${href}`);
        ok(/target="_blank"/.test(attrs) && /rel="noopener noreferrer(?: nofollow)?"/.test(attrs), `external link without target/rel: ${href}`);
        const v = verdicts.get(href);
        ok(v !== 'mismatch' && v !== 'broken', `link graded ${v}: ${href}`);
        ok(!/quran\.com\/\d/.test(href), `Qurʾān link should be internal: ${href}`);
      } else if (href.startsWith(`${BASE}/quran/`)) {
        const m = href.slice(BASE.length).match(/^\/quran\/(\d+)\/(\d+)\/tafsir\/tabari$/);
        if (m) ok(tafsir[`${m[1]}:${m[2]}`]?.some(t => t.id === 'tabari'), `no Ṭabarī tafsir page for ${m[1]}:${m[2]}`);
      } else if (href.startsWith(BASE_PATH)) {
        ok(articleRoutes.has(href.split('#')[0].replace(/\/$/, '')), `internal link to unknown page: ${href}`);
      } else {
        ok(href.startsWith('/') || href.startsWith('#'), `placeholder or relative link target: ${href}`);
      }
    }
  },

  tone(p, { body }, ok) {
    // "What others are saying" quotes other people's titles verbatim; it is outside our voice.
    const hit = textOf(body.replace(/<section[^>]*id="others"[\s\S]*?<\/section>/, '')).match(TONE);
    ok(!hit, `"${hit?.[0]}"`);
    // Titles, hooks and headings are always our voice.
    const heads = [...body.matchAll(/<(h[1-4])\b[^>]*>([\s\S]*?)<\/\1>/g)].map(m => textOf(m[2])).join(' | ');
    const headHit = heads.match(HEADLINE_TONE);
    ok(!headHit, `heading uses "${headHit?.[0]}"`);
  },

  jsonld(p, { html }, ok) {
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => m[1]);
    ok(blocks.length > 0, 'no JSON-LD');
    for (const raw of blocks) {
      let types;
      try { types = JSON.stringify(JSON.parse(raw)); } catch { ok(false, 'JSON-LD does not parse'); continue; }
      ok(/"Article"/.test(types) && /"BreadcrumbList"/.test(types), 'must contain Article and BreadcrumbList');
      ok(!/"FAQPage"|"ClaimReview"/.test(types), 'must not contain FAQPage or ClaimReview');
      if (p.kind !== 'case') ok(/"ItemList"/.test(types), 'list pages need ItemList');
      ok(/Q1023470/.test(types), 'Article.about should reference Wikidata Q1023470 (Sahih al-Bukhari)');
    }
  },

  structure(p, { body }, ok) {
    const count = re => (body.match(re) || []).length;
    if (p.kind === 'hub') ok(count(/class="hrv-row"/g) === model.cases.length, 'hub must list every case');
    if (p.kind === 'glance') ok(count(/class="hrv-gcard"/g) === model.cases.length, 'glance must show every case');
    if (p.kind !== 'case') return;
    const { c } = p;
    ok(/<h1 class="hrv-case-h1"/.test(body), 'missing H1');
    ok(/class="hrv-sc hrv-sc--/.test(body), 'missing showcase');
    ok(/href="https:\/\/sunnah\.com\//.test(body) || c.sources.sunnah.length === 0, 'no Sunnah.com link on a case that cites hadith');
    ok(count(/class="hrv-ev"/g) === c.evidence.length, 'evidence card count mismatch');
    ok(new Set(c.evidence.map(e => e.bodyHtml)).size === c.evidence.length, 'duplicate evidence cards');
    ok(/class="hrv-pager"/.test(body), 'missing CasePager');
    ok(/class="[^"]*\bhrv-family\b[^"]*"/.test(body), 'missing CaseFamily');
  },
};

for (const p of pages) {
  const html = htmlFor(p.route);
  group('exists', p.route)(html, 'page missing from dist');
  if (!html) continue;
  const body = articleHtml(html);
  const ctx = { html, body, text: textOf(body) };
  for (const [name, run] of Object.entries(PAGE_CHECKS)) run(p, ctx, group(name, p.route));
}

// ---- outside the article pages ------------------------------------------------------------------
{
  const ok = group('stateless', 'client.js');
  const client = fs.readFileSync('src/components/discover/hadith-reliability/client.js', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  ok(!/localStorage|sessionStorage|indexedDB|document\.cookie/.test(client), 'client script must be stateless');
}
{
  // The Discover catalog card is the first thing a reader sees; it is outside the dataset.
  const ok = group('catalog', 'discoverCatalog.json');
  const entry = JSON.parse(fs.readFileSync('src/data/discoverCatalog.json', 'utf8')).find(e => e.slug === 'hadith-reliability');
  ok(entry, 'missing catalog entry');
  if (entry) {
    const hit = `${entry.title} ${entry.description}`.match(TONE) || `${entry.title} ${entry.description}`.match(HEADLINE_TONE);
    ok(!hit, `tone: "${hit?.[0]}"`);
    const n = entry.description.match(/\b(\d+)\s+cases\b/);
    ok(!n || Number(n[1]) === model.cases.length, `says ${n?.[1]} cases; the article has ${model.cases.length}`);
  }
}
{
  const ok = group('build-config', 'build_config.js');
  if (!ALLOW_SLICED) ok(BUILD_BOOKS === null && BUILD_SURAHS === null, 'BUILD_BOOKS / BUILD_SURAHS must be null before commit (pass --allow-sliced for local builds)');
}

console.log(failures ? `\n${failures} of ${checks} checks failed` : `\nAll ${checks} checks passed`);
process.exit(failures ? 1 : 0);
