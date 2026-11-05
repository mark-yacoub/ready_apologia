/**
 * View model for /discover/origins-of-revelation.
 *
 * Pure builder: data JSON (read-only, imported so `astro dev` reloads on a data drop) + content.js
 * (copy) + quoteFixes.js (verified render-time fixes) + dataLock.js → everything the page renders.
 * No Astro, no DOM: the page, the unit tests and the static audit all use exactly this output.
 *
 * Steps (each returns values; nothing is shared across steps except their results):
 *   validateContent → resolveData (lock + fixes) → validateStructure → buildSections →
 *   checkPlacements → checkExcerpts → checkAnchors → buildSources → header / glance / nav
 *
 * Fails the build (throws OrvModelError) on anything a reader would see wrong: an unknown content
 * field, a missing label, data that changed since the copy was reviewed, a stale fix, a card pointing
 * at missing data, a data quote placed 0 or 2+ times (unless listed in REPEATS), a showcase or witness
 * excerpt that is not verbatim in the quotation it cites, a wrong section id / dataItemId / alias, an
 * unknown or unused EXTRA_QUOTES key, a scripture EXTRA_QUOTES whose label/href disagree with its
 * source, an in-page link to a missing anchor, and every link-policy failure from refs.js.
 */

import DATA from '../../data/discover/islam/scripture/demonic_revelation.json' with { type: 'json' };
import * as C from './config.js';
import { QUOTE_FIXES } from './quoteFixes.js';
import { DATA_LOCK } from './dataLock.js';
import { fail, refFromData, refFromHref, routeForSource, isHadithLabel, OrvModelError } from './refs.js';
import { mdInline, mdBlock, quoteHtml, unlink, anchorHtml, unescapeQuote } from './markdown.js';
import { resolveData, posKey } from './fixes.js';
import { verbatimProblem } from './verbatim.js';
import { validateContent } from './contract.js';
import { tl, plainText } from '../hadithReliability/render.js';

export { OrvModelError, quoteHtml, unescapeQuote, resolveData };

/** Fills `{name}` placeholders; a missing template or an unknown placeholder fails. */
export function fill(tpl, vars, where = 'label') {
  if (typeof tpl !== 'string' || !tpl) fail(`${where}: label template is missing`);
  return tpl.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : fail(`${where}: unknown placeholder {${k}}`)));
}

// ---- structure -----------------------------------------------------------------------------------
function validateStructure(SECTIONS, items) {
  const ids = SECTIONS.map(s => s.id);
  if (ids.join(',') !== C.SECTION_ORDER.join(',')) fail(`SECTIONS ids must be [${C.SECTION_ORDER.join(', ')}] in that order (got [${ids.join(', ')}])`);
  const aliasSeen = new Set();
  let itemNo = 0;
  const numbers = new Map();
  for (const s of SECTIONS) {
    if (s.dataItemId != null) {
      if (!items.has(s.dataItemId)) fail(`section "${s.id}": dataItemId "${s.dataItemId}" is not a data item`);
      if (C.OLD_IDS[s.dataItemId] !== s.id) fail(`section "${s.id}": dataItemId "${s.dataItemId}" belongs to section "${C.OLD_IDS[s.dataItemId]}"`);
      itemNo++;
      if (s.number != null && s.number !== itemNo) fail(`section "${s.id}": number ${s.number} but it is account ${itemNo}`);
      numbers.set(s.id, itemNo);
    }
    for (const a of s.aliases || []) {
      if (C.OLD_IDS[a] !== s.id) fail(`section "${s.id}": alias "${a}" ${C.OLD_IDS[a] ? `belongs to "${C.OLD_IDS[a]}"` : 'is not an old section id'}`);
      aliasSeen.add(a);
    }
  }
  for (const old of Object.keys(C.OLD_IDS)) if (!aliasSeen.has(old)) fail(`old id "#${old}" has no alias anchor (add it to SECTIONS[…].aliases)`);
  for (const id of items.keys()) if (!SECTIONS.some(s => s.dataItemId === id)) fail(`data item "${id}" is not shown by any section`);
  return { itemCount: itemNo, numbers };
}

