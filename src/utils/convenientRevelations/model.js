/**
 * Build-time view model for `/discover/convenient-revelations` (hub + 4 chapter pages, 12 items inline).
 *
 * Pure and memoised. Reads the dataset's quoted sources only (`reference`, `english`, `arabic`,
 * `flow_stage`); the dataset's own prose (`title`, `the_claim`, `standard_apologetic_defense`,
 * `the_devastating_counter`) is never read, so it cannot leak into a page. Every reader-facing string
 * comes from `config.js`.
 *
 * `buildModel(data, config)` validates the dataset against the config and THROWS on any mismatch, which
 * fails the Astro build: theme count ≠ 12, a theme without config or a stale config key, a theme not
 * placed exactly once, duplicate ids/aliases, a missing copy field, a stage label for a flow_stage that
 * doesn't exist (or a flow_stage without a label), a showcase excerpt that isn't a verbatim substring of
 * its source, a stale REF_FIX / QUOTE_FIX, an unknown reference format.
 *
 * Item copy, showcase specs (`{ archetype, caption, sides|points|tabs|values|findings, quote?, delay?,
 * head?, rows?, note?, noteLines? }`), stage labels, summaries, cross-links and source layout come from
 * `copy.js` via `config.ITEMS[theme].copy`. A quote fix that restores text already present in the data
 * ("already applied upstream") and a ref fix whose target the data now cites also fail the build.
 */
import data from '../../data/convenient-revelations.json' with { type: 'json' };
import * as CONFIG from './config.js';
import { createRenderer, linkAttrs, tl, escapeAttr } from '../hadithReliability/render.js';

const escapeHtml = s => escapeAttr(String(s ?? ''));
/** Qurʾānic pause marks (U+06D6–U+06DC). See arabicHtml(). */
const WAQF = /[\u06D6-\u06DC]/g;
/**
 * Verbatim Arabic → HTML. The site's Google-Fonts Amiri maps the pause marks to a box glyph, and in this
 * dataset they stand after a space, so even a Quranic face draws them on a dotted-circle placeholder.
 * They stay in the text (copy/selection/screen readers keep them) but are visually hidden.
 */
export const arabicHtml = text => escapeHtml(text).replace(WAQF, m => `<span class="crv-waqf">${m}</span>`);
/**
 * Display only: a showcase excerpt sits inside <q> (curly “…” from CSS), so the source's own paired ASCII
 * double quotes are nested quotes and render as ‘…’ (same rule as islamicDilemma/quranPreservation).
 * The verbatim check runs on the raw excerpt before this; the audit fails if an ASCII " is left in a <q>.
 */
export const nestQuotes = s => String(s ?? '').replace(/"([^"]*)"/g, '\u2018$1\u2019');
const ARABIC_RUN = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF][\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\u064B-\u065F.,:;!?،؛؟…ـ'"‏]*/g;
const LONG_WORDS = 120;

export const EXPECTED_THEMES = 12;

/** The slugify used by the pre-2026 pages (legacy anchors are derived from it). */
export function legacySlugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/[\s_]+/g, '-');
}

// ---- references & link policy -------------------------------------------------------------------

const SUNNAH = [
  [/^Sahih\s+(?:al-)?Bukhari\s+(\d+[a-z]?)$/i, 'bukhari', n => `Bukhārī ${n}`],
  [/^Sahih\s+Muslim\s+(\d+[a-z]?)$/i, 'muslim', n => `Muslim ${n}`],
  [/^Sunan\s+Abi\s+Dawud\s+(\d+[a-z]?)$/i, 'abudawud', n => `Abū Dāwūd ${n}`],
  [/^Sunan\s+an-Nasa'i\s+(\d+[a-z]?)$/i, 'nasai', n => `al-Nasāʾī ${n}`],
  [/^Jami`?\s*at-Tirmidhi\s+(\d+[a-z]?)$/i, 'tirmidhi', n => `al-Tirmidhī ${n}`],
];

/**
 * One reference string (no compounds) → a ref with its link. Unknown formats throw: a new kind of
 * source must get an explicit rule here (and a test) instead of silently rendering unlinked.
 */
export function parseRef(raw, { base = CONFIG.BASE } = {}) {
  const s = raw.trim();
  let m = s.match(/^Quran\s*\(?\s*(\d+):(\d+)(?:-(\d+))?\s*\)?$/i);
  if (m) {
    const [, surah, ayah, end] = m;
    return {
      kind: 'quran', group: 'site', surah, ayah, end: end || null,
      label: `Qurʾān ${surah}:${ayah}${end ? `–${end}` : ''}`,
      href: `${base}/quran/${surah}/${ayah}/tafsir/tabari`,
      title: `Qurʾān ${surah}:${ayah}${end ? `–${end}` : ''} with Tafsīr al-Ṭabarī on this site`,
      external: false,
    };
  }
  if (/^Tafsir\s+(?:al-Tabari|Ibn\s+Kathir)\b/i.test(s)) {
    const v = s.match(/(\d+):(\d+)(?:-(\d+))?/);
    if (!v) throw new Error(`tafsīr reference without a verse: "${raw}"`);
    const [, surah, ayah] = v;
    const tabari = /al-Tabari/i.test(s);
    const name = tabari ? 'al-Ṭabarī' : 'Ibn Kathīr';
    return {
      kind: tabari ? 'tabari' : 'ibnKathir', group: 'site', surah, ayah,
      label: `${name} on ${surah}:${ayah}`,
      href: `${base}/quran/${surah}/${ayah}/tafsir/${tabari ? 'tabari' : 'ibn_kathir'}`,
      title: `Tafsīr ${name} on Qurʾān ${surah}:${ayah}, on this site`,
      external: false,
    };
  }
  for (const [re, coll, label] of SUNNAH) {
    m = s.match(re);
    if (m) {
      return { kind: coll, group: 'sunnah', number: m[1], label: label(m[1]), href: `https://sunnah.com/${coll}:${m[1]}`, title: `${label(m[1])} on Sunnah.com`, external: true };
    }
  }
  m = s.match(/^Musannaf\s+Ibn\s+Abi\s+Shaybah\s+(\d+)$/i);
  if (m) return { kind: 'ibnAbiShaybah', group: 'other', number: m[1], label: `Ibn Abī Shaybah ${m[1]}`, href: null, external: true };
  throw new Error(`unknown reference format: "${raw}"`);
}

