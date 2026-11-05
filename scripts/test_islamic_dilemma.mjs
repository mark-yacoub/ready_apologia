#!/usr/bin/env node
/**
 * Static output audit for /discover/islamic-dilemma (run after `astro build`).
 *
 *   node scripts/test_islamic_dilemma.mjs [--dist dist] [--allow-sliced] [--pending-catalog]
 *
 * Checks the built HTML, not the source, so it catches what readers actually get. Each concern is a
 * named check group; a failure prints `page: [group] message`.
 *
 *   meta        title / description / canonical match config.SEO, and are on-tone
 *   leaks       no raw markdown, md link schemes, LLM commands or unfilled {placeholders}
 *   links       external → new tab + noopener; Qurʾān → tafsir pages that exist; in-page anchors exist;
 *               every internal href is BASE-aware and exists in dist (sliced-out routes skipped with
 *               --allow-sliced)
 *   tone        our voice (quotations stripped) and headings, against src/utils/islamicDilemma/tone.js
 *   jsonld      Article (+citation, about) and BreadcrumbList with unique positions/URLs; no FAQPage/ClaimReview
 *   structure   one H1, core showcase, 6 sections, 4 passage cards with model counts, #stage-1..7 aliases,
 *               ≤ 4 React islands in the article, all client:visible, no <img> in the server HTML,
 *               no onboarding banner
 *   stateless   client.js uses no storage and never rewrites the URL
 *   catalog     Discover catalog card is on-tone (fails until the data owner updates it; pass
 *               --pending-catalog while that proposal is open)
 *   build-config  BUILD_BOOKS / BUILD_SURAHS must be null (pass --allow-sliced for local builds)
 */
import fs from 'node:fs';
import path from 'node:path';
import { loadIslamicDilemma } from '../src/utils/islamicDilemma/model.js';
import { BASE, BASE_PATH, SEO, SECTIONS, PASSAGES, TOP_ALIAS, CATALOG_SLUG } from '../src/utils/islamicDilemma/config.js';
import { BANNED, HEADLINE_BANNED } from '../src/utils/islamicDilemma/tone.js';
import { loadIslamicCommentaries } from '../src/utils/islamic_commentaries_loader.js';
import { getFormattedManuscriptsByVerseId } from '../src/utils/evidence_repository.js';
import { BUILD_BOOKS, BUILD_SURAHS } from '../src/utils/build_config.js';

const arg = name => { const i = process.argv.indexOf(name); return i > -1 ? (process.argv[i + 1] ?? true) : null; };
const DIST = path.resolve(arg('--dist') || 'dist');
const ALLOW_SLICED = process.argv.includes('--allow-sliced');
const PENDING_CATALOG = process.argv.includes('--pending-catalog');

const model = loadIslamicDilemma({ getManuscripts: getFormattedManuscriptsByVerseId });
const tafsir = loadIslamicCommentaries();

// ---- tiny harness -------------------------------------------------------------------------------
let failures = 0;
let checks = 0;
const notes = [];
function group(name, page) {
  return (cond, msg) => { checks++; if (!cond) { failures++; console.error(`  ✗ ${page}: [${name}] ${msg}`); } };
}

