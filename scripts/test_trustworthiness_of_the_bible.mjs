#!/usr/bin/env node
/**
 * Static output audit for /discover/trustworthiness-of-the-bible (run after `astro build`).
 *
 *   NODE_OPTIONS='--experimental-sqlite' node scripts/test_trustworthiness_of_the_bible.mjs [--dist dist] [--allow-sliced]
 *
 * Checks the built HTML and stylesheets across 10 named check groups:
 *   meta          one <title>, description, canonical, og:type/og:image, keywords, tone clean
 *   leaks         no raw markdown, unfilled {placeholders}, template leaks, raw LLM prompts, broken DB codes
 *   links         external -> https + new tab + noopener + config.HOSTS; Qurʾān -> tafsir pages;
 *                 Bible -> valid /bible/<book>/<ch>(#<v>|/<v>/manuscripts); in-page #hashes exist;
 *                 data-src scan images have 0 spaces/parens and no eager src= while closed
 *   tone          our voice (quotations stripped) & headings against src/utils/trustworthinessBible/tone.js
 *   colours       no alarm red / pink in .hrv/.twb CSS or inline styles
 *   jsonld        Article (+citation) and BreadcrumbList with unique positions/URLs; no FAQPage/ClaimReview
 *   structure     one H1, 4 sections, 100% of legacy aliases + 12 themes + 96 items unique (0 duplicate IDs),
 *                 zero React islands, no onboarding banner, 4-move assessment blocks visible
 *   stateless     client.js uses no storage and never rewrites the URL; .astro has zero client:* directives
 *   catalog       rendered Discover catalog card copy in dist/discover/index.html + academic tone check
 *   build-config  BUILD_BOOKS / BUILD_SURAHS must be null before commit (--allow-sliced for local builds)
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import RAW_DATA from '../src/data/trustworthiness-of-the-bible.json' with { type: 'json' };
import { DISCOVER_CATALOG_OVERRIDES } from '../src/utils/discoverCatalogOverrides.ts';
import * as CONTENT from '../src/utils/trustworthinessBible/content.js';
import * as O from '../src/utils/trustworthinessBible/overrides.js';
import { loadTrustworthinessBible } from '../src/utils/trustworthinessBible/model.js';
import {
  BASE,
  BASE_PATH,
  DATA_FILE,
  EXPECTED_DATA_SHA256,
  SECTION_ORDER,
  OLD_IDS,
  CATALOG_SLUG,
  GLANCE_ID,
  SOURCES_ID,
  HOSTS,
  VALID_BOOKS,
} from '../src/utils/trustworthinessBible/config.js';
import { BANNED, HEADLINE_BANNED, OLD_VOCAB_BANNED } from '../src/utils/trustworthinessBible/tone.js';
import { loadIslamicCommentaries } from '../src/utils/islamic_commentaries_loader.js';
import { BUILD_BOOKS, BUILD_SURAHS } from '../src/utils/build_config.js';

const arg = name => { const i = process.argv.indexOf(name); return i > -1 ? (process.argv[i + 1] ?? true) : null; };
const DIST = path.resolve(arg('--dist') || 'dist');
const ALLOW_SLICED = process.argv.includes('--allow-sliced');

const model = loadTrustworthinessBible(CONTENT);
const tafsir = loadIslamicCommentaries();

let failures = 0;
let checks = 0;
const notes = [];
function group(name, page) {
  return (cond, msg) => { checks++; if (!cond) { failures++; console.error(`  ✗ ${page}: [${name}] ${msg}`); } };
}

const decode = s => s.replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const textOf = html => decode(html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');
const distFile = route => {
  const rel = route.slice(BASE.length).replace(/^\//, '').split('#')[0].replace(/\/$/, '');
  return path.join(DIST, rel, 'index.html');
};

/** Removes primary-source quotations and curly/straight/HTML-encoded verbatim citations so only our voice remains. */
const stripQuotes = html => html
  .replace(/<blockquote\b[\s\S]*?<\/blockquote>/g, ' ')
  .replace(/<q\b[\s\S]*?<\/q>/g, ' ')
  .replace(/<p class="hrv-quote__en"[\s\S]*?<\/p>/g, ' ')
  .replace(/<footer class="twb-card__cite"[\s\S]*?<\/footer>/g, ' ')
  .replace(/<span class="hrv-(?:ar-inline|chain|math)"[^>]*>[\s\S]*?<\/span>/g, ' ')
  .replace(/“(?:[^”<]|<(?!\/?(?:p|li|div|h[1-6]|blockquote|section|article|aside|details|summary|ul|ol|figure)\b))*”/g, ' ')
  .replace(/&quot;(?:(?!&quot;)(?:[^<]|<(?!\/?(?:p|li|div|h[1-6]|blockquote|section|article|aside|details|summary|ul|ol|figure)\b)))*&quot;/g, ' ')
  .replace(/"(?:[^"<]|<(?!\/?(?:p|li|div|h[1-6]|blockquote|section|article|aside|details|summary|ul|ol|figure)\b))*"/g, ' ');

