/**
 * Pure view model for /discover/muhammad-and-slavery (hub + 3 sub-pages).
 *
 *   buildModel(data, config, ctx) → { hub, pages, items, counts, seo, catalog, breadcrumbs, hadithSources, … }
 *
 * `data` is slavery.json (read-only), `config` is CONFIG from config.js, `ctx` carries the repo sources the
 * model verifies against (context.js): { droge, tafsir: { ik, tb }, surahNames, permalinks, arabic }.
 *
 * The model THROWS (ModelError, listing every problem) when the page would mislead a reader who checks the
 * sources (cuj_ia.md §F.4, Addendum §3, ia_r1_response.md, code_review.md):
 *   - malformed copy (validate.js), a stale override or copy key
 *   - an anchor reference found in 0 or 2+ items, an item placed 0 or 2+ times (any page, the hub)
 *   - a Muslim reference without a canonical number, a URL pointing at another number
 *   - a rendered quote that is not a verbatim substring of its source (QUOTE_FIXES-corrected report,
 *     repo Droge, repo tafsir), or a prose quotation not in the source cited beside it
 *   - a count in a title / H1 / SEO / catalog string that differs from the computed count, per-collection
 *     counts that do not add up
 *   - a banned word in our own voice, a relative link, a non-https source link
 * Every check runs before the single throw at the end; nothing is computed after it.
 *
 * Phases: sources.js (reports) → quoting.js (quotes, prose, showcases) → items.js (the three pages) →
 * hub.js (counts, SEO, hub). Pure: no I/O, no Astro, no globals. Unit tests: model.test.mjs.
 */
import { CATEGORY_ALIAS } from './ids.js';
import { linkAttrs, createRenderer } from '../hadithReliability/render.js';
import { validateCopy } from './validate.js';
import { buildSources } from './sources.js';
import { createQuoting } from './quoting.js';
import { buildHadithPage, buildQuranPage, buildAnswersPage } from './items.js';
import { buildCounts, createCountCheck, buildSeo, buildPage, buildHub } from './hub.js';
import { fill } from './text.js';

export { containsQuote, cmpNorm, wordNorm, displayText, parseRef, th } from './text.js';
export { ourVoice } from './tone.js';

export class ModelError extends Error {
  constructor(problems) {
    super(`[muhammadSlavery] ${problems.length} problem(s):\n  - ${problems.join('\n  - ')}`);
    this.problems = problems;
  }
}

