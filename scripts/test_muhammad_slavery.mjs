#!/usr/bin/env node
/**
 * Static output audit for "Muhammad and slavery" (hub + 3 sub-pages). Run after `astro build`.
 *
 *   node --experimental-sqlite scripts/test_muhammad_slavery.mjs [--dist dist] [--allow-sliced] [--allow-pending-data]
 *
 * Checks the built HTML, not the source, so it catches what readers actually get (playbook §6). Each
 * concern is a named check group; a failure prints `  ✗ where: [group] message`, a warning prints
 * `  ! where: [group] message` and does not fail the run. Groups: meta, leaks, quotes, links, anchors, tone,
 * jsonld, structure, analytics (per page) and stateless, scroll-container, catalog, build-config.
 *
 * `--allow-sliced` permits a partial BUILD_BOOKS / BUILD_SURAHS for local development builds (and then
 * only warns about internal pages missing from dist/). Without it the audit fails, so a sliced config
 * cannot be committed by accident (workspace rule).
 *
 * `--allow-pending-data` downgrades the Discover catalog check to a warning while the card copy is a
 * pending data proposal (src/data is read-only for the article). Without it a stale or off-tone catalog
 * card fails the audit, so the article cannot ship behind an old card (code_review.md P0-1).
 */
import fs from 'node:fs';
import path from 'node:path';
import { BASE, PAGE_PATHS, ANALYTICS, ANALYTICS_EVENT, CATALOG_SLUG } from '../src/utils/muhammadSlavery/config.js';
import { BODY, HEADLINE, ARTICLE, ourVoice as ourVoiceText } from '../src/utils/muhammadSlavery/tone.js';
import { BUILD_BOOKS, BUILD_SURAHS } from '../src/utils/build_config.js';
import { ROOT, arg, json, loadModel } from './muhammad_slavery/lib.mjs';

process.chdir(ROOT);
const DIST = path.resolve(ROOT, arg('--dist') || 'dist');
const ALLOW_SLICED = process.argv.includes('--allow-sliced');
const ALLOW_PENDING_DATA = process.argv.includes('--allow-pending-data');
const { model, ctx, commentaries } = loadModel();

// ---- tiny harness -------------------------------------------------------------------------------
let failures = 0;
let warnings = 0;
let checks = 0;
function group(name, where) {
  const ok = (cond, msg) => { checks++; if (!cond) { failures++; console.error(`  ✗ ${where}: [${name}] ${msg}`); } };
  ok.warn = (cond, msg) => { if (!cond) { warnings++; console.warn(`  ! ${where}: [${name}] ${msg}`); } };
  return ok;
}

