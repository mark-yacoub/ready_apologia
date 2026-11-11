/**
 * Pure view-model builder for /discover/trustworthiness-of-the-bible.
 *
 * Reads src/data/trustworthiness-of-the-bible.json read-only, verifies the 12-theme / 92-item data
 * contract, merges verified scholarly records from overrides.js + copy from content.js, validates
 * every internal (/bible, /quran) and external (config.HOSTS) URL, enforces 100% unique DOM IDs
 * across all sections, themes, legacy aliases, and 96 cataloged items, and builds grouped sources
 * and JSON-LD citations.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import RAW_DATA from '../../data/trustworthiness-of-the-bible.json' with { type: 'json' };
import * as C from './config.js';
import * as O from './overrides.js';
import { createRenderer, escapeAttr, tl, plainText } from '../hadithReliability/render.js';
import { MD_LINK_URL_SOURCE } from '../markdown.js';

const sharedRenderer = createRenderer();
const MD_LINK = new RegExp(String.raw`\[((?:[^\[\]]|\[[^\[\]]*\])+)\]\((${MD_LINK_URL_SOURCE})\)`, 'g');
const LINK_SLOT = /\u0001(\d+)\u0001/g;
const ALEPH_STAR_SLOT = '\u0003ALEPHSTAR\u0003';
const NO_PREFETCH = Object.freeze({ 'data-astro-prefetch': 'false' });
const unlink = html => String(html).replace(/<\/?a\b[^>]*>/g, '');
const attrString = attrs =>
  Object.entries(attrs || {})
    .map(([k, v]) => ` ${k}="${escapeAttr(v)}"`)
    .join('');

export class TwbModelError extends Error {
  constructor(msg) {
    super(`[trustworthinessBible] ${msg}`);
    this.name = 'TwbModelError';
  }
}

export function fail(msg) {
  throw new TwbModelError(msg);
}

/** Fills `{key}` placeholders cleanly; unknown or missing templates throw TwbModelError. */
export function fill(tpl, vars, where = 'label') {
  if (typeof tpl !== 'string' || !tpl) fail(`${where}: label template is missing`);
  return tpl.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : fail(`${where}: unknown placeholder {${k}}`)));
}

/**
 * Validates and normalizes an internal or external link, returning `{ href, external, attrs, group }`.
 */
