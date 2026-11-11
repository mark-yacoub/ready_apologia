#!/usr/bin/env node
/**
 * Static built-HTML audit for /discover/extrabiblical-evidence-for-jesus (run after `astro build`).
 *
 *   node scripts/test_extrabiblical_evidence.mjs [--dist dist] [--allow-sliced] [--offline]
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import DATA from '../src/data/extrabiblical-evidence-for-jesus.json' with { type: 'json' };
import { DISCOVER_CATALOG_OVERRIDES } from '../src/utils/discoverCatalogOverrides.ts';
import * as CONTENT from '../src/utils/extrabiblicalEvidence/content.js';
import { loadExtrabiblicalEvidence } from '../src/utils/extrabiblicalEvidence/model.js';
import {
  BASE,
  BASE_PATH,
  DATA_FILE,
  EXPECTED_DATA_SHA256,
  SECTION_ORDER,
  LEGACY_THEME_ALIASES,
  CATALOG_SLUG,
  GLANCE_ID,
  SOURCES_ID,
  HOSTS,
} from '../src/utils/extrabiblicalEvidence/config.js';
import {
  BANNED,
  HEADLINE_BANNED,
  REGISTER_BANNED,
  LEGACY_UI_BANNED,
} from '../src/utils/extrabiblicalEvidence/tone.js';
import { loadIslamicCommentaries } from '../src/utils/islamic_commentaries_loader.js';
import { BUILD_BOOKS, BUILD_SURAHS } from '../src/utils/build_config.js';

const arg = name => {
  const i = process.argv.indexOf(name);
  return i > -1 ? (process.argv[i + 1] ?? true) : null;
};
const DIST = path.resolve(arg('--dist') || 'dist');
const ALLOW_SLICED = process.argv.includes('--allow-sliced');
const OFFLINE = process.argv.includes('--offline');

const DOI_EXPECTED_KEYWORDS = {
  '10.1016/j.jasrep.2020.102228': 'nazareth',
  '10.1179/peq.1888.20.3.115': 'bethesda',
  '10.1515/9781575066592-015': 'siloam',
  '10.1179/peq.1994.126.1.32': 'caiaphas',
  '10.1515/9783110222203.87': 'mivtar',
};

const PERSEUS_EXPECTED_TITLE = {
  '1999.02.0078': 'tacitus',
  '1999.02.0139': 'pliny',
  '1999.02.0132': 'suetonius',
  '1999.01.0145': 'josephus',
  '1999.01.0146': 'josephus',
  '2008.01.0461': 'peregrini',
  '2008.01.0641': 'marcus aurelius',
};

const model = loadExtrabiblicalEvidence(CONTENT);
const tafsir = loadIslamicCommentaries();

let failures = 0;
let checks = 0;
const notes = [];
function group(name, page) {
  return (cond, msg) => {
    checks++;
    if (!cond) {
      failures++;
      console.error(`  ✗ ${page}: [${name}] ${msg}`);
    }
  };
}

const decode = s =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

const textOf = html =>
  decode(
    html
      .replace(/<script[\s\S]*?<\/script>/g, '')
      .replace(/<style[\s\S]*?<\/style>/g, '')
      .replace(/<[^>]+>/g, ' '),
  ).replace(/\s+/g, ' ');

const distFile = route => {
  const rel = route.slice(BASE.length).replace(/^\//, '').split('#')[0].replace(/\/$/, '');
  return path.join(DIST, rel, 'index.html');
};

/**
 * Strips verbatim primary quotations so editorial voice can be checked cleanly:
 * blockquotes, `.hrv-quote__en`, `.hrv-wit__en`, `.hrv-vs__list`, `.hrv-redline__text`,
 * and curly-quoted phrases (“…”, ‘…’). Note that `.ebj-finding__body` is editorial prose
 * and remains in scope for tone checking.
 */
