/**
 * Pure view-model builder for /discover/from-mecca-to-medina.
 *
 * `buildModel(dataset, config, providers)` turns the read-only dataset (a nested object: abstract,
 * sections[0..7]) plus the copy/presentation config into plain objects for the page, reusing the
 * hadith-reliability showcase shapes. No I/O here: `loader.js` imports the dataset and supplies the
 * repo corpora through `providers`; tests pass fixtures.
 *
 *   providers = {
 *     suraType(s)        → 'meccan' | 'medinan' | undefined   (src/data/quran/arabic/meta.json)
 *     suraCounts         → { meccan, medinan }
 *     quranVerse(s, a)   → { en, ar } | null                  (Droge English, Ḥafṣ Arabic)
 *     tafsir(id, s, a)   → English commentary text | null     (id: 'tabari' | 'ibn_kathir')
 *     hadithCorpus(key)  → { english, arabic } | null         (src/data/hadith, Bukhārī/Muslim only)
 *   }
 *
 * The build FAILS (one error listing every problem) when:
 *   - a config path (own / evidence / showcase from|ref / printRefs / quoteFix ref) matches no node, or a
 *     prefixed ref (quran: / tafsir: / hadith: / item:) resolves to nothing;
 *   - an item id is placed zero times or more than once, or is not in ITEMS;
 *   - a dataset leaf is placed zero times (and is not in NOT_RENDERED) or more than once;
 *   - an excerpt / quote / Arabic excerpt is not verbatim in its source (after quoteFixes + normalisation);
 *   - a quoteFix is malformed, names a missing field, has no reason/sourceUrl, or changes nothing;
 *   - a hadith has no Sunnah.com URL, or its label number disagrees with its URL; an extra hadith
 *     disagrees with the repo corpus; a Qurʾān reference has no Meccan/Medinan label;
 *   - copy uses an unknown `{placeholder}`; a legacy anchor targets nothing or collides with a live id;
 *     the page would emit an id twice; an in-page `[x](#id)` link in our copy lands on no id; a site
 *     link is not /quran|bible|discover|hadith/… (no `//host`);
 *   - an override is stale: an EXTRA_HADITH entry no `hadith:` ref uses, a quote fix whose field the page
 *     never shows, a NOT_RENDERED pattern that matches no leaf / is unanchored / names a placed leaf;
 *   - a quote fix's `replace` target is empty or not unique (unless `all: true`), or two fixes hit one field;
 *   - a config object has a key its shape does not know (`SHAPES`: catches `exerpt`, `deck`, …).
 *
 * Renderers register every source they link to, so all of them (items, sections, intro, closing) run
 * before the "Check the sources" snapshot and before the error check.
 */
import { createRenderer, linkFor, plainText, tl, escapeAttr } from '../hadithReliability/render.js';

const TAG = '[meccaToMedina]';

// ---------------------------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------------------------

const PATH_RE = /^[A-Za-z_]\w*(?:\[\d+\]|\.[A-Za-z_]\w*)*$/;
export const isPath = s => typeof s === 'string' && PATH_RE.test(s);

/** `sections[1].stages[0].name` → ['sections', 1, 'stages', 0, 'name']; null when malformed. */
export function parsePath(path) {
  if (!isPath(path)) return null;
  const tokens = [];
  const re = /^([A-Za-z_]\w*)|\[(\d+)\]|\.([A-Za-z_]\w*)/g;
  let m;
  while ((m = re.exec(path))) tokens.push(m[1] ?? (m[2] !== undefined ? Number(m[2]) : m[3]));
  return tokens;
}

export function resolvePath(data, path) {
  const tokens = parsePath(path);
  if (!tokens) return undefined;
  let node = data;
  for (const t of tokens) {
    if (node == null || typeof node !== 'object') return undefined;
    node = node[t];
  }
  return node;
}

/** Every leaf (string / number / boolean) under `node`, as full paths. */
export function leafPaths(node, base = '') {
  const out = [];
  const walk = (n, p) => {
    if (Array.isArray(n)) n.forEach((x, i) => walk(x, `${p}[${i}]`));
    else if (n && typeof n === 'object') for (const k of Object.keys(n)) walk(n[k], p ? `${p}.${k}` : k);
    else if (n !== null && n !== undefined) out.push(p);
  };
  walk(node, base);
  return out;
}

// ---------------------------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------------------------

/**
 * Display form of a dataset/corpus English text: markdown `>` / `#` heading marks / `*` dropped, the
 * translators' ASCII backtick ʿayn (Muhsin Khan's "Sa`d", "`Umar") shown as ʿ (display only, as in the
 * /hadith pipeline; the data keeps the backtick), spaces tidied. Verbatim checks compare in this form.
 */
export const norm = s => String(s ?? '').replace(/^[ \t]*>[ \t]?/gm, '').replace(/^[ \t]*#{1,6}[ \t]+/gm, '').replace(/\*+/g, '').replace(/`/g, 'ʿ').replace(/\s+/g, ' ').trim();
/** Display form of Arabic: NFC, bidi marks dropped, spaces tidied. */
export const normArabic = s => String(s ?? '').normalize('NFC').replace(/[\u200e\u200f]/g, '').replace(/\s+/g, ' ').trim();
const HEADING_LINE = /^[ \t]*#{1,6}[ \t]+([^\n]*)(?:\n([\s\S]*))?$/;
/**
 * Paragraphs for display, as `{ text, sub }`. A markdown heading line inside a source (`### Shirk is
 * Worse Than Killing` in Ibn Kathīr) becomes a `sub` line: shown as a bold line inside the quote, never
 * an h-tag, so the page outline stays ours. A paragraph that starts in lower case continues the
 * previous one ("…that: {verse}\n\nmeans, …").
 */
const paragraphsOf = s => String(s ?? '').split(/\n\s*\n/).flatMap(p => {
  const h = p.match(HEADING_LINE);
  return h ? [{ text: norm(h[1]), sub: true }, { text: norm(h[2]), sub: false }] : [{ text: norm(p), sub: false }];
}).filter(p => p.text)
  .reduce((acc, p) => { const last = acc[acc.length - 1]; if (last && !last.sub && !p.sub && /^[a-z]/.test(p.text)) last.text += ` ${p.text}`; else acc.push({ ...p }); return acc; }, []);
/** Plain text → safe HTML (tl) with ﷺ set in the Arabic face, which has the glyph. */
const en = s => tl(s).replace(/ﷺ/g, '<span class="mm-saw" lang="ar">ﷺ</span>');
const textOf = v => (v == null ? '' : typeof v === 'object' && !Array.isArray(v) && 'text' in v ? v.text : v);
const fill = (tpl, vars, onMissing = () => {}) => String(tpl ?? '').replace(/\{(\w+)\}/g, (m, k) => {
  if (vars[k] != null) return String(vars[k]);
  onMissing(k);
  return m;
});
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const arNum = n => String(n).replace(/\d/g, d => AR_DIGITS[d]);

export const COLLECTIONS = {
  bukhari: { short: 'Bukhārī', long: 'Ṣaḥīḥ al-Bukhārī', order: 0 },
  muslim: { short: 'Muslim', long: 'Ṣaḥīḥ Muslim', order: 1 },
  abudawud: { short: 'Abū Dāwūd', long: 'Sunan Abī Dāwūd', order: 2 },
  tirmidhi: { short: 'Tirmidhī', long: 'Jāmiʿ al-Tirmidhī', order: 3 },
  nasai: { short: 'Nasāʾī', long: 'Sunan al-Nasāʾī', order: 4 },
  ibnmajah: { short: 'Ibn Mājah', long: 'Sunan Ibn Mājah', order: 5 },
};
const TAFSIR_NAMES = { tabari: { name: 'al-Ṭabarī', work: 'Tafsīr al-Ṭabarī', order: 0 }, ibn_kathir: { name: 'Ibn Kathīr', work: 'Tafsīr Ibn Kathīr', order: 1 } };

/** `https://sunnah.com/bukhari:25` → { key: 'bukhari:25', coll, num }. */
export function sunnahKey(url) {
  const m = String(url || '').match(/^https:\/\/sunnah\.com\/([a-z]+)[:/]([\w.]+)$/i);
  return m ? { key: `${m[1].toLowerCase()}:${m[2]}`, coll: m[1].toLowerCase(), num: m[2] } : null;
}

// ---------------------------------------------------------------------------------------------
// Config shapes: a misspelt key (`exerpt`, `deck`) would otherwise be ignored silently
// ---------------------------------------------------------------------------------------------

const PART_KEYS = ['text', 'quote', 'arabic', 'from', 'mark', 'cite'];
export const SHAPES = {
  item: ['own', 'title', 'hook', 'takeaway', 'showcase', 'evidence', 'classical', 'comparison', 'collapsed', 'tables'],
  evidence: ['from', 'excerpt', 'label', 'lead', 'note', 'grade', 'parallel', 'heading'],
  collapsed: ['heading', 'badge', 'body', 'showcase', 'evidence', 'printRefs', 'own'],
  section: ['id', 'own', 'question', 'dek', 'items'],
  table: ['title', 'headers', 'rows'],
  printRef: ['ref', 'note'],
  quoteFix: ['ref', 'field', 'value', 'replace', 'prepend', 'append', 'all', 'reason', 'sourceUrl'],
  extraHadith: ['url', 'reference', 'text', 'mirror', 'reason'],
  part: PART_KEYS,
  showcase: ['type', 'caption', 'note', 'lead', 'unit', 'points', 'items', 'left', 'right', 'builder', 'groups'],
  point: ['year', 'parts', 'tag', 'quote', 'text', 'from', 'mark', 'ref'],
  'item:versions': ['label', 'quote', 'text', 'from', 'mark', 'arabic', 'ref'],
  'item:witnesses': ['who', 'work', 'quote', 'text', 'from', 'mark', 'ref'],
  'item:number_fan': ['value', 'text', 'quote', 'from', 'mark', 'ref'],
  'item:bars': ['value', 'text', 'ref'],
  'item:facts': PART_KEYS,
  side: ['title', 'items'],
  sideItem: [...PART_KEYS, 'ref'],
  group: ['text', 'from'],
  hideArabic: ['corpus', 'corrupt', 'reason'],
};
const checkShape = (obj, shape, where, err) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return;
  const allowed = SHAPES[shape];
  for (const k of Object.keys(obj)) if (!allowed.includes(k)) err(`${where}: unknown key "${k}" (allowed for ${shape}: ${allowed.join(', ')})`);
};

