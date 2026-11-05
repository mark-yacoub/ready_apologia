/**
 * Phase 4 of the model: page-level copy, counts and the hub.
 *   buildCounts / checkCounts  computed counts; every count in a title, H1, intro, SEO, catalog or browse
 *                              string must equal them (plus tripwires for the dataset's 190 / 228 / 17)
 *   buildSeo                   per-page SEO (ASCII titles)
 *   buildPage                  a sub-page's H1, intro, index, labels and JSON-LD citations
 *   buildHub                   hub sections (every item exactly once), Start here, browse cards, footer
 */
import { fill } from './text.js';
import { tl } from '../hadithReliability/render.js';

export function buildCounts(pages) {
  const distinct = new Set();
  for (const it of pages.hadith.items) for (const r of it.reports) if (!r.chain) distinct.add(r.key);
  return {
    accounts: pages.hadith.items.length,
    passages: pages.quran.items.length,
    answers: pages.answers.items.length,
    hadithTexts: distinct.size,
    tafsirExcerpts: pages.quran.items.reduce((n, it) => n + it.commentators.length, 0),
  };
}

export function createCountCheck(k, counts) {
  const COUNT_WORDS = [
    [/\b(\d+)\s+(?:accounts?|hadith accounts)\b/gi, counts.accounts, 'accounts'],
    [/\b(\d+)\s+(?:Qur(?:ʾ|')?[āa]n passages|Quran passages|passages|Quran verses|Qurʾān verses)\b/gi, counts.passages, 'passages'],
    [/\b(\d+)\s+More Verses\b/gi, counts.passages - 1, 'more verses'],
    [/\b(\d+)\s+(?:common answers|answers|Common Answers|Answers)\b/gi, counts.answers, 'answers'],
  ];
  return function checkCounts(s0, where) {
    if (!s0) return;
    const s = k.fillTok(s0);
    if (/\b190\b/.test(s)) k.fail(`${where}: raw "190" (count distinct texts, never dataset entries)`);
    if (/\b228\b|\b17 (?:foundational|Quranic)/.test(s)) k.fail(`${where}: stale count`);
    for (const [re, n, what] of COUNT_WORDS) for (const m of String(s).matchAll(re)) if (Number(m[1]) !== n) k.fail(`${where}: says ${m[1]} ${what}; the article has ${n}`);
  };
}

export function buildSeo(k, q, checkCounts) {
  const seo = {};
  for (const page of ['hub', 'hadith', 'quran', 'answers']) {
    const pc = k.C.COPY.pages[page] || {};
    const s = pc.seo || {};
    if (!s.title || !s.description) k.fail(`pages.${page}.seo needs a title and a description`);
    seo[page] = { title: q.plainCopy(s.title, `pages.${page}.seo.title`, { headline: true }), description: q.plainCopy(s.description, `pages.${page}.seo.description`, { headline: true }) };
    for (const f of ['title', 'description']) checkCounts(s[f], `pages.${page}.seo.${f}`);
    checkCounts(pc.h1, `pages.${page}.h1`);
    checkCounts(pc.intro, `pages.${page}.intro`);
    if (/[^\x20-\x7E]/.test(s.title || '')) k.fail(`pages.${page}.seo.title must be ASCII (diacritics belong in the H1)`);
  }
  return seo;
}

/** JSON-LD citations: the Sunnah.com pages of the items' key texts (capped; the reports are listed on the page). */
const MAX_CITATIONS = 20;

export function buildPage(k, q, key, seo, sections, list) {
  const pc = k.C.COPY.pages[key] || {};
  const pool = list.flatMap(it => [...(it.reports || []).map(r => r.text), ...(it.ayat || []).map(a => a.text)]);
  const citations = new Map();
  for (const it of list) {
    const ref = it.keyQuote?.ref || it.reports?.find(r => !r.chain)?.chips[0];
    if (ref?.external && citations.size < MAX_CITATIONS) citations.set(ref.href, { name: ref.label, url: ref.href });
  }
  return {
    key, path: k.P[key], seo: seo[key],
    h1: q.plainCopy(pc.h1, `pages.${key}.h1`, { headline: true }),
    introHtml: q.prose(pc.intro, `pages.${key}.intro`, { pool }),
    breadcrumb: pc.breadcrumb || k.L.pages[key] || key,
    onThisPageLabel: fill(k.L.onThisPage, { n: list.length }),
    sections, items: list,
    index: sections
      ? sections.map(s => ({ id: s.id, number: s.number, questionHtml: s.questionHtml, items: s.items.map(i => ({ id: i.id, number: i.number, title: i.title })) }))
      : [{ id: null, number: null, questionHtml: '', items: list.map(i => ({ id: i.id, number: i.number, title: i.title })) }],
    citations: [...citations.values()],
  };
}

export function buildHub(k, q, src, pages, counts, seo, checkCounts) {
  const { C, L, fail } = k;
  const hubCopy = C.COPY.pages.hub || {};
  const placed = new Map();
  const row = (id, where) => {
    const it = k.itemsById.get(id);
    if (!it) { fail(`${where}: unknown item "${id}"`); return null; }
    if (placed.has(id)) fail(`${where}: "${id}" is on the hub twice`);
    placed.set(id, where);
    return { id, title: it.title, href: it.href, badges: it.badges, archetype: it.showcase?.type || 'facts', page: it.page };
  };
  const sectionAll = C.COPY.sectionAll || {};
  const sections = C.HUB_SECTIONS.map((s, i) => {
    const sc = hubCopy.sections?.[s.id] || {};
    const rows = s.rows.map(id => row(id, `hub.sections.${s.id}.rows`)).filter(Boolean);
    const more = s.more.map(id => row(id, `hub.sections.${s.id}.more`)).filter(Boolean);
    const kinds = new Set([...rows, ...more].map(r => r.page));
    const tpl = (kinds.size > 1 ? sectionAll.mixed : kinds.has('quran') ? sectionAll.passages : sectionAll.accounts) || L.allInSection;
    return {
      id: s.id, number: i + 1,
      questionHtml: tl(q.plainCopy(sc.question, `hub.sections.${s.id}.question`, { headline: true })),
      dekHtml: q.prose(sc.dek, `hub.sections.${s.id}.dek`),
      rows, more,
      moreLabel: q.plainCopy(fill(tpl, { n: rows.length + more.length, m: more.length }), `hub.sections.${s.id}.more`),
    };
  });
  for (const id of k.itemsById.keys()) if (!placed.has(id)) fail(`"${id}" is not reachable from the hub (hub.sections rows/more)`);

  const start = k.itemsById.get(C.START_HERE);
  if (!start) fail(`START_HERE: unknown item "${C.START_HERE}"`);
  const startCopy = C.COPY.startHere || {};
  if (startCopy.showcase?.type !== 'witnesses' || (startCopy.showcase.items || []).length < 3) fail('hub.startHere needs a witnesses showcase with at least 3 cards (IA R1 P0-2)');

  const browseCopy = C.COPY.browse || {};
  const otherCopy = C.COPY.otherParts || {};
  const browse = ['hadith', 'quran', 'answers'].map(key => {
    const b = browseCopy[key] || {};
    const n = { hadith: counts.accounts, quran: counts.passages, answers: counts.answers }[key];
    const text = fill(k.fillTok(b.text || ''), { n });
    checkCounts(text, `hub.browse.${key}.text`);
    return {
      key, href: k.P[key],
      title: q.plainCopy(b.title, `hub.browse.${key}.title`, { headline: true }),
      text: q.plainCopy(text, `hub.browse.${key}.text`),
      descriptionHtml: q.prose(b.description, `hub.browse.${key}.description`),
      other: { title: q.plainCopy(otherCopy[key]?.title || b.title, `otherParts.${key}.title`, { headline: true }), descriptionHtml: q.prose(otherCopy[key]?.description || text, `otherParts.${key}.description`) },
    };
  });

  // Sources footer: computed counts only.
  const nonSahih = new Set();
  for (const it of pages.answers.items) for (const t of [...it.answerTexts, ...it.texts]) for (const ch of t.chips) if (/sunnah\.com\/(abudawud|nasai|ibnmajah|tirmidhi):/.test(ch.href)) nonSahih.add(ch.href);
  const footCopy = C.COPY.sourcesFooter?.items || L.sources;
  const islamweb = new Set([...k.itemsById.values()].flatMap(it => (it.classical?.sources || []).map(x => x.href)).filter(h => /^https:\/\/(?:www\.)?islamweb\.net\//.test(h)));
  const footCounts = { sunnah: counts.hadithTexts, quran: counts.passages, ibnKathir: pages.quran.items.filter(it => it.commentators.some(x => x.source === C.TAFSIR_SOURCES.ik.label)).length, other: nonSahih.size, islamweb: islamweb.size };
  for (const key of Object.keys(footCopy)) if (!(key in footCounts)) fail(`stale copy key hub.sourcesFooter.items.${key}`);
  const sourceStats = Object.entries(footCounts).filter(([key, n]) => n > 0 && footCopy[key]).map(([key, n]) => {
    const [count, ...rest] = fill(footCopy[key], { n }).split(' ');
    return { count, label: q.plainCopy(rest.join(' '), `hub.sourcesFooter.items.${key}`) };
  });

  // Start here: its hook may quote anything the start item or its cards cite.
  const startPool = start ? [...(start.ayat || []).flatMap(a => [a.text, k.tafsir.ik[a.key], k.tafsir.tb[a.key]]), ...q.poolOf(startCopy), ...q.poolOf(C.COPY.items[C.START_HERE])].filter(Boolean) : [];
  return {
    key: 'hub', path: k.P.hub, seo: seo.hub,
    h1: q.plainCopy(hubCopy.h1, 'hub.h1', { headline: true }),
    introHtml: q.prose(hubCopy.intro, 'hub.intro', { pool: [...pages.hadith.items, ...pages.quran.items].flatMap(it => [...(it.reports || []).map(r => r.text), ...(it.ayat || []).map(a => a.text)]) }),
    breadcrumb: C.COPY.breadcrumbs?.hub || L.hub,
    startHere: start ? {
      item: start,
      title: q.plainCopy(startCopy.title, 'hub.startHere.title', { headline: true }),
      hookHtml: q.prose(startCopy.hook, 'hub.startHere.hook', { pool: startPool }),
      showcase: q.showcase(startCopy.showcase, 'hub.startHere.showcase', 'start', 'start', startPool),
      // The 4-move test of the main Muslim reading (playbook voice rule 5), under the showcase.
      testLabel: q.plainCopy(L.startTest, 'labels.startTest', { headline: true }),
      testHtml: q.prose(startCopy.test, 'hub.startHere.test', { pool: startPool, paragraphs: true }),
    } : null,
    browse,
    browseLabel: q.plainCopy(C.COPY.browseLabel || L.browseBySource, 'hub.browseLabel', { headline: true }),
    sourcesLabel: q.plainCopy(C.COPY.sourcesFooter?.label || L.sourcesUsed, 'hub.sourcesFooter.label'),
    sections,
    sourceStats,
  };
}
