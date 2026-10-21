/**
 * Build-time loader for the Sahih Hadith Explorer.
 *
 * Reads the (read-only) imported data in src/data/hadith/ and produces a memoised view model:
 *   - categories → subcategories → ranked card items (Tier 4 split out)
 *   - per-hadith records for permalink pages and the lazy JSON endpoint
 *   - translation-audit lists grouped by issue type
 *
 * All user-visible numbering uses Sunnah.com canonical references (muslim:3479 → Muslim 1422a).
 * One Sunnah.com entry is one hadith on the site: corpus copies of a combined entry ("Sahih al-Bukhari
 * 299, 300, 301") resolve to the lowest-numbered copy (see groupCombinedEntries).
 *
 * Structure: small pure builders that share one explicit build context (`ctx`), assembled by
 * loadHadithModel(). Data problems never fail the build silently: they are collected in
 * `ctx.diagnostics` and reported once as a single warning summary.
 */
import fs from 'node:fs';
import path from 'node:path';
import { parseMarkdown } from './markdown.js';
import { getHadithPermalink, getHadithSectionUrl } from './urlFactory.js';
import {
  HADITH_TAXONOMY, RESERVED_SLUGS, COLLECTION_NAMES, TRANSLATION_ISSUE_TYPES, SUNNAH_NUMBER_OVERRIDES,
  stripMarkdown, truncate,
} from './hadith_config.js';
import {
  toSunnahNumber, toHadithSlug, getSunnahUrl, findRange, getFringe, splitPhrase, isOmittedRendering,
  INLINE_HADITH_REF, BARE_HADITH_REF, OTHER_COLLECTIONS, OTHER_COLLECTION_REF, CODE_SPAN, ARABIC_SCRIPT,
} from './hadithText.js';

const LOG = '[hadithLoader]';
const DATA_DIR = 'src/data/hadith';
// Links inside cards are prefetched on hover/focus only: viewport prefetching would pull in
// dozens of permalink pages while the reader scrolls a feed (see astro.config.mjs `prefetch`).
const LINK_PREFETCH_ATTR = 'data-astro-prefetch="hover"';

let cachedModel = null;

// ---------- Small helpers ----------
function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), DATA_DIR, file), 'utf8'));
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function createDiagnostics() {
  return {
    missingFulltext: [],
    refsWithoutFulltext: new Set(),
    unanchoredEn: [],
    unanchoredAr: [],
    unanchoredRedline: [],
    missingTerms: [],
    danglingHierarchyIds: [],
    unlisted: [],
    duplicateRefs: [],
    combinedEntries: [],
  };
}

/**
 * Dataset names → reader-facing taxonomy (see HADITH_TAXONOMY). Fails the build on an unmapped or
 * unlabelled name: the dataset's own names are written for a debate, so falling back to them would
 * put that wording in front of readers. Add the new name to hadith_config.js with a neutral label.
 */
function resolveTaxonomy(category, subcategory) {
  const cat = HADITH_TAXONOMY[category];
  const sub = cat?.subcategories?.[subcategory];
  const missing = !cat ? `category "${category}"`
    : !sub ? `subcategory "${subcategory}" (in "${category}")`
    : !cat.label ? `label for category "${category}"`
    : !sub.label ? `label for subcategory "${subcategory}"`
    : null;
  if (missing) throw new Error(`${LOG} Unmapped taxonomy: ${missing}. Add it to HADITH_TAXONOMY in src/utils/hadith_config.js with a neutral label, short and slug.`);
  return {
    catSlug: cat.slug, catLabel: cat.label, catShort: cat.short,
    subSlug: sub.slug, subLabel: sub.label, subShort: sub.short,
  };
}

// ---------- References (numbering, links) ----------
/**
 * Memoised resolver: dataset key ("muslim:3479") → numbering, labels and links.
 * A copy of a combined entry keeps its own number (so "Bukhari 300" still reads as cited) but links
 * where the kept hadith does: its permalink and its Sunnah.com page (a combined entry's later numbers
 * have no page of their own). `canonicalKey` names the kept hadith.
 */