// ---- helpers ------------------------------------------------------------------------------------
const decode = s => s.replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const strip = html => decode(html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
/**
 * Removes every element whose opening tag matches `open` (a regex source for the attributes), with its
 * content; nested elements of the same tag are balanced.
 */
function dropElements(html, open) {
  const re = new RegExp(`<([a-z][a-z0-9]*)\\b[^>]*${open}[^>]*>`, 'gi');
  let out = '';
  let pos = 0;
  let m;
  while ((m = re.exec(html))) {
    const tag = m[1].toLowerCase();
    const tagRe = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi');
    tagRe.lastIndex = m.index + m[0].length;
    let depth = 1;
    let t;
    while (depth && (t = tagRe.exec(html))) depth += t[1] ? -1 : 1;
    const end = t ? t.index + t[0].length : html.length;
    out += `${html.slice(pos, m.index)} `;
    pos = end;
    re.lastIndex = end;
  }
  return out + html.slice(pos);
}
/**
 * The verbatim containers: everything else on the page is our own voice. A deny-list, so a new text
 * class is tone-checked by default (code_review.md P2-16). Quotations still in running text are removed
 * by tone.js `ourVoice` (one definition with the model; 12+ characters only, so a scare quote is checked).
 */
const VERBATIM = ['<blockquote', 'class="[^"]*\\bms-report__text\\b', 'lang="ar"', 'class="[^"]*\\bms-vq\\b', 'class="[^"]*\\bms-verse__text\\b'];
const ourVoice = html => ourVoiceText(strip(VERBATIM.reduce((h, open) => (open === '<blockquote' ? h.replace(/<blockquote\b[\s\S]*?<\/blockquote>/g, ' ') : dropElements(h, open)), html)));
const all = (re, s) => [...s.matchAll(re)];
const len = s => [...s].length;
const fileFor = p => path.join(DIST, p.slice(BASE.length).replace(/^\//, ''), 'index.html');

const PAGES = [
  { key: 'hub', path: PAGE_PATHS.hub, seo: model.seo.hub, items: 0 },
  { key: 'hadith', path: PAGE_PATHS.hadith, seo: model.seo.hadith, items: model.pages.hadith.items.length, legacy: Array.from({ length: 7 }, (_, i) => `cat-${i + 1}`) },
  { key: 'quran', path: PAGE_PATHS.quran, seo: model.seo.quran, items: model.pages.quran.items.length, legacy: model.pages.quran.items.map(i => i.id) },
  { key: 'answers', path: PAGE_PATHS.answers, seo: model.seo.answers, items: model.pages.answers.items.length, legacy: Array.from({ length: 9 }, (_, i) => `faq-${i + 1}`) },
];
const html = Object.fromEntries(PAGES.map(p => [p.key, fs.existsSync(fileFor(p.path)) ? fs.readFileSync(fileFor(p.path), 'utf8') : null]));
const idsOf = page => new Set(all(/\sid="([^"]+)"/g, page).map(m => m[1]));
const idsByPath = Object.fromEntries(PAGES.filter(p => html[p.key]).map(p => [p.path, idsOf(html[p.key])]));

const CHECKS = {
  meta(ok, { page, p }) {
    const d = decode(page);
    ok(d.includes(`<title>${p.seo.title} | Ready Apologia</title>`), `title should be "${p.seo.title} | Ready Apologia"`);
    ok(d.includes(`<meta name="description" content="${p.seo.description}"`), 'meta description does not match the SEO spec');
    ok(d.includes(`<link rel="canonical" href="https://readyapologia.com${p.path}"`), 'canonical URL should be the page path');
    ok(!/<meta name="keywords"/.test(page), 'no meta keywords on these pages');
    const t = len(p.seo.title), n = len(p.seo.description);
    ok(t >= 20 && t <= 90, `SEO title length ${t} is outside 20–90`);
    ok(n >= 50 && n <= 200, `meta description length ${n} is outside 50–200`);
    ok.warn(t <= 66, `SEO title is ${t} characters; search results truncate after about 60`);
    ok.warn(n <= 160, `meta description is ${n} characters; search results truncate after about 160`);
  },

  leaks(ok, { text }) {
    for (const [re, what] of [
      [/\]\(https?:/, 'raw markdown link'], [/\]\([^)\s]+\)/, 'unrendered markdown link'], [/\*\*/, 'raw ** emphasis'],
      [/\{[a-zA-Z]+\}/, 'unfilled {placeholder}'], [/\bundefined\b|\bnull\b|\[object Object\]|\bNaN\b/, 'stringified empty value'],
      [/[\u0000\u0001]/, 'renderer placeholder'], [/\[\[|\]\]/, 'raw highlight marker'],
      [/Sahih Muslim \d+:\d+|\bMuslim \d+:\d+/, 'in-book Muslim label (use the canonical number)'],
      [/\b(?:bukhari|muslim|abudawud|nasai|ibnmajah):\d+/, 'raw reference key'],
      [/\b190\b|\b228\b/, 'dataset entry count (count distinct texts)'],
      [/Tip: Tap on any verse/, 'site onboarding tip'],
    ]) { const m = text.match(re); ok(!m, `leak: ${what}${m ? ` ("${m[0]}")` : ''}`); }
  },

  quotes(ok, { text }) {
    // A source's own ASCII quotes inside our “…” must render as ‘…’ (text.js nestQuotes), never `…me?"”`.
    const nested = all(/\u201c[^\u201c\u201d]*"[^\u201c\u201d]*\u201d/g, text);
    ok(!nested.length, `${nested.length} ASCII double quote(s) inside our curly quotes`);
    for (const m of nested) console.error(`      …${m[0].slice(-90)}`);
    const doubled = all(/["\u201c\u201d]\s*["\u201c\u201d]/g, text);
    ok(!doubled.length, `${doubled.length} doubled quote mark(s)`);
    for (const m of doubled) console.error(`      …${text.slice(Math.max(0, m.index - 70), m.index + 20)}…`);
  },

  links(ok, { body }) {
    for (const [tag, attrs] of all(/<a\b([^>]*)>/g, body).map(m => [m[0], m[1]])) {
      const href = decode((attrs.match(/href="([^"]*)"/) || [])[1] || '');
      ok(href, `link without href: ${tag}`);
      if (!href) continue;
      if (/^https?:/.test(href)) {
        const rel = (attrs.match(/rel="([^"]*)"/) || [])[1] || '';
        ok(/target="_blank"/.test(attrs) && /\bnoopener\b/.test(rel) && /\bnoreferrer\b/.test(rel), `external link without target/rel: ${href}`);
        ok(!/\bnofollow\b/.test(rel), `nofollow on a source link: ${href}`);
        ok(!/quran\.com\/\d/.test(href), `Qurʾān link should be internal: ${href}`);
        ok(href.startsWith('https://'), `insecure link: ${href}`);
        ok(!/sunnah\.com\/muslim\/\d+\/\d+/.test(href), `in-book Muslim URL (use the canonical number): ${href}`);
      } else if (href.startsWith('#')) {
        continue; // checked by `anchors`
      } else {
        ok(href.startsWith(`${BASE}/`), `relative or base-less internal link: ${href}`);
        const [p, hash] = href.slice(BASE.length).split('#');
        const tab = p.match(/^\/quran\/(\d+)\/(\d+)\/tafsir\/(tabari|ibn_kathir)$/);
        if (tab) { ok(commentaries[`${tab[1]}:${tab[2]}`]?.some(t => t.id === tab[3]), `no ${tab[3]} tafsir page for ${tab[1]}:${tab[2]}`); continue; }
        if (/^\/hadith\/(bukhari|muslim)\/[\w]+$/.test(p)) { ok(ctx.permalinks.has(p), `no hadith page ${p}`); continue; }
        const target = path.join(DIST, p.replace(/^\//, ''), 'index.html');
        const exists = fs.existsSync(target) || fs.existsSync(path.join(DIST, p.replace(/^\//, '')));
        (ALLOW_SLICED ? ok.warn : ok)(exists, `internal link to a page missing from dist/: ${href}`);
        if (hash && idsByPath[`${BASE}${p}`]) ok(idsByPath[`${BASE}${p}`].has(hash), `cross-page anchor ${href} lands on no element`);
      }
    }
  },

  anchors(ok, { body, page, p }) {
    const ids = all(/\sid="([^"]+)"/g, page).map(m => m[1]);
    const seen = new Set();
    for (const id of ids) { ok(!seen.has(id), `duplicate id "${id}"`); seen.add(id); }
    for (const [, id] of all(/href="#([^"]*)"/g, body)) ok(seen.has(decode(id)), `href="#${id}" points to no element`);
    for (const legacy of p.legacy || []) ok(seen.has(legacy), `old share link #${legacy} would not land`);
  },

  tone(ok, { body, p }) {
    const main = body.replace(/<script[\s\S]*?<\/script>/g, ' ');
    const voice = ourVoice(main);
    ok(voice.length > 2000, `tone gate found too little text (${voice.length} characters) — is the page body empty?`);
    const hits = [BODY, ARTICLE].flatMap(re => all(new RegExp(re.source, 'gi'), voice));
    ok(!hits.length, `${hits.length} banned word(s) in our voice`);
    for (const h of hits) console.error(`      "${h[0]}": …${voice.slice(Math.max(0, h.index - 60), h.index + 60)}…`);
    const heads = [
      ...all(/<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/g, main).map(m => m[2]),
      ...all(/<summary\b[^>]*>([\s\S]*?)<\/summary>/g, main).map(m => m[1]),
      ...all(/<div class="hrv-sc__cap"[^>]*>([\s\S]*?)<\/div>/g, main).map(m => m[1]),
      ...all(/<a class="(?:ms-next|hrv-crumb|ms-browse__card|hrv-row)[^"]*"[^>]*>([\s\S]*?)<\/a>/g, main).map(m => m[1]),
      ...all(/<p class="hrv-eyebrow ms-ctx"[^>]*>([\s\S]*?)<\/p>/g, main).map(m => m[1]),
    ].map(ourVoice);
    ok(heads.length > 10, `headline gate found ${heads.length} headings — selectors out of date?`);
    for (const s of [...heads, p.seo.title, p.seo.description]) { const m = s.match(HEADLINE); ok(!m, `headline word "${m?.[0]}" in: ${s.slice(0, 90)}`); }
  },

  jsonld(ok, { page, p }) {
    const blocks = all(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g, page).map(m => m[1]);
    ok(blocks.length === 1, `expected one JSON-LD block, found ${blocks.length}`);
    for (const raw of blocks) {
      ok(!/"FAQPage"|"ClaimReview"/.test(raw), 'must not contain FAQPage or ClaimReview');
      let data;
      try { data = JSON.parse(raw); } catch { ok(false, 'JSON-LD does not parse'); continue; }
      const graph = data['@graph'] || [data];
      const article = graph.find(x => x['@type'] === 'Article');
      const crumbs = graph.find(x => x['@type'] === 'BreadcrumbList');
      const list = graph.find(x => x['@type'] === 'ItemList');
      ok(article && crumbs && list, 'must contain Article, BreadcrumbList and ItemList');
      if (!article) continue;
      ok(article.headline === p.seo.title, 'Article.headline must equal the SEO title');
      ok(article.url === `https://readyapologia.com${p.path}`, `Article.url is ${article.url}`);
      ok((crumbs?.itemListElement || []).every(c => /^https:\/\//.test(c.item)), 'breadcrumb items need absolute URLs');
      ok(!p.items || list?.numberOfItems === p.items, `ItemList lists ${list?.numberOfItems}; the page has ${p.items}`);
      ok((article.citation || []).every(c => /^https:\/\/sunnah\.com\//.test(c.url) && c.name), 'every citation needs a name and a Sunnah.com URL');
    }
  },

  structure(ok, { body, p }) {
    const count = re => (body.match(re) || []).length;
    ok(count(/<h1\b/g) === 1, 'exactly one <h1>');
    if (p.items) {
      ok(count(/<article class="ms-item[ "]/g) === p.items, `expected ${p.items} items, found ${count(/<article class="ms-item[ "]/g)}`);
      ok(count(/data-ms-copy=/g) === p.items, 'every item needs a copy-link button');
      ok(/data-ms-index/.test(body), 'missing the "On this page" index');
      ok(/id="other-parts"/.test(body), 'missing "Other parts of this article"');
    } else {
      const rows = count(/<a class="hrv-row"/g);
      const total = model.counts.accounts + model.counts.passages + model.counts.answers;
      ok(rows === total, `the hub should reach all ${total} items (found ${rows} rows)`);
      ok(count(/class="hrv-wit__card"/g) >= 3, 'Start here needs at least 3 witness cards (IA R1 P0-2)');
    }
    for (const [, url] of all(/<astro-island[^>]*component-url="([^"]+)"/g, body)) ok(!/slavery|Pillar/i.test(url), `React island on the page: ${url}`);
    let prev = 1;
    for (const [, lv] of all(/<h([1-6])\b/g, body)) { ok(Number(lv) <= prev + 1, `heading jumps from h${prev} to h${lv}`); prev = Number(lv); }
  },

  analytics(ok, { page, p }) {
    const m = page.match(/id="route-analytics-payload" data-payload="([^"]+)"/);
    ok(m, 'missing RouteAnalytics payload');
    if (m) {
      const payload = JSON.parse(decode(m[1]));
      ok(payload.eventName === ANALYTICS_EVENT, `event name is ${payload.eventName}`);
      ok(JSON.stringify(payload.params) === JSON.stringify(ANALYTICS[p.key]), `analytics params changed: ${JSON.stringify(payload.params)}`);
    }
  },
};

for (const p of PAGES) {
  const page = html[p.key];
  if (!page) { group('exists', p.path)(false, 'page missing from dist (run astro build first)'); continue; }
  console.log(`Auditing ${p.path}`);
  const start = page.indexOf('class="hrv ms');
  const body = page.slice(start);
  const c = { page, body, text: strip(body), p };
  for (const [name, run] of Object.entries(CHECKS)) run(group(name, p.path), c);
}

// ---- outside the pages ----------------------------------------------------------------------------
{
  const ok = group('stateless', 'client scripts');
  for (const f of ['src/components/discover/muhammad-slavery/client.js', 'src/components/discover/hadith-reliability/client.js']) {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    ok(!/localStorage|sessionStorage|indexedDB|document\.cookie/.test(src), `${f} must be stateless`);
    ok(!/history\.(?:replace|push)State|location\.hash\s*=/.test(src), `${f} must not rewrite the URL`);
  }
  ok(!fs.existsSync(path.join(ROOT, 'src/components/discover/slavery')), 'the old React islands (src/components/discover/slavery) must be gone');
}
{
  const ok = group('scroll-container', 'muhammad-slavery.css');
  const css = fs.readFileSync(path.join(ROOT, 'src/styles/muhammad-slavery.css'), 'utf8');
  ok(/\.hrv\.ms\s*\{[^}]*position:\s*relative/.test(css), '.hrv.ms must be position: relative');
  ok(!/#974543|#fdf2f2|\bred\b/i.test(css.replace(/\/\*[\s\S]*?\*\//g, '')), 'no alarm red / terracotta in this article');
}
{
  // The Discover card is the first thing a reader sees. Its copy lives in src/data (read-only for the
  // article), so the change is a data proposal; until it lands, only --allow-pending-data lets this pass.
  const ok = group('catalog', 'discoverCatalog.json');
  const gate = ALLOW_PENDING_DATA ? ok.warn : ok;
  const entry = json('src/data/discoverCatalog.json').find(e => e.slug === CATALOG_SLUG);
  ok(entry, 'missing catalog entry');
  ok(model.catalog, 'copy/answers.json has no catalog proposal');
  if (entry && model.catalog) {
    gate(entry.title === model.catalog.title && entry.description === model.catalog.description, `card copy differs from the proposal in copy/answers.json catalog: "${entry.title} / ${entry.description}"`);
    const s = `${entry.title} ${entry.description}`;
    const hit = s.match(BODY) || s.match(HEADLINE) || s.match(ARTICLE) || s.match(/counter-apologetic|\b228\b|\b190\b/i);
    gate(!hit, `card copy uses "${hit?.[0]}"`);
  }
}
{
  const ok = group('build-config', 'build_config.js');
  if (!ALLOW_SLICED) ok(BUILD_BOOKS === null && BUILD_SURAHS === null, 'BUILD_BOOKS / BUILD_SURAHS must be null before commit (pass --allow-sliced for local builds)');
}

console.log(failures ? `\n${failures} of ${checks} checks failed${warnings ? `, ${warnings} warnings` : ''}` : `\nAll ${checks} checks passed${warnings ? ` (${warnings} warnings)` : ''}`);
process.exit(failures ? 1 : 0);
