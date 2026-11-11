/**
 * View-model builder and data-contract validator for /discover/extrabiblical-evidence-for-jesus.
 *
 * Pure, deterministic, zero-DOM module shared by:
 *   - `src/pages/discover/extrabiblical-evidence-for-jesus.astro`
 *   - `src/utils/extrabiblicalEvidence/model.test.mjs`
 *   - `scripts/test_extrabiblical_evidence.mjs`
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import DATA from '../../data/extrabiblical-evidence-for-jesus.json' with { type: 'json' };
import * as C from './config.js';
import { WITNESSES } from './overrides.js';
import { createRenderer, escapeAttr, plainText, linkAttrs, tl } from '../hadithReliability/render.js';
import { verbatimProblem } from '../originsOfRevelation/verbatim.js';

export class EbjModelError extends Error {
  constructor(msg) {
    super(`[extrabiblicalEvidence] ${msg}`);
    this.name = 'EbjModelError';
  }
}

export function fail(msg) {
  throw new EbjModelError(msg);
}

/** Fills `{name}` placeholders; fails on missing template or unknown placeholder. */
export function fill(tpl, vars, where = 'label') {
  if (typeof tpl !== 'string' || !tpl) fail(`${where}: label template is missing`);
  return tpl.replace(/\{(\w+)\}/g, (_, k) =>
    k in vars ? String(vars[k]) : fail(`${where}: unknown placeholder {${k}}`),
  );
}

// ---- closed schema helpers -----------------------------------------------------------------------
function checkKeys(obj, allowed, where) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) fail(`${where}: expected an object`);
  for (const k of Object.keys(obj)) {
    if (!allowed.has(k)) fail(`${where}: unknown field "${k}"`);
  }
}

const TOP_KEYS = new Set(['SEO', 'CATALOG', 'HEADER', 'HERO_WITNESSES', 'LABELS', 'SECTIONS', 'CLOSING']);
const SEO_KEYS = new Set(['title', 'description', 'keywords', 'ogAlt']);
const CATALOG_KEYS = new Set(['title', 'description']);
const HEADER_KEYS = new Set(['eyebrow', 'h1', 'hookMd', 'contextLine', 'framingMd', 'whosWhoSummary', 'whosWhoMd']);
const WITNESS_STRIP_KEYS = new Set(['caption', 'items']);
const WITNESS_ITEM_KEYS = new Set(['name', 'meta', 'position', 'quoteMd', 'glossMd', 'ref']);
const SECTION_KEYS = new Set([
  'id', 'isItem', 'aliases', 'nav', 'h2', 'glance', 'showcase', 'witnesses', 'introMd',
  'groups', 'classicalMd', 'classicalDeeperMd', 'evaluationLabel', 'evaluationMd', 'evaluationDeeperMd', 'deeper',
]);
const GLANCE_KEYS = new Set(['title', 'takeawayMd', 'chips']);
const SHOWCASE_KEYS = new Set(['caption', 'ariaLabel', 'left', 'right', 'noteMd']);
const SIDE_KEYS = new Set(['title', 'items']);
const SIDE_ITEM_KEYS = new Set(['textMd', 'ref']);
const GROUP_KEYS = new Set(['key', 'label', 'witnessIds', 'collapsedIds', 'collapsedSummary']);
const DEEPER_KEYS = new Set(['summary', 'md']);
const CLOSING_KEYS = new Set(['heading', 'md']);
const OVERRIDE_KEYS = new Set([
  'id', 'aliases', 'section', 'group', 'authorKey', 'kind', 'label', 'noteMd',
  'originalScript', 'quote', 'redline', 'chips',
]);
const SCRIPT_KEYS = new Set(['lang', 'dir', 'text']);
const REDLINE_KEYS = new Set(['caption', 'a', 'b', 'noteMd']);
const REDLINE_SIDE_KEYS = new Set(['label', 'ref', 'htmlMd']);
const CHIP_KEYS = new Set(['label', 'href']);

