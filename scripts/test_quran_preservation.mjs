#!/usr/bin/env node
/**
 * Static output audit for "How was the Qurʾān preserved?" (run after `astro build`).
 *
 *   node scripts/test_quran_preservation.mjs [--dist dist] [--allow-sliced]
 *
 * Checks the built HTML, not the source, so it catches what readers actually get (playbook §6). Each
 * concern is a named check group; a failure prints `  ✗ where: [group] message`, a warning prints
 * `  ! where: [group] message` and does not fail the run.
 *
 * `--allow-sliced` permits a partial BUILD_BOOKS / BUILD_SURAHS for local development builds (and
 * then only warns about internal pages missing from dist/). Without it the audit fails, so a sliced
 * config cannot be committed by accident (workspace rule).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONFIG, BASE, BASE_PATH, LEGACY_ANCHORS } from '../src/utils/quranPreservation/config.js';
import { buildModel } from '../src/utils/quranPreservation/model.js';
import { BODY, HEADLINE } from '../src/utils/quranPreservation/tone.js';
import { loadIslamicCommentaries } from '../src/utils/islamic_commentaries_loader.js';
import { BUILD_BOOKS, BUILD_SURAHS } from '../src/utils/build_config.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = name => { const i = process.argv.indexOf(name); return i > -1 ? (process.argv[i + 1] ?? true) : null; };
const DIST = path.resolve(ROOT, arg('--dist') || 'dist');
const ALLOW_SLICED = process.argv.includes('--allow-sliced');
const DATASET = path.join(ROOT, 'src/data/discover/islam/scripture/quran_preservation.json');

const model = buildModel(JSON.parse(fs.readFileSync(DATASET, 'utf8')), CONFIG);
const tafsir = loadIslamicCommentaries();

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
/** Our voice only: drop Arabic runs and anything quoted in curly double quotes (verbatim sources). */
const ourVoice = html => strip(html.replace(/<span class="hrv-ar-inline"[^>]*>[\s\S]*?<\/span>/g, ' ')).replace(/\u201c[^\u201d]*\u201d/g, ' ');
const all = (re, s) => [...s.matchAll(re)];
const len = s => [...s].length;