/**
 * Checks whether a valid /bible or /quran internal route is absent only because dist was built in
 * sliced preview mode (preview.sh builds a subset of books/surahs and then restores build_config.js).
 */
const slicedOut = href => {
  const r = href.slice(BASE.length);
  let m;
  if ((m = r.match(/^\/quran\/(\d+)\//))) {
    if (BUILD_SURAHS) return !BUILD_SURAHS.has(m[1]);
    return ALLOW_SLICED && !fs.existsSync(distFile(href));
  }
  if ((m = r.match(/^\/bible\/([a-z0-9]+)\//))) {
    if (!VALID_BOOKS.has(m[1])) return false;
    if (BUILD_BOOKS) return !BUILD_BOOKS.has(m[1]);
    return ALLOW_SLICED && !fs.existsSync(distFile(href));
  }
  return false;
};

const BANNED_COLOURS = /#(974543|881337|faf5f5|fecdd3)\b/i;

const route = BASE_PATH;
const file = distFile(route);
const html = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
console.log(`Auditing ${route} in ${DIST}${ALLOW_SLICED ? ' (sliced build allowed)' : ''}`);
group('exists', route)(html, 'page missing from dist');

if (html) {
  const start = html.indexOf('<article class="hrv twb"');
  const end = html.lastIndexOf('</article>');
  const body = start > -1 ? html.slice(start, end > start ? end + 10 : undefined) : '';
  group('structure', route)(start > -1, 'article.hrv.twb not found');
  const text = textOf(body);

  // ---- meta -------------------------------------------------------------------------------------
  {
    const ok = group('meta', route);
    const d = decode(html);
    ok((html.match(/<title>/g) || []).length === 1, 'exactly one <title>');
    ok(d.includes(`<title>${model.seo.title} | Ready Apologia</title>`), `title should be "${model.seo.title} | Ready Apologia"`);
    ok(d.includes(`<meta name="description" content="${model.seo.description}"`), 'meta description does not match content.js SEO');
    ok(/<link rel="canonical" href="https?:\/\/[^"]*\/discover\/trustworthiness-of-the-bible"/.test(html), 'canonical URL missing or wrong');
    ok(/property="og:type" content="article"/.test(html), 'og:type should be article');
    ok(/property="og:image" content="https?:\/\/[^"]*\/media\/trustworthiness_bible\/cover\.jpg"/.test(html), 'og:image should be the cover');
    ok(/property="og:title"/.test(html) && /property="og:description"/.test(html), 'og:title / og:description missing');
    const metaVoice = `${model.seo.title} ${model.seo.description}`;
    const metaHit = metaVoice.match(BANNED) || metaVoice.match(HEADLINE_BANNED) || metaVoice.match(OLD_VOCAB_BANNED);
    ok(!metaHit, `title/description tone: "${metaHit?.[0]}"`);
  }

  // ---- leaks ------------------------------------------------------------------------------------
  {
    const ok = group('leaks', route);
    for (const [re, what] of [
      [/\*\*|\]\(|^#{2,}\s/m, 'raw markdown'],
      [/\$\\|\\chi\b/, 'raw LaTeX math'],
      [/\{(n|m|refs?|title|size)\}/, 'unfilled {placeholder}'],
      [/\bundefined\b|\bNaN\b|\[object Object\]|@@TWBTOK/, 'template value leak'],
      [/[\u0000\u0001]/, 'renderer placeholder'],
      [/\\'/, 'escaped apostrophe (\\\')'],
      [/TODO|lorem ipsum|command to llm/i, 'TODO / raw LLM prompt leak'],
      [/\b(?:1PT 0 0|MT 0 0|Other NT References)\b/i, 'broken legacy DB code or fake patristic row'],
    ]) ok(!re.test(text), `${what} in rendered text`);
    ok(!/&lt;(?:strong|em|a|code|span)\b|&amp;(?:quot|amp|lt|gt);/.test(body), 'double-escaped HTML entities in rendered markup');
  }

  // ---- links & lazy scans -----------------------------------------------------------------------
  {
    const ok = group('links', route);
    const allIds = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
    const idSet = new Set(allIds);
    const dupIds = allIds.filter((id, idx) => allIds.indexOf(id) !== idx);
    ok(dupIds.length === 0, `duplicate DOM IDs in built HTML: ${[...new Set(dupIds)].join(', ')}`);

    const anchors = [...body.matchAll(/<a\b([^>]*)>/g)].map(m => m[1]);
    let sliced = 0;
    for (const attrs of anchors) {
      const href = decode(attrs.match(/\bhref="([^"]*)"/)?.[1] || '');
      ok(href, `anchor without href: <a${attrs.slice(0, 80)}>`);
      if (!href) continue;
      ok(!/^\/\//.test(href), `protocol-relative link: ${href}`);
      ok(!/\s/.test(href), `URL contains whitespace: ${href}`);
      if (/^https?:\/\//.test(href)) {
        ok(/^https:/.test(href), `external link must be https: ${href}`);
        ok(/target="_blank"/.test(attrs) && /rel="noopener noreferrer(?: nofollow)?"/.test(attrs), `external link without target/rel noopener: ${href}`);
        ok(!/quran\.com\/\d/.test(href), `Qurʾān link should be internal: ${href}`);
        const host = new URL(href).hostname;
        ok(Boolean(HOSTS[host]), `external host not in config.HOSTS: ${host} (${href})`);
        continue;
      }
      if (href.startsWith('#')) { ok(idSet.has(href.slice(1)), `in-page anchor has no target: ${href}`); continue; }
      ok(href.startsWith(`${BASE}/`), `relative or non-BASE link: ${href}`);
      ok(!/target="_blank"/.test(attrs), `internal link opens a new tab: ${href}`);
      ok(!/\/bible\/rev\//.test(href), `Bible link uses "rev" (the book id is "rv"): ${href}`);
      const r = href.slice(BASE.length);
      const t = r.match(/^\/quran\/(\d+)\/(\d+)\/tafsir\/(tabari|ibn_kathir)$/);
      if (/^\/quran\/\d+\/\d+/.test(r)) ok(t, `Qurʾān verse links must open a tafsir page: ${href}`);
      if (t) ok(tafsir[`${t[1]}:${t[2]}`]?.some(c => c.id === t[3]), `no ${t[3]} tafsir page for ${t[1]}:${t[2]}`);
      if (/^\/bible\//.test(r)) {
        ok(/^\/bible\/[a-z0-9]+\/\d+(?:#\d+|\/\d+\/manuscripts)?$/.test(r), `invalid Bible link format: ${href}`);
      }
      if (/^\/(?:bible|quran)\//.test(r)) {
        ok(/\bdata-astro-prefetch="false"/.test(attrs), `internal scripture/tafsir link missing data-astro-prefetch="false": ${href}`);
      }
      if (slicedOut(href)) {
        if (ALLOW_SLICED) { sliced++; continue; }
      }
      ok(fs.existsSync(distFile(href)), `internal link to a page missing from dist: ${href}`);
    }

    // Verify all 14 folio scan images use lazy data-src (0 eager src while closed) and have 0 spaces/parens
    const scanImgs = [...body.matchAll(/<img\b([^>]*class="twb-scan__img"[^>]*)>/g)].map(m => m[1]);
    ok(scanImgs.length === 14, `expected 14 lazy R2 folio scan images, found ${scanImgs.length}`);
    for (const imgAttrs of scanImgs) {
      const dsrc = decode(imgAttrs.match(/\bdata-src="([^"]*)"/)?.[1] || '');
      ok(dsrc.startsWith('https://mss.readyapologia.com/'), `scan img missing R2 data-src: ${dsrc}`);
      ok(!/[\s()]/.test(dsrc), `scan data-src has unencoded space or parenthesis: ${dsrc}`);
      ok(!/\ssrc="/.test(imgAttrs), `scan img must not have eager src= in static HTML: ${dsrc}`);
    }

    if (sliced) notes.push(`links: ${sliced} internal links point at /bible or /quran routes outside the sliced build (verified against data.db/scripture/tafsir)`);
  }

  // ---- tone -------------------------------------------------------------------------------------
  {
    const ok = group('tone', route);
    const voice = textOf(stripQuotes(body));
    for (const re of [BANNED, OLD_VOCAB_BANNED]) {
      const hits = [...new Set((voice.match(new RegExp(re.source, 'gi')) || []).map(s => s.toLowerCase()))];
      for (const h of hits) {
        const i = voice.toLowerCase().indexOf(h);
        ok(false, `"${h}" in our voice: …${voice.slice(Math.max(0, i - 60), i + 50).trim()}…`);
      }
    }
    const heads = [
      ...body.matchAll(/<(h[1-4])\b[^>]*>([\s\S]*?)<\/\1>/g),
      ...body.matchAll(/<(summary)\b[^>]*>([\s\S]*?)<\/\1>/g),
      ...body.matchAll(/<a class="twb-nav__chip"[^>]*>([\s\S]*?)<\/a>/g).map(m => [m[0], 'a', m[1]]),
    ].map(m => textOf(stripQuotes(m[2])));
    for (const h of heads) {
      const hit = h.match(HEADLINE_BANNED) || h.match(BANNED) || h.match(OLD_VOCAB_BANNED);
      ok(!hit, `heading/label uses "${hit?.[0]}": ${h.trim()}`);
    }
  }

  // ---- colours ----------------------------------------------------------------------------------
  {
    const ok = group('colours', route);
    const cssFiles = [...html.matchAll(/<link[^>]+href="([^"]+\.css)"/g)].map(m => m[1]);
    let css = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
    for (const href of cssFiles) {
      const p = path.join(DIST, href.slice(BASE.length).replace(/^\//, ''));
      if (fs.existsSync(p)) css += `\n${fs.readFileSync(p, 'utf8')}`;
    }
    const ours = css.split('}').filter(r => /\.twb\b|\.hrv\b/.test(r)).join('}');
    const hit = ours.match(BANNED_COLOURS);
    ok(!hit, `banned colour ${hit?.[0]} in the page's .hrv/.twb CSS`);
    const src = fs.readFileSync('src/styles/trustworthiness-of-the-bible.css', 'utf8');
    ok(!BANNED_COLOURS.test(src), 'banned colour in src/styles/trustworthiness-of-the-bible.css');
    ok(!/style="[^"]*#(974543|881337|faf5f5|fecdd3)/i.test(body), 'banned colour in an inline style');
  }

  // ---- jsonld -----------------------------------------------------------------------------------
  {
    const ok = group('jsonld', route);
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => m[1]);
    ok(blocks.length > 0, 'no JSON-LD');
    const all = [];
    for (const raw of blocks) {
      try {
        const j = JSON.parse(raw);
        const list = Array.isArray(j) ? j : [j];
        for (const x of list) all.push(...(x['@graph'] || [x]));
      } catch { ok(false, 'JSON-LD does not parse'); }
    }
    const articles = all.filter(n => n['@type'] === 'Article');
    const article = articles[0];
    const crumbs = all.find(n => n['@type'] === 'BreadcrumbList');
    ok(article && crumbs, 'must contain Article and BreadcrumbList');
    ok(articles.length === 1, `exactly one Article (found ${articles.length})`);
    ok(!all.some(n => /FAQPage|ClaimReview/.test(n['@type'])), 'must not contain FAQPage or ClaimReview');
    if (article) {
      ok(article.headline === model.seo.title, 'Article.headline should equal the SEO title (no suffix)');
      ok(!/Ready Apologia$/.test(article.headline || ''), 'Article.headline carries the site suffix');
      ok(article.datePublished, 'Article.datePublished missing');
      ok(Array.isArray(article.citation) && article.citation.length > 0, 'Article.citation missing');
      ok((article.citation || []).every(c => /^https:\/\//.test(c.url)), 'Article.citation URLs must be https');
    }
    if (crumbs) {
      const items = crumbs.itemListElement || [];
      ok(new Set(items.map(i => i.position)).size === items.length, 'breadcrumb positions must be unique');
      ok(new Set(items.map(i => i.item)).size === items.length, 'breadcrumb URLs must be unique');
      ok(/\/discover\/trustworthiness-of-the-bible$/.test(items[items.length - 1]?.item || ''), 'last breadcrumb must be this page');
    }
  }

  // ---- structure & 100% legacy anchor preservation ----------------------------------------------
  {
    const ok = group('structure', route);
    const count = re => (body.match(re) || []).length;
    ok((html.match(/<h1\b/g) || []).length === 1 && count(/<h1\b/g) === 1, 'exactly one H1 on the page, inside the article');
    const rows = count(/class="twb-glance__row"/g);
    ok(rows === SECTION_ORDER.length, `glance rows (${rows}) must equal major sections (${SECTION_ORDER.length})`);
    ok(new RegExp(`id="${GLANCE_ID}"`).test(body), 'glance section missing');
    for (const id of [...SECTION_ORDER, SOURCES_ID]) {
      ok(new RegExp(`<section class="hrv-sec twb-sec[^"]*" id="${id}"`).test(body), `section #${id} missing`);
      ok(new RegExp(`data-twb-chip="${id}"`).test(body), `nav chip for #${id} missing`);
    }
    const idSet = new Set([...body.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
    for (const old of Object.keys(OLD_IDS)) {
      ok(idSet.has(old), `legacy alias #${old} missing from built HTML`);
    }
    for (const t of RAW_DATA.themes) {
      ok(idSet.has(t.id), `theme anchor #${t.id} missing from built HTML`);
      for (const ev of t.evidences) {
        ok(idSet.has(ev.id), `locked evidence item #${ev.id} missing from built HTML`);
      }
    }
    for (const addId of O.ADDED_ITEM_IDS) {
      ok(idSet.has(addId), `added scholarly item #${addId} missing from built HTML`);
    }
    ok(count(/<astro-island\b/g) === 0, 'zero React islands in the article');
    ok(/<div class="hrv-toast" role="status" aria-live="polite" data-twb-toast><\/div>/.test(body), 'copy toast must be an empty live region until copy happens');
    ok(!/OnboardingBanner|Tap on any verse/.test(html), 'onboarding banner must be off (showOnboarding={false})');
    ok(!/Exhaustive Apologetic Repository|You Have Reviewed 92|The Council of Nicaea Myth/i.test(textOf(html)), 'legacy triumphalist vocabulary still in HTML');
    ok(count(/class="hrv-scholar twb-pair"/g) >= 5 && count(/class="hrv-eval twb-pair"/g) >= 5, 'all five 4-move historiographical assessment blocks must be visible');
  }
}

// ---- outside the page ---------------------------------------------------------------------------
{
  const ok = group('stateless', 'client.js');
  const client = fs.readFileSync('src/components/discover/trustworthiness-of-the-bible/client.js', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  ok(!/localStorage|sessionStorage|indexedDB|document\.cookie/.test(client), 'client script must be stateless');
  ok(!/history\.(replaceState|pushState)|location\.hash\s*=|replaceState/.test(client), 'client script must not rewrite the URL');
  const page = fs.readFileSync('src/pages/discover/trustworthiness-of-the-bible.astro', 'utf8');
  ok(!/client:(load|visible|idle|only)/.test(page), 'the page must not hydrate React islands');
}
{
  const ok = group('data-lock', DATA_FILE);
  const actualSha = crypto.createHash('sha256').update(fs.readFileSync(DATA_FILE)).digest('hex');
  ok(actualSha === EXPECTED_DATA_SHA256, `SHA-256 mismatch on ${DATA_FILE}: expected ${EXPECTED_DATA_SHA256}, got ${actualSha}`);
}
{
  const ok = group('catalog', 'dist/discover/index.html');
  const discoverFile = distFile(`${BASE}/discover`);
  const discoverHtml = fs.existsSync(discoverFile) ? fs.readFileSync(discoverFile, 'utf8') : '';
  ok(Boolean(discoverHtml), `missing built Discover hub at ${discoverFile}`);
  if (discoverHtml) {
    const expected = DISCOVER_CATALOG_OVERRIDES[CATALOG_SLUG];
    const cardRe = new RegExp(
      `<a[^>]+href=["']${BASE_PATH.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>([\\s\\S]*?)</a>`,
      'i',
    );
    const m = discoverHtml.match(cardRe);
    ok(Boolean(m), `missing card for ${BASE_PATH} in dist/discover/index.html`);
    if (m) {
      const inner = m[1];
      const cardTitle = textOf(inner.match(/<h4[^>]*class=["'][^"']*card-title[^"']*["'][^>]*>([\s\S]*?)<\/h4>/i)?.[1] || '').trim();
      const cardDesc = textOf(inner.match(/<p[^>]*class=["'][^"']*card-desc[^"']*["'][^>]*>([\s\S]*?)<\/p>/i)?.[1] || '').trim();
      ok(cardTitle === expected.title, `catalog card title "${cardTitle}" !== "${expected.title}"`);
      ok(cardDesc === expected.description, `catalog card description "${cardDesc}" !== "${expected.description}"`);
      const s = `${cardTitle} ${cardDesc}`;
      const hit = s.match(BANNED) || s.match(HEADLINE_BANNED) || s.match(/\b(exhaustive|evidentiary|establishing|92)\b/i);
      ok(!hit, `catalog tone/count mismatch: "${hit?.[0]}"`);
    }
  }
}
{
  const ok = group('build-config', 'build_config.js');
  if (!ALLOW_SLICED) ok(BUILD_BOOKS === null && BUILD_SURAHS === null, 'BUILD_BOOKS / BUILD_SURAHS must be null before commit (pass --allow-sliced for local builds)');
}

for (const n of notes) console.log(`  · ${n}`);
console.log(failures ? `\n${failures} of ${checks} checks failed` : `\nAll ${checks} checks passed`);
process.exit(failures ? 1 : 0);