function createRefResolver(ctx) {
  const cache = new Map();
  return function refOf(key) {
    if (cache.has(key)) return cache.get(key);
    const [collection, num] = key.split(':');
    const ft = ctx.fulltext[key];
    const override = SUNNAH_NUMBER_OVERRIDES[key];
    if (!ft) ctx.diagnostics.refsWithoutFulltext.add(key);
    const sunnahNum = override || (ft ? toSunnahNumber(collection, ft.hadithnumber, ft.arabicnumber) : num);
    // Bukhari corpus numbers equal Sunnah.com numbers; Muslim ones need the corpus record (or an override).
    const numberingKnown = Boolean(ft || override) || collection === 'bukhari';
    const canonical = ctx.aliasOf.get(key);
    const target = canonical ? refOf(canonical) : null;
    const inDataset = target ? target.inDataset : ctx.annotatedKeys.has(key);
    const ref = {
      key,
      canonicalKey: target ? target.key : key,
      collection,
      sunnahNum,
      slug: toHadithSlug(collection, sunnahNum),
      displayRef: `${COLLECTION_NAMES[collection] || capitalize(collection)} ${sunnahNum}`,
      shortRef: `${capitalize(collection)} ${sunnahNum}`,
      bookTitle: ft?.bookTitle || '',
      inBook: ft?.book ? `Book ${ft.book}, Hadith ${ft.inBookHadith}` : '',
      sunnahUrl: target ? target.sunnahUrl : numberingKnown ? getSunnahUrl(collection, sunnahNum) : null,
      inDataset,
      permalink: target ? target.permalink : inDataset ? getHadithPermalink(collection, sunnahNum) : null,
      // base-less path for markdown links (markdown.js prefixes the base itself)
      markdownPath: target ? target.markdownPath : inDataset ? `/hadith/${collection}/${sunnahNum}` : null,
    };
    cache.set(key, ref);
    return ref;
  };
}

/**
 * Sunnah.com sometimes publishes one narration under several numbers ("Sahih al-Bukhari 299, 300,
 * 301"); the corpus then holds identical copies, one per number. Each group is shown once, under its
 * lowest-numbered copy — the number Sunnah.com files the entry under — and annotations on the other
 * copies move to it (see buildAllAnnotations). Returns alias → kept key.
 */
function groupCombinedEntries(ctx) {
  const groups = new Map();
  for (const [key, ft] of Object.entries(ctx.fulltext)) {
    const sig = `${key.split(':')[0]}\u0000${ft.english.trim()}\u0000${ft.arabic.trim()}`;
    (groups.get(sig) || groups.set(sig, []).get(sig)).push(key);
  }
  const aliasOf = new Map();
  for (const keys of groups.values()) {
    if (keys.length < 2) continue;
    const [kept, ...copies] = [...keys].sort((a, b) => ctx.fulltext[a].hadithnumber - ctx.fulltext[b].hadithnumber);
    for (const k of copies) {
      aliasOf.set(k, kept);
      if (ctx.dataset[k]) ctx.diagnostics.combinedEntries.push(`${k} → ${kept}`);
    }
  }
  return aliasOf;
}

// Private-use placeholders keep extracted code spans away from the markdown parser.
const SPAN_TOKEN = /\uE000(\d+)\uE001/g;
// Editorial brackets ("the King [Allah] has judged") are parked as \uE002/\uE003: the shared parser's
// lazy link regex would otherwise run from "[Allah" to the next "](url)" and link the whole stretch.
// Only a real link — bracket-free text directly followed by (url) — keeps its brackets.
const LINK_OR_BRACKET = /\[([^[\]\n]+)\]\(([^)\s]+)\)|[[\]]/g;
const protectBrackets = s => s.replace(LINK_OR_BRACKET, (m, text) => (text ? m : m === '[' ? '\uE002' : '\uE003'));
const restoreBrackets = s => s.replace(/\uE002/g, '[').replace(/\uE003/g, ']');
const escapeHtml = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// Literata draws ʿ/ʾ with a half-em advance ("ʿ Umar"); .hx-tl swaps in the Arabic face's tight
// transliteration glyphs. Only text runs are touched (the regex never enters a tag).
const wrapTranslitMarks = html => html.replace(/(^|>)([^<]+)/g, (_, gt, text) => gt + text.replace(/[ʾʿ]+/g, '<span class="hx-tl">$&</span>'));

