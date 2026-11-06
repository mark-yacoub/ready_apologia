#!/usr/bin/env node
/**
 * Zero-dependency static SEO, Title, Description, H1, Opening-Line, Tone,
 * Sitemap & JSON-LD Audit (`scripts/test_seo_titles.mjs`).
 *
 * Scans ALL generated HTML files in a built `dist/` directory using fast
 * regex extraction (no DOM library) and verifies:
 *   - build-config : `BUILD_BOOKS` and `BUILD_SURAHS` in `src/utils/build_config.js`
 *                    are `null` (unless `--allow-sliced` is passed).
 *   - titles       : Every HTML page has exactly 1 non-empty `<title>`; base title
 *                    (minus `" | Ready Apologia"`) is <= 60 chars on templated
 *                    Bible/Qur'an pages (`/bible/<b>/<c>`, `/bible/<b>/<c>/<v>/<tab>`,
 *                    `/quran/<s>`, `/quran/<s>/<a>/<tab>[/<sub>]`); over-60 base
 *                    titles elsewhere are reported as warnings; no duplicate titles
 *                    among templated pages (except documented alias pairs); no
 *                    `"Tafsir Tafsir"` or other doubled words; no
 *                    `"undefined"`/`"null"`/`"NaN"`/`"[object"`.
 *   - descriptions : Every non-redirect HTML page has exactly 1 non-empty
 *                    `<meta name="description">`; 50-170 chars on templated pages;
 *                    no doubled words or `"undefined"`/`"null"`/`"NaN"`/`"[object"`;
 *                    no raw markdown (`**` or `[](`).
 *   - h1           : Every non-redirect HTML page has exactly 1 non-empty `<h1>`;
 *                    redirect stubs (`<meta http-equiv="refresh">` + `noindex`) are
 *                    skipped for `<h1>` and must NOT appear in any sitemap.
 *   - opening      : Every templated Bible/Qur'an chapter, surah, or verse/ayah tab
 *                    page renders a non-empty `.verse-opening-line`,
 *                    `.chapter-opening-line`, or `.surah-opening-line`.
 *   - tone         : Opening lines and meta descriptions contain none of the banned
 *                    words from `docs/article_and_ux_playbook.md` §2.3 (shared list
 *                    imported from `src/utils/quranPreservation/tone.js`); video-tab
 *                    descriptions (`/bible/.../videos`, `/quran/.../videos`) must
 *                    not include individual video titles.
 *   - sitemap      : Every sitemap `<loc>` resolves to a built HTML page that is
 *                    indexable (no `noindex`, no `<meta http-equiv="refresh">`);
 *                    every `<url>` has `<lastmod>` (unless allow-listed via
 *                    `--allow-missing-lastmod`); every page's `<link rel="canonical">`
 *                    matches its sitemap `<loc>`.
 *   - jsonld       : Every `<script type="application/ld+json">` block parses as
 *                    valid JSON.
 *
 * Usage:
 *   node scripts/test_seo_titles.mjs [--dist <dir>] [--allow-sliced] [--allow-missing-lastmod[=p1,p2]] [--max-offenders <N>]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BODY as TONE_BODY, HEADLINE as TONE_HEADLINE } from '../src/utils/quranPreservation/tone.js';

/** Single-item permalink pages whose description may quote their one source text. */
const isSingleItemRoute = (route) => /^\/hadith\/(bukhari|muslim)\/[^/]+$/.test(route);
/** Remove quoted spans (“…”, possibly nested) so the tone check only sees our own voice. */
const stripQuoted = (text) => {
  // Everything from the first “ to the last ” is quotation (titles may nest or close unevenly).
  const t = String(text); const i = t.indexOf('\u201c'); const j = t.lastIndexOf('\u201d');
  if (i < 0) return t;
  // An unclosed quote was truncated by the description length clamp ("…"): quoted to the end.
  return j > i ? t.slice(0, i) + t.slice(j + 1) : t.slice(0, i);
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
function getFlagValue(flag, defaultVal) {
  const idx = args.indexOf(flag);
  if (idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith('--')) {
    return args[idx + 1];
  }
  const eq = args.find((a) => a.startsWith(`${flag}=`));
  if (eq) return eq.slice(flag.length + 1);
  return defaultVal;
}

const DIST = path.resolve(ROOT, getFlagValue('--dist', 'dist'));
const ALLOW_SLICED = args.includes('--allow-sliced');
const MAX_OFFENDERS = Number.parseInt(getFlagValue('--max-offenders', '15'), 10) || 15;

// `--allow-missing-lastmod` can be passed bare (allow all missing `<lastmod>` as
// warnings while files are uncommitted) or as `--allow-missing-lastmod=/p1,/p2`.
const allowMissingLastmodArg = args.find(
  (a) => a === '--allow-missing-lastmod' || a.startsWith('--allow-missing-lastmod=')
);
const ALLOW_ALL_MISSING_LASTMOD =
  allowMissingLastmodArg === '--allow-missing-lastmod' &&
  (() => {
    const idx = args.indexOf('--allow-missing-lastmod');
    const next = args[idx + 1];
    return !next || next.startsWith('--');
  })();
const ALLOW_MISSING_LASTMOD_SET = new Set(
  allowMissingLastmodArg && !ALLOW_ALL_MISSING_LASTMOD
    ? getFlagValue('--allow-missing-lastmod', '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : []
);

const SITE_ORIGIN = 'https://readyapologia.com';
const TITLE_SUFFIX = ' | Ready Apologia';

/**
 * Known duplicate-title alias pairs among templated routes, documented with
 * explicit reasons so unexpected duplicate titles still fail the audit.
 */
const KNOWN_TITLE_ALIAS_PAIRS = [
  {
    routes: ['/quran/codex/abdullah-bin-abbas', '/quran/codex/ibn-abbas'],
    reason:
      'Legacy companion slug alias (`abdullah-bin-abbas` canonicalizes to `/quran/codex/ibn-abbas` in `src/pages/quran/codex/[companion].astro`).',
  },
  {
    routes: [
      '/quran/variant/category-different-word-entirely',
      '/quran/variant/effect-different-word-entirely',
    ],
    reason:
      "Qira'at category filter (`category`) and impact filter (`effect`) share the display label 'Different Word entirely' in `src/utils/qiraatLoader.js`.",
  },
];

const KNOWN_ALIAS_KEY_SET = new Set(
  KNOWN_TITLE_ALIAS_PAIRS.map((p) => [...p.routes].sort().join('||'))
);

// ─── Group Result Tracking ──────────────────────────────────────────────────

const GROUP_ORDER = [
  'build-config',
  'titles',
  'descriptions',
  'h1',
  'opening',
  'tone',
  'sitemap',
  'jsonld',
];

const groups = new Map(
  GROUP_ORDER.map((name) => [
    name,
    { checks: 0, failures: 0, warnings: 0, offenders: [], warnList: [] },
  ])
);

function ensureGroup(name) {
  if (!groups.has(name)) {
    groups.set(name, { checks: 0, failures: 0, warnings: 0, offenders: [], warnList: [] });
  }
  return groups.get(name);
}

/**
 * Forces V8 to allocate an independent flat string instead of a `SlicedString`
 * retaining the parent 200KB HTML file buffer across 25K+ pages.
 */
function unbind(str) {
  return str ? Buffer.from(String(str), 'utf8').toString('utf8') : '';
}

function check(group, cond, msg) {
  const g = ensureGroup(group);
  g.checks += 1;
  if (!cond) {
    g.failures += 1;
    if (g.offenders.length < MAX_OFFENDERS) {
      g.offenders.push(unbind(msg));
    }
  }
  return Boolean(cond);
}

function warn(group, msg) {
  const g = ensureGroup(group);
  g.warnings += 1;
  if (g.warnList.length < MAX_OFFENDERS) {
    g.warnList.push(unbind(msg));
  }
}

// ─── Route Classification Helpers ───────────────────────────────────────────

const RE_BIBLE_CHAPTER = /^\/bible\/(?!gospels\/videos$)[^/]+\/[^/]+$/;
const RE_BIBLE_VERSE_TAB = /^\/bible\/[^/]+\/[^/]+\/[^/]+\/[^/]+$/;
// `/quran/1` .. `/quran/114` are surah reader pages; `/quran/0` is the Lost Verses special hub.
const RE_QURAN_SURAH = /^\/quran\/[1-9]\d*$/;
const RE_QURAN_AYAH_TAB = /^\/quran\/[1-9]\d*\/[^/]+\/[^/]+(?:\/[^/]+)?$/;

const RE_QURAN_CODEX = /^\/quran\/codex\/[^/]+$/;
const RE_QURAN_VARIANT = /^\/quran\/variant\/[^/]+$/;
const RE_HADITH_ITEM = /^\/hadith\/(bukhari|muslim)\/[^/]+$/;
const RE_TOPIC_ITEM = /^\/topics\/[^/]+$/;
const RE_CREATOR_ITEM = /^\/creators\/[^/]+$/;

/**
 * Templated Bible & Qur'an pages covered by the <= 60 char base-title budget
 * and `.verse-opening-line` / `.chapter-opening-line` / `.surah-opening-line` check:
 *   - `/bible/<b>/<c>`
 *   - `/bible/<b>/<c>/<v>/<tab>`
 *   - `/quran/<s>` (surahs 1-114)
 *   - `/quran/<s>/<a>/<tab>[/<sub>]`
 */
function isTemplatedScripture(route) {
  return (
    RE_BIBLE_CHAPTER.test(route) ||
    RE_BIBLE_VERSE_TAB.test(route) ||
    RE_QURAN_SURAH.test(route) ||
    RE_QURAN_AYAH_TAB.test(route)
  );
}

/**
 * All data-driven templated routes (Scripture + Codex + Variant + Hadith + Topic + Creator).
 */
function isTemplatedPage(route) {
  return (
    isTemplatedScripture(route) ||
    RE_QURAN_CODEX.test(route) ||
    RE_QURAN_VARIANT.test(route) ||
    RE_HADITH_ITEM.test(route) ||
    RE_TOPIC_ITEM.test(route) ||
    RE_CREATOR_ITEM.test(route)
  );
}

function isVideoTabRoute(route) {
  return (
    (RE_BIBLE_VERSE_TAB.test(route) || RE_QURAN_AYAH_TAB.test(route)) &&
    route.endsWith('/videos')
  );
}

// ─── HTML & Text Helpers ────────────────────────────────────────────────────

function decodeEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number.parseInt(dec, 10)));
}

