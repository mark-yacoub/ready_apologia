#!/usr/bin/env node
/**
 * Static audit for /discover/through-christian-eyes and its homepage & catalog cards (run after `astro build`).
 *
 *   node scripts/test_through_christian_eyes.mjs [--dist dist] [--allow-sliced]
 *
 * Checks: SEO (title, description, canonical, one <h1>), JSON-LD (Article + BreadcrumbList), every
 * section and "Go deeper" link rendered, every internal link resolves to a built page (with #anchor),
 * external links open safely, in-page anchors exist, no markup leaks or nested (ﷺ) spans, our own voice
 * (outside quotations) passes the playbook's banned-word gate, the homepage Start-here card and the
 * Discover catalog card stay in sync with `content.js`, and an unsliced build_config.js unless --allow-sliced.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BUILD_BOOKS, BUILD_SURAHS } from '../src/utils/build_config.js';
import { BODY as TONE_BODY, HEADLINE as TONE_HEADLINE } from '../src/utils/quranPreservation/tone.js';
import { loadThroughChristianEyes } from '../src/utils/throughChristianEyes/model.js';
import { CATALOG, HOME_CARD, LINKS, SECTIONS } from '../src/utils/throughChristianEyes/content.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argIdx = process.argv.indexOf('--dist');
const DIST = path.resolve(argIdx > -1 ? process.argv[argIdx + 1] : 'dist');
const ALLOW_SLICED = process.argv.includes('--allow-sliced');

let checks = 0;
let failures = 0;
const ok = (cond, msg) => {
  checks++;
  if (!cond) {
    failures++;
    console.error(`  ✗ ${msg}`);
  }
};

const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const stripScriptsAndStyles = (s) => s.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<svg[\s\S]*?<\/svg>/gi, '');
const stripTags = (s) => decode(stripScriptsAndStyles(s).replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const read = (rel) => {
  const f = path.join(DIST, rel, 'index.html');
  return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null;
};

const m = loadThroughChristianEyes();

// build config
ok(ALLOW_SLICED || (BUILD_BOOKS === null && BUILD_SURAHS === null), 'build_config.js is sliced (BUILD_BOOKS/BUILD_SURAHS must be null, or pass --allow-sliced)');

// catalog sync check (`src/data/discoverCatalog.json`)
const catalogJson = JSON.parse(fs.readFileSync(path.join(repoRoot, 'src/data/discoverCatalog.json'), 'utf8'));
const catEntry = catalogJson.find((c) => c.slug === CATALOG.slug);
ok(!!catEntry, `discoverCatalog.json has no entry for "${CATALOG.slug}"`);
if (catEntry) {
  for (const key of Object.keys(CATALOG)) {
    ok(catEntry[key] === CATALOG[key], `discoverCatalog.json "${key}" ("${catEntry[key]}") !== content.js CATALOG.${key} ("${CATALOG[key]}")`);
  }
}

const html = read(m.path.slice(1));
ok(!!html, `missing built page ${m.path}`);
if (html) {
  const rawBody = html.slice(html.indexOf('class="tce"'));
  const cleanBody = stripScriptsAndStyles(rawBody);

  // SEO
  const title = decode((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '');
  ok(title.startsWith(m.seo.title), `<title> "${title}" does not start with "${m.seo.title}"`);
  ok(m.seo.title.length <= 60, `SEO title is ${m.seo.title.length} chars (> 60)`);
  const desc = decode((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
  ok(desc === m.seo.description, 'meta description differs from content.js SEO.description');
  ok(desc.length >= 50 && desc.length <= 170, `meta description is ${desc.length} chars (outside 50-170)`);
  ok(/<link rel="canonical" href="https:\/\/[^"]+\/discover\/through-christian-eyes"/.test(html), 'canonical URL missing or wrong');
  ok((cleanBody.match(/<h1\b/g) || []).length === 1, 'page must render exactly one <h1>');
  for (const t of [m.seo.title, m.seo.description]) {
    const hit = t.match(TONE_BODY) || t.match(TONE_HEADLINE);
    ok(!hit, `banned word "${hit?.[0]}" in SEO copy`);
  }

  // JSON-LD
  const ld = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((x) => {
    try { return JSON.parse(x[1]); } catch { return null; }
  });
  ok(ld.length > 0 && ld.every(Boolean), 'JSON-LD missing or unparsable');
  const types = ld.flatMap((d) => (d?.['@graph'] || [d]).map((n) => n?.['@type']));
  ok(types.includes('Article') && types.includes('BreadcrumbList'), `JSON-LD types ${JSON.stringify(types)} lack Article/BreadcrumbList`);

  // structure: every section, its heading, TOC labelledby, and every "Go deeper"
  ok(cleanBody.includes('aria-labelledby="tce-toc-h"') && cleanBody.includes('id="tce-toc-h"'), 'TOC <nav> should use aria-labelledby="tce-toc-h"');
  for (const s of SECTIONS) {
    ok(cleanBody.includes(`id="${s.id}"`), `section #${s.id} missing`);
    ok(cleanBody.includes(`href="#${s.id}"`), `contents link to #${s.id} missing`);
  }
  ok((cleanBody.match(/<h2 class="tce-h2"/g) || []).length === SECTIONS.length, `expected ${SECTIONS.length} section headings`);
  for (const p of Object.values(LINKS)) ok(new RegExp(`class="tce-deeper" href="[^"]*${p.replace(/[/.]/g, '\\$&')}"`).test(cleanBody), `"Go deeper" link to ${p} missing`);
  ok((cleanBody.match(/class="tce-answer"/g) || []).length === SECTIONS.filter((s) => s.blocks.some((b) => b.kind === 'answer')).length, '"Our answer" count differs from content.js');
  ok(!/<span class="hrv-ar-inline"[^>]*><span class="hrv-ar-inline"/.test(cleanBody), 'nested .hrv-ar-inline spans around (ﷺ)');

  // leaks
  const text = stripTags(rawBody);
  for (const leak of ['**', '==', '](', '`', 'undefined', '[object']) ok(!text.includes(leak), `markup/data leak "${leak}" in rendered text`);

  // links (scraped strictly from visible DOM outside <script>/<style>/<svg>)
  const anchors = [...cleanBody.matchAll(/<a\b([^>]*)>/g)].map(([, attrs]) => ({ attrs, href: decode((attrs.match(/href="([^"]*)"/) || [])[1] || '') }));
  const ids = new Set([...cleanBody.matchAll(/\bid="([^"]+)"/g)].map((x) => x[1]));
  for (const { attrs, href } of anchors) {
    if (/^https?:/.test(href)) {
      ok(href.startsWith('https://'), `insecure external link ${href}`);
      ok(/target="_blank"/.test(attrs) && /rel="noopener noreferrer"/.test(attrs), `external link missing target/rel: ${href}`);
    } else if (href.startsWith('#')) {
      ok(ids.has(href.slice(1)), `in-page anchor ${href} has no target`);
    } else if (href.startsWith('/')) {
      const rel = href.replace(/[#?].*$/, '').replace(/^\/|\/$/g, '');
      const book = rel.match(/^bible\/([^/]+)\//)?.[1];
      if (ALLOW_SLICED && book && BUILD_BOOKS && !BUILD_BOOKS.has(book)) continue;
      const surah = rel.match(/^quran\/(\d+)(?:\/|$)/)?.[1];
      if (ALLOW_SLICED && surah && BUILD_SURAHS && !BUILD_SURAHS.has(surah) && !BUILD_SURAHS.has(Number(surah))) continue;
      const file = path.join(DIST, rel, 'index.html');
      ok(fs.existsSync(file), `internal link ${href} has no built page`);
      const hash = href.match(/#(.+)$/)?.[1];
      if (hash && fs.existsSync(file)) ok(fs.readFileSync(file, 'utf8').includes(`id="${hash}"`), `internal link ${href}: no id="${hash}" on that page`);
    }
  }
  for (const p of m.internalPaths) ok(anchors.some((a) => a.href.replace(/\/$/, '') === p.replace(/\/$/, '')), `content link ${p} not rendered`);

  // tone: our own voice = rendered text with quotations removed
  const ownHtml = cleanBody.replace(/<span class="tce-q">[\s\S]*?”<\/span>/g, ' ');
  const own = stripTags(ownHtml).replace(/“[^”]*”/g, ' ');
  const hit = own.match(TONE_BODY);
  ok(!hit, `banned word "${hit?.[0]}" in our own voice: "…${hit ? own.slice(Math.max(0, hit.index - 60), hit.index + 40) : ''}…"`);
  for (const [, h] of cleanBody.matchAll(/<h[1-3]\b[^>]*>([\s\S]*?)<\/h[1-3]>/g)) {
    const t = stripTags(h).replace(/“[^”]*”/g, ' ');
    const hh = t.match(TONE_HEADLINE) || t.match(TONE_BODY);
    ok(!hh, `banned headline word "${hh?.[0]}" in heading "${t}"`);
  }
}

// homepage card + Discover catalog card
const home = read('');
ok(!!home && /class="ra-tce-card"/.test(home), 'homepage Start-here card missing');
ok(!!home && home.includes('/discover/through-christian-eyes'), 'homepage does not link to the page');
if (home) {
  const homeText = stripTags(home);
  ok(homeText.includes(HOME_CARD.eyebrow) && homeText.includes(HOME_CARD.cta), 'homepage Start-here card missing HOME_CARD copy');
}
const hub = read('discover');
ok(!!hub && hub.includes('/discover/through-christian-eyes'), 'Discover hub does not list the page');
ok(fs.existsSync(path.join(repoRoot, 'public/media/through_christian_eyes/cover.jpg')) && fs.existsSync(path.join(DIST, 'media/through_christian_eyes/cover.jpg')), 'cover image missing from dist');

if (failures) {
  console.error(`\n✗ ${failures} of ${checks} checks failed for ${m.path}.`);
  process.exit(1);
}
console.log(`✔ All ${checks} checks passed for ${m.path} (+ homepage card, Discover card).`);