/** Splits compound references ("Sahih al-Bukhari 4747 / Quran 24:6-9", "… 5191 and Sahih Muslim 1479a"). */
export function splitRefs(reference) {
  return reference.split(/\s+\/\s+|\s+and\s+(?=(?:Sahih|Sunan|Quran|Tafsir|Musannaf)\b)/i).map(s => s.trim()).filter(Boolean);
}

/** Short label for showcase links: ḥadīth chips in one style ("Bukhārī 4747") whatever the deck's label. */
const SHORT = Object.fromEntries(SUNNAH.map(([, coll, label]) => [coll, label]));
const shortOf = c => (c ? (c.number && SHORT[c.kind] ? SHORT[c.kind](c.number) : c.label) : '');

function chipFrom(spec, base) {
  if (typeof spec === 'string') return { ...parseRef(spec, { base }), secondary: false };
  if (spec.ref) {
    const r = parseRef(spec.ref, { base });
    return { ...r, label: spec.note ? `${r.label} (${spec.note})` : r.label, secondary: !!spec.secondary };
  }
  return { ...classifyLink(spec.label, spec.href, base), secondary: !!spec.secondary, title: spec.title };
}

/**
 * An explicit `{ label, href }` chip (copy-deck refFixes): site-relative hrefs become BASE-aware internal
 * links; the kind is recognised from the URL / label so the hub's source counts still include it.
 */
function classifyLink(label, href, base) {
  if (!/^(https:\/\/|\/(?!\/))/.test(String(href))) throw new Error(`chip "${label}": href must be https:// or site-relative, got "${href}"`);
  if (FORBIDDEN_LINK.test(href)) throw new Error(`chip "${label}": forbidden link (fact-check): ${href}`);
  const internal = href.startsWith('/');
  const out = { kind: 'link', group: 'other', label, href: internal ? `${base}${href}` : href, external: !internal };
  const sun = href.match(/^https:\/\/sunnah\.com\/(bukhari|muslim|abudawud|nasai|tirmidhi):(\d+[a-z]?)$/);
  if (sun) return { ...out, kind: sun[1], group: 'sunnah', number: sun[2] };
  const q = href.match(/^\/quran\/(\d+)\/(\d+)\/tafsir\/(tabari|ibn_kathir)/);
  if (q) {
    // The URL is authoritative for the verse; the label may only add a range end.
    const v = String(label).match(/(\d+):(\d+)(?:[–-](\d+))?/);
    if (v && (v[1] !== q[1] || v[2] !== q[2])) throw new Error(`chip "${label}": label verse ${v[1]}:${v[2]} ≠ link ${q[1]}:${q[2]}`);
    const kind = /^Qur/.test(label) ? 'quran' : q[3] === 'tabari' ? 'tabari' : 'ibnKathir';
    return { ...out, kind, group: 'site', surah: q[1], ayah: q[2], end: kind === 'quran' && v?.[3] ? v[3] : null, attrs: NO_PREFETCH };
  }
  if (/quran\.ksu\.edu\.sa/.test(href)) return { ...out, kind: 'tabariArabic', group: 'classical' };
  if (/Ibn Ab[iī] Shaybah|Muṣannaf|Irwāʾ/i.test(label)) return { ...out, kind: 'ibnAbiShaybah' };
  if (/Ibn Isḥāq|Ibn Ishaq|Sīra|Sira\b|Ibn Hishām/i.test(label)) return { ...out, kind: 'sira' };
  if (!internal) return { ...out, kind: 'otherWork' };
  return out;
}

/** Internal /quran pages are ~110 KB each: never prefetch them from these pages (viewport prefetch is site-wide). */
const NO_PREFETCH = { 'data-astro-prefetch': 'false' };
/** Links the fact-check rules out (IslamQA does not quote the Muṣannaf athar; Nasāʾī 3169 is a different hadith). */
const FORBIDDEN_LINK = /islamqa\.info|sunnah\.com\/nasai:3169\b/;

function finishChip(c, tabariArabic) {
  const chips = [{ ...c, attrs: { ...linkAttrs({ external: c.external }), ...(c.external ? {} : NO_PREFETCH) } }];
  if (c.kind === 'tabari' && tabariArabic) {
    const href = tabariArabic(c.surah, c.ayah);
    chips.push({ kind: 'tabariArabic', group: 'classical', label: `Arabic text (KSU)`, href, external: true, secondary: true, title: `Tafsīr al-Ṭabarī on ${c.surah}:${c.ayah}, Arabic text on quran.ksu.edu.sa`, attrs: linkAttrs({ external: true }) });
  }
  return chips;
}

