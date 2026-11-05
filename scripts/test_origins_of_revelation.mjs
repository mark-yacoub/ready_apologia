#!/usr/bin/env node
/**
 * Static output audit for /discover/origins-of-revelation (run after `astro build`).
 *
 *   node scripts/test_origins_of_revelation.mjs [--dist dist] [--allow-sliced] [--pending-catalog]
 *
 * Checks the built HTML, not the source, so it catches what readers actually get. Each concern is a
 * named check group; a failure prints `page: [group] message`.
 *
 *   meta        one <title> (= SEO title + suffix), description, canonical, og:type/og:image, keywords
 *   leaks       no raw markdown, unfilled {placeholders}, template values, renderer placeholders
 *   links       external → new tab + noopener; Qurʾān verse links → tafsir pages that exist; in-page
 *               anchors exist; every internal href is BASE-aware and exists in dist (/bible and /quran
 *               routes outside the sliced build are pattern-checked only with --allow-sliced)
 *   tone        our voice (quotations stripped) and headings, against src/utils/originsOfRevelation/tone.js,
 *               incl. this page's old verdict words ("demonic parallel", "Diagnostic Outcome", "failing",
 *               "Mediumship", "Satanic Verses", "Violence")
 *   colours     no alarm red / pink in the page CSS (#974543, #881337, #faf5f5, #fecdd3)
 *   jsonld      Article (+citation) and BreadcrumbList with unique positions/URLs; no FAQPage/ClaimReview
 *   structure   one H1, glance rows = item sections = H1 count, section ids, old-id alias anchors, nav
 *               chips, zero React islands in the article, no onboarding banner, old page vocabulary gone
 *   stateless   client.js uses no storage and never rewrites the URL
 *   catalog     Discover catalog card is on-tone (src/data is read-only: --pending-catalog while the
 *               data proposal is open)
 *   build-config  BUILD_BOOKS / BUILD_SURAHS must be null (pass --allow-sliced for local builds)
 */
import fs from 'node:fs';
import path from 'node:path';
import * as CONTENT from '../src/utils/originsOfRevelation/content.js';
import { loadOriginsOfRevelation } from '../src/utils/originsOfRevelation/model.js';
import { BASE, BASE_PATH, SECTION_ORDER, OLD_IDS, CATALOG_SLUG, GLANCE_ID, SOURCES_ID, INTERNAL_HADITH } from '../src/utils/originsOfRevelation/config.js';
import { BANNED, HEADLINE_BANNED, VERDICT_BANNED } from '../src/utils/originsOfRevelation/tone.js';
import { loadIslamicCommentaries } from '../src/utils/islamic_commentaries_loader.js';
import { BUILD_BOOKS, BUILD_SURAHS } from '../src/utils/build_config.js';

const arg = name => { const i = process.argv.indexOf(name); return i > -1 ? (process.argv[i + 1] ?? true) : null; };
const DIST = path.resolve(arg('--dist') || 'dist');
const ALLOW_SLICED = process.argv.includes('--allow-sliced');
const PENDING_CATALOG = process.argv.includes('--pending-catalog');

const model = loadOriginsOfRevelation(CONTENT);
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
/** Removes quotations (our voice remains): blockquotes, quote paragraphs, showcase excerpts, “…”. */
const stripQuotes = html => html
  .replace(/<blockquote\b[\s\S]*?<\/blockquote>/g, ' ')
  .replace(/<q\b[\s\S]*?<\/q>/g, ' ')
  .replace(/<p class="hrv-quote__en"[\s\S]*?<\/p>/g, ' ')
  .replace(/<p class="hrv-wit__en"[\s\S]*?<\/p>/g, ' ')
  // Showcase excerpts are verbatim quotations (model.test checks them against their source).
  .replace(/<ul class="hrv-vs__list">[\s\S]*?<\/ul>/g, ' ')
  // Words quoted inside our sentences (“…”). A pair never spans a block boundary.
  .replace(/“(?:[^”<]|<(?!\/?(?:p|li|div|h[1-6]|blockquote|section|article|aside|details|summary|ul|ol|figure)\b))*”/g, ' ');
/** Is a route outside the sliced build (so it legitimately is not in dist)? */
const slicedOut = href => {
  const r = href.slice(BASE.length);
  let m;
  if ((m = r.match(/^\/quran\/(\d+)/))) return !!BUILD_SURAHS && !BUILD_SURAHS.has(m[1]);
  if ((m = r.match(/^\/bible\/([a-z0-9]+)/))) return !!BUILD_BOOKS && !BUILD_BOOKS.has(m[1]);
  return false;
};
const BANNED_COLOURS = /#(974543|881337|faf5f5|fecdd3)\b/i;

