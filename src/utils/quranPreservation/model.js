/**
 * Pure view-model builder for /discover/quran-preservation.
 *
 * `buildModel(dataset, config)` turns the read-only dataset (an array of 10 stage nodes) plus the
 * presentation/copy config into plain objects shaped like the hadith-reliability view model, so the
 * page can reuse the hrv components (Showcase archetypes, EvidenceCard, ComparisonTable, SourcesList,
 * FurtherReading). No I/O here: `loader.js` imports the dataset and memoises; tests pass fixtures.
 *
 * The build FAILS (throws one error listing every problem) when:
 *   - a config path (source, evidence, ref, from, quoteFixes ref, table override) matches no data node;
 *   - an item id is placed zero times or more than once (START_HERE + SECTIONS), or is not in ITEMS;
 *   - a dataset stage / child / hadith is not reachable from any item, section, INTRO or CLOSING and is
 *     not listed in INTENTIONALLY_MERGED (content can never be dropped silently);
 *   - a showcase `quote` / `arabic` / `mark` excerpt is not verbatim in its source;
 *   - an item shows the same Sunnah.com page twice without an INTENTIONALLY_MERGED 'parts' entry;
 *   - a rendered hadith has no Sunnah.com URL or no English; a quote fix is malformed;
 *   - an image lacks alt, credit or intrinsic width/height;
 *   - copy uses an unknown `{placeholder}`.
 *
 * Order matters: renderers register the sources they link to, so every renderer (items, sections,
 * intro, closing) runs before the source list is snapshotted and before the error check.
 *
 * Quotes, references, Arabic and variants come verbatim from the dataset (after display
 * normalisation: our `**bold**` is dropped, ASCII backtick ʿayn → ʿ), except explicit `quoteFixes`.
 */
import { createRenderer, linkFor, plainText, tl, escapeAttr } from '../hadithReliability/render.js';

const TAG = '[quranPreservation]';

// ---------------------------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------------------------