// ---- text cleanup ---------------------------------------------------------------------------------

/**
 * Mechanical cleanup of dataset quirks: markdown residue (`** "`, `**{…}**`, stray `>` quote markers),
 * an embedded "**Arabic Reference:**" (moved to `arabic`), `"None"`/`""` Arabic. Never rewords.
 */
export function cleanSource({ english = '', arabic = '' }) {
  let en = String(english);
  let ar = String(arabic ?? '');
  const residue = /^\s*\*\*\s*"/.test(en);
  let arabicRef = null;
  const ref = en.match(/\s*(?:>\s*)*\*\*Arabic Reference:\*\*\s*([\s\S]*)$/);
  if (ref) { arabicRef = ref[1].trim(); en = en.slice(0, ref.index); }
  en = en.replace(/\*\*/g, '').replace(/(^|\s)>(?=\s|$)/g, ' ').replace(/\s+/g, ' ').trim();
  if (residue) en = en.replace(/^"+/, '').replace(/"$/, '').trim();
  ar = ar.trim();
  if (ar === 'None') ar = '';
  ar = ar.replace(/^\*\*\s*/, '').trim();
  if (!ar && arabicRef) ar = arabicRef;
  return { english: en, arabic: ar };
}

// ---- copy fields ----------------------------------------------------------------------------------

/** Markdown for our copy: site-relative links (`[33:51](/quran/33/51/tafsir/tabari)`) are internal and BASE-aware. */
const renderer = createRenderer({ rootLinks: true });

/** A copy field from copy.js → { text, html }. A missing field is a build error (no placeholders ship). */
function copyField(text, where, kind, errors) {
  if (typeof text !== 'string' || !text.trim()) { errors.push(`${where}: missing copy in copy.js`); return { text: '', html: '' }; }
  const html = kind === 'block' ? renderer.block(text) : kind === 'inline' ? renderer.inline(text) : tl(text);
  return { text, html };
}

// ---- the model ------------------------------------------------------------------------------------

/**
 * @param {{dataset: object[]}} dataset   the parsed JSON
 * @param {object} config                 the config module (or a test double with the same exports)
 */
