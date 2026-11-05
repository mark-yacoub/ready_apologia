#!/usr/bin/env node
/**
 * Static output audit for "12 occasions of revelation" (/discover/convenient-revelations; run after
 * `astro build`).
 *
 *   node scripts/test_convenient_revelations.mjs [--dist dist] [--allow-sliced] [--require-catalog]
 *   npm run audit:convenient-revelations -- --allow-sliced
 *
 * Checks the built HTML, not the source, so it catches what readers actually get. Each concern is a
 * named check group; a failure prints `page: [group] message`.
 *
 *   --allow-sliced   permits a partial BUILD_BOOKS / BUILD_SURAHS (local builds). Internal /quran/…
 *                    links are only resolved against dist/ when the build is unsliced.
 *   --require-catalog fails (instead of warning) while the Discover catalog card still carries the old
 *                    wording / cover image (it lives in src/data: a data proposal awaiting sign-off).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConvenientRevelations } from '../src/utils/convenientRevelations/model.js';
import { BASE, BASE_PATH, HUB, ARTICLE_SLUG } from '../src/utils/convenientRevelations/config.js';
import { OWN_VOICE, HEADLINE, OLD_STRINGS } from '../src/utils/convenientRevelations/tone.js';
import { BUILD_BOOKS, BUILD_SURAHS } from '../src/utils/build_config.js';

const arg = name => { const i = process.argv.indexOf(name); return i > -1 ? (process.argv[i + 1] ?? true) : null; };
// Paths resolve from the repo root (this file's parent), whatever the current directory.
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.resolve(ROOT, arg('--dist') || 'dist');
const fromRoot = f => path.join(ROOT, f);
const ALLOW_SLICED = process.argv.includes('--allow-sliced');
const REQUIRE_CATALOG = process.argv.includes('--require-catalog');
const SLICED = BUILD_BOOKS !== null || BUILD_SURAHS !== null;

const model = loadConvenientRevelations();
const data = JSON.parse(fs.readFileSync(fromRoot('src/data/convenient-revelations.json'), 'utf8')).dataset;

// ---- tiny harness -------------------------------------------------------------------------------
let failures = 0;
let warnings = 0;
let checks = 0;
function group(name, page) {
  return (cond, msg) => { checks++; if (!cond) { failures++; console.error(`  ✗ ${page}: [${name}] ${msg}`); } };
}

// ---- helpers ------------------------------------------------------------------------------------
const decode = s => s.replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const stripVerbatim = html => html.replace(/<span class="crv-waqf">[^<]*<\/span>/g, '').replace(/<(q|p|span|div|blockquote)\b[^>]*\bdata-v\b[^>]*>[^<]*<\/\1>/g, ' ');
/** Text of an inline fragment without inserting spaces between tags (ʿ/ʾ marks sit in their own spans). */
const tightText = html => decode(html.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
const textOf = html => decode(html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');
const routeFile = route => path.join(DIST, route.slice(BASE.length).replace(/^\//, ''), 'index.html');
const htmlFor = route => { const p = routeFile(route); return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null; };
const articleHtml = html => { const i = html.indexOf('class="hrv crv'); return i > -1 ? html.slice(i) : ''; };
const idsIn = html => [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);

// ---- pages --------------------------------------------------------------------------------------
const pages = [
  { route: BASE_PATH, seo: HUB.seo, kind: 'hub' },
  ...model.parts.map(p => ({ route: p.href, seo: p.seo, kind: 'part', part: p })),
];
const articleRoutes = new Set(pages.map(p => p.route));
console.log(`Auditing ${pages.length} pages in ${DIST}${SLICED ? ' (sliced build: internal links to other pages not resolved)' : ''}`);

const datasetProse = data.flatMap(t => ['the_claim', 'standard_apologetic_defense', 'the_devastating_counter'].map(f => [`${t.theme}.${f}`, t[f].slice(0, 60)]));

const PAGE_CHECKS = {
  quotes(p, { body }, ok) {
    // Showcase quotes get curly “…” from CSS; a source's own double quotes inside must already be ‘…’.
    const qs = [...body.matchAll(/<q class="crv-q"[^>]*>([\s\S]*?)<\/q>/g)].map(m => m[1]);
    for (const q of qs) ok(!/"|&quot;|&#34;/.test(q), `ASCII double quote nested inside a showcase quote: ${q.slice(0, 80)}`);
  },
  meta(p, { html }, ok) {
    const d = decode(html);
    ok(d.includes(`<title>${p.seo.title} | Ready Apologia</title>`), `title should be "${p.seo.title} | Ready Apologia"`);
    ok(d.includes(`<meta name="description" content="${p.seo.description}"`), 'meta description does not match config');
    ok(p.seo.description.length <= 160, `description is ${p.seo.description.length} chars (max 160)`);
    const og = d.match(/<meta property="og:image" content="([^"]+)"/)?.[1] || '';
    ok(og && !/convenient_revelations\/cover\.jpg/.test(og), `og:image must not be the cover image (${og})`);
    ok(!/cover\.jpg/.test(html), 'cover.jpg must not be referenced anywhere on the page (pending user sign-off)');
    const head = d.slice(0, d.indexOf('</head>'));
    const headNoKw = head.replace(/<meta name="keywords"[^>]*>/, '');
    ok(!OLD_STRINGS.test(textOf(headNoKw.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '')) + ' ' + (head.match(/<meta (?:property|name)="(?:og|twitter):(?:title|description)" content="[^"]*"/g) || []).join(' ')), 'old name or label in <head>');
  },

  structure(p, { body }, ok) {
    const count = re => (body.match(re) || []).length;
    ok(count(/<h1\b/g) === 1, `expected one H1, found ${count(/<h1\b/g)}`);
    ok(!/OnboardingBanner/.test(body), 'onboarding tip must be off (showOnboarding={false})');
    ok(!/cdn\.tailwindcss|class="[^"]*\b(?:bg-red-|text-red-|border-red-)/.test(body), 'no Tailwind / alarm red');
    const ids = idsIn(body);
    const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
    ok(dup.length === 0, `duplicate ids: ${[...new Set(dup)].slice(0, 5).join(', ')}`);
    if (p.kind === 'hub') {
      ok(count(/class="hrv-row crv-row"/g) + count(/class="hrv-row crv-row crv-row--start"/g) === model.items.length, 'hub must list all 12 items');
      ok(count(/class="hrv-row crv-row crv-row--start"/g) === 1, 'Start-here item must appear once as an "↑ Start here" row');
      ok(/class="hrv-start crv-start"/.test(body), 'missing Start-here card');
      for (const it of model.items) ok(body.includes(`href="${it.href}"`), `hub does not link ${it.href}`);
      // Source counts: the footer shows the model's derived counts, and every repository linked from a card is counted.
      const foot = body.slice(body.indexOf('class="hrv-hub-foot"'));
      const shown = [...foot.matchAll(/<li><b>(\d+)<\/b>\s*<span>([\s\S]*?)<\/span><\/li>/g)].map(m => `${m[1]} ${tightText(m[2])}`);
      ok(shown.join(' | ') === model.sourceStats.map(st => `${st.count} ${decode(st.label)}`).join(' | '), `footer counts ${shown.join(' | ')} ≠ model ${model.sourceStats.map(st => `${st.count} ${st.label}`).join(' | ')}`);
      const chips = model.items.flatMap(it => [...it.sources.open, ...it.sources.drawer].flatMap(c => [c, ...c.nested]).flatMap(c => c.chips));
      const kinds = new Set(chips.map(c => c.kind));
      const footText = shown.join(' ');
      for (const [kind, name] of [['bukhari', 'Bukhārī'], ['muslim', 'Muslim'], ['abudawud', 'Abū Dāwūd'], ['nasai', 'al-Nasāʾī'], ['tirmidhi', 'al-Tirmidhī'], ['ibnAbiShaybah', 'Ibn Abī Shaybah'], ['sira', 'Sīrah'], ['tabari', 'al-Ṭabarī'], ['ibnKathir', 'Ibn Kathīr']]) {
        if (kinds.has(kind)) ok(footText.includes(name), `footer omits ${name} (cited on a card)`);
      }
    } else {
      const { part } = p;
      ok(/class="hrv-bar crv-bar"/.test(body), 'missing sticky chapter bar');
      ok(count(/<article class="crv-item"/g) === part.items.length, 'item count mismatch');
      ok(/class="hrv-pager crv-pager"/.test(body), 'missing chapter pager');
      for (const it of part.items) {
        const i = body.indexOf(`<article class="crv-item" id="${it.id}"`);
        ok(i > -1, `missing item ${it.id}`);
        const seg = body.slice(i, body.indexOf('</article>', body.indexOf('class="crv-next', i)));
        const order = ['class="crv-item__h"', 'class="crv-prov"', 'crv-hook', 'class="crv-showcase"', 'class="crv-takeaway"', 'crv-about', 'crv-panel--classical', 'crv-panel--compare', 'class="crv-sources"', 'class="crv-next'];
        const pos = order.map(k => seg.indexOf(k));
        ok(pos.every(x => x > -1) && pos.every((x, k) => k === 0 || x > pos[k - 1]), `${it.id}: item skeleton out of order (${order.filter((k, n) => pos[n] < 0).join(', ') || 'order'})`);
        ok(!/All sources for this item/.test(seg), `${it.id}: per-item sources box was dropped (adv_ia #10)`);
      }
    }
  },

  anchors(p, { body }, ok) {
    if (p.kind !== 'part') return;
    const ids = new Set(idsIn(body));
    for (const it of p.part.items) {
      ok(ids.has(it.id), `missing item id ${it.id}`);
      for (const [k, id] of Object.entries(it.legacy)) ok(ids.has(id), `missing legacy alias ${id} (${k})`);
      const where = (alias, container) => new RegExp(`id="${container}"[^>]*>\\s*<span class="crv-alias" id="${alias}"`).test(body);
      ok(where(it.legacy.defense, `${it.id}-classical`), `${it.legacy.defense} must sit in the classical panel`);
      ok(where(it.legacy.counter, `${it.id}-comparing`), `${it.legacy.counter} must sit in the comparing panel`);
      ok(where(it.legacy.claim, `${it.id}-sources`), `${it.legacy.claim} must sit at the sources heading`);
    }
  },

  content(p, { body }, ok, warn) {
    if (p.kind !== 'part') return;
    for (const it of p.part.items) {
      const cards = [...it.sources.open, ...it.sources.drawer].flatMap(c => [c, ...c.nested]);
      for (const c of cards) {
        const i = body.indexOf(`id="${c.anchor}"`);
        ok(i > -1, `missing source card ${c.anchor}`);
        const nextCard = body.indexOf('class="hrv-ev crv-ev', i + 10);
        const seg = body.slice(i, nextCard > -1 ? nextCard : undefined); // this card only
        for (const ch of c.chips) ok(seg.includes(`href="${ch.href.replace(/&/g, '&amp;')}"`), `${c.anchor}: chip ${ch.label} missing`);
        ok(!c.linkless, `${c.anchor}: "${c.reference}" has no link`);
      }
      const ar = cards.filter(c => c.arabic && !c.summary).length;
      const seg = body.slice(body.indexOf(`<article class="crv-item" id="${it.id}"`));
      const segEnd = seg.indexOf('class="crv-next');
      const arHits = (seg.slice(0, segEnd).match(/class="hrv-quote__ar crv-ev__ar" lang="ar" dir="rtl"/g) || []).length;
      ok(arHits === ar, `${it.id}: ${arHits} Arabic blocks rendered, data has ${ar}`);
    }
    ok(!/sunnah\.com\/nasai:3169/.test(body), 'Nasāʾī 3169 is not the cited report (factcheck)');
    ok(!/islamqa\.info/.test(body), 'never link IslamQA for the Muṣannaf athar');
  },

  leaks(p, { body, html }, ok) {
    const text = textOf(body);
    for (const [where, start] of datasetProse) ok(!text.includes(decode(start)), `dataset prose rendered: ${where}`);
    for (const [re, what] of [[/\*\*/, 'raw ** emphasis'], [/\]\((?:https?:|\/)/, 'raw markdown link'], [/Arabic Reference:/, 'embedded "Arabic Reference:"'], [/passion was lit/, 'interpolation (passion was lit)'], [/\(Note: While Tabari/, 'editorial note inside a quote']]) ok(!re.test(text), `leak: ${what}`);
    ok(!OLD_STRINGS.test(text), `old label in the page: "${text.match(OLD_STRINGS)?.[0]}"`);
    ok(!/\bconvenient\b/i.test(textOf(articleHtml(html).replace(/href="[^"]*"/g, ''))), 'the word "convenient" is in reader-facing text');
  },

  tone(p, { body }, ok) {
    // Our voice only: verbatim source text carries data-v; quotations inside our prose sit in “…”.
    const ours = stripVerbatim(body);
    const unquote = t => t.replace(/“[^”]*”/g, '“…”');
    const text = unquote(textOf(ours));
    const hit = text.match(OWN_VOICE);
    ok(!hit, `own-voice text uses "${hit?.[0]}": …${hit ? text.slice(Math.max(0, hit.index - 60), hit.index + 40) : ''}…`);
    const heads = [...ours.matchAll(/<(h[1-4])\b[^>]*>([\s\S]*?)<\/\1>/g)].map(m => unquote(textOf(m[2]))).join(' | ');
    const headHit = heads.match(HEADLINE) || heads.match(OWN_VOICE);
    ok(!headHit, `heading uses "${headHit?.[0]}"`);
  },

  attributes(p, { body }, ok) {
    // Attribute text is reader-facing too (tooltips, screen readers, crawlers): no internal notes, our voice.
    const MARKERS = /factcheck|fact-check|\badv[ _-]|COPY-[AB]|src\[\d|Top-10|TODO|data proposal/i;
    for (const m of body.matchAll(/\s(title|aria-label|alt|data-(?!v\b)[\w-]+)="([^"]*)"/g)) {
      const [, attr, raw] = m;
      const val = decode(raw);
      ok(!MARKERS.test(val), `internal note in ${attr}="${val.slice(0, 80)}"`);
      if (['title', 'aria-label', 'alt'].includes(attr)) {
        const hit = val.replace(/“[^”]*”/g, '').match(OWN_VOICE) || val.match(OLD_STRINGS);
        ok(!hit, `${attr}="${val.slice(0, 60)}" uses "${hit?.[0]}"`);
      }
    }
  },

  links(p, { body }, ok) {
    for (const m of body.matchAll(/<a\b([^>]*)>/g)) {
      const attrs = m[1];
      const href = decode(attrs.match(/href="([^"]*)"/)?.[1] ?? '');
      ok(href && href !== '#', `empty link in ${attrs.slice(0, 80)}`);
      if (/^https?:/.test(href)) {
        ok(href.startsWith('https://'), `insecure link ${href}`);
        ok(/target="_blank"/.test(attrs) && /rel="noopener noreferrer(?: nofollow)?"/.test(attrs), `external link without target/rel: ${href}`);
      } else if (href.startsWith('#')) {
        ok(idsIn(body).includes(href.slice(1)), `in-page link to missing id ${href}`);
      } else if (href.startsWith(`${BASE}/quran/`)) {
        if (!SLICED) ok(fs.existsSync(routeFile(href)), `internal link to a page not in dist: ${href}`);
        ok(/data-astro-prefetch="false"/.test(attrs), `heavy /quran page is prefetched: ${href}`);
      } else if (href.startsWith(BASE_PATH)) {
        const [route, hash] = href.split('#');
        ok(articleRoutes.has(route.replace(/\/$/, '')), `link to unknown article page: ${href}`);
        if (hash) { const other = htmlFor(route); ok(other && idsIn(other).includes(hash), `link to missing anchor ${href}`); }
      } else {
        ok(href.startsWith('/'), `relative or placeholder link: ${href}`);
      }
    }
  },

  jsonld(p, { html }, ok) {
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => m[1]);
    ok(blocks.length > 0, 'no JSON-LD');
    for (const raw of blocks) {
      let s;
      try { s = JSON.stringify(JSON.parse(raw)); } catch { ok(false, 'JSON-LD does not parse'); continue; }
      ok(/"BreadcrumbList"/.test(s), 'missing BreadcrumbList');
      ok(!/"FAQPage"|"ClaimReview"/.test(s), 'must not contain FAQPage or ClaimReview');
      ok(!/convenient revelations/i.test(s.replace(new RegExp(ARTICLE_SLUG, 'g'), '')), 'JSON-LD uses the old name');
      ok(!/cover\.jpg/.test(s), 'JSON-LD references cover.jpg');
      if (p.kind === 'hub') ok(/"CollectionPage"/.test(s) && /"ItemList"/.test(s), 'hub needs CollectionPage + ItemList');
      else ok(/"Article"/.test(s) && /"citation"/.test(s), 'chapter needs Article with citation');
    }
  },
};

for (const p of pages) {
  const html = htmlFor(p.route);
  group('exists', p.route)(html, 'page missing from dist');
  if (!html) continue;
  const body = articleHtml(html);
  group('exists', p.route)(body, 'article root (.hrv.crv) missing');
  for (const [name, run] of Object.entries(PAGE_CHECKS)) run(p, { html, body }, group(name, p.route));
}

// ---- outside the pages --------------------------------------------------------------------------
{
  const ok = group('stateless', 'client.js');
  for (const f of ['src/components/discover/convenient-revelations/client.js', 'src/components/discover/hadith-reliability/client.js']) {
    const src = fs.readFileSync(fromRoot(f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    ok(!/localStorage|sessionStorage|indexedDB|document\.cookie/.test(src), `${f} must be stateless`);
  }
}
{
  const ok = group('deleted', 'repo');
  for (const f of ['src/components/TailwindSetup.astro', 'src/components/ProgressiveRevealCard.astro', 'src/components/ThemeNavigation.astro', 'src/utils/referenceToLink.ts', 'src/config/themeRoutes.ts', 'src/types/Theme.ts']) ok(!fs.existsSync(fromRoot(f)), `${f} should be deleted`);
}
{
  // The Discover catalog card is outside the dataset (data proposal; user sign-off).
  const warn = (cond, msg) => { checks++; if (cond) return; if (REQUIRE_CATALOG) { failures++; console.error(`  ✗ discoverCatalog.json: [catalog] ${msg}`); } else { warnings++; console.warn(`  ⚠ discoverCatalog.json: [catalog] ${msg}`); } };
  const entry = JSON.parse(fs.readFileSync(fromRoot('src/data/discoverCatalog.json'), 'utf8')).find(e => e.slug === ARTICLE_SLUG);
  group('catalog', 'discoverCatalog.json')(entry, 'missing catalog entry');
  if (entry) {
    const t = `${entry.title} ${entry.description}`;
    const hit = t.match(HEADLINE) || t.match(OWN_VOICE) || t.match(OLD_STRINGS);
    warn(!hit, `catalog card uses "${hit?.[0]}" (data proposal pending)`);
    warn(!/convenient_revelations\/cover\.jpg/.test(entry.thumbnail || ''), 'catalog thumbnail is the cover image (user sign-off pending)');
  }
}
{
  const ok = group('build-config', 'build_config.js');
  if (!ALLOW_SLICED) ok(!SLICED, 'BUILD_BOOKS / BUILD_SURAHS must be null before commit (pass --allow-sliced for local builds)');
}

console.log(failures ? `\n${failures} of ${checks} checks failed${warnings ? `, ${warnings} warnings` : ''}` : `\nAll ${checks} checks passed${warnings ? ` (${warnings} warnings)` : ''}`);
process.exit(failures ? 1 : 0);