function validateContent(content) {
  checkKeys(content, TOP_KEYS, 'content');
  for (const req of ['SEO', 'CATALOG', 'HEADER', 'LABELS', 'SECTIONS', 'CLOSING']) {
    if (!content[req]) fail(`content.${req} is required`);
  }
  checkKeys(content.SEO, SEO_KEYS, 'SEO');
  checkKeys(content.CATALOG, CATALOG_KEYS, 'CATALOG');
  checkKeys(content.HEADER, HEADER_KEYS, 'HEADER');
  checkKeys(content.CLOSING, CLOSING_KEYS, 'CLOSING');

  const L = content.LABELS;
  if (!L || typeof L !== 'object') fail('LABELS must be an object');
  for (const k of C.REQUIRED_LABELS) {
    if (typeof L[k] !== 'string' || !L[k].trim()) fail(`LABELS.${k} is required`);
  }
  for (const [gk, keys] of Object.entries(C.REQUIRED_LABEL_GROUPS)) {
    if (!L[gk] || typeof L[gk] !== 'object') fail(`LABELS.${gk} is required`);
    for (const sub of keys) {
      if (typeof L[gk][sub] !== 'string' || !L[gk][sub].trim()) {
        fail(`LABELS.${gk}.${sub} is required`);
      }
    }
  }

  if (content.HERO_WITNESSES) {
    checkKeys(content.HERO_WITNESSES, WITNESS_STRIP_KEYS, 'HERO_WITNESSES');
    (content.HERO_WITNESSES.items || []).forEach((it, i) =>
      checkKeys(it, WITNESS_ITEM_KEYS, `HERO_WITNESSES.items[${i}]`),
    );
  }

  if (!Array.isArray(content.SECTIONS) || !content.SECTIONS.length) {
    fail('SECTIONS must be a non-empty array');
  }
  content.SECTIONS.forEach((s, i) => {
    const w = `SECTIONS[${i}] (${s?.id || '?'})`;
    checkKeys(s, SECTION_KEYS, w);
    if (typeof s.isItem !== 'boolean') fail(`${w}: isItem boolean is required`);
    if (s.glance) checkKeys(s.glance, GLANCE_KEYS, `${w}.glance`);
    if (s.showcase) {
      checkKeys(s.showcase, SHOWCASE_KEYS, `${w}.showcase`);
      checkKeys(s.showcase.left, SIDE_KEYS, `${w}.showcase.left`);
      checkKeys(s.showcase.right, SIDE_KEYS, `${w}.showcase.right`);
      (s.showcase.left.items || []).forEach((x, j) => checkKeys(x, SIDE_ITEM_KEYS, `${w}.showcase.left.items[${j}]`));
      (s.showcase.right.items || []).forEach((x, j) => checkKeys(x, SIDE_ITEM_KEYS, `${w}.showcase.right.items[${j}]`));
    }
    if (s.witnesses) {
      checkKeys(s.witnesses, WITNESS_STRIP_KEYS, `${w}.witnesses`);
      (s.witnesses.items || []).forEach((x, j) => checkKeys(x, WITNESS_ITEM_KEYS, `${w}.witnesses.items[${j}]`));
    }
    (s.groups || []).forEach((g, j) => checkKeys(g, GROUP_KEYS, `${w}.groups[${j}]`));
    (s.deeper || []).forEach((d, j) => checkKeys(d, DEEPER_KEYS, `${w}.deeper[${j}]`));
  });
}

function validateWitnesses(witnesses) {
  if (!Array.isArray(witnesses) || !witnesses.length) fail('WITNESSES must be a non-empty array');
  const byId = new Map();
  const allSlugs = new Map();

  witnesses.forEach((w, i) => {
    const loc = `WITNESSES[${i}] (${w?.id || '?'})`;
    checkKeys(w, OVERRIDE_KEYS, loc);
    if (!w.id || typeof w.id !== 'string') fail(`${loc}: id is required`);
    if (byId.has(w.id)) fail(`${loc}: duplicate primary witness id "${w.id}"`);
    if (allSlugs.has(w.id)) fail(`${loc}: slug "${w.id}" already used as an alias on "${allSlugs.get(w.id)}"`);
    byId.set(w.id, w);
    allSlugs.set(w.id, w.id);

    for (const a of w.aliases || []) {
      if (!a || typeof a !== 'string') fail(`${loc}: invalid alias`);
      if (allSlugs.has(a)) fail(`${loc}: duplicate evidence slug "${a}" (already on "${allSlugs.get(a)}")`);
      allSlugs.set(a, w.id);
    }

    if (w.kind && !['quote', 'finding'].includes(w.kind)) {
      fail(`${loc}: kind must be "quote" or "finding" (got "${w.kind}")`);
    }
    if (!w.label || !w.quote) fail(`${loc}: label and quote are required`);
    if (!Array.isArray(w.chips) || !w.chips.length) fail(`${loc}: at least one verification chip is required`);
    w.chips.forEach((ch, j) => checkKeys(ch, CHIP_KEYS, `${loc}.chips[${j}]`));

    if (w.originalScript) {
      checkKeys(w.originalScript, SCRIPT_KEYS, `${loc}.originalScript`);
      if (!w.originalScript.text || !w.originalScript.lang) fail(`${loc}.originalScript: text and lang required`);
    }
    if (w.redline) {
      checkKeys(w.redline, REDLINE_KEYS, `${loc}.redline`);
      checkKeys(w.redline.a, REDLINE_SIDE_KEYS, `${loc}.redline.a`);
      checkKeys(w.redline.b, REDLINE_SIDE_KEYS, `${loc}.redline.b`);
      if (w.redline.a.ref) checkKeys(w.redline.a.ref, CHIP_KEYS, `${loc}.redline.a.ref`);
      if (w.redline.b.ref) checkKeys(w.redline.b.ref, CHIP_KEYS, `${loc}.redline.b.ref`);
    }
  });

  return { byId, allSlugs };
}