function stripTags(str) {
  return decodeEntities(str.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

const RE_BAD_TOKENS = /\b(undefined|null|NaN)\b|\[object\b/;
const RE_DOUBLED_WORD = /\b([a-zA-Z]{2,})\s+\1\b/i;
// Intentional natural-English repeated words if they ever appear in prose:
const ALLOWED_DOUBLED_WORDS = new Set(['had']);

function findDoubledWord(text) {
  if (!text) return null;
  const re = new RegExp(RE_DOUBLED_WORD.source, 'gi');
  let m;
  while ((m = re.exec(text)) !== null) {
    const word = m[1].toLowerCase();
    if (!ALLOWED_DOUBLED_WORDS.has(word)) {
      return m[0];
    }
  }
  return null;
}

const RE_RAW_MARKDOWN = /\*\*|\]\(/;

/**
 * Strip verbatim quotes (12+ chars inside straight or curly quotes) before
 * running editorial tone checks, matching the convention across `src/utils/<topic>/tone.js`.
 */
function stripQuotedSpans(text) {
  if (!text) return '';
  return String(text)
    .replace(/\u201c[^\u201d]{12,}\u201d/g, ' ')
    .replace(/"[^"]{12,}"/g, ' ')
    .replace(/\u2018[^\u2019]{12,}\u2019/g, ' ');
}

const TONE_PATTERNS = [TONE_BODY, TONE_HEADLINE].flat();

function findToneViolation(text) {
  const cleaned = stripQuotedSpans(text);
  for (const pat of TONE_PATTERNS) {
    const m = cleaned.match(pat);
    if (m) return m[0];
  }
  return null;
}

// ─── Fast Recursive File Walker ─────────────────────────────────────────────

function collectHtmlFiles(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectHtmlFiles(full, out);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

function fileToRoute(filePath) {
  const rel = path.relative(DIST, filePath).replace(/\\/g, '/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'/index.html'.length);
  if (rel.endsWith('.html')) return '/' + rel.slice(0, -'.html'.length);
  return '/' + rel;
}

// ─── 1. Build-Config Check ──────────────────────────────────────────────────

const buildCfgPath = path.join(ROOT, 'src/utils/build_config.js');
if (fs.existsSync(buildCfgPath)) {
  const cfgSrc = fs.readFileSync(buildCfgPath, 'utf8');
  const booksNull = /export\s+const\s+BUILD_BOOKS\s*=\s*null\s*;/.test(cfgSrc);
  const surahsNull = /export\s+const\s+BUILD_SURAHS\s*=\s*null\s*;/.test(cfgSrc);
  if (ALLOW_SLICED) {
    check('build-config', true, 'BUILD_BOOKS / BUILD_SURAHS check skipped via --allow-sliced');
    if (!booksNull || !surahsNull) {
      warn(
        'build-config',
        `src/utils/build_config.js is currently sliced (BUILD_BOOKS=${booksNull ? 'null' : 'Set'}, BUILD_SURAHS=${surahsNull ? 'null' : 'Set'}) — allowed by --allow-sliced`
      );
    }
  } else {
    check(
      'build-config',
      booksNull,
      'src/utils/build_config.js: BUILD_BOOKS must be null for full build (or pass --allow-sliced)'
    );
    check(
      'build-config',
      surahsNull,
      'src/utils/build_config.js: BUILD_SURAHS must be null for full build (or pass --allow-sliced)'
    );
  }
}

if (!fs.existsSync(DIST)) {
  console.error(`ERROR: dist directory not found at ${DIST}`);
  process.exit(1);
}

// ─── 2. Scan All Built HTML Pages ───────────────────────────────────────────

const t0 = Date.now();
const htmlFiles = collectHtmlFiles(DIST);
check('titles', htmlFiles.length > 0, `dist directory ${DIST} contains 0 HTML files`);

// Map route -> { isRedirectStub, isNoIndex, canonical, title }
const pageMetaByRoute = new Map();
// Map title -> [route, ...] among templated pages
const templatedTitleMap = new Map();

const RE_TITLE_ALL = /<title\b[^>]*>([\s\S]*?)<\/title>/gi;
const RE_META_DESC_ALL =
  /<meta\b[^>]*\bname=["']description["'][^>]*>|<meta\b[^>]*\bcontent=["'][^"']*["'][^>]*\bname=["']description["'][^>]*>/gi;
const RE_CONTENT_ATTR = /\bcontent=(?:"([^"]*)"|'([^']*)')/i;
const RE_META_ROBOTS = /<meta\b[^>]*\bname=["']robots["'][^>]*>/i;
const RE_META_REFRESH = /<meta\b[^>]*\bhttp-equiv=["']refresh["'][^>]*>/i;
const RE_CANONICAL = /<link\b[^>]*\brel=["']canonical["'][^>]*>/i;
const RE_HREF_ATTR = /\bhref=(?:"([^"]*)"|'([^']*)')/i;
const RE_H1_ALL = /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi;
const RE_OPENING_LINE =
  /<([a-z0-9]+)\b[^>]*\bclass=["'][^"']*\b(verse-opening-line|chapter-opening-line|surah-opening-line)\b[^"']*["'][^>]*>([\s\S]*?)<\/\1>/i;
const RE_JSONLD_ALL =
  /<script\b[^>]*\btype=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

for (const file of htmlFiles) {
  const route = fileToRoute(file);
  const html = fs.readFileSync(file, 'utf8');
  const headEnd = html.indexOf('</head>');
  const head = headEnd !== -1 ? html.slice(0, headEnd) : html;

  const hasMetaRefresh = RE_META_REFRESH.test(head);
  const robotsTag = head.match(RE_META_ROBOTS)?.[0] || '';
  const robotsContent = (() => {
    const m = robotsTag.match(RE_CONTENT_ATTR);
    return m ? (m[1] ?? m[2] ?? '') : '';
  })();
  const isNoIndex = /\bnoindex\b/i.test(robotsContent);
  const isRedirectStub = hasMetaRefresh && isNoIndex;
  const isNonIndexable = isRedirectStub || isNoIndex || route === '/404';

  const canonicalTag = head.match(RE_CANONICAL)?.[0] || '';
  const canonical = (() => {
    const m = canonicalTag.match(RE_HREF_ATTR);
    return m ? unbind(decodeEntities(m[1] ?? m[2] ?? '')) : null;
  })();

  const templatedScripture = isTemplatedScripture(route);
  const templated = isTemplatedPage(route);

  // ── Group: titles ──
  const titleMatches = [...head.matchAll(RE_TITLE_ALL)];
  const rawTitle = titleMatches.length === 1 ? unbind(stripTags(titleMatches[0][1])) : '';
  check(
    'titles',
    titleMatches.length === 1 && rawTitle.length > 0,
    `${route}: expected exactly 1 non-empty <title>, found ${titleMatches.length} (${JSON.stringify(rawTitle)})`
  );

  if (rawTitle) {
    const baseTitle = rawTitle.endsWith(TITLE_SUFFIX)
      ? rawTitle.slice(0, -TITLE_SUFFIX.length)
      : rawTitle;

    if (templatedScripture) {
      check(
        'titles',
        baseTitle.length <= 60,
        `${route}: templated Scripture base <title> is ${baseTitle.length} chars (max 60): "${baseTitle}"`
      );
    } else if (!isNonIndexable) {
      if (baseTitle.length > 60) {
        warn(
          'titles',
          `${route}: non-templated base <title> is ${baseTitle.length} chars (> 60): "${baseTitle}"`
        );
      } else {
        check('titles', true, `${route}: base <title> <= 60 chars`);
      }
    }

    const badTokenMatch = rawTitle.match(RE_BAD_TOKENS);
    check(
      'titles',
      !badTokenMatch,
      `${route}: <title> contains "${badTokenMatch?.[0]}": "${rawTitle}"`
    );

    const doubledWord = findDoubledWord(rawTitle);
    check(
      'titles',
      !doubledWord,
      `${route}: <title> contains doubled word "${doubledWord}": "${rawTitle}"`
    );

    if (templated && !isNonIndexable) {
      const list = templatedTitleMap.get(rawTitle);
      if (list) list.push(route);
      else templatedTitleMap.set(rawTitle, [route]);
    }
  }

  pageMetaByRoute.set(route, {
    isRedirectStub,
    isNoIndex,
    hasMetaRefresh,
    canonical,
    title: rawTitle,
  });

  // ── Group: descriptions ──
  if (!isRedirectStub) {
    const descMatches = [...head.matchAll(RE_META_DESC_ALL)];
    const rawDesc =
      descMatches.length === 1
        ? (() => {
            const m = descMatches[0][0].match(RE_CONTENT_ATTR);
            return m ? decodeEntities(m[1] ?? m[2] ?? '').trim() : '';
          })()
        : '';

    check(
      'descriptions',
      descMatches.length === 1 && rawDesc.length > 0,
      `${route}: expected 1 non-empty <meta name="description">, found ${descMatches.length}`
    );

    if (rawDesc) {
      if (templatedScripture) {
        check(
          'descriptions',
          rawDesc.length >= 50 && rawDesc.length <= 170,
          `${route}: templated Scripture description length is ${rawDesc.length} chars (expected 50-170): "${rawDesc}"`
        );
      } else if (!isNonIndexable) {
        if (rawDesc.length < 50 || rawDesc.length > 170) {
          warn(
            'descriptions',
            `${route}: non-Scripture description length is ${rawDesc.length} chars (outside 50-170): "${rawDesc}"`
          );
        } else {
          check('descriptions', true, `${route}: description within 50-170 chars`);
        }
      }

      const badTokenMatch = rawDesc.match(RE_BAD_TOKENS);
      check(
        'descriptions',
        !badTokenMatch,
        `${route}: description contains "${badTokenMatch?.[0]}": "${rawDesc}"`
      );

      const doubledWord = findDoubledWord(rawDesc);
      check(
        'descriptions',
        !doubledWord,
        `${route}: description contains doubled word "${doubledWord}": "${rawDesc}"`
      );

      const mdMatch = rawDesc.match(RE_RAW_MARKDOWN);
      check(
        'descriptions',
        !mdMatch,
        `${route}: description contains raw markdown (${mdMatch?.[0]}): "${rawDesc}"`
      );

      // ── Group: tone (descriptions) ──
      if (isVideoTabRoute(route)) {
        const hasVideoTitle = /starting with\b|["\u201c\u201d]/i.test(rawDesc);
        check(
          'tone',
          !hasVideoTitle,
          `${route}: video-tab description must not contain video titles: "${rawDesc}"`
        );
      }

      // Owner policy (2026-11-06): generic/aggregate pages (verse tabs, hubs) use template
      // copy in our voice; single-item pages (one hadith) may quote that item, so their
      // descriptions are exempt. Text inside curly quotes “…” is a quotation, not our voice.
      const descToneHit = isSingleItemRoute(route) ? null : findToneViolation(stripQuoted(rawDesc));
      check(
        'tone',
        !descToneHit,
        `${route}: description contains banned playbook word "${descToneHit}": "${rawDesc}"`
      );
    }
  }

  // ── Group: h1 ──
  if (!isRedirectStub) {
    const h1Matches = [...html.matchAll(RE_H1_ALL)];
    const h1Text = h1Matches.length === 1 ? stripTags(h1Matches[0][1]) : '';
    check(
      'h1',
      h1Matches.length === 1 && h1Text.length > 0,
      `${route}: expected 1 non-empty <h1>, found ${h1Matches.length}`
    );
  }

  // ── Group: opening & tone (opening lines) ──
  const openingMatch = html.match(RE_OPENING_LINE);
  const openingText = openingMatch ? stripTags(openingMatch[3]) : '';

  if (templatedScripture && !isRedirectStub) {
    check(
      'opening',
      Boolean(openingMatch && openingText.length > 0),
      `${route}: missing or empty .verse-opening-line / .chapter-opening-line / .surah-opening-line`
    );
  }

  if (openingText) {
    const openingToneHit = findToneViolation(stripQuoted(openingText));
    check(
      'tone',
      !openingToneHit,
      `${route}: opening line (.${openingMatch[2]}) contains banned playbook word "${openingToneHit}": "${openingText}"`
    );
  }

  // ── Group: jsonld ──
  const jsonLdMatches = [...html.matchAll(RE_JSONLD_ALL)];
  for (let i = 0; i < jsonLdMatches.length; i += 1) {
    const rawJson = jsonLdMatches[i][1].trim();
    let parsedOk = false;
    let errMsg = '';
    try {
      JSON.parse(rawJson);
      parsedOk = true;
    } catch (err) {
      errMsg = err.message;
    }
    check(
      'jsonld',
      parsedOk,
      `${route}: invalid application/ld+json block #${i + 1}: ${errMsg}`
    );
  }
}

// Check duplicate titles among templated pages
for (const [title, routes] of templatedTitleMap.entries()) {
  if (routes.length > 1) {
    const key = [...routes].sort().join('||');
    if (KNOWN_ALIAS_KEY_SET.has(key)) {
      check('titles', true, `allow-listed alias title "${title}"`);
    } else {
      check(
        'titles',
        false,
        `duplicate templated <title> "${title}" across ${routes.length} pages: ${routes.slice(0, 5).join(', ')}`
      );
    }
  } else {
    check('titles', true, `unique templated title "${title}"`);
  }
}

// ─── 3. Sitemap Verification ────────────────────────────────────────────────

const sitemapFiles = fs
  .readdirSync(DIST)
  .filter((f) => /^sitemap-\d+\.xml$/.test(f))
  .sort();

check(
  'sitemap',
  sitemapFiles.length > 0,
  `dist directory ${DIST} has no sitemap-*.xml files`
);

const RE_URL_BLOCK = /<url>([\s\S]*?)<\/url>/g;
const RE_LOC = /<loc>([\s\S]*?)<\/loc>/;
const RE_LASTMOD = /<lastmod>([\s\S]*?)<\/lastmod>/;

const sitemapRouteSet = new Set();

for (const smFile of sitemapFiles) {
  const xml = fs.readFileSync(path.join(DIST, smFile), 'utf8');
  const urlBlocks = [...xml.matchAll(RE_URL_BLOCK)];
  check('sitemap', urlBlocks.length > 0, `${smFile}: contains 0 <url> entries`);

  for (const match of urlBlocks) {
    const block = match[1];
    const loc = block.match(RE_LOC)?.[1]?.trim() || '';
    const lastmod = block.match(RE_LASTMOD)?.[1]?.trim() || '';

    check('sitemap', loc.startsWith(SITE_ORIGIN), `${smFile}: invalid <loc> "${loc}"`);
    if (!loc.startsWith(SITE_ORIGIN)) continue;

    const rawPath = (() => {
      const p = loc.slice(SITE_ORIGIN.length) || '/';
      try {
        return decodeURIComponent(p);
      } catch {
        return p;
      }
    })();
    const route = rawPath.length > 1 && rawPath.endsWith('/') ? rawPath.slice(0, -1) : rawPath;
    sitemapRouteSet.add(route);

    const meta = pageMetaByRoute.get(route);
    check(
      'sitemap',
      Boolean(meta),
      `${smFile}: <loc> ${loc} (${route}) does not resolve to a built HTML page in dist`
    );

    if (meta) {
      check(
        'sitemap',
        !meta.isNoIndex && !meta.hasMetaRefresh,
        `${smFile}: <loc> ${loc} (${route}) points to a non-indexable page (noindex=${meta.isNoIndex}, metaRefresh=${meta.hasMetaRefresh})`
      );

      check(
        'h1',
        !meta.isRedirectStub,
        `${smFile}: redirect stub ${route} must NOT appear in the sitemap`
      );

      // Canonical of each sitemap page must equal its sitemap <loc>
      // (normalize root trailing slash `https://readyapologia.com/` <-> `https://readyapologia.com`)
      const normCanonical =
        meta.canonical === `${SITE_ORIGIN}/` ? SITE_ORIGIN : meta.canonical;
      const normLoc = loc === `${SITE_ORIGIN}/` ? SITE_ORIGIN : loc;
      check(
        'sitemap',
        normCanonical === normLoc,
        `${route}: <link rel="canonical"> (${meta.canonical}) does not match sitemap <loc> (${loc})`
      );
    }

    if (!lastmod) {
      if (ALLOW_ALL_MISSING_LASTMOD || ALLOW_MISSING_LASTMOD_SET.has(route)) {
        check('sitemap', true, `${route}: missing <lastmod> allow-listed`);
        warn('sitemap', `${route}: <url> in ${smFile} has no <lastmod> (allow-listed)`);
      } else {
        check(
          'sitemap',
          false,
          `${route}: <url> in ${smFile} is missing <lastmod> (add rule in src/utils/sitemap_lastmod.js or pass --allow-missing-lastmod while uncommitted)`
        );
      }
    } else {
      check('sitemap', true, `${route}: has <lastmod>`);
    }
  }
}

// Verify no built redirect stub is in the sitemap
for (const [route, meta] of pageMetaByRoute.entries()) {
  if (meta.isRedirectStub) {
    check(
      'h1',
      !sitemapRouteSet.has(route),
      `redirect stub ${route} appears in sitemap`
    );
  }
}

// ─── 4. Summary Output ──────────────────────────────────────────────────────

const elapsedSec = ((Date.now() - t0) / 1000).toFixed(2);
let totalChecks = 0;
let totalFailures = 0;
let totalWarnings = 0;

console.log(
  `\n=== Ready Apologia SEO & Title Audit (${htmlFiles.length.toLocaleString()} HTML pages in ${path.relative(ROOT, DIST) || '.'}, ${elapsedSec}s) ===`
);

for (const [name, g] of groups.entries()) {
  totalChecks += g.checks;
  totalFailures += g.failures;
  totalWarnings += g.warnings;
  const status = g.failures === 0 ? 'PASS' : 'FAIL';
  const warnSuffix = g.warnings > 0 ? `, ${g.warnings} warning(s)` : '';
  console.log(
    `  [${status}] ${name.padEnd(14)} ${String(g.checks).padStart(7)} checks, ${String(g.failures).padStart(5)} failed${warnSuffix}`
  );
  for (const off of g.offenders) {
    console.log(`         ✗ ${off}`);
  }
  if (g.failures > g.offenders.length) {
    console.log(`         ... and ${g.failures - g.offenders.length} more failure(s) in [${name}]`);
  }
  for (const w of g.warnList) {
    console.log(`         ⚠ ${w}`);
  }
  if (g.warnings > g.warnList.length) {
    console.log(`         ... and ${g.warnings - g.warnList.length} more warning(s) in [${name}]`);
  }
}

console.log(
  `\nTotal: ${totalChecks.toLocaleString()} checks across ${htmlFiles.length.toLocaleString()} pages — ${totalFailures} failure(s), ${totalWarnings} warning(s).\n`
);

if (totalFailures > 0) {
  process.exit(1);
}
