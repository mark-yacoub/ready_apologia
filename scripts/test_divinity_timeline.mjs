#!/usr/bin/env node
// Static built-HTML, link, anchor, image, JSON-LD, CSS, stateless-JS, and
// academic-register audit for `/discover/divinity-timeline`.
//
// Usage:
//   node scripts/test_divinity_timeline.mjs [--dist dist] [--allow-sliced]

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { BUILD_BOOKS, BUILD_SURAHS } from '../src/utils/build_config.js';
import { DISCOVER_CATALOG_OVERRIDES } from '../src/utils/discoverCatalogOverrides.ts';
import {
  ALL_LEGACY_EVENT_IDS,
  ARTICLE_PATH,
  ARTICLE_SLUG,
  BASE,
  BUILT_BIBLE_BOOKS,
  BUILT_QURAN_SURAHS,
  CANONICAL_URL,
  EXPECTED_DATA_SHA256,
  MAX_RENDERED_IMAGE_BYTES,
  OG_IMAGE,
  validateHref,
} from '../src/utils/divinityTimeline/config.js';
import { BANNED, FIRST_PERSON_AUTHORIAL, HEADLINE_BANNED } from '../src/utils/divinityTimeline/tone.js';
import { loadIslamicCommentaries } from '../src/utils/islamic_commentaries_loader.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const distIdx = args.indexOf('--dist');
const DIST_DIR = path.resolve(
  REPO_ROOT,
  distIdx !== -1 && args[distIdx + 1] ? args[distIdx + 1] : 'dist',
);
const ALLOW_SLICED = args.includes('--allow-sliced');

const failures = [];
const check = (cond, msg) => {
  if (!cond) failures.push(msg);
};

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function stripTags(html) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();
}

// 1. Built HTML existence
const htmlPath = path.join(DIST_DIR, 'discover/divinity-timeline/index.html');
if (!fs.existsSync(htmlPath)) {
  console.error(`FAIL: missing built HTML at ${htmlPath}`);
  process.exit(1);
}
const html = fs.readFileSync(htmlPath, 'utf8');

// Extract `<article class="hrv dtl" id="top">...</article>`
const articleStart = html.indexOf('<article class="hrv dtl" id="top">');
check(articleStart !== -1, 'Missing `<article class="hrv dtl" id="top">` root');
const articleEnd = html.lastIndexOf('</article>');
const articleHtml =
  articleStart !== -1 && articleEnd > articleStart
    ? html.slice(articleStart, articleEnd + '</article>'.length)
    : '';