const route = BASE_PATH;
const file = distFile(route);
const html = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
console.log(`Auditing ${route} in ${DIST}${ALLOW_SLICED ? ' (sliced build allowed)' : ''}`);
group('exists', route)(html, 'page missing from dist');

if (html) {
  const start = html.indexOf('<article class="hrv orv"');
  const end = html.lastIndexOf('</article>');
  const body = start > -1 ? html.slice(start, end > start ? end + 10 : undefined) : '';
  group('structure', route)(start > -1, 'article.hrv.orv not found');
  const text = textOf(body);

  // ---- meta -------------------------------------------------------------------------------------
  {
    const ok = group('meta', route);
    const d = decode(html);
    ok((html.match(/<title>/g) || []).length === 1, 'exactly one <title>');
    ok(d.includes(`<title>${model.seo.title} | Ready Apologia</title>`), `title should be "${model.seo.title} | Ready Apologia"`);
    ok(d.includes(`<meta name="description" content="${model.seo.description}"`), 'meta description does not match content.js SEO');
    ok(/<link rel="canonical" href="https?:\/\/[^"]*\/discover\/origins-of-revelation"/.test(html), 'canonical URL missing or wrong');
    ok(/property="og:type" content="article"/.test(html), 'og:type should be article');
    ok(/property="og:image" content="https?:\/\/[^"]*\/media\/demonic_revelation\/cover\.jpg"/.test(html), 'og:image should be the cover');
    ok(/property="og:title"/.test(html) && /property="og:description"/.test(html), 'og:title / og:description missing');
    const metaVoice = `${model.seo.title} ${model.seo.description}`;
    const metaHit = metaVoice.match(BANNED) || metaVoice.match(HEADLINE_BANNED) || metaVoice.match(VERDICT_BANNED);
    ok(!metaHit, `title/description tone: "${metaHit?.[0]}"`);
  }

  // ---- leaks ------------------------------------------------------------------------------------
  {
    const ok = group('leaks', route);
    for (const [re, what] of [
      [/\*\*|\]\(|^#{2,}\s/m, 'raw markdown'],
      [/\{(n|m|refs?)\}/, 'unfilled {placeholder}'],
      [/\bundefined\b|\bNaN\b|\[object Object\]/, 'template value leak'],
      [/[\u0000\u0001]/, 'renderer placeholder'],
      [/\\'/, 'escaped apostrophe (\\\')'],
      [/TODO|lorem ipsum/i, 'TODO / fixture text'],
      [/\b(?:MK|LK|DN|1SM|2THES|NM|REV|1KGS) \d/, 'raw Bible book code'],
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
      ok(!/^\/\//.test(href), `protocol-relative link: ${href}`);
      if (/^https?:\/\//.test(href)) {
        ok(/^https:/.test(href), `external link must be https: ${href}`);
        ok(/target="_blank"/.test(attrs) && /rel="noopener noreferrer(?: nofollow)?"/.test(attrs), `external link without target/rel noopener: ${href}`);
        ok(!/quran\.com\/\d/.test(href), `Qurʾān link should be internal: ${href}`);
        continue;
      }
      if (href.startsWith('#')) { ok(ids.has(href.slice(1)), `in-page anchor has no target: ${href}`); continue; }
      ok(href.startsWith(`${BASE}/`), `relative or non-BASE link: ${href}`);
      ok(!/target="_blank"/.test(attrs), `internal link opens a new tab: ${href}`);
      ok(!/\/bible\/rev\//.test(href), `Bible link uses "rev" (the book id is "rv"): ${href}`);
      const r = href.slice(BASE.length);
      const t = r.match(/^\/quran\/(\d+)\/(\d+)\/tafsir\/(tabari|ibn_kathir)$/);
      if (/^\/quran\/\d+\/\d+/.test(r)) ok(t, `Qurʾān verse links must open a tafsir page: ${href}`);
      if (t) ok(tafsir[`${t[1]}:${t[2]}`]?.some(c => c.id === t[3]), `no ${t[3]} tafsir page for ${t[1]}:${t[2]}`);
      if (/^\/bible\//.test(r)) ok(/^\/bible\/[a-z0-9]+\/\d+(?:#\d+)?$/.test(r), `Bible link is not /bible/<book>/<ch>#<v>: ${href}`);
      if (slicedOut(href)) {
        if (ALLOW_SLICED) { sliced++; continue; }
      }
      ok(fs.existsSync(distFile(href)), `internal link to a page missing from dist: ${href}`);
    }
    for (const k of INTERNAL_HADITH) {
      const [c, n] = k.split(':');
      ok(fs.existsSync(distFile(`${BASE}/hadith/${c}/${n}`)), `config.INTERNAL_HADITH ${k} has no page in dist`);
    }
    if (sliced) notes.push(`links: ${sliced} internal links point at /bible or /quran routes outside the sliced build (pattern-checked only)`);
  }

  // ---- tone -------------------------------------------------------------------------------------
  {
    const ok = group('tone', route);
    const voice = textOf(stripQuotes(body));
    for (const re of [BANNED, VERDICT_BANNED]) {
      const hits = [...new Set((voice.match(new RegExp(re.source, 'gi')) || []).map(s => s.toLowerCase()))];
      for (const h of hits) {
        const i = voice.toLowerCase().indexOf(h);
        ok(false, `"${h}" in our voice: …${voice.slice(Math.max(0, i - 60), i + 40).trim()}…`);
      }
    }
    const heads = [
      ...body.matchAll(/<(h[1-4])\b[^>]*>([\s\S]*?)<\/\1>/g),
      ...body.matchAll(/<(summary)\b[^>]*>([\s\S]*?)<\/\1>/g),
      ...body.matchAll(/<a class="orv-nav__chip"[^>]*>([\s\S]*?)<\/a>/g).map(m => [m[0], 'a', m[1]]),
    ].map(m => textOf(stripQuotes(m[2])));
    for (const h of heads) {
      const hit = h.match(HEADLINE_BANNED) || h.match(BANNED) || h.match(VERDICT_BANNED);
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
    // Only rules that can reach the article: our layer and the hrv system.
    const ours = css.split('}').filter(r => /\.orv\b|\.hrv\b/.test(r)).join('}');
    const hit = ours.match(BANNED_COLOURS);
    ok(!hit, `banned colour ${hit?.[0]} in the page's .hrv/.orv CSS`);
    const src = fs.readFileSync('src/styles/origins-of-revelation.css', 'utf8');
    ok(!BANNED_COLOURS.test(src), 'banned colour in src/styles/origins-of-revelation.css');
    ok(!/style="[^"]*#(974543|881337|faf5f5|fecdd3)/i.test(body), 'banned colour in an inline style');
  }

  // ---- jsonld -----------------------------------------------------------------------------------
  {
    const ok = group('jsonld', route);
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => m[1]);
    ok(blocks.length > 0, 'no JSON-LD');
    const all = [];
    for (const raw of blocks) { try { const j = JSON.parse(raw); const list = Array.isArray(j) ? j : [j]; for (const x of list) all.push(...(x['@graph'] || [x])); } catch { ok(false, 'JSON-LD does not parse'); } }
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
      ok((article.citation || []).every(c => /^https?:\/\//.test(c.url)), 'Article.citation URLs must be absolute');
    }
    if (crumbs) {
      const items = crumbs.itemListElement || [];
      ok(new Set(items.map(i => i.position)).size === items.length, 'breadcrumb positions must be unique');
      ok(new Set(items.map(i => i.item)).size === items.length, 'breadcrumb URLs must be unique (no duplicate /discover)');
      ok(/\/discover\/origins-of-revelation$/.test(items[items.length - 1]?.item || ''), 'last breadcrumb must be this page');
    }
  }

  // ---- structure --------------------------------------------------------------------------------
  {
    const ok = group('structure', route);
    const count = re => (body.match(re) || []).length;
    ok((html.match(/<h1\b/g) || []).length === 1 && count(/<h1\b/g) === 1, 'exactly one H1 on the page, inside the article');
    const rows = count(/class="orv-glance__row"/g);
    ok(rows === model.itemCount, `glance rows (${rows}) must equal item sections (${model.itemCount})`);
    const h1n = textOf(body.match(/<h1\b[\s\S]*?<\/h1>/)?.[0] || '').match(/\b(\d+)\b/);
    if (h1n) ok(Number(h1n[1]) === model.itemCount, `H1 count ${h1n[1]} ≠ item sections ${model.itemCount}`);
    ok(new RegExp(`id="${GLANCE_ID}"`).test(body), 'glance section missing');
    for (const id of [...SECTION_ORDER, SOURCES_ID]) {
      ok(new RegExp(`<section class="hrv-sec orv-sec[^"]*" id="${id}"`).test(body), `section #${id} missing`);
      ok(new RegExp(`data-orv-chip="${id}"`).test(body), `nav chip for #${id} missing`);
    }
    for (const [old, sec] of Object.entries(OLD_IDS)) {
      const i = body.indexOf(`id="${old}"`);
      ok(i > -1, `alias #${old} missing`);
      const secAt = body.lastIndexOf(`id="${sec}"`, i);
      ok(i > -1 && secAt > -1 && body.lastIndexOf('<section ', i) === body.lastIndexOf('<section ', secAt), `alias #${old} is not at the top of #${sec}`);
    }
    ok(count(/<astro-island\b/g) === 0, 'zero React islands in the article');
    ok(/<div class="hrv-toast" role="status" aria-live="polite" data-orv-toast><\/div>/.test(body), 'the copy toast must be an empty live region until a copy happens');
    ok(!/Swipe to see all/.test(body), 'witness verdicts must all be visible (no swipe carousel)');
    const testing = body.slice(body.indexOf('id="testing-spirits"'), body.indexOf(`id="${SOURCES_ID}"`));
    ok(!/<span class="hrv-q__num" aria-hidden="true">06<\/span>/.test(testing), 'the method section must not be numbered as a sixth account');
    ok(!/OnboardingBanner|Tap on any verse/.test(html), 'onboarding banner must be off (showOnboarding={false})');
    ok(!/DEMONIC PARALLEL|PROPHETIC STANDARD|Diagnostic Outcome|THE BIBLICAL MANDATE|Assessing the Origins/i.test(textOf(html)), 'old page vocabulary is still in the HTML');
    ok(count(/class="hrv-sc hrv-sc--confrontation orv-sc"/g) >= model.itemCount, 'every item section has a two-sided showcase');
    ok(/class="hrv-scholar orv-pair"/.test(body) && /class="hrv-eval orv-pair"/.test(body), 'classical explanation / comparing boxes missing');
    ok(/rel="noopener noreferrer"/.test(body), 'expected Sunnah.com links with rel noopener');
  }
}

// ---- outside the page ---------------------------------------------------------------------------
{
  const ok = group('stateless', 'client.js');
  const client = fs.readFileSync('src/components/discover/origins-of-revelation/client.js', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  ok(!/localStorage|sessionStorage|indexedDB|document\.cookie/.test(client), 'client script must be stateless');
  ok(!/history\.(replaceState|pushState)|location\.hash\s*=|replaceState/.test(client), 'client script must not rewrite the URL');
  const page = fs.readFileSync('src/pages/discover/origins-of-revelation.astro', 'utf8');
  ok(!/client:(load|visible|idle|only)/.test(page), 'the page must not hydrate React islands');
  ok(!/content\.fixture/.test(page), 'the page must import the real content.js');
}
{
  const entry = JSON.parse(fs.readFileSync('src/data/discoverCatalog.json', 'utf8')).find(e => e.slug === CATALOG_SLUG);
  const ok = group('catalog', 'discoverCatalog.json');
  ok(entry, 'missing catalog entry');
  if (entry) {
    const s = `${entry.title} ${entry.description}`;
    const hit = s.match(BANNED) || s.match(HEADLINE_BANNED) || s.match(VERDICT_BANNED) || s.match(/\b(assessing|demonic|evidentiary)\b/i);
    if (hit && PENDING_CATALOG) notes.push(`catalog: card still uses "${hit[0]}" (pending data proposal; --pending-catalog)`);
    else ok(!hit, `tone: "${hit?.[0]}" (src/data is read-only: propose it with scripts/origins_of_revelation_data.mjs --proposals, or pass --pending-catalog)`);
  }
}
{
  const ok = group('build-config', 'build_config.js');
  if (!ALLOW_SLICED) ok(BUILD_BOOKS === null && BUILD_SURAHS === null, 'BUILD_BOOKS / BUILD_SURAHS must be null before commit (pass --allow-sliced for local builds)');
}

for (const n of notes) console.log(`  · ${n}`);
console.log(failures ? `\n${failures} of ${checks} checks failed` : `\nAll ${checks} checks passed`);
process.exit(failures ? 1 : 0);