const stripQuotes = html =>
  html
    .replace(/<blockquote\b[\s\S]*?<\/blockquote>/g, ' ')
    .replace(/<q\b[\s\S]*?<\/q>/g, ' ')
    .replace(/<p class="hrv-quote__en"[\s\S]*?<\/p>/g, ' ')
    .replace(/<p class="hrv-wit__en"[\s\S]*?<\/p>/g, ' ')
    .replace(/<ul class="hrv-vs__list">[\s\S]*?<\/ul>/g, ' ')
    .replace(/<div class="hrv-redline__text">[\s\S]*?<\/div>/g, ' ')
    .replace(
      /“(?:[^”<]|<(?!\/?(?:p|li|div|h[1-6]|blockquote|section|article|aside|details|summary|ul|ol|figure)\b))*”/g,
      ' ',
    )
    .replace(
      /‘(?:[^’<]|<(?!\/?(?:p|li|div|h[1-6]|blockquote|section|article|aside|details|summary|ul|ol|figure)\b))*’/g,
      ' ',
    );

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
  const start = html.indexOf('<article class="hrv ebj"');
  const end = html.lastIndexOf('</article>');
  const body = start > -1 ? html.slice(start, end > start ? end + 10 : undefined) : '';
  group('structure', route)(start > -1, 'article.hrv.ebj not found');
  const text = textOf(body);

  // ---- meta -------------------------------------------------------------------------------------
  {
    const ok = group('meta', route);
    const d = decode(html);
    ok((html.match(/<title>/g) || []).length === 1, 'exactly one <title>');
    ok(
      d.includes(`<title>${model.seo.title} | Ready Apologia</title>`),
      `title should be "${model.seo.title} | Ready Apologia"`,
    );
    ok(
      d.includes(`<meta name="description" content="${model.seo.description}"`),
      'meta description does not match content.js SEO',
    );
    ok(
      /<link rel="canonical" href="https?:\/\/[^"]*\/discover\/extrabiblical-evidence-for-jesus"/.test(html),
      'canonical URL missing or wrong',
    );
    ok(/property="og:type" content="article"/.test(html), 'og:type should be article');
    ok(
      /property="og:image" content="https?:\/\/[^"]*\/media\/extrabiblical_evidence\/cover\.jpg"/.test(html),
      'og:image should be /media/extrabiblical_evidence/cover.jpg',
    );
    ok(
      /property="og:title"/.test(html) && /property="og:description"/.test(html),
      'og:title / og:description missing',
    );
    const metaVoice = `${model.seo.title} ${model.seo.description}`;
    const metaHit =
      metaVoice.match(BANNED) ||
      metaVoice.match(HEADLINE_BANNED) ||
      metaVoice.match(REGISTER_BANNED) ||
      metaVoice.match(LEGACY_UI_BANNED);
    ok(!metaHit, `title/description tone violation: "${metaHit?.[0]}"`);
  }

  // ---- leaks ------------------------------------------------------------------------------------
  {
    const ok = group('leaks', route);
    for (const [re, what] of [
      [/\*\*|\]\(|^#{2,}\s/m, 'raw markdown'],
      [/\{(n|m|refs?)\}/, 'unfilled {placeholder}'],
      [/\bundefined\b|\bNaN\b|\[object Object\]/, 'template value leak'],
      [/[\u0000\u0001\u0004\u0005]/, 'renderer placeholder'],
      [/\\'/, "escaped apostrophe (\\')"],
      [/TODO|lorem ipsum/i, 'TODO / fixture text'],
      [/\[PRAE\]CTVS/i, 'unrepaired Pilate inscription typo [PRAE]CTVS'],
      [/#evidence-[a-z0-9-]+/i, 'raw #evidence-... slug in visible text'],
      [/legacy anchor/i, 'internal developer-note "legacy anchor" leak in visible text'],
    ]) {
      ok(!re.test(text), `${what} in rendered text`);
    }
  }

  // ---- links ------------------------------------------------------------------------------------
  {
    const ok = group('links', route);
    const allIds = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
    const idSet = new Set(allIds);
    const anchors = [...body.matchAll(/<a\b([^>]*)>/g)].map(m => m[1]);
    let sliced = 0;
    for (const attrs of anchors) {
      const href = decode(attrs.match(/\bhref="([^"]*)"/)?.[1] || '');
      ok(href, `anchor without href: <a${attrs.slice(0, 80)}>`);
      if (!href) continue;
      ok(!/^\/\//.test(href), `protocol-relative link: ${href}`);
      if (/^https?:\/\//.test(href)) {
        ok(/^https:/.test(href), `external link must be https: ${href}`);
        ok(
          /target="_blank"/.test(attrs) && /rel="noopener noreferrer(?: nofollow)?"/.test(attrs),
          `external link missing target="_blank" rel="noopener noreferrer": ${href}`,
        );
        ok(!/quran\.com/i.test(href), `Qurʾān link must be internal: ${href}`);
        ok(!/wikipedia\.org|biblegateway\.com|come-and-hear\.com/i.test(href), `disallowed host in ${href}`);
        const host = new URL(href).hostname;
        ok(Boolean(HOSTS[host]), `external host not in config.HOSTS: ${host} (${href})`);
        continue;
      }
      if (href.startsWith('#')) {
        ok(idSet.has(href.slice(1)), `in-page anchor has no target: ${href}`);
        continue;
      }
      ok(href.startsWith(`${BASE}/`), `relative or non-BASE link: ${href}`);
      ok(!/target="_blank"/.test(attrs), `internal link opens a new tab: ${href}`);
      ok(!/\/bible\/rev\//.test(href), `Bible link uses "rev" (the book id is "rv"): ${href}`);
      const r = href.slice(BASE.length);
      const t = r.match(/^\/quran\/(\d+)\/(\d+)\/tafsir\/(tabari|ibn_kathir)$/);
      if (/^\/quran\/\d+\/\d+/.test(r)) ok(t, `Qurʾān verse links must open a tafsir page: ${href}`);
      if (t) ok(tafsir[`${t[1]}:${t[2]}`]?.some(c => c.id === t[3]), `no ${t[3]} tafsir page for ${t[1]}:${t[2]}`);
      if (/^\/bible\//.test(r)) {
        ok(/^\/bible\/[a-z0-9]+\/\d+(?:#\d+)?$/.test(r), `Bible link is not /bible/<book>/<ch>#<v>: ${href}`);
      }
      if (/^\/(?:bible|quran)\//.test(r)) {
        ok(/\bdata-astro-prefetch="false"/.test(attrs), `internal scripture/tafsir link missing data-astro-prefetch="false": ${href}`);
      }
      if (slicedOut(href)) {
        if (ALLOW_SLICED) {
          sliced++;
          continue;
        }
      }
      ok(fs.existsSync(distFile(href)), `internal link to a page missing from dist: ${href}`);
    }
    if (sliced) {
      notes.push(
        `links: ${sliced} internal links point at /bible or /quran routes outside the sliced build (pattern-checked only)`,
      );
    }
  }

  // ---- tone & academic register -----------------------------------------------------------------
  {
    const ok = group('tone', route);
    const voice = textOf(stripQuotes(body));
    for (const re of [BANNED, REGISTER_BANNED, LEGACY_UI_BANNED]) {
      const hits = [...new Set((voice.match(new RegExp(re.source, 'gi')) || []).map(s => s.toLowerCase()))];
      for (const h of hits) {
        const i = voice.toLowerCase().indexOf(h);
        ok(false, `"${h}" in editorial voice: …${voice.slice(Math.max(0, i - 60), i + 50).trim()}…`);
      }
    }
    const heads = [
      ...body.matchAll(/<(h[1-4])\b[^>]*>([\s\S]*?)<\/\1>/g),
      ...body.matchAll(/<(summary)\b[^>]*>([\s\S]*?)<\/\1>/g),
      ...body.matchAll(/<a class="ebj-nav__chip"[^>]*>([\s\S]*?)<\/a>/g).map(m => [m[0], 'a', m[1]]),
    ].map(m => textOf(stripQuotes(m[2])));
    for (const h of heads) {
      const hit =
        h.match(HEADLINE_BANNED) ||
        h.match(BANNED) ||
        h.match(REGISTER_BANNED) ||
        h.match(LEGACY_UI_BANNED);
      ok(!hit, `heading/label uses "${hit?.[0]}": ${h.trim()}`);
    }
  }

  // ---- colours & legacy stylesheet removal ------------------------------------------------------
  {
    const ok = group('colours', route);
    const cssFiles = [...html.matchAll(/<link[^>]+href="([^"]+\.css)"/g)].map(m => m[1]);
    let css = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
    for (const href of cssFiles) {
      const p = path.join(DIST, href.slice(BASE.length).replace(/^\//, ''));
      if (fs.existsSync(p)) css += `\n${fs.readFileSync(p, 'utf8')}`;
    }
    const ours = css
      .split('}')
      .filter(r => /\.ebj\b|\.hrv\b/.test(r))
      .join('}');
    const hit = ours.match(BANNED_COLOURS);
    ok(!hit, `banned colour ${hit?.[0]} in .hrv/.ebj CSS`);
    const src = fs.readFileSync('src/styles/extrabiblical-evidence.css', 'utf8');
    ok(!BANNED_COLOURS.test(src), 'banned colour in src/styles/extrabiblical-evidence.css');
    ok(!/style="[^"]*#(974543|881337|faf5f5|fecdd3)/i.test(body), 'banned colour in inline style');
    ok(!fs.existsSync('src/styles/evidence-feed.css'), 'legacy src/styles/evidence-feed.css must be deleted');
  }

  // ---- jsonld -----------------------------------------------------------------------------------
  {
    const ok = group('jsonld', route);
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => m[1]);
    ok(blocks.length > 0, 'no JSON-LD found');
    const all = [];
    for (const raw of blocks) {
      try {
        const j = JSON.parse(raw);
        const list = Array.isArray(j) ? j : [j];
        for (const x of list) all.push(...(x['@graph'] || [x]));
      } catch {
        ok(false, 'JSON-LD does not parse');
      }
    }
    const articles = all.filter(n => n['@type'] === 'Article');
    const article = articles[0];
    const crumbs = all.find(n => n['@type'] === 'BreadcrumbList');
    ok(article && crumbs, 'JSON-LD must contain Article and BreadcrumbList');
    ok(articles.length === 1, `expected 1 Article schema, found ${articles.length}`);
    ok(!all.some(n => /FAQPage|ClaimReview/.test(n['@type'])), 'must not contain FAQPage or ClaimReview');
    if (article) {
      ok(article.headline === model.seo.title, 'Article.headline must equal SEO title without site suffix');
      ok(!/Ready Apologia$/.test(article.headline || ''), 'Article.headline must not carry site suffix');
      ok(article.datePublished, 'Article.datePublished missing');
      ok(Array.isArray(article.citation) && article.citation.length >= 20, 'Article.citation missing or incomplete');
      ok((article.citation || []).every(c => /^https?:\/\//.test(c.url)), 'Article.citation URLs must be absolute');
    }
    if (crumbs) {
      const items = crumbs.itemListElement || [];
      ok(new Set(items.map(i => i.position)).size === items.length, 'breadcrumb positions must be unique');
      ok(new Set(items.map(i => i.item)).size === items.length, 'breadcrumb URLs must be unique (no duplicate /discover)');
      ok(
        /\/discover\/extrabiblical-evidence-for-jesus$/.test(items[items.length - 1]?.item || ''),
        'last breadcrumb must point to /discover/extrabiblical-evidence-for-jesus',
      );
    }
  }

  // ---- structure & 100% legacy anchor preservation ----------------------------------------------
  {
    const ok = group('structure', route);
    const count = re => (body.match(re) || []).length;
    ok(
      (html.match(/<h1\b/g) || []).length === 1 && count(/<h1\b/g) === 1,
      'exactly one H1 on the page, inside article.hrv.ebj',
    );
    const rows = count(/class="ebj-glance__row"/g);
    ok(rows === model.itemCount, `glance rows (${rows}) must equal numbered sections (${model.itemCount})`);

    const h1Nums = [...textOf(body.match(/<h1\b[\s\S]*?<\/h1>/)?.[0] || '').matchAll(/\b(\d+)\b/g)].map(m =>
      Number(m[1]),
    );
    ok(
      h1Nums[0] === model.literaryAuthorCount && h1Nums[1] === model.archaeologyCount,
      `H1 counts [${h1Nums.join(', ')}] != [${model.literaryAuthorCount}, ${model.archaeologyCount}]`,
    );

    ok(new RegExp(`id="${GLANCE_ID}"`).test(body), 'at-a-glance section missing');
    for (const id of [...SECTION_ORDER, SOURCES_ID]) {
      ok(new RegExp(`<section class="hrv-sec ebj-sec[^"]*" id="${id}"`).test(body), `section #${id} missing`);
      ok(new RegExp(`data-ebj-chip="${id}"`).test(body), `nav chip for #${id} missing`);
    }

    // Verify all 5 legacy theme IDs exist uniquely (`count === 1`).
    const allDomIds = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
    const idCounts = new Map();
    for (const id of allDomIds) idCounts.set(id, (idCounts.get(id) || 0) + 1);

    for (const theme of DATA.themes) {
      const c = idCounts.get(theme.id) || 0;
      ok(c === 1, `legacy theme id "#${theme.id}" must appear exactly once (found ${c})`);
    }
    for (const [alias, sec] of Object.entries(LEGACY_THEME_ALIASES)) {
      const i = body.indexOf(`id="${alias}"`);
      const secAt = body.lastIndexOf(`id="${sec}"`, i);
      ok(
        i > -1 && secAt > -1 && body.lastIndexOf('<section ', i) === body.lastIndexOf('<section ', secAt),
        `legacy theme alias #${alias} is not placed at the head of #${sec}`,
      );
    }

    // Verify all 52 unique `#evidence-<id>` anchors exist uniquely (`count === 1`).
    const uniqueEvIds = [...new Set(DATA.themes.flatMap(t => t.evidences.map(e => e.id)))];
    ok(uniqueEvIds.length === 52, `expected 52 unique evidence IDs in JSON, got ${uniqueEvIds.length}`);
    for (const eid of uniqueEvIds) {
      const domId = `evidence-${eid}`;
      const c = idCounts.get(domId) || 0;
      ok(c === 1, `legacy anchor "#${domId}" must appear exactly once in HTML (found ${c})`);
    }

    // Verify no duplicate DOM IDs anywhere in the document.
    const dupDomIds = [...idCounts.entries()].filter(([, c]) => c > 1);
    ok(dupDomIds.length === 0, `duplicate DOM IDs in built HTML: ${dupDomIds.map(([k, c]) => `#${k} (${c}x)`).join(', ')}`);

    // Verify 40 deduplicated witness cards, 3 non-blockquote `.ebj-finding` cards, and Josephus `.hrv-redline`.
    ok(count(/class="hrv-ev ebj-card"/g) === 40, `expected 40 deduplicated witness cards, found ${count(/class="hrv-ev ebj-card"/g)}`);
    ok(count(/class="ebj-finding ebj-card__q"/g) === 3, 'expected 3 .ebj-finding material excavation records');
    const findingBlocks = [...body.matchAll(/<div class="ebj-finding ebj-card__q">[\s\S]*?<\/div>\s*<div class="hrv-verify"/g)];
    ok(
      findingBlocks.every(m => !/<blockquote\b/.test(m[0])),
      '.ebj-finding excavation cards must not render fake <blockquote> elements',
    );
    ok(count(/class="hrv-redline"/g) >= 1, 'Josephus Testimonium 2-column .hrv-redline comparison missing');

    // Appendix is unnumbered; zero React islands; onboarding off; empty toast; scholar/eval pairs present.
    const appendix = body.slice(body.indexOf('id="corroborative-and-disputed"'), body.indexOf(`id="${SOURCES_ID}"`));
    ok(!/<span class="hrv-q__num" aria-hidden="true">06<\/span>/.test(appendix), 'appendix must not be numbered 06');
    ok(count(/<astro-island\b/g) === 0, 'zero React islands allowed in the article');
    ok(
      /<div class="hrv-toast" role="status" aria-live="polite" data-ebj-toast><\/div>/.test(body),
      'copy toast must be an empty live region on initial render',
    );
    ok(!/OnboardingBanner|Tap on any verse/.test(html), 'onboarding banner must be disabled (showOnboarding={false})');
    ok(!/Extrabiblical Catalog|timeline-container|filter-pill/i.test(html), 'legacy evidence-feed markup still present');
    ok(
      count(/class="hrv-sc hrv-sc--confrontation ebj-sc"/g) === model.itemCount,
      'every numbered section must have a two-sided Confrontation showcase',
    );
    ok(
      count(/class="hrv-scholar ebj-pair"/g) >= model.itemCount && count(/class="hrv-eval ebj-pair"/g) >= model.itemCount,
      'every primary section must include named counter-hypotheses (.hrv-scholar) and evaluation (.hrv-eval)',
    );
  }
}

// ---- stateless client & source checks -----------------------------------------------------------
{
  const ok = group('stateless', 'client.js');
  const client = fs
    .readFileSync('src/components/discover/extrabiblical-evidence/client.js', 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '');
  ok(!/localStorage|sessionStorage|indexedDB|document\.cookie/.test(client), 'client.js must be stateless');
  ok(
    !/history\.(replaceState|pushState)|location\.hash\s*=|replaceState/.test(client),
    'client.js must not mutate the URL or history',
  );
  const page = fs.readFileSync('src/pages/discover/extrabiblical-evidence-for-jesus.astro', 'utf8');
  ok(!/client:(load|visible|idle|only)/.test(page), 'page must not hydrate client islands');
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
      const hit =
        s.match(BANNED) ||
        s.match(HEADLINE_BANNED) ||
        s.match(REGISTER_BANNED) ||
        s.match(/\b(62|ante-nicene|confirming)\b/i);
      ok(!hit, `catalog tone/count mismatch: "${hit?.[0]}"`);
    }
  }
}

{
  const ok = group('build-config', 'build_config.js');
  if (!ALLOW_SLICED) {
    ok(
      BUILD_BOOKS === null && BUILD_SURAHS === null,
      'BUILD_BOOKS / BUILD_SURAHS must be null before commit (pass --allow-sliced for sliced builds)',
    );
  }
}

// ---- live Perseus / Livius / Crossref DOI regression gate (pass --offline to skip) --------------
if (html && !OFFLINE) {
  const ok = group('live-refs', route);
  const extHrefs = [
    ...new Set(
      [...html.matchAll(/\bhref="(https:\/\/[^"]+)"/g)].map(m => decode(m[1])),
    ),
  ];

  const perseusUrls = extHrefs.filter(u => u.includes('www.perseus.tufts.edu'));
  const liviusUrls = extHrefs.filter(u => u.includes('www.livius.org'));
  const doiUrls = extHrefs.filter(u => u.startsWith('https://doi.org/'));
  const sefariaUrls = extHrefs.filter(u => u.includes('www.sefaria.org/'));

  for (const u of perseusUrls) {
    try {
      const r = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(15000) });
      const txt = await r.text();
      ok(r.status === 200, `Perseus HTTP ${r.status}: ${u}`);
      ok(!/No document found/i.test(txt), `Perseus "No document found": ${u}`);
      const title = (txt.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '').toLowerCase();
      const docId = decodeURIComponent(u).match(/Perseus:text:([0-9.]+)/)?.[1];
      const expectedKw = docId && PERSEUS_EXPECTED_TITLE[docId];
      ok(Boolean(expectedKw), `unmapped Perseus doc ID "${docId}" in ${u}`);
      if (expectedKw) {
        ok(title.includes(expectedKw), `Perseus <title> "${title.trim()}" missing "${expectedKw}" (${u})`);
      }
    } catch (e) {
      ok(false, `Perseus fetch error for ${u}: ${e.message}`);
    }
  }

  for (const u of liviusUrls) {
    try {
      const r = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(15000) });
      ok(r.status === 200, `Livius HTTP ${r.status} (expected 200, not 404): ${u}`);
    } catch (e) {
      ok(false, `Livius fetch error for ${u}: ${e.message}`);
    }
  }

  for (const u of doiUrls) {
    const doi = u.replace(/^https:\/\/doi\.org\//, '');
    const expectedKw = DOI_EXPECTED_KEYWORDS[doi];
    ok(Boolean(expectedKw), `DOI "${doi}" missing expected keyword in DOI_EXPECTED_KEYWORDS`);
    try {
      const r = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, {
        headers: { 'User-Agent': 'ReadyApologiaAudit/1.0' },
        signal: AbortSignal.timeout(15000),
      });
      ok(r.status === 200, `Crossref HTTP ${r.status} for DOI ${doi}`);
      if (r.status === 200 && expectedKw) {
        const j = await r.json();
        const crTitle = (j.message?.title || []).join(' ').toLowerCase();
        ok(
          crTitle.includes(expectedKw),
          `Crossref title "${crTitle}" for DOI ${doi} does not contain expected keyword "${expectedKw}"`,
        );
      }
    } catch (e) {
      ok(false, `Crossref fetch error for DOI ${doi}: ${e.message}`);
    }
  }

  for (const u of sefariaUrls) {
    try {
      const refPath = new URL(u).pathname.replace(/^\//, '');
      const r = await fetch(`https://www.sefaria.org/api/texts/${encodeURIComponent(refPath)}?context=0`, {
        headers: { 'User-Agent': 'ReadyApologiaAudit/1.0' },
        signal: AbortSignal.timeout(15000),
      });
      ok(r.status === 200, `Sefaria API HTTP ${r.status} for ${u}`);
      if (r.status === 200) {
        const j = await r.json();
        ok(!j.error, `Sefaria API returned error for ${u}: ${j.error}`);
        const hasText =
          (Array.isArray(j.text) ? j.text.flat(3).join('') : String(j.text || '')).trim().length > 0 ||
          (Array.isArray(j.he) ? j.he.flat(3).join('') : String(j.he || '')).trim().length > 0;
        ok(hasText, `Sefaria API returned empty text/segment out of bounds for ${u}`);
      }
    } catch (e) {
      ok(false, `Sefaria API fetch error for ${u}: ${e.message}`);
    }
  }
}

for (const n of notes) console.log(`  · ${n}`);
console.log(failures ? `\n${failures} of ${checks} checks failed` : `\nAll ${checks} checks passed`);
process.exit(failures ? 1 : 0);