// 2. Zero template/markdown leaks & zero forbidden third-party CDNs / React islands
const visibleAll = stripTags(articleHtml);
check(!/\bundefined\b/.test(visibleAll), 'Rendered text contains literal "undefined"');
check(!/\bNaN\b/.test(visibleAll), 'Rendered text contains literal "NaN"');
check(!/\[object Object\]/.test(visibleAll), 'Rendered text contains "[object Object]"');
check(!/\*\*[^*]+\*\*/.test(visibleAll), 'Rendered text contains unparsed **bold** markdown');
check(!/\[[^\]]+\]\(https?:\/\//.test(visibleAll), 'Rendered text contains unparsed [label](url) markdown');
check(!/\u0305|\u035E/.test(visibleAll), 'Rendered text contains raw combining overline U+0305/U+035E outside .dtl-ns');
check(!/"/.test(visibleAll), 'Rendered visible text contains straight ASCII double quote (use curly “…” per P-07)');
check(!/<code\b/i.test(articleHtml), 'Article HTML contains monospace <code> tag inside reader prose (X3)');
check(
  !/legacy dataset|scraper photographs|merged legacy|anchor:\s*#event-|divinityTimeline\.json/i.test(visibleAll),
  'Rendered visible text contains internal developer or pipeline terminology (X4/M1)',
);
check(articleHtml.includes('class="dtl-framing"'), 'Missing hero-adjacent historical framing callout (.dtl-framing)');
check(articleHtml.includes('class="dtl-card__shows"'), 'Missing card-level What-this-shows takeaway (.dtl-card__shows)');
check(articleHtml.includes('class="dtl-card__tier'), 'Missing card-level evidentiary tier badge (.dtl-card__tier)');

for (const bannedCdn of [
  'leaflet',
  'katex',
  'marked.min',
  'dompurify',
  'unpkg.com',
  'cdn.jsdelivr.net',
  'cdnjs.cloudflare.com',
]) {
  check(
    !html.toLowerCase().includes(bannedCdn),
    `Built HTML still references forbidden legacy CDN/library "${bannedCdn}"`,
  );
}
check(
  !/<astro-island\b/i.test(articleHtml),
  'Article contains hydrated <astro-island> inside .hrv.dtl',
);
check(
  !fs.existsSync(path.join(DIST_DIR, 'api/timeline-data.json')),
  'Legacy endpoint dist/api/timeline-data.json should no longer be emitted',
);

// 3. SEO & JSON-LD checks
check(
  html.includes(`<link rel="canonical" href="${CANONICAL_URL}"`),
  `Missing or mismatched canonical link for ${CANONICAL_URL}`,
);
check(
  html.includes(OG_IMAGE),
  `Missing OG image ${OG_IMAGE} in <head>`,
);
check(
  fs.existsSync(path.join(REPO_ROOT, 'public', OG_IMAGE)),
  `OG image missing on disk: public${OG_IMAGE}`,
);

const ldMatches = [
  ...html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  ),
];
check(ldMatches.length >= 1, 'Missing application/ld+json structured data');
const graphs = ldMatches.flatMap((m) => {
  const parsed = JSON.parse(m[1]);
  return parsed['@graph'] ? parsed['@graph'] : [parsed];
});
const bc = graphs.find((n) => n['@type'] === 'BreadcrumbList');
const art = graphs.find((n) => n['@type'] === 'Article');
check(Boolean(bc), 'Missing BreadcrumbList in JSON-LD');
if (bc) {
  const bcUrls = (bc.itemListElement || []).map((x) => x.item);
  check(
    bcUrls.length === 3 && new Set(bcUrls).size === 3,
    `BreadcrumbList must have 3 unique URLs, got ${JSON.stringify(bcUrls)}`,
  );
}
check(Boolean(art), 'Missing Article in JSON-LD');
if (art) {
  check(Boolean(art.datePublished && art.dateModified), 'Article JSON-LD missing dates');
  check(
    Array.isArray(art.citation) && art.citation.length >= 12,
    'Article JSON-LD must include >= 12 scholarly citations',
  );
}
check(
  !graphs.some((n) => n['@type'] === 'FAQPage' || n['@type'] === 'ClaimReview'),
  'JSON-LD must not emit restricted FAQPage or ClaimReview types',
);

// 4. All 42 `#event-<id>` anchors exist uniquely (`count === 1`) in built HTML
const idCounts = new Map();
for (const m of html.matchAll(/\bid=["']([^"']+)["']/g)) {
  idCounts.set(m[1], (idCounts.get(m[1]) || 0) + 1);
}
for (const rawId of ALL_LEGACY_EVENT_IDS) {
  const anchor = `event-${rawId}`;
  const count = idCounts.get(anchor) || 0;
  check(
    count === 1,
    `Legacy anchor #${anchor} must appear exactly once in built HTML (found ${count})`,
  );
}

// 5. Link validation & on-disk internal route resolution
const commentaries = loadIslamicCommentaries();
const hrefMatches = [...articleHtml.matchAll(/<a\b([^>]*?)href=["']([^"']+)["']([^>]*)>/gi)];
check(hrefMatches.length >= 30, `Expected >= 30 links inside article, found ${hrefMatches.length}`);
for (const [, preAttrs, rawHref, postAttrs] of hrefMatches) {
  const href = decodeEntities(rawHref);
  const fullAttrs = `${preAttrs} ${postAttrs}`;
  const res = validateHref(href);
  check(res.ok, `Invalid article href "${href}": ${res.reason}`);
  if (!res.ok) continue;

  if (res.kind === 'anchor') {
    const targetId = href.slice(1);
    check(
      (idCounts.get(targetId) || 0) >= 1,
      `Broken in-page fragment "${href}" (no matching id="${targetId}")`,
    );
  } else if (res.kind === 'external') {
    check(
      /\brel=["'][^"']*noopener/i.test(fullAttrs),
      `External link "${href}" missing rel="noopener noreferrer"`,
    );
  } else if (res.kind.startsWith('internal-')) {
    const [pathname] = href.split('#');
    const relPath = BASE && pathname.startsWith(`${BASE}/`) ? pathname.slice(BASE.length) : pathname;
    if (res.kind === 'internal-bible' || res.kind === 'internal-quran') {
      check(
        /\bdata-astro-prefetch=["']false["']/i.test(fullAttrs),
        `Internal scripture/tafsir link "${href}" missing data-astro-prefetch="false"`,
      );
    }
    if (res.kind === 'internal-quran') {
      const qm = relPath.match(/^\/quran\/(\d+)\/(\d+)\/tafsir\/(tabari|ibn_kathir)$/);
      check(
        Boolean(qm && (commentaries[`${qm[1]}:${qm[2]}`] || []).some((c) => c.id === qm[3])),
        `Tafsir entry missing in corpus for "${href}"`,
      );
    }
    const candidateIndex = path.join(DIST_DIR, relPath.replace(/^\//, ''), 'index.html');
    const candidateHtml = path.join(DIST_DIR, `${relPath.replace(/^\//, '')}.html`);
    if (!fs.existsSync(candidateIndex) && !fs.existsSync(candidateHtml)) {
      let slicedOut = false;
      const qm = relPath.match(/^\/quran\/(\d+)\//);
      const bm = relPath.match(/^\/bible\/([a-z0-9]+)\//);
      if (qm && BUILT_QURAN_SURAHS.has(qm[1])) {
        slicedOut = BUILD_SURAHS ? !BUILD_SURAHS.has(qm[1]) : ALLOW_SLICED;
      } else if (bm && BUILT_BIBLE_BOOKS.has(bm[1])) {
        slicedOut = BUILD_BOOKS ? !BUILD_BOOKS.has(bm[1]) : ALLOW_SLICED;
      }
      if (!slicedOut) {
        failures.push(`Internal route "${pathname}" missing from ${DIST_DIR}`);
      }
    }
  }
}

// 6. Image existence, lazy-loading, and <= 600 KB budget
const imgMatches = [...articleHtml.matchAll(/<img\b([^>]+)>/gi)];
check(imgMatches.length >= 10, `Expected >= 10 rendered artifact photos, found ${imgMatches.length}`);
for (const [, attrs] of imgMatches) {
  const srcMatch = attrs.match(/\bsrc=["']([^"']+)["']/i);
  const altMatch = attrs.match(/\balt=["']([^"']*)["']/i);
  check(Boolean(srcMatch), '<img> missing src attribute');
  check(Boolean(altMatch && altMatch[1].trim().length >= 15), `<img> missing descriptive alt: ${attrs}`);
  check(/\bloading=["']lazy["']/i.test(attrs), `<img> missing loading="lazy": ${attrs}`);
  check(/\bdecoding=["']async["']/i.test(attrs), `<img> missing decoding="async": ${attrs}`);
  if (srcMatch) {
    const imgRel = BASE && srcMatch[1].startsWith(`${BASE}/`) ? srcMatch[1].slice(BASE.length) : srcMatch[1];
    const diskImg = path.join(REPO_ROOT, 'public', imgRel);
    check(fs.existsSync(diskImg), `Missing image on disk: ${diskImg}`);
    if (fs.existsSync(diskImg)) {
      const sz = fs.statSync(diskImg).size;
      check(
        sz <= MAX_RENDERED_IMAGE_BYTES,
        `Rendered image ${srcMatch[1]} (${sz} bytes) exceeds 600 KB cap`,
      );
    }
  }
}

// 7. Rendered Academic Register & Tone Gate (including Board #5 owner rules)
for (const [, hText] of articleHtml.matchAll(/<h[1-3]\b[^>]*>([\s\S]*?)<\/h[1-3]>/gi)) {
  const plainH = stripTags(hText);
  for (const rx of [...BANNED, ...FIRST_PERSON_AUTHORIAL, ...HEADLINE_BANNED]) {
    const m = plainH.match(rx);
    check(!m, `Heading "${plainH}" violates academic register (${rx}: "${m?.[0]}")`);
  }
}

// Strip `<blockquote class="hrv-quote dtl-card__q">...</blockquote>` before checking
// first-person authorial pronouns, while checking BANNED across the entire article!
for (const rx of BANNED) {
  const m = visibleAll.match(rx);
  check(!m, `Article text violates banned academic register (${rx}: "${m?.[0]}")`);
}
const articleWithoutBlockquotes = stripTags(
  articleHtml.replace(/<blockquote\b[\s\S]*?<\/blockquote>/gi, ' '),
).replace(/(?:"[^"]*"|“[^”]*”)/g, ' ');
for (const rx of FIRST_PERSON_AUTHORIAL) {
  const m = articleWithoutBlockquotes.match(rx);
  check(
    !m,
    `Authorial prose contains forbidden first-person pronoun "${m?.[0]}" (${rx})`,
  );
}

// 8. CSS & Stateless Client JS checks
const cssText = fs.readFileSync(
  path.join(REPO_ROOT, 'src/styles/divinity-timeline.css'),
  'utf8',
);
check(
  !/#(ef4444|dc2626|f87171|b91c1c)\b/i.test(cssText),
  'divinity-timeline.css contains forbidden alarm-red hex colour',
);
const clientJs = fs
  .readFileSync(
    path.join(REPO_ROOT, 'src/components/discover/divinity-timeline/client.js'),
    'utf8',
  )
  .replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
for (const forbiddenJs of [
  'localStorage',
  'sessionStorage',
  'indexedDB',
  'document.cookie',
  'pushState',
  'replaceState',
]) {
  check(
    !clientJs.includes(forbiddenJs),
    `client.js must remain stateless; found "${forbiddenJs}"`,
  );
}

// 9. Repo hygiene locks (`divinityTimeline.json` SHA-256, `build_config.js` null, catalog)
const rawDataBytes = fs.readFileSync(
  path.join(REPO_ROOT, 'src/data/divinityTimeline.json'),
);
const actualSha = crypto.createHash('sha256').update(rawDataBytes).digest('hex');
check(
  actualSha === EXPECTED_DATA_SHA256,
  `src/data/divinityTimeline.json was modified! Expected ${EXPECTED_DATA_SHA256}, got ${actualSha}`,
);

if (!ALLOW_SLICED) {
  const buildCfg = fs.readFileSync(
    path.join(REPO_ROOT, 'src/utils/build_config.js'),
    'utf8',
  );
  check(
    /BUILD_BOOKS\s*=\s*null/.test(buildCfg) && /BUILD_SURAHS\s*=\s*null/.test(buildCfg),
    'src/utils/build_config.js must remain reset to null',
  );
}

const discoverHtmlPath = path.join(DIST_DIR, 'discover/index.html');
check(fs.existsSync(discoverHtmlPath), `Missing built Discover hub at ${discoverHtmlPath}`);
if (fs.existsSync(discoverHtmlPath)) {
  const discoverHtml = fs.readFileSync(discoverHtmlPath, 'utf8');
  const expectedCard = DISCOVER_CATALOG_OVERRIDES[ARTICLE_SLUG];
  const cardRe = new RegExp(
    `<a[^>]+href=["']${ARTICLE_PATH.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>([\\s\\S]*?)</a>`,
    'i',
  );
  const cardMatch = discoverHtml.match(cardRe);
  check(Boolean(cardMatch), `Missing card for ${ARTICLE_PATH} in dist/discover/index.html`);
  if (cardMatch) {
    const cardInner = cardMatch[1];
    const renderedTitle = stripTags(cardInner.match(/<h4[^>]*class=["'][^"']*card-title[^"']*["'][^>]*>([\s\S]*?)<\/h4>/i)?.[1] || '');
    const renderedDesc = stripTags(cardInner.match(/<p[^>]*class=["'][^"']*card-desc[^"']*["'][^>]*>([\s\S]*?)<\/p>/i)?.[1] || '');
    check(
      renderedTitle === expectedCard.title,
      `dist/discover/index.html card title "${renderedTitle}" !== "${expectedCard.title}"`,
    );
    check(
      renderedDesc === expectedCard.description,
      `dist/discover/index.html card description "${renderedDesc}" !== "${expectedCard.description}"`,
    );
    check(
      !/map|filter|hard evidences|interactive|\b42\b/i.test(`${renderedTitle} ${renderedDesc}`),
      'dist/discover/index.html card contains legacy timeline/milestone copy',
    );
  }
}

if (failures.length > 0) {
  console.error(`FAIL (${failures.length} issues):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(
  `PASS: /discover/divinity-timeline audit clean (${ALL_LEGACY_EVENT_IDS.length} #event-* anchors, ${hrefMatches.length} links, ${imgMatches.length} lazy images <=600KB, zero CDNs, academic register & catalog verified).`,
);