// ---------------------------------------------------------------------------------------------
// Quote fixes (applied to a clone of the dataset before anything reads it)
// ---------------------------------------------------------------------------------------------

/**
 * Returns { data, log, errors }; `log` rows feed data_proposals.md (before → after).
 * `replace: [[from, to], …]`: each `from` must be non-empty and occur exactly once (pass `all: true` on
 * the fix to replace every occurrence). One fix per ref + field.
 */
export function applyQuoteFixes(dataset, fixes = []) {
  const data = JSON.parse(JSON.stringify(dataset));
  const log = [];
  const errors = [];
  const seen = new Map();
  fixes.forEach((f, i) => {
    const where = `QUOTE_FIXES[${i}]`;
    if (!f || !isPath(f.ref)) { errors.push(`${where}: ref "${f?.ref}" is not a dataset path`); return; }
    const id = `${f.ref}|${f.field}`;
    if (seen.has(id)) errors.push(`${where}: ${f.ref}.${f.field} already has a fix (${seen.get(id)}); merge them`);
    else seen.set(id, where);
    if (!f.reason) errors.push(`${where}: every quote fix needs a reason`);
    if (!/^https:\/\//.test(String(f.sourceUrl || ''))) errors.push(`${where}: every quote fix needs an https sourceUrl`);
    const ops = ['value', 'replace', 'prepend', 'append'].filter(k => f[k] !== undefined);
    if (!ops.length) { errors.push(`${where}: needs value, replace, prepend or append`); return; }
    if (f.value !== undefined && ops.length > 1) errors.push(`${where}: \`value\` replaces the whole field; do not combine it with other operations`);
    const tokens = parsePath(f.ref);
    const node = resolvePath(data, f.ref);
    let parent, key;
    if (f.field === '$') {
      parent = resolvePath(data, f.ref.replace(/(\[\d+\]|\.[A-Za-z_]\w*)$/, ''));
      key = tokens[tokens.length - 1];
      if (typeof node !== 'string') { errors.push(`${where}: field "$" needs ${f.ref} to be a string`); return; }
    } else {
      if (!node || typeof node !== 'object') { errors.push(`${where}: path ${f.ref} matches no dataset object`); return; }
      if (typeof node[f.field] !== 'string') { errors.push(`${where}: ${f.ref} has no string field "${f.field}"`); return; }
      parent = node; key = f.field;
    }
    const before = parent[key];
    let after = before;
    if (f.value !== undefined) after = String(f.value);
    for (const [from, to] of f.replace || []) {
      const hits = from ? after.split(from).length - 1 : 0;
      if (!from) errors.push(`${where}: a replace target must be a non-empty string`);
      else if (!hits) errors.push(`${where}: replace target "${String(from).slice(0, 60)}" not found in ${f.ref}.${f.field}`);
      else if (hits > 1 && !f.all) errors.push(`${where}: replace target "${String(from).slice(0, 60)}" occurs ${hits} times in ${f.ref}.${f.field} (make it unique or set all: true)`);
      if (from) after = after.split(from).join(to);
    }
    if (f.prepend !== undefined) after = String(f.prepend) + after;
    if (f.append !== undefined) after += String(f.append);
    if (f.field === 'url' && !sunnahKey(after)) errors.push(`${where}: url fix "${after}" is not a https://sunnah.com/<collection>:<number> URL`);
    if (after === before) errors.push(`${where}: the fix does not change ${f.ref}.${f.field}`);
    parent[key] = after;
    log.push({ ref: f.ref, field: f.field, before, after, reason: f.reason, sourceUrl: f.sourceUrl });
  });
  return { data, log, errors };
}

// ---------------------------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------------------------

export function buildModel(dataset, config, providers = {}) {
  const errors = [];
  const warnings = [];
  const err = msg => errors.push(msg);
  const md = createRenderer();
  const C = config;
  const L = C.LABELS;
  const BASE = C.BASE ?? '';
  const P = {
    suraType: () => undefined, suraCounts: { meccan: 0, medinan: 0 }, quranVerse: () => null, tafsir: () => null, hadithCorpus: () => null,
    ...providers,
  };
  if (!dataset || typeof dataset !== 'object' || Array.isArray(dataset)) throw new Error(`${TAG} dataset must be an object`);

  const fixed = applyQuoteFixes(dataset, C.QUOTE_FIXES || []);
  fixed.errors.forEach(err);
  const data = fixed.data;

  // ---- config shapes (typos fail instead of being ignored) ------------------------------------------
  const partsShape = (v, where) => (Array.isArray(v) ? v : v ? [v] : []).forEach((p, i) => checkShape(p, 'part', `${where}[${i}]`, err));
  const showcaseShape = (sc, where) => {
    if (!sc) return;
    checkShape(sc, 'showcase', where, err);
    partsShape(sc.note, `${where}.note`); partsShape(sc.lead, `${where}.lead`); partsShape(sc.unit, `${where}.unit`);
    (sc.points || []).forEach((p, i) => { checkShape(p, 'point', `${where}.points[${i}]`, err); partsShape(p.parts, `${where}.points[${i}].parts`); });
    if (SHAPES[`item:${sc.type}`]) (sc.items || []).forEach((it, i) => checkShape(it, `item:${sc.type}`, `${where}.items[${i}]`, err));
    (sc.groups || []).forEach((g, i) => checkShape(g, 'group', `${where}.groups[${i}]`, err));
    for (const s of ['left', 'right']) if (sc[s]) { checkShape(sc[s], 'side', `${where}.${s}`, err); (sc[s].items || []).forEach((it, i) => checkShape(it, 'sideItem', `${where}.${s}.items[${i}]`, err)); }
  };
  const evidenceShape = (list, where) => (list || []).forEach((e, i) => { checkShape(e, 'evidence', `${where}[${i}]`, err); partsShape(e?.lead, `${where}[${i}].lead`); partsShape(e?.note, `${where}[${i}].note`); });
  for (const [id, it] of Object.entries(C.ITEMS || {})) {
    const w = `ITEMS["${id}"]`;
    checkShape(it, 'item', w, err);
    showcaseShape(it.showcase, `${w}.showcase`);
    evidenceShape(it.evidence, `${w}.evidence`);
    (it.tables || []).forEach((t, i) => checkShape(t, 'table', `${w}.tables[${i}]`, err));
    for (const k of ['classical', 'comparison']) if (Array.isArray(it[k]) || (it[k] && typeof it[k] === 'object')) partsShape(it[k], `${w}.${k}`);
    (it.collapsed || []).forEach((c, i) => {
      checkShape(c, 'collapsed', `${w}.collapsed[${i}]`, err);
      showcaseShape(c.showcase, `${w}.collapsed[${i}].showcase`);
      evidenceShape(c.evidence, `${w}.collapsed[${i}].evidence`);
      (c.printRefs || []).forEach((r, k) => checkShape(r, 'printRef', `${w}.collapsed[${i}].printRefs[${k}]`, err));
    });
  }
  (C.SECTIONS || []).forEach((s, i) => checkShape(s, 'section', `SECTIONS[${i}]`, err));
  (C.QUOTE_FIXES || []).forEach((f, i) => checkShape(f, 'quoteFix', `QUOTE_FIXES[${i}]`, err));
  Object.entries(C.EXTRA_HADITH || {}).forEach(([k, x]) => checkShape(x, 'extraHadith', `EXTRA_HADITH["${k}"]`, err));
  evidenceShape(C.CLOSING?.reflection?.evidence, 'CLOSING.reflection.evidence');

  // ---- placement of dataset leaves ---------------------------------------------------------------
  // NOT_RENDERED: anchored patterns (`…$`) for leaves no reader needs (ids, numbering, meta). Each must
  // match a leaf, and a listed leaf may not also be placed explicitly.
  const allow = (C.NOT_RENDERED || []).map(r => (r instanceof RegExp ? r : new RegExp(r)));
  const notRendered = leaf => allow.some(r => r.test(leaf));
  const claims = new Map(); // leaf path → [where]
  const claim = (path, where) => {
    if (!isPath(path)) { err(`${where}: "${path}" is not a dataset path`); return undefined; }
    const node = resolvePath(data, path);
    if (node === undefined) { err(`${where}: path ${path} matches no dataset node`); return undefined; }
    for (const leaf of leafPaths(node, path)) {
      if (leaf !== path && notRendered(leaf)) continue; // ids / numbering under a placed object
      if (!claims.has(leaf)) claims.set(leaf, []);
      claims.get(leaf).push(where);
    }
    return node;
  };
  const claimAll = (paths, where) => (paths || []).forEach((p, i) => claim(p, `${where}[${i}]`));

  // ---- item placement: every item exactly once -------------------------------------------------
  const itemIds = Object.keys(C.ITEMS || {});
  const placements = new Map(itemIds.map(id => [id, []]));
  const place = (id, where) => {
    if (!placements.has(id)) { err(`${where}: item "${id}" is not defined in ITEMS`); return; }
    placements.get(id).push(where);
  };
  if (C.START_HERE) place(C.START_HERE, 'START_HERE');
  const sectionIds = new Set();
  (C.SECTIONS || []).forEach((s, si) => {
    if (!s.id) err(`SECTIONS[${si}] has no id`);
    if (sectionIds.has(s.id)) err(`SECTIONS: duplicate section id "${s.id}"`);
    sectionIds.add(s.id);
    (s.items || []).forEach(id => place(id, `SECTIONS["${s.id}"]`));
  });
  for (const [id, where] of placements) {
    if (where.length === 0) err(`item "${id}" appears in no section (and is not START_HERE)`);
    if (where.length > 1) err(`item "${id}" appears ${where.length} times: ${where.join(', ')}`);
  }
  const reading = [];
  if (C.START_HERE && C.ITEMS?.[C.START_HERE]) reading.push({ id: C.START_HERE, section: null });
  (C.SECTIONS || []).forEach((s, si) => (s.items || []).forEach(id => { if (C.ITEMS?.[id]) reading.push({ id, section: { ...s, number: si + 1 } }); }));
  const numberOf = new Map(reading.map((o, i) => [o.id, i + 1]));
  const total = reading.length;

  const counts = { items: total, total, meccanSuras: P.suraCounts.meccan, medinanSuras: P.suraCounts.medinan };
  const fillCopy = (tpl, vars = counts) => fill(tpl, vars, k => err(`unknown placeholder {${k}} in "${String(tpl).slice(0, 70)}"`));

  // ---- sources ---------------------------------------------------------------------------------
  // Keyed by what is cited (quran:2:109, tafsir:tabari:2:109, sunnah:bukhari:25, url:…), not by href:
  // a Qurʾān row and al-Ṭabarī's commentary on that verse open the same page but are two sources.
  const sources = new Map(); // canonical key → row for "Check the sources"
  const addSource = (row) => { if (row?.key && !sources.has(row.key)) sources.set(row.key, row); };
  const internalHref = href => (String(href).startsWith('#') ? href : `${BASE}${href}`);

  const suraLabel = (s, where) => {
    const t = P.suraType(Number(s));
    if (t !== 'meccan' && t !== 'medinan') { err(`${where}: Qurʾān ${s} has no Meccan/Medinan label`); return ''; }
    return t === 'meccan' ? L.meccan : L.medinan;
  };
  const quranLink = (s, a) => linkFor(`https://quran.com/${s}/${a}`);
  const registerQuran = (s, a, b, where) => {
    const link = quranLink(s, a);
    const keyTxt = `${s}:${a}${b ? `–${b}` : ''}`;
    addSource({ key: `quran:${s}:${a}${b ? `-${b}` : ''}`, kind: 'quran', label: `Qurʾān ${keyTxt} · ${suraLabel(s, where)}`, href: link.href, attrs: link.attrs, external: false, title: link.title, sortKey: [Number(s), Number(a), Number(b || 0)] });
    return link;
  };
  const tafsirLink = (id, s, a) => ({ href: `${BASE}/quran/${s}/${a}/tafsir/${id}`, external: false, kind: 'tafsir', attrs: {}, title: `${TAFSIR_NAMES[id]?.work || id} on Qurʾān ${s}:${a}` });
  const registerTafsir = (id, s, a) => {
    const link = tafsirLink(id, s, a);
    addSource({ key: `tafsir:${id}:${s}:${a}`, kind: 'tafsir', label: `${TAFSIR_NAMES[id]?.name || id} on ${s}:${a}`, href: link.href, attrs: {}, external: false, title: link.title, sortKey: [Number(s), Number(a), TAFSIR_NAMES[id]?.order ?? 9] });
    return link;
  };
  const registerSunnah = (url, labelOverride) => {
    const k = sunnahKey(url);
    if (!k) return null;
    const c = COLLECTIONS[k.coll] || { long: k.coll, short: k.coll, order: 9 };
    const link = linkFor(url);
    addSource({ key: `sunnah:${k.key}`, kind: 'sunnah', label: labelOverride || `${c.long} ${k.num}`, href: link.href, attrs: link.attrs, external: true, title: `${c.long} ${k.num} on Sunnah.com`, sortKey: [c.order, parseInt(k.num, 10), k.num] });
    return link;
  };

  // ---- source resolution (dataset node | quran: | tafsir: | hadith:) ---------------------------
  const renderedPaths = new Set(); // dataset paths a renderer actually shows (quote fixes must target one)
  const usedExtra = new Set();     // EXTRA_HADITH keys some hadith: ref uses
  const sourceCache = new Map();
  const source = (ref, where) => {
    if (sourceCache.has(ref)) return sourceCache.get(ref);
    const s = resolveSource(ref, where);
    if (s) sourceCache.set(ref, s);
    return s;
  };
  const hadithSource = ({ url, text, collection, reference, ref, path, extra }, where) => {
    const k = sunnahKey(url);
    if (!k) { err(`${where}: ${ref} has no Sunnah.com URL (got "${String(url).slice(0, 80)}")`); return null; }
    if (!norm(text)) err(`${where}: ${ref} has no English text`);
    const c = COLLECTIONS[k.coll];
    if (!c) err(`${where}: ${ref}: unknown collection "${k.coll}" (add it to COLLECTIONS)`);
    if (collection) {
      const n = (String(collection).match(/(\d+[a-z]?)\s*$/) || [])[1];
      if (n && n !== k.num) err(`${where}: ${ref} is labelled "${collection}" but links to ${url} (fix both together in QUOTE_FIXES)`);
    }
    const corpus = P.hadithCorpus(k.key);
    const hideArabic = !!C.HIDE_HADITH_ARABIC?.[k.key]; // corrupt corpus Arabic: shown nowhere (verbatim policy)
    return {
      ref, path, kind: 'hadith', key: k.key, extra: !!extra, url,
      text, plain: norm(text), paragraphs: paragraphsOf(text),
      arabic: corpus?.arabic && !hideArabic ? normArabic(corpus.arabic) : null,
      label: `${c?.long || k.coll} ${k.num}`, short: `${c?.short || k.coll} ${k.num}`, tag: '', // the label already names the collection
      reference: reference || '',
      chipLabel: L.verifySunnah,
    };
  };
  const quranSource = ({ s, a, b, text, ref, path }, where) => {
    const verses = [];
    for (let v = a; v <= (b || a); v++) verses.push({ v, ...(P.quranVerse(s, v) || {}) });
    const ar = verses.every(x => x.ar) ? verses.map(x => `${normArabic(x.ar)} ﴿${arNum(x.v)}﴾`).join(' ') : null;
    const english = text ?? (verses.every(x => x.en) ? verses.map(x => x.en).join(' ') : null);
    if (!english) { err(`${where}: ${ref}: no English text for Qurʾān ${s}:${a}${b ? `-${b}` : ''} in the repo data`); return null; }
    const keyTxt = `${s}:${a}${b ? `–${b}` : ''}`;
    return {
      ref, path, kind: 'quran', key: `${s}:${a}${b ? `-${b}` : ''}`, s, a, b, extra: !path,
      text: english, plain: norm(english), paragraphs: paragraphsOf(english), arabic: ar,
      label: `Qurʾān ${keyTxt}`, short: `Qurʾān ${keyTxt}`, tag: suraLabel(s, where),
      chipLabel: fillCopy(L.verifyQuran, { key: `${s}:${a}` }),
    };
  };
  const tafsirSource = ({ id, s, a, text, ref, path }, where) => {
    if (!TAFSIR_NAMES[id]) { err(`${where}: ${ref}: unknown tafsīr "${id}"`); return null; }
    if (!norm(text)) { err(`${where}: ${ref}: no tafsīr text`); return null; }
    return {
      ref, path, kind: 'tafsir', key: `${id}:${s}:${a}`, id, s, a, extra: !path,
      text, plain: norm(text), paragraphs: paragraphsOf(text), arabic: null,
      label: `${TAFSIR_NAMES[id].name} on ${s}:${a}`, short: `${TAFSIR_NAMES[id].name} on ${s}:${a}`, tag: L.tafsir,
      chipLabel: L.verifyTafsir,
    };
  };
  function resolveSource(ref, where) {
    if (isPath(ref)) {
      const node = resolvePath(data, ref);
      if (node === undefined) { err(`${where}: path ${ref} matches no dataset node`); return null; }
      renderedPaths.add(ref);
      if (node && typeof node === 'object' && (node.url || node.collection)) {
        return hadithSource({ url: node.url, text: node.text, collection: node.collection, reference: node.reference, ref, path: ref }, where);
      }
      const r = String(node?.reference ?? '');
      const q = r.match(/^quran\/(\d+)\/(\d+)(?:-(\d+))?$/);
      if (q) return quranSource({ s: Number(q[1]), a: Number(q[2]), b: q[3] ? Number(q[3]) : null, text: node.text ?? node.quranicRefutation, ref, path: ref }, where);
      const t = r.match(/^(tabari|ibnkathir)\/(\d+)\/(\d+)$/);
      if (t) return tafsirSource({ id: t[1] === 'ibnkathir' ? 'ibn_kathir' : 'tabari', s: Number(t[2]), a: Number(t[3]), text: node.text ?? node.quote, ref, path: ref }, where);
      err(`${where}: ${ref} is not a hadith, verse or tafsīr node`);
      return null;
    }
    const q = String(ref).match(/^quran:(\d+):(\d+)(?:-(\d+))?$/);
    if (q) return quranSource({ s: Number(q[1]), a: Number(q[2]), b: q[3] ? Number(q[3]) : null, ref }, where);
    const t = String(ref).match(/^tafsir:([a-z_]+):(\d+):(\d+)$/);
    if (t) {
      const text = P.tafsir(t[1], Number(t[2]), Number(t[3]));
      if (!text) { err(`${where}: ${ref}: the repo has no ${t[1]} commentary on ${t[2]}:${t[3]}`); return null; }
      return tafsirSource({ id: t[1], s: Number(t[2]), a: Number(t[3]), text, ref }, where);
    }
    const h = String(ref).match(/^hadith:(.+)$/);
    if (h) {
      const x = C.EXTRA_HADITH?.[h[1]];
      if (!x) { err(`${where}: ${ref}: no EXTRA_HADITH["${h[1]}"]`); return null; }
      usedExtra.add(h[1]);
      return hadithSource({ url: x.url, text: x.text, reference: x.reference, ref, extra: true }, where);
    }
    err(`${where}: unknown source ref "${ref}"`);
    return null;
  }
  /** Registers a source for "Check the sources" and returns its link. */
  const linkOf = (src, where) => {
    if (src.kind === 'hadith') return registerSunnah(src.url);
    if (src.kind === 'quran') return registerQuran(src.s, src.a, src.b, where);
    return registerTafsir(src.id, src.s, src.a);
  };

  // Extra hadith must agree with the repo corpus where it has the same number.
  for (const [key, x] of Object.entries(C.EXTRA_HADITH || {})) {
    const where = `EXTRA_HADITH["${key}"]`;
    const k = sunnahKey(x.url);
    if (!k || k.key !== key) err(`${where}: url ${x.url} does not match its key`);
    if (!x.reason) err(`${where}: needs a reason`);
    if (!/^https:\/\//.test(String(x.mirror || ''))) err(`${where}: needs the mirror URL it was copied from`);
    const corpus = k ? P.hadithCorpus(k.key) : null;
    if (corpus?.english && norm(corpus.english) !== norm(x.text)) err(`${where}: text differs from the repo corpus (src/data/hadith) for ${k.key}`);
  }

  // ---- prose (our voice, markdown) ------------------------------------------------------------
  const SITE_PATH = /^\/(?:quran|bible|discover|hadith)\/[^\s)]*$/;
  const hashLinks = []; // [id, where]: every in-page link in our copy must land on an emitted id
  const internalLinkHtml = (href, labelText) => `<a class="hrv-link hrv-link--internal" href="${escapeAttr(internalHref(href))}">${tl(labelText)}</a>`;
  const noteProseLinks = (s, where) => {
    for (const [, label, url] of String(s).matchAll(/\[((?:[^\[\]]|\[[^\[\]]*\])+)\]\(([^)\s]+)\)/g)) {
      const qd = url.match(/^https:\/\/quran\.com\/(\d+)\/(\d+)$/);
      if (qd) { registerQuran(Number(qd[1]), Number(qd[2]), null, where); continue; }
      const qt = url.match(/^\/quran\/(\d+)\/(\d+)\/tafsir\/(tabari|ibn_kathir)$/);
      if (qt) {
        // `[9:1–7](/quran/9/1/tafsir/tabari)` cites the verses (the site's verse page is al-Ṭabarī's tab, as for
        // every Qurʾān row); `[al-Ṭabarī on 2:190](…)` cites the commentary.
        const v = plainText(label).match(/^(?:Qurʾān\s+)?(\d+):(\d+)(?:[–-](\d+))?$/);
        if (v && v[1] === qt[1] && v[2] === qt[2] && qt[3] === 'tabari') registerQuran(Number(v[1]), Number(v[2]), v[3] ? Number(v[3]) : null, where);
        else registerTafsir(qt[3], Number(qt[1]), Number(qt[2]));
        continue;
      }
      const bb = url.match(/^\/bible\/[a-z0-9]+\/\d+(?:#\d+)?$/);
      if (bb) { addSource({ key: `bible:${url}`, kind: 'bible', label: plainText(label), href: `${BASE}${url}`, attrs: {}, external: false, sortKey: [] }); continue; }
      if (/^\/bible\/[a-z0-9]+\/\d+\/\d+$/.test(url)) { err(`${where}: per-verse Bible link "${url}" must use #verse (e.g. /bible/dt/20#10), per urlFactory.js`); continue; }
      if (url.startsWith('#')) { hashLinks.push([url.slice(1), where]); continue; }
      if (url.startsWith('/')) { if (!SITE_PATH.test(url)) err(`${where}: site link "${url}" must start with /quran/, /bible/, /discover/ or /hadith/ (no //host)`); continue; }
      if (!/^https:\/\//.test(url)) { err(`${where}: link "${url}" must be https:// or a site path`); continue; }
      if (sunnahKey(url)) { registerSunnah(url); continue; }
      const link = linkFor(url);
      addSource({ key: `url:${link.href}`, kind: link.kind === 'classical' ? 'classical' : 'other', label: plainText(label), href: link.href, attrs: link.attrs, external: true, sortKey: [plainText(label)] });
    }
  };
  /**
   * Our copy → HTML. Our copy never uses markdown code spans, so a backtick in it is the ASCII ʿayn of a
   * quoted translation ("Sa`d") and is shown as ʿ, the same display rule as `norm` for source texts.
   */
  const prose = (text, where, { block = false } = {}) => {
    if (text == null || text === '') return '';
    let s = fillCopy(textOf(text)).replace(/`/g, 'ʿ');
    noteProseLinks(s, where);
    const internal = [];
    s = s.replace(/\[([^\]]+)\]\(((?:#|\/)[^)\s]*)\)/g, (_, label, href) => `\u0001${internal.push({ label: plainText(label), href }) - 1}\u0001`);
    let html = block ? md.block(s) : md.inline(s);
    html = html.replace(/\u0001(\d+)\u0001/g, (_, i) => internalLinkHtml(internal[Number(i)].href, internal[Number(i)].label));
    return html;
  };
  const plain = text => plainText(fillCopy(textOf(text)).replace(/`/g, 'ʿ'));
  /** An item's rendered title before the item is built ({cards} = its evidence cards), for "See item N" titles. */
  const itemTitle = id => plainText(fill(textOf(C.ITEMS[id].title), { ...counts, cards: (C.ITEMS[id].evidence || []).filter(e => e?.from).length }));

  // ---- showcase parts --------------------------------------------------------------------------
  const ar = s => `<span class="hrv-ar-inline" lang="ar" dir="rtl">${tl(s)}</span>`;
  /**
   * Wraps a verbatim excerpt in our curly quotes. The source's own double quotes (straight, typeset by
   * position: after a space or at the start = opening; or curly “ ”) become ‘…’ inside ours, never a
   * doubled “ “; a closing
   * mark at the outer level means the excerpt runs across the source's quotation boundary
   * (`…Judgment," or said, "according…`), so it closes our quote and the next opening reopens it:
   * “…Judgment,” or said, “according…”. The words stay verbatim; only quote glyphs are typeset.
   */
  const quoteWrap = s => {
    let depth = 1;
    let out = '\u201c';
    const str = String(s);
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      if (ch !== '"' && ch !== '\u201c' && ch !== '\u201d') { out += ch; continue; }
      // Curly marks say which way they face; a straight one faces by position.
      const opening = ch === '\u201c' || (ch === '"' && (i === 0 || /[\s(\[\u2014\u2013-]/.test(str[i - 1])));
      if (opening) { out += depth === 0 ? '\u201c' : '\u2018'; depth += 1; }
      else if (depth >= 2) { out += '\u2019'; depth -= 1; }
      else { out += '\u201d'; depth = 0; }
    }
    if (depth >= 2) out += '\u2019';
    if (depth >= 1) out += '\u201d';
    return out;
  };
  const withMark = (text, mark, where) => {
    if (!mark) return en(text);
    let parts = [{ t: text, m: false }];
    for (const mk of Array.isArray(mark) ? mark : [mark]) {
      if (!text.includes(mk)) { err(`${where}: mark "${mk}" is not in "${text.slice(0, 80)}"`); continue; }
      parts = parts.flatMap(p => (p.m ? [p] : p.t.split(mk).flatMap((seg, i, arr) => (i < arr.length - 1 ? [{ t: seg, m: false }, { t: mk, m: true }] : [{ t: seg, m: false }]))));
    }
    return parts.map(p => (p.m ? `<mark>${en(p.t)}</mark>` : en(p.t))).join('');
  };
  const checkQuote = (q, src, where) => {
    if (src && !src.plain.includes(norm(q))) err(`${where}: quote not found verbatim in ${src.short} (${src.ref}): "${String(q).slice(0, 90)}"`);
  };
  const checkArabic = (a, src, where) => {
    if (!src) return;
    if (!src.arabic) err(`${where}: Arabic excerpt given but ${src.short} has no Arabic in the repo data`);
    else if (!src.arabic.includes(normArabic(a))) err(`${where}: Arabic excerpt not found verbatim in ${src.short}: "${a}"`);
  };
  const linkHtml = (link, text, cls = '') => `<a class="hrv-link hrv-link--${link.kind}${cls ? ` ${cls}` : ''}" href="${escapeAttr(link.href)}"${Object.entries(link.attrs || {}).map(([k, v]) => ` ${k}="${escapeAttr(v)}"`).join('')}${link.title ? ` title="${escapeAttr(link.title)}"` : ''}>${tl(text)}</a>`;

  /** Resolves `ref` (source ref | item:id) to a Ref.astro link object. */
  const refFor = (ref, where, label) => {
    if (!ref) return null;
    if (typeof ref === 'object') {
      // { url, label }: a classical work online (IslamWeb, Shamela, Wikisource) or another https page.
      if (!/^https:\/\//.test(String(ref.url || '')) || !ref.label) { err(`${where}: an external ref needs an https \`url\` and a \`label\``); return null; }
      const link = linkFor(ref.url);
      if (link.kind === 'sunnah') registerSunnah(ref.url);
      else addSource({ key: `url:${link.href}`, kind: link.kind === 'classical' ? 'classical' : 'other', label: ref.label, href: link.href, attrs: link.attrs, external: true, sortKey: [ref.label] });
      return { ...link, label: label || ref.label, title: ref.label };
    }
    if (String(ref).startsWith('item:')) {
      const id = ref.slice(5);
      if (!C.ITEMS?.[id]) { err(`${where}: ref "${ref}" names no item`); return null; }
      return { href: `#${id}`, external: false, kind: 'item', attrs: {}, label: label || fillCopy(L.seeItem, { n: numberOf.get(id) }), title: itemTitle(id) };
    }
    const src = source(ref, where);
    if (!src) return null;
    const link = linkOf(src, where);
    const lab = label || (src.kind === 'quran' ? `${src.short} · ${src.tag}` : src.short);
    return { ...link, label: lab, title: src.kind === 'quran' ? link.title : src.label };
  };

  /** One part → HTML. String / `{ text }` = our voice; `{ quote, from }` / `{ arabic, from }` = verbatim, checked. */
  const partHtml = (p, where) => {
    if (p == null) return '';
    if (typeof p === 'string') return prose(p, where);
    const src = p.from ? source(p.from, where) : null;
    if ((p.quote || p.arabic) && !p.from) err(`${where}: a quote needs a \`from\` source`);
    const out = [];
    if (p.text) out.push(prose(p.text, where));
    if (p.arabic) { checkArabic(p.arabic, src, where); out.push(ar(p.arabic)); }
    if (p.quote) {
      const qs = Array.isArray(p.quote) ? p.quote : [p.quote];
      qs.forEach(q => checkQuote(q, src, where));
      const html = withMark(quoteWrap(norm(qs.join(' … '))), p.mark, where);
      out.push(html);
    }
    if (p.cite && src) {
      const r = refFor(p.from, where);
      if (r) out.push(`<span class="mm-cite">(${linkHtml(r, r.label)})</span>`);
    }
    return out.join(' ');
  };
  const partsHtml = (parts, where, sep = ' ') => (Array.isArray(parts) ? parts : parts ? [parts] : []).map((p, i) => partHtml(p, `${where}[${i}]`)).filter(Boolean).join(sep);

  // ---- showcase --------------------------------------------------------------------------------
  const buildShowcase = (sc, id, where) => {
    if (!sc) return null;
    const caption = textOf(sc.caption) || C.SHOWCASE_LABELS?.[sc.type] || null;
    const base = { caption: caption ? plain(caption) : null, id: `sc-${id}`, type: sc.type };
    const noteHtml = sc.note ? partsHtml(sc.note, `${where}.note`) : '';
    const leadHtml = sc.lead ? partHtml(sc.lead, `${where}.lead`) : '';
    const unitHtml = sc.unit ? partsHtml(sc.unit, `${where}.unit`) : '';
    const tagHtml = t => (t ? `<span class="mm-tag">${tl(t)}</span> ` : '');
    const num = v => Number(String(v).replace(/[^\d.]/g, '')) || 0;
    switch (sc.type) {
      case 'timeline':
        return { ...base, noteHtml, leadHtml, gapHtml: '', points: (sc.points || []).map((p, i) => {
          const w = `${where}.points[${i}]`;
          const body = p.parts ? partsHtml(p.parts, `${w}.parts`, '<br>') : partHtml({ text: p.text, quote: p.quote, from: p.from, mark: p.mark }, w);
          return { year: fillCopy(textOf(p.year) || String(i + 1)), yearAh: null, labelHtml: `${tagHtml(p.tag)}${body}`, ref: refFor(p.ref, w) };
        }) };
      case 'versions':
        return { ...base, noteHtml, leadHtml, items: (sc.items || []).map((it, i) => {
          const w = `${where}.items[${i}]`;
          const src = it.from ? source(it.from, w) : null;
          if (it.arabic) checkArabic(it.arabic, src, w);
          return { labelHtml: tl(textOf(it.label) || src?.short || ''), wordingHtml: partHtml({ quote: it.quote, text: it.text, from: it.from, mark: it.mark }, w), arabic: it.arabic || null, ref: refFor(it.ref || it.from, w), key: i };
        }) };
      case 'witnesses':
        return { ...base, noteHtml, leadHtml, items: (sc.items || []).map((it, i) => {
          const w = `${where}.items[${i}]`;
          return { scholar: textOf(it.who), deathAh: null, workHtml: it.work ? partHtml(it.work, `${w}.work`) : '', arabic: null, englishHtml: partHtml({ quote: it.quote, text: it.text, from: it.from, mark: it.mark }, w), ref: refFor(it.ref || it.from, w) };
        }) };
      case 'confrontation': {
        const side = (s, w) => ({
          titleHtml: partHtml(s?.title, `${w}.title`),
          items: (s?.items || []).map((it, i) => ({ html: partHtml({ ...it, cite: false }, `${w}.items[${i}]`), ref: refFor(it.ref, `${w}.items[${i}]`) })),
        });
        return { ...base, noteHtml, leadHtml, left: side(sc.left, `${where}.left`), right: side(sc.right, `${where}.right`) };
      }
      case 'number_fan':
        return { ...base, noteHtml, leadHtml, unitHtml, items: (sc.items || []).map((it, i) => {
          const w = `${where}.items[${i}]`;
          return { value: fillCopy(String(it.value)), numeric: num(it.value), labelHtml: partHtml({ text: it.text, quote: it.quote, from: it.from, mark: it.mark }, w), ref: refFor(it.ref, w), anchor: null };
        }) };
      case 'bars': {
        let items;
        if (sc.builder === 'suraTypes') {
          items = (sc.groups || []).flatMap((g, gi) => {
            const w = `${where}.groups[${gi}]`;
            const n = { meccan: 0, medinan: 0 };
            (g.from || []).forEach((ref, k) => { const s = source(ref, `${w}.from[${k}]`); if (s?.kind === 'quran') n[P.suraType(s.s)] = (n[P.suraType(s.s)] || 0) + 1; else if (s) err(`${w}.from[${k}]: ${ref} is not a Qurʾān passage`); });
            return ['meccan', 'medinan'].filter(t => n[t]).map(t => ({ value: String(n[t]), numeric: n[t], labelHtml: `${prose(g.text, w)} · ${tl(t === 'meccan' ? L.meccan : L.medinan)}`, ref: null }));
          });
        } else {
          items = (sc.items || []).map((it, i) => {
            const value = fillCopy(String(it.value));
            return { value, numeric: num(value), labelHtml: partHtml({ text: it.text }, `${where}.items[${i}]`), ref: refFor(it.ref, `${where}.items[${i}]`) };
          });
        }
        return { ...base, noteHtml, leadHtml, unitHtml, items };
      }
      case 'facts':
        return { ...base, noteHtml, leadHtml, items: (sc.items || []).map((it, i) => ({ html: partHtml(it, `${where}.items[${i}]`) })) };
      default:
        err(`${where}: unknown showcase type "${sc.type}"`);
        return null;
    }
  };

  // ---- evidence cards --------------------------------------------------------------------------
  const evidenceSeen = new Map(); // source key → where (a card per source per page)
  const hiddenArabicCards = new Set(); // HIDE_HADITH_ARABIC keys that have a rendered card
  const buildEvidence = (list, ctxId, where) => {
    let n = 0;
    return (list || []).map((spec, i) => {
      const w = `${where}[${i}]`;
      if (spec && spec.heading && !spec.from) return { type: 'heading', html: prose(spec.heading, w) };
      if (!spec?.from) { err(`${w}: evidence needs \`from\``); return null; }
      if (isPath(spec.from)) claim(spec.from, w);
      const src = source(spec.from, w);
      if (!src) return null;
      const excerpts = spec.excerpt ? (Array.isArray(spec.excerpt) ? spec.excerpt : [spec.excerpt]) : null;
      // One card per text: the same source twice is a duplicate unless the cards quote different passages.
      const seenKey = `${src.key}|${excerpts ? excerpts.join("|") : (src.path || "full")}`;
      const prev = evidenceSeen.get(seenKey);
      if (prev) err(`${w}: ${src.short} already has a card (${prev}); link to it instead`);
      else evidenceSeen.set(seenKey, w);
      const link = linkOf(src, w);
      if (src.kind === 'hadith' && C.HIDE_HADITH_ARABIC?.[src.key]) hiddenArabicCards.add(src.key);
      n += 1;
      excerpts?.forEach(q => checkQuote(q, src, `${w}.excerpt`));
      if (src.extra && src.kind === 'tafsir' && !excerpts) err(`${w}: ${src.short} comes from the full repo commentary; give an \`excerpt\``);
      if (!excerpts && !spec.parallel && src.kind === 'hadith' && src.plain.length > 900) warnings.push(`${w}: ${src.short} (${src.plain.length} chars) has no excerpt, so the whole narration is visible`);
      // Card texts are verbatim (not wrapped in our quotation marks), so their own quote marks stay as published.
      const paras = ps => ps.map(p => (p.sub ? `<p class="mm-quote__sub"><strong>${en(p.text)}</strong></p>` : `<p>${en(p.text)}</p>`)).join('');
      const excerptHtml = excerpts ? `<p>${excerpts.map(q => en(norm(q))).join(' <span class="mm-gap">…</span> ')}</p>` : '';
      const fullHtml = paras(src.paragraphs);
      // Anything not shown stays one tap away: an excerpt that is not the whole text always offers it.
      const hasMore = !!excerpts && norm(excerpts.join(' ')) !== src.plain;
      const tags = [src.tag, spec.grade].filter(Boolean);
      return {
        type: 'card',
        n,
        anchor: `${ctxId}-ev-${n}`,
        kind: src.kind,
        labelHtml: tl(textOf(spec.label) || src.label),
        tags,
        leadHtml: spec.lead ? partsHtml(spec.lead, `${w}.lead`, '') : '',
        quranArabic: src.kind === 'quran' ? src.arabic : null,
        visibleHtml: spec.parallel ? '' : (excerpts ? excerptHtml : fullHtml),
        fullHtml: spec.parallel || hasMore ? fullHtml : '',
        fullLabel: spec.parallel ? L.parallelText : L.fullText,
        parallel: !!spec.parallel,
        hadithArabic: src.kind === 'hadith' ? src.arabic : null,
        noteHtml: spec.note ? partsHtml(spec.note, `${w}.note`) : '',
        chips: [{ label: src.chipLabel, href: link.href, external: link.external, attrs: link.attrs, title: src.kind === 'hadith' ? `${src.label}${src.reference ? ` (${src.reference})` : ''} on Sunnah.com` : link.title }],
      };
    }).filter(Boolean);
  };
  const cardCount = list => list.filter(e => e.type === 'card').length;

  // ---- print references (sīra / taʾrīkh in print) ----------------------------------------------
  const buildPrint = (refs, where) => (refs || []).map((r, i) => {
    const w = `${where}[${i}]`;
    const spec = typeof r === 'string' ? { ref: r } : r;
    const node = claim(spec.ref, w);
    if (node === undefined) return null;
    if (typeof node !== 'string') { err(`${w}: ${spec.ref} is not a single print reference (string)`); return null; }
    renderedPaths.add(spec.ref);
    const label = spec.note ? `${node} · ${spec.note}` : node;
    addSource({ key: `print:${node}`, kind: 'print', label, href: null, sortKey: [node] });
    return { html: tl(label) };
  }).filter(Boolean);

  // ---- items -----------------------------------------------------------------------------------
  const items = reading.map(({ id, section }, idx) => {
    const item = C.ITEMS[id];
    const where = `ITEMS["${id}"]`;
    claimAll(item.own, `${where}.own`);
    for (const k of ['title', 'hook', 'takeaway']) if (!textOf(item[k])) err(`${where}: missing ${k}`);
    const evidence = buildEvidence(item.evidence, id, `${where}.evidence`);
    const vars = { ...counts, cards: cardCount(evidence) };
    const showcase = buildShowcase(item.showcase, id, `${where}.showcase`);
    const tables = (item.tables || []).map((t, ti) => ({
      titleHtml: prose(t.title, `${where}.tables[${ti}].title`),
      headers: (t.headers || []).map(h => ({ html: tl(h), label: String(h) })), // label: Astro escapes attributes
      rows: (t.rows || []).map((r, ri) => r.map((c, ci) => prose(c, `${where}.tables[${ti}].rows[${ri}][${ci}]`))),
    }));
    const collapsed = (item.collapsed || []).map((c, ci) => {
      const w = `${where}.collapsed[${ci}]`;
      claimAll(c.own, `${w}.own`);
      const ev = buildEvidence(c.evidence, `${id}-c${ci + 1}`, `${w}.evidence`);
      return {
        id: `${id}-more-${ci + 1}`,
        headingHtml: tl(fillCopy(textOf(c.heading), { ...counts, n: cardCount(ev) })),
        badge: c.badge || null,
        bodyHtml: c.body ? prose(c.body, `${w}.body`, { block: true }) : '',
        showcase: buildShowcase(c.showcase, `${id}-c${ci + 1}`, `${w}.showcase`),
        evidence: ev,
        print: buildPrint(c.printRefs, `${w}.printRefs`),
      };
    });
    const proseOrParts = (v, w) => (Array.isArray(v) || (v && typeof v === 'object' && (v.quote || v.arabic)) ? `<p>${partsHtml(v, w)}</p>` : prose(v, w, { block: true }));
    const next = reading[idx + 1];
    const title = fillCopy(textOf(item.title), vars);
    const afterLast = C.CLOSING?.readToday?.id;
    return {
      id,
      number: idx + 1,
      total,
      isStart: id === C.START_HERE,
      section: section ? { id: section.id, number: section.number } : null,
      title: plainText(title),
      titleHtml: tl(title),
      hookHtml: prose(item.hook, `${where}.hook`),
      takeaway: plain(item.takeaway),
      takeawayHtml: prose(item.takeaway, `${where}.takeaway`),
      showcase,
      evidence,
      tables,
      collapsed,
      classicalHtml: item.classical ? proseOrParts(item.classical, `${where}.classical`) : '',
      comparisonHtml: item.comparison ? proseOrParts(item.comparison, `${where}.comparison`) : '',
      context: id === C.START_HERE ? fillCopy(L.startHereOf, { total }) : fillCopy(L.contextLine, { n: idx + 1, total, q: section?.number ?? '' }),
      next: next ? { id: next.id, title: null } : null,
      nextHref: next ? `#${next.id}` : (afterLast ? `#${afterLast}` : null),
      nextText: next ? null : L.nextAfterLast,
      legacy: [],
    };
  });
  items.forEach(it => { if (it.next) { it.next.title = items.find(x => x.id === it.next.id)?.title || ''; it.nextText = `${L.next}: ${it.next.title}`; } });

  // ---- sections, intro, closing ------------------------------------------------------------------
  const startItem = items.find(i => i.isStart) || null;
  const sections = (C.SECTIONS || []).map((s, si) => {
    claimAll(s.own, `SECTIONS["${s.id}"].own`);
    return {
      id: s.id,
      number: si + 1,
      question: plain(s.question),
      questionHtml: tl(fillCopy(textOf(s.question))),
      dekHtml: s.dek ? prose(s.dek, `SECTIONS["${s.id}"].dek`) : '',
      items: items.filter(it => it.section?.id === s.id),
      legacy: [],
    };
  });

  claimAll(C.INTRO?.own, 'INTRO.own');
  const intro = {
    h1: plain(C.INTRO?.h1),
    h1Html: tl(fillCopy(textOf(C.INTRO?.h1))),
    html: prose(C.INTRO?.text, 'INTRO.text'),
    orientation: (C.INTRO?.orientation || []).map((o, i) => ({ label: tl(o.label), html: prose(o.text, `INTRO.orientation[${i}]`) })),
    suraNote: tl(L.suraNote),
    legacy: [],
  };

  const CL = C.CLOSING || {};
  const readToday = CL.readToday ? (() => {
    claimAll(CL.readToday.own, 'CLOSING.readToday.own');
    return {
      id: CL.readToday.id,
      titleHtml: tl(textOf(CL.readToday.title)),
      cards: (CL.readToday.cards || []).map((c, i) => ({ whoHtml: tl(c.who), html: prose(c.text, `CLOSING.readToday.cards[${i}]`) })),
      outroHtml: prose(CL.readToday.outro, 'CLOSING.readToday.outro'),
      legacy: [],
    };
  })() : null;
  const textsShow = CL.textsShow ? (() => {
    claimAll(CL.textsShow.own, 'CLOSING.textsShow.own');
    return {
      id: CL.textsShow.id,
      titleHtml: tl(textOf(CL.textsShow.title)),
      introHtml: prose(CL.textsShow.intro, 'CLOSING.textsShow.intro'),
      rows: items.map(it => ({ id: it.id, number: it.number, text: it.takeaway })),
      legacy: [],
    };
  })() : null;
  const reflection = CL.reflection ? (() => {
    const R = CL.reflection;
    claimAll(R.own, 'CLOSING.reflection.own');
    return {
      id: R.id,
      disclosureHtml: prose(R.disclosure, 'CLOSING.reflection.disclosure'),
      title: plain(R.title),
      titleHtml: tl(textOf(R.title)),
      table: {
        titleHtml: '',
        headers: (R.headers || ['', 'Jesus', 'Texts']).map(h => ({ html: tl(h), label: String(h) })),
        rows: (R.rows || []).map((r, i) => [tl(r.theme), prose(r.jesus, `CLOSING.reflection.rows[${i}].jesus`), prose(r.other, `CLOSING.reflection.rows[${i}].other`)]),
      },
      noteHtml: prose(R.note, 'CLOSING.reflection.note'),
      evidence: buildEvidence(R.evidence, R.id, 'CLOSING.reflection.evidence'),
      legacy: [],
    };
  })() : null;
  const perspective = (CL.perspective || []).map(l => {
    const link = linkFor(l.url, { nofollow: true });
    let host = '';
    try { host = new URL(l.url).hostname.replace(/^www\./, ''); } catch { /* keep empty */ }
    return { label: l.title, href: link.href, attrs: link.attrs, host, type: l.type || (/youtube\.com|youtu\.be/.test(l.url) ? 'video' : 'article') };
  });

  // ---- ids the page emits: unique; legacy anchors and in-page links must agree with them ------------
  const emitted = [];
  const emit = (id, what) => { if (id) emitted.push([id, what]); };
  ['intro', 'check-sources', 'check-sources-h'].forEach(id => emit(id, 'page'));
  if (perspective.length) emit('others', 'page');
  const evIds = list => (list || []).filter(e => e.type === 'card').forEach(e => emit(e.anchor, 'evidence card'));
  for (const s of sections) { emit(s.id, 'section'); emit(`${s.id}-h`, 'section heading'); }
  for (const it of items) {
    emit(it.id, 'item'); emit(`${it.id}-h`, 'item title');
    if (it.showcase) emit(it.showcase.id, 'showcase');
    evIds(it.evidence);
    for (const c of it.collapsed) { emit(c.id, 'collapsed part'); if (c.showcase) emit(c.showcase.id, 'showcase'); evIds(c.evidence); }
  }
  for (const c of [readToday, textsShow]) if (c) { emit(c.id, 'closing block'); emit(`${c.id}-h`, 'closing heading'); }
  if (reflection) { emit(reflection.id, 'closing block'); emit(`${reflection.id}-body`, 'reflection body'); emit(`${reflection.id}-h`, 'reflection heading'); evIds(reflection.evidence); }
  const liveIds = new Map();
  for (const [id, what] of emitted) {
    if (liveIds.has(id)) err(`id "${id}" is emitted twice (${liveIds.get(id)} and ${what})`);
    else liveIds.set(id, what);
  }

  // ---- legacy anchors --------------------------------------------------------------------------
  const holders = new Map([['intro', intro], ...items.map(i => [i.id, i]), ...sections.map(s => [s.id, s])]);
  for (const c of [readToday, textsShow, reflection]) if (c) holders.set(c.id, c);
  for (const [anchor, target] of Object.entries(C.LEGACY_ANCHORS || {})) {
    if (!holders.has(target)) { err(`LEGACY_ANCHORS["${anchor}"]: target "${target}" is not an item, section, closing block or 'intro'`); continue; }
    if (liveIds.has(anchor)) { err(`LEGACY_ANCHORS["${anchor}"] collides with a live id (${liveIds.get(anchor)})`); continue; }
    holders.get(target).legacy.push(anchor);
  }
  const anchorIds = new Set([...liveIds.keys(), ...Object.keys(C.LEGACY_ANCHORS || {})]);
  for (const [id, where] of hashLinks) if (!anchorIds.has(id)) err(`${where}: link "#${id}" points to no id on the page`);

  // ---- coverage: every dataset leaf placed exactly once ------------------------------------------
  allow.forEach((r, i) => {
    if (!/^\^|\$$/.test(r.source)) err(`NOT_RENDERED[${i}] ${r}: anchor the pattern (^… or …$) so it cannot hide more than it names`);
  });
  const allLeaves = leafPaths(data);
  allow.forEach((r, i) => { if (!allLeaves.some(l => r.test(l))) err(`NOT_RENDERED[${i}] ${r} matches no dataset leaf (stale)`); });
  for (const leaf of allLeaves) {
    const where = claims.get(leaf) || [];
    if (notRendered(leaf)) {
      if (where.length) err(`dataset leaf ${leaf} is in NOT_RENDERED but placed by ${where.join(', ')}`);
      continue;
    }
    if (where.length === 0) err(`dataset leaf ${leaf} ("${String(resolvePath(data, leaf)).slice(0, 50)}") is not placed by any item, section, INTRO or CLOSING`);
    if (where.length > 1) err(`dataset leaf ${leaf} is placed ${where.length} times: ${where.join(', ')}`);
  }

  // ---- stale overrides: every override must reach the page ---------------------------------------
  for (const key of Object.keys(C.EXTRA_HADITH || {})) {
    if (!usedExtra.has(key)) err(`EXTRA_HADITH["${key}"] is referenced by no hadith:${key} ref (stale)`);
  }
  for (const [key, h] of Object.entries(C.HIDE_HADITH_ARABIC || {})) {
    const where = `HIDE_HADITH_ARABIC["${key}"]`;
    checkShape(h, 'hideArabic', where, err);
    if (!h?.reason || !h?.corrupt) err(`${where}: needs \`reason\` and the \`corrupt\` text it hides`);
    if (!hiddenArabicCards.has(key)) err(`${where}: no rendered evidence card for ${key} (stale)`);
    const ar = P.hadithCorpus(key)?.arabic;
    if (h?.corrupt && !(ar && normArabic(ar).includes(normArabic(h.corrupt)))) err(`${where}: the corpus Arabic no longer contains "${h.corrupt}" (fixed upstream?): delete the entry`);
  }
  const shownBy = target => [...renderedPaths].some(p => target === p || target.startsWith(`${p}.`) || target.startsWith(`${p}[`));
  (C.QUOTE_FIXES || []).forEach((f, i) => {
    if (!f || !isPath(f.ref)) return; // reported by applyQuoteFixes
    const target = f.field === '$' ? f.ref : `${f.ref}.${f.field}`;
    if (!shownBy(target)) err(`QUOTE_FIXES[${i}]: ${target} is never shown on the page (only absorbed by \`own\`, NOT_RENDERED or unused), so the fix is stale`);
  });

  (C.PRINT_SOURCES || []).forEach(t => addSource({ key: `print:${t}`, kind: 'print', label: t, href: null, sortKey: [t] }));

  // ---- sources & counts (every renderer has run) --------------------------------------------------
  const all = [...sources.values()];
  const cmp = (a, b) => {
    const x = a.sortKey || [], y = b.sortKey || [];
    for (let i = 0; i < Math.max(x.length, y.length); i++) { if (x[i] < y[i]) return -1; if (x[i] > y[i]) return 1; }
    return 0;
  };
  const sourceGroups = (C.SOURCE_GROUPS || []).map(g => ({ ...g, items: all.filter(s => s.kind === g.kind).sort(g.kind === 'print' || g.kind === 'bible' ? () => 0 : cmp) })).filter(g => g.items.length);
  for (const s of all) if (!(C.SOURCE_GROUPS || []).some(g => g.kind === s.kind)) err(`source "${s.label}" has kind "${s.kind}" with no SOURCE_GROUPS entry`);
  counts.sunnahRefs = all.filter(s => s.kind === 'sunnah').length;
  counts.quranRefs = all.filter(s => s.kind === 'quran').length;
  counts.tafsirRefs = all.filter(s => s.kind === 'tafsir').length;
  counts.evidence = items.reduce((n, it) => n + cardCount(it.evidence) + it.collapsed.reduce((m, c) => m + cardCount(c.evidence), 0), 0) + (reflection ? cardCount(reflection.evidence) : 0);

  const seo = {
    title: plain(C.SEO?.title),
    description: plain(C.SEO?.description),
    keywords: C.SEO?.keywords || '',
    breadcrumb: plain(C.SEO?.breadcrumb),
    about: C.SEO?.about || [],
  };

  if (errors.length) throw new Error(`${TAG} config/dataset check failed (${errors.length}):\n  - ${errors.join('\n  - ')}`);

  return {
    counts,
    warnings,
    seo,
    emitFaq: !!C.EMIT_FAQ,
    intro,
    startHere: startItem,
    sections,
    items,
    index: [
      ...(startItem ? [{ id: null, number: null, questionHtml: tl(L.startHere), items: [{ id: startItem.id, number: startItem.number, title: startItem.title }] }] : []),
      ...sections.map(s => ({ id: s.id, number: s.number, questionHtml: s.questionHtml, items: s.items.map(i => ({ id: i.id, number: i.number, title: i.title })) })),
    ],
    sourceGroups,
    citations: all.filter(s => s.kind === 'sunnah' || s.kind === 'tafsir').sort(cmp).map(s => ({ name: s.label, url: s.href, kind: s.kind })),
    closing: { readToday, textsShow, reflection, perspective },
    quoteFixLog: fixed.log,
  };
}