// ---- references ----------------------------------------------------------------------------------
function makeResolver({ positions, items, EXTRA_QUOTES, LABELS }) {
  const positionOf = (d, where) => {
    if (!items.has(d.itemId)) fail(`${where}: data item "${d.itemId}" does not exist`);
    return positions.get(posKey(d.itemId, d.group, d.index)) || fail(`${where}: ${posKey(d.itemId, d.group, d.index)} does not exist`);
  };
  const extraOf = (key, where) => EXTRA_QUOTES[key] || fail(`${where}: unknown EXTRA_QUOTES key "${key}"`);
  /** The chip of a data position (a fix's display label names the chip after its last " — "). */
  const dataRef = (p, where) => {
    const r = refFromData(p.reference, where);
    return p.fixed?.displayLabel ? { ...r, label: p.fixed.displayLabel.split(' — ').pop() } : r;
  };
  const extraRef = (key, where) => {
    const x = extraOf(key, where);
    const r = refFromHref(x.href, x.label || null, `${where} → EXTRA_QUOTES["${key}"]`);
    const route = x.sourceFile && x.sourceFile !== 'external' ? routeForSource(x.sourceFile, x.sourceKey) : null;
    if (route) {
      if (route.href !== r.href) fail(`EXTRA_QUOTES["${key}"]: href ${x.href} disagrees with its source ${x.sourceFile} @ ${x.sourceKey} (${route.href})`);
      if (route.kind === 'bible' && x.label && x.label !== route.label) fail(`EXTRA_QUOTES["${key}"]: label "${x.label}" disagrees with its source (${route.label})`);
    }
    return r;
  };
  const resolveRef = (r, where) => {
    let ref;
    if (r.data) ref = dataRef(positionOf(r.data, where), where);
    else if (r.extra) ref = extraRef(r.extra, where);
    else ref = refFromHref(r.href, r.label || null, where);
    if (r.label) ref = { ...ref, label: r.label };
    if (isHadithLabel(ref.label) && !/^https:\/\/sunnah\.com\//.test(ref.href) && ref.kind !== 'hadith-internal') fail(`${where}: hadith reference "${ref.label}" must link to Sunnah.com`);
    return ref;
  };
  /** Text a reference quotes (for the excerpt check); null for free-form hrefs. */
  const textOf = r => (r?.data ? unescapeQuote(positionOf(r.data, 'excerpt').quote) : r?.extra ? extraOf(r.extra, 'excerpt').text : null);
  const internalHadith = ref => {
    const h = ref.hadith;
    if (!h || !C.INTERNAL_HADITH.has(`${h.collection}:${h.num}`)) return null;
    return { kind: 'hadith-internal', label: fill(LABELS.internalHadith, { ref: C.hadithShortName(h.collection, h.num) }, 'LABELS.internalHadith'), href: C.hadithHref(h.collection, h.num), external: false, attrs: {}, group: null };
  };
  return { positionOf, extraOf, dataRef, extraRef, resolveRef, textOf, internalHadith };
}

const chip = c => ({ label: c.label, href: c.href, external: c.external, attrs: c.attrs, title: c.title });

// ---- sections ------------------------------------------------------------------------------------
/** One quotation card → { e (template view), posKey, sources, extraKey, emphasis, anchor }. */
function buildCard(card, { sectionId, n, where, R, md }) {
  let text, arabic = null, lang = null, primary, cardLabel = null, pk = null, extraKey = null, anchor;
  if (card.data) {
    const p = R.positionOf(card.data, where);
    pk = posKey(p.itemId, p.group, p.index);
    text = p.quote;
    primary = R.dataRef(p, where);
    cardLabel = p.fixed?.displayLabel || null;
    anchor = `${sectionId}-${C.GROUP_TAG[p.group]}-${p.index}`;
  } else {
    extraKey = card.extra;
    const x = R.extraOf(extraKey, where);
    text = x.text; arabic = x.arabic || null; lang = x.lang || null;
    primary = R.extraRef(extraKey, where);
    anchor = `${sectionId}-${extraKey}`;
  }
  const qHtml = quoteHtml(text);
  const extraChips = (card.chips || []).map((r, i) => R.resolveRef(r, `${where}.chips[${i}]`));
  const internal = R.internalHadith(primary);
  const chips = [primary, ...(internal ? [internal] : []), ...extraChips];
  const label = card.label || cardLabel || primary.label;
  return {
    posKey: pk, extraKey, anchor, emphasis: /<strong>/.test(qHtml),
    chipExtras: (card.chips || []).filter(r => r.extra).map(r => r.extra),
    sources: [primary, ...extraChips],
    e: {
      anchor, n,
      labelHtml: md.inline(label, `${where}.label`),
      noteHtml: card.noteMd ? md.inline(card.noteMd, `${where}.noteMd`) : '',
      quote: arabic
        ? { arabic, englishHtml: qHtml }
        : { html: qHtml, lang: lang === 'ar' ? 'ar' : null },
      chips: chips.map(chip),
      repeatHtml: '',
    },
  };
}

function buildSection(s, si, { R, LABELS, numbers, md }) {
  const where = `SECTIONS[${si}] (${s.id})`;
  const isItem = s.dataItemId != null;
  let n = 0; // open cards only, so the visible numbering never skips cards inside a closed <details>
  const groups = (s.groups || []).map((g, gi) => {
    const w = `${where}.groups[${gi}] (${g.key})`;
    const cards = (g.cards || []).map((c, ci) => buildCard(c, { sectionId: s.id, n: ++n, where: `${w}.cards[${ci}]`, R, md }));
    const collapsed = (g.collapsed || []).map((c, ci) => buildCard(c, { sectionId: s.id, n: null, where: `${w}.collapsed[${ci}]`, R, md }));
    const summary = collapsed.length
      ? (g.collapsedSummary || fill(LABELS.moreParallels, { n: collapsed.length, refs: collapsed.map(c => plainText(c.e.chips[0].label)).join(', ') }, 'LABELS.moreParallels'))
      : null;
    return { key: g.key, labelHtml: md.inline(g.label || '', `${w}.label`), cards, collapsed, collapsedSummary: summary };
  });
  const sideItems = (side, name) => (side?.items || []).map((it, i) => {
    const w = `${where}.showcase.${name}[${i}]`;
    const ref = it.ref ? R.resolveRef(it.ref, w) : null;
    return { view: { html: md.inline(it.textMd, w), ref: ref && chip(ref) }, ref, src: it.ref, text: it.textMd, where: w };
  });
  const sc = s.showcase;
  const left = sc ? sideItems(sc.left, 'left') : [];
  const right = sc ? sideItems(sc.right, 'right') : [];
  const wit = (s.witnesses?.items || []).map((x, i) => {
    const w = `${where}.witnesses[${i}]`;
    const ref = x.ref ? R.resolveRef(x.ref, w) : null;
    // The copy owns its quotation marks (“…” or «…»); none are added here.
    return { view: { name: x.name, metaHtml: md.inline(x.meta || '', w), positionHtml: md.inline(x.position || '', w), quoteHtml: md.inline(x.quoteMd || '', w), glossHtml: x.glossMd ? md.inline(x.glossMd, `${w}.glossMd`) : '', ref: ref && chip(ref) }, ref, src: x.ref, text: x.quoteMd, where: w };
  });
  const caption = sc ? (sc.caption || LABELS.sideBySide) : '';
  const pair = (mdText, deeperMd, label, deeperLabel, tag) => (mdText ? {
    label, html: md.block(mdText, `${where}.${tag}Md`),
    deeper: deeperMd ? { summary: deeperLabel || LABELS.deeper, html: md.block(deeperMd, `${where}.${tag}DeeperMd`) } : null,
  } : null);
  return {
    view: {
      id: s.id,
      n: isItem ? numbers.get(s.id) : null,
      isItem,
      aliases: s.aliases || [],
      nav: s.nav || fail(`${where}: nav label missing`),
      h2Html: md.inline(s.h2 || fail(`${where}: h2 missing`), `${where}.h2`),
      glance: s.glance || null,
      showcase: sc ? {
        caption, captionHtml: md.inline(caption, `${where}.showcase.caption`), ariaLabel: sc.ariaLabel || plainText(caption),
        sc: { type: 'confrontation', left: { titleHtml: md.inline(sc.left?.title || '', where), items: left.map(x => x.view) }, right: { titleHtml: md.inline(sc.right?.title || '', where), items: right.map(x => x.view) }, noteHtml: md.inline(sc.noteMd || '', `${where}.showcase.noteMd`) },
      } : null,
      witnesses: s.witnesses ? { caption: s.witnesses.caption || '', items: wit.map(x => x.view) } : null,
      introHtml: md.inline(s.introMd || '', `${where}.introMd`),
      groups,
      classical: pair(s.classicalMd, s.classicalDeeperMd, LABELS.classical, LABELS.classicalDeeper, 'classical'),
      evaluation: pair(s.evaluationMd, s.evaluationDeeperMd, LABELS.evaluation, LABELS.evaluationDeeper, 'evaluation'),
      deeper: (s.deeper || []).map((d, i) => ({ summary: d.summary || LABELS.deeper, html: md.block(d.md, `${where}.deeper[${i}]`) })),
    },
    cards: groups.flatMap(g => [...g.cards, ...g.collapsed]),
    excerpts: [...left, ...right, ...wit],
  };
}

// ---- checks --------------------------------------------------------------------------------------
/** Every data quote placed exactly once, or exactly in the sections REPEATS lists. Returns repeat links. */
function checkPlacements(built, positions, REPEATS, LABELS, numbers) {
  const placed = new Map();
  for (const b of built) for (const c of b.cards) if (c.posKey) {
    if (!placed.has(c.posKey)) placed.set(c.posKey, []);
    placed.get(c.posKey).push({ sectionId: b.view.id, card: c });
  }
  const repeats = new Map(REPEATS.map(r => [posKey(r.itemId, r.group, r.index), r.sections]));
  for (const [k, sections] of repeats) {
    if (!positions.has(k)) fail(`REPEATS: ${k} does not exist`);
    if (!(sections?.length >= 2)) fail(`REPEATS ${k}: list at least two sections`);
  }
  for (const k of positions.keys()) {
    const got = placed.get(k) || [];
    const listed = repeats.get(k);
    if (listed) {
      if (got.map(p => p.sectionId).sort().join(',') !== [...listed].sort().join(',')) fail(`data quote ${k} is listed in REPEATS for [${listed}] but placed in [${got.map(p => p.sectionId)}]`);
      const [first, ...rest] = got;
      const firstNo = numbers.get(first.sectionId) ?? C.SECTION_ORDER.indexOf(first.sectionId) + 1;
      for (const r of rest) r.card.e.repeatHtml = anchorHtml({ href: `#${first.card.anchor}`, external: false }, tl(fill(LABELS.repeatNote, { n: firstNo }, 'LABELS.repeatNote')));
    } else if (got.length !== 1) {
      fail(got.length ? `data quote ${k} is placed ${got.length} times (${got.map(p => p.sectionId)}); list it in REPEATS or remove the duplicate` : `data quote ${k} is not placed on the page (no data quote may be dropped)`);
    }
  }
  return placed;
}

/** Showcase and witness excerpts must be verbatim in the quotation they cite. */
function checkExcerpts(built, R) {
  const problems = [];
  for (const b of built) for (const x of b.excerpts) {
    const src = R.textOf(x.src);
    if (src == null || !x.text) continue;
    const miss = verbatimProblem(x.text, src);
    if (miss) problems.push(`${x.where}: “${miss.slice(0, 80)}” is not in the quotation it cites`);
  }
  if (problems.length) fail(`excerpts not verbatim:\n  - ${problems.join('\n  - ')}`);
}

// ---- sources -------------------------------------------------------------------------------------
function buildSources(refs, LABELS) {
  const byHref = new Map();
  const labels = new Set();
  for (const r of refs) {
    if (!r?.group || byHref.has(r.href) || labels.has(`${r.group}|${r.label}`)) continue;
    byHref.set(r.href, r);
    labels.add(`${r.group}|${r.label}`);
  }
  const cmp = (a, b) => {
    const x = a.sortKey || [], y = b.sortKey || [];
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
    items: [...byHref.values()].filter(r => r.group === key).sort(cmp).map(chip),
  })).filter(g => g.items.length);
}