export function resolveLink(rawHref, where) {
  if (typeof rawHref !== 'string' || !rawHref.trim()) fail(`${where}: empty href`);
  const h = rawHref.trim();
  if (/^\/\//.test(h) || /^\/\\/.test(h)) fail(`${where}: protocol-relative link "${h}" is forbidden`);
  if (/\s/.test(h)) fail(`${where}: whitespace inside URL "${h}" is forbidden`);

  if (h.startsWith('#')) {
    return { href: h, external: false, attrs: {}, group: null, isHash: true };
  }

  if (/^https?:\/\//i.test(h)) {
    if (!/^https:\/\//.test(h)) fail(`${where}: external link must use https: "${h}"`);
    let url;
    try { url = new URL(h); } catch { fail(`${where}: invalid URL "${h}"`); }
    if (/quran\.com\/\d/.test(h)) fail(`${where}: Qurʾān links must use internal tafsir routes: "${h}"`);
    const group = C.HOSTS[url.hostname];
    if (!group) fail(`${where}: host "${url.hostname}" (${h}) is not registered in config.HOSTS`);
    return {
      href: h,
      external: true,
      attrs: { target: '_blank', rel: 'noopener noreferrer' },
      group,
      isHash: false,
    };
  }

  if (!h.startsWith('/')) fail(`${where}: relative link "${h}" must start with "/" or "https://"`);
  const rel = h.startsWith(`${C.BASE}/`) && C.BASE ? h.slice(C.BASE.length) : h;
  const full = C.sitePath(rel);

  let m;
  if ((m = rel.match(/^\/bible\/([a-z0-9]+)\/(\d+)(?:#(\d+)|\/(\d+)\/manuscripts)?$/))) {
    if (!C.VALID_BOOKS.has(m[1])) fail(`${where}: invalid Bible book code "${m[1]}" in "${h}"`);
    return { href: full, external: false, attrs: NO_PREFETCH, group: 'scripture', isHash: false };
  }
  if ((m = rel.match(/^\/quran\/(\d+)\/(\d+)\/tafsir\/(tabari|ibn_kathir)$/))) {
    const s = Number(m[1]);
    if (s < 1 || s > 114) fail(`${where}: invalid surah ${s} in "${h}"`);
    return { href: full, external: false, attrs: NO_PREFETCH, group: 'scripture', isHash: false };
  }
  fail(`${where}: unsupported internal route "${h}"`);
}

/**
 * Deterministic inline/block markdown built on shared `hadithReliability/render.js` (`createRenderer`):
 * validates every `[label](href)` link via `resolveLink`, collects external/internal sources and
 * `#hash` targets, renders nested `**bold *italic***`, backtick spans, Arabic script runs, and
 * transliteration marks (`ʾ`/`ʿ`) with zero double-escaping.
 */
function withValidatedLinks(src, renderFn, where, collectedSources, hashRefs) {
  if (typeof src !== 'string') fail(`${where}: expected markdown string`);
  if (!src) return '';
  const slots = [];
  const parked = src.replace(MD_LINK, (_, rawLabel, rawUrl) => {
    const link = resolveLink(rawUrl, where);
    if (link.isHash) hashRefs.push({ hash: link.href.slice(1), where });
    else if (link.group) {
      collectedSources.push({
        label: plainText(rawLabel),
        href: link.href,
        external: link.external,
        attrs: link.attrs,
        group: link.group,
      });
    }
    const cls = link.external ? 'hrv-link hrv-link--external' : 'hrv-link hrv-link--internal';
    const inner = sharedRenderer.inline(rawLabel);
    const idx = slots.push(`<a class="${cls}" href="${escapeAttr(link.href)}"${attrString(link.attrs)}>${inner}</a>`) - 1;
    return `\u0001${idx}\u0001`;
  }).replace(/ℵ\*(?!\*)/g, ALEPH_STAR_SLOT);
  const html = renderFn(parked)
    .replaceAll(ALEPH_STAR_SLOT, 'ℵ*')
    .replace(LINK_SLOT, (_, i) => slots[Number(i)]);
  if (/\]\(/.test(html)) fail(`${where}: unparsed markdown link syntax in "${src.slice(0, 80)}"`);
  if (/&lt;(?:strong|em|a|code|span)\b|&amp;(?:quot|amp|lt|gt);/.test(html)) {
    fail(`${where}: double-escaped HTML detected in "${html.slice(0, 100)}"`);
  }
  return html;
}

export function renderInlineMd(src, where, collectedSources, hashRefs) {
  return withValidatedLinks(src, sharedRenderer.inline, where, collectedSources, hashRefs);
}

export function renderBlockMd(src, where, collectedSources, hashRefs) {
  return withValidatedLinks(src, sharedRenderer.block, where, collectedSources, hashRefs);
}

function resolveDataFilePath() {
  const cwdCandidate = path.resolve(process.cwd(), C.DATA_FILE);
  if (fs.existsSync(cwdCandidate)) return cwdCandidate;
  return fileURLToPath(new URL('../../data/trustworthiness-of-the-bible.json', import.meta.url));
}

function validateDataContract(
  rawData,
  { verifyFileHash = true, expectedDataSha256 = C.EXPECTED_DATA_SHA256 } = {},
) {
  if (verifyFileHash) {
    const rawBytes = fs.readFileSync(resolveDataFilePath());
    const actualSha = crypto.createHash('sha256').update(rawBytes).digest('hex');
    if (actualSha !== expectedDataSha256) {
      fail(`${C.DATA_FILE} SHA-256 mismatch: expected ${expectedDataSha256}, got ${actualSha}`);
    }
  }
  if (!rawData || !Array.isArray(rawData.themes)) fail('raw JSON missing themes[]');
  const gotThemes = rawData.themes.map(t => t.id);
  if (gotThemes.join(',') !== C.EXPECTED_THEME_IDS.join(',')) {
    fail(`raw JSON themes changed: expected [${C.EXPECTED_THEME_IDS.join(', ')}], got [${gotThemes.join(', ')}]`);
  }
  const rawItemIds = new Set();
  for (const t of rawData.themes) {
    for (const ev of t.evidences || []) {
      if (!ev.id) fail(`theme "${t.id}" contains an evidence item without an id`);
      if (rawItemIds.has(ev.id)) fail(`duplicate raw evidence id "${ev.id}"`);
      rawItemIds.add(ev.id);
    }
  }
  if (rawItemIds.size !== 92) fail(`expected 92 locked evidence items in raw JSON, found ${rawItemIds.size}`);
  return rawItemIds;
}

function validateLabels(LABELS) {
  if (!LABELS || typeof LABELS !== 'object') fail('LABELS object is required');
  for (const k of C.REQUIRED_LABELS) {
    if (typeof LABELS[k] !== 'string' || !LABELS[k].trim()) fail(`LABELS.${k} is required`);
  }
  for (const [groupField, keys] of Object.entries(C.REQUIRED_LABEL_GROUPS)) {
    const obj = LABELS[groupField];
    if (!obj || typeof obj !== 'object') fail(`LABELS.${groupField} is required`);
    for (const gk of keys) {
      if (typeof obj[gk] !== 'string' || !obj[gk].trim()) fail(`LABELS.${groupField}.${gk} is required`);
    }
  }
}

export function buildModel(
  CONTENT,
  { data = RAW_DATA, expectedDataSha256 = C.EXPECTED_DATA_SHA256 } = {},
) {
  const rawItemIds = validateDataContract(data, {
    verifyFileHash: data === RAW_DATA,
    expectedDataSha256,
  });
  validateLabels(CONTENT.LABELS);

  const idsUsed = new Set();
  const registerId = (id, where) => {
    if (!id || typeof id !== 'string') fail(`${where}: missing DOM id`);
    if (idsUsed.has(id)) fail(`${where}: duplicate DOM id "#${id}"`);
    idsUsed.add(id);
  };

  registerId(C.TOP_ID, 'article#top');
  registerId('stage-filter-nav', 'nav alias #stage-filter-nav');
  registerId(C.GLANCE_ID, 'glance section');
  registerId('overview', 'glance alias #overview');
  registerId('section-overview', 'glance alias #section-overview');

  const collectedSources = [];
  const hashRefs = [];
  const placedItemIds = new Set();

  const buildChips = (chips, where) => (chips || []).map((c, i) => {
    const link = resolveLink(c.href, `${where}.chips[${i}]`);
    if (link.isHash) hashRefs.push({ hash: link.href.slice(1), where: `${where}.chips[${i}]` });
    else if (link.group) {
      collectedSources.push({
        label: plainText(c.label),
        href: link.href,
        external: link.external,
        attrs: link.attrs,
        group: link.group,
      });
    }
    return {
      label: c.label,
      labelHtml: tl(c.label),
      href: link.href,
      external: link.external,
      attrs: link.attrs,
    };
  });

  const buildStandardCard = (it, n, where) => {
    registerId(it.id, where);
    placedItemIds.add(it.id);
    if (it.aliasId) registerId(it.aliasId, `${where}.aliasId`);
    for (const a of it.aliasIds || []) registerId(a, `${where}.aliasIds`);
    if (!it.quote && !it.exampleMd) fail(`${where}: card must have either primary quote or exampleMd`);
    if (it.quote && !it.quoteCite) fail(`${where}: card with quote is missing quoteCite`);
    return {
      id: it.id,
      aliasId: it.aliasId || null,
      aliasIds: it.aliasIds || [],
      n,
      contested: !!it.contested,
      badge: it.badge || it.tier || '',
      badgeHtml: renderInlineMd(it.badge || it.tier || '', `${where}.badge`, collectedSources, hashRefs),
      title: it.title,
      titleHtml: tl(it.title),
      metaHtml: it.meta ? renderInlineMd(it.meta, `${where}.meta`, collectedSources, hashRefs) : '',
      noteHtml: renderInlineMd(it.noteMd, `${where}.noteMd`, collectedSources, hashRefs),
      exampleHtml: it.exampleMd ? renderInlineMd(it.exampleMd, `${where}.exampleMd`, collectedSources, hashRefs) : '',
      quoteHtml: it.quote ? tl(it.quote) : '',
      quoteCiteHtml: it.quoteCite ? renderInlineMd(it.quoteCite, `${where}.quoteCite`, collectedSources, hashRefs) : '',
      renderPatristicTable: !!it.renderPatristicTable,
      chips: buildChips(it.chips, where),
    };
  };

  // Validate section ordering
  const secIds = (CONTENT.SECTIONS || []).map(s => s.id);
  if (secIds.join(',') !== C.SECTION_ORDER.join(',')) {
    fail(`SECTIONS ids must be [${C.SECTION_ORDER.join(', ')}], got [${secIds.join(', ')}]`);
  }

  const sections = CONTENT.SECTIONS.map((sec, si) => {
    const sWhere = `SECTIONS[${si}] (${sec.id})`;
    registerId(sec.id, sWhere);
    for (const a of sec.aliases || []) registerId(a, `${sWhere}.aliases`);

    const themes = (sec.themes || []).map((th, ti) => {
      const tWhere = `${sWhere}.themes[${ti}] (${th.id})`;
      registerId(th.id, tWhere);
      for (const a of th.aliases || []) registerId(a, `${tWhere}.aliases`);

      const baseTheme = {
        id: th.id,
        aliases: th.aliases || [],
        kind: th.kind,
        eyebrowHtml: tl(th.eyebrow),
        titleHtml: tl(th.title),
        leadHtml: renderBlockMd(th.leadMd, `${tWhere}.leadMd`, collectedSources, hashRefs),
      };

      if (th.kind === 'manuscripts') {
        let mNum = 0;
        const groups = O.MANUSCRIPT_GROUPS.map(g => ({
          key: g.key,
          labelHtml: tl(g.label),
          cards: g.itemIds.map(id => {
            const m = O.MANUSCRIPT_ITEMS[id];
            if (!m) fail(`${tWhere}: missing MANUSCRIPT_ITEMS["${id}"]`);
            const cWhere = `${tWhere}.manuscript(${id})`;
            registerId(id, cWhere);
            placedItemIds.add(id);
            let scan = null;
            if (m.scan) {
              if (!m.scan.size) fail(`${cWhere}.scan: missing file size label`);
              const imgUrl = C.r2ScanUrl(m.scan.corpus, m.scan.msId, m.scan.folio);
              resolveLink(imgUrl, `${cWhere}.scan`);
              scan = {
                ...m.scan,
                imgUrl,
                summaryHtml: tl(fill(CONTENT.LABELS.scanSummary, { title: m.siglum, size: m.scan.size }, 'LABELS.scanSummary')),
                openLabelHtml: tl(fill(CONTENT.LABELS.scanOpenFull, { size: m.scan.size }, 'LABELS.scanOpenFull')),
                captionHtml: tl(m.scan.caption),
              };
            }
            return {
              id,
              n: ++mNum,
              title: m.title,
              titleHtml: tl(m.title),
              siglumHtml: tl(m.siglum),
              dateHtml: tl(m.date),
              repositoryHtml: tl(m.repository),
              provenanceHtml: renderInlineMd(m.provenance, `${cWhere}.provenance`, collectedSources, hashRefs),
              noteHtml: renderInlineMd(m.noteMd, `${cWhere}.noteMd`, collectedSources, hashRefs),
              quoteHtml: tl(m.quote),
              quoteCiteHtml: renderInlineMd(m.quoteCite, `${cWhere}.quoteCite`, collectedSources, hashRefs),
              readingNoteHtml: m.readingNote ? renderInlineMd(m.readingNote, `${cWhere}.readingNote`, collectedSources, hashRefs) : '',
              scan,
              chips: buildChips(m.chips, cWhere),
            };
          }),
        }));
        return { ...baseTheme, groups };
      }

      if (th.kind === 'variants') {
        const cards = O.VARIANT_ITEMS.map((v, vi) => buildStandardCard(v, vi + 1, `${tWhere}.variants[${vi}]`));
        return { ...baseTheme, cards };
      }

      if (th.kind === 'classical-table') {
        const takeawayHtml = th.takeawayMd
          ? renderInlineMd(th.takeawayMd, `${tWhere}.takeawayMd`, collectedSources, hashRefs)
          : '';
        const rows = O.CLASSICAL_ROWS.map((r, ri) => {
          registerId(r.id, `${tWhere}.classicalRows[${ri}]`);
          placedItemIds.add(r.id);
          if ('accuracyPercentage' in r) fail(`${tWhere}: accuracyPercentage is forbidden on classical row "${r.id}"`);
          return {
            id: r.id,
            n: ri + 1,
            workHtml: tl(r.work),
            composedHtml: tl(r.composed),
            earliestFragmentHtml: tl(r.earliestFragment),
            substantialCodexHtml: tl(r.substantialCodex),
            witnessCountHtml: tl(r.witnessCount),
            highlight: !!r.highlight,
          };
        });
        return { ...baseTheme, takeawayHtml, rows };
      }

      if (th.kind === 'onomastics') {
        registerId(O.ONOMASTICS_TABLES.male.id, `${tWhere}.maleTable`);
        registerId(O.ONOMASTICS_TABLES.female.id, `${tWhere}.femaleTable`);
        const buildOnoTable = (tbl, key) => ({
          ...tbl,
          footnoteHtml: tbl.footnote
            ? renderInlineMd(tbl.footnote, `${tWhere}.${key}.footnote`, collectedSources, hashRefs)
            : '',
        });
        const tables = {
          aggregates: O.ONOMASTICS_TABLES.aggregates.map((a, ai) => ({
            ...a,
            noteHtml: renderInlineMd(a.note, `${tWhere}.aggregates[${ai}].note`, collectedSources, hashRefs),
          })),
          male: buildOnoTable(O.ONOMASTICS_TABLES.male, 'male'),
          female: buildOnoTable(O.ONOMASTICS_TABLES.female, 'female'),
        };
        const cards = O.ONOMASTICS_ITEMS.map((it, ii) => buildStandardCard(it, ii + 1, `${tWhere}.onomastics[${ii}]`));
        return {
          ...baseTheme,
          tables,
          cards,
        };
      }

      if (th.kind === 'patristics') {
        for (const d of O.PATRISTIC_TABLE.divisions) {
          registerId(d.id, `${tWhere}.patristicDivision(${d.id})`);
        }
        registerId(O.PATRISTIC_TABLE.otherAliasId, `${tWhere}.patristicDivision(other)`);
        const patristicTable = {
          ...O.PATRISTIC_TABLE,
          footnoteHtml: O.PATRISTIC_TABLE.footnote
            ? renderInlineMd(O.PATRISTIC_TABLE.footnote, `${tWhere}.patristicTable.footnote`, collectedSources, hashRefs)
            : '',
        };
        const cards = O.PATRISTIC_ITEMS.map((it, ii) => buildStandardCard(it, ii + 1, `${tWhere}.patristics[${ii}]`));
        return {
          ...baseTheme,
          patristicTable,
          cards,
        };
      }

      if (th.kind === 'cards') {
        const list = O[th.itemsKey];
        if (!Array.isArray(list)) fail(`${tWhere}: unknown itemsKey "${th.itemsKey}"`);
        const cards = list.map((it, ii) => buildStandardCard(it, ii + 1, `${tWhere}.${th.itemsKey}[${ii}]`));
        const primaryCards = cards.filter(c => !c.contested);
        const contestedCards = cards.filter(c => c.contested);
        return {
          ...baseTheme,
          cards,
          primaryCards,
          contestedCards,
          contestedSummaryHtml: th.contestedSummary ? tl(th.contestedSummary) : '',
          contestedIntroHtml: th.contestedIntroMd
            ? renderInlineMd(th.contestedIntroMd, `${tWhere}.contestedIntroMd`, collectedSources, hashRefs)
            : '',
        };
      }

      fail(`${tWhere}: unsupported theme kind "${th.kind}"`);
    });

    const assessments = (sec.assessments || []).map((a, ai) => ({
      classical: {
        label: a.classicalLabel || CONTENT.LABELS.classicalLabel,
        labelHtml: renderInlineMd(a.classicalLabel || CONTENT.LABELS.classicalLabel, `${sWhere}.assessments[${ai}].classicalLabel`, collectedSources, hashRefs),
        html: renderBlockMd(a.classicalMd, `${sWhere}.assessments[${ai}].classicalMd`, collectedSources, hashRefs),
      },
      evaluation: {
        label: a.evaluationLabel || CONTENT.LABELS.evaluationLabel,
        labelHtml: renderInlineMd(a.evaluationLabel || CONTENT.LABELS.evaluationLabel, `${sWhere}.assessments[${ai}].evaluationLabel`, collectedSources, hashRefs),
        html: renderBlockMd(a.evaluationMd, `${sWhere}.assessments[${ai}].evaluationMd`, collectedSources, hashRefs),
      },
    }));

    return {
      id: sec.id,
      aliases: sec.aliases || [],
      number: sec.number,
      navLabel: sec.navLabel,
      title: sec.title,
      titleHtml: tl(sec.title),
      introHtml: renderBlockMd(sec.introMd, `${sWhere}.introMd`, collectedSources, hashRefs),
      themes,
      assessments,
    };
  });

  registerId(C.SOURCES_ID, 'sources section');

  // Verify 100% of locked raw JSON items + 4 added items are placed
  for (const rawId of rawItemIds) {
    if (!placedItemIds.has(rawId)) fail(`raw JSON evidence item "${rawId}" was dropped and not placed on the page`);
  }
  for (const addId of O.ADDED_ITEM_IDS) {
    if (!placedItemIds.has(addId)) fail(`expected added scholarly item "${addId}" is missing from the page`);
  }

  // Verify 100% of legacy OLD_IDS exist in idsUsed
  for (const oldId of Object.keys(C.OLD_IDS)) {
    if (!idsUsed.has(oldId)) fail(`legacy anchor "#${oldId}" is missing from rendered DOM IDs`);
  }

  // Render header, closing, and glance BEFORE hash validation & source deduplication
  const header = {
    eyebrow: CONTENT.HEADER.eyebrow,
    h1Html: tl(CONTENT.HEADER.h1),
    hookHtml: renderInlineMd(CONTENT.HEADER.hookMd, 'HEADER.hookMd', collectedSources, hashRefs),
    contextText: plainText(CONTENT.HEADER.contextMd),
    contextHtml: unlink(renderInlineMd(CONTENT.HEADER.contextMd, 'HEADER.contextMd', collectedSources, hashRefs)),
    whosWhoSummary: CONTENT.HEADER.whosWhoSummary,
    whosWhoHtml: renderInlineMd(CONTENT.HEADER.whosWhoMd, 'HEADER.whosWhoMd', collectedSources, hashRefs),
    whosWhoGlossary: (CONTENT.HEADER.whosWhoGlossary || []).map((g, gi) => ({
      groupHtml: tl(g.group),
      entries: (g.entries || []).map((e, ei) => ({
        termHtml: tl(e.term),
        defHtml: renderInlineMd(e.defMd, `HEADER.whosWhoGlossary[${gi}].entries[${ei}].defMd`, collectedSources, hashRefs),
      })),
    })),
  };

  const closing = {
    heading: CONTENT.CLOSING.heading,
    html: renderBlockMd(CONTENT.CLOSING.bodyMd, 'CLOSING.bodyMd', collectedSources, hashRefs),
  };

  const glance = (CONTENT.GLANCE || []).map((g, gi) => {
    const link = resolveLink(g.href, `GLANCE[${gi}].href`);
    if (link.isHash) hashRefs.push({ hash: link.href.slice(1), where: `GLANCE[${gi}].href` });
    return {
      n: g.n,
      href: link.href,
      titleHtml: tl(g.title),
      takeawayHtml: tl(g.takeaway),
      chips: g.chips || [],
    };
  });

  for (const hr of hashRefs) {
    if (!idsUsed.has(hr.hash)) fail(`${hr.where}: in-page hash "#${hr.hash}" has no matching id on the page`);
  }

  // Deduplicate and group sources for SourcesBlock & JSON-LD citations
  const seenHref = new Set();
  const uniqueSources = [];
  for (const src of collectedSources) {
    if (seenHref.has(src.href)) continue;
    seenHref.add(src.href);
    uniqueSources.push(src);
  }

  const sources = C.SOURCE_GROUPS.map(gk => {
    const items = uniqueSources
      .filter(s => s.group === gk)
      .map(s => ({
        label: s.label,
        href: s.href,
        external: s.external,
        attrs: s.attrs || (s.external ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
        title: s.label,
      }));
    return {
      key: gk,
      label: CONTENT.LABELS.sourcesGroups[gk],
      items,
    };
  }).filter(g => g.items.length > 0);

  const citations = uniqueSources
    .filter(s => s.external)
    .slice(0, 25)
    .map(s => ({ name: s.label, url: s.href }));

  const nav = [
    ...sections.map(s => ({ id: s.id, n: s.number, labelHtml: tl(s.navLabel) })),
    { id: C.SOURCES_ID, n: null, labelHtml: tl(CONTENT.LABELS.sourcesNav) },
  ];

  return {
    seo: CONTENT.SEO,
    labels: CONTENT.LABELS,
    header,
    nav,
    glance,
    sections,
    sources,
    citations,
    closing,
    itemCount: placedItemIds.size,
    sectionCount: sections.length,
    idsUsed,
  };
}

export function loadTrustworthinessBible(CONTENT) {
  return buildModel(CONTENT);
}