export function buildModel(data, config, ctx = {}) {
  const problems = [];
  const warnings = [];
  const C = config;
  const BASE = C.BASE ?? '';
  const TOKENS = {
    accounts: C.HADITH_SECTIONS.reduce((n, x) => n + x.items.length, 0),
    passages: C.QURAN_SECTIONS.reduce((n, x) => n + x.items.length, 0),
    answers: C.ANSWER_ORDER.length,
  };
  const allIds = new Map();
  const k = {
    C, L: C.LABELS, BASE, P: C.PAGE_PATHS, data,
    fail: msg => problems.push(msg),
    warn: msg => warnings.push(msg),
    used: { fixes: new Set(), notes: new Set(), refMap: new Set(), extras: new Set(), links: new Set(), items: new Set(), answers: new Set() },
    // Count tokens the copy may use, filled from the reading order (the model then checks every count).
    fillTok: v => (v == null ? v : String(v).replace(/\{(accounts|passages|answers)\}/g, (m, key) => TOKENS[key])),
    ext: href => ({ href, external: true, attrs: linkAttrs({ external: true }) }),
    int: href => ({ href, external: false, attrs: {} }),
    quranUrl: (surah, ayah, tab) => `${BASE}/quran/${surah}/${ayah}${tab ? `/${tab}` : ''}`,
    droge: ctx.droge || {},
    tafsir: ctx.tafsir || { ik: {}, tb: {} },
    permalinks: ctx.permalinks || new Set(),
    arabicMap: ctx.arabic || {},
    surahNames: ctx.surahNames || {},
    renderer: createRenderer(),
    itemsById: new Map(),
    allIds,
    placeOnce(id, page, where) {
      if (allIds.has(id)) problems.push(`${where}: "${id}" is placed twice (also on ${allIds.get(id)})`);
      allIds.set(id, page);
    },
  };
  const { L, fail } = k;

  for (const p of validateCopy(C.COPY.raw || {})) fail(p);
  for (const key of Object.keys(C.COPY.raw?.answers?.labels || {})) if (!C.LABEL_KEYS?.includes(key)) fail(`copy/answers.json.labels.${key}: unknown label key`);

  const src = buildSources(data, k);
  const q = createQuoting(k, src);
  const hadith = buildHadithPage(k, q, src);
  const quran = buildQuranPage(k, q, src);
  const answers = buildAnswersPage(k, q, src);

  // Numbering, prev/next and context lines.
  const number = (list, label) => list.forEach((it, i) => {
    it.number = i + 1;
    it.total = list.length;
    it.contextLine = fill(label, { n: i + 1, total: list.length, section: it.section?.question || '' }).replace(/\s*·\s*$/, '');
    it.prev = list[i - 1] || null;
    it.next = list[i + 1] || null;
  });
  number(hadith.items, L.accountOf);
  number(quran.items, L.passageOf);
  number(answers.items, L.answerOf);
  // The repo's English al-Ṭabarī is AI-assisted: say so once, at the first al-Ṭabarī quotation on the page.
  const firstTb = quran.items.find(it => it.showcase?.quotesTabari || it.commentators.some(c => c.source === C.TAFSIR_SOURCES.tb.label));
  if (firstTb) firstTb.tabariNote = { inShowcase: !!firstTb.showcase?.quotesTabari, text: L.tabariTranslationNote };

  // Cross-links: the copy's (by item id) replace the CROSS_LINKS defaults.
  const crossLabel = x => fill(x.kind === 'verse' ? L.crossVerse : x.kind === 'answer' ? L.crossAnswer : L.crossAccount, { ref: `Qurʾān ${x.verseKey || ''}`, title: x.title, question: x.title });
  for (const [from, tos] of Object.entries(C.CROSS_LINKS)) {
    const it = k.itemsById.get(from);
    if (!it) { fail(`CROSS_LINKS: unknown item "${from}"`); continue; }
    it.crossLinks = tos.map(t => { const x = k.itemsById.get(t); if (!x) fail(`CROSS_LINKS.${from}: unknown target "${t}"`); return x && { title: crossLabel(x), href: x.href, page: x.page }; }).filter(Boolean);
  }
  for (const it of k.itemsById.values()) {
    if (Array.isArray(it.copyCrossLinks)) {
      it.crossLinks = it.copyCrossLinks.map((x, i) => {
        const target = k.itemsById.get(x.to);
        if (!target) { fail(`copy ${it.id}.crossLinks[${i}]: "${x.to}" is not an item id`); return null; }
        return { title: q.plainCopy(String(x.label || target.title).replace(/\s*[→›]\s*$/, ''), `copy ${it.id}.crossLinks[${i}].label`), href: target.href, page: target.page };
      }).filter(Boolean);
    }
    it.crossLinks ||= [];
  }

  // Legacy anchors: #cat-N on the section that carries that category (1:1).
  for (const [cid, sid] of Object.entries(CATEGORY_ALIAS)) {
    const s = hadith.sections.find(x => x.id === sid);
    if (!s) fail(`CATEGORY_ALIAS: unknown section "${sid}"`);
    else if (!s.legacy.includes(`cat-${cid}`)) fail(`section "${sid}" must carry legacy anchor cat-${cid}`);
  }

  // Stale copy keys and hand-maintained source entries.
  src.checkUnused();
  for (const key of Object.keys(C.COPY.items)) if (!k.used.items.has(key)) fail(`stale copy key items.${key}`);
  for (const key of Object.keys(C.COPY.answers)) if (!k.used.answers.has(key)) fail(`stale copy key answers.${key}`);
  for (const key of Object.keys(C.COPY.pages.hub?.sections || {})) if (!C.HUB_SECTIONS.some(s => s.id === key)) fail(`stale copy key hub.sections.${key}`);

  // Counts, SEO, pages, hub, catalog: all computed (and checked) before the throw.
  const pagesRaw = { hadith, quran, answers };
  const counts = buildCounts(pagesRaw);
  const checkCounts = createCountCheck(k, counts);
  const seo = buildSeo(k, q, checkCounts);
  const pages = {
    hadith: buildPage(k, q, 'hadith', seo, hadith.sections, hadith.items),
    quran: buildPage(k, q, 'quran', seo, quran.sections, quran.items),
    answers: buildPage(k, q, 'answers', seo, null, answers.items),
  };
  const hub = buildHub(k, q, src, pagesRaw, counts, seo, checkCounts);
  let catalog = null;
  if (C.COPY.catalog) {
    for (const f of ['title', 'description']) checkCounts(C.COPY.catalog[f], `catalog.${f}`);
    catalog = { title: q.plainCopy(C.COPY.catalog.title, 'catalog.title', { headline: true }), description: q.plainCopy(C.COPY.catalog.description, 'catalog.description', { headline: true }) };
  }
  // Every hadith source the pages can show (dataset reports with QUOTE_FIXES + EXTRA_TEXTS) for the mirror check.
  const hadithSources = new Map([...src.sources].map(([key, s]) => [key, { text: s.text, arabic: s.arabic || k.arabicMap[key] || null }]));

  if (problems.length) throw new ModelError(problems);
  return {
    hub, pages, items: k.itemsById, counts, seo, catalog,
    breadcrumbs: C.COPY.breadcrumbs || null,
    keyQuoteRefs: [...new Set(hadith.items.map(it => it.keyQuote?.src?.key).filter(Boolean))],
    hadithSources,
    warnings,
  };
}