export function buildModel(dataset, config = CONFIG) {
  const { BASE = '', BASE_PATH, HUB = {}, PARTS, ITEMS, REF_FIXES = {}, QUOTE_FIXES = {}, FIX_CONFLICTS = [], LABELS, SHOWCASE_LABELS, SOURCE_GROUPS, STAT_LABELS, TABARI_ARABIC_URL, COPY = {} } = config;
  const QURAN_TEXT = COPY.QURAN_TEXT || {};
  const errors = [...FIX_CONFLICTS];
  for (const k of ['h1', 'intro', 'methodSummary', 'method']) if (!HUB[k]) errors.push(`hub: missing ${k} in copy.js`);
  if (!HUB.seo?.title || !HUB.seo?.description) errors.push('hub: missing seo title/description in copy.js');
  const themes = dataset?.dataset;
  if (!Array.isArray(themes)) throw new Error('[convenientRevelations] dataset.dataset is not an array');
  if (themes.length !== EXPECTED_THEMES) errors.push(`expected ${EXPECTED_THEMES} themes, found ${themes.length}`);
  const byTheme = new Map();
  for (const t of themes) {
    if (byTheme.has(t.theme)) errors.push(`duplicate theme id ${t.theme}`);
    byTheme.set(t.theme, t);
  }
  for (const key of Object.keys(ITEMS)) if (!byTheme.has(key)) errors.push(`config ITEMS.${key} has no matching dataset theme (stale key)`);
  for (const key of byTheme.keys()) if (!ITEMS[key]) errors.push(`dataset theme ${key} has no config entry`);
  for (const [key, cfg] of Object.entries(ITEMS)) if (byTheme.has(key) && !cfg.copy) errors.push(`${key}: no entry in copy.js`);
  const orders = PARTS.map(p => p.order).sort((a, b) => a - b);
  if (!orders.every((o, i) => o === i + 1)) errors.push(`chapter orders must be 1..${PARTS.length}, got ${orders.join(',')}`);

  // placement: every theme in exactly one part, orders 1..n per part
  const partSlugs = PARTS.map(p => p.slug);
  if (new Set(partSlugs).size !== partSlugs.length) errors.push('duplicate part slug');
  const placed = new Map(PARTS.map(p => [p.slug, []]));
  for (const [theme, cfg] of Object.entries(ITEMS)) {
    if (!byTheme.has(theme)) continue;
    if (!placed.has(cfg.part)) { errors.push(`${theme}: unknown part "${cfg.part}"`); continue; }
    placed.get(cfg.part).push([theme, cfg]);
  }
  for (const [slug, list] of placed) {
    const orders = list.map(([, c]) => c.order).sort((a, b) => a - b);
    if (!orders.every((o, i) => o === i + 1)) errors.push(`part ${slug}: item orders must be 1..${list.length}, got ${orders.join(',')}`);
    list.sort((a, b) => a[1].order - b[1].order);
  }

  // ids and aliases
  const ids = new Map();
  const claimId = (id, owner) => {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id || '')) errors.push(`${owner}: id "${id}" is not kebab-case`);
    if (ids.has(id)) errors.push(`duplicate id "${id}" (${ids.get(id)} and ${owner})`);
    ids.set(id, owner);
  };
  for (const [theme, cfg] of Object.entries(ITEMS)) {
    if (!byTheme.has(theme)) continue;
    claimId(cfg.id, theme);
    for (const suffix of ['', '-claim', '-defense', '-counter']) claimId(`${cfg.legacy}${suffix}`, `${theme} legacy`);
  }

  // stale fixes
  for (const key of Object.keys(REF_FIXES)) {
    const [theme, idx] = key.split(':');
    const src = byTheme.get(theme)?.orthodox_sources?.[Number(idx)];
    if (!src) errors.push(`REF_FIXES.${key}: no such source`);
    else if (src.reference !== REF_FIXES[key].from) {
      let applied = false;
      try {
        const now = splitRefs(src.reference).map(x => parseRef(x, { base: BASE }).href).sort().join(' ');
        const want = (REF_FIXES[key].chips || []).filter(c => !c.secondary).map(c => chipFrom(c, BASE).href).sort().join(' ');
        applied = !!want && now === want;
      } catch { /* unparsable new reference: plain stale message */ }
      errors.push(applied
        ? `REF_FIXES.${key}: already applied upstream (the dataset now cites "${src.reference}") — delete this fix`
        : `REF_FIXES.${key}: dataset reference is "${src.reference}", fix expects "${REF_FIXES[key].from}" (stale fix?)`);
    }
    if (!REF_FIXES[key].reason) errors.push(`REF_FIXES.${key}: missing reason`);
  }
  for (const key of Object.keys(QUOTE_FIXES)) {
    const [theme, idx] = key.split(':');
    if (!byTheme.get(theme)?.orthodox_sources?.[Number(idx)]) errors.push(`QUOTE_FIXES.${key}: no such source`);
  }

  const order = [];
  for (const p of PARTS) for (const [theme] of placed.get(p.slug) || []) order.push(theme);
  const total = order.length;
  const partOfTheme = new Map(Object.entries(ITEMS).map(([t, c]) => [t, c.part]));
  const deckOf = theme => ITEMS[theme]?.copy || {};

  /** Resolved sources per theme (quote fixes applied, cleaned, effective chips), shared by cross-item quotes. */
  const sourcesOf = new Map();
  for (const [theme, t] of byTheme) {
    if (!ITEMS[theme]) continue;
    sourcesOf.set(theme, (t.orthodox_sources || []).map((s, index) => {
      const key = `${theme}:${index}`;
      let raw = { english: s.english ?? '', arabic: s.arabic ?? '' };
      for (const fx of QUOTE_FIXES[key] || []) {
        const field = fx.field || 'english';
        if (!['english', 'arabic'].includes(field)) { errors.push(`QUOTE_FIXES.${key}: unknown field "${field}"`); continue; }
        const restore = !!fx.replace && fx.replace.includes(fx.find);
        if (restore && raw[field].includes(fx.replace)) { errors.push(`QUOTE_FIXES.${key}: already applied upstream (the ${field} already contains the restored text) — delete this fix`); continue; }
        const hits = raw[field].split(fx.find).length - 1;
        if (hits !== 1) errors.push(`QUOTE_FIXES.${key}: "${String(fx.find).slice(0, 50)}…" found ${hits}× in ${field} (must be exactly once, applied in order)`);
        else raw = { ...raw, [field]: raw[field].split(fx.find).join(fx.replace) };
        if (!fx.reason) errors.push(`QUOTE_FIXES.${key}: missing reason`);
      }
      const clean = cleanSource(raw);
      const fix = REF_FIXES[key];
      let chips = [];
      try {
        const base = fix?.chips ? fix.chips.map(c => chipFrom(c, BASE)) : splitRefs(s.reference).map(r => ({ ...parseRef(r, { base: BASE }), secondary: false }));
        const extra = (fix?.addChips || []).map(c => chipFrom(c, BASE));
        const seen = new Set();
        chips = [...base, ...extra].flatMap(c => (c.href ? finishChip(c, TABARI_ARABIC_URL) : [])).filter(c => !seen.has(c.href) && seen.add(c.href));
      } catch (e) { errors.push(`${key}: ${e.message}`); }
      const primary = chips.filter(c => !c.secondary);
      const label = fix?.label || (fix?.primaryLabels?.length ? fix.primaryLabels.join(' · ') : '') || s.reference;
      return {
        theme, index, flowStage: s.flow_stage, reference: label,
        english: clean.english, arabic: clean.arabic, arabicHtml: arabicHtml(clean.arabic), chips, shortLabel: shortOf(primary[0]) || label,
        linkless: chips.length === 0,
      };
    }));
  }

  const anchorOf = (theme, index) => `${ITEMS[theme].id}-s${index}`;

  /**
   * A showcase quote line → { html (no links), linkHtml, inlineHtml (html + link), ref, arabic } after the
   * verbatim check. Line shapes: `{ src, excerpt }`, `{ theme, src, excerpt }` (another item's source),
   * `{ quran: 'S:A', excerpt }` (Droge text), `field: 'arabic'` (excerpt of the Arabic), optional `pre`.
   */
  function line(owner, l, where) {
    const empty = { html: '', linkHtml: '', ref: null, inlineHtml: '', arabic: false };
    if (!l || typeof l.excerpt !== 'string' || !l.excerpt) { errors.push(`${where}: line without excerpt`); return empty; }
    const pre = l.pre ? `<span class="crv-pre">${tl(l.pre)}</span> ` : '';
    let ref;
    let sourceAnchor = null;
    if (l.quran) {
      const text = QURAN_TEXT[l.quran];
      const m = String(l.quran).match(/^(\d+):(\d+)$/);
      if (!text || !m) { errors.push(`${where}: quran "${l.quran}" has no Droge text in copy.js (regenerate)`); return empty; }
      if (!text.includes(l.excerpt)) errors.push(`${where}: excerpt is not a verbatim substring of Droge ${l.quran}: "${l.excerpt.slice(0, 60)}…"`);
      ref = { label: `Qurʾān ${l.quran}`, href: `${BASE}/quran/${m[1]}/${m[2]}/tafsir/tabari`, external: false, attrs: NO_PREFETCH, title: `Qurʾān ${l.quran} with Tafsīr al-Ṭabarī on this site` };
    } else {
      const theme = l.theme || owner;
      const src = sourcesOf.get(theme)?.[l.src];
      if (!src) { errors.push(`${where}: no source ${theme}[${l.src}]`); return empty; }
      const field = l.field || 'english';
      if (!src[field]?.includes(l.excerpt)) errors.push(`${where}: excerpt is not a verbatim substring of ${theme}[${l.src}].${field}: "${String(l.excerpt).slice(0, 60)}…"`);
      const samePart = partOfTheme.get(theme) === partOfTheme.get(owner);
      sourceAnchor = anchorOf(theme, l.src);
      const href = samePart ? `#${sourceAnchor}` : `${BASE_PATH}/${partOfTheme.get(theme)}#${sourceAnchor}`;
      // A line can name its own link label; a line introduced as Qurʾān on a compound card links under the verse's label.
      const quranChip = /^Qur/.test(l.pre || '') ? src.chips.find(c => c.kind === 'quran') : null;
      const label = l.label || quranChip?.label || src.shortLabel;
      ref = { label, href, external: false, attrs: {}, title: `Jump to the full text: ${label}` };
    }
    const isAr = l.field === 'arabic';
    const html = isAr
      ? `${pre}<span class="hrv-ar-inline crv-q-ar" lang="ar" dir="rtl" data-v>${arabicHtml(l.excerpt)}</span>`
      : `${pre}<q class="crv-q" data-v>${escapeHtml(nestQuotes(l.excerpt))}</q>`;
    const prefetch = ref.href.startsWith('#') ? '' : ' data-astro-prefetch="false"';
    const linkHtml = `<a class="hrv-sc__ref is-internal" href="${escapeAttr(ref.href)}" title="${escapeAttr(ref.title)}"${prefetch}>${tl(ref.label)}</a>`;
    return { html, linkHtml, inlineHtml: `${html} ${linkHtml}`, ref, sourceAnchor, arabic: isAr };
  }

  /** Lines → display units: an Arabic line joins the line before it when both cite the same source. */
  const units = ls => {
    const out = [];
    for (const l of ls) {
      const prev = out[out.length - 1];
      if (l.arabic && prev && prev.ref?.href === l.ref?.href) { prev.html += ` ${l.html}`; prev.inlineHtml = `${prev.html} ${prev.linkHtml}`; }
      else out.push({ ...l });
    }
    return out;
  };
  /** Joins units; consecutive units from one source share one link (after the last). */
  const joinLines = (ls, sep) => { const u = units(ls); return u.map((l, k) => (u[k + 1] && u[k + 1].ref?.href === l.ref?.href ? l.html : l.inlineHtml)).join(sep); };
  const resolve = (owner, list, where) => (list || []).map((l, i) => line(owner, l, `${where}[${i}]`));
  /** A note: markdown string, or an array of markdown strings and quote lines. */
  const note = (owner, n, where) => {
    if (n == null || n === '') return '';
    const parts = Array.isArray(n) ? n : [n];
    return parts.map((p, i) => (typeof p === 'string' ? renderer.inline(p) : line(owner, p, `${where}[${i}]`).inlineHtml)).join(' ');
  };

  /** A labelled strip (quote / delay): each line keeps its own source. */
  function strip(theme, q, where) {
    if (!q) return null;
    const ls = resolve(theme, (q.lines || []).map(l => ({ src: q.src, ...l })), `${where}.lines`);
    const ar = resolve(theme, (Array.isArray(q.arabic) ? q.arabic : []).map(l => ({ src: q.src, field: 'arabic', ...l })), `${where}.arabic`);
    if (typeof q.arabic === 'string') {
      const src = sourcesOf.get(theme)?.[q.src];
      if (!src?.arabic.includes(q.arabic)) errors.push(`${where}.arabic: not a substring of the source's Arabic`);
    }
    const arabicTexts = (typeof q.arabic === 'string' ? [q.arabic] : (Array.isArray(q.arabic) ? q.arabic.map(a => a.excerpt) : [])).map(arabicHtml);
    const srcs = [...new Set(ls.map(l => l.ref?.label).filter(Boolean))];
    return {
      labelHtml: tl(q.label || q.who || ''),
      html: joinLines(ls, ' … '),
      compactHtml: ls.map(l => l.html).join(' … '),
      arabic: arabicTexts,
      // The Arabic's own source link, unless it is the same card the last English line already links.
      arabicRefHtml: ar.length && ar[ar.length - 1].ref?.href !== ls[ls.length - 1]?.ref?.href ? ar[ar.length - 1].linkHtml : '',
      srcLabelsHtml: tl(srcs.join(' · ')),
    };
  }

  function showcase(theme, spec) {
    const where = `${theme}.showcase`;
    if (!spec || !spec.archetype) { errors.push(`${where}: missing (or no archetype)`); return null; }
    const type = spec.archetype;
    const out = {
      type,
      caption: spec.caption || SHOWCASE_LABELS[type],
      quote: strip(theme, spec.quote, `${where}.quote`),
      delay: strip(theme, spec.delay, `${where}.delay`),
      lines: [],
      // A noteLine already quoted inside the note string is not printed twice.
      noteHtml: [note(theme, spec.note, `${where}.note`), ...resolve(theme, (spec.noteLines || []).filter(l => !(typeof spec.note === 'string' && spec.note.includes(l.excerpt))), `${where}.noteLines`).map(l => l.inlineHtml)].filter(Boolean).join(' '),
    };
    switch (type) {
      case 'confrontation': {
        if (!Array.isArray(spec.sides) || spec.sides.length !== 2) { errors.push(`${where}: confrontation needs exactly 2 sides`); return out; }
        const rows = spec.rows || null;
        const side = (s, k) => {
          const ls = (s.lines || []).map((l, i) => ({ row: l.row, r: line(theme, l, `${where}.sides[${k}].lines[${i}]`) }));
          const items = [];
          const push = group => { for (const u of units(group)) items.push({ html: u.html, ref: u.ref }); };
          if (rows) {
            for (const l of ls) if (l.row != null && !(l.row >= 0 && l.row < rows.length)) errors.push(`${where}.sides[${k}]: row ${l.row} out of range`);
            push(ls.filter(l => l.row == null).map(l => l.r));
            rows.forEach((label, r) => {
              const group = ls.filter(l => l.row === r).map(l => l.r);
              if (group.length) { items.push({ html: `<span class="crv-rowlabel">${tl(label)}</span>`, ref: null }); push(group); }
            });
          } else push(ls.map(l => l.r));
          return { titleHtml: tl(s.label || s.title || ''), items };
        };
        out.sc = { type, left: side(spec.sides[0], 0), right: side(spec.sides[1], 1), noteHtml: '' };
        const compactSide = s => {
          const refItems = s.items.filter(i => i.ref);
          return { titleHtml: s.titleHtml, items: refItems.length ? [{ html: refItems.map(i => i.html).join(' <br> '), ref: null }] : [] };
        };
        out.compact = { type, left: compactSide(out.sc.left), right: compactSide(out.sc.right) };
        break;
      }
      case 'timeline': {
        const pts = (spec.points || []).map((p, i) => ({ step: p.label || p.step, ls: resolve(theme, p.lines, `${where}.points[${i}].lines`) }));
        if (!pts.length) errors.push(`${where}: timeline needs points`);
        out.sc = { type, points: pts.map(p => ({ year: p.step, labelHtml: joinLines(p.ls, ' <br>'), ref: null })) };
        out.compact = { type, points: pts.map(p => ({ year: p.step, labelHtml: units(p.ls).map(u => u.html).join(' '), ref: null })) };
        break;
      }
      case 'versions': {
        const items = (spec.tabs || []).map((tab, i) => ({ labelHtml: tl(tab.label), wordingHtml: joinLines(resolve(theme, tab.lines, `${where}.tabs[${i}].lines`), ' … '), arabic: '', ref: null }));
        if (items.length < 2) errors.push(`${where}: versions needs at least 2 tabs`);
        const head = spec.head ? `${spec.head.label ? `${tl(spec.head.label)} ` : ''}${joinLines(resolve(theme, spec.head.lines, `${where}.head.lines`), ' … ')}` : '';
        out.sc = { type, items, headHtml: head };
        out.compact = { type, items: items.map(i => ({ labelHtml: i.labelHtml })) };
        break;
      }
      case 'number_fan': {
        const items = (spec.values || []).map((v, i) => {
          const r = line(theme, { ...v, label: v.linkLabel, pre: v.pre ?? (v.label ? `${v.label}:` : undefined) }, `${where}.values[${i}]`); // `label` is the fan's caption, not the link's
          return { value: v.value, labelHtml: tl(v.label || ''), ref: r.ref, anchor: r.sourceAnchor, lineHtml: r.inlineHtml };
        });
        const pairs = items.map(i => `${i.value} ${i.labelHtml}`);
        if (new Set(pairs).size !== pairs.length) errors.push(`${where}: number fan value+label pairs must be distinct`);
        out.sc = { type, items, unitHtml: tl(spec.unit || '') };
        out.compact = out.sc;
        out.lines = items.map(i => i.lineHtml);
        break;
      }
      case 'facts': {
        const items = (spec.findings || []).map((f, i) => {
          const r = line(theme, { ...f, label: f.linkLabel, pre: f.pre ?? (f.label ? `${f.label}:` : undefined) }, `${where}.findings[${i}]`); // `label` leads the row
          return { html: r.html, anchor: r.sourceAnchor, href: r.ref?.href }; // href handles other-chapter / Qurʾān targets
        });
        out.sc = { type, items };
        out.compact = out.sc;
        break;
      }
      default:
        errors.push(`${where}: unknown archetype "${type}"`);
    }
    return out;
  }

  function cards(theme, layout = {}, summaries = {}) {
    const srcs = sourcesOf.get(theme) || [];
    const n = srcs.length;
    const nested = layout.nested || {};
    const nestedItems = Object.values(nested).flatMap(x => x.items || []);
    const valid = i => Number.isInteger(i) && i >= 0 && i < n;
    for (const i of [...(layout.open || layout.order || []), ...(layout.collapsed || []), ...nestedItems, ...Object.keys(nested).map(Number), ...Object.keys(summaries).map(Number)]) {
      if (!valid(i)) errors.push(`${theme}.sources: index ${i} out of range (0..${n - 1})`);
    }
    for (const lead of Object.keys(nested).map(Number)) if (nestedItems.includes(lead)) errors.push(`${theme}.sources.nested: ${lead} is both a lead and a nested report`);
    // Invalid indices are reported above and left out, so the build fails with the summary, not a TypeError.
    const open = (layout.open || layout.order || [...Array(n).keys()].filter(i => !nestedItems.includes(i)).slice(0, 3)).filter(valid);
    const collapsed = (layout.collapsed || []).filter(valid);
    const seen = new Map();
    for (const i of [...open, ...collapsed, ...nestedItems]) seen.set(i, (seen.get(i) || 0) + 1);
    for (const [i, c] of seen) if (c > 1) errors.push(`${theme}.sources: index ${i} placed more than once`);
    const drawer = [...collapsed, ...[...Array(n).keys()].filter(i => !seen.has(i))];

    const card = (i, num) => {
      const s = srcs[i];
      const long = s.english.split(/\s+/).length > LONG_WORDS;
      const summaryLabel = summaries[i] ?? summaries[String(i)];
      const isSummary = summaryLabel != null;
      return {
        index: i, n: num, anchor: anchorOf(theme, i), stage: s.flowStage, stageLabel: deckOf(theme).stageLabels?.[s.flowStage] || '',
        reference: s.reference, english: s.english, arabic: s.arabic, arabicHtml: s.arabicHtml, summary: isSummary,
        summaryLabel: isSummary ? (summaryLabel || LABELS.summary.replace('{ref}', s.reference)) : '',
        summaryHtml: isSummary ? escapeHtml(s.english).replace(ARABIC_RUN, m => `<span class="hrv-ar-inline" lang="ar" dir="rtl">${m.trim()}</span>`).replace(/\[(<span class="hrv-ar-inline"[^>]*>[^<]*<\/span>)\]/g, '$1') : '',
        long, chips: s.chips, linkless: s.linkless, nested: [],
      };
    };
    let num = 0;
    const build = i => {
      const c = card(i, ++num);
      if (nested[i]) {
        c.nested = nested[i].items.filter(valid).map(j => card(j, ++num));
        c.nestedLabel = (nested[i].label || '{n} more reports').replace('{n}', nested[i].items.length);
      }
      return c;
    };
    return { open: open.map(build), drawer: drawer.map(build), count: n };
  }

  function provenance(theme, p) {
    if (!p || !['addresses', 'scope'].includes(p.pattern) || !p.verse || !Array.isArray(p.occasion)) { errors.push(`${theme}.provenance: needs { pattern: addresses|scope, verse, occasion[] }`); return null; }
    return {
      mode: p.pattern,
      leadLabel: p.pattern === 'addresses' ? LABELS.provAddresses : LABELS.provScope,
      lead: `Qurʾān ${p.verse}`,
      occasionLabel: p.occasionLabel || LABELS.provOccasion,
      occasion: p.occasion,
      extraLabel: p.extraLabel !== undefined ? p.extraLabel : (LABELS.provExtra || ''),
      extra: p.extra || '',
    };
  }

  const items = order.map((theme, i) => {
    const cfg = ITEMS[theme];
    const deck = deckOf(theme);
    const t = byTheme.get(theme);
    const copy = {
      title: copyField(deck.title, `${theme}.title`, 'plain', errors),
      hook: copyField(deck.hook, `${theme}.hook`, 'inline', errors),
      takeaway: copyField(deck.takeaway, `${theme}.takeaway`, 'inline', errors),
      about: copyField(deck.about, `${theme}.about`, 'block', errors),
      classical: copyField(deck.classical?.text, `${theme}.classical.text`, 'block', errors),
      comparing: copyField(deck.comparing?.text, `${theme}.comparing.text`, 'block', errors),
    };
    const stageLabels = deck.stageLabels || {};
    const stages = [...new Set((t.orthodox_sources || []).map(s => s.flow_stage))];
    for (const st of stages) if (!stageLabels[st]) errors.push(`${theme}: flow_stage "${st}" has no stage label`);
    for (const st of Object.keys(stageLabels)) if (!stages.includes(st)) errors.push(`${theme}: stage label for unknown flow_stage "${st}"`);
    return {
      theme, id: cfg.id, part: cfg.part, order: cfg.order, number: i + 1, total,
      href: `${BASE_PATH}/${cfg.part}#${cfg.id}`,
      legacy: { top: cfg.legacy, claim: `${cfg.legacy}-claim`, defense: `${cfg.legacy}-defense`, counter: `${cfg.legacy}-counter` },
      copy, stages: stageLabels,
      provenance: provenance(theme, deck.provenance),
      showcase: showcase(theme, deck.showcase),
      sources: cards(theme, deck.sources || {}, deck.summaries || {}),
      aside: cfg.aside || null,
      crossLinksCfg: deck.crossLinks || [],
    };
  });

  const itemByTheme = new Map(items.map(it => [it.theme, it]));
  const parts = PARTS.map((p, i) => {
    const its = items.filter(it => it.part === p.slug);
    for (const k of ['label', 'question', 'h1', 'dek']) if (!p[k]) errors.push(`part ${p.slug}: missing ${k}`);
    if (!p.seo?.title || !p.seo?.description) errors.push(`part ${p.slug}: missing seo`);
    return { ...p, index: i, number: i + 1, total: PARTS.length, href: `${BASE_PATH}/${p.slug}`, items: its };
  });
  const brief = p => (p ? { slug: p.slug, number: p.number, label: p.label, href: p.href } : null);
  parts.forEach((p, i) => { p.prev = brief(parts[i - 1]); p.next = brief(parts[i + 1]); });

  for (const it of items) {
    const part = parts.find(p => p.slug === it.part);
    const k = part.items.indexOf(it);
    const nextItem = part.items[k + 1];
    it.partNumber = part.number;
    it.partLabel = part.label;
    it.next = nextItem
      ? { kind: 'item', href: `#${nextItem.id}`, label: LABELS.next, titleHtml: nextItem.copy.title.html }
      : part.next
        ? { kind: 'part', href: part.next.href, label: LABELS.nextChapter, titleHtml: tl(part.next.label) }
        : { kind: 'hub', href: BASE_PATH, label: LABELS.lastChapter, titleHtml: tl(LABELS.backToAll.replace('{n}', total)) };
    it.crossLinks = it.crossLinksCfg.map(c => {
      const target = itemByTheme.get(c.target);
      if (!target) { errors.push(`${it.theme}.crossLinks: unknown target ${c.target}`); return null; }
      return { labelHtml: renderer.inline(c.label), href: target.part === it.part ? `#${target.id}` : target.href };
    }).filter(Boolean);
    delete it.crossLinksCfg;
  }

  // sources per part (grouped by repository) and article-wide stats
  const allChips = (its, { primaryOnly = false } = {}) => its.flatMap(it => [...it.sources.open, ...it.sources.drawer].flatMap(c => [c, ...c.nested]).flatMap(c => c.chips)).filter(c => !primaryOnly || !c.secondary);
  const groupChips = chips => {
    const seen = new Set();
    const groups = new Map(SOURCE_GROUPS.map(g => [g.kind, { ...g, items: [] }]));
    for (const c of chips) {
      if (seen.has(c.href)) continue;
      seen.add(c.href);
      const g = groups.get(c.group) || groups.get('other');
      g.items.push({ href: c.href, attrs: c.attrs, title: c.title, label: c.label, external: c.external });
    }
    return [...groups.values()].filter(g => g.items.length);
  };
  for (const p of parts) {
    p.sourceGroups = groupChips(allChips(p.items));
    p.citations = groupChips(allChips(p.items, { primaryOnly: true })).flatMap(g => g.items);
  }
  // Hub counts cover every reference a reader can open from the cards (primary and secondary chips).
  const statChips = allChips(items);
  const uniq = (kinds, key) => new Set(statChips.filter(c => kinds.includes(c.kind)).map(key)).size;
  const verseKey = c => `${c.surah}:${c.ayah}`; // by starting verse: "33:28" and "33:28–29" are one passage
  const sourceStats = [
    { key: 'quran', count: uniq(['quran'], verseKey) },
    { key: 'bukhari', count: uniq(['bukhari'], c => c.number) },
    { key: 'muslim', count: uniq(['muslim'], c => c.number) },
    { key: 'otherHadith', count: uniq(['abudawud', 'nasai', 'tirmidhi'], c => `${c.kind}:${c.number}`) },
    { key: 'tabari', count: uniq(['tabari'], verseKey) },
    { key: 'ibnKathir', count: uniq(['ibnKathir'], verseKey) },
    { key: 'otherWorks', count: uniq(['ibnAbiShaybah', 'sira', 'otherWork'], c => c.href) },
  ].filter(s => s.count > 0).map(s => ({ ...s, label: STAT_LABELS[s.key] }));
  // "other ḥadīth collections ({names})": name only the collections actually linked.
  const OTHER_NAMES = { abudawud: 'Abū Dāwūd', nasai: 'al-Nasāʾī', tirmidhi: 'al-Tirmidhī', ibnAbiShaybah: 'Ibn Abī Shaybah' };
  const otherKinds = [...new Set(statChips.map(c => c.kind))].filter(k => OTHER_NAMES[k] && k !== 'ibnAbiShaybah');
  const WORK_NAMES = { ibnAbiShaybah: 'Muṣannaf Ibn Abī Shaybah', sira: 'Ibn Isḥāq’s Sīrah', otherWork: 'other classical works' };
  const workKinds = [...new Set(statChips.map(c => c.kind))].filter(k => WORK_NAMES[k]);
  for (const st of sourceStats) {
    if (st.key === 'otherHadith') st.label = st.label.replace('{names}', otherKinds.map(k => OTHER_NAMES[k]).join(', '));
    if (st.key === 'otherWorks') st.label = st.label.replace('{names}', workKinds.map(k => WORK_NAMES[k]).join(', '));
  }

  const allCards = items.flatMap(it => [...it.sources.open, ...it.sources.drawer].flatMap(c => [c, ...c.nested]));
  const counts = {
    themes: themes.length,
    items: items.length,
    sources: allCards.length,
    citations: themes.reduce((n, t) => n + (t.orthodox_sources || []).reduce((m, s) => m + splitRefs(s.reference).length, 0), 0),
    arabic: allCards.filter(c => c.arabic).length,
    linkless: allCards.filter(c => c.linkless).map(c => c.anchor),
  };

  if (errors.length) throw new Error(`[convenientRevelations] ${errors.length} problem(s):\n  - ${errors.join('\n  - ')}`);

  return { items, parts, startHere: items[0], sourceStats, counts };
}

let cache = null;
/** Memoised model of the real dataset + config (the Astro pages and the audit call this). */
export function loadConvenientRevelations() {
  if (!cache) cache = buildModel(data, CONFIG);
  return cache;
}