// ---- builder -------------------------------------------------------------------------------------
/**
 * @param {object} content  the content.js module namespace
 * @param {{ data?: object, fixes?: object[], lock?: object|null }} [opts]  `lock: null` skips the lock
 */
export function buildModel(content, { data = DATA, fixes = QUOTE_FIXES, lock = DATA_LOCK } = {}) {
  validateContent(content);
  const { SEO, HEADER, LABELS, SECTIONS, EXTRA_QUOTES = {}, CLOSING, REPEATS = [] } = content;
  const { items, positions } = resolveData(data, fixes, lock);
  const { itemCount, numbers } = validateStructure(SECTIONS, items);
  const R = makeResolver({ positions, items, EXTRA_QUOTES, LABELS });

  const anchorsUsed = new Set();
  const md = {
    inline: (s, where) => mdInline(s, { anchors: anchorsUsed, where }),
    block: (s, where) => mdBlock(s, { anchors: anchorsUsed, where }),
  };
  const built = SECTIONS.map((s, si) => buildSection(s, si, { R, LABELS, numbers, md }));
  checkPlacements(built, positions, REPEATS, LABELS, numbers);
  checkExcerpts(built, R);

  // EXTRA_QUOTES: every key used (as a card, a chip, a showcase or witness reference).
  const used = new Set([
    ...built.flatMap(b => b.cards.flatMap(c => [c.extraKey, ...c.chipExtras])),
    ...built.flatMap(b => b.excerpts.map(x => x.src?.extra)),
  ].filter(Boolean));
  const unused = Object.keys(EXTRA_QUOTES).filter(k => !used.has(k));
  if (unused.length) fail(`EXTRA_QUOTES not used on the page: ${unused.join(', ')}`);

  // Card anchors are unique; every in-page link points at an id that exists.
  const cardAnchors = built.flatMap(b => b.cards.map(c => c.anchor));
  const dup = cardAnchors.find((a, i) => cardAnchors.indexOf(a) !== i);
  if (dup) fail(`duplicate card anchor "${dup}"`);
  const ids = new Set([C.TOP_ID, C.GLANCE_ID, C.SOURCES_ID, ...SECTIONS.map(s => s.id), ...SECTIONS.flatMap(s => s.aliases || []), ...cardAnchors]);
  const missing = [...anchorsUsed].filter(a => !ids.has(a));
  if (missing.length) fail(`in-page links to missing anchors: ${missing.map(a => `#${a}`).join(', ')}`);

  const sources = buildSources(built.flatMap(b => [...b.cards.flatMap(c => c.sources), ...b.excerpts.map(x => x.ref)]), LABELS);
  const sections = built.map(b => b.view);
  for (const s of sections) for (const g of s.groups) { g.cards = g.cards.map(c => c.e); g.collapsed = g.collapsed.map(c => c.e); }

  const title = String(SEO.title || fail('SEO.title missing'));
  const titleNoSuffix = title.endsWith(C.LAYOUT_TITLE_SUFFIX) ? title.slice(0, -C.LAYOUT_TITLE_SUFFIX.length) : title;
  const hasEmphasis = built.some(b => b.cards.some(c => c.emphasis));

  return {
    seo: { title: titleNoSuffix, description: SEO.description, keywords: SEO.keywords || undefined, ogAlt: SEO.ogAlt || null },
    header: {
      eyebrow: HEADER.eyebrow,
      h1: HEADER.h1,
      h1Html: md.inline(HEADER.h1, 'HEADER.h1'),
      hookHtml: md.inline(HEADER.hookMd, 'HEADER.hookMd'),
      // Rendered inside the "→ sources" link, so links in the copy are flattened.
      contextHtml: unlink(md.inline(HEADER.contextLine, 'HEADER.contextLine')),
      framingHtml: md.inline(HEADER.framingMd || '', 'HEADER.framingMd'),
      whosWhoSummary: HEADER.whosWhoSummary || '',
      whosWhoHtml: HEADER.whosWhoMd ? md.inline(HEADER.whosWhoMd, 'HEADER.whosWhoMd') : '',
    },
    labels: LABELS,
    coldContext: fill(LABELS.coldContext, { n: itemCount }, 'LABELS.coldContext'),
    emphasisNote: hasEmphasis ? LABELS.emphasisNote : null,
    nav: [
      ...sections.map(s => ({ id: s.id, n: s.n, label: s.nav, labelHtml: tl(s.nav) })),
      { id: C.SOURCES_ID, n: null, label: LABELS.sourcesNav, labelHtml: tl(LABELS.sourcesNav) },
    ],
    glance: sections.filter(s => s.glance).map(s => ({
      id: s.id, n: s.n, href: `#${s.id}`,
      // The whole row is a link, so links inside the copy are flattened (no nested anchors).
      titleHtml: unlink(md.inline(s.glance.title, `${s.id}.glance.title`)),
      takeawayHtml: unlink(md.inline(s.glance.takeawayMd || '', `${s.id}.glance.takeawayMd`)),
      chips: (s.glance.chips || []).map(String),
    })),
    itemCount,
    sections,
    sources,
    citations: sources.flatMap(g => g.items).map(s => ({ name: plainText(s.label), url: /^https?:/.test(s.href) ? s.href : `${C.SITE_URL}${s.href}` })),
    closing: { heading: CLOSING.heading || LABELS.closingHeading, html: md.block(CLOSING.md, 'CLOSING.md') },
    positions,
  };
}

let cache = null;
let cacheFor = null;
/** Memoised model for the page (one build, one content module). */
export function loadOriginsOfRevelation(content) {
  if (cache && cacheFor === content) return cache;
  cache = buildModel(content);
  cacheFor = content;
  return cache;
}