// ---- helpers ------------------------------------------------------------------------------------
const decode = s => s.replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const textOf = html => decode(html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');
const distFile = route => {
  const rel = route.slice(BASE.length).replace(/^\//, '').split('#')[0].replace(/\/$/, '');
  return path.join(DIST, rel, 'index.html');
};
/** Removes quotations (our voice only remains): blockquotes, <q>, sand quotes, witness quotes. */
const stripQuotes = html => html
  .replace(/<blockquote\b[\s\S]*?<\/blockquote>/g, ' ')
  .replace(/<q\b[\s\S]*?<\/q>/g, ' ')
  .replace(/<p class="hrv-quote__en"[\s\S]*?<\/p>/g, ' ')
  .replace(/<p class="hrv-wit__en"[\s\S]*?<\/p>/g, ' ')
  .replace(/<astro-island\b[\s\S]*?<\/astro-island>/g, ' ')
  // Words quoted inside our sentences (“…”, the content.js convention that the unit test's
  // `unquote` also exempts). A pair never spans a block boundary, so a stray “ cannot hide prose.
  .replace(/“(?:[^”<]|<(?!\/?(?:p|li|div|h[1-6]|blockquote|section|article|aside|details|summary|ul|ol|figure)\b))*”/g, ' ');
/** Is a route outside the sliced build (so it legitimately is not in dist)? */
const slicedOut = href => {
  const r = href.slice(BASE.length);
  let m;
  if ((m = r.match(/^\/quran\/(\d+)/))) return !!BUILD_SURAHS && !BUILD_SURAHS.has(m[1]);
  if ((m = r.match(/^\/bible\/([a-z0-9]+)/))) return !!BUILD_BOOKS && !BUILD_BOOKS.has(m[1]);
  return false;
};

const route = BASE_PATH;
const file = distFile(route);
const html = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
console.log(`Auditing ${route} in ${DIST}${ALLOW_SLICED ? ' (sliced build allowed)' : ''}`);
group('exists', route)(html, 'page missing from dist');

if (html) {
  const start = html.indexOf('<article class="hrv idl"');
  const end = html.indexOf('</article>', html.lastIndexOf('idl-closing'));
  const body = start > -1 ? html.slice(start, end > -1 ? end + 10 : undefined) : '';
  group('structure', route)(start > -1, 'article.hrv.idl not found');
  const text = textOf(body);

  // ---- meta -------------------------------------------------------------------------------------
  {
    const ok = group('meta', route);
    const d = decode(html);
    ok(d.includes(`<title>${SEO.title} | Ready Apologia</title>`), `title should be "${SEO.title} | Ready Apologia"`);
    ok(d.includes(`<meta name="description" content="${SEO.description}"`), 'meta description does not match config.SEO');
    ok(/<link rel="canonical" href="[^"]*\/discover\/islamic-dilemma"/.test(html), 'canonical URL missing or wrong');
    ok(/property="og:type" content="article"/.test(html), 'og:type should be article');
    const metaHit = `${SEO.title} ${SEO.description}`.match(BANNED) || `${SEO.title} ${SEO.description}`.match(HEADLINE_BANNED);
    ok(!metaHit, `title/description tone: "${metaHit?.[0]}"`);
  }

  // ---- leaks ------------------------------------------------------------------------------------
  {
    const ok = group('leaks', route);
    for (const [re, what] of [
      [/command to llm/i, 'LLM command'],
      [/\*\*|\]\(|^#{2,}\s/m, 'raw markdown'],
      [/tafseer\/|ibnkathir:\/\/|tabari:\/\//, 'md link scheme'],
      [/\{(n|m|ref)\}/, 'unfilled {placeholder}'],
      [/\bundefined\b|\bNaN\b|\[object Object\]/, 'template value leak'],
      [/[\u0000\u0001]/, 'renderer placeholder'],
      [/TODO/, 'TODO marker'],
    ]) ok(!re.test(text), `${what} in rendered text`);
  }

  // ---- links ------------------------------------------------------------------------------------
  {
    const ok = group('links', route);
    const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
    const anchors = [...body.matchAll(/<a\b([^>]*)>/g)].map(m => m[1]);
    let sliced = 0;
    for (const attrs of anchors) {
      const href = decode(attrs.match(/\bhref="([^"]*)"/)?.[1] || '');
      ok(href, `anchor without href: <a${attrs.slice(0, 80)}>`);
      if (!href) continue;
      if (/^https?:\/\//.test(href)) {
        ok(/target="_blank"/.test(attrs) && /rel="noopener noreferrer(?: nofollow)?"/.test(attrs), `external link without target/rel: ${href}`);
        ok(!/quran\.com\/\d/.test(href), `Qurʾān link should be internal: ${href}`);
        continue;
      }
      if (href.startsWith('#')) { ok(ids.has(href.slice(1)), `in-page anchor has no target: ${href}`); continue; }
      ok(href.startsWith(`${BASE}/`), `relative or non-BASE link: ${href}`);
      ok(!/target="_blank"/.test(attrs), `internal link opens a new tab: ${href}`);
      const t = href.slice(BASE.length).match(/^\/quran\/(\d+)\/(\d+)\/tafsir\/(tabari|ibn_kathir)$/);
      if (/^\/quran\/\d+\/\d+\//.test(href.slice(BASE.length))) ok(t, `Qurʾān verse links must open a tafsir page: ${href}`);
      if (t) ok(tafsir[`${t[1]}:${t[2]}`]?.some(c => c.id === t[3]), `no ${t[3]} tafsir page for ${t[1]}:${t[2]}`);
      if (slicedOut(href)) { sliced++; continue; }
      ok(fs.existsSync(distFile(href)), `internal link to a page missing from dist: ${href}`);
    }
    if (sliced) notes.push(`links: ${sliced} internal links point at routes outside the sliced build (pattern-checked only)`);
  }

  // ---- tone -------------------------------------------------------------------------------------
  {
    const ok = group('tone', route);
    const voice = textOf(stripQuotes(body));
    const hits = [...new Set((voice.match(new RegExp(BANNED.source, 'gi')) || []).map(s => s.toLowerCase()))];
    for (const h of hits) {
      const i = voice.toLowerCase().indexOf(h);
      ok(false, `"${h}" in our voice: …${voice.slice(Math.max(0, i - 60), i + 40).trim()}…`);
    }
    const heads = [
      ...body.matchAll(/<(h[1-4])\b[^>]*>([\s\S]*?)<\/\1>/g),
      ...body.matchAll(/<(\w+)\b[^>]*role="heading"[^>]*>([\s\S]*?)<\/\1>/g),
    ].map(m => textOf(stripQuotes(m[2])));
    for (const h of heads) {
      const hit = h.match(HEADLINE_BANNED) || h.match(BANNED);
      ok(!hit, `heading uses "${hit?.[0]}": ${h.trim()}`);
    }
  }

  // ---- jsonld -----------------------------------------------------------------------------------
  {
    const ok = group('jsonld', route);
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => m[1]);
    ok(blocks.length > 0, 'no JSON-LD');
    const all = [];
    for (const raw of blocks) { try { const j = JSON.parse(raw); all.push(...(j['@graph'] || [j])); } catch { ok(false, 'JSON-LD does not parse'); } }
    const article = all.find(n => n['@type'] === 'Article');
    const crumbs = all.find(n => n['@type'] === 'BreadcrumbList');
    ok(article && crumbs, 'must contain Article and BreadcrumbList');
    ok(!all.some(n => /FAQPage|ClaimReview/.test(n['@type'])), 'must not contain FAQPage or ClaimReview');
    if (article) {
      ok(article.headline === SEO.title, 'Article.headline should equal the SEO title');
      ok(Array.isArray(article.citation) && article.citation.length > 0, 'Article.citation missing');
      ok(Array.isArray(article.about) && article.about.length > 0, 'Article.about missing');
      ok((article.citation || []).every(c => /^https?:\/\//.test(c.url)), 'Article.citation URLs must be absolute');
    }
    if (crumbs) {
      const items = crumbs.itemListElement || [];
      ok(new Set(items.map(i => i.position)).size === items.length, 'breadcrumb positions must be unique');
      ok(new Set(items.map(i => i.item)).size === items.length, 'breadcrumb URLs must be unique (no duplicate /discover)');
      ok(/\/discover\/islamic-dilemma$/.test(items[items.length - 1]?.item || ''), 'last breadcrumb must be this page');
    }
  }

  // ---- structure --------------------------------------------------------------------------------
  {
    const ok = group('structure', route);
    const count = re => (body.match(re) || []).length;
    ok(count(/<h1\b/g) === 1 && count(/<h1\b/g) === (html.match(/<h1\b/g) || []).length, 'exactly one H1 on the page');
    ok(/class="hrv-sc hrv-sc--confrontation idl-core"/.test(body), 'core showcase missing');
    ok(count(/class="hrv-gcard idl-gcard"/g) === 4, 'at a glance must have 4 cards');
    for (const s of SECTIONS) {
      ok(new RegExp(`<section class="hrv-sec idl-sec" id="${s.id}"`).test(body), `section #${s.id} missing`);
      ok(new RegExp(`id="${s.alias}"`).test(body), `alias #${s.alias} missing`);
      ok(new RegExp(`data-idl-chip="${s.id}"`).test(body), `nav chip for #${s.id} missing`);
    }
    ok(new RegExp(`id="${TOP_ALIAS}"`).test(body), `alias #${TOP_ALIAS} missing`);
    ok(count(/<article class="idl-passage"/g) === PASSAGES.length, `expected ${PASSAGES.length} passage cards`);
    for (const p of model.gospel.passages) {
      ok(text.includes(p.countLabel), `${p.id}: count chip "${p.countLabel}" not rendered`);
      ok(p.pre610 > 0 && p.pre610 <= p.total, `${p.id}: implausible count ${p.pre610}/${p.total}`);
    }
    ok(count(/<details class="hrv-disclosure idl-answer"/g) === model.answers.items.length, 'answer count mismatch');
    const islands = [...body.matchAll(/<astro-island\b([^>]*)>/g)].map(m => m[1]);
    ok(islands.length <= 4, `at most 4 React islands in the article, found ${islands.length}`);
    ok(islands.every(a => /client="visible"/.test(a)), 'every island in the article must be client:visible');
    ok(!/<img\b/.test(body), 'no <img> in the server HTML (closed scan disclosures must fetch nothing)');
    ok(!/OnboardingBanner/.test(html), 'onboarding banner must be off (showOnboarding={false})');
    ok(!/STEP 0\d|ISLAM IS FALSE|Self-Destructs/i.test(html), 'old page vocabulary is still in the HTML');
  }
}

// ---- outside the page ---------------------------------------------------------------------------
{
  const ok = group('stateless', 'client.js');
  const client = fs.readFileSync('src/components/discover/islamic-dilemma/client.js', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  ok(!/localStorage|sessionStorage|indexedDB|document\.cookie/.test(client), 'client script must be stateless');
  ok(!/history\.(replaceState|pushState)|location\.hash\s*=/.test(client), 'client script must not rewrite the URL');
}
{
  const entry = JSON.parse(fs.readFileSync('src/data/discoverCatalog.json', 'utf8')).find(e => e.slug === CATALOG_SLUG);
  const ok = group('catalog', 'discoverCatalog.json');
  ok(entry, 'missing catalog entry');
  if (entry) {
    const s = `${entry.title} ${entry.description}`;
    const hit = s.match(BANNED) || s.match(/\b(contradictions?|conflicting|problematic|absurd)\b/i);
    if (hit && PENDING_CATALOG) notes.push(`catalog: card still uses "${hit[0]}" (pending data proposal; --pending-catalog)`);
    else ok(!hit, `tone: "${hit?.[0]}" (src/data is read-only: see data_proposals.md, or pass --pending-catalog)`);
  }
}
{
  const ok = group('build-config', 'build_config.js');
  if (!ALLOW_SLICED) ok(BUILD_BOOKS === null && BUILD_SURAHS === null, 'BUILD_BOOKS / BUILD_SURAHS must be null before commit (pass --allow-sliced for local builds)');
}

for (const n of notes) console.log(`  · ${n}`);
console.log(failures ? `\n${failures} of ${checks} checks failed` : `\nAll ${checks} checks passed`);
process.exit(failures ? 1 : 0);