/** `[5].children[0].hadiths[1]` → [5, 'children', 0, 'hadiths', 1]; null when malformed. */
export function parsePath(path) {
  if (typeof path !== 'string' || !/^\[\d+\]/.test(path)) return null;
  const tokens = [];
  const re = /\[(\d+)\]|\.([A-Za-z_][\w]*)/g;
  let m;
  let consumed = 0;
  while ((m = re.exec(path))) {
    if (m.index !== consumed) return null;
    tokens.push(m[1] !== undefined ? Number(m[1]) : m[2]);
    consumed = re.lastIndex;
  }
  return consumed === path.length ? tokens : null;
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

export const isPath = s => typeof s === 'string' && s.startsWith('[');

/** Every stage, child and hadith in the dataset: the units that must be reachable from the page. */
export function coverageUniverse(data) {
  const out = [];
  const walk = (node, path) => {
    out.push(path);
    (node.hadiths || []).forEach((_, k) => out.push(`${path}.hadiths[${k}]`));
    (node.children || []).forEach((c, j) => walk(c, `${path}.children[${j}]`));
  };
  (Array.isArray(data) ? data : []).forEach((stage, i) => walk(stage, `[${i}]`));
  return out;
}

// ---------------------------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------------------------

/** Display form of a dataset English quote: drop our bold, ASCII backtick ʿayn → ʿ, tidy spaces. */
export const normEnglish = s => String(s ?? '').replace(/\*\*/g, '').replace(/`/g, 'ʿ').replace(/\s+/g, ' ').trim();
/** Display form of dataset Arabic: drop bold markers, unescape `\*`, drop bidi marks, tidy spaces. */
export const normArabic = s => String(s ?? '').normalize('NFC').replace(/\*\*/g, '').replace(/\\\*/g, '*').replace(/[\u200e\u200f]/g, '').replace(/\s+/g, ' ').trim();
/** Plain text → safe HTML (tl) with ﷺ set in the Arabic face, which has the glyph. */
const en = s => tl(s).replace(/ﷺ/g, '<span class="qp-saw" lang="ar">ﷺ</span>');
/** `{key}` → vars[key]; an unknown key is reported through `onMissing` (the builder turns it into a build error). */
const fill = (tpl, vars, onMissing = () => {}) => String(tpl ?? '').replace(/\{(\w+)\}/g, (m, k) => {
  if (vars[k] != null) return String(vars[k]);
  onMissing(k);
  return m;
});
const textOf = v => (v == null ? '' : typeof v === 'object' && 'text' in v ? v.text : v);

const COLLECTIONS = {
  bukhari: { short: 'Bukhārī', long: 'Ṣaḥīḥ al-Bukhārī', order: 0 },
  muslim: { short: 'Muslim', long: 'Ṣaḥīḥ Muslim', order: 1 },
  abudawud: { short: 'Abū Dāwūd', long: 'Sunan Abī Dāwūd', order: 2 },
  malik: { short: 'Muwaṭṭaʾ', long: 'Muwaṭṭaʾ Mālik', order: 3 },
};

/** `https://sunnah.com/bukhari:4987` → { key: 'bukhari:4987', coll: 'bukhari', num: '4987' }. */
function sunnahKey(url) {
  const m = String(url || '').match(/sunnah\.com\/([a-z]+)[:/]([\w./-]+)/i);
  return m ? { key: `${m[1].toLowerCase()}:${m[2]}`, coll: m[1].toLowerCase(), num: m[2] } : null;
}
function sunnahLabels(url) {
  const k = sunnahKey(url);
  if (!k) return { short: url, long: url };
  const c = COLLECTIONS[k.coll] || { short: k.coll, long: k.coll };
  return { short: `${c.short} ${k.num}`, long: `${c.long} ${k.num}` };
}
/** 'Bukhārī 5005' / 'Sahih Muslim 629' → { coll, num } for matching a fix to a hadith. */
function parseRefLabel(label) {
  const s = String(label).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const num = (s.match(/(\d+[a-z]?)\s*$/) || [])[1];
  const coll = /bukh/.test(s) ? 'bukhari' : /muslim/.test(s) ? 'muslim' : /dawud|dawood/.test(s) ? 'abudawud' : /malik|muwatt/.test(s) ? 'malik' : null;
  return coll && num ? { coll, num } : null;
}

/** "S:A" from 'quran:2:106', '[quran/43:19]', '[quran/2/219]', 'Surah 9:74', '3/146'. */
export function verseKey(s) {
  const m = String(s).match(/(\d+)\s*[:/]\s*(\d+(?:-\d+)?)/);
  return m ? `${m[1]}:${m[2]}` : null;
}

// ---------------------------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------------------------

export function buildModel(dataset, config) {
  const errors = [];
  const err = msg => errors.push(msg);
  const md = createRenderer();
  const C = config;
  const L = C.LABELS;
  const BASE = C.BASE ?? '';

  if (!Array.isArray(dataset)) throw new Error(`${TAG} dataset must be an array of stage nodes`);

  const claimed = new Set();
  const claim = (path, where) => {
    if (!isPath(path)) { err(`${where}: "${path}" is not a dataset path like [5].children[0]`); return undefined; }
    const node = resolvePath(dataset, path);
    if (node === undefined) { err(`${where}: path ${path} matches no dataset node`); return undefined; }
    claimed.add(path);
    return node;
  };
  const getNode = (path, where) => {
    const node = isPath(path) ? resolvePath(dataset, path) : undefined;
    if (node === undefined) err(`${where}: path ${path} matches no dataset node`);
    return node;
  };

  // ---- placement: every item exactly once -----------------------------------------------------
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

  // ---- page-level sources ----------------------------------------------------------------------
  const sources = new Map(); // href → source row
  const addSource = (link, label, extra = {}) => {
    if (!link?.href || sources.has(link.href)) return;
    sources.set(link.href, { label, href: link.href, attrs: link.attrs, external: link.external, kind: link.kind, title: link.title || label, ...extra });
  };
  const quranLink = key => {
    const [s, a] = key.split(':');
    const link = linkFor(`https://quran.com/${s}/${a}`);
    addSource(link, `Qurʾān ${key}`, { sortKey: [Number(s), Number(String(a).split('-')[0])] });
    return { ...link, label: `Qurʾān ${key}` };
  };

  // ---- quote fixes (collected from every item first; they apply to the hadith node) ------------
  const fixesByPath = new Map();
  for (const [id, item] of Object.entries(C.ITEMS || {})) {
    const fixes = Array.isArray(item.quoteFixes) ? item.quoteFixes : [];
    fixes.forEach((f, fi) => {
      const where = `ITEMS["${id}"].quoteFixes[${fi}]`;
      if (!f || !f.ref) { err(`${where}: missing ref`); return; }
      if (!['english', 'arabic', 'href', 'reference'].includes(f.field)) err(`${where}: unknown field "${f.field}"`);
      if (!f.reason) err(`${where}: every quote fix needs a reason`);
      if (f.field === 'arabic' && !(f.hide === true || (typeof f.value === 'string' && f.value.trim()))) {
        err(`${where}: an Arabic fix needs a non-empty \`value\`, or \`hide: true\` to hide the Arabic`);
      }
      if (f.field === 'href' && !sunnahKey(f.value)) err(`${where}: href fix "${f.value}" is not a https://sunnah.com/<collection>:<number> URL`);
      if (f.field === 'reference' && !(typeof f.value === 'string' && f.value.trim())) err(`${where}: a reference fix needs a non-empty \`value\``);
      let targets = [];
      if (isPath(f.ref)) {
        if (resolvePath(dataset, f.ref)?.reference === undefined) err(`${where}: path ${f.ref} matches no hadith`);
        else targets = [f.ref];
      } else {
        // A label fix applies only to this item's own evidence: a fix written for one item must never
        // rewrite a hadith shown by another. Use a dataset path to fix a hadith the item doesn't list.
        const want = parseRefLabel(f.ref);
        const match = p => {
          const k = sunnahKey(urlOf(resolvePath(dataset, p)));
          return k && want && k.coll === want.coll && (k.num === want.num || k.num.replace(/[a-z]$/, '') === want.num);
        };
        targets = itemEvidenceSpecs(item, dataset, C.INTENTIONALLY_MERGED || {}).map(e => e.path).filter(match);
        if (!targets.length) err(`${where}: reference "${f.ref}" matches no hadith in this item's evidence (use a dataset path for any other hadith)`);
        if (targets.length > 1 && !targets.slice(1).every(p => C.INTENTIONALLY_MERGED?.[p]?.mode === 'parts')) {
          err(`${where}: reference "${f.ref}" matches ${targets.length} hadiths (${targets.join(', ')}); use a dataset path`);
        }
      }
      for (const p of targets) {
        if (!fixesByPath.has(p)) fixesByPath.set(p, []);
        fixesByPath.get(p).push({ ...f, where });
      }
    });
  }

  /** The hadith at `path` with fixes applied: { path, url, english, arabic (null = hidden), labels }. */
  const hadithCache = new Map();
  const hadith = (path, where) => {
    if (hadithCache.has(path)) return hadithCache.get(path);
    const node = getNode(path, where);
    if (!node || node.reference === undefined) {
      if (node) err(`${where}: ${path} is not a hadith node`);
      return null;
    }
    let url = urlOf(node);
    let english = String(node.english_text ?? '');
    let arabic = node.arabic_text ?? null;
    let labelOverride = null;
    for (const f of fixesByPath.get(path) || []) {
      if (f.field === 'english') {
        if (typeof f.value === 'string') english = f.value;
        if (f.strip === 'brackets') {
          const before = english;
          english = english.replace(/\s*\[[^\]]*\]/g, '').replace(/\s+([.,;:])/g, '$1');
          if (before === english) err(`${f.where}: strip 'brackets' found no [brackets] in ${path}`);
        }
        for (const [from, to] of f.replace || []) {
          if (!english.includes(from)) err(`${f.where}: replace target "${from}" not found in ${path}`);
          english = english.split(from).join(to);
        }
      } else if (f.field === 'arabic') {
        arabic = f.hide === true ? null : f.value;
      } else if (f.field === 'href') {
        url = f.value;
      } else if (f.field === 'reference') {
        labelOverride = f.value;
      }
    }
    // Shape checks at the boundary: a card without a verifiable link or text must fail the build,
    // not render an empty chip pointing at href="".
    if (!sunnahKey(url)) err(`${where}: ${path} has no Sunnah.com URL in its reference (got "${String(node.reference).slice(0, 80)}")`);
    if (!normEnglish(english)) err(`${where}: ${path} has no English text`);
    const labels = sunnahLabels(url);
    if (labelOverride) { labels.short = labelOverride; labels.long = labelOverride; }
    const link = linkFor(url);
    const h = { path, url, link, english: normEnglish(english), arabic: arabic == null ? null : normArabic(arabic), labels };
    const k = sunnahKey(url);
    addSource(link, labels.long, { sortKey: k ? [COLLECTIONS[k.coll]?.order ?? 9, parseInt(k.num, 10), k.num] : [9, 0, ''] });
    hadithCache.set(path, h);
    return h;
  };

  // ---- numbering --------------------------------------------------------------------------------
  // Reading order. A duplicate placement has already been reported above and fails the build.
  const reading = [];
  if (C.START_HERE && C.ITEMS?.[C.START_HERE]) reading.push({ id: C.START_HERE, section: null });
  (C.SECTIONS || []).forEach((s, si) => (s.items || []).forEach(id => { if (C.ITEMS?.[id]) reading.push({ id, section: { ...s, number: si + 1 } }); }));
  const numberOf = new Map(reading.map((o, i) => [o.id, i + 1]));
  const total = reading.length;

  // ---- counts that copy may reference ----------------------------------------------------------
  const qiraatNode = dataset.find(s => Array.isArray(s?.qiraat_examples));
  const sanaaNode = dataset.find(s => Array.isArray(s?.sanaa_variants));
  const counts = {
    items: total,
    total,
    qiraatPairs: qiraatNode ? qiraatNode.qiraat_examples.reduce((n, c) => n + (c.variants || []).length, 0) : 0,
    sanaaRows: sanaaNode ? sanaaNode.sanaa_variants.length : 0,
    // sunnahRefs / quranRefs are added after every renderer has run (they count the source list),
    // so copy rendered before that cannot use them: `fillCopy` reports them as unknown placeholders.
  };
  /** `fill` for copy and labels: an unknown placeholder fails the build instead of printing `{key}`. */
  const fillCopy = (tpl, vars = counts) => fill(tpl, vars, k => err(`unknown placeholder {${k}} in "${String(tpl).slice(0, 70)}"`));

  // ---- internal links (one place; BASE-aware) --------------------------------------------------
  /** Site-relative path → href with the site base; a bare `#id` stays on this page. */
  const internalHref = href => (String(href).startsWith('#') ? href : `${BASE}${href}`);
  const internalLink = (href, labelText) => `<a class="hrv-link hrv-link--internal" href="${escapeAttr(internalHref(href))}">${tl(labelText)}</a>`;

  // ---- prose (our voice, markdown) ------------------------------------------------------------
  const quranTokens = s => String(s ?? '').replace(/\[quran\/(\d+)[/:](\d+(?:-\d+)?)\](?!\()/g, (_, su, ay) => `[Qurʾān ${su}:${ay}](https://quran.com/${su}/${ay})`);
  const relativise = s => s.replace(/\]\(https:\/\/(?:www\.)?readyapologia\.com(\/[^)\s]*)\)/g, (_, path) => `](${path})`);
  const noteQuranLinks = s => { for (const m of String(s).matchAll(/https:\/\/quran\.com\/(\d+)\/(\d+)/g)) quranLink(`${m[1]}:${m[2]}`); };
  /** Every markdown link our prose cites also goes into "Check the sources" (the page promises all of them). */
  const noteProseLinks = s => {
    for (const [, label, url] of String(s).matchAll(/\[([^\]]+)\]\(([^)\s]+)\)/g)) {
      const q = url.match(/^\/quran\/(\d+)\/(\d+)/);
      if (q) { quranLink(`${q[1]}:${q[2]}`); continue; }
      if (!/^https:\/\//.test(url) || /^https:\/\/quran\.com\//.test(url)) continue;
      const link = linkFor(url);
      const k = sunnahKey(url);
      if (k) addSource(link, sunnahLabels(url).long, { sortKey: [COLLECTIONS[k.coll]?.order ?? 9, parseInt(k.num, 10), k.num] });
      else addSource(link, plainText(label), { sortKey: [plainText(label)] });
    }
  };
  const prose = (text, { block = false } = {}) => {
    if (text == null || text === '') return '';
    let s = relativise(quranTokens(fillCopy(textOf(text))));
    noteQuranLinks(s);
    noteProseLinks(s);
    const internal = [];
    s = s.replace(/\[([^\]]+)\]\((\/[^)\s]*)\)/g, (_, label, href) => `\u0001${internal.push({ label, href }) - 1}\u0001`);
    let html = block ? md.block(s) : md.inline(s);
    html = html.replace(/\u0001(\d+)\u0001/g, (_, i) => internalLink(internal[Number(i)].href, internal[Number(i)].label));
    return html;
  };
  const plain = text => plainText(quranTokens(fillCopy(textOf(text))));

  // ---- showcase parts -------------------------------------------------------------------------
  const ar = s => `<span class="hrv-ar-inline" lang="ar" dir="rtl">${tl(s)}</span>`;
  // Plain text only: paired ASCII " → ‘ ’; an unpaired one is left as is.
  const nestQuotes = s => String(s).replace(/"([^"]*)"/g, '\u2018$1\u2019');
  const withMark = (text, mark, where) => {
    if (!mark) return en(text);
    const marks = Array.isArray(mark) ? mark : [mark];
    let parts = [{ t: text, m: false }];
    for (const mk of marks) {
      if (!text.includes(mk)) { err(`${where}: mark "${mk}" is not in "${text}"`); continue; }
      parts = parts.flatMap(p => (p.m ? [p] : p.t.split(mk).flatMap((seg, i, arr) => (i < arr.length - 1 ? [{ t: seg, m: false }, { t: mk, m: true }] : [{ t: seg, m: false }]))));
    }
    return parts.map(p => (p.m ? `<mark>${en(p.t)}</mark>` : en(p.t))).join('');
  };
  const checkQuote = (q, h, where) => {
    if (!h) return;
    if (!h.english.includes(normEnglish(q))) err(`${where}: quote not found verbatim in ${h.labels.short} (${h.path}): "${q}"`);
  };
  const checkArabic = (a, h, where) => {
    if (!h) return;
    if (h.arabic == null) err(`${where}: Arabic excerpt given but ${h.labels.short} has no Arabic (hidden by a quote fix?)`);
    else if (!h.arabic.includes(normArabic(a))) err(`${where}: Arabic excerpt not found verbatim in ${h.labels.short} (${h.path}): "${a}"`);
  };

  /** Resolves `ref` (hadith path | quran:S:A | item:id) to a Ref.astro link object. */
  const refFor = (ref, where, label) => {
    if (!ref) return null;
    if (isPath(ref)) {
      const h = hadith(ref, where);
      return h ? { ...h.link, label: label || h.labels.short, title: h.labels.long } : null;
    }
    if (ref.startsWith('quran:')) {
      const key = verseKey(ref);
      if (!key) { err(`${where}: bad Qurʾān ref "${ref}"`); return null; }
      const l = quranLink(key);
      return { ...l, label: label || l.label };
    }
    if (ref.startsWith('item:')) {
      const id = ref.slice(5);
      if (!C.ITEMS?.[id]) { err(`${where}: ref "${ref}" names no item`); return null; }
      return { href: `#${id}`, external: false, kind: 'item', attrs: {}, label: label || fillCopy(L.seeItem, { n: numberOf.get(id) }), title: plain(C.ITEMS[id].title) };
    }
    err(`${where}: unknown ref "${ref}"`);
    return null;
  };

  /** One showcase part → HTML. `{text}` our voice; `{quote}` / `{arabic}` verbatim from `ref`. */
  const partHtml = (p, where, { quoteMarks = true } = {}) => {
    if (p == null) return '';
    if (typeof p === 'string') return prose(p);
    const src = isPath(p.from || p.ref) ? hadith(p.from || p.ref, where) : null;
    const out = [];
    if (p.arabic) {
      if (!src) err(`${where}: an Arabic excerpt needs a hadith ref`);
      checkArabic(p.arabic, src, where);
      out.push(ar(p.arabic));
    }
    if (p.quote) {
      if (!src) err(`${where}: a quote needs a hadith ref`);
      const qs = Array.isArray(p.quote) ? p.quote : [p.quote];
      qs.forEach(q => checkQuote(q, src, where));
      const text = qs.join(' … ');
      // Inside our curly double quotes, the source's paired ASCII double quotes read as nested quotes
      // (done on the plain text, before any markup is added).
      const plainQ = normEnglish(text);
      const html = withMark(quoteMarks ? nestQuotes(plainQ) : plainQ, p.mark, where);
      out.push(quoteMarks ? `\u201c${html}\u201d` : html);
    } else if (p.text) {
      out.push(p.mark ? withMark(fillCopy(p.text), p.mark, where) : prose(p.text));
    }
    return out.join(' ');
  };
  const partsHtml = (parts, where) => (Array.isArray(parts) ? parts : parts ? [parts] : []).map((p, i) => partHtml(p, `${where}[${i}]`)).filter(Boolean).join(' ');

  // ---- tables & builders ------------------------------------------------------------------------
  const head = (html, label) => ({ html, label: escapeAttr(label ?? plainText(html.replace(/<[^>]+>/g, ''))) });
  const linkHtml = (link, text) => `<a class="hrv-link hrv-link--${link.kind}" href="${escapeAttr(link.href)}"${Object.entries(link.attrs || {}).map(([k, v]) => ` ${k}="${escapeAttr(v)}"`).join('')}${link.title ? ` title="${escapeAttr(link.title)}"` : ''}>${tl(text)}</a>`;

  const readersRows = (node, item, where) => {
    const cols = node.readers_table_columns || [];
    if (!cols.length || !Array.isArray(node.readers_table)) { err(`${where}: node has no readers_table`); return { cols: [], rows: [] }; }
    const names = item?.extra?.readerNames || {};
    const rows = node.readers_table.map(r => {
      const raw = cols.map(c => r[c.id]).find(Boolean) || '';
      return { name: names[raw] ?? raw, in: cols.map(c => !!r[c.id]), raw };
    });
    for (const k of Object.keys(names)) if (!rows.some(r => r.raw === k)) err(`${where}: extra.readerNames key "${k}" matches no readers_table name`);
    return { cols, rows };
  };
  const colLink = (c, where) => {
    const link = linkFor(c.link);
    const labels = sunnahLabels(c.link);
    addSource(link, labels.long, { sortKey: (() => { const k = sunnahKey(c.link); return k ? [COLLECTIONS[k.coll]?.order ?? 9, parseInt(k.num, 10), k.num] : [9, 0, '']; })() });
    if (!sunnahKey(c.link)) err(`${where}: column ${c.id} has no Sunnah.com link`);
    return { link, labels };
  };

  const qiraatRows = (node, item, where) => {
    const fixes = { ...(item.rowFixes || {}), ...(item.extra?.qiraat || {}) };
    const used = new Set();
    const groups = (node.qiraat_examples || []).map((cat, ci) => {
      const label = C.QIRAAT_CATEGORY_LABELS?.[cat.category];
      if (!label) err(`${where}: qirāʾāt category "${cat.category}" has no label in QIRAAT_CATEGORY_LABELS`);
      return {
        category: cat.category, label: label || cat.category,
        rows: (cat.variants || []).map((v, vi) => {
          const key = verseKey(v.surah_ref);
          if (!key) err(`${where}: qiraat_examples[${ci}].variants[${vi}] has no verse ref`);
          const fixKey = Object.keys(fixes).find(k => verseKey(k) === key);
          const fx = fixKey ? fixes[fixKey] : {};
          if (fixKey) used.add(fixKey);
          const regloss = (text, gloss) => (gloss ? String(text).replace(/\(([^)]*)\)\s*$/, `(${gloss})`) : text);
          const cut = s => String(s ?? '').split(/\s*Impact:/)[0].trim();
          return {
            key,
            hafs: fx.hafs ?? regloss(v.hafs_text, fx.hafsGloss),
            warsh: fx.warsh ?? regloss(v.warsh_text, fx.warshGloss),
            note: fx.explanation ?? fx.note ?? cut(v.explanation),
          };
        }),
      };
    });
    for (const k of Object.keys(fixes)) if (!used.has(k)) err(`${where}: qirāʾāt fix "${k}" matches no row`);
    return groups;
  };
  const translitHtml = s => {
    // "qatala (And many a prophet fought)" → mark the transliterated word(s), keep the gloss.
    const m = String(s).match(/^(.*?)\s*(\(.*\))\s*$/);
    return m ? `<mark>${tl(m[1])}</mark> <span class="qp-gloss">${tl(m[2])}</span>` : tl(s);
  };

  const sanaaRows = (node, item, where) => {
    const fixes = item.extra?.sanaa || {};
    const used = new Set();
    const rows = (node.sanaa_variants || []).map((v, vi) => {
      const key = verseKey(v.surah);
      const fixKey = Object.keys(fixes).find(k => verseKey(k) === key);
      if (fixKey) used.add(fixKey);
      const r = { ...v, ...(fixKey ? fixes[fixKey] : {}) };
      if (!key) err(`${where}: sanaa_variants[${vi}] has no verse ref`);
      // "Absent" is decided by the English cell (the dataset marks a missing phrase as "[…]");
      // a row may legitimately have English but no lower-text Arabic (e.g. known only in transliteration).
      const absent = !String(r.sanaa ?? '').trim() || /^\[.*\]$/.test(String(r.sanaa).trim());
      const sanaaAr = String(r.sanaa_arabic ?? '').trim();
      const arAbsent = !sanaaAr || /^\[\s*-?\s*\]$/.test(sanaaAr);
      return { key, hide: !!r.hide, standard: r.standard, standardAr: r.standard_arabic, standard_mark: r.standard_mark, sanaa_mark: r.sanaa_mark, sanaa: absent ? null : r.sanaa, sanaaAr: absent || arAbsent ? null : sanaaAr };
    }).filter(r => !r.hide);
    for (const k of Object.keys(fixes)) if (!used.has(k)) err(`${where}: Ṣanʿāʾ fix "${k}" matches no row`);
    return rows;
  };
  // The Ṣanʿāʾ lower text has no short-vowel signs: show its Arabic without ḥarakāt, dagger alif or Qurʾānic annotation marks.
  const stripVowels = s => String(s).normalize('NFC').replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '').replace(/\s+/g, ' ').trim();
  const withMarkPlain = (text, mark, where) => (mark ? withMark(String(text), mark, where) : tl(text));
  const absentHtml = () => `<span class="qp-absent">${tl(L.sanaaAbsent)}</span>`;

  const buildTable = (t, item, id, where) => {
    const node = t.from ? claim(t.from, `${where}.from`) : undefined;
    if (!node) return [];
    switch (t.builder) {
      case 'readers': {
        const { cols, rows } = readersRows(node, item, where);
        const colLinks = cols.map(c => colLink(c, where));
        return [{
          titleHtml: prose(t.title),
          headers: [head(tl(L.name), L.name), ...colLinks.map(c => head(linkHtml(c.link, c.labels.short), c.labels.short))],
          rows: rows.map(r => [tl(r.name), ...r.in.map(x => (x ? `<span class="qp-yes">${tl(L.named)}</span>` : `<span class="qp-no"><span aria-hidden="true">${tl(L.notNamed)}</span><span class="hrv-sr">${tl(L.notNamedSr)}</span></span>`))]),
        }];
      }
      case 'codices': {
        const codices = node.codices || [];
        if (!codices.length) err(`${where}: node has no codices`);
        for (const k of Object.keys(t.overrides || {})) if (!codices[Number(k)]) err(`${where}: override for codices[${k}] matches no codex`);
        return [{
          titleHtml: prose(t.title),
          headers: [head(tl(L.codex), L.codex), head(tl(L.chapters), L.chapters)],
          rows: codices.map((c, ci) => {
            const o = (t.overrides || {})[ci] || {};
            const linkSpec = o.link ?? c.link;
            let more = '';
            if (linkSpec) {
              if (String(linkSpec).startsWith('item:')) {
                const r = refFor(linkSpec, where);
                if (r) more = ` ${internalLink(r.href, r.label)}`;
              } else {
                const rel = String(linkSpec).replace(/^https:\/\/(?:www\.)?readyapologia\.com/, '');
                more = rel.startsWith('/') ? ` ${internalLink(rel, L.readMore)}` : ` ${linkHtml(linkFor(rel), L.readMore)}`;
              }
            }
            return [tl(o.owner ?? c.owner), `${prose(o.chapter_count ?? c.chapter_count)}${more}`];
          }),
        }];
      }
      case 'qiraat':
        return qiraatRows(node, item, where).map(g => ({
          titleHtml: `${tl(g.label)} <span class="qp-count">${g.rows.length}</span>`,
          headers: [head(tl(L.verse), L.verse), head(tl(L.hafs), L.hafs), head(tl(L.warsh), L.warsh), head(tl(L.note), L.note)],
          rows: g.rows.map(r => [r.key ? linkHtml(quranLink(r.key), r.key) : '', translitHtml(r.hafs), translitHtml(r.warsh), prose(r.note)]),
        }));
      case 'sanaa':
        return [{
          titleHtml: prose(t.title),
          headers: [head(tl(L.verse), L.verse), head(tl(L.sanaaStandard), L.sanaaStandard), head(tl(L.sanaaLower), L.sanaaLower)],
          rows: sanaaRows(node, item, where).map(r => [
            r.key ? linkHtml(quranLink(r.key), r.key) : '',
            `${r.standardAr ? `${ar(r.standardAr)}<br>` : ''}${tl(r.standard)}`,
            r.sanaa == null ? absentHtml() : `${r.sanaaAr ? `${ar(r.sanaaAr)}<br>` : ''}${tl(r.sanaa)}`,
          ]),
        }];
      default:
        err(`${where}: unknown table builder "${t.builder}"`);
        return [];
    }
  };

  // ---- items ------------------------------------------------------------------------------------
  const evidenceDisplay = new Map(); // sunnah href → first item id showing it (for duplicate warnings)
  const warnings = [];

  const buildEvidence = (id, item) => {
    const specs = itemEvidenceSpecs(item, dataset, C.INTENTIONALLY_MERGED || {});
    const byHref = new Map();
    const out = [];
    specs.forEach((spec, i) => {
      const where = `ITEMS["${id}"].evidence[${i}]`;
      claim(spec.path, where);
      const merged = C.INTENTIONALLY_MERGED?.[spec.path];
      if (merged?.mode === 'drop') err(`${where}: ${spec.path} is listed in INTENTIONALLY_MERGED as dropped but is rendered here`);
      const h = hadith(spec.path, where);
      if (!h) return;
      const prev = byHref.get(h.link.href);
      if (prev && !(merged?.mode === 'parts' && merged.into === prev.path)) {
        err(`${where}: ${h.labels.short} is already shown in this item (${prev.path}); add an INTENTIONALLY_MERGED 'parts' entry if both excerpts belong`);
      }
      if (!prev) byHref.set(h.link.href, h);
      const other = evidenceDisplay.get(h.link.href);
      if (other && other !== id) warnings.push(`${h.labels.short} has evidence cards in both "${other}" and "${id}"`);
      if (!other) evidenceDisplay.set(h.link.href, id);
      out.push({ spec, h });
    });
    // Excerpt numbering for 'parts' groups.
    const groupSize = new Map();
    out.forEach(({ h }) => groupSize.set(h.link.href, (groupSize.get(h.link.href) || 0) + 1));
    const groupIdx = new Map();
    return out.map(({ spec, h }, i) => {
      const n = groupSize.get(h.link.href);
      const k = (groupIdx.get(h.link.href) || 0) + 1;
      groupIdx.set(h.link.href, k);
      const label = spec.label ? textOf(spec.label) : (n > 1 ? `${h.labels.long} · ${fillCopy(L.excerptOf, { i: k, n })}` : h.labels.long);
      const englishHtml = en(h.english);
      return {
        n: i + 1,
        anchor: spec.anchor || `${id}-ev-${i + 1}`,
        path: h.path,
        labelHtml: tl(label),
        bodyHtml: spec.note ? prose(spec.note) : '',
        quote: h.arabic
          ? { arabic: h.arabic, englishHtml, ref: null, refLink: null }
          : { rawHtml: `<p class="hrv-quote__en">${englishHtml}</p>` },
        chips: [{ label: h.labels.short, href: h.link.href, external: h.link.external, attrs: h.link.attrs, kind: h.link.kind, title: h.labels.long }],
      };
    });
  };

  const buildShowcase = (id, item, evidence) => {
    const sc = item.showcase;
    const where = `ITEMS["${id}"].showcase`;
    if (!sc) return null;
    const anchorFor = (ref, evidenceN) => {
      if (evidenceN) return evidence[evidenceN - 1]?.anchor || null;
      const e = isPath(ref) ? evidence.find(x => x.path === ref) : null;
      return e ? e.anchor : null;
    };
    const base = { caption: textOf(sc.caption) || C.SHOWCASE_LABELS?.[sc.type] || null, id: `sc-${id}` };
    const note = sc.note ? partsHtml(sc.note, `${where}.note`) : '';
    if (sc.from) claim(sc.from, `${where}.from`);
    const unitHtml = sc.unit ? partsHtml(sc.unit, `${where}.unit`) : '';
    switch (sc.type) {
      case 'number_fan':
        return { ...base, type: 'number_fan', unitHtml, noteHtml: note, items: (sc.items || []).map((it, i) => ({
          value: String(it.value), numeric: Number(String(it.value).replace(/[^\d.]/g, '')) || 0,
          labelHtml: it.quote ? partHtml({ quote: it.quote, mark: it.mark, ref: it.ref }, `${where}.items[${i}]`) : prose(it.text),
          ref: refFor(it.ref, `${where}.items[${i}]`), anchor: anchorFor(it.ref, it.evidence), key: i,
        })) };
      case 'bars': {
        let items;
        if (sc.builder === 'readers') {
          const node = getNode(sc.from, `${where}.from`);
          const { rows } = node ? readersRows(node, item, where) : { rows: [] };
          items = rows.map((r, i) => ({ value: String(r.in.filter(Boolean).length), numeric: r.in.filter(Boolean).length, labelHtml: tl(r.name), ref: null, key: i }))
            .sort((a, b) => b.numeric - a.numeric || a.key - b.key);
        } else {
          items = (sc.items || []).map((it, i) => ({ value: String(it.value), numeric: Number(String(it.value).replace(/[^\d.]/g, '')) || 0, labelHtml: partHtml({ text: it.text }, `${where}.items[${i}]`), ref: refFor(it.ref, `${where}.items[${i}]`), key: i }));
        }
        return { ...base, type: 'bars', unitHtml, noteHtml: note, items };
      }
      case 'versions': {
        if (sc.builder === 'qiraat') {
          const node = getNode(sc.from, `${where}.from`);
          const rows = node ? qiraatRows(node, item, where).flatMap(g => g.rows) : [];
          const pick = (sc.verses || []).map(v => {
            const r = rows.find(x => x.key === verseKey(v));
            if (!r) err(`${where}: verse ${v} is not in the qirāʾāt data`);
            return r;
          }).filter(Boolean);
          const list = side => `<ul class="qp-vlist">${pick.map(r => `<li>${linkHtml(quranLink(r.key), r.key)} ${translitHtml(r[side])}</li>`).join('')}</ul>`;
          return { ...base, type: 'versions', items: [
            { labelHtml: tl(textOf(sc.labels?.hafs) || L.hafs), wordingHtml: list('hafs'), arabic: null, ref: null, key: 0 },
            { labelHtml: tl(textOf(sc.labels?.warsh) || L.warsh), wordingHtml: list('warsh'), arabic: null, ref: null, key: 1 },
          ] };
        }
        return { ...base, type: 'versions', items: (sc.items || []).map((it, i) => {
          const w = `${where}.items[${i}]`;
          const h = isPath(it.ref) ? hadith(it.ref, w) : null;
          if (it.arabic) checkArabic(it.arabic, h, w);
          return {
            labelHtml: tl(textOf(it.label) || h?.labels.short || ''),
            wordingHtml: partHtml({ quote: it.quote, text: it.text, mark: it.mark, ref: it.ref }, w),
            arabic: it.arabic || null, ref: refFor(it.ref, w), key: i,
          };
        }) };
      }
      case 'redline': {
        const side = (s, w) => {
          if (!s) return { ref: null, html: '' };
          const r = refFor(s.ref, w, textOf(s.label) || undefined);
          const parts = [];
          if (s.arabic) parts.push(partHtml({ arabic: s.arabic, ref: s.from || s.ref }, w));
          if (s.quote) parts.push(partHtml({ quote: s.quote, mark: s.mark, ref: s.from || s.ref }, w));
          else if (s.text) parts.push(partHtml({ text: s.text, mark: s.mark }, w));
          if (s.absent) parts.push(absentHtml());
          return { ref: r, label: textOf(s.label) || null, html: parts.join('<br>') };
        };
        if (sc.builder === 'sanaa') {
          const node = getNode(sc.from, `${where}.from`);
          const rows = node ? sanaaRows(node, item, where) : [];
          const out = rows.map(r => ({
            a: { ref: r.key ? quranLink(r.key) : null, html: `${r.standardAr ? `${ar(r.standardAr)}<br>` : ''}${withMarkPlain(r.standard, r.standard_mark, where)}` },
            b: { ref: null, label: L.sanaaLower, html: r.sanaa == null ? absentHtml() : `${r.sanaaAr ? `${ar(stripVowels(r.sanaaAr))}<br>` : ''}${withMarkPlain(r.sanaa, r.sanaa_mark, where)}` },
          }));
          out.forEach(r => { if (r.a.ref) r.a.ref = { ...r.a.ref, label: `${L.sanaaStandard} · ${r.a.ref.label.replace('Qurʾān ', '')}` }; });
          return { ...base, type: 'redline', rows: out, noteHtml: note };
        }
        return { ...base, type: 'redline', a: side(sc.a, `${where}.a`), b: side(sc.b, `${where}.b`), noteHtml: note };
      }
      case 'timeline':
        return { ...base, type: 'timeline', gapHtml: '', points: (sc.points || []).map((p, i) => ({
          year: textOf(p.year) || String(i + 1), yearAh: null,
          labelHtml: partHtml({ quote: p.quote, text: p.text, mark: p.mark, ref: p.ref }, `${where}.points[${i}]`),
          ref: refFor(p.ref, `${where}.points[${i}]`),
        })) };
      case 'witnesses':
        return { ...base, type: 'witnesses', items: (sc.items || []).map((w, i) => {
          const at = `${where}.items[${i}]`;
          const h = isPath(w.ref) ? hadith(w.ref, at) : null;
          if (w.arabic) checkArabic(w.arabic, h, at);
          return {
            scholar: textOf(w.who), deathAh: null, workHtml: w.work ? partHtml(w.work, at) : '',
            arabic: w.arabic || null,
            englishHtml: partHtml({ quote: w.quote, text: w.text, mark: w.mark, ref: w.ref }, at),
            ref: refFor(w.ref, at),
          };
        }) };
      case 'confrontation': {
        if (sc.builder === 'qiraat') {
          const node = getNode(sc.from, `${where}.from`);
          const rows = node ? qiraatRows(node, item, where).flatMap(g => g.rows) : [];
          const pick = (sc.verses || []).map(v => {
            const r = rows.find(x => x.key === verseKey(v));
            if (!r) err(`${where}: verse ${v} is not in the qirāʾāt data`);
            return r;
          }).filter(Boolean);
          const sideItems = side => pick.map(r => ({
            html: `${linkHtml(quranLink(r.key), r.key)} ${translitHtml(r[side])}`,
            ref: null,
          }));
          return {
            ...base,
            type: 'confrontation',
            left: { titleHtml: tl(textOf(sc.labels?.hafs) || L.hafs), items: sideItems('hafs') },
            right: { titleHtml: tl(textOf(sc.labels?.warsh) || L.warsh), items: sideItems('warsh') },
            noteHtml: note,
          };
        }
        // An Arabic-only line right after its English shares that line's source link.
        const sideOf = (s, w) => ({
          titleHtml: partHtml(s?.title, `${w}.title`),
          items: (s?.items || []).map((it, i, arr) => {
            const shared = it.arabic && !it.quote && !it.text && i > 0 && arr[i - 1].ref === it.ref;
            return { html: partHtml({ ...it, ref: it.ref }, `${w}.items[${i}]`), ref: shared ? null : refFor(it.ref, `${w}.items[${i}]`) };
          }),
        });
        return { ...base, type: 'confrontation', left: sideOf(sc.left, `${where}.left`), right: sideOf(sc.right, `${where}.right`), noteHtml: note };
      }
      case 'facts':
        return { ...base, type: 'facts', items: (sc.items || []).map((it, i) => ({
          html: partHtml(it, `${where}.items[${i}]`), anchor: anchorFor(it.ref, it.evidence) || id, ref: refFor(it.ref, `${where}.items[${i}]`),
        })) };
      default:
        err(`${where}: unknown showcase type "${sc.type}"`);
        return null;
    }
  };

  const items = reading.map(({ id, section }, idx) => {
    const item = C.ITEMS[id];
    const where = `ITEMS["${id}"]`;
    if (!Array.isArray(item.source) || item.source.length === 0) err(`${where}: needs at least one source path`);
    (item.source || []).forEach((p, i) => claim(p, `${where}.source[${i}]`));
    for (const k of ['title', 'hook', 'takeaway']) if (!textOf(item[k])) err(`${where}: missing ${k}`);
    const evidence = buildEvidence(id, item);
    const tables = (item.tables || []).flatMap((t, ti) => buildTable(t, item, id, `${where}.tables[${ti}]`));
    const showcase = buildShowcase(id, item, evidence);
    const next = reading[idx + 1];
    return {
      id,
      number: idx + 1,
      total,
      isStart: id === C.START_HERE,
      section: section ? { id: section.id, number: section.number, question: textOf(section.question) } : null,
      title: plain(item.title),
      titleHtml: tl(fillCopy(textOf(item.title))),
      hookHtml: prose(item.hook),
      takeawayHtml: prose(item.takeaway),
      showcase,
      evidence,
      tables,
      classicalHtml: textOf(item.classical) ? prose(item.classical, { block: true }) : '',
      comparisonHtml: textOf(item.comparison) ? prose(item.comparison, { block: true }) : '',
      // Optional short background block shown before the showcase (e.g. what the qirāʾāt are).
      primer: item.primer
        ? (() => {
            if (!textOf(item.primer.title) || !textOf(item.primer.text)) err(`${where}.primer: needs a title and a text`);
            return { titleHtml: tl(fillCopy(textOf(item.primer.title))), html: prose(item.primer.text, { block: true }) };
          })()
        : null,
      // Optional deep links into the rest of the app (internal site paths only; the audit checks they exist in dist/).
      appLinks: (item.appLinks || []).map((l, li) => {
        const at = `${where}.appLinks[${li}]`;
        if (!String(l.href || '').startsWith('/')) err(`${at}: href must be a site path starting with "/"`);
        if (!textOf(l.label)) err(`${at}: missing label`);
        return { href: internalHref(l.href), labelHtml: tl(fillCopy(textOf(l.label))), noteHtml: l.note ? prose(l.note) : '' };
      }),
      images: (item.images || []).map((im, ii) => {
        const at = `${where}.images[${ii}]`;
        if (!String(im.src || '').startsWith('/')) err(`${at}: src must be a site path starting with "/"`);
        if (!textOf(im.alt)) err(`${at}: missing alt text`);
        if (!textOf(im.credit)) err(`${at}: every image needs a credit`);
        if (!(im.width > 0 && im.height > 0)) err(`${at}: give the image's intrinsic width and height (avoids layout shift under anchor jumps)`);
        return { src: internalHref(im.src), alt: im.alt, width: im.width, height: im.height, captionHtml: prose(item.extra?.imageCaptions?.[ii] ?? im.caption), creditHtml: prose(im.credit) };
      }),
      next: next ? { id: next.id, title: plain(C.ITEMS[next.id].title) } : null,
      legacy: [],
    };
  });

  // ---- sections, intro, closing -----------------------------------------------------------------
  const startItem = items.find(i => i.isStart) || null;
  const sections = (C.SECTIONS || []).map((s, si) => {
    (s.source || []).forEach((p, i) => claim(p, `SECTIONS["${s.id}"].source[${i}]`));
    let dekHtml = '';
    if (s.dek && typeof s.dek === 'object' && (s.dek.quote || s.dek.arabic)) {
      dekHtml = partHtml(s.dek, `SECTIONS["${s.id}"].dek`);
      if (isPath(s.dek.ref)) {
        claim(s.dek.ref, `SECTIONS["${s.id}"].dek.ref`);
        const r = refFor(s.dek.ref, `SECTIONS["${s.id}"].dek`);
        if (r) dekHtml += ` <span class="qp-dek__ref">${linkHtml(r, r.label)}</span>`;
      }
    } else if (s.dek) {
      dekHtml = prose(s.dek);
    }
    return {
      id: s.id,
      number: si + 1,
      questionHtml: tl(textOf(s.question)),
      question: plain(s.question),
      dekHtml,
      backToStart: s.backLinkToStart && startItem ? { id: startItem.id, title: startItem.title } : null,
      items: items.filter(it => it.section?.id === s.id),
    };
  });
  (C.INTRO?.source || []).forEach((p, i) => claim(p, `INTRO.source[${i}]`));
  (C.CLOSING?.source || []).forEach((p, i) => claim(p, `CLOSING.source[${i}]`));

  // ---- legacy anchors -----------------------------------------------------------------------------
  const targets = new Set(['intro', C.CLOSING?.id || 'closing', ...items.map(i => i.id), ...sections.map(s => s.id)]);
  const legacy = {};
  for (const [anchor, target] of Object.entries(C.LEGACY_ANCHORS || {})) {
    if (!targets.has(target)) { err(`LEGACY_ANCHORS["${anchor}"]: target "${target}" is not an item, section, 'intro' or 'closing'`); continue; }
    if (targets.has(anchor)) err(`LEGACY_ANCHORS["${anchor}"] collides with a live id`);
    (legacy[target] ||= []).push(anchor);
  }
  items.forEach(it => { it.legacy = legacy[it.id] || []; });
  sections.forEach(s => { s.legacy = legacy[s.id] || []; });

  // ---- INTENTIONALLY_MERGED entries must be real -----------------------------------------------
  for (const [p, m] of Object.entries(C.INTENTIONALLY_MERGED || {})) {
    if (resolvePath(dataset, p) === undefined) err(`INTENTIONALLY_MERGED["${p}"]: path matches no dataset node`);
    if (m?.into && resolvePath(dataset, m.into) === undefined) err(`INTENTIONALLY_MERGED["${p}"].into: ${m.into} matches no dataset node`);
    if (!['drop', 'parts'].includes(m?.mode)) err(`INTENTIONALLY_MERGED["${p}"]: mode must be 'drop' or 'parts'`);
    if (m?.mode === 'drop' && m.into && !claimed.has(m.into)) err(`INTENTIONALLY_MERGED["${p}"]: the kept copy ${m.into} is not rendered anywhere`);
  }

  // ---- coverage: nothing in the dataset may be dropped silently ----------------------------------
  const merged = new Set(Object.keys(C.INTENTIONALLY_MERGED || {}));
  const missing = coverageUniverse(dataset).filter(p => !claimed.has(p) && !merged.has(p));
  for (const p of missing) {
    const n = resolvePath(dataset, p);
    err(`dataset node ${p} ("${String(n?.title || n?.reference || '').slice(0, 60)}") is not reachable from any item, section, INTRO or CLOSING`);
  }

  // ---- closing ---------------------------------------------------------------------------------
  const closingNode = (C.CLOSING?.source || []).map(p => resolvePath(dataset, p)).find(n => Array.isArray(n?.further_reading));
  const perspective = (closingNode?.further_reading || []).map(l => {
    const link = linkFor(l.url, { nofollow: true });
    let host = '';
    try { host = new URL(l.url).hostname.replace(/^www\./, ''); } catch { /* keep empty */ }
    return { label: l.title, href: link.href, attrs: link.attrs, host, type: /youtube\.com|youtu\.be/.test(l.url) ? 'video' : 'article' };
  });

  // ---- intro, summary & closing copy: rendered BEFORE the sources snapshot and the error check, because
  // rendering prose registers the sources it links to and may report errors -----------------------
  const intro = { h1: plain(C.INTRO?.h1), h1Html: tl(textOf(C.INTRO?.h1)), html: prose(C.INTRO?.text), legacy: legacy.intro || [] };
  const summary = C.SUMMARY
    ? {
        id: C.SUMMARY.id || 'what-they-show',
        title: plain(C.SUMMARY.title),
        titleHtml: tl(fillCopy(textOf(C.SUMMARY.title))),
        html: prose(C.SUMMARY.text, { block: true }),
      }
    : null;
  const closingId = C.CLOSING?.id || 'closing';
  const closing = {
    id: closingId,
    disclosureHtml: prose(C.CLOSING?.disclosure),
    reflectionTitle: plain(C.CLOSING?.reflectionTitle),
    reflectionTitleHtml: tl(textOf(C.CLOSING?.reflectionTitle)),
    reflectionHtml: prose(C.CLOSING?.reflectionBody, { block: true }),
    crossPointer: C.CLOSING?.crossPointer ? { html: tl(textOf(C.CLOSING.crossPointer.text)), href: internalHref(C.CLOSING.crossPointer.href) } : null,
    perspective,
    perspectiveNote: textOf(L.othersNote),
    legacy: legacy[closingId] || [],
  };

  // ---- sources & counts (every renderer has run, so the source list is complete) ---------------
  const all = [...sources.values()];
  const cmp = (a, b) => {
    const x = a.sortKey || [], y = b.sortKey || [];
    for (let i = 0; i < Math.max(x.length, y.length); i++) { if (x[i] < y[i]) return -1; if (x[i] > y[i]) return 1; }
    return 0;
  };
  const sourceGroups = (C.SOURCE_GROUPS || []).map(g => ({ ...g, items: all.filter(s => (g.kind === 'other' ? !['sunnah', 'quran', 'classical'].includes(s.kind) : s.kind === g.kind)).sort(cmp) })).filter(g => g.items.length);
  counts.sunnahRefs = all.filter(s => s.kind === 'sunnah').length;
  counts.quranRefs = all.filter(s => s.kind === 'quran').length;

  // SEO may use the source counts; plain() registers nothing, so it can follow the snapshot.
  const seo = {
    title: plain(C.SEO?.title),
    description: plain(C.SEO?.description),
    keywords: C.SEO?.keywords || '',
    breadcrumb: plain(C.SEO?.breadcrumb),
  };

  if (errors.length) {
    throw new Error(`${TAG} config/dataset check failed (${errors.length}):\n  - ${errors.join('\n  - ')}`);
  }

  return {
    counts,
    warnings,
    seo,
    intro,
    startHere: startItem,
    sections,
    items,
    summary,
    index: [
      ...(startItem ? [{ id: null, number: null, questionHtml: tl(L.startHere), items: [{ id: startItem.id, number: startItem.number, title: startItem.title }] }] : []),
      ...sections.map(s => ({ id: s.id, number: s.number, questionHtml: s.questionHtml, items: s.items.map(i => ({ id: i.id, number: i.number, title: i.title })) })),
    ],
    sourceGroups,
    citations: all.filter(s => s.kind === 'sunnah').sort(cmp).map(s => ({ name: s.label, url: s.href })),
    closing,
  };
}

// ---------------------------------------------------------------------------------------------
// Shared helpers that need no builder state
// ---------------------------------------------------------------------------------------------

function urlOf(node) {
  const m = String(node?.reference ?? '').match(/\((https?:[^)\s]+)\)/);
  return m ? m[1] : '';
}

/** Evidence specs for an item: explicit `evidence`, else every hadith of every source node. */
function itemEvidenceSpecs(item, dataset, merged) {
  if (Array.isArray(item.evidence)) {
    return item.evidence.map(e => (typeof e === 'string' ? { path: e } : { ...e }));
  }
  const out = [];
  for (const p of item.source || []) {
    const node = resolvePath(dataset, p);
    (node?.hadiths || []).forEach((_, k) => {
      const hp = `${p}.hadiths[${k}]`;
      if (merged[hp]?.mode !== 'drop') out.push({ path: hp });
    });
  }
  return out;
}