/**
 * Renders a faq's answer_markdown with the article's link policy (for proposals and tests): relative
 * `quran/S#A` links → the site's Ṭabarī page, in-book Muslim URLs → canonical, FAQ_LINK_FIXES applied,
 * and `[[A](u); [B](u)]` groups rendered without the stray bracket.
 */
export function renderAnswerMarkdown(md, faqId, config) {
  const C = config;
  const BASE = C.BASE ?? '';
  const renderer = createRenderer();
  // A bracketed group that starts with a link: `[[A](u) / [B](u), *C*]` → `([A](u) / [B](u), *C*)`.
  let s = String(md ?? '').replace(/\[(\[[^\[\]]+\]\([^)\s]+\)[^\[\]]*(?:\[[^\[\]]+\]\([^)\s]+\)[^\[\]]*)*)\]/g, '($1)');
  s = s.replace(/\[([^\[\]]+)\]\(([^)\s]+)\)/g, (all, label, url) => {
    const fx = C.FAQ_LINK_FIXES[`${faqId}|${url}`] ?? C.FAQ_LINK_FIXES[url];
    if (fx !== undefined) {
      if (fx.ref === null) return label;
      const [col, num] = fx.ref.split(':');
      return `[${C.COLLECTIONS[col]?.label || col} ${num}](https://sunnah.com/${col}:${num})`;
    }
    let m;
    if ((m = url.match(/^https:\/\/sunnah\.com\/muslim\/(\d+)\/(\d+)$/))) {
      const num = C.REF_MAP[`Sahih Muslim ${m[1]}:${m[2]}`];
      return num ? `[Muslim ${num}](https://sunnah.com/muslim:${num})` : all;
    }
    if ((m = url.match(/^quran\/(\d+)#(\d+)(?:-(\d+))?$/))) return `[${label}](QURAN:${m[1]}:${m[3] || m[2]})`;
    return all;
  });
  let html = renderer.block(s);
  html = html.replace(/\[([^\[\]]+)\]\(QURAN:(\d+):(\d+)\)/g, (all, label, su, ay) => `<a class="hrv-link hrv-link--quran" href="${BASE}/quran/${su}/${ay}/tafsir/tabari">${label}</a>`);
  return html;
}
