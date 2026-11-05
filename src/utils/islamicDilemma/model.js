/**
 * Build-time view model for /discover/islamic-dilemma.
 *
 *   md (read-only, parsed by the unchanged parseDilemmaMarkdown())
 *     + overrides.js (replacements for our-voice md fields)
 *     + content.js   (page-owned copy)
 *     + manuscripts  (injected: getFormattedManuscriptsByVerseId) ∩ config.PRE_610_MSS
 *     → objects in the shapes the shared hadith-reliability components expect
 *       (EvidenceCard `e`, Timeline / Confrontation / Witnesses `sc`, SourcesList `groups`).
 *
 * One link policy: external links go through hadithReliability/render.js `linkFor` (new tab,
 * noopener); Qurʾān references go to this site's al-Ṭabarī page, Ibn Kathīr references to the Ibn
 * Kathīr page; every internal href includes BASE. Data problems are collected and printed once per
 * build as a single `[islamicDilemma]` warning. Memoised.
 *
 * The manuscript lookup is injected (not imported) so the pure helpers can be unit-tested without
 * SQLite.
 */

import fs from 'node:fs';
import path from 'node:path';
import { parseDilemmaMarkdown } from '../dilemma_parser.js';
import { loadArabicSurah } from '../quran_loader.js';
import { createRenderer, linkFor, linkAttrs, tl, escapeAttr, plainText } from '../hadithReliability/render.js';
import * as C from './config.js';
import * as T from './content.js';
import { TABLE_ROWS, ANSWERS } from './overrides.js';

export const MD_PATH = 'src/data/discover/islam/scripture/islamic_dilemma.md';

const R = createRenderer();
const MD_LINK = /\[((?:[^\[\]]|\[[^\[\]]*\])+)\]\(([^)\s]+)\)/g;
const SLOT = /\u0001(\d+)\u0001/g;
/** Manuscript row fields that ManuscriptCarousel.jsx reads. */
const CAROUSEL_FIELDS = ['ms_id', 'image_name', 'name', 'earliest_date', 'date_range_english', 'current_location', 'found_location', 'interesting_info', 'language', 'form', 'material'];
const fill = (s, vars) => String(s).replace(/\{(\w+)\}/g, (m, k) => (vars[k] ?? m));
const attrString = attrs => Object.entries(attrs || {}).map(([k, v]) => ` ${k}="${escapeAttr(v)}"`).join('');

// ================================================================================================
// Pure helpers (unit-tested)
// ================================================================================================

/** Reads the raw md (read-only). */
export function readMd() {
  return fs.readFileSync(path.join(process.cwd(), MD_PATH), 'utf8');
}