// ---- link & reference resolution -----------------------------------------------------------------
const renderer = createRenderer();
const LINK_RE = /\[((?:[^\[\]]|\[[^\[\]]*\])+)\]\(([^)\s]+)\)/g;
const SLOT_RE = /\u0001(\d+)\u0001/g;
const MARK_OPEN = '\u0004';
const MARK_CLOSE = '\u0005';

const NO_PREFETCH = Object.freeze({ 'data-astro-prefetch': 'false' });

const attrString = attrs =>
  Object.entries(attrs)
    .map(([k, v]) => ` ${k}="${escapeAttr(v)}"`)
    .join('');

export function anchorHtml(ref, innerHtml) {
  const cls = ref.external ? 'hrv-link hrv-link--external' : 'hrv-link hrv-link--internal';
  const attrs = ref.attrs ?? linkAttrs({ external: ref.external });
  return `<a class="${cls}" href="${escapeAttr(ref.href)}"${attrString(attrs)}>${innerHtml}</a>`;
}

export function refFromHref(rawHref, label, where = 'link') {
  if (typeof rawHref !== 'string' || !rawHref.trim()) fail(`${where}: empty href`);
  if (/^\/\//.test(rawHref) || /^\/\\/.test(rawHref)) {
    fail(`${where}: protocol-relative link "${rawHref}" is forbidden`);
  }
  if (/^http:\/\//i.test(rawHref)) {
    fail(`${where}: external link "${rawHref}" must use https://`);
  }
  if (/^https:\/\//i.test(rawHref)) {
    let u;
    try {
      u = new URL(rawHref);
    } catch {
      fail(`${where}: malformed URL "${rawHref}"`);
    }
    if (/quran\.com$/i.test(u.hostname)) {
      fail(`${where}: Qurʾān links must use internal tafsir routes, not ${rawHref}`);
    }
    const group = C.HOSTS[u.hostname];
    if (!group) {
      fail(`${where}: external host "${u.hostname}" (${rawHref}) is not in config.HOSTS`);
    }
    const cleanLabel = label || u.hostname;
    return {
      label: cleanLabel,
      href: rawHref,
      external: true,
      attrs: linkAttrs({ external: true }),
      group,
      sortKey: [cleanLabel],
    };
  }

  if (!rawHref.startsWith('/')) {
    fail(`${where}: relative link "${rawHref}" must start with "/" or "#"`);
  }

  // Internal Bible route: /bible/<book>/<ch>(#<v>)
  let m;
  if ((m = rawHref.match(/^\/bible\/([a-z0-9]+)\/(\d+)(?:#(\d+))?$/))) {
    const [, book, ch, v] = m;
    const bookName = C.BIBLE_BOOKS[book];
    if (!bookName) {
      fail(`${where}: unknown or non-sliced Bible book id "${book}" in "${rawHref}"`);
    }
    const autoLabel = `${bookName} ${ch}${v ? `:${v}` : ''}`;
    return {
      label: label || autoLabel,
      href: C.sitePath(rawHref),
      external: false,
      attrs: NO_PREFETCH,
      group: 'scripture',
      sortKey: [0, bookName, Number(ch), Number(v || 0)],
    };
  }
  if (rawHref.startsWith('/bible/')) {
    fail(`${where}: malformed Bible route "${rawHref}" (expected /bible/<book>/<ch>#<v>)`);
  }

  // Internal Qurʾān tafsir route: /quran/<surah>/<ayah>/tafsir/(tabari|ibn_kathir)
  if ((m = rawHref.match(/^\/quran\/(\d+)\/(\d+)\/tafsir\/(tabari|ibn_kathir)$/))) {
    const [, surah, ayah, scholar] = m;
    const scholarName = scholar === 'tabari' ? 'al-Ṭabarī' : 'Ibn Kathīr';
    const autoLabel = `Qurʾān ${surah}:${ayah} (Tafsīr ${scholarName})`;
    return {
      label: label || autoLabel,
      href: C.sitePath(rawHref),
      external: false,
      attrs: NO_PREFETCH,
      group: 'scripture',
      sortKey: [1, Number(surah), Number(ayah), scholar],
    };
  }
  if (rawHref.startsWith('/quran/')) {
    fail(`${where}: Qurʾān verse links must open a tafsir route (/quran/<s>/<a>/tafsir/tabari): "${rawHref}"`);
  }

  // Permitted internal article / evidence routes
  const baseRoute = rawHref.split('#')[0];
  if (C.INTERNAL_ROUTES.has(baseRoute)) {
    return {
      label: label || baseRoute,
      href: C.sitePath(rawHref),
      external: false,
      attrs: {},
      group: null,
      sortKey: [2, label || baseRoute],
    };
  }

  fail(`${where}: unrecognised internal route "${rawHref}"`);
}

function withLinks(src, renderFn, ctx = {}) {
  if (src == null || src === '') return '';
  const slots = [];
  const parked = String(src).replace(LINK_RE, (_, text, href) => {
    const lbl = plainText(text);
    let ref;
    if (href.startsWith('#')) {
      ctx.anchors?.add(href.slice(1));
      ref = { href, external: false };
    } else {
      ref = refFromHref(href, lbl, ctx.where || 'markdown link');
      ctx.inlineRefs?.push(ref);
    }
    return `\u0001${slots.push(anchorHtml(ref, mdInline(text, ctx))) - 1}\u0001`;
  });
  const html = renderFn(parked).replace(SLOT_RE, (_, i) => slots[Number(i)]);
  if (/\]\(/.test(html)) {
    fail(`${ctx.where || 'markdown'}: unparsed markdown link syntax in "${String(src).slice(0, 80)}"`);
  }
  return html;
}

export const mdInline = (s, ctx) => withLinks(s, renderer.inline, ctx);
export const mdBlock = (s, ctx) => withLinks(s, renderer.block, ctx);
export const unlink = html => String(html).replace(/<\/?a\b[^>]*>/g, '');

/** Renders verbatim quotation text (inline emphasis only; links inside quotes remain literal text). */
export function quoteHtml(text) {
  const s = String(text)
    .replace(/\\'/g, "'")
    .replace(/`(?=\p{L})/gu, 'ʿ')
    .replace(/`/g, '\u0002')
    .replace(/\]\(/g, ']\u0003(');
  return renderer.inline(s).replace(/\u0002/g, '`').replace(/\u0003/g, '');
}

/** Renders redline comparison text where `<mark>…</mark>` highlights copyist interpolations. */
function redlineHtml(src) {
  const parked = String(src)
    .replace(/<mark>/g, MARK_OPEN)
    .replace(/<\/mark>/g, MARK_CLOSE);
  return quoteHtml(parked)
    .replaceAll(MARK_OPEN, '<mark>')
    .replaceAll(MARK_CLOSE, '</mark>');
}

// ---- data contract lock --------------------------------------------------------------------------
function resolveDataFilePath() {
  const cwdCandidate = path.resolve(process.cwd(), C.DATA_FILE);
  if (fs.existsSync(cwdCandidate)) return cwdCandidate;
  return fileURLToPath(new URL('../../data/extrabiblical-evidence-for-jesus.json', import.meta.url));
}

function validateDataContract(
  data,
  SECTIONS,
  allSlugs,
  { verifyFileHash = true, expectedDataSha256 = C.EXPECTED_DATA_SHA256 } = {},
) {
  if (verifyFileHash) {
    const rawBytes = fs.readFileSync(resolveDataFilePath());
    const actualSha = crypto.createHash('sha256').update(rawBytes).digest('hex');
    if (actualSha !== expectedDataSha256) {
      fail(`${C.DATA_FILE} SHA-256 mismatch: expected ${expectedDataSha256}, got ${actualSha}`);
    }
  }
  if (!data || !Array.isArray(data.themes)) fail('JSON data missing themes[]');
  const rawEntries = data.themes.flatMap(t => t.evidences || []);
  const jsonThemeIds = data.themes.map(t => t.id);
  const jsonEvidenceIds = [...new Set(rawEntries.map(e => e.id))];

  if (jsonThemeIds.length !== C.EXPECTED_COUNTS.uniqueThemeIds) {
    fail(`data contract: expected ${C.EXPECTED_COUNTS.uniqueThemeIds} theme IDs, got ${jsonThemeIds.length}`);
  }
  if (rawEntries.length !== C.EXPECTED_COUNTS.rawEntries) {
    fail(`data contract: expected ${C.EXPECTED_COUNTS.rawEntries} raw entries in JSON, got ${rawEntries.length}`);
  }
  if (jsonEvidenceIds.length !== C.EXPECTED_COUNTS.uniqueEvidenceIds) {
    fail(`data contract: expected ${C.EXPECTED_COUNTS.uniqueEvidenceIds} unique evidence IDs in JSON, got ${jsonEvidenceIds.length}`);
  }

  // Every JSON theme ID must exist exactly once among section IDs + section aliases.
  const sectionTargets = new Map();
  for (const s of SECTIONS) {
    if (sectionTargets.has(s.id)) fail(`duplicate section id "${s.id}"`);
    sectionTargets.set(s.id, s.id);
    for (const a of s.aliases || []) {
      if (sectionTargets.has(a)) {
        fail(`theme/section alias "#${a}" is emitted more than once (already on "#${sectionTargets.get(a)}")`);
      }
      if (C.LEGACY_THEME_ALIASES[a] !== s.id) {
        fail(`section "${s.id}": alias "${a}" does not match config.LEGACY_THEME_ALIASES`);
      }
      sectionTargets.set(a, s.id);
    }
  }
  for (const [alias, target] of Object.entries(C.LEGACY_THEME_ALIASES)) {
    if (sectionTargets.get(alias) !== target) {
      fail(`legacy theme alias "#${alias}" -> "#${target}" is missing from SECTIONS`);
    }
  }
  for (const tid of jsonThemeIds) {
    if (!sectionTargets.has(tid)) {
      fail(`legacy JSON theme id "#${tid}" is not preserved on any section or section alias`);
    }
  }

  // Every JSON evidence ID must exist in WITNESSES (either primary id or alias), and vice versa.
  const missingFromPage = jsonEvidenceIds.filter(id => !allSlugs.has(id));
  if (missingFromPage.length) {
    fail(`JSON evidence IDs missing from overrides.js: ${missingFromPage.join(', ')}`);
  }
  const unknownInOverrides = [...allSlugs.keys()].filter(id => !jsonEvidenceIds.includes(id));
  if (unknownInOverrides.length) {
    fail(`overrides.js defines slugs absent from JSON: ${unknownInOverrides.join(', ')}`);
  }
}

const chipView = c => ({
  label: c.label,
  href: c.href,
  external: c.external,
  attrs: c.attrs,
  title: c.title,
});

function buildSources(refs, LABELS) {
  const byHref = new Map();
  const labels = new Set();
  for (const r of refs) {
    if (!r?.group || byHref.has(r.href) || labels.has(`${r.group}|${r.label}`)) continue;
    byHref.set(r.href, r);
    labels.add(`${r.group}|${r.label}`);
  }
  const cmp = (a, b) => {
    const x = a.sortKey || [a.label];
    const y = b.sortKey || [b.label];
    for (let i = 0; i < Math.max(x.length, y.length); i++) {
      if (x[i] === y[i]) continue;
      if (typeof x[i] === 'number' && typeof y[i] === 'number') return x[i] - y[i];
      return String(x[i] ?? '').localeCompare(String(y[i] ?? ''));
    }
    return 0;
  };
  return C.SOURCE_GROUPS.map(key => ({
    key,
    label: LABELS.sourcesGroups[key],
    note: LABELS.sourcesGroupNotes?.[key] || null,
    items: [...byHref.values()]
      .filter(r => r.group === key)
      .sort(cmp)
      .map(chipView),
  })).filter(g => g.items.length > 0);
}

// ---- main view-model builder ---------------------------------------------------------------------
export function buildModel(
  content,
  { data = DATA, witnesses = WITNESSES, expectedDataSha256 = C.EXPECTED_DATA_SHA256 } = {},
) {
  validateContent(content);
  const { byId, allSlugs } = validateWitnesses(witnesses);
  const { SEO, CATALOG, HEADER, HERO_WITNESSES = null, LABELS, SECTIONS, CLOSING } = content;

  const secIds = SECTIONS.map(s => s.id);
  if (secIds.join(',') !== C.SECTION_ORDER.join(',')) {
    fail(`SECTIONS ids must be [${C.SECTION_ORDER.join(', ')}] in order (got [${secIds.join(', ')}])`);
  }
  validateDataContract(data, SECTIONS, allSlugs, {
    verifyFileHash: data === DATA,
    expectedDataSha256,
  });

  const anchorsUsed = new Set();
  const inlineRefs = [];
  const md = {
    inline: (s, where) => mdInline(s, { anchors: anchorsUsed, inlineRefs, where }),
    block: (s, where) => mdBlock(s, { anchors: anchorsUsed, inlineRefs, where }),
  };

  let itemCount = 0;
  const sectionNumbers = new Map();
  for (const s of SECTIONS) {
    if (s.isItem) {
      itemCount++;
      sectionNumbers.set(s.id, itemCount);
      if (!s.glance) fail(`numbered section "${s.id}" must define glance`);
    } else if (s.glance) {
      fail(`unnumbered appendix section "${s.id}" must not define a numbered glance row`);
    }
  }
  if (itemCount !== C.EXPECTED_COUNTS.numberedSections) {
    fail(`expected ${C.EXPECTED_COUNTS.numberedSections} numbered sections, got ${itemCount}`);
  }

  // Helper to resolve showcase / hero witness refs (`{ witness: '<id>', label?: '<override>' }` or `{ href, label }`).
  const resolveShowcaseRef = (refSpec, where) => {
    if (!refSpec) return { ref: null, sourceQuote: null };
    if (refSpec.witness) {
      const w = byId.get(refSpec.witness) || fail(`${where}: unknown witness "${refSpec.witness}"`);
      const primaryChip = refFromHref(w.chips[0].href, w.chips[0].label, `${where} -> ${w.id}`);
      return {
        ref: {
          label: refSpec.label || w.chips[0].label.replace(/\s*\([^)]*\)\s*$/, ''),
          href: `#evidence-${w.id}`,
          external: false,
          attrs: {},
          group: null,
        },
        bibRef: primaryChip,
        sourceQuote: w.quote,
      };
    }
    const r = refFromHref(refSpec.href, refSpec.label, where);
    return { ref: r, bibRef: r, sourceQuote: null };
  };

  const placedIds = new Set();
  const excerptChecks = [];
  const allBibRefs = [];

  const buildCard = (wid, { sectionId, groupKey, n, where }) => {
    const w = byId.get(wid) || fail(`${where}: unknown witness id "${wid}"`);
    if (w.section !== sectionId) {
      fail(`${where}: witness "${wid}" declares section "${w.section}" but is placed in "${sectionId}"`);
    }
    if (w.group !== groupKey) {
      fail(`${where}: witness "${wid}" declares group "${w.group}" but is placed in "${groupKey}"`);
    }
    if (placedIds.has(wid)) {
      fail(`${where}: witness "${wid}" is placed more than once`);
    }
    placedIds.add(wid);

    const anchor = `evidence-${w.id}`;
    const aliasAnchors = (w.aliases || []).map(a => `evidence-${a}`);
    const resolvedChips = w.chips.map((ch, ci) =>
      refFromHref(ch.href, ch.label, `${where} (${w.id}).chips[${ci}]`),
    );
    allBibRefs.push(...resolvedChips);

    let redlineView = null;
    if (w.redline) {
      const refA = w.redline.a.ref
        ? refFromHref(w.redline.a.ref.href, w.redline.a.ref.label, `${where} (${w.id}).redline.a`)
        : null;
      const refB = w.redline.b.ref
        ? refFromHref(w.redline.b.ref.href, w.redline.b.ref.label, `${where} (${w.id}).redline.b`)
        : null;
      if (refA) allBibRefs.push(refA);
      if (refB) allBibRefs.push(refB);
      redlineView = {
        caption: w.redline.caption,
        captionHtml: md.inline(w.redline.caption, `${where}.redline.caption`),
        sc: {
          a: {
            label: w.redline.a.label,
            ref: refA ? { ...chipView(refA), label: w.redline.a.label } : null,
            html: redlineHtml(w.redline.a.htmlMd),
          },
          b: {
            label: w.redline.b.label,
            ref: refB ? { ...chipView(refB), label: w.redline.b.label } : null,
            html: redlineHtml(w.redline.b.htmlMd),
          },
          noteHtml: w.redline.noteMd ? md.inline(w.redline.noteMd, `${where}.redline.noteMd`) : '',
        },
      };
    }

    const qHtml = quoteHtml(w.quote);
    return {
      id: w.id,
      anchor,
      aliasAnchors,
      authorKey: w.authorKey,
      kind: w.kind || 'quote',
      emphasis: /<strong>/.test(qHtml),
      e: {
        id: w.id,
        anchor,
        aliasAnchors,
        n,
        kind: w.kind || 'quote',
        labelHtml: md.inline(w.label, `${where} (${w.id}).label`),
        noteHtml: w.noteMd ? md.inline(w.noteMd, `${where} (${w.id}).noteMd`) : '',
        originalScript: w.originalScript || null,
        quoteHtml: qHtml,
        redline: redlineView,
        chips: resolvedChips.map(chipView),
      },
    };
  };

  // Hero witness strip
  let heroWitnesses = null;
  if (HERO_WITNESSES) {
    const items = HERO_WITNESSES.items.map((it, i) => {
      const w = `HERO_WITNESSES.items[${i}]`;
      const { ref, bibRef, sourceQuote } = resolveShowcaseRef(it.ref, w);
      if (bibRef) allBibRefs.push(bibRef);
      if (sourceQuote) excerptChecks.push({ where: w, excerpt: it.quoteMd, sourceQuote });
      anchorsUsed.add(ref?.href?.startsWith('#') ? ref.href.slice(1) : '');
      return {
        name: it.name,
        metaHtml: md.inline(it.meta || '', `${w}.meta`),
        positionHtml: md.inline(it.position || '', `${w}.position`),
        quoteHtml: md.inline(it.quoteMd || '', `${w}.quoteMd`),
        glossHtml: it.glossMd ? md.inline(it.glossMd, `${w}.glossMd`) : '',
        ref: ref && chipView(ref),
      };
    });
    anchorsUsed.delete('');
    heroWitnesses = { caption: HERO_WITNESSES.caption, items };
  }

  const builtSections = SECTIONS.map((s, si) => {
    const where = `SECTIONS[${si}] (${s.id})`;
    let n = 0;
    const groups = (s.groups || []).map((g, gi) => {
      const gw = `${where}.groups[${gi}] (${g.key})`;
      const cards = (g.witnessIds || []).map((wid, ci) =>
        buildCard(wid, { sectionId: s.id, groupKey: g.key, n: ++n, where: `${gw}.witnessIds[${ci}]` }),
      );
      const collapsed = (g.collapsedIds || []).map((wid, ci) =>
        buildCard(wid, { sectionId: s.id, groupKey: g.key, n: null, where: `${gw}.collapsedIds[${ci}]` }),
      );
      return {
        key: g.key,
        labelHtml: md.inline(g.label || '', `${gw}.label`),
        cards,
        collapsed,
        collapsedSummary: collapsed.length ? (g.collapsedSummary || LABELS.deeper) : null,
      };
    });

    const buildSide = (side, sideName) =>
      (side?.items || []).map((it, i) => {
        const sw = `${where}.showcase.${sideName}[${i}]`;
        const { ref, bibRef, sourceQuote } = resolveShowcaseRef(it.ref, sw);
        if (bibRef) allBibRefs.push(bibRef);
        if (sourceQuote) excerptChecks.push({ where: sw, excerpt: it.textMd, sourceQuote });
        if (ref?.href?.startsWith('#')) anchorsUsed.add(ref.href.slice(1));
        return {
          html: md.inline(it.textMd, sw),
          ref: ref && chipView(ref),
        };
      });

    const sc = s.showcase;
    const leftItems = sc ? buildSide(sc.left, 'left') : [];
    const rightItems = sc ? buildSide(sc.right, 'right') : [];

    const pair = (mdText, deeperMd, label, deeperLabel, tag) =>
      mdText
        ? {
            label,
            html: md.block(mdText, `${where}.${tag}Md`),
            deeper: deeperMd
              ? {
                  summary: deeperLabel || LABELS.deeper,
                  html: md.block(deeperMd, `${where}.${tag}DeeperMd`),
                }
              : null,
          }
        : null;

    const caption = sc ? sc.caption || LABELS.sideBySide : '';
    return {
      raw: s,
      cards: groups.flatMap(g => [...g.cards, ...g.collapsed]),
      view: {
        id: s.id,
        n: s.isItem ? sectionNumbers.get(s.id) : null,
        isItem: s.isItem,
        aliases: s.aliases || [],
        nav: s.nav || fail(`${where}: nav missing`),
        h2Html: md.inline(s.h2 || fail(`${where}: h2 missing`), `${where}.h2`),
        glance: s.glance || null,
        showcase: sc
          ? {
              caption,
              captionHtml: md.inline(caption, `${where}.showcase.caption`),
              ariaLabel: sc.ariaLabel || plainText(caption),
              sc: {
                type: 'confrontation',
                left: { titleHtml: md.inline(sc.left.title || '', `${where}.showcase.left`), items: leftItems },
                right: { titleHtml: md.inline(sc.right.title || '', `${where}.showcase.right`), items: rightItems },
                noteHtml: md.inline(sc.noteMd || '', `${where}.showcase.noteMd`),
              },
            }
          : null,
        introHtml: md.inline(s.introMd || '', `${where}.introMd`),
        groups: groups.map(g => ({
          ...g,
          cards: g.cards.map(c => c.e),
          collapsed: g.collapsed.map(c => c.e),
        })),
        classical: pair(s.classicalMd, s.classicalDeeperMd, LABELS.classical, LABELS.classicalDeeper, 'classical'),
        evaluation: pair(s.evaluationMd, s.evaluationDeeperMd, s.evaluationLabel || LABELS.evaluation, LABELS.evaluationDeeper, 'evaluation'),
        deeper: (s.deeper || []).map((d, i) => ({
          summary: d.summary || LABELS.deeper,
          html: md.block(d.md, `${where}.deeper[${i}]`),
        })),
      },
    };
  });

  // Verify every witness in WITNESSES was placed on the page.
  const unplaced = witnesses.map(w => w.id).filter(id => !placedIds.has(id));
  if (unplaced.length) fail(`witnesses in overrides.js not placed in any section: ${unplaced.join(', ')}`);
  if (placedIds.size !== C.EXPECTED_COUNTS.deduplicatedCards) {
    fail(`expected ${C.EXPECTED_COUNTS.deduplicatedCards} deduplicated cards, got ${placedIds.size}`);
  }

  // Verify exact H1 counts (16 literary authors/compilations in Sections 1–4, 10 archaeological finds in Section 5).
  const literaryAuthors = new Set(
    builtSections
      .filter(b => b.raw.isItem && b.raw.id !== 'archaeology')
      .flatMap(b => b.cards.map(c => c.authorKey))
      .filter(Boolean),
  );
  const archSection = builtSections.find(b => b.raw.id === 'archaeology');
  const archaeologyCount = archSection ? archSection.cards.length : 0;

  if (literaryAuthors.size !== C.EXPECTED_COUNTS.literaryAuthors) {
    fail(`expected ${C.EXPECTED_COUNTS.literaryAuthors} literary authors/compilations, got ${literaryAuthors.size}`);
  }
  if (archaeologyCount !== C.EXPECTED_COUNTS.archaeologyFinds) {
    fail(`expected ${C.EXPECTED_COUNTS.archaeologyFinds} archaeological finds, got ${archaeologyCount}`);
  }
  const h1Nums = [...String(HEADER.h1).matchAll(/\b(\d+)\b/g)].map(m => Number(m[1]));
  if (h1Nums[0] !== literaryAuthors.size || h1Nums[1] !== archaeologyCount) {
    fail(
      `HEADER.h1 numbers [${h1Nums.join(', ')}] do not match [literary=${literaryAuthors.size}, archaeology=${archaeologyCount}]`,
    );
  }

  // Verify showcase and hero witness excerpts are verbatim in their target witness quotes.
  const verbatimMisses = [];
  for (const chk of excerptChecks) {
    const miss = verbatimProblem(chk.excerpt, chk.sourceQuote);
    if (miss) {
      verbatimMisses.push(`${chk.where}: “${miss.slice(0, 80)}” is not verbatim in target witness quote`);
    }
  }
  if (verbatimMisses.length) {
    fail(`showcase/witness excerpts not verbatim:\n  - ${verbatimMisses.join('\n  - ')}`);
  }

  // Verify every emitted DOM anchor is globally unique and every in-page `#...` link resolves.
  const emittedIds = [
    C.TOP_ID,
    C.GLANCE_ID,
    C.SOURCES_ID,
    ...SECTIONS.map(s => s.id),
    ...SECTIONS.flatMap(s => s.aliases || []),
    ...builtSections.flatMap(b => b.cards.flatMap(c => [c.anchor, ...c.aliasAnchors])),
  ];
  const seenDomIds = new Set();
  for (const id of emittedIds) {
    if (seenDomIds.has(id)) fail(`duplicate DOM id "#${id}"`);
    seenDomIds.add(id);
  }
  const missingAnchors = [...anchorsUsed].filter(a => !seenDomIds.has(a));
  if (missingAnchors.length) {
    fail(`in-page links point to missing anchors: ${missingAnchors.map(a => `#${a}`).join(', ')}`);
  }

  allBibRefs.push(...inlineRefs);
  const sources = buildSources(allBibRefs, LABELS);
  const sections = builtSections.map(b => b.view);
  const hasEmphasis = builtSections.some(b => b.cards.some(c => c.emphasis));

  const rawTitle = String(SEO.title || fail('SEO.title missing'));
  const titleNoSuffix = rawTitle.endsWith(C.LAYOUT_TITLE_SUFFIX)
    ? rawTitle.slice(0, -C.LAYOUT_TITLE_SUFFIX.length)
    : rawTitle;

  return {
    seo: {
      title: titleNoSuffix,
      description: SEO.description,
      keywords: SEO.keywords || undefined,
      ogAlt: SEO.ogAlt || null,
    },
    catalog: CATALOG,
    header: {
      eyebrow: HEADER.eyebrow,
      h1: HEADER.h1,
      h1Html: md.inline(HEADER.h1, 'HEADER.h1'),
      hookHtml: md.inline(HEADER.hookMd, 'HEADER.hookMd'),
      contextText: plainText(HEADER.contextLine),
      contextHtml: unlink(md.inline(HEADER.contextLine, 'HEADER.contextLine')),
      framingHtml: HEADER.framingMd ? md.block(HEADER.framingMd, 'HEADER.framingMd') : '',
      whosWhoSummary: HEADER.whosWhoSummary || '',
      whosWhoHtml: HEADER.whosWhoMd ? md.block(HEADER.whosWhoMd, 'HEADER.whosWhoMd') : '',
    },
    heroWitnesses,
    labels: LABELS,
    emphasisNote: hasEmphasis ? LABELS.emphasisNote : null,
    nav: [
      ...sections.map(s => ({ id: s.id, n: s.n, label: s.nav, labelHtml: tl(s.nav) })),
      { id: C.SOURCES_ID, n: null, label: LABELS.sourcesNav, labelHtml: tl(LABELS.sourcesNav) },
    ],
    glance: sections
      .filter(s => s.glance)
      .map(s => ({
        id: s.id,
        n: s.n,
        href: `#${s.id}`,
        titleHtml: unlink(md.inline(s.glance.title, `${s.id}.glance.title`)),
        takeawayHtml: unlink(md.inline(s.glance.takeawayMd || '', `${s.id}.glance.takeawayMd`)),
        chips: (s.glance.chips || []).map(String),
      })),
    itemCount,
    literaryAuthorCount: literaryAuthors.size,
    archaeologyCount,
    cardCount: placedIds.size,
    evidenceAnchorCount: allSlugs.size,
    sections,
    sources,
    citations: sources
      .flatMap(g => g.items)
      .map(s => ({
        name: plainText(s.label),
        url: /^https?:/.test(s.href) ? s.href : `${C.SITE_URL}${s.href}`,
      })),
    closing: {
      heading: CLOSING.heading || LABELS.closingHeading,
      html: md.block(CLOSING.md, 'CLOSING.md'),
    },
    emittedIds: seenDomIds,
  };
}

export const loadExtrabiblicalEvidence = (content, opts) => buildModel(content, opts);