/**
 * Normalises annotation prose before rendering:
 *   - editorial [brackets] → placeholders (restored after markdown; see protectBrackets)
 *   - `bukhari:123` / bukhari:123 → permalink (or Sunnah.com when not annotated); unknown numbering stays raw
 *   - abudawud:2061 and other non-dataset collections → Sunnah.com
 *   - other `code spans` (quoted Arabic / transliteration) → placeholders, returned in `spans`
 *   - stray backticks (Muhsin Khan's ASCII ʿayn: `Umar, Mu`adh) → ʿ
 * With `plain`, citations become bare labels instead of markdown links.
 */
function prepareProse(ctx, text, { plain = false } = {}) {
  const cite = (label, href, fallback) => (!href ? fallback : plain ? label : `[${label}](${href})`);
  const toRef = (_, key) => { const r = ctx.refOf(key); return cite(r.shortRef, r.markdownPath || r.sunnahUrl, key); };
  const toOther = (_, slug, num) => cite(`${OTHER_COLLECTIONS[slug]} ${num}`, getSunnahUrl(slug, num));
  const spans = [];
  const out = protectBrackets(String(text || ''))
    .replace(INLINE_HADITH_REF, toRef)
    .replace(OTHER_COLLECTION_REF, toOther)
    // A span that cites a hadith is unwrapped so the reference below still gets linked.
    .replace(CODE_SPAN, (_, body) => (/(?:bukhari|muslim):\d/.test(body) ? body : `\uE000${spans.push(body) - 1}\uE001`))
    .replace(BARE_HADITH_REF, toRef)
    .replace(/`/g, 'ʿ');
  return { out, spans };
}

const renderCodeSpan = body => (ARABIC_SCRIPT.test(body)
  ? `<span class="hx-ar-inline" lang="ar" dir="rtl">${escapeHtml(body)}</span>`
  : `<em>${escapeHtml(body)}</em>`);

/** Annotation markdown → HTML (see prepareProse for citations and code spans). */
function renderMarkdown(ctx, text, { inline = false } = {}) {
  if (!text) return '';
  const { out, spans } = prepareProse(ctx, text);
  let html = restoreBrackets(wrapTranslitMarks(parseMarkdown(out).replace(SPAN_TOKEN, (_, i) => renderCodeSpan(spans[i]))))
    .replace(/<a href="/g, `<a ${LINK_PREFETCH_ATTR} href="`);
  if (inline) {
    const single = html.match(/^<p class="response-paragraph">([\s\S]*)<\/p>$/);
    if (single && !single[1].includes('<p')) html = single[1];
  }
  return html;
}

/** Annotation markdown → plain text for meta descriptions, FAQ schema, outline headlines and share text. */
function renderPlainText(ctx, text) {
  const { out, spans } = prepareProse(ctx, text, { plain: true });
  return restoreBrackets(stripMarkdown(out.replace(SPAN_TOKEN, (_, i) => spans[i])));
}

// ---------- Annotation views ----------
/**
 * Maps a translation issue onto the English excerpt as redline ranges:
 * struck published wording + inserted literal wording (or a zero-width insertion for omissions).
 */
function buildRedline(issue, excerptEn) {
  if (isOmittedRendering(issue.published_rendering)) {
    return { anchored: true, ranges: [{ kind: 'ins', start: excerptEn.length, end: excerptEn.length, literal: issue.literal_meaning }] };
  }
  const published = String(issue.published_rendering).trim();
  const pubs = splitPhrase(published);
  const lits = splitPhrase(issue.literal_meaning);
  let pairs = null;
  if (pubs.length === lits.length) pairs = pubs.map((p, i) => [p, lits[i]]);
  else if (pubs.length === 1) pairs = [[pubs[0], issue.literal_meaning]];
  if (!pairs) return { anchored: false, ranges: [] };

  const ranges = [];
  let cursor = 0;
  for (const [p, l] of pairs) {
    const r = findRange(excerptEn, p, { from: cursor });
    if (!r) return { anchored: false, ranges: [] };
    ranges.push({ kind: 'del', start: r[0], end: r[1], literal: l });
    cursor = r[1];
  }
  return { anchored: true, ranges };
}

function findTermRanges(text, terms, window = {}) {
  const ranges = [];
  let cursor = window.from || 0;
  for (const t of terms) {
    const r = findRange(text, t, { arabic: true, from: cursor, to: window.to });
    if (r) {
      ranges.push({ kind: 'term', start: r[0], end: r[1] });
      cursor = r[1];
    }
  }
  return ranges;
}

function buildIssue(ctx, ti) {
  const typeCfg = TRANSLATION_ISSUE_TYPES[ti.type] || TRANSLATION_ISSUE_TYPES.softened;
  return {
    type: ti.type,
    badge: typeCfg.badge,
    arabicTerm: ti.arabic_term || '',
    published: ti.published_rendering || '',
    omitted: isOmittedRendering(ti.published_rendering),
    literal: ti.literal_meaning || '',
    // Explanations cite other hadiths ("muslim:3418"), so they go through the prose pipeline too.
    explanationHtml: renderMarkdown(ctx, ti.explanation, { inline: true }),
  };
}

function buildAnnotation(ctx, key, ann, annIndex) {
  const ft = ctx.fulltext[key];
  const { diagnostics } = ctx;
  const id = `${key}#${annIndex}`;
  const tax = resolveTaxonomy(ann.category, ann.subcategory);
  const excerptEn = ann.problematic_excerpt?.english || '';
  const excerptAr = ann.problematic_excerpt?.arabic || '';
  const rangeEn = findRange(ft.english, excerptEn);
  const rangeAr = findRange(ft.arabic, excerptAr, { arabic: true });
  if (excerptEn && !rangeEn) diagnostics.unanchoredEn.push(id);
  if (excerptAr && !rangeAr) diagnostics.unanchoredAr.push(id);

  let issue = null;
  let redline = null;
  let termRanges = [];
  const full = { marks: { en: rangeEn, ar: rangeAr }, redline: [], terms: [] };

  if (ann.translation_issue) {
    const ti = ann.translation_issue;
    issue = buildIssue(ctx, ti);
    redline = buildRedline(ti, excerptEn);
    if (!redline.anchored) diagnostics.unanchoredRedline.push(id);
    const terms = splitPhrase(ti.arabic_term);
    termRanges = findTermRanges(excerptAr, terms);
    if (termRanges.length < terms.length) diagnostics.missingTerms.push(id);
    if (rangeEn && redline.anchored) {
      full.redline = redline.ranges.map(r => ({ ...r, start: r.start + rangeEn[0], end: r.end + rangeEn[0] }));
    }
    full.terms = findTermRanges(ft.arabic, terms, rangeAr ? { from: rangeAr[0], to: rangeAr[1] } : {});
  }

  const self = ctx.refOf(key);
  // Parallels are shown under the kept copy's number: copies of this hadith drop out, and two copies
  // of one parallel collapse into one.
  const seenParallels = new Set([self.canonicalKey]);
  const parallels = [];
  for (const p of ann.parallel_references || []) {
    if (!ctx.fulltext[p]) continue;
    const r = ctx.refOf(ctx.refOf(p).canonicalKey);
    if (seenParallels.has(r.key)) continue;
    seenParallels.add(r.key);
    parallels.push({ slug: r.slug, shortRef: r.shortRef, displayRef: r.displayRef, sunnahUrl: r.sunnahUrl, permalink: r.permalink });
  }

  return {
    annIndex,
    category: ann.category,
    subcategory: ann.subcategory,
    ...tax,
    sectionHref: getHadithSectionUrl({ category: tax.catSlug, subcategory: tax.subSlug, anchor: self.slug }),
    tier: ann.cuj_tier,
    score: ann.cuj_score,
    noteHtml: renderMarkdown(ctx, ann.note, { inline: true }),
    noteText: renderPlainText(ctx, ann.note),
    defenseHtml: renderMarkdown(ctx, ann.anticipated_defense),
    defenseText: renderPlainText(ctx, ann.anticipated_defense),
    excerpt: { en: excerptEn, ar: excerptAr },
    fringe: { en: getFringe(ft.english, rangeEn), ar: getFringe(ft.arabic, rangeAr) },
    issue,
    redline,
    termRanges,
    parallels,
    full,
  };
}

/**
 * Builds every annotation under its kept hadith. Annotations filed on a copy of a combined entry move
 * to the kept key: one with the same subcategory and excerpt as an existing annotation is merged into
 * it, any other is appended. `ctx.annIdMap` records each moved id ("bukhari:300#0" → "bukhari:299#1")
 * so hierarchy ids can follow.
 */
function buildAllAnnotations(ctx) {
  const byKey = new Map();
  ctx.annIdMap = new Map();
  const aliases = [];
  for (const key of ctx.datasetKeys) {
    if (!ctx.fulltext[key]) {
      ctx.diagnostics.missingFulltext.push(key);
      continue;
    }
    if (ctx.aliasOf.has(key)) aliases.push(key);
    else byKey.set(key, ctx.dataset[key].map((ann, i) => buildAnnotation(ctx, key, ann, i)));
  }
  for (const alias of aliases) {
    const kept = ctx.aliasOf.get(alias);
    if (!byKey.has(kept)) byKey.set(kept, []); // the kept copy may carry no annotations of its own
    const anns = byKey.get(kept);
    ctx.dataset[alias].forEach((raw, i) => {
      const excerpt = raw.problematic_excerpt?.english || '';
      const sameFiling = a => a.category === raw.category && a.subcategory === raw.subcategory;
      let target = anns.find(a => sameFiling(a) && a.excerpt.en === excerpt);
      if (!target) {
        target = buildAnnotation(ctx, kept, raw, anns.length);
        anns.push(target);
      }
      ctx.annIdMap.set(`${alias}#${i}`, `${kept}#${target.annIndex}`);
    });
  }
  return byKey;
}

// ---------- Card items ----------
/** A feed card: only what is visible on first paint; Arabic + defense are fetched lazily. */
function buildCardItem(ctx, key, annIndex) {
  const anns = ctx.annotationsByKey.get(key);
  const ann = anns?.[annIndex];
  if (!ann) return null;
  const ref = ctx.refOf(key);
  const seen = new Set([`${ann.catSlug}/${ann.subSlug}`]);
  const otherFilings = [];
  for (const other of anns) {
    const id = `${other.catSlug}/${other.subSlug}`;
    if (seen.has(id)) continue;
    seen.add(id);
    otherFilings.push({ label: other.subShort, href: other.sectionHref });
  }
  return {
    key,
    id: `${ref.slug}~${ann.annIndex}`,
    slug: ref.slug,
    displayRef: ref.displayRef,
    bookTitle: ref.bookTitle,
    sunnahUrl: ref.sunnahUrl,
    permalink: ref.permalink,
    ann: {
      annIndex: ann.annIndex,
      tier: ann.tier,
      noteHtml: ann.noteHtml,
      headline: truncate(ann.noteText, 120),
      excerptEn: ann.excerpt.en,
      fringeEn: ann.fringe.en,
      issue: ann.issue,
      redline: ann.redline,
      parallels: ann.parallels.map(({ displayRef, ...p }) => p),
    },
    otherFilings,
  };
}

// ---------- Hierarchy ----------
/** Hierarchy id → annotation id under its kept hadith ("muslim:3479" → "muslim:3479#0"; see annIdMap). */
function resolveAnnId(ctx, id) {
  const full = id.includes('#') ? id : `${id}#0`;
  return ctx.annIdMap.get(full) || full;
}

function buildSubcategory(ctx, cat, catTax, sub, usedSubSlugs) {
  const subTax = resolveTaxonomy(cat.category, sub.subcategory);
  if (usedSubSlugs.has(subTax.subSlug)) throw new Error(`${LOG} Duplicate subcategory slug: ${subTax.subSlug}`);
  usedSubSlugs.add(subTax.subSlug);

  const all = [];
  const seen = new Set();
  for (const rawId of sub.ordered_item_ids || []) {
    const id = resolveAnnId(ctx, rawId);
    if (seen.has(id)) continue; // a second copy of a combined entry: the first (best-ranked) listing wins
    seen.add(id);
    const [key, idx] = id.split('#');
    const item = buildCardItem(ctx, key, Number(idx));
    if (item) all.push(item);
    else ctx.diagnostics.danglingHierarchyIds.push(rawId);
  }
  return {
    name: subTax.subLabel, // reader-facing label from HADITH_TAXONOMY, never the dataset name
    slug: subTax.subSlug,
    short: subTax.subShort,
    href: getHadithSectionUrl({ category: catTax.catSlug, subcategory: subTax.subSlug }),
    items: all.filter(i => i.ann.tier !== 4),
    tier4: all.filter(i => i.ann.tier === 4),
    count: all.length,
    orderedKeys: [...new Set(all.map(i => i.key))],
  };
}

function buildCategories(ctx) {
  const usedCatSlugs = new Set();
  return ctx.hierarchy.map(cat => {
    const firstSub = cat.subcategories?.[0]?.subcategory;
    const catTax = resolveTaxonomy(cat.category, firstSub);
    if (RESERVED_SLUGS.has(catTax.catSlug)) throw new Error(`${LOG} Reserved category slug: ${catTax.catSlug}`);
    if (usedCatSlugs.has(catTax.catSlug)) throw new Error(`${LOG} Duplicate category slug: ${catTax.catSlug}`);
    usedCatSlugs.add(catTax.catSlug);

    const usedSubSlugs = new Set();
    const subcategories = (cat.subcategories || []).map(sub => buildSubcategory(ctx, cat, catTax, sub, usedSubSlugs));
    return {
      name: catTax.catLabel, // reader-facing label from HADITH_TAXONOMY, never the dataset name
      slug: catTax.catSlug,
      short: catTax.catShort,
      href: getHadithSectionUrl({ category: catTax.catSlug }),
      subcategories,
      count: subcategories.reduce((n, s) => n + s.count, 0),
    };
  });
}

// ---------- Per-hadith records ----------
function buildRecords(ctx, subByPair) {
  const records = new Map(); // key → record (annotated hadiths only)
  const toNav = k => (k ? { displayRef: ctx.refOf(k).displayRef, permalink: ctx.refOf(k).permalink } : null);
  for (const [key, anns] of ctx.annotationsByKey) {
    const ft = ctx.fulltext[key];
    const primary = subByPair.get(`${anns[0].catSlug}/${anns[0].subSlug}`);
    let prev = null;
    let next = null;
    if (primary) {
      const keys = primary.sub.orderedKeys;
      const i = keys.indexOf(key);
      if (i >= 0) {
        prev = toNav(keys[i - 1]);
        next = toNav(keys[i + 1]);
      }
    }
    records.set(key, {
      ...ctx.refOf(key),
      english: ft.english,
      arabic: ft.arabic,
      annotations: anns,
      primaryCrumb: primary
        ? { catName: primary.cat.name, catShort: primary.cat.short, catHref: primary.cat.href, subName: primary.sub.name, subShort: primary.sub.short, subHref: primary.sub.href }
        : null,
      prev,
      next,
    });
  }
  return records;
}

// ---------- Translation audit ----------
const AUDIT_CONTEXT = 220; // characters of published English kept on each side of the redline

/**
 * The published English around a redline, so an audit row shows the sentence the change sits in
 * rather than a bare phrase. Long excerpts are cut to a window around the changed words (snapped to
 * word boundaries, marked with ellipses) and the redline ranges are shifted to match.
 */
function getRedlineContext(excerpt, redline) {
  if (!redline?.anchored || !redline.ranges.length) return null;
  const first = Math.min(...redline.ranges.map(r => r.start));
  const last = Math.max(...redline.ranges.map(r => r.end));
  let start = Math.max(0, first - AUDIT_CONTEXT);
  let end = Math.min(excerpt.length, last + AUDIT_CONTEXT);
  if (start > 0) {
    const sp = excerpt.indexOf(' ', start);
    if (sp >= 0 && sp < first) start = sp + 1;
  }
  if (end < excerpt.length) {
    const sp = excerpt.lastIndexOf(' ', end);
    if (sp > last) end = sp;
  }
  // Trim via [start, end) before slicing so `shift` stays an exact character-offset invariant.
  while (start < first && /\s/.test(excerpt[start])) start++;
  while (end > last && /\s/.test(excerpt[end - 1])) end--;
  const lead = start > 0 ? '… ' : '';
  const tail = end < excerpt.length ? ' …' : '';
  const text = `${lead}${excerpt.slice(start, end)}${tail}`;
  const shift = lead.length - start;
  return { text, ranges: redline.ranges.map(r => ({ ...r, start: r.start + shift, end: r.end + shift })) };
}

/** The note's first sentence when it is short enough to stand alone, else a word-boundary cut. */
function getAuditHeadline(noteText, max = 320) {
  const first = noteText.split(/(?<=[.!?])\s+(?=[A-Z"'“‘(])/)[0];
  return first.length <= max ? first : truncate(noteText, 220);
}

/**
 * Translation-audit rows grouped by issue type. Each row is self-contained: what the hadith says
 * (headline), the published sentence with the change redlined in place, the Arabic, and the
 * explanation. Rows are ordered by the dataset's importance (tier, then score) so the strongest
 * examples come first.
 */
function buildTranslationAudit(ctx) {
  const byType = Object.fromEntries(Object.keys(TRANSLATION_ISSUE_TYPES).map(t => [t, []]));
  const seen = new Set();
  for (const [key, anns] of ctx.annotationsByKey) {
    for (const ann of anns) {
      if (!ann.issue) continue;
      const { type, badge: _badge, ...issueFields } = ann.issue;
      const dedupe = `${key}|${issueFields.arabicTerm}`;
      if (seen.has(dedupe)) continue;
      seen.add(dedupe);
      const ref = ctx.refOf(key);
      (byType[type] ||= []).push({
        _tier: ann.tier ?? 9,
        _score: ann.score ?? 0,
        row: {
          slug: ref.slug,
          displayRef: ref.displayRef,
          bookTitle: ref.bookTitle,
          sunnahUrl: ref.sunnahUrl,
          permalink: ref.permalink,
          sectionHref: ann.sectionHref,
          subShort: ann.subShort,
          headline: getAuditHeadline(ann.noteText),
          context: getRedlineContext(ann.excerpt.en, ann.redline),
          ...issueFields,
        },
      });
    }
  }
  const byImportance = (a, b) => a._tier - b._tier || b._score - a._score;
  return Object.fromEntries(
    Object.entries(byType).map(([t, list]) => [t, list.sort(byImportance).map(x => x.row)]),
  );
}

// ---------- Lazy JSON payloads ----------
function createPayloads(ctx, subByPair) {
  const slugToKey = new Map();
  for (const key of Object.keys(ctx.fulltext)) {
    if (ctx.aliasOf.has(key)) continue; // copies of a combined entry live on the kept hadith's page
    const slug = ctx.refOf(key).slug;
    const existing = slugToKey.get(slug);
    if (existing) {
      ctx.diagnostics.duplicateRefs.push(`${existing} & ${key} → ${slug}`);
      if (ctx.dataset[existing]) continue; // the annotated hadith keeps the URL
    }
    slugToKey.set(slug, key);
  }

  /** /hadith/data/<slug>.json: full narration + per-annotation highlight ranges and defense. */
  function getHadithJson(slug) {
    const key = slugToKey.get(slug);
    if (!key) return null;
    const ref = ctx.refOf(key);
    const ft = ctx.fulltext[key];
    const anns = ctx.annotationsByKey.get(key) || [];
    return {
      slug: ref.slug,
      displayRef: ref.displayRef,
      bookTitle: ref.bookTitle,
      sunnahUrl: ref.sunnahUrl,
      permalink: ref.permalink,
      english: ft.english,
      arabic: ft.arabic,
      annotations: anns.map(a => ({
        ...a.full,
        defenseHtml: a.defenseHtml,
      })),
    };
  }

  /** /hadith/data/arabic/<cat>--<sub>.json: Arabic excerpt, fringe and term ranges per card id. */
  function getArabicPack(catSlug, subSlug) {
    const pair = subByPair.get(`${catSlug}/${subSlug}`);
    if (!pair) return null;
    const pack = {};
    for (const item of [...pair.sub.items, ...pair.sub.tier4]) {
      const ann = ctx.annotationsByKey.get(item.key)[item.ann.annIndex];
      pack[item.id] = { excerpt: ann.excerpt.ar, fringe: ann.fringe.ar, terms: ann.termRanges };
    }
    return pack;
  }

  return { slugToKey, getHadithJson, getArabicPack };
}

// ---------- Diagnostics ----------
function findUnlisted(ctx) {
  const listed = new Set(ctx.hierarchy.flatMap(c => (c.subcategories || []).flatMap(s => s.ordered_item_ids || []))
    .map(id => resolveAnnId(ctx, id)));
  const unlisted = [];
  for (const [key, anns] of ctx.annotationsByKey) {
    anns.forEach((_, i) => { if (!listed.has(`${key}#${i}`)) unlisted.push(`${key}#${i}`); });
  }
  return unlisted;
}

function reportDiagnostics(ctx, stats) {
  const d = ctx.diagnostics;
  d.unlisted = findUnlisted(ctx);
  const sample = list => {
    const arr = [...list];
    return `${arr.slice(0, 5).join(', ')}${arr.length > 5 ? `, … +${arr.length - 5}` : ''}`;
  };
  const problems = [
    ['hadiths without full text (skipped)', d.missingFulltext],
    ['references without full text (raw numbering)', d.refsWithoutFulltext],
    ['English excerpts not found in full text', d.unanchoredEn],
    ['Arabic excerpts not found in full text', d.unanchoredAr],
    ['translation issues without an inline redline', d.unanchoredRedline],
    ['Arabic terms not found in excerpt', d.missingTerms],
    ['hierarchy ids without an annotation', d.danglingHierarchyIds],
    ['annotations not listed in any subcategory feed', d.unlisted],
    ['corpus records sharing one Sunnah.com number (verify, then add to SUNNAH_NUMBER_OVERRIDES)', d.duplicateRefs],
    ['annotated copies of one Sunnah.com entry (merged here; fold upstream)', d.combinedEntries],
  ].filter(([, list]) => (list.size ?? list.length) > 0);

  const summary = `${LOG} ${stats.hadiths} hadiths, ${stats.annotations} annotations`;
  if (!problems.length) {
    console.info(`${summary}; all excerpts anchored.`);
    return;
  }
  console.warn([summary, ...problems.map(([label, list]) => `  - ${label}: ${list.size ?? list.length} (${sample(list)})`)].join('\n'));
}

// ---------- Public API ----------
export function loadHadithModel() {
  if (cachedModel) return cachedModel;

  const dataset = readJson('master_hadith_dataset.json');
  const ctx = {
    dataset,
    fulltext: readJson('sahih_fulltext.json'),
    hierarchy: dataset.directionToLlm?.cuj_ranked_hierarchy || [],
    datasetKeys: Object.keys(dataset).filter(k => k !== 'directionToLlm'),
    diagnostics: createDiagnostics(),
  };
  ctx.aliasOf = groupCombinedEntries(ctx); // before refOf, which resolves copies through it
  // Hadiths with a page: annotated keys, copies folded into their kept key.
  ctx.annotatedKeys = new Set(ctx.datasetKeys.map(k => ctx.aliasOf.get(k) || k));
  ctx.refOf = createRefResolver(ctx);
  ctx.annotationsByKey = buildAllAnnotations(ctx);

  const categories = buildCategories(ctx);
  const subByPair = new Map();
  for (const c of categories) for (const s of c.subcategories) subByPair.set(`${c.slug}/${s.slug}`, { cat: c, sub: s });

  const records = buildRecords(ctx, subByPair);
  const { slugToKey, getHadithJson, getArabicPack } = createPayloads(ctx, subByPair);
  const stats = {
    hadiths: records.size,
    annotations: [...ctx.annotationsByKey.values()].reduce((n, a) => n + a.length, 0),
  };
  reportDiagnostics(ctx, stats);

  cachedModel = {
    categories,
    records,
    translationIssues: buildTranslationAudit(ctx),
    allSlugs: [...slugToKey.keys()],
    getHadithJson,
    getArabicPack,
    stats,
  };
  return cachedModel;
}