/** Normalised override key for an md reference cell (see overrides.js header). */
export function refKey(cell) {
  const links = [...String(cell).matchAll(MD_LINK)];
  const verses = links.map(m => m[2].match(/^quran\/(\d+)\/(\d+)$/)).filter(Boolean).map(m => `${m[1]}:${m[2]}`);
  if (verses.length) return [...new Set(verses)].join('/');
  const sunnah = links.map(m => m[2].match(/^https:\/\/sunnah\.com\/([a-z]+):(\w+)/)).find(Boolean);
  if (sunnah) return `${sunnah[1]}:${sunnah[2]}`;
  return plainText(cell).replace(/\(.*?\)/g, '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** Italic quotations `*"…"*` in an md table cell, verbatim (inner emphasis markers removed). */
export function quotesIn(cell) {
  return [...String(cell).matchAll(/\*"(.+?)"\*/g)].map(m => m[1].replace(/\*+/g, ''));
}

/** Text before the first quotation in a cell (our voice when non-empty). */
export function leadIn(cell) {
  const i = String(cell).indexOf('*"');
  return i > 0 ? plainText(cell.slice(0, i)).replace(/[:\s]+$/, '') : '';
}

/** Full verse quotations from the md's blockquotes: { "S:A": text }. */
export function mdBlockquotes(raw) {
  const out = {};
  const re = />\s\*"([^\n]+?)"\*\s*\n>\s—\s\*\*\[Surah (\d+):(\d+)\]/g;
  for (const m of raw.matchAll(re)) out[`${m[2]}:${m[3]}`] ??= m[1].replace(/\*+/g, '');
  return out;
}

/** Normalises text for verbatim checks: markdown emphasis, quote styles (all → "), NASB italics brackets. */
export function normaliseQuote(s) {
  return String(s)
    .replace(/\*+/g, '')
    .replace(/[\[\]]/g, '')
    .replace(/[‘’ʼ'“”"]/g, '"') // quote style is typography, not wording
    .replace(/\s+/g, ' ')
    .trim();
}

/** Distinct manuscripts of a verse and which of them are on the verified pre-610 list. */
export function countManuscripts(rows, whitelist = C.PRE_610_MSS, cutoff = C.FIRST_REVELATION_CE) {
  const distinct = [...new Map(rows.filter(r => r.ms_id).map(r => [r.ms_id, r])).values()];
  const pre = distinct.filter(r => whitelist[r.ms_id]);
  // Stored dates say "early" but the ms is not on the verified list: never counted, always reported.
  const unverified = distinct.filter(r => !whitelist[r.ms_id] && Number(r.earliest_date) < cutoff);
  return { distinct, pre, unverified };
}

/** Short display name: papyri by siglum (P46), codices by name; scan suffixes removed. */
export function msShortName(row) {
  if (/^P\d+$/.test(row.ms_id)) return row.ms_id;
  return String(row.name || row.ms_id).replace(/\s*\(Scan \d+\)$/, '');
}

/** Every quotation object in content.js, with a dotted path (for the verbatim tests). */
export function collectContentQuotes(obj = T, at = 'content') {
  const out = [];
  const walk = (v, p) => {
    if (!v || typeof v !== 'object') return;
    if (typeof v.text === 'string' && (v.fromMd || v.source)) { out.push({ path: p, ...v }); return; }
    for (const [k, x] of Object.entries(v)) walk(x, `${p}.${k}`);
  };
  walk(obj, at);
  return out;
}

/**
 * Override coverage. Returns a list of problems (empty = OK):
 *  - an override key that matches no md row / objection
 *  - an md row whose our-voice field has no override
 */
export function checkOverrides(parsed = parseDilemmaMarkdown()) {
  const problems = [];
  const affirmKeys = parsed.section2.tableData.map(r => refKey(r.Reference));
  const refRows = parsed.section7.tableData;
  const refKeys = refRows.map(r => refKey(r.Reference));
  const objIds = parsed.section6.objectionsList.map(o => o.id);
  for (const k of Object.keys(TABLE_ROWS.affirm)) if (!affirmKeys.includes(k)) problems.push(`TABLE_ROWS.affirm["${k}"] matches no md §2 row`);
  for (const k of Object.keys(TABLE_ROWS.reference)) if (!refKeys.includes(k)) problems.push(`TABLE_ROWS.reference["${k}"] matches no md §7 row`);
  for (const k of Object.keys(ANSWERS)) if (!objIds.includes(k)) problems.push(`ANSWERS["${k}"] matches no md objection`);
  for (const k of affirmKeys) if (!TABLE_ROWS.affirm[k]?.label) problems.push(`md §2 row "${k}" has no override label (its "Apologetic Significance" column is our voice)`);
  for (const r of refRows) {
    const k = refKey(r.Reference);
    const o = TABLE_ROWS.reference[k];
    const cell = r['Literal English Translation Summary / Statement'] || '';
    if (!o?.category) problems.push(`md §7 row "${k}" has no override category`);
    if (/\]\(tafseer\//.test(cell) && !o?.tafsir?.length) problems.push(`md §7 row "${k}" links tafseer/ with our-voice labels; add an override "tafsir"`);
    if (leadIn(cell) && !o?.leadMd) problems.push(`md §7 row "${k}" has our-voice text before the quotation; add an override "leadMd"`);
    if (!quotesIn(cell).length && !o?.statementMd) problems.push(`md §7 row "${k}" has no quotation; add an override "statementMd"`);
  }
  for (const o of parsed.section6.objectionsList) {
    if (!ANSWERS[o.id]?.heading || !ANSWERS[o.id]?.bodyMd) problems.push(`md objection "${o.id}" needs an override heading and bodyMd ("The Refutation" is our voice)`);
  }
  return problems;
}

// ================================================================================================
// Rendering with the shared link policy
// ================================================================================================

/** Resolves a content/md link target to { href, external, attrs, kind, title }. */
export function resolveTarget(target) {
  let m;
  const internal = (href, kind = 'site', title) => ({ href, external: false, attrs: linkAttrs({ external: false }), kind, title });
  if ((m = target.match(/^quran\/(\d+)\/(\d+)$/)) || (m = target.match(/^tabari:\/\/(\d+)\/(\d+)$/))) {
    return internal(C.tafsirHref(m[1], m[2], 'tabari'), 'quran', `al-Ṭabarī on Qurʾān ${m[1]}:${m[2]}`);
  }
  if ((m = target.match(/^tafseer\/(\d+)\/(\d+)$/)) || (m = target.match(/^ibnkathir:\/\/(\d+)\/(\d+)$/))) {
    return internal(C.tafsirHref(m[1], m[2], 'ibn_kathir'), 'quran', `Ibn Kathīr on Qurʾān ${m[1]}:${m[2]}`);
  }
  if (target.startsWith('#')) return internal(target, 'anchor');
  if (target.startsWith('/')) return internal(C.sitePath(target));
  if (/^https?:\/\//.test(target)) return linkFor(target);
  return null;
}

function makeRenderer(report) {
  /** Inline Markdown → HTML. Links are resolved here (internal + external), the rest by render.js. */
  function inline(md) {
    if (md == null || md === '') return '';
    const slots = [];
    const s = String(md).replace(MD_LINK, (all, text, target) => {
      const l = resolveTarget(target);
      if (!l) { report.unresolved.add(target); slots.push(R.inline(text)); return `\u0001${slots.length - 1}\u0001`; }
      report.link(l, plainText(text));
      const title = l.title ? ` title="${escapeAttr(l.title)}"` : '';
      slots.push(`<a class="hrv-link" href="${escapeAttr(l.href)}"${attrString(l.attrs)}${title}>${R.inline(text)}</a>`);
      return `\u0001${slots.length - 1}\u0001`;
    });
    return R.inline(s).replace(SLOT, (_, i) => slots[Number(i)]);
  }
  return { inline };
}

/** Display only: a quotation's inner straight "…" pairs become ‘…’ inside our outer “…” (the stored text stays verbatim). */
export const nestQuotes = s => String(s).replace(/"([^"]*)"/g, '‘$1’');
const qt = s => tl(nestQuotes(s));

/** Escapes a quotation and highlights one phrase with <mark> (sand, never red). */
export function highlight(text, phrase) {
  const html = tl(text);
  if (!phrase) return { html, found: true };
  const p = tl(phrase);
  const i = html.indexOf(p);
  if (i < 0) return { html, found: false };
  return { html: `${html.slice(0, i)}<mark>${p}</mark>${html.slice(i + p.length)}`, found: true };
}

// ================================================================================================
// View model
// ================================================================================================

let cache = null;

/**
 * @param {{ getManuscripts: (verseId: string, mtId: null, isNT: boolean) => object[] }} deps
 */
export function loadIslamicDilemma({ getManuscripts }) {
  if (cache) return cache;

  const warnings = [];
  const sources = new Map(); // href → { kind, label, href, attrs, external, title, sort }
  const report = {
    unresolved: new Set(),
    link(l, label) {
      if (l.kind === 'anchor' || l.kind === 'site') return;
      addSource({ ...l, label });
    },
  };
  const md = makeRenderer(report);
  const raw = readMd();
  const parsed = parseDilemmaMarkdown();
  const blockquotes = mdBlockquotes(raw);
  const problems = checkOverrides(parsed);
  warnings.push(...problems);

  // ---- sources registry -------------------------------------------------------------------------
  function addSource(s) {
    if (!s?.href || sources.has(s.href)) return;
    let kind = s.kind;
    if (kind === 'quran' || /\/quran\/\d+\/\d+\/tafsir\//.test(s.href)) kind = 'quran';
    else if (/\/manuscripts$/.test(s.href)) kind = 'manuscripts';
    else if (/\/bible\//.test(s.href)) kind = 'bible';
    else if (kind !== 'sunnah' && kind !== 'classical' && kind !== 'manuscripts') kind = 'other';
    const v = s.href.match(/\/quran\/(\d+)\/(\d+)\/tafsir\/(\w+)/);
    const sort = v ? Number(v[1]) * 1000 + Number(v[2]) + (v[3] === 'ibn_kathir' ? 0.5 : 0) : 0;
    // Tafsir pages are always listed by verse and commentator, whatever the link text was.
    const label = v ? fill(v[3] === 'tabari' ? T.LABELS.chipQuran : T.LABELS.chipIbnKathir, { ref: `${v[1]}:${v[2]}` }) : s.label;
    sources.set(s.href, { kind, label, href: s.href, attrs: s.attrs || {}, external: !!s.external, title: s.title, sort });
  }

  // ---- link builders ----------------------------------------------------------------------------
  const sa = v => String(v).split(':').map(Number);
  function quranRef(q, scholar = 'tabari') {
    const [s, a] = sa(q);
    const href = C.tafsirHref(s, a, scholar);
    const title = scholar === 'tabari' ? `al-Ṭabarī on Qurʾān ${q}` : `Ibn Kathīr on Qurʾān ${q}`;
    const label = scholar === 'tabari' ? fill(T.LABELS.chipQuran, { ref: q }) : fill(T.LABELS.chipIbnKathir, { ref: q });
    const ref = { label, href, external: false, attrs: {}, title };
    addSource({ ...ref, kind: 'quran' });
    return ref;
  }
  /** Short ref chip for showcases ("Qurʾān 5:47") pointing at al-Ṭabarī. */
  function quranShortRef(q) {
    const r = quranRef(q, 'tabari');
    return { ...r, label: `Qurʾān ${q}` };
  }
  function sourceRef(src) {
    if (!src?.tafsir) return null;
    const scholar = src.tafsir;
    const label = fill(scholar === 'tabari' ? T.LABELS.chipTabari : T.LABELS.chipIbnKathir, { ref: src.key });
    const r = quranRef(src.key, scholar);
    return { ...r, label };
  }
  function externalRef(url, label, kind) {
    const l = linkFor(url);
    addSource({ ...l, label, ...(kind ? { kind } : {}) });
    return { label, href: l.href, external: l.external, attrs: l.attrs, title: undefined };
  }

  // ---- md data ----------------------------------------------------------------------------------
  const affirmRows = new Map(parsed.section2.tableData.map(r => [refKey(r.Reference), r]));
  const refRows = new Map(parsed.section7.tableData.map(r => [refKey(r.Reference), r]));
  const affirmQuote = q => {
    const row = affirmRows.get(q);
    if (!row) { warnings.push(`no md §2 row for ${q}`); return ''; }
    return quotesIn(row['Literal English Translation'])[0] || '';
  };
  const verseQuote = q => blockquotes[q] || (() => { warnings.push(`no md blockquote for ${q}`); return ''; })();
  const arabicOf = q => {
    const [s, a] = sa(q);
    const ar = loadArabicSurah(s).verses?.[String(a)];
    if (!ar) warnings.push(`no Arabic text for ${q}`);
    return ar || null;
  };

  // ---- passages + manuscripts -------------------------------------------------------------------
  const passages = C.PASSAGES.map(p => {
    const copy = T.PASSAGES_COPY[p.id] || {};
    const rows = getManuscripts(p.verseId, null, true) || [];
    const { distinct, pre, unverified } = countManuscripts(rows);
    if (unverified.length) warnings.push(`${p.verseId}: not counted as pre-610 (not on the verified list): ${unverified.map(r => r.ms_id).join(', ')}`);
    const vars = { n: pre.length, m: distinct.length, ref: p.ref };
    const verseHref = C.bibleVerseHref(p.book, p.ch, p.v);
    const mssHref = C.bibleMssHref(p.book, p.ch, p.v);
    const preRows = rows.filter(r => C.PRE_610_MSS[r.ms_id]);
    addSource({ kind: 'bible', label: copy.refLabel || p.ref, href: verseHref, external: false });
    addSource({ kind: 'manuscripts', label: `${p.ref}: ${distinct.length} manuscripts${rows.length !== distinct.length ? ` (${rows.length} scans)` : ''}`, href: mssHref, external: false });
    return {
      ...p,
      anchor: `p-${p.id}`,
      topic: copy.topic || p.ref,
      refLabel: copy.refLabel || p.ref,
      badge: copy.badge || '',
      quoteHtml: qt(copy.quote?.text || ''),
      total: distinct.length,
      pre610: pre.length,
      preList: pre.map(r => ({ name: msShortName(r), range: C.PRE_610_MSS[r.ms_id] })),
      countLabel: fill(T.LABELS.countChip, vars),
      scansSummary: fill(T.LABELS.scansSummary, vars),
      // Only the pre-610 scans and only the fields ManuscriptCarousel reads (keeps the island props small).
      manuscripts: preRows.map(r => Object.fromEntries(CAROUSEL_FIELDS.map(k => [k, r[k] ?? null]))),
      byId: new Map(distinct.map(r => [r.ms_id, r])),
      chips: [
        { label: fill(T.LABELS.chipBible, vars), href: verseHref, external: false, attrs: {} },
        { label: fill(T.LABELS.chipMss, vars), href: mssHref, external: false, attrs: {} },
      ],
    };
  });
  const passageById = new Map(passages.map(p => [p.id, p]));
  const passageRef = id => {
    const p = passageById.get(id);
    if (!p) { warnings.push(`unknown passage ${id}`); return null; }
    return { label: p.ref, href: `#${p.anchor}`, external: false, attrs: {} };
  };
  const witnessLine = (passageId, ids = []) => {
    const p = passageById.get(passageId);
    if (!p) return '';
    return ids.map(id => {
      const r = p.byId.get(id);
      if (!r) { warnings.push(`${passageId}: ${id} is not among this verse's scans`); return null; }
      if (!C.PRE_610_MSS[id]) { warnings.push(`${passageId}: ${id} is not on the verified pre-610 list`); return null; }
      return `${tl(msShortName(r))}, ${tl(C.PRE_610_MSS[id])}`;
    }).filter(Boolean).join(' · ');
  };

  // ---- confrontation items ----------------------------------------------------------------------
  const qItem = it => {
    const ref = quranShortRef(it.q);
    return { html: `<q class="idl-q">${qt(it.quote.text)}</q>`, ref: it.label ? { ...ref, label: it.label } : ref };
  };
  const pItem = it => {
    // `mss` is always validated against the scans and the pre-610 list; `witness` (copy) is what readers see.
    const computed = witnessLine(it.passage, it.mss);
    const w = it.witness ? tl(it.witness) : computed;
    return { html: `<q class="idl-q">${qt(it.quote.text)}</q>${w ? ` <span class="idl-mss">${w}</span>` : ''}`, ref: it.label ? { ...passageRef(it.passage), label: it.label } : passageRef(it.passage) };
  };
  /** Another NASB verse (not one of the §2 passages), with an optional small tag. */
  const bItem = it => {
    const b = it.bible;
    const href = C.bibleVerseHref(b.book, b.ch, b.v);
    addSource({ kind: 'bible', label: b.ref, href, external: false });
    const tag = it.tag ? `<span class="idl-tag">${tl(it.tag)}</span> ` : '';
    return { html: `${tag}<q class="idl-q">${qt(it.quote.text)}</q>`, ref: { label: b.ref, href, external: false, attrs: {} } };
  };
  const item = it => (it.q ? qItem(it) : it.bible ? bItem(it) : pItem(it));
  const side = s => ({ titleHtml: tl(s.title), items: s.items.map(item) });

  // ---- header / nav / sections ------------------------------------------------------------------
  const header = {
    eyebrow: T.HEADER.eyebrow,
    h1Html: tl(T.HEADER.h1),
    hookHtml: md.inline(T.HEADER.hookMd),
    context: T.HEADER.context,
  };
  const sections = C.SECTIONS.map((s, i) => ({
    ...s,
    n: i + 1,
    nav: T.SECTION_COPY[s.id]?.nav || s.id,
    headingHtml: tl(T.SECTION_COPY[s.id]?.heading || s.id),
    heading: T.SECTION_COPY[s.id]?.heading || s.id,
  }));
  const sectionById = Object.fromEntries(sections.map(s => [s.id, s]));

  // ---- core showcase ----------------------------------------------------------------------------
  const core = {
    caption: T.CORE.caption,
    ariaLabel: T.CORE.ariaLabel,
    sc: { type: 'confrontation', leadHtml: md.inline(T.CORE.leadMd), left: side(T.CORE.left), right: side(T.CORE.right), noteHtml: md.inline(T.CORE.noteMd) },
  };

  // ---- §1 Qurʾān --------------------------------------------------------------------------------
  /** A blank line (\n\n) in a `*Md` field starts a new paragraph. */
  const paras = s => String(s ?? '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean).map(p => md.inline(p));
  const pair = (block, fallbackLabel) => {
    if (!block) return null;
    const q = block.quote;
    return {
      label: fallbackLabel,
      html: md.inline(block.textMd),
      paras: paras(block.textMd),
      quoteHtml: q ? qt(q.text) : '',
      arabic: block.arabic || '',
      arabicLabel: T.LABELS.arabic,
      cite: q ? sourceRef(q.source) : null,
      afterHtml: md.inline(block.afterMd),
    };
  };
  /** "Go deeper": a list of blocks shown in one collapsed panel. */
  const deeperOf = blocks => (blocks?.length ? { label: T.LABELS.deeper, blocks: blocks.map(b => pair(b, '')) } : null);
  const chipsFor = (q, kinds = ['tabari', 'ibn_kathir']) => kinds.map(k => {
    if (k !== 'context') return { ...quranRef(q, k) };
    const [s, a] = sa(q);
    return { label: fill(T.LABELS.chipContext, { ref: q }), href: C.sitePath(`/quran/${s}#${a}`), external: false, attrs: {} };
  });
  let n = 0;
  const quranCards = T.QURAN.cards.map(c => {
    const text = affirmQuote(c.q);
    const hl = highlight(text, c.highlight);
    if (!hl.found) warnings.push(`highlight "${c.highlight}" not found in ${c.q}`);
    const ref = quranRef(c.q, 'tabari');
    return {
      anchor: `q-${c.q.replace(':', '-')}`,
      n: ++n,
      labelHtml: tl(TABLE_ROWS.affirm[c.q]?.label || `Qurʾān ${c.q}`),
      bodyHtml: md.inline(c.bodyMd ?? TABLE_ROWS.affirm[c.q]?.bodyMd),
      quote: { arabic: arabicOf(c.q), englishHtml: hl.html, ref: `Qurʾān ${c.q}`, refLink: { href: ref.href, attrs: {} } },
      chips: chipsFor(c.q, c.chips),
      classical: pair(c.classical, T.LABELS.classical),
      evaluation: pair(c.evaluation, T.LABELS.evaluation),
      deeper: deeperOf(c.deeper),
    };
  });

  const torahRow = T.QURAN.torah.refKey ? refRows.get(T.QURAN.torah.refKey) : null;
  const torahQuote = T.QURAN.torah.quote ? qt(T.QURAN.torah.quote.text) : (torahRow ? tl(quotesIn(torahRow['Literal English Translation Summary / Statement'])[0] || '') : '');
  if (!torahQuote) warnings.push(`no md quotation for ${T.QURAN.torah.refKey}`);
  const torahLink = T.QURAN.torah.chipTarget || (torahRow ? [...torahRow.Reference.matchAll(MD_LINK)].map(m => m[2]).find(u => /^https:/.test(u)) : null);
  const torahRef = torahLink ? externalRef(torahLink, T.QURAN.torah.chipSourceLabel || 'Sunan Abī Dāwūd 4449') : null;
  const torah = {
    heading: T.QURAN.torah.heading,
    e: {
      anchor: 'torah-cushion',
      n: ++n,
      labelHtml: tl(T.QURAN.torah.label),
      bodyHtml: md.inline(T.QURAN.torah.bodyMd),
      quote: { rawHtml: `<blockquote class="idl-bq"><p class="hrv-quote__en">“${torahQuote}”</p></blockquote><span class="hrv-quote__ref">${md.inline(T.QURAN.torah.noteMd)}</span>` },
      chips: [
        ...(torahRef ? [{ ...torahRef, label: T.QURAN.torah.chipLabel }] : []),
        ...(T.QURAN.torah.tafsirChip ? chipsFor(T.QURAN.torah.tafsirChip.q, [T.QURAN.torah.tafsirChip.scholar]) : []),
      ],
    },
    deeper: deeperOf(T.QURAN.torah.deeper),
  };

  const compactVerse = c => {
    const text = c.quote?.text || (affirmRows.has(c.q) ? affirmQuote(c.q) : verseQuote(c.q));
    const refLabel = `Qurʾān ${c.q}`;
    const label = TABLE_ROWS.affirm[c.q]?.label || '';
    return {
      anchor: `q-${c.q.replace(':', '-')}`,
      refLabel,
      // The small reference line is dropped when the label already starts with it.
      showRef: !!label && !label.startsWith(refLabel),
      labelHtml: label ? tl(label) : '',
      bodyHtml: md.inline(TABLE_ROWS.affirm[c.q]?.bodyMd),
      quoteHtml: qt(text),
      chips: chipsFor(c.q, c.chips),
      classical: pair(c.classical, T.LABELS.classical),
      evaluation: pair(c.evaluation, T.LABELS.evaluation),
      deeper: deeperOf(c.deeper),
    };
  };
  const quran = {
    section: sectionById.quran,
    introHtml: md.inline(T.QURAN.introMd),
    cards: quranCards,
    torah,
    compactHeading: T.QURAN.compactHeading,
    compact: T.QURAN.compact.map(compactVerse),
  };

  // ---- §2 Gospel copies -------------------------------------------------------------------------
  const tlPoints = pts => pts.map(p => ({ year: p.year, labelHtml: md.inline(p.labelMd) }));
  const gospel = {
    section: sectionById['gospel-copies'],
    introHtml: md.inline(T.GOSPEL_COPIES.introMd),
    timeline: { type: 'timeline', points: tlPoints(T.GOSPEL_COPIES.timeline), gapHtml: tl(T.GOSPEL_COPIES.timelineGap) },
    cards: (T.GOSPEL_COPIES.cards || []).map((c, i) => ({
      anchor: `copies-${c.id}`,
      n: i + 1,
      labelHtml: tl(c.label),
      bodyHtml: `<p>${md.inline(c.bodyMd)}</p>${c.bannerMd ? `<p class="idl-banner">${md.inline(c.bannerMd)}</p>` : ''}`,
      chips: (c.chips || []).map(ch => {
        if (/^https?:\/\//.test(ch.target)) return externalRef(ch.target, ch.label, ch.kind);
        const t = resolveTarget(ch.target);
        return t ? { label: ch.label, href: t.href, external: t.external, attrs: t.attrs, title: t.title } : null;
      }).filter(Boolean),
    })),
    summaryHtml: md.inline(T.GOSPEL_COPIES.summaryMd),
    passages,
  };

  // ---- §3 On Jesus ------------------------------------------------------------------------------
  const onJesus = {
    section: sectionById['on-jesus'],
    introHtml: md.inline(T.ON_JESUS.introMd),
    rows: T.ON_JESUS.rows.map(r => ({ caption: r.caption, sc: { type: 'confrontation', left: side(r.left), right: side(r.right) } })),
    fullVerses: T.ON_JESUS.fullVerses.map(q => ({ q, ref: quranShortRef(q), textHtml: tl(verseQuote(q)) })),
    takeawayHtml: md.inline(T.ON_JESUS.takeawayMd),
    takeawayParas: paras(T.ON_JESUS.takeawayMd),
    noteHtml: md.inline(T.ON_JESUS.noteMd),
  };

  // ---- §4 Text history --------------------------------------------------------------------------
  const witnesses = {
    type: 'witnesses',
    items: T.TEXT_HISTORY.witnesses.map(w => {
      const target = w.ref?.target ? resolveTarget(w.ref.target) : null;
      if (target) addSource({ ...target, label: w.ref.label });
      const more = (w.moreRefs || []).map(r => {
        const t = resolveTarget(r.target);
        if (!t) { report.unresolved.add(r.target); return ''; }
        addSource({ ...t, label: r.label });
        return `<a class="hrv-sc__ref${t.external ? '' : ' is-internal'}" href="${escapeAttr(t.href)}"${attrString(t.attrs)}>${tl(r.label)}</a>`;
      }).filter(Boolean).join(' ');
      const lead = w.quoteLead ? `<span class="idl-wit__lead">${tl(w.quoteLead)}</span> ` : '';
      // A quotation renders in quotation marks; an attributed paraphrase never does.
      const body = w.quote ? `“${qt(w.quote.text)}”` : tl(w.paraphrase || '');
      const support = w.support ? ` <span class="idl-wit__support">${tl(w.support.lead)} “${qt(w.support.quote.text)}”</span>` : '';
      return {
        scholar: w.scholar,
        deathAh: w.deathAh,
        workHtml: `${md.inline(w.work || '')}${w.position ? `<span class="idl-wit__pos">${tl(w.position)}</span>` : ''}`,
        arabic: w.arabic || null,
        englishHtml: `${lead}${body}${support}${more ? `<span class="idl-wit__refs">${more}</span>` : ''}`,
        ref: target ? { label: w.ref.label, href: target.href, external: target.external, attrs: target.attrs, title: target.title } : null,
      };
    }),
  };
  const textHistory = {
    section: sectionById['text-history'],
    introHtml: md.inline(T.TEXT_HISTORY.introMd),
    witnesses,
    witnessesTakeawayHtml: md.inline(T.TEXT_HISTORY.witnessesTakeaway),
    versesHeading: T.TEXT_HISTORY.versesHeading,
    summaryHeading: T.TEXT_HISTORY.summaryHeading,
    versesIntroHtml: md.inline(T.TEXT_HISTORY.versesIntroMd),
    verses: T.TEXT_HISTORY.verses.map(v => compactVerse(typeof v === 'string' ? { q: v } : v)),
    versesClassical: pair(T.TEXT_HISTORY.versesClassical, T.LABELS.classical),
    versesEvaluation: pair(T.TEXT_HISTORY.versesEvaluation, T.LABELS.evaluation),
    classical: pair(T.TEXT_HISTORY.classical, T.LABELS.classical),
    evaluation: pair(T.TEXT_HISTORY.evaluation, T.LABELS.evaluation),
    deeper: deeperOf(T.TEXT_HISTORY.deeper),
  };

  // ---- §5 Answers -------------------------------------------------------------------------------
  const answers = {
    section: sectionById.answers,
    introHtml: md.inline(T.ANSWERS.introMd),
    textsLabel: T.ANSWERS.textsLabel,
    items: parsed.section6.objectionsList.map((o, i) => {
      const ov = ANSWERS[o.id];
      return {
        id: o.id,
        anchor: `answer-${i + 1}`,
        headingHtml: tl(ov?.heading || o.objection),
        bodyHtml: md.inline(ov?.bodyMd || o.rawRefutation),
        bodyParas: paras(ov?.bodyMd || o.rawRefutation),
      };
    }),
  };

  // ---- §6 Sources -------------------------------------------------------------------------------
  const references = parsed.section7.tableData.map(r => {
    const key = refKey(r.Reference);
    const ov = TABLE_ROWS.reference[key] || {};
    const cell = r['Literal English Translation Summary / Statement'] || '';
    const refLinks = [...r.Reference.matchAll(MD_LINK)].map(m => ({ text: plainText(m[1]), target: m[2] }));
    const allRefLinks = [...(ov.leadRefs || []).map(l => ({ text: l.label, target: l.target })), ...refLinks];
    const refs = allRefLinks.map(l => {
      const t = resolveTarget(l.target);
      if (!t) { report.unresolved.add(l.target); return null; }
      const label = l.text.replace(/^Surah /, 'Qurʾān ');
      addSource({ ...t, label: t.kind === 'quran' ? fill(T.LABELS.chipQuran, { ref: label.replace(/^Qurʾān /, '') }) : label });
      return { label, href: t.href, attrs: t.attrs, external: t.external };
    }).filter(Boolean);
    const tafsir = (ov.tafsir || []).map(t => {
      const [s, a] = sa(t.verse);
      const href = C.tafsirHref(s, a, t.scholar);
      addSource({ kind: 'quran', label: fill(t.scholar === 'tabari' ? T.LABELS.chipTabari : T.LABELS.chipIbnKathir, { ref: t.verse }), href, external: false });
      return { label: t.label, href, attrs: {}, external: false };
    });
    return {
      key,
      categoryHtml: tl(ov.category || plainText(r.Category)),
      refs: refs.length ? refs : [{ label: ov.refLabel || plainText(r.Reference), href: null }],
      leadHtml: ov.leadMd ? md.inline(ov.leadMd) : '',
      quotesHtml: quotesIn(cell).map(q => tl(q)),
      statementHtml: ov.statementMd ? md.inline(ov.statementMd) : '',
      tafsir,
    };
  });
  const closingRef = passageRef(T.SOURCES.closing.passage);
  const closing = {
    label: T.SOURCES.closing.heading,
    heading: T.SOURCES.closing.heading,
    beforeHtml: (T.SOURCES.closing.beforeMd || []).map(p => md.inline(p)),
    quoteHtml: qt(T.SOURCES.closing.quote.text),
    cite: T.SOURCES.closing.cite,
    citeHref: closingRef?.href,
    lineHtml: md.inline(T.SOURCES.closing.lineMd),
  };
  const academic = T.SOURCES.academic.map(a => {
    const html = a.labelMd ? md.inline(a.labelMd) : tl(a.label || '');
    if (!a.url) return { html, href: null, attrs: {}, host: '', type: a.type || 'academic' };
    const l = linkFor(a.url);
    return { html, href: l.href, attrs: l.attrs, host: l.host, type: a.type || 'academic' };
  });

  // ---- glance cards (built last: they reuse section data) --------------------------------------
  const glance = T.GLANCE.map(g => {
    const s = sectionById[g.target];
    let sc;
    const gSide = x => ({ titleHtml: tl(x.title), items: x.text ? [{ html: tl(x.text) }] : [] });
    if (g.kind === 'confrontation') {
      sc = { type: 'confrontation', left: gSide(g.left), right: gSide(g.right) };
    } else if (g.kind === 'chips') {
      sc = { type: 'witnesses', items: g.chips.map(c => ({ scholar: c })) };
    } else if (g.kind === 'timeline') {
      sc = { type: 'timeline', points: tlPoints(T.GOSPEL_COPIES.timelineCompact), gapHtml: '' };
    } else if (g.kind === 'witnesses') {
      sc = witnesses;
    }
    return { href: `#${g.target}`, n: s?.n, title: g.title, take: g.take, sc, aria: fill(T.LABELS.glanceGo, { n: s?.n }) };
  });

  // ---- source groups ----------------------------------------------------------------------------
  for (const lib of T.SOURCES.manuscriptLibraries) externalRef(lib.url, lib.label, 'manuscripts');
  for (const o of T.SOURCES.otherLinks || []) addSource({ kind: 'other', label: o.label, href: C.sitePath(o.path), external: false });
  const order = ['quran', 'sunnah', 'manuscripts', 'bible', 'classical', 'other'];
  const groups = order.map(kind => ({
    kind,
    label: T.LABELS.sourceGroups[kind],
    note: T.LABELS.sourcesNote[kind] || '',
    items: [...sources.values()].filter(s => s.kind === kind).sort((a, b) => a.sort - b.sort),
  })).filter(g => g.items.length);

  if (report.unresolved.size) warnings.push(`unresolved link targets: ${[...report.unresolved].join(', ')}`);
  if (warnings.length) console.warn(`[islamicDilemma] ${warnings.length} data warning(s):\n  - ${warnings.join('\n  - ')}`);

  cache = {
    header,
    sections,
    topAlias: C.TOP_ALIAS,
    core,
    glance,
    quran,
    gospel,
    onJesus,
    textHistory,
    answers,
    sources: { section: sectionById.sources, introHtml: md.inline(T.SOURCES.introMd), groups, references, academic, closing },
    labels: T.LABELS,
    sectionContext: T.SECTION_CONTEXT,
    warnings,
    citations: [...sources.values()].filter(s => s.kind === 'quran' || s.kind === 'sunnah').map(s => ({ name: s.label, href: s.href })),
  };
  return cache;
}

/** Test hook: forget the memoised model. */
export function resetIslamicDilemma() { cache = null; }