const route = BASE_PATH.slice(BASE.length).replace(/^\//, '');
const file = path.join(DIST, route, 'index.html');
const html = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
const where = BASE_PATH;
console.log(`Auditing ${where} in ${DIST}`);

const CHECKS = {
  meta(ok) {
    const d = decode(html);
    ok(d.includes(`<title>${model.seo.title} | Ready Apologia</title>`), `title should be "${model.seo.title} | Ready Apologia"`);
    ok(d.includes(`<meta name="description" content="${model.seo.description}"`), 'meta description does not match the SEO spec');
    ok(d.includes(`<link rel="canonical" href="https://readyapologia.com${BASE_PATH}"`), 'canonical URL should be the page path');
    const t = len(model.seo.title), n = len(model.seo.description);
    ok(t >= 20 && t <= 90, `SEO title length ${t} is outside 20–90`);
    ok(n >= 50 && n <= 200, `meta description length ${n} is outside 50–200`);
    ok.warn(t <= 60, `SEO title is ${t} characters; search results truncate after about 60`);
    ok.warn(n <= 160, `meta description is ${n} characters; search results truncate after about 160`);
  },

  leaks(ok, { text }) {
    for (const [re, what] of [
      [/\]\(https?:/, 'raw markdown link'], [/\]\([^)\s]+\)/, 'unrendered markdown link'], [/\*\*/, 'raw ** emphasis'],
      [/\[quran\//, 'unrendered [quran/S:A] token'], [/\{[a-zA-Z]+\}/, 'unfilled {placeholder}'],
      [/\bundefined\b|\bnull\b|\[object Object\]|\bNaN\b/, 'stringified empty value'], [/[\u0000\u0001]/, 'renderer placeholder'],
    ]) { const m = text.match(re); ok(!m, `leak: ${what}${m ? ` ("${m[0]}")` : ''}`); }
  },

  links(ok, { body }) {
    const others = (body.match(/<section[^>]*id="others"[\s\S]*?<\/section>/) || [''])[0];
    for (const [tag, attrs] of all(/<a\b([^>]*)>/g, body).map(m => [m[0], m[1]])) {
      const href = decode((attrs.match(/href="([^"]*)"/) || [])[1] || '');
      ok(href, `link without href: ${tag}`);
      if (!href) continue;
      if (/^https?:/.test(href)) {
        const rel = (attrs.match(/rel="([^"]*)"/) || [])[1] || '';
        ok(/target="_blank"/.test(attrs) && /\bnoopener\b/.test(rel) && /\bnoreferrer\b/.test(rel), `external link without target/rel: ${href}`);
        ok(others.includes(tag) === /\bnofollow\b/.test(rel), `nofollow must mark exactly the "What others are saying" links: ${href}`);
        ok(!/quran\.com\/\d/.test(href), `Qurʾān link should be internal: ${href}`);
        ok(href.startsWith('https://'), `insecure link: ${href}`);
      } else if (href.startsWith('#')) {
        continue; // checked by `anchors`
      } else {
        ok(href.startsWith(`${BASE}/`), `internal link without the site base: ${href}`);
        const p = href.slice(BASE.length).split('#')[0];
        const tab = p.match(/^\/quran\/(\d+)\/(\d+)\/tafsir\/tabari$/);
        if (tab) { ok(tafsir[`${tab[1]}:${tab[2]}`]?.some(t => t.id === 'tabari'), `no Ṭabarī tafsir page for ${tab[1]}:${tab[2]}`); continue; }
        const target = path.join(DIST, p.replace(/^\//, ''), 'index.html');
        const exists = fs.existsSync(target) || fs.existsSync(path.join(DIST, p.replace(/^\//, '')));
        (ALLOW_SLICED ? ok.warn : ok)(exists, `internal link to a page missing from dist/: ${href}`);
        // A deep link's #fragment must exist on the target page (e.g. /quran/0#codex-lost-stoning-umar).
        const frag = href.split('#')[1];
        if (exists && frag && fs.existsSync(target)) ok(fs.readFileSync(target, 'utf8').includes(`id="${decode(frag)}"`), `deep link #${frag} not found on ${p}`);
      }
    }
  },

  anchors(ok, { body, html: page }) {
    const ids = all(/\sid="([^"]+)"/g, page).map(m => m[1]);
    const seen = new Set();
    for (const id of ids) { ok(!seen.has(id), `duplicate id "${id}"`); seen.add(id); }
    for (const [, id] of all(/href="#([^"]*)"/g, body)) ok(seen.has(decode(id)), `href="#${id}" points to no element`);
    for (const legacy of Object.keys(LEGACY_ANCHORS)) ok(seen.has(legacy), `legacy anchor #${legacy} is missing`);
    for (let n = 0; n <= 9; n++) ok(seen.has(`stage-${n}`), `old share link #stage-${n} would not land`);
  },

  tone(ok, { body }) {
    const page = body.replace(/<section[^>]*id="others"[\s\S]*?<\/section>/, ''); // others' titles, verbatim
    // Prose in our voice (quotes and Arabic removed).
    const prose = [
      ...all(/<(p|figcaption)\b[^>]*class="[^"]*\b(?:hrv-intro|qp-dek|hrv-hook|qp-takeaway|qp-disclosure|hrv-further-note|hrv-sc__note)\b[^"]*"[^>]*>([\s\S]*?)<\/\1>/g, page).map(m => m[2]),
      ...all(/<figcaption>([\s\S]*?)<\/figcaption>/g, page.replace(/<figure class="hrv-quote"[\s\S]*?<\/figure>/g, '')).map(m => m[1]),
      ...all(/<div class="hrv-(?:scholar|eval) qp-block">\s*<h4[\s\S]*?<\/h4>\s*<div>([\s\S]*?)<\/div>/g, page).map(m => m[1]),
      ...all(/<div class="hrv-disclosure__body qp-reflection__body">([\s\S]*?)<\/div>/g, page).map(m => m[1]),
      ...all(/<div class="qp-primer__body">([\s\S]*?)<\/div>/g, page).map(m => m[1]),
      ...all(/<span class="qp-applink__note">([\s\S]*?)<\/span>/g, page).map(m => m[1]),
    ].map(ourVoice);
    // Headings, labels and navigation: always our voice, held to the headline list too.
    const heads = [
      ...all(/<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/g, page).map(m => m[2]),
      ...all(/<summary\b[^>]*>([\s\S]*?)<\/summary>/g, page).map(m => m[1]),
      ...all(/<div class="hrv-sc__cap">([\s\S]*?)<\/div>/g, page).map(m => m[1]),
      ...all(/<a class="(?:qp-next|qp-backlink|qp-cross)"[^>]*>([\s\S]*?)<\/a>/g, page).map(m => m[1]),
      ...all(/<a class="hrv-link hrv-link--internal qp-applink"[^>]*>([\s\S]*?)<\/a>/g, page).map(m => m[1]),
    ].map(ourVoice);
    ok(prose.length > 20 && heads.length > 20, `tone gate found too little text (${prose.length} prose, ${heads.length} heads) — selectors out of date?`);
    for (const s of [...prose, ...heads]) { const m = s.match(BODY); ok(!m, `"${m?.[0]}" in: ${s.slice(0, 90)}`); }
    for (const s of [...heads, model.seo.title, model.seo.description]) { const m = s.match(HEADLINE); ok(!m, `headline word "${m?.[0]}" in: ${s.slice(0, 90)}`); }
  },

  jsonld(ok, { html: page }) {
    const blocks = all(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g, page).map(m => m[1]);
    ok(blocks.length === 1, `expected one JSON-LD block, found ${blocks.length}`);
    for (const raw of blocks) {
      let j;
      try { j = JSON.parse(raw); } catch { ok(false, 'JSON-LD does not parse'); continue; }
      const graph = j['@graph'] || [j];
      const article = graph.find(x => x['@type'] === 'Article');
      const crumbs = graph.find(x => x['@type'] === 'BreadcrumbList');
      ok(article && crumbs, 'must contain Article and BreadcrumbList');
      ok(graph.filter(x => x['@type'] === 'Article').length === 1, 'exactly one Article');
      ok(!/"FAQPage"|"ClaimReview"/.test(raw), 'must not contain FAQPage or ClaimReview');
      if (!article) continue;
      ok(article.headline === model.seo.title, 'Article.headline must equal the SEO title');
      ok(article.url === `https://readyapologia.com${BASE_PATH}`, `Article.url is ${article.url}`);
      ok(article.datePublished <= article.dateModified, 'dateModified must not precede datePublished');
      ok((article.citation || []).length === model.counts.sunnahRefs, `Article.citation lists ${(article.citation || []).length} works; the page cites ${model.counts.sunnahRefs} Sunnah.com pages`);
      ok((article.citation || []).every(c => /^https:\/\/sunnah\.com\//.test(c.url) && c.name), 'every citation needs a name and a Sunnah.com URL');
      ok((crumbs?.itemListElement || []).every(c => /^https:\/\//.test(c.item)), 'breadcrumb items need absolute URLs');
    }
  },

  structure(ok, { body }) {
    const count = re => (body.match(re) || []).length;
    ok(count(/<h1\b/g) === 1, 'exactly one <h1>');
    ok(count(/<article class="qp-item[ "]/g) === model.items.length, `expected ${model.items.length} items`);
    ok(count(/data-qp-copy=/g) === model.items.length, 'every item needs a copy-link button');
    ok(count(/data-qp-copy="[^"]+"[^>]*aria-describedby="[^"]+-h"/g) === model.items.length, 'copy buttons must be described by their item title');
    const evidence = model.items.reduce((n, it) => n + it.evidence.length, 0);
    ok(count(/<article class="hrv-ev"/g) === evidence, `expected ${evidence} evidence cards`);
    ok(/class="hrv-sec qp-sources" id="check-sources"/.test(body), 'missing "Check the sources"');
    // Heading outline: never skip a level going down (h2 → h4 hides structure from heading navigation).
    let prev = 1;
    for (const [, lv] of all(/<h([1-6])\b/g, body)) { ok(Number(lv) <= prev + 1, `heading jumps from h${prev} to h${lv}`); prev = Number(lv); }
    for (const [img] of all(/<img\b[^>]*>/g, body)) ok(/\swidth="\d+"/.test(img) && /\sheight="\d+"/.test(img) && /\salt="[^"]+"/.test(img), `image needs alt, width and height: ${img.slice(0, 80)}`);
  },
};

if (!html) group('exists', where)(false, 'page missing from dist (run astro build first)');
else {
  const body = html.slice(html.indexOf('class="hrv qp"'));
  const ctx = { html, body, text: strip(body) };
  for (const [name, run] of Object.entries(CHECKS)) run(group(name, where), ctx);
}

// ---- outside the page -----------------------------------------------------------------------------
{
  const ok = group('stateless', 'client scripts');
  for (const f of ['src/components/discover/quran-preservation/client.js', 'src/components/discover/hadith-reliability/client.js']) {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    ok(!/localStorage|sessionStorage|indexedDB|document\.cookie/.test(src), `${f} must be stateless`);
  }
}
{
  // P0 regression (review): absolutely positioned descendants must stay inside the .main-content
  // scroller, or #anchor jumps scroll the overflow:hidden .content-frame and hide the sticky bar.
  const ok = group('scroll-container', 'quran-preservation.css');
  const css = fs.readFileSync(path.join(ROOT, 'src/styles/quran-preservation.css'), 'utf8');
  ok(/\.hrv\.qp\s*\{[^}]*position:\s*relative/.test(css), '.hrv.qp must be position: relative');
}
{
  // The Discover card is the first thing a reader sees. The copy change is a pending data proposal,
  // so this only warns until the catalog is updated.
  const ok = group('catalog', 'discoverCatalog.json');
  const entry = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/discoverCatalog.json'), 'utf8')).find(e => e.slug === 'quran-preservation');
  ok(entry, 'missing catalog entry');
  if (entry) {
    const s = `${entry.title} ${entry.description}`;
    const hit = s.match(BODY) || s.match(HEADLINE) || s.match(/\bcorruption\b/i);
    ok.warn(!hit, `card copy uses "${hit?.[0]}": "${s}" (see CATALOG in quranPreservation/config.js)`);
    const n = s.match(/\b(\d+)\s+texts\b/i);
    ok.warn(!n || Number(n[1]) === model.counts.items, `card says ${n?.[1]} texts; the page has ${model.counts.items}`);
  }
}
{
  const ok = group('build-config', 'build_config.js');
  if (!ALLOW_SLICED) ok(BUILD_BOOKS === null && BUILD_SURAHS === null, 'BUILD_BOOKS / BUILD_SURAHS must be null before commit (pass --allow-sliced for local builds)');
}

console.log(failures ? `\n${failures} of ${checks} checks failed${warnings ? `, ${warnings} warnings` : ''}` : `\nAll ${checks} checks passed${warnings ? ` (${warnings} warnings)` : ''}`);
process.exit(failures ? 1 : 0);
